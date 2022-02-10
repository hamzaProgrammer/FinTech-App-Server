const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
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
    subscriptions: [{
        type: mongoose.Types.ObjectId,
        ref: 'fintechsubscriptions',
    }],
    operator: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechoperators',
    },
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


const FinTechMembers = mongoose.model('FinTechMembers', MemberSchema);

module.exports = FinTechMembers