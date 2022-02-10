const mongoose = require("mongoose");

const AgencySchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true
    },
    products : [{
        type: mongoose.Types.ObjectId,
        ref: 'fintechproducts',
    }],
    operators: [{
        type: mongoose.Types.ObjectId,
        ref: 'fintechoperators',
    }],
    members: [{
        type: mongoose.Types.ObjectId,
        ref: 'fintechmembers',
    }],
    cashRegister: [{
        type: mongoose.Types.ObjectId,
        ref: 'cashregisteragency',
    }],
}, {
    timestamps: true
});


const FinTechAgencies = mongoose.model('FinTechAgencies', AgencySchema);

module.exports = FinTechAgencies