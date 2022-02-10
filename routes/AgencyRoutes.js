const express = require('express');
const router = express.Router();
const {
    addNewAgency,
    updateAgency,
    deleteAgency,
    getAllAgencies,
    getSingleAgency,
    getAllAgenciesCount
} = require('../controllers/AgencyController')


// Add Agency
router.post('/api/agency/addNew', addNewAgency)

// updating Agency Account
router.put('/api/agency/updateAgency/:id', updateAgency);

// Delete Agency
router.delete('/api/agency/deleteAgency/:id', deleteAgency)

// get all Agencies
router.get('/api/agency/getAllAgencies', getAllAgencies)

// get all Agencies Count
router.get('/api/agency/getAllAgencies/count', getAllAgenciesCount)

// get single Agency
router.get('/api/agency/getSingleAgency/:id', getSingleAgency)


module.exports = router;