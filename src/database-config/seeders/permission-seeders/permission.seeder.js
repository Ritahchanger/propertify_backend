// permission.seeder.js
const { sequelize } = require('../../database-config'); // Adjust path to your database config
const { Permission, RolePermission } = require('../../index'); // Adjust path to your models

const seedPermissions = async () => {
  try {
    console.log("🌱 Starting permission seeder...");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Create all permissions
    const permissions = await Permission.bulkCreate([
      // User Management
      { name: "users:create", description: "Create new users", category: "users" },
      { name: "users:read", description: "View users", category: "users" },
      { name: "users:update", description: "Update users", category: "users" },
      { name: "users:delete", description: "Delete users", category: "users" },
      
      // Property Management
      { name: "properties:create", description: "Create properties", category: "properties" },
      { name: "properties:read", description: "View properties", category: "properties" },
      { name: "properties:update", description: "Update properties", category: "properties" },
      { name: "properties:delete", description: "Delete properties", category: "properties" },
      
      // Financial Management
      { name: "financial:read", description: "View financial data", category: "financial" },
      { name: "financial:update", description: "Update financial data", category: "financial" },
      
      // Approval Management
      { name: "approvals:manage", description: "Manage user approvals", category: "approvals" },
      
      // Reports
      { name: "reports:view", description: "View reports", category: "reports" },
      
      // Settings
      { name: "settings:manage", description: "Manage system settings", category: "settings" },
      
      // Payments
      { name: "payments:create", description: "Create payments", category: "payments" },
      { name: "payments:read", description: "View payments", category: "payments" },
      
      // Profile
      { name: "profile:update", description: "Update own profile", category: "profile" },
    ], { 
      ignoreDuplicates: true,
      returning: true 
    });

    console.log(`✅ ${permissions.length} permissions created/verified.`);

    // Map permissions for easy access
    const permissionMap = {};
    permissions.forEach(permission => {
      permissionMap[permission.name] = permission.id;
    });

    // Define role-permission mappings
    const rolePermissionsData = [
      // Owner permissions - full access
      { role: "owner", permissionId: permissionMap["users:create"] },
      { role: "owner", permissionId: permissionMap["users:read"] },
      { role: "owner", permissionId: permissionMap["users:update"] },
      { role: "owner", permissionId: permissionMap["users:delete"] },
      { role: "owner", permissionId: permissionMap["properties:create"] },
      { role: "owner", permissionId: permissionMap["properties:read"] },
      { role: "owner", permissionId: permissionMap["properties:update"] },
      { role: "owner", permissionId: permissionMap["properties:delete"] },
      { role: "owner", permissionId: permissionMap["financial:read"] },
      { role: "owner", permissionId: permissionMap["financial:update"] },
      { role: "owner", permissionId: permissionMap["approvals:manage"] },
      { role: "owner", permissionId: permissionMap["reports:view"] },
      { role: "owner", permissionId: permissionMap["settings:manage"] },

      // Manager permissions
      { role: "manager", permissionId: permissionMap["users:read"] },
      { role: "manager", permissionId: permissionMap["users:update"] },
      { role: "manager", permissionId: permissionMap["properties:create"] },
      { role: "manager", permissionId: permissionMap["properties:read"] },
      { role: "manager", permissionId: permissionMap["properties:update"] },
      { role: "manager", permissionId: permissionMap["financial:read"] },
      { role: "manager", permissionId: permissionMap["approvals:manage"] },
      { role: "manager", permissionId: permissionMap["reports:view"] },

      // Accountant permissions
      { role: "accountant", permissionId: permissionMap["financial:read"] },
      { role: "accountant", permissionId: permissionMap["financial:update"] },
      { role: "accountant", permissionId: permissionMap["properties:read"] },
      { role: "accountant", permissionId: permissionMap["reports:view"] },

      // Tenant permissions
      { role: "tenant", permissionId: permissionMap["properties:read"] },
      { role: "tenant", permissionId: permissionMap["payments:create"] },
      { role: "tenant", permissionId: permissionMap["payments:read"] },
      { role: "tenant", permissionId: permissionMap["profile:update"] },
    ];

    const rolePermissions = await RolePermission.bulkCreate(rolePermissionsData, { 
      ignoreDuplicates: true 
    });

    console.log(`✅ ${rolePermissions.length} role-permission mappings created/verified.`);
    console.log("🎉 Permission seeder completed successfully!");

  } catch (error) {
    console.error("❌ Permission seeder failed:", error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("🔌 Database connection closed.");
  }
};

// Export the seeder function
module.exports = seedPermissions;

// Run directly if this file is executed
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log("✨ Seeder execution finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeder execution failed!");
      process.exit(1);
    });
}