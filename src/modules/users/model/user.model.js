const {
  sequelize,
  DataTypes,
} = require("../../../database-config/database-config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    idNumber: {
      type: DataTypes.STRING(50),
      field: "id_number",
    },
    role: {
      type: DataTypes.ENUM("owner", "manager", "tenant", "accountant"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
    },
    approvalStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      field: "approval_status",
    },
    approvedAt: {
      type: DataTypes.DATE,
      field: "approved_at",
    },
    approvedBy: {
      type: DataTypes.UUID,
      field: "approved_by",
      references: {
        model: "users",
        key: "id",
      },
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      field: "rejection_reason",
    },
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;
