const AuthService = require('../services/authService');

const UserService = require('../../users/services/userService');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: process.env.COOKIE_DOMAIN || undefined,
};

const ACCESS_COOKIE_NAME = 'accessToken';

const REFRESH_COOKIE_NAME = 'refreshToken';


class AuthController {
    static async register(req, res) {
        const { email, password, firstName, lastName, phone, idNumber, role } = req.body;

        const user = await UserService.createUser({
            email,
            password,
            firstName,
            lastName,
            phone,
            idNumber,
            role,
        });

        res.status(201).json({ user });
    }

    static async login(req, res) {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await AuthService.loginWithEmail(
            email,
            password,
            req
        );

        // set cookies
        res.cookie(ACCESS_COOKIE_NAME, accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 30 * 60 * 1000, // 15 minutes
        });

        res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ user, accessToken, refreshToken });
    }

    static async refreshToken(req, res) {

        const token = req.cookies[REFRESH_COOKIE_NAME];

        if (!token) throw new AppError("No refresh token", 401);

        const decoded = AuthService.verifyRefreshToken(token);

        const payload = {
            sub: decoded.sub,
            role: decoded.role,
            email: decoded.email,
        };

        const newAccess = AuthService.generateAccessToken(payload);
        const newRefresh = AuthService.generateRefreshToken(payload);

        // rotate cookies
        res.cookie(ACCESS_COOKIE_NAME, newAccess, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie(REFRESH_COOKIE_NAME, newRefresh, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: "Token refreshed" });
    }

    static async logout(req, res) {

        res.clearCookie(ACCESS_COOKIE_NAME, COOKIE_OPTIONS);

        res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);

        res.json({ message: "Logged out" });
    }

    static async me(req, res) {

        if (!req.user) throw new AppError("Not authenticated", 401);

        const user = await UserService.getUserById(req.user.sub);

        res.json({ user });
    }

    static async requestPasswordReset(email) {

        const user = await UserService.getUserByEmail(email);

        if (!user) {

            throw new Error("User not found");

        }

        const resetToken = AuthService.generatePasswordResetToken(user);

        await AuthService.sendPasswordResetEmail(user, resetToken);

        return res.json({ message: "Password reset email sent" });

    }

    static async resetPassword(req, res) {

        const { token, newPassword } = req.body;

        const result = await AuthService.resetPassword(token, newPassword);

        res.json(result);
    }

}

module.exports = AuthController;