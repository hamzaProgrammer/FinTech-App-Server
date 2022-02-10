const Agencies = require('../models/AgencySchema')
const Operators = require('../models/OperatorsSchema')
const Members = require('../models/MemberSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
var cloudinary = require('cloudinary').v2
const nodeMailer = require("nodemailer");

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});



// Sign Up Member and also pushing it to agency Members array and opertaor array
const addNewMember = async (req, res) => {
    const { firstName, lastName , doB , city , email , password , phoneNo , gender , cnic , cnicExpiry , agency , operator } = req.body;
    if (!firstName || !lastName || !doB || !city || !email || !password || !phoneNo || !gender || !cnicExpiry || !agency  || !operator) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Members.find({
            email: email
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Members Code Already Taken ***'
            })
        } else {
            // checking agency provided exists
            const agnecyCheck = await Agencies.find({_id: agency })
            const oprCheck = await Operators.find({_id: operator })
            if (agnecyCheck.length > 0 && oprCheck.length > 0 ) {
                req.body.password = await bcrypt.hash(password, 10); // hashing password

                if (req.files.cnic) {
                    await cloudinary.uploader.upload(req.files.cnic.tempFilePath, (err, res) => {
                        req.body.cnic = res.url;
                    })
                }

                const newMember = new Members({...req.body})
                try {
                    const addedMember = await newMember.save();

                    // pushing newly added Members Id into agency Members array
                    const updatedAgency = await Agencies.findByIdAndUpdate(agency, { $push : { "members" : addedMember._id }}, {new: true })
                    const updatedOpr = await Operators.findByIdAndUpdate(operator, { $push : { "members" : addedMember._id }}, {new: true })


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
                        addedMember,
                        updatedAgency,
                        updatedOpr,
                        message: '*** Members SuccessFully Added and also Pushed to Agency Members Array as well as Operators MMbers Array. Email to Member also has been sent to Mmber For Login Credantials***'
                    })
                } catch (error) {
                    console.log("Error in addNewMember and error is : ", error)
                }
            }else{
                return res.json({
                    message: '*** This Agency or Operator Does Not Exists ***'
                })
            }
        }
    }
}

// Logging In Member
const LogInMember = async (req, res) => {
    const { email ,  password } = req.body

        if(!email  || !password){
            return res.json({mesage : "**** Please fill Required Credientials ***"})
        }else {
            try {
                const isOprExists = await Members.findOne({email: email});

                if(!isOprExists){
                    return res.json({ message: "*** Member Not Found ***"})
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
                        message: '*** Member Signed In SuccessFully ****',
                        token
                    });
            } catch (error) {
                console.log("Error in LogInMember and error is : ", error)
            }
        }

}

