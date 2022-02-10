const Agencies = require('../models/AgencySchema')
const mongoose = require("mongoose")


// Adding  Agencies
const addNewAgency = async (req, res) => {
    const {
        label,
        code
    } = req.body;
    if (!label || !code) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Agencies.find({
            code: code
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Agency Code Already Taken ***'
            })
        } else {
            let codeLength = code.toString().length;
            if (codeLength <= 4){
                const newAgency = new Agencies({
                    ...req.body,
                })
                try {
                    const addedAgency = await newAgency.save();
    
                    res.status(201).json({
                        addedAgency,
                        message: '*** Agency SuccessFully Added ***'
                    })
                } catch (error) {
                    console.log("Error in addNewAgency and error is : ", error)
                }
            } else{
                return res.json({
                    message: '*** Agency Code Must be of 4 Digits Only ***'
                })
            }
        }
    }
}

// uodate Agency
const updateAgency = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExist = await Agencies.findById(id)
        if (!isExist) {
            return res.status(201).json({
                message: '*** Agency Id is Incorrect ****'
            })
        } else {
            try {
                const updatedUser = await Agencies.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    message: '*** Agency Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateAgency and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete my account
const deleteAgency = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const singleAgency = await Agencies.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(id)
            }
        }, 
        {
            $lookup:
            {
                from: 'CashRegisterAgencies',
                localField: 'CashRegister',
                foreignField: '_id',
                as: 'CashRegister'
            },
        },
        {
            $lookup:
            {
                from: 'products',
                localField: 'Products',
                foreignField: '_id',
                as: 'Products'
            },
        },
        {
            $lookup:
            {
                from: 'operators',
                localField: 'Operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup:
            {
                from: 'agencies',
                localField: 'Agency',
                foreignField: '_id',
                as: 'Agency'
            },
        },
        {
            $lookup:
            {
                from: 'members',
                localField: 'Member',
                foreignField: '_id',
                as: 'Member'
            },
        },
    ]);

        if (singleAgency.length < 0) {
            return res.json({ message: '*** Sorry! Agency Not Found ****' });
        }
        if (singleAgency[0].products.length > 0) {
            return res.json({ message: '*** Sorry! Agency Can Not be Deelted as It Has Some Products Related to this. Please Delete That Products first. Thanks ****' });
        }
        if (singleAgency[0].operators.length > 0) {
            return res.json({ message: '*** Sorry! Agency Can Not be Deelted as It Has Some Operators Related to this. Please Delete That Products first. Thanks ****' });
        }
        if (singleAgency[0].members.length > 0) {
            return res.json({ message: '*** Sorry! Agency Can Not be Deelted as It Has Some Members Related to this. Please Delete That Products first. Thanks ****' });
        }
        if (singleAgency[0].cashRegister.length > 0) {
            return res.json({ message: '*** Sorry! Agency Can Not be Deelted as It Has Some Cash Register Related to this. Please Delete That Products first. Thanks ****' });
        }
        const deletedAgency = await Agencies.findByIdAndDelete(id)
        if (deletedAgency){
            return res.json({
                singleAgency,
                message: '*** Agency SuccessFully Deleted ****',
            });
        }else{
            return res.json({
                message: '*** Opps! Some Error Occured. ****',
            });
        }
    } catch (error) {
        console.log("Error in deleteAgency and error is : ", error)
    }
}

// get all Agencies
const getAllAgencies = async (req, res) => {
    try {
        const allAgencies = await Agencies.find();
        if (!allAgencies) {
            return res.json({
                message: '*** No Agencies Found ****',
            });
        } else {
            return res.json({
                allAgencies,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllAgencies and error is : ", error)
    }
}

// get all Agencies Count
const getAllAgenciesCount = async (req, res) => {
    try {
        const count = await Agencies.find({}).count();
        if (!count) {
            return res.json({
                message: '*** No Agencies Found ****',
            });
        } else {
            return res.json({
                count,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllAgenciesCount and error is : ", error)
    }
}


// get Single Agency
const getSingleAgency = async (req, res) => {
    const {id} = req.params;
    try {
        const singleAgency = await Agencies.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup:
            {
                from: 'CashRegisterAgencies',
                localField: 'CashRegister',
                foreignField: '_id',
                as: 'CashRegister'
            },
        },
        {
            $lookup:
            {
                from: 'products',
                localField: 'Products',
                foreignField: '_id',
                as: 'Products'
            },
        },
        {
            $lookup:
            {
                from: 'operators',
                localField: 'Operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },
        {
            $lookup:
            {
                from: 'agencies',
                localField: 'Agency',
                foreignField: '_id',
                as: 'Agency'
            },
        },
        {
            $lookup:
            {
                from: 'members',
                localField: 'Member',
                foreignField: '_id',
                as: 'Member'
            },
        },

    ])
        if (!singleAgency) {
            return res.json({
                message: '*** No Agency Found ****',
            });
        } else {
            return res.json({
                singleAgency,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getSingleAgency and error is : ", error)
    }
}

module.exports = {
    addNewAgency,
    updateAgency,
    deleteAgency,
    getAllAgencies,
    getSingleAgency,
    getAllAgenciesCount
}