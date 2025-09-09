const { sequelize, DataTypes } = require('../../../database-config/database-config');

const Receipt = sequelize.define('Receipt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'payment_id',
  
  },
  receiptNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'receipt_number',
  },
  receiptUrl: {
    type: DataTypes.TEXT,
    field: 'receipt_url',
  },
  qrCodeData: {
    type: DataTypes.TEXT,
    field: 'qr_code_data',
  },
  issuedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'issued_at',
  },
}, {
  tableName: 'receipts',
  underscored: true,
  timestamps: false,
});


module.exports = Receipt;