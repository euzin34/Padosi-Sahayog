const storage = require('../utils/storage');
const { isValidCoordinates } = require('../utils/distance');

/**
 * Create a new task listing
 */
const createTaskHandler = async (req, res) => {
    try {
        const { title, description, location, category } = req.body;
        const uid = req.user.uid;

        // Validate required fields
        if (!title || !description || !location) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, and location are required'
            });
        }

        // Validate location coordinates
        if (!isValidCoordinates(location.latitude, location.longitude)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid location coordinates'
            });
        }

        // Create task using storage
        const task = storage.createTask({
            title,
            description,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            category: category || 'general',
            createdBy: uid
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task'
        });
    }
};

/**
 * Get all tasks with pagination
 */
const getAllTasksHandler = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status = 'active' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Validate pagination parameters
        if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                error: 'Invalid pagination parameters'
            });
        }

        // Get tasks from storage with filters
        const allTasks = storage.getAllTasks({ status, category });
        const totalTasks = allTasks.length;

        // Apply pagination
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedTasks = allTasks.slice(startIndex, startIndex + limitNum);

        res.json({
            success: true,
            data: {
                tasks: paginatedTasks,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalTasks,
                    totalPages: Math.ceil(totalTasks / limitNum)
                }
            }
        });
    } catch (error) {
        console.error('Get all tasks error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get tasks'
        });
    }
};

/**
 * Get task by ID
 */
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = storage.getTask(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get task'
        });
    }
};

/**
 * Update task (owner only)
 */
const updateTaskHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, category, status } = req.body;
        const uid = req.user.uid;

        // Get existing task
        const task = storage.getTask(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        // Check ownership
        if (task.createdBy !== uid) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to update this task'
            });
        }

        // Build updates object
        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (category !== undefined) updates.category = category;
        if (status !== undefined) updates.status = status;

        if (location && location.latitude !== undefined && location.longitude !== undefined) {
            if (!isValidCoordinates(location.latitude, location.longitude)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid location coordinates'
                });
            }
            updates.location = {
                latitude: location.latitude,
                longitude: location.longitude
            };
        }

        // Update task
        const updatedTask = storage.updateTask(id, updates);

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task'
        });
    }
};

/**
 * Delete task (owner only)
 */
const deleteTaskHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.uid;

        // Get existing task
        const task = storage.getTask(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        // Check ownership
        if (task.createdBy !== uid) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to delete this task'
            });
        }

        // Delete task
        storage.deleteTask(id);

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task'
        });
    }
};

module.exports = {
    createTask: createTaskHandler,
    getAllTasks: getAllTasksHandler,
    getTaskById,
    updateTask: updateTaskHandler,
    deleteTask: deleteTaskHandler
};
