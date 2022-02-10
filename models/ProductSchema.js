const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: Number
    },
    duration: {
        type: String,
        enum: ['monthly', 'bimonthly', 'quarter', 'semester', 'annual']
    },
    status: {
        type: String,
        enum: ['enabled', 'disabled']
    },
    price: {
        type: Number
    },
    operator: {
       type: mongoose.Types.ObjectId,
        ref: 'fintechoperators',
    },
    agency: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechagencies',
    },
}, {
    timestamps: true
});


const FinTechProducts = mongoose.model('FinTechProducts', ProductSchema);

module.exports = FinTechProducts