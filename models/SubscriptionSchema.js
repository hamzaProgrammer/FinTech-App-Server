const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    code: {   // auto generated from front end
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    typeSubs : {
        type: String,
        enum: ['monthly', 'bimonthly', 'quarter', 'semester', 'annual']
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
    prodName: {
        type: mongoose.Types.ObjectId,
        ref: 'fintechproducts',
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    totAmt: {
        type: Number,
        default : '0'
    },
    balance:{  // remaining
        type: Number,
        default : '0'
    },
    noOfSubs: { // no of members who subs this subscription
        type: Number,
        default : '0'
    },
    status: {
        type: String,
    },
    cashRegister:[{
        name:{type:String},
        dateOfCollection:{type:Date},
        collectionAmount:{type:Number},
        subscriptionName: {type:String},
        status:{type:String}
    }]
}, {
    timestamps: true
});


const FinTechSubscriptions = mongoose.model('FinTechSubscriptions', SubscriptionSchema);

module.exports = FinTechSubscriptions