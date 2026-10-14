const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        trim: true 
    },
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

const Department= mongoose.model('manage-med-department', departmentSchema);
module.exports = Department