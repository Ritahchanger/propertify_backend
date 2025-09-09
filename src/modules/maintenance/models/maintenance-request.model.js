const { sequelize, DataTypes } = require('../../../database-config/database-config');
const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  unitId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'unit_id',
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'open',
  },
  assignedTo: {
    type: DataTypes.UUID,
    field: 'assigned_to',
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'estimated_cost',
  },
  actualCost: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'actual_cost',
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at',
  },
}, {
  tableName: 'maintenance_requests',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});


module.exports = MaintenanceRequest;