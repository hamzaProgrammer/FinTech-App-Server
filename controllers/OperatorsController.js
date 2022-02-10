const Agencies = require('../models/AgencySchema')
const Operators = require('../models/OperatorsSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
var cloudinary = require('cloudinary').v2
const nodeMailer = require("nodemailer");
const mongoose = require("mongoose")

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});



// Sign Up Operator and also pushing it to agency Operators array
const addNewOperator = async (req, res) => {
    req.body.gender = 'male'
    console.log("req.bos6y : ", req.body)
    const { firstName, lastName , doB , city , email , password , phoneNo , gender , cnic , cnicExpiry , agency } = req.body;
    if (!firstName || !lastName || !doB || !city || !email || !password || !phoneNo || gender || !cnicExpiry || !agency) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Operators.find({
            email: email
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Operators Code Already Taken ***'
            })
        } else {
            // checking agency provided exists
            const agnecyCheck = await Agencies.find({_id: agency })
            if (agnecyCheck.length > 0 ) {
                req.body.password = await bcrypt.hash(password, 10); // hashing password

                // if (req.files.cnic) {
                //     await cloudinary.uploader.upload(req.files.cnic.tempFilePath, (err, res) => {
                //         req.body.cnic = res.url;
                //     })
                // }

                const newOperator = new Operators({...req.body})
                try {
                    const addedOperator = await newOperator.save();

                    // pushing newly added Operators Id into agency Operators array
                    const updatedAgency = await Agencies.findByIdAndUpdate(agency, { $push : { "operators" : addedOperator._id }}, {new: true })


                    // sending mail to user about his credientails

                    // step 01
                    const transport= nodeMailer.createTransport({
                        service : "gmail",
                        auth: {
                            user : process.env.myEmail, //own eamil
                            pass: process.env.myPassword, // own password
                        }
                    })
                    // setp 02
                    const mailOption = {
                        from: process.env.myEmail, // sender/own eamil
                        to: email, // reciver eamil
                        subject: "Crediantials For Logging in Fintech App",
                        text : `Dear Customer , your Email is  ${email} and Your password is ${password}.Please keep this Confidential or you may change your password at any time. Thanks`
                    }
                    // step 03
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log("Error occured : ", err)
                            return res.json({mesage : "**** Error in sending mail ***" , err})
                        } else {
                            console.log("Email Sent and info is : ", info.response)
                        }
                    })

                    res.status(201).json({
                        addedOperator,
                        updatedAgency,
                        message: '*** Operators SuccessFully Added and also Pushed to Agency Operators Array. Email to Operator also has been sent ***'
                    })
                } catch (error) {
                    console.log("Error in addNewOperator and error is : ", error)
                }
            }else{
                return res.json({
                    message: '*** This Agency Does Not Exists ***'
                })
            }
        }
    }
}

// Logging In Operator
const LogInOperator = async (req, res) => {
    const { email ,  password } = req.body

        if(!email  || !password){
            return res.json({mesage : "**** Please fill Required Credientials ***"})
        }else {
            try {
                const isOprExists = await Operators.findOne({email: email});

                if(!isOprExists){
                    return res.json({ message: "*** Operator Not Found ***"})
                }
                    const isPasswordCorrect = await bcrypt.compare(password, isOprExists.password); // comparing password
                    if (!isPasswordCorrect) {
                        return res.json({
                            message: '*** Invalid Credientials ***'
                        })
                    }

                    const token = jwt.sign({id: isOprExists._id} , JWT_SECRET_KEY , {expiresIn: '24h'}); // gentating token

                    return res.json({
                        myResult: isOprExists,
                        message: '*** Operator Signed In SuccessFully ****',
                        token
                    });
            } catch (error) {
                console.log("Error in LogInOperator and error is : ", error)
            }
        }

}

// sending mails
const sendMail = async(req,res) => {
    const {email} = req.params;
    const data = await Operators.find({email: email});
    if(data){
        const curntDateTime = new Date();
        let randomNo = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        await Operators.findOneAndUpdate({email : email}, { $set: {...data ,  mailSentTime : curntDateTime , otpCode : randomNo } }, {new: true })

        // step 01
        const transport= nodeMailer.createTransport({
            service : "gmail",
            auth: {
                user : process.env.myEmail, //own eamil
                pass: process.env.myPassword, // own password
            }
        })
        // setp 02
        const mailOption = {
            from: process.env.myEmail, // sender/own eamil
            to: email, // reciver eamil
            subject: "Secret Code Changing in Fintech App Operator Password",
            text : `Dear Operator , Your Secret Code is ${randomNo}. This will expire in next 60 seconds .`
        }
        // step 03
        transport.sendMail(mailOption, (err, info) => {
            if (err) {
                console.log("Error occured : ", err)
                return res.json({mesage : "**** Error in sending mail ***" , err})
            } else {
                console.log("Email Sent and info is : ", info.response)
                return res.json({ message: '*** Email Sent SuccessFully ***' })
            }
        })
    }else{
        return res.json({mesage : "**** Email Not Found ***"})
    }
}

