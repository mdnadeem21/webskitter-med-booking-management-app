const mongoose = require("mongoose");

const receptionistSchema = new mongoose.Schema(
  {
    // src/models/receptionist.model.js
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
    avatar:{
        type: String,
        default: "receptionist.jpg"
    },
    role: { 
        type: String, 
        default: "receptionist", 
        enum: ["receptionist"] 
    },
    mustChangePassword: { 
        type: Boolean, 
        default: true 
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
