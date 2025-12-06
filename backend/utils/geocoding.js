const axios = require('axios');

/**
 * Get human-readable place name from coordinates using reverse geocoding
 * Uses OpenStreetMap Nominatim API (free, rate-limited)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<string>} Place name or null if failed
 */
const getPlaceName = async (latitude, longitude) => {
    try {
        const apiUrl = process.env.GEOCODING_API_URL || 'https://nominatim.openstreetmap.org/reverse';
        const userAgent = process.env.GEOCODING_USER_AGENT || 'PadosiSahayog/1.0';

        // OpenStreetMap Nominatim API
        const response = await axios.get(apiUrl, {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
                addressdetails: 1
            },
            headers: {
                'User-Agent': userAgent
            },
            timeout: 5000 // 5 second timeout
        });

        if (response.data && response.data.display_name) {
            return response.data.display_name;
        }

        // Fallback: construct simple place name from address components
        if (response.data && response.data.address) {
            const addr = response.data.address;
            const parts = [
                addr.neighbourhood || addr.suburb,
                addr.city || addr.town || addr.village,
                addr.state,
                addr.country
            ].filter(Boolean);

            return parts.join(', ') || 'Unknown location';
        }

        return 'Unknown location';
    } catch (error) {
        console.error('Geocoding error:', error.message);

        // Return coordinates as fallback
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
};

/**
 * Get place names for multiple locations with rate limiting
 * @param {Array} locations - Array of {latitude, longitude} objects
 * @param {number} delayMs - Delay between requests in milliseconds (default 1000ms for Nominatim)
 * @returns {Promise<Array>} Array of place names
 */
const getPlaceNames = async (locations, delayMs = 1100) => {
    const placeNames = [];

    for (let i = 0; i < locations.length; i++) {
        const { latitude, longitude } = locations[i];
        const placeName = await getPlaceName(latitude, longitude);
        placeNames.push(placeName);

        // Rate limiting: wait before next request (except for last item)
        if (i < locations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return placeNames;
};

/**
 * Batch geocode with caching to avoid repeated API calls
 */
const geocodeCache = new Map();

const getPlaceNameCached = async (latitude, longitude) => {
    const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    if (geocodeCache.has(key)) {
        return geocodeCache.get(key);
    }

    const placeName = await getPlaceName(latitude, longitude);
    geocodeCache.set(key, placeName);

    return placeName;
};

module.exports = {
    getPlaceName,
    getPlaceNames,
    getPlaceNameCached
};
