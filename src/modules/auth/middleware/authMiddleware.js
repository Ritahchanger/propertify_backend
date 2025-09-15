const AuthService = require('../services/authService');

const ACCESS_COOKIE_NAME = 'accessToken';

async function authMiddleware(req, res, next) {
    try {
        let token;

        // 1. Try cookie first (requires cookie-parser middleware)
        if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
            token = req.cookies[ACCESS_COOKIE_NAME];
            // console.log('Token found in cookie');
        }

        console.log("Authenticating")

        // 2. If no cookie, try Authorization header (case-insensitive, robust split)
        if (!token) {
            const authHeader = req.get('authorization') || req.headers.authorization;
            if (authHeader && typeof authHeader === 'string') {
                const parts = authHeader.split(/\s+/); // split on whitespace
                if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                    token = parts[1];
                    // console.log('Token found in Authorization header');
                }
            }
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated — no token provided' });
        }

        // 3. Verify token (support sync or async verifyAccessToken)
        let decoded = AuthService.verifyAccessToken(token);

        // If verifyAccessToken returns a Promise, await it
        if (decoded && typeof decoded.then === 'function') {
            decoded = await decoded;
        }

        // If verifyAccessToken returns falsy on invalid token, handle it:
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Optionally, if token payload shape is unexpected, validate necessary fields
        // e.g., if (!decoded.sub) return res.status(401).json({error:'Invalid token payload'});

        req.user = decoded;
        return next();

    } catch (err) {
        // log error for debugging (avoid leaking secrets in production)
        console.error('authMiddleware error:', err && err.message ? err.message : err);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { authMiddleware };
