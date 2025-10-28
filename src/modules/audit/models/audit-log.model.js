const { sequelize, DataTypes } = require('../../../database-config/database-config');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'entity_type',
  },
  entityId: {
    type: DataTypes.UUID,
    field: 'entity_id',
  },
  oldValues: {
    type: DataTypes.JSONB,
    field: 'old_values',
  },
  newValues: {
    type: DataTypes.JSONB,
    field: 'new_values',
  },
  ipAddress: {
    type: DataTypes.INET,
    field: 'ip_address',
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent',
  },
}, {
  tableName: 'audit_logs',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AuditLog;