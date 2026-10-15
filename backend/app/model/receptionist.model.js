const mongoose = require("mongoose");

const receptionistSchema = new mongoose.Schema(
  {
    
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { 
        type: String, 
        required: true, 
        trim: true 
    }, 
    password: { 
        type: String, 
        required: true,
    },
    profileImage:{
        type: String,
        default: "receptionist.jpg"
    },
    role: { 
        type: String, 
        default: "receptionist", 
        enum: ["receptionist"] 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
  },
  {
    timestamps: true,
  }
);

const Receptionist = mongoose.model(
  "manage-med-receptionist",
  receptionistSchema
);
module.exports = Receptionist;
