const mongoose=require("mongoose");

const OtpSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'manage-med-user',
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    purpose: {
        type: String,
        enum: ["EMAIL_VERIFY", "FORGOT_PASSWORD"],
        default: "EMAIL_VERIFY",
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:'15m' // OTP expires after 15 minutes 
    }
})

const Otp =mongoose.model("manage-med-otp",OtpSchema)
module.exports = Otp