const Doctor = require("../model/doctor.model");
const Otp = require("../model/otp.model");
const generatePassword = require('../util/generate.password')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendOtp=require('../util/send.otp')
const sendEmail=require('../util/send.email')
const {uploadFileOnCloudinary} = require('../util/upload.file.on.cloudinary')

class DoctorController {
  async registerDoctor(req, res) {
    try {
      const {
        name,
        email,
        departmentId,
        qualification,
        specialization,
        experience,
        consultationFee,
        consultationMode,
        about,
      } = req.body;

      if( !name || !email || !departmentId || !qualification || !specialization || !experience || !consultationFee ){
        return res.status(400).json({
          status: false,
          message: "Missing required fields",
        });
      }

      const existingDoctor = await Doctor.findOne({ email });
      if(existingDoctor) {
        return res.status(400).json({
          status: false,
          message: "Doctor with this email already exists",
        });
      }
      const newDoctor = new Doctor({
        name,
        email,
        departmentId,
        qualification,
        specialization,
        experience,
        consultationFee,
        consultationMode,
        about
      });

      const defaultPassword = generatePassword();
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(defaultPassword, salt);
      newDoctor.password = hashedPassword;

      if(req.file && req.file.path) {
        const localPath = req.file.path
        const cloudinaryResponse = await uploadFileOnCloudinary(localPath);
        newDoctor.avatar = cloudinaryResponse.url;
      }
      // send otp for email verification
        await sendOtp(req, newDoctor,"EMAIL_VERIFY");
        // send email to doctor with default password and link to change password
        await sendEmail(req, newDoctor,defaultPassword);

        await newDoctor.save();
        return res.status(201).json({
          status: true,
          message: "Doctor registered successfully. OTP sent to email for verification.",
          doctor: newDoctor,
        });



    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in register doctor",
        error: error.message,
      });
    }
  }

  async loginDoctor(req,res){
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "Email and password are required",
        });
      }

      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }

      const isMatch = await bcryptjs.compare(password, doctor.password);
      if (!isMatch) {
        return res.status(401).json({
          status: false,
          message: "Invalid password",
        });
      }

      if (!doctor.isVerified && !doctor.role == 'doctor') {
        return res.status(403).json({
          status: false,
          message: "Email not verified or you are not a doctor.",
        });
      }

      // generate access token using jwt
      const accessToken = jwt.sign(
        {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          role: doctor.role,
        },
        process.env.JWT_SECRET || "jwt-secret-key",
        { expiresIn: "1m" }
      );

      const refreshToken = jwt.sign(
        {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          role: doctor.role,
        },
        process.env.JWT_SECRET || "jwt_secret_key",
        { expiresIn: "7d" }
      );

      // hashed refresh token for security
      const hashedRefreshToken = await bcryptjs.hash(refreshToken, 10);
      // Store refresh token in the database
      doctor.refreshToken = hashedRefreshToken;
      await doctor.save();

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
        data: { doctorId: doctor._id, email: doctor.email },
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
  async getAllDoctors(req, res) {
    try {
      const doctors = await Doctor.find();

      if(!doctors || doctors.length === 0) {
        return res.status(404).json({
          status: false,
          message: "No doctors found",
        });
      }
      return res.status(200).json({
        status: true,
        message: "Doctors fetched successfully",
        doctors,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in fetching doctors",
        error: error.message,
      });
    }
  }

  async getDoctorById(req, res) {
    try {
      const { id } = req.params;
      const doctor = await Doctor.findById(id);

      if(!doctor) {
        return res.status(404).json({
          status: false,
          message: "Doctor not found",
        });
      }
      return res.status(200).json({
        status: true,
        message: "Doctor fetched successfully",
        doctor,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in fetching doctor",
        error: error.message,
      });
    }
  }

  async updateDoctor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if(req.file && req.file.path) {
        const localPath = req.file.path
        const cloudinaryResponse = await uploadFileOnCloudinary(localPath);
        updateData.avatar = cloudinaryResponse.url;
      }

      const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, { new: true });

      if(!updatedDoctor) {
        return res.status(404).json({
          status: false,
          message: "Doctor not found",
        });
      }
      return res.status(200).json({
        status: true,
        message: "Doctor updated successfully",
        doctor: updatedDoctor,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in updating doctor",
        error: error.message,
      });
    }
  }

  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;
      const doctorTobeDelete = await Doctor.findById(id);

      if(!doctorTobeDelete) {
        return res.status(404).json({
          status: false,
          message: "Doctor not found",
        });
      }

      doctorTobeDelete.isDeleted = true; 
      await doctorTobeDelete.save();

      return res.status(200).json({
        status: true,
        message: "Doctor deleted successfully",
        doctor: deletedDoctor,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in deleting doctor",
        error: error.message,
      });
    }
  }

  async verifyDoctor(req, res) {
    try {
      const { email, otp } = req.body;

      if(!email || !otp) {
        return res.status(400).json({
          status: false,
          message: "Email and OTP are required",
        });
      }

      const doctor = await Doctor.findOne({ email });

      if(!doctor) {
        return res.status(404).json({
          status: false,
          message: "Doctor not found",
        });
      }

      // Verify OTP logic here (assuming you have a function to verify OTP)
      if(doctor.isVerified) {
        return res.status(400).json({
          status: false,
          message: "Doctor email already verified",
        });
      }
      const isOtpExsit = await Otp.findOne({
        userId: doctor._id,
        otp,
      })
      if(!isOtpExsit) {
        return res.status(400).json({
          status: false,
          message: "Invalid OTP or expired OTP",
        });
      }
      
      const currentTime = new Date();
      const otpExpiryTime = new Date(isOtpExsit.createdAt.getTime() + 15 * 60 * 1000); 

      if(currentTime > otpExpiryTime) {
        return res.status(400).json({
          status: false,
          message: "OTP has expired",
        });
      }

      doctor.isVerified = true;
      await doctor.save();
      await Otp.deleteMany({ userId: doctor._id, purpose: "EMAIL_VERIFY" });

      return res.status(200).json({
        status: true,
        message: "Doctor email verified successfully",
        doctor,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server error in verifying doctor email",
        error: error.message,
      });
    }
  }

  async resendOtp(req, res) {
    try {
      const { email } = req.body;

      if(!email) {
        return res.status(400).json({
          status: false,
          message: "Email is required",
        });
      }

      const doctor = await Doctor.findOne({ email });

      if(!doctor) {
        return res.status(404).json({
          status: false,
          message: "Doctor not found",
        });
      }

      if(doctor.isVerified) {
        return res.status(400).json({
          status: false,
          message: "Doctor email already verified",
        });
      }

      await sendOtp(req, doctor,"EMAIL_VERIFY");

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

      if(!email || !oldPassword || !newPassword) {
        return res.status(400).json({
          status: false,
          message: "Email, old password and new password are required",
        });
      }

      if(!newPassword || newPassword.length < 8) {
        return res.status(400).json({
          status: false,
          message: "New password must be at least 8 characters long",
        });
      }

      const doctor = await Doctor.findOne({ email });

      if(!doctor) {
        return res.status(404).json({
          status: false,
          message: "Doctor not found",
        });
      }

      const isMatch = await bcryptjs.compare(oldPassword, doctor.password);
      if(!isMatch) {
        return res.status(400).json({
          status: false,
          message: "Old password is incorrect",
        });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);
      doctor.password = hashedPassword;
      await doctor.save();

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
}
module.exports = new DoctorController();
