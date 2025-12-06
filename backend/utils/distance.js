const { getDistance, convertDistance } = require('geolib');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @param {string} unit - Unit of measurement ('km' or 'm'), default is 'km'
 * @returns {number} Distance in specified unit
 */
const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
    try {
        // Calculate distance in meters using geolib
        const distanceInMeters = getDistance(
            { latitude: lat1, longitude: lon1 },
            { latitude: lat2, longitude: lon2 }
        );

        // Convert to requested unit
        if (unit === 'km') {
            return convertDistance(distanceInMeters, 'km');
        }

        return distanceInMeters;
    } catch (error) {
        console.error('Error calculating distance:', error);
        return null;
    }
};

/**
 * Sort tasks by distance from a given location
 * @param {Array} tasks - Array of task objects with location data
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {string} unit - Unit of measurement ('km' or 'm')
 * @returns {Array} Sorted array of tasks with distance property
 */
const sortTasksByDistance = (tasks, userLat, userLon, unit = 'km') => {
    // Add distance to each task
    const tasksWithDistance = tasks.map(task => {
        const distance = calculateDistance(
            userLat,
            userLon,
            task.location.latitude,
            task.location.longitude,
            unit
        );

        return {
            ...task,
            distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
            distanceUnit: unit
        };
    });

    // Sort by distance (null distances go to the end)
    return tasksWithDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
    });
};

/**
 * Validate coordinates
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {boolean} True if valid coordinates
 */
const isValidCoordinates = (latitude, longitude) => {
    return (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
};

module.exports = {
    calculateDistance,
    sortTasksByDistance,
    isValidCoordinates
};
