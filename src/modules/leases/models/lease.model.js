const { sequelize, DataTypes } = require('../../../database-config/database-config');

const Lease = sequelize.define('Lease', {
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
  applicationId: {
    type: DataTypes.UUID,
    field: 'application_id',
  },
  leaseStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'lease_start_date',
  },
  leaseEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'lease_end_date',
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'monthly_rent',
  },
  depositPaid: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'deposit_paid',
  },
  leaseStatus: {
    type: DataTypes.ENUM('draft', 'active', 'expired', 'terminated', 'renewed'),
    defaultValue: 'active',
    field: 'lease_status',
  },
  leaseDocumentUrl: {
    type: DataTypes.TEXT,
    field: 'lease_document_url',
  },
  signedAt: {
    type: DataTypes.DATE,
    field: 'signed_at',
  },
}, {
  tableName: 'leases',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Lease;