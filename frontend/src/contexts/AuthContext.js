import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../utils/firebase';
import API from '../utils/api';
import { getCurrentLocation } from '../utils/geolocation';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Capture user location and send to backend
                    try {
                        const location = await getCurrentLocation();
                        await API.login(firebaseUser, location.latitude, location.longitude);
                    } catch (locError) {
                        console.warn('Location capture failed:', locError.message);
                        // Still proceed with login even if location fails
                        await API.login(firebaseUser);
                    }

                    // Fetch user profile from backend
                    const profileResponse = await API.getProfile(firebaseUser);
                    setUserProfile(profileResponse.data);
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setError(err.message);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userProfile,
        loading,
        error,
        setUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
