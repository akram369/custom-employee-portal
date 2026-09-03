const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { logAuditEvent } = require('../middlewares/auditLogger');
const { ZOHO_APPS } = require('../services/zohoService');

/**
 * Login user and issue JWT
 */
async function login(req, res) {
  const { email, password } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    // Find user by email
    const user = await db.getAsync(
      'SELECT id, name, email, password, department, designation, isActive FROM Users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (!user) {
      await logAuditEvent({
        userId: null,
        userEmail: email,
        action: 'AUTH_LOGIN_FAILED',
        resource: '/api/auth/login',
        details: 'Invalid credentials: User email not found',
        ipAddress,
        status: 'FAILED'
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        action: 'AUTH_LOGIN_BLOCKED',
        resource: '/api/auth/login',
        details: 'Login attempt on deactivated account',
        ipAddress,
        status: 'ACCESS_DENIED'
      });
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Contact your administrator.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        action: 'AUTH_LOGIN_FAILED',
        resource: '/api/auth/login',
        details: 'Invalid credentials: Password mismatch',
        ipAddress,
        status: 'FAILED'
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Fetch user roles
    const rolesQuery = await db.allAsync(`
      SELECT r.name 
      FROM Roles r
      JOIN UserRoles ur ON r.id = ur.roleId
      WHERE ur.userId = ?
    `, [user.id]);
    const roles = rolesQuery.map(r => r.name);

    // Fetch permissions
    const permsQuery = await db.allAsync(`
      SELECT DISTINCT p.name
      FROM Permissions p
      JOIN RolePermissions rp ON p.id = rp.permissionId
      JOIN UserRoles ur ON rp.roleId = ur.roleId
      WHERE ur.userId = ?
    `, [user.id]);
    const permissions = permsQuery.map(p => p.name);

    // Sign JWT
    const secret = process.env.JWT_SECRET || 'portal_jwt_secret_fallback';
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles,
        permissions
      },
      secret,
      { expiresIn }
    );

    // Audit log
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: '/api/auth/login',
      details: `User logged in successfully with roles: [${roles.join(', ')}]`,
      ipAddress,
      status: 'SUCCESS'
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        designation: user.designation,
        roles,
        permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected internal server error occurred'
    });
  }
}

/**
 * Get currently authenticated user profile
 */
async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

/**
 * Get list of available demo accounts for 1-click switcher
 */
async function getDemoAccounts(req, res) {
  try {
    const users = await db.allAsync(`
      SELECT u.id, u.name, u.email, u.department, u.designation, r.name as role
      FROM Users u
      JOIN UserRoles ur ON u.id = ur.userId
      JOIN Roles r ON ur.roleId = r.id
      ORDER BY u.id ASC
    `);

    // Enrich with target Zoho application info
    const enriched = users.map(u => {
      let targetApp = 'All Zoho One Services';
      if (u.role === 'HR') targetApp = 'Zoho People';
      else if (u.role === 'Sales') targetApp = 'Zoho CRM';
      else if (u.role === 'Support') targetApp = 'Zoho Desk';
      else if (u.role === 'Finance') targetApp = 'Zoho Books';

      return {
        ...u,
        targetApp,
        passwordHint: 'Password@123'
      };
    });

    return res.status(200).json({
      success: true,
      demoAccounts: enriched
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  login,
  getMe,
  getDemoAccounts
};
