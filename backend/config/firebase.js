const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK (Auth only, no Firestore)
let auth;

try {
    // Using service account key file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = require(path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        throw new Error('Firebase credentials not configured. Please set up service account.');
    }

    auth = admin.auth();

    console.log('✅ Firebase Admin SDK (Auth only) initialized successfully');
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    process.exit(1);
}

module.exports = { auth, admin };
