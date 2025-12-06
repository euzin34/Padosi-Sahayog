const express = require('express');
const { query } = require('express-validator');
const { getNearbyTasks } = require('../controllers/nearbyController');
const { handleValidationErrors } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Optional authentication middleware
 * Attaches user info if token is provided, but doesn't fail if missing
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // If token is provided, verify it
            await verifyToken(req, res, next);
        } else {
            // No token provided, continue without user info
            next();
        }
    } catch (error) {
        // Token verification failed, continue without user info
        next();
    }
};

/**
 * @route   GET /api/tasks/nearby
 * @desc    Get nearby tasks sorted by distance
 * @access  Public (optional authentication)
 * @note    If authenticated, uses user's saved location from profile
 *          Otherwise, requires latitude/longitude query parameters
 */
router.get(
    '/nearby',
    optionalAuth, // Try to authenticate, but don't require it
    [
        // Make coordinates optional - will use user profile location if authenticated
        query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
        query('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
        query('category').optional().trim(),
        query('unit').optional().isIn(['km', 'm']).withMessage('Unit must be km or m')
    ],
    handleValidationErrors,
    getNearbyTasks
);

module.exports = router;
