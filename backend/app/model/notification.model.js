const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "manage-med-user", required: true, index: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "manage-med-clinic", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "manage-med-appointment", default: null },
    type: {
        type: String,
        required: true,
        enum: [
            "APPOINTMENT_CONFIRMED",
            "APPOINTMENT_CANCELLED",
            "APPOINTMENT_RESCHEDULED",
            "APPOINTMENT_REMINDER",
            "PRESCRIPTION_ISSUED",
        ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    emailSent: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const Notification = mongoose.model('manage-med-notification', notificationSchema);
module.exports = Notification