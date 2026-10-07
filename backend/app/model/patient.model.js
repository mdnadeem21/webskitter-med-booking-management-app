const mongoose = require("mongoose");

const { Schema } = mongoose;

const patientSchema = new Schema({
  // userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "manage-med-user",
  //   required: true,
  //   unique: true,
  // },
  // clinicId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "manage-med-clinic",
  //   required: true,
  //   index: true,
  // },
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
  allergies: { type: [String], default: [] },
  previousDiseases: { type: [String], default: [] },
  currentMedicines: { type: [String], default: [] },
  previousSurgeries: { type: [String], default: [] },
  isVerified: { 
    type: Boolean, 
    default: false 
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
});

const Patient = mongoose.model("manage-med-patient", patientSchema);
module.exports = Patient