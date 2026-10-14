const Admin  = require('../model/admin.model');
const Doctor = require("../model/doctor.model");
const Receptionist = require("../model/receptionist.model");
const Patient = require("../model/patient.model");
const Appointment = require("../model/appointment.model");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminController {

    async registerAdmin(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    status: false,
                    message: "Name, email and password are required",
                });
            }

            // Check if admin already exists
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(409).json({
                    status: false,
                    message: "Admin with this email already exists",
                });
            }

            // Hash the password
            const hashedPassword = await bcryptjs.hash(password, 10);

            // Create new admin
            const newAdmin = new Admin({
                name,
                email,
                password: hashedPassword,
            });

            await newAdmin.save();

            return res.status(201).json({
                status: true,
                message: "Admin registered successfully",
                data: {
                    id: newAdmin._id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    role: newAdmin.role,
                },
            });
        } catch (error) {
            console.error("Error in registerAdmin:", error);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
            });
        }
    }
    async loginAdmin(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: "Email and password are required",
                });
            }

            const admin = await Admin.findOne({ email }).select("+password");
            if (!admin) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid email or password",
                });
            }

            const isMatch = await bcryptjs.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid password",
                });
            }

            // generate access token using jwt
            const accessToken = jwt.sign(
                {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
                process.env.JWT_SECRET || "jwt-secret-key",
                { expiresIn: "1h" }
            );

            const refreshToken = jwt.sign({
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
                process.env.JWT_SECRET || "jwt-secret-key",
                { expiresIn: "7d" }
        )

            const token = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            }
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Set to true in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json({
                status: true,
                message: "Admin logged in successfully",
                data: {
                    adminId : admin._id,
                    name: admin.name,
                    email: admin.email,
                },
                token
            });
        } catch (error) {
            console.error("Error in loginAdmin:", error);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
            });
        }
    }
    async getAdminStats(req, res) {
        try {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    
          // saare counts parallel — ek round trip
          const [
            doctors,
            receptionists,
            patients,
            appointments,
            todayAppointments,
            pendingAppts,
          ] = await Promise.all([
            Doctor.countDocuments({ isDeleted: false }),
            Receptionist.countDocuments({ isActive: true }),
            Patient.countDocuments({ isDeleted: false }),
            Appointment.countDocuments({ isDeleted: false }),
            Appointment.countDocuments({ isDeleted: false, appointmentDate: { $gte: startOfToday, $lt: endOfToday } }),
            Appointment.countDocuments({ isDeleted: false, status: "PENDING" }),
          ]);
    
          return res.status(200).json({
            status: true,
            message: "Admin stats fetched successfully",
            data: {
              doctors, receptionists, patients, appointments,
              todayAppointments, pendingAppointments: pendingAppts,
            },
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ status: false, message: "Server error in admin stats" });
        }
    }
    async getAdminProfile(req, res) {
        try {
          const admin = await Admin.findById(req.user.id).select("-password -refreshToken");
          if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });
          return res.status(200).json({ status: true, message: "Profile fetched", admin });
        } catch (error) {
          return res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async updateAdminProfile(req, res) {
        try {
          const updateData = { ...req.body };
          // locked fields
          delete updateData.password;
          delete updateData.role;
          delete updateData.email;
          delete updateData.isVerified;
    
          const updated = await Admin.findByIdAndUpdate(req.user.id, updateData, {
            new: true, runValidators: true,
          }).select("-password -refreshToken");
    
          if (!updated) return res.status(404).json({ status: false, message: "Admin not found" });
          return res.status(200).json({ status: true, message: "Profile updated successfully", admin: updated });
        } catch (error) {
          return res.status(500).json({ status: false, message: "Server error updating profile" });
        }
      }
      async changePassword(req, res) {
        try {
          const { oldPassword, newPassword } = req.body;
          if (!oldPassword || !newPassword) {
            return res.status(400).json({ status: false, message: "Old and new password required" });
          }
          if (newPassword.length < 8) {
            return res.status(400).json({ status: false, message: "New password must be at least 8 characters" });
          }
          const admin = await Admin.findById(req.user.id);
          if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });
    
          const isMatch = await bcryptjs.compare(oldPassword, admin.password);
          if (!isMatch) return res.status(400).json({ status: false, message: "Old password is incorrect" });
    
          const salt = await bcryptjs.genSalt(10);
          admin.password = await bcryptjs.hash(newPassword, salt);
          await admin.save();
    
          return res.status(200).json({ status: true, message: "Password changed successfully" });
        } catch (error) {
          return res.status(500).json({ status: false, message: "Server error" });
        }
      }
    
    
}


module.exports = new AdminController();