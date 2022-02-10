const express = require('express');
const router = express.Router();
const {
    addNewAdmin,
    LogInAdmin,
    updateAdmin,
    deleteAdmin
} = require('../controllers/AdminControllers')


// Sign Up Admin
router.post('/api/admin/register', addNewAdmin)

// Sign In Admin
router.post('/api/admin/signin', LogInAdmin)

// updating Admin Account
router.put('/api/admin/updateAdmin/:id', updateAdmin);

// Delete Admin
router.delete('/api/admin/deleteAdmin/:id', deleteAdmin)

// get all admins
// router.post('/api/cutomer/checkEmailExists', sendMail)


module.exports = router;