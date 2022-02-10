const Agencies = require('../models/AgencySchema')
const Operators = require('../models/OperatorsSchema')
const Members = require('../models/MemberSchema')
const Subscriptions = require('../models/SubscriptionSchema')
const Collections = require('../models/CollectionSchema')
const mongoose = require("mongoose");

//Adding new Collections and also checking if it already exists or not
const addNewCollection = async (req, res) => {
    const { amount , collectionDate ,  status , operator , agency , member , subscription  } = req.body;
    if (!amount || !collectionDate | !status || !operator || !agency || !member || !subscription ) {
        return res.json({
            message: "Please fill All required credentials"
        });
    }else {
            // checking agency provided exists
            const agnecyCheck = await Agencies.find({_id: agency })
            const checkMember = await Members.find({_id: member })
            const checkOpr = await Operators.find({_id: operator })
            if (agnecyCheck.length > 0 && checkMember.length > 0 & checkOpr.length > 0) {
                try{
                    let gotSubs;
                    gotSubs = await Subscriptions.find({"_id": subscription})
                    let index ;
                    gotSubs[0].cashRegister.map((x,ind)=>{
                        if (x.dateOfCollection >= new Date(collectionDate))
                        {
                            if (!index){
                                index = ind ;
                            }
                        }
                    })

                    if (gotSubs[0].cashRegister[index - 1].status == "Collected")
                    {
                        return  res.status(504).json({message : `*** Error! Amount (${amount}) already collected from this Member for Desired Subscription Today. ***`});
                    }
                    else
                    {
                        let myTotAmt = gotSubs[0].totAmt;
                        gotSubs[0].balance = myTotAmt - amount;
                        gotSubs[0].cashRegister[index - 1].status = "Collected"
                        await gotSubs[0].save()

                        const addedeRcord  = await Collections.create({ ...req.body })

                        if ( !addedeRcord ) {
                            throw new Error('*** Error! Account cannot added to collection ****');
                        }
                        else {
                            return res.status(201).json({addedeRcord , message: "*** Amount SuccessFully Added to Collections  ***" })
                        }
                    }
                }catch (error) {
                        console.log("Error in addNewCollection and error is : ", error)
                    }
            }else{
                return res.json({
                    message: '*** This Agency or Operator or Member Does Not Exists ***'
                })
            }
    }
}

// update Collection
const updateCollection = async (req, res) => {
    const {id} = req.params;
    try {
        const gotCollection = await Collections.findByIdAndUpdate(id, { ...req.body } , {new : true});

        if (gotCollection) {
            return res.status(200).json({gotCollection ,  message: "*** Collection Updated  Successfully ***"})
        }else{
            return res.status(500).json({ message: "*** Error!  Collection Account Not-Updated ***"})
        }
    } catch (error) {
        console.log("Error in updateCollection and error is : ", error)
    }
}

// delete Collection
const deleteCollection = async (req, res) => {
    const {id} = req.params;
    try {
        const gotCollection = await Collections.findById(id);
        if (!gotCollection){
            return res.status(201).json({ message: "*** No Collection Found  ***" })
        }else{
            let gotSubs;
            let cDate = new Date();
            gotSubs = await Subscriptions.find({_id : gotCollection.subscription })
            let index ;
            gotSubs[0].cashRegister.map((x,ind)=>{
                if (x.dateOfCollection >= cDate )
                {
                    if (!index){
                        index = ind;
                    }
                }
            })
            if (gotSubs[0].cashRegister[index - 1].status == "Collected")
            {
                gotSubs[0].cashRegister[index - 1].status == "Cancelled By Admin";
                gotSubs[0].balance -= gotSubs[0].amount;
            }else{
                // let myTotAmt = gotSubs[0].totAmt;
                // gotSubs[0].balance = myTotAmt - amount;
                gotSubs[0].cashRegister[index - 1].status = "Cancelled By Admin"
                await gotSubs[0].save()

                const updatedRcord  = await Subscriptions.findByIdAndUpdate(gotSubs[0]._id , { ...req.body } , {new : true})
                if ( !updatedRcord ) {
                    return res.status(201).json({ message: "*** Opps! UnExpected Error Occured while Changing Ststaus ***" })
                }
                const delCollection = await Collections.findByIdAndDelete(id);
                if (delCollection){
                    return res.status(201).json({ message: "*** Collection Deleted SuccessFully  ***" })
                }else{
                    return res.status(201).json({ message: "*** Opps! Collection Colud Not Be Deleted ***" })
                }
            }
        }
    } catch (error) {
        console.log("Error in deleteCollection and error is : ", error)
    }
}

