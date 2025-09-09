// Real Estate Management System - Node.js Models using Sequelize
// Make sure to install: npm install sequelize pg pg-hstore bcryptjs

const { Sequelize, DataTypes } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/real_estate_db', {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name',
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  idNumber: {
    type: DataTypes.STRING(50),
    field: 'id_number',
  },
  role: {
    type: DataTypes.ENUM('owner', 'manager', 'tenant', 'accountant'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Estate Model
const Estate = sequelize.define('Estate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  totalUnits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_units',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active',
  },
}, {
  tableName: 'estates',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Estate Manager Model (Junction table)
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
    references: {
      model: Estate,
      key: 'id',
    },
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'manager_id',
    references: {
      model: User,
      key: 'id',
    },
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

// Unit Model
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
    references: {
      model: Estate,
      key: 'id',
    },
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

// Tenant Application Model
const TenantApplication = sequelize.define('TenantApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  unitId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'unit_id',
    references: {
      model: Unit,
      key: 'id',
    },
  },
  applicantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'applicant_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  preferredMoveInDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'preferred_move_in_date',
  },
  rentDurationMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'rent_duration_months',
    validate: {
      min: 1,
    },
  },
  applicationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'withdrawn'),
    defaultValue: 'pending',
    field: 'application_status',
  },
  employmentLetterUrl: {
    type: DataTypes.TEXT,
    field: 'employment_letter_url',
  },
  idCopyUrl: {
    type: DataTypes.TEXT,
    field: 'id_copy_url',
  },
  kraPin: {
    type: DataTypes.STRING(20),
    field: 'kra_pin',
  },
  emergencyContactName: {
    type: DataTypes.STRING(100),
    field: 'emergency_contact_name',
  },
  emergencyContactPhone: {
    type: DataTypes.STRING(20),
    field: 'emergency_contact_phone',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason',
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'applied_at',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    field: 'reviewed_at',
  },
  reviewedBy: {
    type: DataTypes.UUID,
    field: 'reviewed_by',
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'tenant_applications',
  underscored: true,
  timestamps: false,
});

// Lease Model
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
    references: {
      model: Unit,
      key: 'id',
    },
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  applicationId: {
    type: DataTypes.UUID,
    field: 'application_id',
    references: {
      model: TenantApplication,
      key: 'id',
    },
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

// Invoice Model
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
    references: {
      model: Lease,
      key: 'id',
    },
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

// Payment Model
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'invoice_id',
    references: {
      model: Invoice,
      key: 'id',
    },
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'payment_method',
  },
  transactionId: {
    type: DataTypes.STRING(100),
    field: 'transaction_id',
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    field: 'phone_number',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
    field: 'payment_status',
  },
  mpesaReceiptNumber: {
    type: DataTypes.STRING(100),
    field: 'mpesa_receipt_number',
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'payment_date',
  },
  processedAt: {
    type: DataTypes.DATE,
    field: 'processed_at',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'payments',
  underscored: true,
  timestamps: false,
});

// Receipt Model
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
    references: {
      model: Payment,
      key: 'id',
    },
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

// Maintenance Request Model
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
    references: {
      model: Unit,
      key: 'id',
    },
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: User,
      key: 'id',
    },
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
    references: {
      model: User,
      key: 'id',
    },
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

// Estate Expense Model
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
    references: {
      model: Estate,
      key: 'id',
    },
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
    references: {
      model: User,
      key: 'id',
    },
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

// Notification Model
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM('email', 'sms', 'whatsapp', 'system'),
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
  },
  sentAt: {
    type: DataTypes.DATE,
    field: 'sent_at',
  },
}, {
  tableName: 'notifications',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// Audit Log Model
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
    references: {
      model: User,
      key: 'id',
    },
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

// Define Associations
// User associations


// Helper function to sync database (use carefully in production)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    if (force) {
      await sequelize.sync({ force: true });
      console.log('Database tables created successfully.');
    } else {
      await sequelize.sync({ alter: true });
      console.log('Database tables synchronized successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Export sync function
module.exports.syncDatabase = syncDatabase;