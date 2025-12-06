import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Register a new user with email and password
 */
export const registerUser = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        if (displayName) {
            await firebaseUpdateProfile(userCredential.user, { displayName });
        }

        return userCredential.user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

/**
 * Sign in user with email and password
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        await firebaseUpdateProfile(user, updates);
        return user;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export { auth };
export default app;
