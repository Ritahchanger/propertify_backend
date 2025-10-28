const {
  sequelize,
  DataTypes,
} = require("../../../database-config/database-config");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "invoice_id",
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "tenant_id",
    },
    unitId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "unit_id",
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "payment_method",
    },
    transactionId: {
      type: DataTypes.STRING(100),
      field: "transaction_id",
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      field: "phone_number",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
      defaultValue: "pending",
      field: "payment_status",
    },
    mpesaReceiptNumber: {
      type: DataTypes.STRING(100),
      field: "mpesa_receipt_number",
    },
    paymentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "payment_date",
    },
    processedAt: {
      type: DataTypes.DATE,
      field: "processed_at",
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "payments",
    underscored: true,
    timestamps: false,
  }
);

module.exports = Payment;
