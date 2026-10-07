const Patient = require("../model/patient.model");
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
                { expiresIn: "1m" }
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
                data: { userId: patient._id, email: patient.email },
                token,
            });
        } catch (error) {
            console.log(err);
            res.status(500).json({
                status: false,
                message: "Server error in login user",
            });
        }
    }

    async getPatients(req, res) {
        try {
            const patients = await Patient.find({ isDeleted: false });
            if (patients.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "No patients found",
                });
            }
            res.status(200).json({
                status: true,
                size: patients.length,
                message: "Patients fetched successfully",
                patients,
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message,
            });
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

    // forgot password link
    // forgot password 

}

module.exports = new patientController();
