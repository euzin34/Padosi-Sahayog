const { db } = require('../config/firebase');
const { sortTasksByDistance, isValidCoordinates } = require('../utils/distance');
const { getPlaceNameCached } = require('../utils/geocoding');

/**
 * Get nearby tasks sorted by distance
 * Automatically uses authenticated user's location from profile,
 * or accepts manual coordinates if provided
 */
const getNearbyTasks = async (req, res) => {
    try {
        let { latitude, longitude, limit = 10, page = 1, category, unit = 'km' } = req.query;
        let lat, lon;
        let locationSource = 'manual'; // Track where location came from

        // Try to get user's location from their profile if authenticated
        if (req.user && req.user.uid) {
            try {
                const userDoc = await db.collection('users').doc(req.user.uid).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();

                    // Use stored location if available and no manual coordinates provided
                    if (userData.location && (!latitude || !longitude)) {
                        lat = userData.location.latitude;
                        lon = userData.location.longitude;
                        locationSource = 'profile';
                        console.log(`Using location from user profile: ${lat}, ${lon}`);
                    }
                }
            } catch (error) {
                console.warn('Could not fetch user profile location:', error.message);
                // Continue with manual coordinates if profile fetch fails
            }
        }

        // If no location from profile, use manual coordinates
        if (!lat || !lon) {
            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    error: 'Latitude and longitude are required. Please provide coordinates or login to use your saved location.'
                });
            }

            lat = parseFloat(latitude);
            lon = parseFloat(longitude);
        }

        // Validate coordinates
        if (!isValidCoordinates(lat, lon)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates'
            });
        }

        // Validate pagination
        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);

        if (limitNum < 1 || limitNum > 100 || pageNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid pagination parameters'
            });
        }

        // Build query
        let query = db.collection('tasks').where('status', '==', 'active');

        if (category) {
            query = query.where('category', '==', category);
        }

        // Get all tasks
        const snapshot = await query.get();
        const allTasks = [];

        snapshot.forEach(doc => {
            allTasks.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort tasks by distance
        const tasksWithDistance = sortTasksByDistance(allTasks, lat, lon, unit);

        // Apply pagination
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedTasks = tasksWithDistance.slice(startIndex, startIndex + limitNum);

        // Add place names to tasks (with caching to reduce API calls)
        const tasksWithPlaceNames = await Promise.all(
            paginatedTasks.map(async (task) => {
                try {
                    const placeName = await getPlaceNameCached(
                        task.location.latitude,
                        task.location.longitude
                    );

                    return {
                        ...task,
                        placeName
                    };
                } catch (error) {
                    console.error('Error getting place name:', error);
                    return {
                        ...task,
                        placeName: `${task.location.latitude.toFixed(4)}, ${task.location.longitude.toFixed(4)}`
                    };
                }
            })
        );

        res.json({
            success: true,
            data: {
                userLocation: {
                    latitude: lat,
                    longitude: lon,
                    source: locationSource // 'profile' or 'manual'
                },
                tasks: tasksWithPlaceNames,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: tasksWithDistance.length,
                    totalPages: Math.ceil(tasksWithDistance.length / limitNum)
                }
            }
        });
    } catch (error) {
        console.error('Get nearby tasks error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get nearby tasks'
        });
    }
};

module.exports = {
    getNearbyTasks
};
