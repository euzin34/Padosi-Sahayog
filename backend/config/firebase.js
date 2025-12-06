const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
let db, auth;

try {
    // Option 1: Using service account key file (recommended)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        const serviceAccount = require(serviceAccountPath);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    // Option 2: Using environment variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
    } else {
        throw new Error('Firebase credentials not configured. Please set up service account or environment variables.');
    }

    // Use local DB for data persistence instead of Firestore
    const localDb = require('../utils/localDb');
    db = localDb;

    // Initialize Auth (still needs Firebase Admin for token verification)
    auth = admin.auth();

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('📦 Using Local JSON Database for persistence');
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    process.exit(1);
}

module.exports = { db, auth, admin };
