const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/MemberController')


// Add Member
router.post('/api/member/addNew', addNewMember)

// Sign In Member
router.post('/api/member/signIn', LogInMember)

// Send Mail
router.post('/api/member/checkMailExists/:email', sendMail)

// Checking Otp Code
router.put('/api/member/checkOtpCode/:email', checkOtpCode)

// Change password
router.put('/api/member/changePassword/:email', updateMemberPass)

// updating Member Account
router.put('/api/member/updateMember/:id', updateMember);

// updating Member Profile Pic Only
router.put('/api/member/updateMemberPic/:id', updateMemberPic);

// Delete Member
router.delete('/api/member/deleteOpr/:id', deleteMember)

// get all Members
router.get('/api/Members/getAll', getAllMembers)

// get all Members Cont
router.get('/api/Members/getAll/count', getAllMemberCount)

// get single Member
router.get('/api/Members/getSingleOpr/:id', getSingleMember)


module.exports = router;