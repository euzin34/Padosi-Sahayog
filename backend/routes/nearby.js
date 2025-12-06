const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { getNearbyTasks } = require('../controllers/nearbyController');

/**
 * @route   GET /api/tasks/nearby
 * @desc    Get nearby tasks sorted by distance
 * @access  Public
 * @query   latitude (required) - User's latitude
 * @query   longitude (required) - User's longitude
 * @query   limit (optional) - Number of results per page (default: 10, max: 100)
 * @query   page (optional) - Page number (default: 1)
 * @query   category (optional) - Filter by category
 * @query   unit (optional) - Distance unit 'km' or 'm' (default: 'km')
 */
router.get(
    '/nearby',
    [
        query('latitude').notEmpty().withMessage('Latitude is required')
            .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        query('longitude').notEmpty().withMessage('Longitude is required')
            .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
        query('category').optional().trim(),
        query('unit').optional().isIn(['km', 'm']).withMessage('Unit must be km or m')
    ],
    handleValidationErrors,
    getNearbyTasks
);

module.exports = router;
