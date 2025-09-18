const { sequelize, DataTypes } = require('./database-config');

const Estate = require('../modules/estates/models/estate.model');
const EstateManager = require('../modules/users/model/manager.model');
const User = require('../modules/users/model/user.model');
const Unit = require('../modules/units/model/units.model');
const TenantApplication = require('../modules/users/model/tenant.model');
const Lease = require('../modules/leases/models/lease.model');
const Invoice = require('../modules/invoices/model/invoice.model');
const Payment = require('../modules/payments/models/payment.model');
const Receipt = require('../modules/receipts/models/receipts.model');
const MaintenanceRequest = require('../modules/maintenance/models/maintenance-request.model');
const EstateExpense = require('../modules/expenses/models/estate-expense.model');
const Notification = require('../modules/notifications/models/notification.model');
const AuditLog = require('../modules/audit/models/audit-log.model');

const AuthAttempt = require("../modules/auth/models/auth-attempt.model");

// User associations
User.hasMany(Estate, { foreignKey: 'ownerId', as: 'ownedEstates' });
User.hasMany(TenantApplication, { foreignKey: 'applicantId', as: 'applications' });
User.hasMany(Lease, { foreignKey: 'tenantId', as: 'leases' });
User.hasMany(Payment, { foreignKey: 'tenantId', as: 'payments' });
User.hasMany(MaintenanceRequest, { foreignKey: 'tenantId', as: 'maintenanceRequests' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(AuthAttempt, { foreignKey: "userId", as: "authAttempts" });
AuthAttempt.belongsTo(User, { foreignKey: "userId", as: "user" });


// Estate associations
Estate.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Estate.hasMany(Unit, { foreignKey: 'estateId', as: 'units' });
Estate.hasMany(EstateExpense, { foreignKey: 'estateId', as: 'expenses' });
Estate.belongsToMany(User, {
    through: EstateManager,
    foreignKey: 'estateId',
    otherKey: 'managerId',
    as: 'managers'
});

// Unit associations
Unit.belongsTo(Estate, { foreignKey: 'estateId', as: 'estate' });
Unit.hasMany(TenantApplication, { foreignKey: 'unitId', as: 'applications' });
Unit.hasMany(Lease, { foreignKey: 'unitId', as: 'leases' });
Unit.hasMany(MaintenanceRequest, { foreignKey: 'unitId', as: 'maintenanceRequests' });

// Tenant Application associations
TenantApplication.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' });
TenantApplication.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' });
TenantApplication.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
TenantApplication.hasOne(Lease, { foreignKey: 'applicationId', as: 'lease' });

// Lease associations
Lease.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' });
Lease.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });
Lease.belongsTo(TenantApplication, { foreignKey: 'applicationId', as: 'application' });
Lease.hasMany(Invoice, { foreignKey: 'leaseId', as: 'invoices' });

// Invoice associations
Invoice.belongsTo(Lease, { foreignKey: 'leaseId', as: 'lease' });
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });

// Payment associations
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
Payment.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });
Payment.hasOne(Receipt, { foreignKey: 'paymentId', as: 'receipt' });

// Receipt associations
Receipt.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

// Maintenance Request associations
MaintenanceRequest.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });

// Estate Expense associations
EstateExpense.belongsTo(Estate, { foreignKey: 'estateId', as: 'estate' });
EstateExpense.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Audit Log associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });



// Export all models and sequelize instance
module.exports = {
    sequelize,
    User,
    Estate,
    EstateManager,
    Unit,
    TenantApplication,
    Lease,
    Invoice,
    Payment,
    Receipt,
    MaintenanceRequest,
    EstateExpense,
    Notification,
    AuditLog,
    AuthAttempt,
};