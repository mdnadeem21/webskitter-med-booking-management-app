const mongoose = require("mongoose");

const { Schema } = mongoose;

const doctorSchema = new Schema({
  name:{
    type: String,
    required: true,
    trim: true
  },
  email:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password:{
    type: String,
    required: true,
  },
  role:{
    type: String,
    enum: ["doctor", "admin", "receptionist","patient"],
    default: "doctor",
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "manage-med-department",
    required: true,
    index: true,
  },
  qualification: { 
    type: String, 
    required: true, 
    trim: true 
  },
  specialization: { 
    type: String, 
    required: true, 
    trim: true 
  },
  experience: { 
    type: Number, 
    required: true, 
    min: 0 
  }, // years
  consultationFee: { 
    type: Number, 
    required: true, 
    min: 0
  },
  consultationMode: {
    type: [String],
    enum: ["IN_PERSON", "ONLINE"],
    default: ["IN_PERSON"],
  },
  about: { 
    type: String, 
    maxlength: 2000 
  },
  profileImage: { 
    type: String, 
    default: null 
  }, // Cloudinary URL
  isVerified: { 
    type: Boolean, 
    default: true 
  }, // admin verify karega
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
},{
  timestamps: true,
});

const Doctor = mongoose.model("manage-med-doctor", doctorSchema);
module.exports = Doctor

