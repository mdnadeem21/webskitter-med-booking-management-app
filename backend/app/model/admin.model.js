const mongoose =require('mongoose')

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "admin", enum: ["admin"] },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  const Admin = mongoose.model('manage-med-admin', adminSchema);
  module.exports = Admin;