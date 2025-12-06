/**
 * HAVERSINE FORMULA EXPLANATION
 * 
 * This file demonstrates how the Haversine formula works mathematically.
 * Your backend uses the 'geolib' library which implements this internally,
 * but this shows the raw calculation for educational purposes.
 */

/**
 * Manual implementation of Haversine formula
 * Calculates the great-circle distance between two points on Earth
 * 
 * @param {number} lat1 - Latitude of point 1 (in degrees)
 * @param {number} lon1 - Longitude of point 1 (in degrees)
 * @param {number} lat2 - Latitude of point 2 (in degrees)
 * @param {number} lon2 - Longitude of point 2 (in degrees)
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    // Earth's radius in kilometers
    const R = 6371;

    // STEP 1: Convert degrees to radians
    // Radians = Degrees × (π / 180)
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    const deltaLatRad = toRadians(lat2 - lat1);
    const deltaLonRad = toRadians(lon2 - lon1);

    // STEP 2: Apply Haversine formula
    // a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
    const a =
        Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    // STEP 3: Calculate angular distance in radians
    // c = 2 × atan2(√a, √(1-a))
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // STEP 4: Calculate distance
    // distance = R × c
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

// ============================================
// EXAMPLE USAGE
// ============================================

// Example: Calculate distance between two locations in Kathmandu
const point1 = {
    name: "Thamel",
    lat: 27.7172,
    lon: 85.3240
};

const point2 = {
    name: "Patan Durbar Square",
    lat: 27.6729,
    lon: 85.3261
};

const distance = haversineDistance(
    point1.lat, point1.lon,
    point2.lat, point2.lon
);

console.log(`Distance from ${point1.name} to ${point2.name}:`);
console.log(`${distance.toFixed(2)} km`);
console.log(`${(distance * 1000).toFixed(0)} meters`);

// ============================================
// WHY HAVERSINE INSTEAD OF EUCLIDEAN?
// ============================================

/**
 * Euclidean distance (WRONG for geographic coordinates)
 * This treats Earth as flat - very inaccurate!
 */
function euclideanDistance(lat1, lon1, lat2, lon2) {
    const dx = lat2 - lat1;
    const dy = lon2 - lon1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Comparison: Haversine vs Euclidean
 */
function compareDistanceCalculations() {
    const lat1 = 27.7172, lon1 = 85.3240;  // Thamel
    const lat2 = 27.6729, lon2 = 85.3261;  // Patan

    const haversine = haversineDistance(lat1, lon1, lat2, lon2);
    const euclidean = euclideanDistance(lat1, lon1, lat2, lon2);

    console.log('\n=== COMPARISON ===');
    console.log(`Haversine (correct): ${haversine.toFixed(2)} km`);
    console.log(`Euclidean (wrong):   ${euclidean.toFixed(2)} degrees`);
    console.log('\nEuclidean gives meaningless results for lat/lon!');
}

compareDistanceCalculations();

// ============================================
// STEP-BY-STEP BREAKDOWN
// ============================================

function haversineStepByStep(lat1, lon1, lat2, lon2) {
    console.log('\n=== HAVERSINE STEP-BY-STEP ===');
    console.log(`Point 1: (${lat1}°, ${lon1}°)`);
    console.log(`Point 2: (${lat2}°, ${lon2}°)`);

    const R = 6371; // Earth's radius in km
    console.log(`\nEarth's radius: ${R} km`);

    // Step 1: Convert to radians
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    const deltaLatRad = toRadians(lat2 - lat1);
    const deltaLonRad = toRadians(lon2 - lon1);

    console.log('\nStep 1: Convert to radians');
    console.log(`  lat1: ${lat1}° → ${lat1Rad.toFixed(6)} rad`);
    console.log(`  lat2: ${lat2}° → ${lat2Rad.toFixed(6)} rad`);
    console.log(`  Δlat: ${(lat2 - lat1).toFixed(4)}° → ${deltaLatRad.toFixed(6)} rad`);
    console.log(`  Δlon: ${(lon2 - lon1).toFixed(4)}° → ${deltaLonRad.toFixed(6)} rad`);

    // Step 2: Calculate 'a'
    const sinDeltaLat = Math.sin(deltaLatRad / 2);
    const sinDeltaLon = Math.sin(deltaLonRad / 2);
    const a = sinDeltaLat * sinDeltaLat +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        sinDeltaLon * sinDeltaLon;

    console.log('\nStep 2: Calculate a');
    console.log(`  sin²(Δlat/2) = ${(sinDeltaLat * sinDeltaLat).toFixed(6)}`);
    console.log(`  cos(lat1) × cos(lat2) × sin²(Δlon/2) = ${(Math.cos(lat1Rad) * Math.cos(lat2Rad) * sinDeltaLon * sinDeltaLon).toFixed(6)}`);
    console.log(`  a = ${a.toFixed(6)}`);

    // Step 3: Calculate 'c'
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    console.log('\nStep 3: Calculate c (angular distance)');
    console.log(`  c = 2 × atan2(√${a.toFixed(6)}, √${(1 - a).toFixed(6)})`);
    console.log(`  c = ${c.toFixed(6)} radians`);
    console.log(`  c = ${toDegrees(c).toFixed(4)}°`);

    // Step 4: Calculate distance
    const distance = R * c;
    console.log('\nStep 4: Calculate distance');
    console.log(`  distance = R × c`);
    console.log(`  distance = ${R} × ${c.toFixed(6)}`);
    console.log(`  distance = ${distance.toFixed(2)} km`);
    console.log(`  distance = ${(distance * 1000).toFixed(0)} meters`);

    return distance;
}

// Run step-by-step example
haversineStepByStep(27.7172, 85.3240, 27.6729, 85.3261);

// ============================================
// ACCURACY COMPARISON
// ============================================

console.log('\n=== ACCURACY AT DIFFERENT SCALES ===');

// Short distance (within city)
const shortDist = haversineDistance(27.7172, 85.3240, 27.7180, 85.3250);
console.log(`Short distance (0.1 km): ${(shortDist * 1000).toFixed(0)} meters`);

// Medium distance (between cities)
const mediumDist = haversineDistance(27.7172, 85.3240, 28.2096, 83.9856); // Kathmandu to Pokhara
console.log(`Medium distance (200 km): ${mediumDist.toFixed(2)} km`);

// Long distance (across countries)
const longDist = haversineDistance(27.7172, 85.3240, 28.6139, 77.2090); // Kathmandu to Delhi
console.log(`Long distance (1000 km): ${longDist.toFixed(2)} km`);

module.exports = {
    haversineDistance,
    haversineStepByStep,
    toRadians,
    toDegrees
};
