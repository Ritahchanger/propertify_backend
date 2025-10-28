const { User } = require('../../../database-config/index');
// Middleware for specific permission checks
const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!hasPermission(user.role, resource, action)) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    message: `Cannot ${action} ${resource} with role: ${user.role}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};


const ROLE_HIERARCHY = {
    owner: ['owner', 'manager', 'tenant', 'accountant'],
    manager: ['manager', 'tenant', 'accountant'],
    accountant: ['accountant'],
    tenant: ['tenant']
};



const hasRole = (userRole, requiredRole) => {
    return ROLE_HIERARCHY[userRole]?.includes(requiredRole) || false;
};


// Middleware to check if user has required role
const requireRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            // ✅ Check authentication
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized",
                    message: "You must be logged in to access this resource."
                });
            }

            // ✅ Fetch user from DB
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User Not Found",
                    message: "The authenticated user does not exist in the system."
                });
            }

            const userRole = user.role;

            // ✅ Check if the user has one of the required roles
            const hasAccess = Array.isArray(requiredRoles)
                ? requiredRoles.some(role => hasRole(userRole, role))
                : hasRole(userRole, requiredRoles);

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: `Access denied. Your role (${userRole}) does not have the required permissions. Allowed roles: [${requiredRoles}].`
                });
            }

            // ✅ Attach role to request for downstream use
            req.user.role = userRole;
            next();

        } catch (error) {
            console.error("Role check failed:", error);
            return res.status(500).json({
                success: false,
                error: "Internal Server Error",
                message: "Something went wrong while verifying your permissions. Please try again later."
            });
        }
    };
};



module.exports = {
    requirePermission, requireRole
}