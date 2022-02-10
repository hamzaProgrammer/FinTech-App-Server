const express = require('express');
const router = express.Router();
const {
    addNewSubscription,
    updateSubscription,
    getAllSubscriptions,
    getAllSubsofAnyAgency,
    getAllSubsofAnyOpr,
    getAllSubsofAnyMember,
    getSingleSubs,
    deleteSubscription
} = require('../controllers/SubscriptionsController')


// Add Subscription
router.post('/api/subscription/addNew', addNewSubscription)

// updating Subscription
router.put('/api/subscription/updateSubscription/:id', updateSubscription);

// Delete Subscription
router.delete('/api/subscription/deleteSubscription/:id', deleteSubscription)

// get all Subscriptions
router.get('/api/subscription/getAllSubs', getAllSubscriptions)

// get all Subscriptions of any Agency
router.get('/api/subscription/getAllSubsByAgcy/:agencyId', getAllSubsofAnyAgency)

// get all Subscriptions of any Operator
router.get('/api/subscription/getAllSubsByOpr/:oprId', getAllSubsofAnyOpr)

// get all Subscriptions of any Member
router.get('/api/subscription/getAllSubsByMem/:memberId', getAllSubsofAnyMember)

// get single Subscription
router.get('/api/subscription/getSingleSubs/:id', getSingleSubs)


module.exports = router;