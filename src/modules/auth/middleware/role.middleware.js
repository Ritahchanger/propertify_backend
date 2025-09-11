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
            console.log('🔍 requireRole - Starting role check');
            console.log('🔍 req.user:', req.user);
            console.log('🔍 req.user.id:', req.user?.id);
            console.log('🔍 Required roles:', requiredRoles);

            if (!req.user || !req.user.id) {
                console.log('❌ requireRole failed: No req.user or req.user.id');
                console.log('❌ req.user exists:', !!req.user);
                console.log('❌ req.user.id exists:', req.user?.id ? 'Yes' : 'No');
                return res.status(401).json({ error: 'Authentication required' });
            }

            console.log('🔍 Fetching user from database with ID:', req.user.id);

            // Fetch fresh user data to ensure role is current
            const user = await User.findByPk(req.user.id);
            if (!user) {
                console.log('❌ User not found in database for ID:', req.user.id);
                return res.status(404).json({ error: 'User not found' });
            }

            console.log('✅ User found in database:', { id: user.id, role: user.role, email: user.email });

            const userRole = user.role;

            // Check if user has any of the required roles
            const hasAccess = Array.isArray(requiredRoles)
                ? requiredRoles.some(role => hasRole(userRole, role))
                : hasRole(userRole, requiredRoles);

            if (!hasAccess) {
                console.log('❌ Access denied. User role:', userRole, 'Required roles:', requiredRoles);
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    message: `Required role: ${requiredRoles}, Your role: ${userRole}`
                });
            }

            console.log('✅ Access granted. Role check passed');

            req.user.role = userRole; // Ensure fresh role is used
            next();
        } catch (error) {
            console.error('❌ Role check error:', error);
            console.error('❌ Error details:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};


module.exports = {
    requirePermission, requireRole
}