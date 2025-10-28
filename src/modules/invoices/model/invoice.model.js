const { sequelize, DataTypes } = require('../../../database-config/database-config');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  leaseId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'lease_id',
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'invoice_number',
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'period_start',
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'period_end',
  },
  baseAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'base_amount',
  },
  penaltyAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'penalty_amount',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_amount',
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'due_date',
  },
  invoiceStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'partially_paid', 'overdue', 'cancelled'),
    defaultValue: 'pending',
    field: 'invoice_status',
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
    defaultValue: 'unpaid',
    field: 'payment_status',
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'generated_at',
  },
  paidAt: {
    type: DataTypes.DATE,
    field: 'paid_at',
  },
}, {
  tableName: 'invoices',
  underscored: true,
  timestamps: false,
});

module.exports = Invoice;

