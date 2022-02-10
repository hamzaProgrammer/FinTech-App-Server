const Agencies = require('../models/AgencySchema')
const Operators = require('../models/OperatorsSchema')
const Members = require('../models/MemberSchema')
const Subscriptions = require('../models/SubscriptionSchema')
const mongoose = require("mongoose");

//Adding new Subscription and also pushing it to arrays
const addNewSubscription = async (req, res) => {
    const { code , name ,  typeSubs , operator , agency , member , prodName , startDate , endDate  , status , totAmt  } = req.body;
    if (!code || !name | !typeSubs || !operator || !agency || !member || !prodName || !startDate || !endDate || !status || !totAmt ) {
        return res.json({
            message: "Please fill All required credentials"
        });
    }else {
        const check = await Subscriptions.find({
            member: member
        })
        if (check.length > 0) {
            return res.json({
                message: '*** You are already Subscribed to this Subscription ***'
            })
        }else {
            // checking agency provided exists
            const agnecyCheck = await Agencies.find({_id: agency })
            const checkMember = await Members.find({_id: member })
            const checkOpr = await Operators.find({_id: operator })
            const checkSubs = await Subscriptions.find({code : code })
            if (agnecyCheck.length > 0 && checkMember.length > 0 & checkOpr.length > 0) {
                try{
                // Handling CashRegister here
                    const CashRegisterArray = [] //initializaied Empty Array for CashRegister
                    const User = await Members.find({ "_id": member }) //used to find UserName

                    //used to find the price according to Per Day
                    const price = await PriceCalHandler(new Date(startDate), new Date(endDate), totAmt)

                    //used to make CashRegister Array
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    let loop = new Date(start);
                    while (loop <= end) {
                        CashRegisterArray.push({
                            name: User[0].firstName + ' ' + User[0].lastName,
                            dateOfCollection: loop,
                            collectionAmount: price.toFixed(3),
                            subscriptionName: name,
                            status: 'Pending'
                        })
                        let newDate = loop.setDate(loop.getDate() + 1);
                        loop = new Date(newDate);
                    }

                    //adding new subscription to db
                    //let noOfSubs += 1;
                    const subscription = await Subscriptions.create({ ...req.body, cashRegister: CashRegisterArray })

                    if (!subscription) {
                        throw new Error('Error!  Subscription Cannot Be Created ')
                    }

                    //calling User and storing productID to user subscription
                    const memberDataUpdated = await Members.findByIdAndUpdate(req.body.member, {$push : {"subscriptions" : subscription._id}} , {new: true})

                    return res.status(201).json({
                        subscription,
                        memberDataUpdated,
                        message: "*** Product Subscribed Successfully ***"
                    })
                }catch (error) {
                        console.log("Error in addNewSubscription and error is : ", error)
                    }
            }else{
                return res.json({
                    message: '*** This Agency or Operator or Member Does Not Exists ***'
                })
            }
        }
    }
}

// uodate Subscriptions Info Only
const updateSubscription = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExistSubs = await Subscriptions.findById(id)
        if (!isExistSubs) {
            return res.status(201).json({
                message: '*** Subscriptions Id is Incorrect ****'
            })
        } else {
            try {
                if(req.body.code){
                    return res.status(201).json({
                        message: '!!! Sorry! You can not Update Subscription Code !!!',
                    })
                }
                const updatedSubs = await Subscriptions.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedSubs,
                    message: '*** Subscriptions Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateSubscription and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete Subscription
const deleteSubscription = async (req, res) => {
    const {id} = req.params;
    try {
        const subsToBeDel = await Subscriptions.findById(id);
        if (subsToBeDel.balance < totAmt) {
            return res.json({ message: '*** You can not Delete this Subscription , as Member has to Pay some of his/her remaining Amount ****'});
        }else{
            const deletedSubscriptions = await Subscriptions.findByIdAndDelete(id);
            // removing Subscriptions from  agency's Subscriptions array
            await Members.findByIdAndUpdate(deletedSubscriptions.member, { $pull : { "subscriptions" : id }}, {new: true })
            if (!deletedSubscriptions) {
                return res.json({
                    message: '*** Subscriptions Not Found ****',
                });
            } else {
                return res.json({
                    deletedSubscriptions,
                    message: '*** Subscriptions SuccessFully Deleted ****',
                });
            }
        }
    } catch (error) {
        console.log("Error in deleteSubscription and error is : ", error)
    }
}

// get all Subscriptions
const getAllSubscriptions = async (req, res) => {
    try {
        const allSubscriptions = await Subscriptions.aggregate([
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'prodName'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
            },
        },
        // {
        //     $match: { agency : id }
        // }
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

// get all Subscriptions By Any Agency
const getAllSubsofAnyAgency = async (req, res) => {
    const {agencyId} = req.params;
    try {
        const allSubscriptions = await Subscriptions.aggregate([
        {
            $match: { agency : mongoose.Types.ObjectId(agencyId) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'prodName'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
            },
        },
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

// get all Subscriptions By Any Operator
const getAllSubsofAnyOpr = async (req, res) => {
    const {oprId} = req.params;
    try {
        const allSubscriptions = await Subscriptions.aggregate([
        {
            $match: { operator : mongoose.Types.ObjectId(oprId) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'prodName'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
            },
        },
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

// get all Subscriptions By Any Member
const getAllSubsofAnyMember = async (req, res) => {
    const {memberId} = req.params;
    try {
        const allSubscriptions = await Subscriptions.aggregate([
        {
            $match: { member : mongoose.Types.ObjectId(memberId) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'prodName'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
            },
        },
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
const getSingleSubs = async (req, res) => {
    const {id} = req.params;
    try {
        const allSubscriptions = await Subscriptions.aggregate([
        {
            $match: { _id : mongoose.Types.ObjectId(id) }
        },
        {
            $lookup:
            {
                from: 'fintechproducts',
                localField: 'prodName',
                foreignField: '_id',
                as: 'prodName'
            },
        },
        {
            $lookup:
            {
                from: 'fintechmembers',
                localField: 'member',
                foreignField: '_id',
                as: 'member'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'operator',
                foreignField: '_id',
                as: 'operator'
            },
        },
        {
            $lookup: {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
            },
        },
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

// this is sued to calculate price for subscription
// this function is clcluting no of days b/t starting and end date
async function PriceCalHandler(start, end, Amount) {

    let loop = new Date(start);
    let Total = 0
    while (loop <= end) {
        Total = Total + 1
        let newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);
    }
    return Number(Amount / Total);   // returning amount per day
}


module.exports = {
    addNewSubscription,
    updateSubscription,
    getAllSubscriptions,
    getAllSubsofAnyAgency,
    getAllSubsofAnyOpr,
    getAllSubsofAnyMember,
    getSingleSubs,
    deleteSubscription
}