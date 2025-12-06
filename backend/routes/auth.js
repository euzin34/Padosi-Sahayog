const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
    register,
    login,
    getProfile,
    updateProfile
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('displayName').optional().trim(),
        body('phoneNumber').optional().trim()
    ],
    handleValidationErrors,
    register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and capture location
 * @access  Protected (requires Firebase ID token)
 */
router.post(
    '/login',
    verifyToken,
    [
        body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
    ],
    handleValidationErrors,
    login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Protected
 */
router.get('/profile', verifyToken, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Protected
 */
router.put(
    '/profile',
    verifyToken,
    [
        body('displayName').optional().trim(),
        body('phoneNumber').optional().trim(),
        body('location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        body('location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
    ],
    handleValidationErrors,
    updateProfile
);

module.exports = router;
