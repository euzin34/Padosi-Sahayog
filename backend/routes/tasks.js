const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Protected
 */
router.post(
    '/',
    verifyToken,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
        body('category').optional().trim()
    ],
    handleValidationErrors,
    createTask
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with pagination
 * @access  Public
 */
router.get('/', getAllTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Public
 */
router.get('/:id', getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Protected (owner only)
 */
router.put(
    '/:id',
    verifyToken,
    [
        body('title').optional().trim(),
        body('description').optional().trim(),
        body('location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        body('location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
        body('category').optional().trim(),
        body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status')
    ],
    handleValidationErrors,
    updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Protected (owner only)
 */
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
