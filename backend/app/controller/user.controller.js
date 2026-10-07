const mongoose = require("mongoose");
const User = require("../model/user.model");
const Patient = require("../model/patient.model");
const Otp = require("../model/otp.model");
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendOtp = require("../util/send.otp");
const transporter = require("../config/email.config");
const { uploadFileOnCloudinary } = require("../util/upload.file.on.cloudinary");

class UserController {
  async registerUser(req, res) {
    try {
      const {
        name,
        email,
        password,
        phone,
        gender,
        dateOfBirth,
        address,
        bloodGroup,
        emergencyContact,
      } = req.body;

      if (!name || !email || !password || !phone || !gender || !dateOfBirth) {
        return res.status(400).json({
          status: false,
          message: "name, email, password, phone, gender, dateOfBirth required",
        });
      }

      // check for duplicate
      const isUserExisting = await User.findOne({ email: email.toLowerCase() });
      if (isUserExisting) {
        return res.status(409).json({
          status: false,
          message: "Email already registered. Please login.",
        });
      }

      //hashed password
      const salt = await bcryptjs.genSalt(10);
      const hashPassword = await bcryptjs.hash(password, salt);

      // --- User + Patient ek transaction me (orphan na bache) ---
      const session = await mongoose.startSession();
      let user,patient;
      try {
        await session.withTransaction(async () => {
          [user] = await User.create(
            [
              {
                name,
                email: email.toLowerCase(),
                password: hashPassword,
                phone,
                role: "patient",
                isVerified: false,
              },
            ],
            { session }
          );

          [patient]=await Patient.create(
            [
              {
                userId: user._id,
                gender,
                dateOfBirth,
                address,
                bloodGroup: bloodGroup || null,
                emergencyContact: emergencyContact || {},
              },
            ],
            { session }
          );
        });
      } finally {
        session.endSession();
      }

      if (req.file) {
        const cloudinaryResponse = await uploadFileOnCloudinary(req.file.path);
        user.avatar = cloudinaryResponse.url; 
        patient.patientImage = cloudinaryResponse.url;
        // save user and patient after adding avatar
        await user.save();
        await patient.save();
      }

      
      // send otp
      await sendOtp(req, user, "EMAIL_VERIFY");

      res.status(201).json({
        success: true,
        message:
          "Registration successful. OTP sent to your email — verify within 10 minutes.",
        data: { userId: user._id, email: user.email },
      });
    } catch (error) {
      console.log(err);
      res.status(500).json({
        status: false,
        message: "Server error in register user",
      });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }
      const existingUser = await User.findOne({ email });

      // Check if email doesn't exists
      if (!existingUser) {
        return res
          .status(404)
          .json({ status: "failed", message: "Email doesn't exists" });
      }

      // Check if email is already verified
      if (existingUser.isVerified) {
        return res
          .status(400)
          .json({ status: false, message: "Email is already verified" });
      }
      // Check if there is a matching email verification OTP
      const isOtpExist = await Otp.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!isOtpExist) {
        //   await sendOtp(req, existingUser,"EMAIL_VERIFY");
        return res.status(400).json({
          status: false,
          message: "Invalid OTP",
        });
      }
      // Check if OTP is expired
      const currentTime = new Date();
      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(
        isOtpExist.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        // await sendOtp(req, existingUser);
        return res.status(400).json({
          status: "failed",
          message: "OTP expired, please re-generate otp",
        });
      }
      // OTP is valid and not expired, mark email as verified
      existingUser.isVerified = true;
      await existingUser.save();

