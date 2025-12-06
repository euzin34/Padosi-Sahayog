// In-memory data storage (replaces Firestore)
// Note: Data will be lost when server restarts
// For persistence, you can use a JSON file or SQLite database

const users = new Map(); // userId -> user data
const tasks = new Map(); // taskId -> task data

let taskIdCounter = 1;

// User operations
const createUser = (userId, userData) => {
    users.set(userId, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    return users.get(userId);
};

const getUser = (userId) => {
    return users.get(userId);
};

const updateUser = (userId, updates) => {
    const user = users.get(userId);
    if (!user) return null;

    const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
    };
    users.set(userId, updatedUser);
    return updatedUser;
};

const deleteUser = (userId) => {
    return users.delete(userId);
};

// Task operations
const createTask = (taskData) => {
    const taskId = `task_${taskIdCounter++}`;
    const task = {
        id: taskId,
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
    };
    tasks.set(taskId, task);
    return task;
};

const getTask = (taskId) => {
    return tasks.get(taskId);
};

const getAllTasks = (filters = {}) => {
    let allTasks = Array.from(tasks.values());

    // Apply filters
    if (filters.status) {
        allTasks = allTasks.filter(task => task.status === filters.status);
    }
    if (filters.category) {
        allTasks = allTasks.filter(task => task.category === filters.category);
    }
    if (filters.createdBy) {
        allTasks = allTasks.filter(task => task.createdBy === filters.createdBy);
    }

    return allTasks;
};

const updateTask = (taskId, updates) => {
    const task = tasks.get(taskId);
    if (!task) return null;

    const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString()
    };
    tasks.set(taskId, updatedTask);
    return updatedTask;
};

const deleteTask = (taskId) => {
    return tasks.delete(taskId);
};

// Get statistics
const getStats = () => {
    return {
        totalUsers: users.size,
        totalTasks: tasks.size,
        activeTasks: Array.from(tasks.values()).filter(t => t.status === 'active').length
    };
};

module.exports = {
    // User operations
    createUser,
    getUser,
    updateUser,
    deleteUser,

    // Task operations
    createTask,
    getTask,
    getAllTasks,
    updateTask,
    deleteTask,

    // Stats
    getStats
};
