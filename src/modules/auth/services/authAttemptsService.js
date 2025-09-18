// src/modules/auth/services/authAttemptService.js
const { AuthAttempt, User } = require("../../../database-config/index");

class AuthAttemptService {
    static async getAllAuthAttempts() {
        return AuthAttempt.findAll({
            include: [
                {
                    model: User,
                    as: "user", // ✅ matches the belongsTo alias
                    attributes: ["firstName", "lastName", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
    }
}

module.exports = AuthAttemptService;
