const { db } = require('../config/firebase');

/**
 * Get user by ID
 * @param {string} userId 
 */
const getUser = (userId) => {
    // Since db is synchronous (LocalFirestore), we can just access storage directly
    // db.storage is the raw data
    // db.collection('users').doc(userId).get() returns a promise 
    
    // But for synchronous helper, we might need to be async or cheat
    // The chat controller called it synchronously: const otherUser = getUser(conv.otherUserId);
    
    // localDb is implemented as a class instance.
    // It has `storage` property which is the raw JSON object.
    
    if (db && db.storage && db.storage.users) {
        return db.storage.users[userId] || null;
    }
    return null;
};

module.exports = {
    getUser
};
