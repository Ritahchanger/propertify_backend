const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserService = require('../../users/services/userService');
const { AuthAttempt } = require('../../../database-config/index');
const { transporter } = require("../../../shared/utils/transporter");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRY || '7d';

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

    static generatePasswordResetToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email },
            ACCESS_SECRET,
            { expiresIn: '1h' }
        );
    }

    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, ACCESS_SECRET);
        } catch {
            return null;
        }
    }

    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, REFRESH_SECRET);
        } catch {
            return null;
        }
    }

    static async loginWithEmail(email, plainPassword, req = null) {
        let user = null;

        try {
            user = await UserService.getUserByEmail(email);

            const clientInfo = req?.clientInfo || { ip: "unknown", userAgent: "unknown" };

            if (!user) {
                await AuthAttempt.create({
                    userId: null,
                    ipAddress: clientInfo.ip,
                    userAgent: clientInfo.userAgent,
                    attemptType: 'login',
                    status: 'failed',
                    reason: 'User not found',
                });
                throw new Error('Invalid credentials');
            }

            const ok = await this.validatePassword(user, plainPassword);
            if (!ok) {
                await AuthAttempt.create({
                    userId: user.id,
                    ipAddress: clientInfo.ip,
                    userAgent: clientInfo.userAgent,
                    attemptType: 'login',
                    status: 'failed',
                    reason: 'Wrong password',
                });
                throw new Error('Invalid credentials');
            }

            // ✅ Success
            const payload = { id: user.id, role: user.role, email: user.email };
            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken(payload);

            await AuthAttempt.create({
                userId: user.id,
                ipAddress: clientInfo.ip,
                userAgent: clientInfo.userAgent,
                attemptType: 'login',
                status: 'success',
                reason: 'Successful login',
            });

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            };
        } catch (err) {
            throw err;
        }
    }

    static async sendPasswordResetEmail(user, resetToken) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Support" <${process.env.COMPANY_EMAIL}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <p>Hello ${user.firstName || ''},</p>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });
    }

    static async resetPassword(token, newPassword, req = null) {
        try {
            const decoded = jwt.verify(token, ACCESS_SECRET);
            const user = await UserService.getUserById(decoded.id);

            const clientInfo = req?.clientInfo || { ip: "unknown", userAgent: "unknown" };

            if (!user) {
                await AuthAttempt.create({
                    userId: null,
                    ipAddress: clientInfo.ip,
                    userAgent: clientInfo.userAgent,
                    attemptType: "password_reset",
                    status: "failed",
                    reason: "User not found",
                });
                throw new Error("Invalid or expired token");
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            await UserService.updateUser(user.id, { passwordHash: hashed });

            await AuthAttempt.create({
                userId: user.id,
                ipAddress: clientInfo.ip,
                userAgent: clientInfo.userAgent,
                attemptType: "password_reset",
                status: "success",
                reason: "Password reset successful",
            });

            return { message: "Password has been reset successfully" };
        } catch (error) {
            const clientInfo = req?.clientInfo || { ip: "unknown", userAgent: "unknown" };

            await AuthAttempt.create({
                userId: null,
                ipAddress: clientInfo.ip,
                userAgent: clientInfo.userAgent,
                attemptType: 'password_reset',
                status: 'failed',
                reason: error.message,
            });

            throw new Error("Password reset failed: " + error.message);
        }
    }

}

module.exports = AuthService;