// sending mails
const sendMail = async(req,res) => {
    const {email} = req.params;
    const data = await Members.find({email: email});
    if(data){
        const curntDateTime = new Date();
        let randomNo = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        await Members.findOneAndUpdate({email : email}, { $set: {...data ,  mailSentTime : curntDateTime , otpCode : randomNo } }, {new: true })

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
            subject: "Secret Code Changing in Fintech App Member Password",
            text : `Dear Member , Your Secret Code is ${randomNo}. This will expire in next 60 seconds .`
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
    const data = await Members.find({email : email});
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


// uodate Member  password only
const updateMemberPass = async (req, res) => {
    const {
        email
    } = req.params
    if (!email) {
        return res.status(201).json({
            message: '*** Email is Required for Updation ****'
        })
    } else {
        const isExist = await Members.findOne({
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

                const updatedUser = await Members.findOneAndUpdate({
                    email: email
                }, {
                    $set: req.body
                }, {
                    new: true
                })

                res.status(201).json({
                    updatedUser,
                    message: '*** Member Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateMemberPass and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}


// uodate Members Info Only
const updateMember = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExistMember = await Members.findById(id)
        if (!isExistMember) {
            return res.status(201).json({
                message: '*** Members Id is Incorrect ****'
            })
        } else {
            let updatedAgency, updatedOpr;
            try {
                // if agency is changed
                if(req.body.agency){
                    if (req.body.agency !== isExistMember.agency){
                        // removing Members from prevoise agency
                        await Agencies.find({_id: isExistMember.agency })
                        await Agencies.findByIdAndUpdate(isExistMember.agency, { $pull : { "members": id }}, {new: true })

                        // now pushing into new agency Members array
                        await Agencies.find({_id: req.body.agency })
                        updatedAgency = await Agencies.findByIdAndUpdate(req.body.agency, { $push : { "members": id }}, {new: true })
                    }
                }
                // if operator is changed
                if(req.body.operator){
                    if (req.body.operator !== isExistMember.operator) {
                        // removing Members from prevoise agency
                        await Operators.find({_id: isExistMember.operator })
                        await Operators.findByIdAndUpdate(isExistMember.operator, { $pull : { "members": id }}, {new: true })

                        // now pushing into new agency Members array
                        await Operators.find({_id: req.body.agency })
                        updatedOpr = await Operators.findByIdAndUpdate(req.body.operator, { $push : { "members": id }}, {new: true })
                    }
                }

                const updatedMember = await Members.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedMember,
                    updatedAgency,
                    updatedOpr,
                    message: '*** Members Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateMember and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// uodate Members Picture Only
const updateMemberPic = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExistMember = await Members.findById(id)
        if (!isExistOpr) {
            return res.status(201).json({
                message: '*** Members Id is Incorrect ****'
            })
        } else {
            let updatedAgency;
            try {
                if (req.files.cnic) {
                    await cloudinary.uploader.upload(req.files.cnic.tempFilePath, (err, res) => {
                        req.body.cnic = res.url;
                    })
                }

                const updatedUser = await Members.findByIdAndUpdate(id, {
                    $set: {...req.body}
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    updatedAgency,
                    message: '*** Members Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateMemberPic and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete Member
const deleteMember = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const gotMember = await Members.findById(id);
        if (!gotMember){
            return res.status(201).json({ message: "*** No Collection Found  ***" })
        }else{
            let gotSubs;
            let cDate = new Date();
            gotSubs = await Subscriptions.find({member : gotMember._id })
            let index = false;
            gotSubs[0].cashRegister.map((x,ind)=>{
                if (x.dateOfCollection >= cDate )
                {
                    if (index === false){
                        index = true
                    }
                    if (x.dateOfCollection === cDate && x.status === "Collected") {
                            index = false;
                    }
                }
            })

            if(index === true){
                return res.status(201).json({ message: "*** Sorry! Member can not be Deleted as it has to Pay for Any Running Subcription. Thanks ***" })
            }

            const deletedMembers = await Members.findByIdAndDelete(id);
            // removing Members from  agency's Members array
            await Agencies.find({_id: deletedMembers.agency })
            await Agencies.findByIdAndUpdate(deletedMembers.agency, { $pull : { "members" : id }}, {new: true })

            // removing Members from  Operator's Members array
            await Operators.find({_id: deletedMembers.operator })
            await Operators.findByIdAndUpdate(deletedMembers.operator, { $pull : { "members" : id }}, {new: true })
            if (!deletedMembers) {
                return res.json({
                    message: '*** Members Not Found ****',
                });
            } else {
                return res.json({
                    deletedMembers,
                    message: '*** Members SuccessFully Deleted ****',
                });
            }
        }
    } catch (error) {
        console.log("Error in deleteMember and error is : ", error)
    }
}

// get all Members
const getAllMembers = async (req, res) => {
    try {
        const allMembers = await Members.aggregate([
        {
            $lookup:
            {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
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
    ])
        if (!allMembers) {
            return res.json({
                message: '*** No Members Found ****',
            });
        } else {
            return res.json({
                allMembers,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllMembers and error is : ", error)
    }
}

// get Single Members
const getSingleMember = async (req, res) => {
    const {id} = req.params;
    try {
        const singleMember = await Members.aggregate([
            {
            $match: {
                _id: mongoose.Types.ObjectId(id)
            }
        },
            {
                $lookup: {
                    from: 'fintechagencies',
                    localField: 'agency',
                    foreignField: '_id',
                    as: 'agency'
                },
            },
            {
                $lookup: {
                    from: 'fintechoperators',
                    localField: 'operator',
                    foreignField: '_id',
                    as: 'operator'
                },
            },
        ]);

        if (!singleMember) {
            return res.json({
                message: '*** No Agency Found ****',
            });
        } else {
            return res.json({
                singleMember,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getSingleMember and error is : ", error)
    }
}


// get all Agencies Count
const getAllMemberCount = async (req, res) => {
    try {
        const count = await Members.find({}).count();
        if (!count) {
            return res.json({
                message: '*** No Members Found ****',
            });
        } else {
            return res.json({
                count,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllMemberCount and error is : ", error)
    }
}

module.exports = {
    addNewMember,
    LogInMember,
    sendMail,
    checkOtpCode,
    updateMemberPass,
    updateMember,
    updateMemberPic,
    getAllMembers,
    getSingleMember,
    deleteMember,
    getAllMemberCount
}