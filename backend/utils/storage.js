const db = require('./localDb');

/**
 * Get user synchronously from local DB
 * @param {string} userId 
 * @returns {object|null}
 */
const getUser = (userId) => {
    try {
        if (db.storage && db.storage.users && db.storage.users[userId]) {
            return db.storage.users[userId];
        }
        return null;
    } catch (error) {
        console.error('Error getting user from storage:', error);
        return null;
    }
};

module.exports = {
    getUser
};
