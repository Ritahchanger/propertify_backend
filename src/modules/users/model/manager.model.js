const { sequelize, DataTypes } = require('../../../database-config/database-config');

const EstateManager = sequelize.define('EstateManager', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  estateId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'estate_id',
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'manager_id',
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'assigned_at',
  },
}, {
  tableName: 'estate_managers',
  underscored: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['estate_id', 'manager_id'],
    },
  ],
});

module.exports = EstateManager;
