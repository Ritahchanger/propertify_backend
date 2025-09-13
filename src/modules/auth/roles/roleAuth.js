// middleware/roleAuth.js
const { requirePermission, requireRole } = require("../middleware/role.middleware")




// Define role hierarchy and permissions
const PERMISSIONS = {
    // Payment-related permissions
    payments: {
        view: ['owner', 'manager', 'accountant'],
        create: ['owner', 'accountant'],
        update: ['owner', 'accountant'],
        delete: ['owner'], // Only owners can delete payments
        approve: ['owner', 'manager']
    },

    // User management permissions
    users: {
        view: ['owner', 'manager'],
        create: ['owner', 'manager'],
        update: ['owner', 'manager'],
        delete: ['owner'], // Only owners can delete users
        suspend: ['owner', 'manager']
    },

    // Property management permissions
    properties: {
        view: ['owner', 'manager', 'tenant'],
        create: ['owner', 'manager'],
        update: ['owner', 'manager'],
        delete: ['owner'], // Only owners can delete properties
        assign: ['owner', 'manager']
    },

    // Financial permissions
    financial: {
        view_reports: ['owner', 'accountant'],
        generate_statements: ['owner', 'accountant', 'manager'],
        approve_expenses: ['owner', 'manager']
    }
};



// Check if user has specific permission
const hasPermission = (userRole, resource, action) => {
    if (!PERMISSIONS[resource] || !PERMISSIONS[resource][action]) {
        return false;
    }

    return PERMISSIONS[resource][action].includes(userRole);
};



// Check role hierarchy
// Utility functions for direct use in controllers
const authUtils = {
    canViewPayments: (role) => hasPermission(role, 'payments', 'view'),
    canCreatePayments: (role) => hasPermission(role, 'payments', 'create'),
    canUpdatePayments: (role) => hasPermission(role, 'payments', 'update'),
    canDeletePayments: (role) => hasPermission(role, 'payments', 'delete'),
    canApprovePayments: (role) => hasPermission(role, 'payments', 'approve'),

    canManageUsers: (role) => hasPermission(role, 'users', 'create') ||
        hasPermission(role, 'users', 'update') ||
        hasPermission(role, 'users', 'delete'),

    isOwner: (role) => role === 'owner',
    isManager: (role) => role === 'manager',
    isAccountant: (role) => role === 'accountant',
    isTenant: (role) => role === 'tenant'
};

module.exports = {
    requireRole,
    requirePermission,
    hasPermission,
    PERMISSIONS,
    ...authUtils
};