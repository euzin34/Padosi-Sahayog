const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Extracts user information and attaches to request object
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Please include Authorization header with Bearer token.'
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify the ID token
        const decodedToken = await auth.verifyIdToken(idToken);

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Invalid token. Authentication failed.'
        });
    }
};

module.exports = { verifyToken };
