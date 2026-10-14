const Appointment = require("../model/appointment.model");
const Patient = require("../model/patient.model");
class appointmentController {
  
  async createAppointment(req, res) {
    try {
      const patientId = req.user.role === "patient" ? req.user.id : req.body.patientId;
      const {
        doctorId,
        clinicId,
        departmentId,
        appointmentDate,
        appointmentType,
        startTime,
        endTime,
        consultationFee,
      } = req.body;
      if (
        !patientId ||
        !doctorId ||
        !appointmentDate ||
        !appointmentType ||
        !startTime ||
        !endTime ||
        !consultationFee ||
        !clinicId ||
        !departmentId
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Patient ID, Doctor ID, Appointment Date and Time are required",
        });
      }

      // check double booking for the same patient with the same doctor at the same time
      const existingAppointment = await Appointment.findOne({
        patientId,
        doctorId,
        isDeleted: false,
        appointmentDate,
        status: { $in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
        startTime: { $lt: endTime },      // overlap: existing start < new end
        endTime: { $gt: startTime },
      });
      if (existingAppointment) {
        return res.status(400).json({
          status: false,
          message:
            "You already have an appointment with this doctor at this time",
        });
      }

      const appointment = new Appointment({
        patientId,
        doctorId,
        clinicId,
        departmentId,
        appointmentDate,
        appointmentType,
        startTime,
        endTime,
        consultationFee,
      });
      await appointment.save();
      res.status(201).json({
        status: true,
        message: "Appointment created successfully",
        appointment,
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getAppointments(req, res) {
    try {
      const filter = { isDeleted: false };
    // optional status query: /get/appointments?status=CONFIRMED
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization")
      .populate("clinicId", "name")
      .sort({ appointmentDate: -1, startTime: 1 });

      res.status(200).json({
        status: true,
        size: appointments.length,
        message: "Appointments fetched successfully",
        appointments,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: " Server error in fetching appointments",
        error: error.message,
      });
    }
  }

  async getAppointmentByDoctor(req, res) {
    try {
      // get appointments by doctorId using aggregation
      let list = await Appointment.aggregate([
        {
          $lookup: {
            from: "manage-med-doctor",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $unwind: "$doctor",
        },
        {
          $group: {
            _id: "$doctorId", // ⬅️ is par group ho raha hai
            doctorName: { $first: "$doctor.name" },
            specialization: { $first: "$doctor.specialization" },
            totalAppointments: { $sum: 1 }, // ⬅️ har document = 1 count
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
            },
            confirmed: {
              $sum: { $cond: [{ $eq: ["status", "CONFIRMED"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            doctorId: "$_id",
            doctorName: 1,
            specialization: 1,
            totalAppointments: 1,
            completed: 1,
            cancelled: 1,
            confirmed: 1,
            pending: 1,
          },
        },
        { $sort: { totalAppointments: -1 } },
      ]);

      return res.status(200).json({
        status: true,
        size: list.length,
        message: "Appointments fetched by doctor successfully",
        data: list,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Server error in fetching appointments by doctor",
        error: error.message,
      });
    }
  }

  async getAppointmentById(req, res) {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId) {
        return res.status(400).json({
          status: false,
          message: "Appointment ID is required",
        });
      }
      const appointments = await Appointment.findOne({ _id: appointmentId, isDeleted: false });
      if (appointments.length === 0) {
        return res.status(404).json({
          status: false,
          message: "No appointments found for this doctor",
        });
      }
      return res.status(200).json({
        status: true,
        size: appointments.length,
        message: "Appointments fetched by doctor ID successfully",
        data: appointments,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Server error in fetching appointments by doctor ID",
        error: error.message,
      });
    }
  }

  async getAppointmentListOfDoctor(req, res) {
    try {
      const doctorId = req.user.id; // auth middleware se
      if (!doctorId) {
        return res.status(400).json({
          status: false,
          message: "Doctor ID is missing in request. Please login again.",
        });
      }
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

      const ACTIVE = [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "NO_SHOW",
        "RESCHEDULED",
      ];

      const [result] = await Appointment.aggregate([
        // STEP 1: Pehle hi is doctor ka filter — ab har branch me repeat nahi hoga
        { $match: { doctorId } },

        // STEP 2: $facet — ek pipeline, 6 branches (har branch independent chalti hai)
        {
          $facet: {
            // 1. TOTAL appointments
            total: [{ $count: "count" }],

            // 2. TODAY's — sirf aaj ki, cancelled/rejected nahi
            today: [
              {
                $match: {
                  appointmentDate: { $gte: startOfToday, $lt: endOfToday },
                  status: { $nin: ["CANCELLED", "REJECTED"] },
                },
              },
              { $count: "count" },
            ],

            // 3. UPCOMING — aaj ya future + active status
            upcoming: [
              {
                $match: {
                  appointmentDate: { $gte: startOfToday },
                  status: { $in: ACTIVE },
                },
              },
              { $count: "count" },
            ],

            // 4. PAST — aaj se pehle ke saare
            past: [
              { $match: { appointmentDate: { $lt: startOfToday } } },
              { $count: "count" },
            ],

            // 5. STATUS-WISE breakdown
            statusBreakdown: [
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ],

            // 6. TODAY's LIST — full detail, time-sorted
            todayAppointments: [
              {
                $match: {
                  appointmentDate: { $gte: startOfToday, $lt: endOfToday },
                  status: { $nin: ["CANCELLED", "REJECTED"] },
                },
              },
              { $sort: { startTime: 1 } },
              // patient ka basic data jodna (populate aggregation me nahi hota!)
              {
                $lookup: {
                  from: "manage-med-patients", // ⚠️ exact collection name verify karo
                  localField: "patientId",
                  foreignField: "_id",
                  as: "patient",
                },
              },
              {
                $unwind: { path: "$patient", preserveNullAndEmptyArrays: true },
              },
              {
                $project: {
                  startTime: 1,
                  endTime: 1,
                  status: 1,
                  reason: 1,
                  "patient.name": 1,
                  "patient.gender": 1,
                  "patient.dateOfBirth": 1,
                  "patient.bloodGroup": 1,
                },
              },
            ],
          },
        },
      ]);

      // ⚠️ $count ka output [{ count: 42 }] hota hai — empty toh [] hai
      const getCount = (arr) => arr[0]?.count ?? 0;

      // statusBreakdown array → object
      const statusBreakdown = {};
      for (const s of result.statusBreakdown) statusBreakdown[s._id] = s.count;

      res.status(200).json({
        success: true,
        data: {
          summary: {
            total: getCount(result.total),
            today: getCount(result.today),
            upcoming: getCount(result.upcoming),
            past: getCount(result.past),
            statusBreakdown,
          },
          todayAppointments: result.todayAppointments,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Server error in fetching appointment list of doctor",
        error: error.message,
      });
    }
  }

  async updateAppointment(req, res) {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId) {
        return res.status(400).json({
          status: false,
          message: "Appointment ID is required",
        });
      }
  
      const { appointmentDate, startTime, endTime, appointmentType } = req.body;
  
      const updateData = {};
      if (appointmentDate) updateData.appointmentDate = appointmentDate;
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (appointmentType) updateData.appointmentType = appointmentType;
  
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          status: false,
          message: "No valid fields provided for update",
        });
      }
  
      // ---- PEHLE FIND (deleted/active check update se PEHLE) ----
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.isDeleted) {
        return res.status(404).json({
          status: false,
          message: "Appointment not found",
        });
      }
      if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
        return res.status(400).json({
          status: false,
          message: `Cannot update an appointment with status ${appointment.status}`,
        });
      }
  
      // ---- MERGED final values par checks ----
      const finalStart = startTime || appointment.startTime;
      const finalEnd = endTime || appointment.endTime;
      const finalDate = appointmentDate || appointment.appointmentDate;
  
      // String compare — "09:00" format me sahi kaam karta hai ✅
      if (finalStart >= finalEnd) {
        return res.status(400).json({
          status: false,
          message: "End time must be after start time",
        });
      }
  
      // ---- CONFLICT CHECK — sirf jab date/time kuch bhi change ho ----
      if (startTime || endTime || appointmentDate) {
        const existing = await Appointment.findOne({
          _id: { $ne: appointmentId },                              // ✅ khud ko chhod do
          doctorId: appointment.doctorId,                           // ✅ sirf yeh doctor
          appointmentDate: finalDate,
          isDeleted: false,
          status: { $in: ["PENDING", "CONFIRMED", "RESCHEDULED"] }, // ✅ sirf active bookings
          // overlap: existing.startTime < finalEnd && existing.endTime > finalStart
          startTime: { $lt: finalEnd },
          endTime: { $gt: finalStart },
        });
  
        if (existing) {
          return res.status(409).json({
            status: false,
            message: "Time slot is already booked",
          });
        }
      }
      // ---- AB UPDATE ----
      const updated = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, runValidators: true }   // ✅ enum validation on
      );
  
