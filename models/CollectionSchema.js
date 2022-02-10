const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    collectionDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required : true
    },
    operator: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechoperators',
    },
    agency: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechagencies',
    },
    member: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechmembers',
    },
    subscription: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechsubscriptions',
    },
}, {
    timestamps: true
});


const FinTechCollections = mongoose.model('FinTechCollections', CollectionSchema);

module.exports = FinTechCollections