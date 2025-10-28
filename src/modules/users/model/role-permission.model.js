// models/RolePermission.js
const {
  sequelize,
  DataTypes,
} = require("../../../database-config/database-config");

const RolePermission = sequelize.define(
  "RolePermission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("owner", "manager", "tenant", "accountant"),
      allowNull: false,
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "permissions",
        key: "id",
      },
    },
  },
  {
    tableName: "role_permissions",
    underscored: true, // This will convert camelCase to snake_case in database
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      {
        unique: true,
        fields: ["role", "permission_id"],
      },
    ],
  }
);

module.exports = RolePermission;
