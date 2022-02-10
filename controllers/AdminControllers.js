const Admin = require('../models/AdminSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// signin Up Admin
const addNewAdmin = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    if (!email || !password) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Admin.find({
            email: email
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Email Already taken ***'
            })
        } else {
            const hashedPassword = await bcrypt.hash(password, 10); // hashing password

            const newAdmin = new Admin({
                ...req.body,
                password: hashedPassword
            })
            try {
                const addedAdmin = await newAdmin.save();

                res.status(201).json({
                    addedAdmin,
                    message: '*** Admin SuccessFully Added ***'
                })
            } catch (error) {
                console.log("Error in addNewAdmin and error is : ", error)
            }
        }
    }
}

// Logging In
const LogInAdmin = async (req, res) => {
    const {
        email,
        password
    } = req.body
    if (!email || !password) {
        return res.json({
            mesage: "**** Please fill Required Credientials ***"
        })
    } else {
        try {
            const isAdminExists = await Admin.findOne({
                email: email
            });

            if (!isAdminExists) {
                return res.json({
                    message: "*** Admin Not Found ***"
                })
            }

            const isPasswordCorrect = await bcrypt.compare(password, isAdminExists.password); // comparing password
            if (!isPasswordCorrect) {
                return res.json({
                    message: '*** Invalid Credientials ***'
                })
            }

            const token = jwt.sign({
                id: isAdminExists._id
            }, JWT_SECRET_KEY, {
                expiresIn: '24h'
            }); // gentating token

            return res.json({
                myResult: isAdminExists,
                message: '*** Admin Signed In SuccessFully ****',
                token
            });
        } catch (error) {
            console.log("Error in LogInAdmin and error is : ", error)
        }
    }

}

// uodate Admin
const updateAdmin = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExist = await Admin.findById(id)
        if (!isExist) {
            return res.status(201).json({
                message: '*** Admin Id is Incorrect ****'
            })
        } else {
            try {
                if (req.body.password){
                    req.body.password = await bcrypt.hash(password, 10); // hashing password
                }
                const updatedUser = await Admin.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    message: '*** Admin Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateAdmin and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete my account
const deleteAdmin = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const deletedAdmin = await Admin.findByIdAndDelete(id);
        if (!deletedAdmin) {
            return res.json({
                message: '*** Admin Account Not Found ****',
            });
        } else {
            return res.json({
                deletedAdmin,
                message: '*** Admin Account SuccessFully Deleted ****',
            });
        }
    } catch (error) {
        console.log("Error in deleteAdmin and error is : ", error)
    }
}

// get all Admin
const getAllAdmin = async (req, res) => {
    try {
        const allAdmin = await Admin.find();
        if (!allAdmin) {
            return res.json({
                message: '*** No Admin or Cutsomer Found ****',
            });
        } else {
            return res.json({
                allAdmin,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllAdmin and error is : ", error)
    }
}


module.exports = {
    addNewAdmin,
    LogInAdmin,
    updateAdmin,
    deleteAdmin,
    getAllAdmin
}