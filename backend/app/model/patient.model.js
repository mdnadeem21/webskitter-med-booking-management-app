const mongoose = require("mongoose");

const { Schema } = mongoose;

const patientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone:{
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9][0-9]{9}$/, "Invalid phone"],
  },
  password:{
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
    required: true,
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  address: { 
    type: String,   
    trim: true 
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null],
    default: null,
  },
  patientImage: { 
    type: String, 
    default: 'default_patient_image.jpg' 
  }, 
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, match: [/^[6-9][0-9]{9}$/, "Invalid phone"] },
    relation: { type: String, trim: true },
  },
  isVerified: { 
    type: Boolean, 
    default: true 
  },
  role:{
    type: String,
    enum: ["patient", "doctor", "admin", "receptionist"],
    default: "patient",
  },
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

const Patient = mongoose.model("manage-med-patient", patientSchema);
module.exports = Patient