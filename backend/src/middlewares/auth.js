const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { logAuditEvent } = require('./auditLogger');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please log in.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'portal_jwt_secret_fallback');

    const user = await db.getAsync(
      'SELECT id, name, email, department, designation, isActive FROM Users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact an administrator.'
      });
    }

    const rolesQuery = await db.allAsync(`
      SELECT r.id, r.name 
      FROM Roles r
      JOIN UserRoles ur ON r.id = ur.roleId
      WHERE ur.userId = ?
    `, [user.id]);

    const roles = rolesQuery.map(r => r.name);

    const permsQuery = await db.allAsync(`
      SELECT DISTINCT p.name, p.module
      FROM Permissions p
      JOIN RolePermissions rp ON p.id = rp.permissionId
      JOIN UserRoles ur ON rp.roleId = ur.roleId
      WHERE ur.userId = ?
    `, [user.id]);

    const permissions = permsQuery.map(p => p.name);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      designation: user.designation,
      roles,
      permissions
    };

    next();
  } catch (err) {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logAuditEvent({
      userId: null,
      userEmail: 'UNKNOWN',
      action: 'AUTH_FAILED',
      resource: req.originalUrl,
      details: `JWT verification failure: ${err.message}`,
      ipAddress,
      status: 'FAILED'
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
}

module.exports = authenticateToken;
