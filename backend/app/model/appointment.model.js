const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

const APPOINTMENT_STATUS = [
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "NO_SHOW",
    "RESCHEDULED",
];

const appointmentSchema = new Schema(
    {
        patientId: { type: Types.ObjectId, ref: "manage-med-patient", required: true, index: true },
        doctorId: { type: Types.ObjectId, ref: "manage-med-doctor", required: true, index: true },
        clinicId: { type: Types.ObjectId, ref: "manage-med-clinic", required: true, index: true },
        departmentId: { type: Types.ObjectId, ref: "manage-med-department", required: true },
        appointmentDate: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }, 
        appointmentType: {
            type: String,
            enum: ["IN_PERSON", "ONLINE"],
            default: "IN_PERSON",
        },
        reason: { type: String, required: true, trim: true, maxlength: 500, default: "General" },
        status: { type: String, enum: APPOINTMENT_STATUS, default: "PENDING" },
        consultationFee: { type: Number, required: true, min: 0 },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
            default: "PENDING",
        },
        bookingReference: {
            type: String,
            unique: true,
            default: () => `APT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        },
        isDeleted: { type: Boolean, default: false },
        // cancelledBy: { type: Types.ObjectId, ref: "manage-med-user", default: null },
        // cancellationReason: { type: String, maxlength: 300, default: null },
        // rescheduledFrom: { type: Types.ObjectId, ref: "Appointment", default: null },
        // markedNoShowBy: { type: Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment