const express = require('express');

const router = express.Router();

const {
    getResources,
    createResource,
    loadResource,
    updateResource,
    updateResourceStatus
} = require('../controllers/resources.controller');

const {
    requireOwnership
} = require('../middleware/authorize');


// ======================================================
// STEP 1
// GET /api/resources
// Public
// ======================================================

router.get(
    '/',
    getResources
);


// ======================================================
// STEP 2
// POST /api/resources
// Authenticated
// ======================================================

router.post(
    '/',
    createResource
);


// ======================================================
// STEP 3
// PUT /api/resources/:id
// Owner or Admin
// ======================================================

router.put(
    '/:id',
    loadResource,
    requireOwnership(
        req => req.resource.providerId
    ),
    updateResource
);


// ======================================================
// STEP 4
// PUT /api/resources/:id/status
// Owner or Admin
// ======================================================

router.put(
    '/:id/status',
    loadResource,
    requireOwnership(
        req => req.resource.providerId
    ),
    updateResourceStatus
);

router.delete(
    '/:id',
    loadResource,
    requireOwnership(
        req => req.resource.providerId
    ),
    deleteResource
);

module.exports = router;