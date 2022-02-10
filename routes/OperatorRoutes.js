const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/OperatorsController')


// Add Operator
router.post('/api/operator/addNew', addNewOperator)

// Sign In Operator
router.post('/api/operator/signIn', LogInOperator)

// Send Mail
router.post('/api/operator/checkMailExists/:email', sendMail)

// Checking Otp Code
router.put('/api/operator/checkOtpCode/:email', checkOtpCode)

// Change password
router.put('/api/operator/changePassword/:email', updateOperatorPass)

// updating Operator Account
router.put('/api/operator/updateOperator/:id', updateOperator);

// updating Operator Profile Pic Only
router.put('/api/operator/updateOperatorPic/:id', updateOperatorPic);

// Delete Operator
router.delete('/api/operator/deleteOpr/:id', deleteOperator)

// get all Operators
router.get('/api/operators/getAll', getAllOperators)

// get single Operator
router.get('/api/operators/getSingleOpr/:id', getSingleOperator)


module.exports = router;