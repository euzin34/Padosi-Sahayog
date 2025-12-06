const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController'); // Ensure controller exists
const auth = require('../middleware/auth'); // Optional: Protect route

// Get all nearby requests
// router.get('/', auth.verifyToken, mapController.getNearbyRequests);
// For easier testing without token for now:
router.get('/', mapController.getNearbyRequests);

module.exports = router;
