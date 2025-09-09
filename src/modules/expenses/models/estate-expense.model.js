const { sequelize, DataTypes } = require('../../../database-config/database-config');

const EstateExpense = sequelize.define('EstateExpense', {
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
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'expense_date',
  },
  recordedBy: {
    type: DataTypes.UUID,
    field: 'recorded_by',
  },
  receiptUrl: {
    type: DataTypes.TEXT,
    field: 'receipt_url',
  },
}, {
  tableName: 'estate_expenses',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = EstateExpense;