// Checking OtpCode
const checkOtpCode = async (req, res) => {
    const {email} = req.params;
    const data = await Operators.find({email : email});
    const {otpCode } = req.body;
    if (data){
        let curntDateTime = new Date();
        let diff = new Date(curntDateTime.getTime() - data[0].mailSentTime.getTime()) / 1000; //  getting time diff in seconds
        parseInt(diff)
        if (diff < 60) {  // checking if sent time is less than 60 seconds
                try{
                    if(otpCode == data[0].otpCode){
                        const update = await Drivers.findOneAndUpdate({email: email}  ,{ $set: { ...data.body , mailSentTime : null , otpCode : null }} , {new: true} )

                        if(update){
                            return res.status(201).json({update , message: '*** Driver OtpCode Matched SuccessFully ***'})
                        }
                    }else{
                        return res.status(201).json({message: '***  InValid Token  ***'})
                    }
                }catch (error) {
                    console.log("Error is :", error)
                    return res.status(201).json({ message: '!!! Opps An Error Occured !!!' , error})
                }
            }else{
                return res.status(201).json({ message: '!!! Time for Your Token Expired !!!' })
            }
        }else{
            return res.status(201).json({ message: '!!! InValid Credinatials !!!' })
        }
}


// uodate Operator  password only
const updateOperatorPass = async (req, res) => {
    const {
        email
    } = req.params
    if (!email) {
        return res.status(201).json({
            message: '*** Email is Required for Updation ****'
        })
    } else {
        const isExist = await Operators.findOne({
            email: email
        })
        if (!isExist) {
            return res.status(201).json({
                message: '*** Email is Incorrect ****'
            })
        } else {
            try {
                if (req.body.password) {
                    req.body.password = await bcrypt.hash(req.body.password, 10); // hashing password
                }

                const updatedUser = await Operators.findOneAndUpdate({
                    email: email
                }, {
                    $set: req.body
                }, {
                    new: true
                })

                res.status(201).json({
                    updatedUser,
                    message: '*** Operator Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateOperatorPass and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}


// uodate Operators Info Only
const updateOperator = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExistOpr = await Operators.findById(id)
        if (!isExistOpr) {
            return res.status(201).json({
                message: '*** Operators Id is Incorrect ****'
            })
        } else {
            let updatedAgency, newAgencyId;
            try {
                if(req.body.agency){
                    if (req.body.agency[0]) {
                        newAgencyId = req.body.agency[0]._id;
                    } else {
                        newAgencyId = req.body.agency._id;
                    }
                    if (req.body.agency !== isExistOpr.agency){
                        // removing Operators from prevoise agency
                        await Agencies.find({_id: isExistOpr.agency })
                        await Agencies.findByIdAndUpdate(isExistOpr.agency, { $pull : { "operators" : id }}, {new: true })

                        // now pushing into new agency Operators array
                        await Agencies.find({_id: newAgencyId })
                        updatedAgency = await Agencies.findByIdAndUpdate(newAgencyId, { $push : { "operators" : id }}, {new: true });

                        req.body.agency = newAgencyId;
                    }
                }
                // if (req.files.cnic) {
                //     await cloudinary.uploader.upload(req.files.cnic.tempFilePath, (err, res) => {
                //         req.body.cnic = res.url;
                //     })
                // }

                const updatedUser = await Operators.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    updatedAgency,
                    message: '*** Operators Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateOperator and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// uodate Operators Picture Only
const updateOperatorPic = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExistOpr = await Operators.findById(id)
        if (!isExistOpr) {
            return res.status(201).json({
                message: '*** Operators Id is Incorrect ****'
            })
        } else {
            let updatedAgency;
            try {
                if (req.files.cnic) {
                    await cloudinary.uploader.upload(req.files.cnic.tempFilePath, (err, res) => {
                        req.body.cnic = res.url;
                    })
                }

                const updatedUser = await Operators.findByIdAndUpdate(id, {
                    $set: {...req.body}
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    updatedAgency,
                    message: '*** Operators Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateOperatorPic and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete Operator
const deleteOperator = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const deletedOperators = await Operators.findByIdAndDelete(id);
        // removing Operators from  agency's Operators array
        await Agencies.find({_id: deletedOperators.agency })
        await Agencies.findByIdAndUpdate(deletedOperators.agency, { $pull : { "operators" : id }}, {new: true })
        if (!deletedOperators) {
            return res.json({
                message: '*** Operators Not Found ****',
            });
        } else {
            return res.json({
                deletedOperators,
                message: '*** Operators SuccessFully Deleted ****',
            });
        }
    } catch (error) {
        console.log("Error in deleteOperator and error is : ", error)
    }
}

// get all Operators
const getAllOperators = async (req, res) => {
    try {
        const allOperators = await Operators.aggregate([
        {
            $lookup:
            {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
            },
        },
        // {
        //     $lookup:
        //     {
        //         from: 'fintechmembers',
        //         localField: 'members',
        //         foreignField: '_id',
        //         as: 'members'
        //     },
        // },

    ])
        if (!allOperators) {
            return res.json({
                message: '*** No Operators Found ****',
            });
        } else {
            return res.json({
                allOperators,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllOperators and error is : ", error)
    }
}

// get Single Operators
const getSingleOperator = async (req, res) => {
    const {id} = req.params;
    try {
        const singleOperator = await Operators.aggregate([
            {
            $match: { _id : mongoose.Types.ObjectId(id) }
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
            //     $lookup:
            //     {
            //         from: 'fintechmembers',
            //         localField: 'members',
            //         foreignField: '_id',
            //         as: 'members'
            //     },
            // },

        ]);

        if (!singleOperator) {
            return res.json({
                message: '*** No Agency Found ****',
            });
        } else {
            return res.json({
                singleOperator,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getSingleOperator and error is : ", error)
    }
}

module.exports = {
    addNewOperator,
    LogInOperator,
    sendMail,
    checkOtpCode,
    updateOperatorPass,
    updateOperator,
    updateOperatorPic,
    getAllOperators,
    getSingleOperator,
    deleteOperator
}