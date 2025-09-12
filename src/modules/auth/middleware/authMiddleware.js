const AuthService = require('../services/authService');

const ACCESS_COOKIE_NAME = 'accessToken';

function authMiddleware(req, res, next) {
    try {


        let token;

        // 1. Try cookie first
        if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
            token = req.cookies[ACCESS_COOKIE_NAME];

        }

        // 2. If no cookie, try Authorization header
        if (!token && req.headers.authorization) {

            const [scheme, credentials] = req.headers.authorization.split(" ");
            if (scheme === "Bearer" && credentials) {
                token = credentials;
                console.log('✅ Token found in Authorization header');
            }
        }

        if (!token) {

            return res.status(401).json({ error: 'Not authenticated' });
        }



        // 3. Verify token
        const decoded = AuthService.verifyAccessToken(token);

        req.user = decoded;


        next();

    } catch (err) {

        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}


module.exports = { authMiddleware };
