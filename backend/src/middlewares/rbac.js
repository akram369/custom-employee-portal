const { logAuditEvent } = require('./auditLogger');

/**
 * Middleware to restrict access based on user role(s).
 * Admins always have supervisory access.
 * @param {string|string[]} allowedRoles
 */
const verifyRole = (allowedRoles) => {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRoles = req.user.roles || [];
    // Check if user has one of the allowed roles or is an Admin
    const hasRole = userRoles.some(r => rolesArray.includes(r) || r === 'Admin');

    if (!hasRole) {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await logAuditEvent({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'ACCESS_DENIED_ROLE',
        resource: req.originalUrl,
        details: `Forbidden: User with roles [${userRoles.join(', ')}] attempted access requiring [${rolesArray.join(', ')}]`,
        ipAddress,
        status: 'ACCESS_DENIED'
      });

      return res.status(403).json({
        success: false,
        message: 'Access Denied: Insufficient Permissions',
        requiredRoles: rolesArray,
        userRoles
      });
    }

    next();
  };
};

/**
 * Middleware to restrict access based on granular permission name.
 * @param {string} requiredPermission
 */
const verifyPermission = (requiredPermission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRoles = req.user.roles || [];
    const userPermissions = req.user.permissions || [];

    // Admins bypass granular checks; otherwise check permission list
    const hasPermission = userRoles.includes('Admin') || userPermissions.includes(requiredPermission);

    if (!hasPermission) {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await logAuditEvent({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'ACCESS_DENIED_PERMISSION',
        resource: req.originalUrl,
        details: `Forbidden: User missing required permission '${requiredPermission}'`,
        ipAddress,
        status: 'ACCESS_DENIED'
      });

      return res.status(403).json({
        success: false,
        message: `Access Denied: Missing permission '${requiredPermission}'`
      });
    }

    next();
  };
};

module.exports = {
  verifyRole,
  verifyPermission
};
