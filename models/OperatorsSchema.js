const mongoose = require("mongoose");

const OperatorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    status: {
        type: String,
        enum: ['enabled', 'disabled']
    },
    doB: {
        type: Date,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    cnic: { // picture
        type: String,
    },
    cnicExpiry: {
        type: Date,
    },
    members: [{
        type: mongoose.Types.ObjectId,
        ref: 'fintechmembers',
    }],
    agency: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechagencies',
    },
    mailSentTime : {
        type: Date,
        default : null
    },
    otpCode: {
        type: String,
        default : null
    }
}, {
    timestamps: true
});


const FinTechOperators = mongoose.model('FinTechOperators', OperatorSchema);

module.exports = FinTechOperators