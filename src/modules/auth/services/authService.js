const jwt = require('jsonwebtoken');

const UserService = require('../../users/services/userService');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRY || '15m';

const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRY || '7d';

const bcrypt = require('bcrypt');

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    
    throw new Error('JWT secrets are not defined in environment variables');
}

class AuthService {
    static async validatePassword(user, plainPassword) {
        if (!user) return false;
        return bcrypt.compare(plainPassword, user.passwordHash);
    }

    static generateAccessToken(payload) {
        return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
    }

    static generateRefreshToken(payload) {
        return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
    }

    static verifyAccessToken(token) {
        return jwt.verify(token, ACCESS_SECRET);
    }

    static verifyRefreshToken(token) {
        return jwt.verify(token, REFRESH_SECRET);
    }

    // convenience: get user and tokens after login
    static async loginWithEmail(email, plainPassword) {

        const user = await UserService.getUserByEmail(email);

        if (!user) throw new Error('Invalid credentials');

        const ok = await this.validatePassword(user, plainPassword);

        if (!ok) throw new Error('Invalid credentials');

        // create safe payload
        const payload = { sub: user.id, role: user.role, email: user.email };

        const accessToken = this.generateAccessToken(payload);

        const refreshToken = this.generateRefreshToken(payload);

        // optional: persist refresh token in DB (recommended) to allow revocation (not implemented here)
        return { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, accessToken, refreshToken };

    }
}

module.exports = AuthService;