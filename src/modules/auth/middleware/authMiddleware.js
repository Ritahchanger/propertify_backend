const AuthService = require('../services/authService');

const ACCESS_COOKIE_NAME = 'accessToken';

async function authMiddleware(req, res, next) {
    try {
        
        let token;

        if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
            token = req.cookies[ACCESS_COOKIE_NAME];
 
        }
 
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated — no token provided' });
        }

        let decoded = AuthService.verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({ error: "Invalid or expired token" })
        }


        if (decoded && typeof decoded.then === 'function') {

            decoded = await decoded;
        }


        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

   
        req.user = decoded;

        return next();

    } catch (err) {

        console.error('authMiddleware error:', err && err.message ? err.message : err);

        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { authMiddleware };
