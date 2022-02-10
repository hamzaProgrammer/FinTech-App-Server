const express = require('express');
const router = express.Router();
const {
    addNewCollection,
    getAllCollections,
    getAllCollectofAnyAgency,
    getAllCollectofAnyOpr,
    getAllCollectofAnyMember,
    getSingleCollection,
    deleteCollection,
    updateCollection,
    getAllCollectByDateRange
} = require('../controllers/CollectionsController')


// Add Collection
router.post('/api/collection/addNew', addNewCollection)

// Update Collection
router.put('/api/collection/updateCollection/:id', updateCollection)

// Delete Collection
router.delete('/api/collection/deleteCollection/:id', deleteCollection)

// get all Collections
router.get('/api/collection/getAll', getAllCollections)

// get all Collections of any Agency
router.get('/api/collection/getAllCollectByAgcy/:agencyId', getAllCollectofAnyAgency)

// get all Collections of any Operator
router.get('/api/collection/getAllCollectByOpr/:oprId', getAllCollectofAnyOpr)

// get all Collections of any Member
router.get('/api/collection/getAllCollectByMem/:memberId', getAllCollectofAnyMember)

// get all Collections By date range
router.get('/api/collection/getAllByDateRange', getAllCollectByDateRange)

// get single Subscription
router.get('/api/collection/getSingleSubs/:id', getSingleCollection)


module.exports = router;