      res.status(200).json({
        status: true,
        message: "Appointment updated successfully",
        appointment: updated,
      });
    } catch (error) {
      console.error("Update appointment error:", error.message);
      res.status(500).json({
        status: false,
        message: "Server error in updating appointment",
        // error.message client ko NAHI bhejo — internal leak
      });
    }
  }

  async updateAppointmentStatus(req, res) {
    try {
        const appointmentId = req.params.id;
        if(!appointmentId) {
            return res.status(400).json({
                status: false,
                message: "Appointment ID is required",
            });
        }
        const { appointmentStatus, paymentStatus } = req.body;
        if(!appointmentStatus && !paymentStatus) {
            return res.status(400).json({
                status: false,
                message: "Either appointmentStatus or paymentStatus is required",
            });
        }
        const appointment = await Appointment.findOne({ _id: appointmentId, isDeleted: false });
        if(!appointment) {
            return res.status(404).json({
                status: false,
                message: "Appointment not found",
            });
        }

        const VALID_STATUS = ["PENDING", "CONFIRMED", "COMPLETED",
            "CANCELLED", "REJECTED", "NO_SHOW", "RESCHEDULED"];
          const VALID_PAYMENT = ["PENDING", "PAID", "FAILED", "REFUNDED"];
      
          if (appointmentStatus && !VALID_STATUS.includes(appointmentStatus)) {
            return res.status(400).json({
              status: false,
              message: `Invalid appointmentStatus. Allowed: ${VALID_STATUS.join(", ")}`,
            });
          }
          if (paymentStatus && !VALID_PAYMENT.includes(paymentStatus)) {
            return res.status(400).json({
              status: false,
              message: `Invalid paymentStatus. Allowed: ${VALID_PAYMENT.join(", ")}`,
            });
          }
          if (req.user.role === "patient" && String(appointment.patientId) !== String(req.user.id)) {
            return res.status(403).json({ status: false, message: "Not allowed" });
          }
          // aur patient sirf CANCELLED hi kar sake:
          if (req.user.role === "patient" && appointmentStatus && appointmentStatus !== "CANCELLED") {
            return res.status(403).json({ status: false, message: "Patients can only cancel appointments" });
          }
        if(appointmentStatus) appointment.status = appointmentStatus;
        if(paymentStatus) appointment.paymentStatus = paymentStatus;
        await appointment.save();
        return res.status(200).json({
            status: true,
            message: "Appointment status updated successfully",
            appointment
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error in updating appointment status",
        })
    }
  }
  async deleteAppointment(req, res) {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId) {
        return res.status(400).json({
          status: false,
          message: "Appointment ID is required",
        });
      }
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.isDeleted) {
        return res.status(404).json({
          status: false,
          message: "Appointment not found",
        });
      }
      appointment.isDeleted = true;
      await appointment.save();
      res.status(200).json({
        status: true,
        message: "Appointment deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Server error in deleting appointment",
        error: error.message,
      });
    }
  }

  // Doctor's own appointments
  async getMyAllAppointments(req, res) {
    try {
      const { status, date } = req.query;
      const filter = { doctorId: req.user.id, isDeleted: false };

      if (status) filter.status = status;
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        filter.appointmentDate = {
          $gte: start,
          $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
        };
      }

      const appointments = await Appointment.find(filter)
        .populate("patientId", "name phone gender bloodGroup")
        .select("appointmentDate startTime endTime appointmentType status paymentStatus consultationFee reason")
        .sort({ appointmentDate: -1, startTime: 1 });

      return res.status(200).json({
        status: true,
        message: "Appointments fetched successfully",
        appointments,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in fetching appointments",
        error: error.message,
      });
    }
  }

  // Receptionist's own appointments
  async getReceptionistDashboard(req, res) {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

      const todayFilter = {
        isDeleted: false,
        appointmentDate: { $gte: startOfToday, $lt: endOfToday },
      };

      // counts + list + total patients — sab parallel
      const [todayList, pending, confirmed, completed, totalPatients] = await Promise.all([
        Appointment.find(todayFilter)
          .populate("patientId", "name phone")
          .populate("doctorId", "name specialization")
          .select("startTime endTime status paymentStatus consultationFee appointmentType")
          .sort({ startTime: 1 }),
        Appointment.countDocuments({ ...todayFilter, status: "PENDING" }),
        Appointment.countDocuments({ ...todayFilter, status: "CONFIRMED" }),
        Appointment.countDocuments({ ...todayFilter, status: "COMPLETED" }),
        Patient.countDocuments({}),   // ⚠️ isDeleted field hai toh { isDeleted: false }
      ]);

      return res.status(200).json({
        status: true,
        message: "Receptionist dashboard fetched successfully",
        data: {
          summary: {
            today: todayList.length,
            pending,
            confirmed,
            completed,
            totalPatients,
          },
          todayAppointments: todayList,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in receptionist dashboard",
        error: error.message,
      });
    }
  }

  async getPatientDashboard(req, res) {
    try {
      const patientId = req.user.id;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [total, upcoming, completed, upcomingList] = await Promise.all([
        Appointment.countDocuments({ patientId, isDeleted: false }),
        Appointment.countDocuments({
          patientId, isDeleted: false,
          appointmentDate: { $gte: startOfToday },
          status: { $nin: ["CANCELLED", "REJECTED"] },
        }),
        Appointment.countDocuments({ patientId, isDeleted: false, status: "COMPLETED" }),
        // upcoming list — next 5, time-sorted
        Appointment.find({
          patientId, isDeleted: false,
          appointmentDate: { $gte: startOfToday },
          status: { $nin: ["CANCELLED", "REJECTED", "COMPLETED"] },
        })
          .populate("doctorId", "name specialization")
          .populate("clinicId", "name")
          .select("appointmentDate startTime endTime status appointmentType bookingReference")
          .sort({ appointmentDate: 1, startTime: 1 })
          .limit(5),
      ]);

      return res.status(200).json({
        status: true,
        message: "Patient dashboard fetched successfully",
        data: {
          summary: { total, upcoming, completed },
          upcomingAppointments: upcomingList,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in patient dashboard",
        error: error.message,
      });
    }
  }

  async getMyPatientAppointments(req, res) {
    try {
      const { status } = req.query;
      const filter = { patientId: req.user.id, isDeleted: false };
      if (status) filter.status = status;

      const appointments = await Appointment.find(filter)
        .populate("doctorId", "name specialization")
        .populate("clinicId", "name address")
        .select("appointmentDate startTime endTime appointmentType status paymentStatus consultationFee reason bookingReference")
        .sort({ appointmentDate: -1, startTime: 1 });

      return res.status(200).json({
        status: true,
        message: "Appointments fetched successfully",
        appointments,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in fetching appointments",
        error: error.message,
      });
    }
  }
}
module.exports = new appointmentController();
