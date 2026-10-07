const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    services: [{
        type: String,
        required: true
    }],
    openingHours:[
        {   
            type: String,
            required: true
        }
    ],
    isActive:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

const Clinic = mongoose.model('manage-med-clinic', clinicSchema);
module.exports = Clinic