const { db } = require('../config/firebase');
const { isValidCoordinates } = require('../utils/distance');

// In-memory storage for tasks (fallback when Firebase is in mock mode)
const tasksStorage = new Map();
let taskIdCounter = 1;

/**
 * Create a new task listing
 */
const createTask = async (req, res) => {
    try {
        const { title, description, location, category, urgency, type } = req.body;
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

        // Create task object
        const taskId = `task-${taskIdCounter++}`;
        const task = {
            id: taskId,
            title,
            description,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            },
            category: category || 'general',
            urgency: urgency || 'medium',
            type: type || 'request',
            createdBy: uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };

        // Store in memory
        tasksStorage.set(taskId, task);

        // Try to add to Firestore (will work if Firebase is configured)
        try {
            const taskRef = await db.collection('tasks').add(task);
            task.id = taskRef.id;
            tasksStorage.set(taskRef.id, task);
        } catch (err) {
            console.log('Firebase not available, using in-memory storage');
        }

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
const getAllTasks = async (req, res) => {
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

        // Use in-memory storage
        let allTasks = Array.from(tasksStorage.values());
        
        // Filter by status
        allTasks = allTasks.filter(task => task.status === status);
        
        // Filter by category if provided
        if (category) {
            allTasks = allTasks.filter(task => task.category === category);
        }

        const totalTasks = allTasks.length;
        const startIndex = (pageNum - 1) * limitNum;
        const tasks = allTasks.slice(startIndex, startIndex + limitNum);

        res.json({
            success: true,
            data: {
                tasks,
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

        const task = tasksStorage.get(id);

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
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, category, status } = req.body;
        const uid = req.user.uid;

        // Get existing task
        const taskDoc = await db.collection('tasks').doc(id).get();

        if (!taskDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        const taskData = taskDoc.data();

        // Check ownership
        if (taskData.createdBy !== uid) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to update this task'
            });
        }

        // Build updates object
        const updates = {
            updatedAt: new Date().toISOString()
        };

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
        await db.collection('tasks').doc(id).update(updates);

        // Get updated task
        const updatedTaskDoc = await db.collection('tasks').doc(id).get();

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: {
                id: updatedTaskDoc.id,
                ...updatedTaskDoc.data()
            }
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
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.uid;

        // Get existing task
        const taskDoc = await db.collection('tasks').doc(id).get();

        if (!taskDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        const taskData = taskDoc.data();

        // Check ownership
        if (taskData.createdBy !== uid) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to delete this task'
            });
        }

        // Delete task
        await db.collection('tasks').doc(id).delete();

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

/**
 * Accept/Book a task
 */
const acceptTask = async (req, res) => {
    try {
        const { id } = req.params;
        const uid = req.user.uid;

        // Get existing task from memory
        const task = tasksStorage.get(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        // Check if user is trying to accept their own task
        if (task.createdBy === uid) {
            return res.status(400).json({
                success: false,
                error: 'You cannot accept your own task'
            });
        }

        // Check if task is already accepted
        if (task.status === 'accepted' || task.acceptedBy) {
            return res.status(400).json({
                success: false,
                error: 'This task has already been accepted'
            });
        }

        // Update task with acceptor info
        task.status = 'accepted';
        task.acceptedBy = uid;
        task.acceptedAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();

        // Save updated task
        tasksStorage.set(id, task);

        res.json({
            success: true,
            message: 'Task accepted successfully',
            data: task
        });
    } catch (error) {
        console.error('Accept task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to accept task'
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    acceptTask
};
