const AuthService = require('../services/authService');

const ACCESS_COOKIE_NAME = 'accessToken';

function authMiddleware(req, res, next) {
    try {
        console.log('🔍 authMiddleware - Starting authentication check');
        console.log('🔍 Cookies:', req.cookies);
        console.log('🔍 Authorization header:', req.headers.authorization);

        let token;

        // 1. Try cookie first
        if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
            token = req.cookies[ACCESS_COOKIE_NAME];
            console.log('✅ Token found in cookie:', token ? 'Yes' : 'No');
        }

        // 2. If no cookie, try Authorization header
        if (!token && req.headers.authorization) {
            console.log('🔍 Checking Authorization header...');
            const [scheme, credentials] = req.headers.authorization.split(" ");
            if (scheme === "Bearer" && credentials) {
                token = credentials;
                console.log('✅ Token found in Authorization header');
            }
        }

        if (!token) {
            console.log('❌ No token found in cookies or Authorization header');
            return res.status(401).json({ error: 'Not authenticated' });
        }

        console.log('🔍 Token found, verifying...');

        // 3. Verify token
        const decoded = AuthService.verifyAccessToken(token);
        console.log('✅ Token verified successfully');
        console.log('🔍 Decoded token payload:', decoded);

        req.user = decoded;
        console.log('✅ req.user set:', req.user);

        next();

    } catch (err) {
        console.error('❌ Auth middleware error:', err);
        console.error('❌ Error details:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}


module.exports = { authMiddleware };
