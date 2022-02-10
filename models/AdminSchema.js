const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
}, {
    timestamps: true
});


const FinTechAdmin = mongoose.model('FinTechAdmin', AdminSchema);

module.exports = FinTechAdmin