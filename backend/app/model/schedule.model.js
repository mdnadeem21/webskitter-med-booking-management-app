const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'manage-med-doctor',
        required: true
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'manage-med-clinic',
        required: true
    },
    dayOfWeek: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 6 
    },
    timings: [{
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    }],
    slotDuration: { 
        type: Number, 
        required: true, 
        min: 5, 
        default: 30 
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'cancelled'],
        default: 'available'
    }
}, { timestamps: true });

const Schedule = mongoose.model('manage-med-schedule', scheduleSchema);
module.exports = Schedule