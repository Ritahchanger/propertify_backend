const { sequelize,DataTypes } = require("../../../database-config/database-config");

const AuthAttempt = sequelize.define('AuthAttempt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true, // null if attacker isn't a registered user
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    attemptType: {
        type: DataTypes.ENUM('login', 'mfa', 'password_reset', 'signup'),
        defaultValue: 'login',
    },
    status: {
        type: DataTypes.ENUM('success', 'failed', 'blocked', 'malicious'),
        defaultValue: 'failed',
    },
    reason: {
        type: DataTypes.STRING, // e.g. "Wrong password", "MFA failed", "SQL Injection attempt"
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSONB, // Store extra details if needed
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'auth_attempts',
});

module.exports = AuthAttempt;