      // Delete email verification document
      await Otp.deleteMany({ userId: existingUser._id });
      return res
        .status(200)
        .json({ status: true, message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Unable to verify email, please try again later",
      });
    }
  }

  async resendOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          status: false,
          message: "Email required",
        });
      }
      const isUserExist = await User.find({ email });
      if (!isUserExist) {
        return res.status(400).json({
          status: false,
          message: "User does not exist",
        });
      }
      if (isUserExist.isVerified) {
        return res.status(400).json({
          status: false,
          message: "User already verified",
        });
      }

      await sendOtp(req, isUserExist, "EMAIL_VERIFY");
      return res.status(200).json({
        success: true,
        message: "OTP resent successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Unable to re-send password otp. Please try again later.",
      });
    }
  }

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "Email and password are required",
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }

      if (!user.isVerified && user.role == 'patient') {
        return res.status(403).json({
          status: false,
          message: "Email not verified. Please verify your email.",
        });
      }

      // generate access token using jwt
      const accessToken = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "jwt-secret-key",
        { expiresIn: "1m" }
      );

      const refreshToken = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "jwt_secret_key",
        { expiresIn: "7d" }
      );

      // hashed refresh token for security
      const hashedRefreshToken = await bcryptjs.hash(refreshToken, 10);
      // Store refresh token in the database
      user.refreshToken = hashedRefreshToken;
      await user.save();

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
        data: { userId: user._id, email: user.email },
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

  async logoutUser(req, res) {
    try {
      // Clear the access token cookie
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "strict",
      });

      // Optionally, you can also clear the refresh token from the user document
      const userId = req.user.id; // Assuming you have user ID in the request
      const user = await User.findById(userId);
      if (user) {
        user.refreshToken = null; // Clear the refresh token
        await user.save();
      }

      res.status(200).json({
        status: true,
        message: "Logout successful",
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ status: false, message: "Server error in logout user" });
    }
  }

  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      if (!newPassword || !oldPassword) {
        return res.status(400).json({
          status: false,
          message: "Both old and new passwords are required",
        });
      }

      const isMatch = await bcryptjs.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: false,
          message: "Old password is incorrect",
        });
      }
      const salt = await bcryptjs.genSalt(10);
      const hashPassword = await bcryptjs.hash(newPassword, salt);
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { password: hashPassword },
        { new: true }
      );
      res.status(200).json({
        status: true,
        message: "Password updated successfully",
        data: updatedUser,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ status: false, message: "Server error in update password" });
    }
  }

  async resetPasswordLink(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ status: false, message: "Email field is required" });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "Email doesn't exist" });
      }
      // Generate token for password reset
      const secret = user._id + process.env.JWT_SECRET;
      const tokenLink = jwt.sign({ userId: user._id }, secret, {
        expiresIn: "20m",
      });
      // Reset Link and this link generate by frontend developer
      const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${tokenLink}`;
      //console.log(resetLink);
      // Send password reset email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Link",
        html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`,
      });
      // Send success response
      res
        .status(200)
        .json({
          status: true,
          message:
            "Password reset link sent to your email. Please check your email.",
        });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({
          status: false,
          message:
            "Unable to send password reset email. Please try again later.",
        });
    }
  }

  async resetPassword(req, res) {
    try {
      const { password, confirm_password } = req.body;
      const { id, token } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "User not found" });
      }
      // Validate token check
      const new_secret = user._id + process.env.JWT_SECRET;
      jwt.verify(token, new_secret);

      if (!password || !confirm_password) {
        return res
          .status(400)
          .json({
            status: false,
            message: "New Password and Confirm New Password are required",
          });
      }

      if (password !== confirm_password) {
        return res
          .status(400)
          .json({
            status: false,
            message: "New Password and Confirm New Password don't match",
          });
      }
      // Generate salt and hash new password
      const salt = await brctpyjs.genSalt(10);
      const newHashPassword = await brctpyjs.hash(password, salt);

      // Update user's password
      await User.findByIdAndUpdate(user._id, {
        $set: { password: newHashPassword },
      });

      // Send success response
      res
        .status(200)
        .json({ status: "success", message: "Password reset successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: "failed",
          message: "Unable to reset password. Please try again later.",
        });
    }
  }
}
module.exports = new UserController();
