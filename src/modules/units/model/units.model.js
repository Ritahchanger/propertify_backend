const { sequelize, DataTypes } = require('../../../database-config/database-config');

const Unit = sequelize.define('Unit', {
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
  unitNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'unit_number',
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'monthly_rent',
  },
  depositAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'deposit_amount',
  },
  unitType: {
    type: DataTypes.STRING(50),
    field: 'unit_type',
  },
  floorArea: {
    type: DataTypes.DECIMAL(8, 2),
    field: 'floor_area',
  },
  status: {
    type: DataTypes.ENUM('vacant', 'occupied', 'maintenance', 'reserved'),
    defaultValue: 'vacant',
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'units',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['estate_id', 'unit_number'],
    },
  ],
});


module.exports = Unit;