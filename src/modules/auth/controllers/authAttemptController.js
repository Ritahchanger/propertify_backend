// src/modules/auth/controllers/authAttemptController.js
const AuthAttemptService = require("../services/authAttemptsService");

class AuthAttemptController {
    static async getAll(req, res, next) {

        const attempts = await AuthAttemptService.getAllAuthAttempts();

        const formatted = attempts.map((attempt) => ({
            id: attempt.id,
            userId: attempt.userId,
            firstName: attempt.user?.firstName || null,
            lastName: attempt.user?.lastName || null,
            email: attempt.user?.email || null,
            ipAddress: attempt.ipAddress,
            userAgent: attempt.userAgent,
            attemptType: attempt.attemptType,
            status: attempt.status,
            reason: attempt.reason,
            createdAt: attempt.createdAt,
        }));

        res.json({ attempts: formatted });

    }
}

module.exports = AuthAttemptController;
