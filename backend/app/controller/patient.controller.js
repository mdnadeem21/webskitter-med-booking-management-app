const Patient = require("../model/patient.model");
const Appointment = require("../model/appointment.model");
const Otp = require("../model/otp.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtp = require("../util/send.otp");
const { uploadFileOnCloudinary } = require("../util/upload.file.on.cloudinary");

class patientController {
    async registerPatient(req, res) {
        try {
            const {
                name,
                email,
                phone,
                password,
                gender,
                dateOfBirth,
                address,
                bloodGroup,
                emergencyContact,
                allergies,
                previousDiseases,
                currentMedicines,
                previousSurgeries,
            } = req.body;

            if (!name || !password || !email || !phone || !gender || !dateOfBirth || !address || !bloodGroup || !emergencyContact) {
                return res.status(400).json({
                    status: false,
                    message: "Missing required fields",
                });
            }

            const existingPatient = await Patient.findOne({ email });
            if (existingPatient) {
                return res.status(400).json({
                    status: false,
                    message: "Patient with this email already exists",
                });
            }

            const newPatient = new Patient({
                name,
                email,
                phone,
                gender,
                dateOfBirth,
                address,
                bloodGroup,
                emergencyContact,
                allergies: allergies || [],
                previousDiseases: previousDiseases || [],
                currentMedicines: currentMedicines || [],
                previousSurgeries: previousSurgeries || [],

            });

            //   const defaultPassword = Math.random().toString(36).slice(-8); // Generate a random 8-character password
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password, salt);
            newPatient.password = hashedPassword;

            if (req.file && req.file.path) {
                const localPath = req.file.path;
                const cloudinaryResponse = await uploadFileOnCloudinary(localPath);
                newPatient.patientImage = cloudinaryResponse.url;
            }
            await newPatient.save();

            // Send OTP for email verification
            await sendOtp(req, newPatient, "EMAIL_VERIFY");

            return res.status(201).json({
                status: true,
                message: "Patient registered successfully. Please verify your email.",
                data: {
                    patientId: newPatient._id,
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
            });
        }
    }

    async loginPatient(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: "Email and password are required",
                });
            }

            const patient = await Patient.findOne({ email });
            if (!patient) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid email or password",
                });
            }

            const isMatch = await bcryptjs.compare(password, patient.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid password",
                });
            }

            if (!patient.isVerified && patient.role == 'patient') {
                return res.status(403).json({
                    status: false,
                    message: "Email not verified or you are not patient.",
                });
            }

            // generate access token using jwt
            const accessToken = jwt.sign(
                {
                    id: patient._id,
                    name: patient.name,
                    email: patient.email,
                    role: patient.role,
                },
                process.env.JWT_SECRET || "jwt-secret-key",
                { expiresIn: "15m" }
            );

            const refreshToken = jwt.sign(
                {
                    id: patient._id,
                    name: patient.name,
                    email: patient.email,
                    role: patient.role,
                },
                process.env.JWT_SECRET || "jwt_secret_key",
                { expiresIn: "7d" }
            );

            // hashed refresh token for security
            const hashedRefreshToken = await bcryptjs.hash(refreshToken, 10);
            // Store refresh token in the database
            patient.refreshToken = hashedRefreshToken;
            await patient.save();

            const token = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };

            // set cookie for refresh token
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Set to true in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({
                status: true,
                message: "Login successful",
                data: { userId: patient._id, name:patient.name, email: patient.email },
                token,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Server error in login user",
            });
        }
    }

    async getAllPatients(req, res) {
        try {
          const search = req.query.search?.trim() || "";
      
          // search regex — name/email/phone me
          const filter = {};
          if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");  // regex-injection safe
            filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
          }
      
          const patients = await Patient.find(filter)
            .select("name email phone gender bloodGroup isVerified createdAt")
            .sort({ createdAt: -1 });   // naye pehle
      
          // ⚠️ har patient ke liye alag countDocuments = N+1 problem
          // ek hi aggregation me sabka count:
          const counts = await Appointment.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$patientId", total: { $sum: 1 } } },
          ]);
          const countMap = {};
          for (const c of counts) countMap[c._id.toString()] = c.total;
      
          return res.status(200).json({
            status: true,
            message: "Patients fetched successfully",
            patients: patients.map(p => ({
              ...p.toObject(),
              totalAppointments: countMap[p._id.toString()] || 0,
            })),
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ status: false, message: "Server error in fetching patients" });
        }
    }

    async getPatientById(req, res) {
        try {
            const patientId = req.params.id;
            if (!patientId) {
                return res.status(400).json({
                    status: false,
                    message: "Patient ID is required",
                });
            }
            const patient = await Patient.findById(patientId);
            if (!patient || patient.isDeleted) {
                return res.status(404).json({
                    status: false,
                    message: "Patient not found",
                });
            }
            res.status(200).json({
                status: true,
                message: "Patient fetched successfully",
                patient,
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    }

    async updatePatient(req, res) {
        try {
            const patientId = req.params.id;
            if (!patientId) {
                return res.status(400).json({
                    status: false,
                    message: "Patient ID is required",
                });
            }
            const updatedData = { ...req.body };
            if (req.file && req.file.path) {
                const localPath = req.file.path;
                const cloudinaryResponse = await uploadFileOnCloudinary(localPath);
                updatedData.patientImage = cloudinaryResponse.url;
            }
            const updatedPatient = await Patient.findByIdAndUpdate(patientId, updatedData, { new: true });
            if (!updatedPatient) {
                return res.status(404).json({
                    status: false,
                    message: "Patient not found",
                });
            }
            res.status(200).json({
                status: true,
                message: "Patient updated successfully",
                patient: updatedPatient,
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    }

    async deletePatient(req, res) {
        try {
            const patientId = req.params.id;
            if (!patientId) {
                return res.status(400).json({
                    status: false,
                    message: "Patient ID is required",
                });
            }
            const patientToDelete = await Patient.findById(patientId);
            if (!patientToDelete || patientToDelete.isDeleted) {
                return res.status(404).json({
                    status: false,
                    message: "Patient not found",
                });
            }
            patientToDelete.isDeleted = true;
            await patientToDelete.save();
            res.status(200).json({
                status: true,
                message: "Patient deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    }

    async verifyPatientEmail(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({
                    status: false,
                    message: "Patient email and OTP are required",
                });
            }
            const patient = await Patient.findById(email);
            if (!patient) {
                return res.status(404).json({
                    status: false,
                    message: "Patient not found",
                });
            }
            if (patient.isVerified) {
                return res.status(400).json({
                    status: false,
                    message: "Email already verified",
                });
            }
            // Assuming you have a method to verify OTP
            const isOtpExist = await Otp.findOne(
                {
                    userId: patient._id,
                    otp
                });
            if (!isOtpExist) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid OTP",
                });
            }

            const currentTime = new Date();
            const otpExpiryTime = new Date(isOtpExist.createdAt.getTime() + 15 * 60 * 1000);

            if (currentTime > otpExpiryTime) {
                return res.status(400).json({
                    status: false,
                    message: "OTP has expired",
                });
            }
            patient.isVerified = true;
            await patient.save();
            res.status(200).json({
                status: true,
                message: "Email verified successfully",
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    }

    async resendOtp(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    status: false,
                    message: "Email is required",
                });
            }

            const patient = await Patient.findOne({ email });

            if (!patient) {
                return res.status(404).json({
                    status: false,
                    message: "Patient not found",
                });
            }

            if (patient.isVerified) {
                return res.status(400).json({
                    status: false,
                    message: "Patient email already verified",
                });
            }

            await sendOtp(req, patient, "EMAIL_VERIFY");

            return res.status(200).json({
                status: true,
                message: "OTP resent successfully",
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Server error in resending OTP",
                error: error.message,
            });
        }
    }

    async changePassword(req, res) {
        try {
            const { email, oldPassword, newPassword } = req.body;

            if (!email || !oldPassword || !newPassword) {
                return res.status(400).json({
                    status: false,
                    message: "Email, old password and new password are required",
                });
            }

            const patient = await Patient.findOne({ email });

            if (!patient) {
                return res.status(404).json({
                    status: false,
                    message: "Patient not found",
                });
            }

            const isMatch = await bcryptjs.compare(oldPassword, patient.password);

            if (!isMatch) {
                return res.status(400).json({
                    status: false,
                    message: "Old password is incorrect",
                });
            }

            const salt = await bcryptjs.genSalt(10);
            const hashedNewPassword = await bcryptjs.hash(newPassword, salt);
            patient.password = hashedNewPassword;
            await patient.save();

            return res.status(200).json({
                status: true,
                message: "Password changed successfully",
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Server error in changing password",
                error: error.message,
            });
        }
    }

    async togglePatient(req, res) {
        try {
          const patient = await Patient.findById(req.params.id);
          if (!patient) return res.status(404).json({ status: false, message: "Patient not found" });
      
          patient.isActive = !patient.isActive;
          await patient.save();
      
          return res.status(200).json({
            status: true,
            message: `Patient ${patient.isActive ? "unblocked" : "blocked"} successfully`,
          });
        } catch (error) {
          return res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async getMyProfile(req, res) {
        try {
          const patient = await Patient.findById(req.user.id)
            .select("-password -refreshToken");
          if (!patient) {
            return res.status(404).json({ status: false, message: "Patient not found" });
          }
          return res.status(200).json({ status: true, message: "Profile fetched", patient });
        } catch (error) {
          return res.status(500).json({ status: false, message: "Server error" });
        }
      }
    
      // ---------- PATIENT: khud ka profile update ----------
      async updateMyProfile(req, res) {
        try {
          const updateData = { ...req.body };
          // locked fields
          delete updateData.password;
          delete updateData.role;
          delete updateData.email;
          delete updateData.isVerified;
          delete updateData.isDeleted;
          delete updateData.isActive;
    
          const updated = await Patient.findByIdAndUpdate(req.user.id, updateData, {
            new: true, runValidators: true,
          }).select("-password -refreshToken");
    
          if (!updated) {
            return res.status(404).json({ status: false, message: "Patient not found" });
          }
          return res.status(200).json({ status: true, message: "Profile updated", patient: updated });
        } catch (error) {
          return res.status(500).json({ status: false, message: "Server error" });
        }
      }

      async changeMyPassword(req, res) {
        try {
          const { oldPassword, newPassword } = req.body;
          if (!oldPassword || !newPassword) {
            return res.status(400).json({ status: false, message: "Old and new password required" });
          }
          if (newPassword.length < 8) {
            return res.status(400).json({ status: false, message: "New password must be at least 8 characters" });
          }
          const patient = await Patient.findById(req.user.id);
          if (!patient) return res.status(404).json({ status: false, message: "Patient not found" });
    
          const isMatch = await bcryptjs.compare(oldPassword, patient.password);
          if (!isMatch) return res.status(400).json({ status: false, message: "Old password is incorrect" });
    
          const salt = await bcryptjs.genSalt(10);
          patient.password = await bcryptjs.hash(newPassword, salt);
          await patient.save();
          return res.status(200).json({ status: true, message: "Password changed successfully" });
        } catch (error) {
          return res.status(500).json({ status: false, message: "Server error" });
        }
      }

}

module.exports = new patientController();