// get all Collections
const getAllCollections = async (req, res) => {
    try {
        const allSubscriptions = await Collections.aggregate([
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'Product'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'Member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'Agency'
            }
        },
        {
            $lookup: {
                from: 'fintechsubscriptions',
                localField: 'subscription',
                foreignField: '_id',
                as: 'Subscription'
            },
        }

    ])
        if (!allSubscriptions) {
            return res.json({
                message: '*** No Subscriptions Found ****',
            });
        } else {
            return res.json({
                allSubscriptions,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllCollections and error is : ", error)
    }
}

// get all Collections By Any Agency
const getAllCollectofAnyAgency = async (req, res) => {
    const {agencyId} = req.params;
    try {
        const allSubscriptions = await Collections.aggregate([
        {
            $match: { agency : mongoose.Types.ObjectId(agencyId) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'Product'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'Member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'Agency'
            },
        },
        {
            $lookup: {
                from: 'fintechsubscriptions',
                localField: 'subscription',
                foreignField: '_id',
                as: 'Subscription'
            },
        }
    ])
        if (!allSubscriptions) {
            return res.json({
                message: '*** No Subscriptions Found ****',
            });
        } else {
            return res.json({
                allSubscriptions,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllSubscriptions and error is : ", error)
    }
}

// get all Collections By Any Operator
const getAllCollectofAnyOpr = async (req, res) => {
    const {oprId} = req.params;
    try {
        const allSubscriptions = await Collections.aggregate([
        {
            $match: { operator : mongoose.Types.ObjectId(oprId) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'Product'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'Member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'Agency'
            },
        },
        {
            $lookup: {
                from: 'fintechsubscriptions',
                localField: 'subscription',
                foreignField: '_id',
                as: 'Subscription'
            },
        }
    ])
        if (!allSubscriptions) {
            return res.json({
                message: '*** No Subscriptions Found ****',
            });
        } else {
            return res.json({
                allSubscriptions,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllSubscriptions and error is : ", error)
    }
}

// get all Collections By Date range
const getAllCollectByDateRange = async (req, res) => {
    const {startDate , endDate } = req.body;
    try {
        const allSubscriptions = await Collections.aggregate([
        {
            $match: {
                collectionDate: { $gt: new Date(startDate), $lt: new Date(endDate) }
            }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'Product'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'Member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'Agency'
            },
        },
        {
            $lookup: {
                from: 'fintechsubscriptions',
                localField: 'subscription',
                foreignField: '_id',
                as: 'Subscription'
            },
        }
    ])
        if (!allSubscriptions) {
            return res.json({
                message: '*** No Subscriptions Found ****',
            });
        } else {
            return res.json({
                allSubscriptions,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllSubscriptions and error is : ", error)
    }
}

// get all Collections By Any Member
const getAllCollectofAnyMember = async (req, res) => {
    const {memberId} = req.params;
    try {
        const allSubscriptions = await Collections.aggregate([
        {
            $match: { member : mongoose.Types.ObjectId(memberId) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'Product'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'Member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'Agency'
            },
        },
        {
            $lookup: {
                from: 'fintechsubscriptions',
                localField: 'subscription',
                foreignField: '_id',
                as: 'Subscription'
            },
        }
    ])
        if (!allSubscriptions) {
            return res.json({
                message: '*** No Subscriptions Found ****',
            });
        } else {
            return res.json({
                allSubscriptions,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllSubscriptions and error is : ", error)
    }
}

// get Single Subscription
const getSingleCollection = async (req, res) => {
    const {id} = req.params;
    try {
        const allSubscriptions = await Collections.aggregate([
        {
            $match: { _id : mongoose.Types.ObjectId(id) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'Product'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'Member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'Agency'
            },
        },
        {
            $lookup: {
                from: 'fintechsubscriptions',
                localField: 'subscription',
                foreignField: '_id',
                as: 'Subscription'
            },
        }
    ])
        if (!allSubscriptions) {
            return res.json({
                message: '*** No Subscriptions Found ****',
            });
        } else {
            return res.json({
                allSubscriptions,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllSubscriptions and error is : ", error)
    }
}



module.exports = {
    addNewCollection,
    getAllCollections,
    getAllCollectofAnyAgency,
    getAllCollectofAnyOpr,
    getAllCollectofAnyMember,
    getSingleCollection,
    deleteCollection,
    updateCollection,
    getAllCollectByDateRange
}