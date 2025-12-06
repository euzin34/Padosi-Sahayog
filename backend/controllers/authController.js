const { db, auth } = require('../config/firebase');
const { isValidCoordinates } = require('../utils/distance');

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { email, password, displayName, phoneNumber } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Create user object for Firebase Auth
        const authUserObj = {
            email,
            password
        };

        if (displayName) authUserObj.displayName = displayName;
        if (phoneNumber) authUserObj.phoneNumber = phoneNumber;

        // Create user in Firebase Auth
        const userRecord = await auth.createUser(authUserObj);

        // Create user profile in Firestore
        const userProfile = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: displayName || null,
            phoneNumber: phoneNumber || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            location: null // Will be updated on login
        };

        await db.collection('users').doc(userRecord.uid).set(userProfile);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userProfile.displayName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }

        if (error.code === 'auth/invalid-password') {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to register user'
        });
    }
};

/**
 * Login user and capture location
 * Note: Client should send Firebase ID token after authentication
 */
const login = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const uid = req.user.uid; // From auth middleware

        // Validate location if provided
        if (latitude !== undefined && longitude !== undefined) {
            if (!isValidCoordinates(latitude, longitude)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid coordinates'
                });
            }

            // Update user location in Firestore
            await db.collection('users').doc(uid).update({
                location: {
                    latitude,
                    longitude,
                    lastUpdated: new Date().toISOString()
                },
                lastLogin: new Date().toISOString()
            });
        } else {
            // Just update last login
            await db.collection('users').doc(uid).update({
                lastLogin: new Date().toISOString()
            });
        }

        // Get user profile
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                location: userData.location
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process login'
        });
    }
};

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
    try {
        const uid = req.user.uid;

        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }

        const userData = userDoc.data();

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { displayName, phoneNumber, location } = req.body;

        const updates = {
            updatedAt: new Date().toISOString()
        };

        if (displayName !== undefined) {
            updates.displayName = displayName;
            // Also update in Firebase Auth
            await auth.updateUser(uid, { displayName });
        }

        if (phoneNumber !== undefined) {
            updates.phoneNumber = phoneNumber;
            // Also update in Firebase Auth
            await auth.updateUser(uid, { phoneNumber });
        }

        if (location && location.latitude !== undefined && location.longitude !== undefined) {
            if (!isValidCoordinates(location.latitude, location.longitude)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid coordinates'
                });
            }

            updates.location = {
                latitude: location.latitude,
                longitude: location.longitude,
                lastUpdated: new Date().toISOString()
            };
        }

        await db.collection('users').doc(uid).update(updates);

        // Get updated profile
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: userData
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
