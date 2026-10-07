const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin", "receptionist"],
      default: "patient",
    },
    // clinicId: { 
    //     type: ObjectId, 
    //     ref: "Clinic", 
    //     required: true, 
    //     index: true 
    // },
    avatar: { 
        type: String, 
        default: null 
    }, // Cloudinary URL
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String,
        default:null
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("manage-med-user", userSchema);
module.exports = User;
