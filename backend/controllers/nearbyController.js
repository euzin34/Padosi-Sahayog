const storage = require('../utils/storage');
const { sortTasksByDistance, isValidCoordinates } = require('../utils/distance');
const { getPlaceNameCached } = require('../utils/geocoding');

/**
 * Get nearby tasks sorted by distance
 */
const getNearbyTasks = async (req, res) => {
    try {
        const { latitude, longitude, limit = 10, page = 1, category, unit = 'km' } = req.query;

        // Validate required parameters
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

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

        // Get all active tasks from storage
        const allTasks = storage.getAllTasks({
            status: 'active',
            category: category || undefined
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
                    longitude: lon
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
