const Receptionist = require("../model/receptionist.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generatePassword } = require("../util/generate.password");   // ⬅️ doctor jaisa hi
const { uploadFileOnCloudinary } = require("../util/upload.file.on.cloudinary")
class ReceptionistController {

  // ---------- CREATE (sirf admin) ----------
  async registerReceptionist(req, res) {
    try {
      const { name, email, phone } = req.body;

      if (!name || !email || !phone) {
        return res.status(400).json({ status: false, message: "Missing required fields" });
      }

      // phone format check — doctor/patient me regex tha, receptionist model me nahi — par backend validation achhi hai
      if (!/^[6-9][0-9]{9}$/.test(phone)) {
        return res.status(400).json({ status: false, message: "Invalid phone number" });
      }

      const existing = await Receptionist.findOne({ email });
      if (existing) {
        return res.status(400).json({ status: false, message: "Receptionist with this email already exists" });
      }

      const newReceptionist = new Receptionist({ name, email, phone });

      // doctor jaisa hi — generate + hash + response me credentials
      const defaultPassword = generatePassword();
      const salt = await bcryptjs.genSalt(10);
      newReceptionist.password = await bcryptjs.hash(defaultPassword, salt);
      if(req.file && req.file.filename) {
        const localPath = req.file.localPath
        const cloudinaryResponse = await cloudinary(localPath)
        newReceptionist.profileImage = cloudinaryResponse.url
      }
      await newReceptionist.save();

      return res.status(201).json({
        status: true,
        message: "Receptionist registered successfully",
        receptionist: newReceptionist,
        // ⚠️ DEV-ONLY (email fix hone ke baad hata dena):
        credentials: { email: newReceptionist.email, temporaryPassword: defaultPassword },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Server error in register receptionist",
        error: error.message,
      });
    }
  }

  // ---------- LOGIN (existing — sirf fixes) ----------
  async loginReceptionist(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ status: false, message: "Email and password are required" });
      }

      const receptionist = await Receptionist.findOne({ email });
      if (!receptionist) {
        return res.status(401).json({ status: false, message: "Invalid email or password" });
      }

      const isMatch = await bcryptjs.compare(password, receptionist.password);
      if (!isMatch) {
        return res.status(401).json({ status: false, message: "Invalid password" });
      }

      // ⚠️ FIX: model me isVerified hai hi nahi — yeh check hamesha crash-prone tha, hata do
      // ⚠️ FIX: isActive check add karo — deactivate kiya to login block
      if (!receptionist.isActive) {
        return res.status(403).json({ status: false, message: "Account is deactivated. Contact admin." });
      }

      const accessToken = jwt.sign(
        { id: receptionist._id, name: receptionist.name, email: receptionist.email, role: receptionist.role },
        process.env.JWT_SECRET || "jwt-secret-key",
        { expiresIn: "15m" }     // ⬅️ FIX: 1m nahi — 15m (baaki controllers me bhi karo!)
      );

      const refreshToken = jwt.sign(
        { id: receptionist._id, name: receptionist.name, email: receptionist.email, role: receptionist.role },
        process.env.JWT_SECRET || "jwt_secret_key",
        { expiresIn: "7d" }
      );

      const hashedRefreshToken = await bcryptjs.hash(refreshToken, 10);
      receptionist.refreshToken = hashedRefreshToken;
      await receptionist.save();

      return res.status(200).json({
        status: true,
        message: "Login successful",
        data: { userId: receptionist._id, name: receptionist.name, email: receptionist.email },
        // ⬅️ FIX: doctorId galat key tha! + name add (doctor/patient me bhi karo)
        token: { accessToken, refreshToken },
      });
    } catch (error) {
      console.log(error);   // ⬅️ FIX: err nahi — error
      res.status(500).json({ status: false, message: "Server error in login user" });
    }
  }

  // ---------- READ ALL ----------
  async getAllReceptionists(req, res) {
    try {
      const receptionists = await Receptionist.find().select("-password -refreshToken");
      if (!receptionists || receptionists.length === 0) {
        return res.status(404).json({ status: false, message: "No receptionists found" });
      }
      return res.status(200).json({
        status: true,
        message: "Receptionists fetched successfully",
        receptionists,
      });
    } catch (error) {
      return res.status(500).json({
        status: false, message: "Server error in fetching receptionists", error: error.message,
      });
    }
  }

  // ---------- READ ONE ----------
  async getReceptionistById(req, res) {
    try {
      const receptionist = await Receptionist.findById(req.params.id).select("-password -refreshToken");
      if (!receptionist) {
        return res.status(404).json({ status: false, message: "Receptionist not found" });
      }
      return res.status(200).json({ status: true, message: "Receptionist fetched successfully", receptionist });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error in fetching receptionist", error: error.message });
    }
  }

  // ---------- UPDATE ----------
  async updateReceptionist(req, res) {
    try {
      const updateData = { ...req.body };

      // security — yeh fields kabhi body se update nahi
      delete updateData.password;
      delete updateData.role;
      delete updateData.email;      // identity locked
      delete updateData.refreshToken;

      const updated = await Receptionist.findByIdAndUpdate(
        req.params.id, updateData, { new: true }
      ).select("-password -refreshToken");

      if (!updated) {
        return res.status(404).json({ status: false, message: "Receptionist not found" });
      }
      return res.status(200).json({ status: true, message: "Receptionist updated successfully", receptionist: updated });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error in updating receptionist", error: error.message });
    }
  }

  // ---------- DEACTIVATE/ACTIVATE (isDeleted nahi hai model me — isActive toggle) ----------
  async toggleReceptionist(req, res) {
    try {
      const receptionist = await Receptionist.findById(req.params.id);
      if (!receptionist) {
        return res.status(404).json({ status: false, message: "Receptionist not found" });
      }
      receptionist.isActive = !receptionist.isActive;
      await receptionist.save();
      return res.status(200).json({
        status: true,
        message: `Receptionist ${receptionist.isActive ? "activated" : "deactivated"} successfully`,
        receptionist: receptionist.select?.() || receptionist,   // password save hone se pehle select ka issue — neeche note
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
  }

  // ---------- CHANGE PASSWORD (receptionist khud ka) ----------
  async changePassword(req, res) {
    try {
      const { email, oldPassword, newPassword } = req.body;
      if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ status: false, message: "Email, old and new password required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ status: false, message: "New password must be at least 8 characters" });
      }
      const receptionist = await Receptionist.findOne({ email });
      if (!receptionist) {
        return res.status(404).json({ status: false, message: "Receptionist not found" });
      }
      const isMatch = await bcryptjs.compare(oldPassword, receptionist.password);
      if (!isMatch) {
        return res.status(400).json({ status: false, message: "Old password is incorrect" });
      }
      const salt = await bcryptjs.genSalt(10);
      receptionist.password = await bcryptjs.hash(newPassword, salt);
      await receptionist.save();
      return res.status(200).json({ status: true, message: "Password changed successfully" });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error in changing password" });
    }
  }

  async getMyProfile(req, res) {
    try {
      const receptionist = await Receptionist.findById(req.user.id)
        .select("-password -refreshToken");
      if (!receptionist) {
        return res.status(404).json({ status: false, message: "Receptionist not found" });
      }
      return res.status(200).json({ status: true, message: "Profile fetched", receptionist });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error" });
    }
  }
  async updateMyProfile(req, res) {
    try {
      const updateData = { ...req.body };
      // locked fields — security
      delete updateData.password;
      delete updateData.role;
      delete updateData.email;
      delete updateData.isActive;

      const updated = await Receptionist.findByIdAndUpdate(req.user.id, updateData, {
        new: true, runValidators: true,
      }).select("-password -refreshToken");

      if (!updated) {
        return res.status(404).json({ status: false, message: "Receptionist not found" });
      }
      return res.status(200).json({ status: true, message: "Profile updated", receptionist: updated });
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server error" });
    }
  }
}

module.exports = new ReceptionistController();