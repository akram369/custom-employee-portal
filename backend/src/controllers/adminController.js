const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { logAuditEvent } = require('../middlewares/auditLogger');

async function listUsers(req, res) {
  try {
    const users = await db.allAsync(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.department, 
        u.designation, 
        u.isActive, 
        u.createdAt,
        GROUP_CONCAT(r.name) as roles
      FROM Users u
      LEFT JOIN UserRoles ur ON u.id = ur.userId
      LEFT JOIN Roles r ON ur.roleId = r.id
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    const formatted = users.map(u => ({
      ...u,
      isActive: Boolean(u.isActive),
      roles: u.roles ? u.roles.split(',') : []
    }));

    return res.status(200).json({ success: true, users: formatted });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function createUser(req, res) {
  const { name, email, password, department, designation, roleId } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!name || !email || !password || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, password, and at least one role are required'
    });
  }

  try {
    const existing = await db.getAsync('SELECT id FROM Users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await db.runAsync(
      'INSERT INTO Users (name, email, password, department, designation, isActive) VALUES (?, ?, ?, ?, ?, 1)',
      [name.trim(), email.trim(), hashedPassword, department || '', designation || '']
    );

    const newUserId = userResult.lastID;

    const roleIds = Array.isArray(roleId) ? roleId : [roleId];
    for (const rId of roleIds) {
      await db.runAsync(
        'INSERT INTO UserRoles (userId, roleId) VALUES (?, ?)',
        [newUserId, rId]
      );
    }

    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ADMIN_CREATE_USER',
      resource: `/api/admin/users/${newUserId}`,
      details: `Created new user: ${email} with roleIds: [${roleIds.join(', ')}]`,
      ipAddress,
      status: 'SUCCESS'
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: newUserId
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { name, department, designation, isActive, roleId } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    const user = await db.getAsync('SELECT id, email FROM Users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined || department !== undefined || designation !== undefined || isActive !== undefined) {
      await db.runAsync(
        `UPDATE Users 
         SET name = COALESCE(?, name),
             department = COALESCE(?, department),
             designation = COALESCE(?, designation),
             isActive = COALESCE(?, isActive),
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, department, designation, isActive !== undefined ? (isActive ? 1 : 0) : null, id]
      );
    }

    if (roleId !== undefined) {
      await db.runAsync('DELETE FROM UserRoles WHERE userId = ?', [id]);
      const roleIds = Array.isArray(roleId) ? roleId : [roleId];
      for (const rId of roleIds) {
        await db.runAsync('INSERT INTO UserRoles (userId, roleId) VALUES (?, ?)', [id, rId]);
      }
    }

    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ADMIN_UPDATE_USER',
      resource: `/api/admin/users/${id}`,
      details: `Updated user profile/roles for: ${user.email}`,
      ipAddress,
      status: 'SUCCESS'
    });

    return res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admins cannot delete their own active account' });
    }

    const user = await db.getAsync('SELECT id, email FROM Users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.runAsync('DELETE FROM Users WHERE id = ?', [id]);

    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ADMIN_DELETE_USER',
      resource: `/api/admin/users/${id}`,
      details: `Deleted user: ${user.email}`,
      ipAddress,
      status: 'SUCCESS'
    });

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function listRoles(req, res) {
  try {
    const roles = await db.allAsync('SELECT * FROM Roles ORDER BY id ASC');
    const allPermissions = await db.allAsync('SELECT * FROM Permissions ORDER BY module ASC, id ASC');

    const enrichedRoles = [];
    for (const r of roles) {
      const perms = await db.allAsync(`
        SELECT p.id, p.name, p.module, p.description
        FROM Permissions p
        JOIN RolePermissions rp ON p.id = rp.permissionId
        WHERE rp.roleId = ?
      `, [r.id]);

      enrichedRoles.push({
        ...r,
        permissions: perms
      });
    }

    return res.status(200).json({
      success: true,
      roles: enrichedRoles,
      allPermissions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateRolePermissions(req, res) {
  const { roleId } = req.params;
  const { permissionIds } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ success: false, message: 'permissionIds must be an array of IDs' });
  }

  try {
    const role = await db.getAsync('SELECT id, name FROM Roles WHERE id = ?', [roleId]);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    await db.runAsync('DELETE FROM RolePermissions WHERE roleId = ?', [roleId]);

    for (const pId of permissionIds) {
      await db.runAsync('INSERT INTO RolePermissions (roleId, permissionId) VALUES (?, ?)', [roleId, pId]);
    }

    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ADMIN_UPDATE_ROLE_PERMS',
      resource: `/api/admin/roles/${roleId}/permissions`,
      details: `Updated permissions for role ${role.name}: [${permissionIds.join(', ')}]`,
      ipAddress,
      status: 'SUCCESS'
    });

    return res.status(200).json({
      success: true,
      message: `Permissions updated for role ${role.name}`
    });
  } catch (error) {
    console.error('Update role permissions error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getAuditLogs(req, res) {
  const { action, status, search, limit = 100 } = req.query;

  try {
    let sql = 'SELECT * FROM AuditLogs WHERE 1=1';
    const params = [];

    if (action) {
      sql += ' AND action LIKE ?';
      params.push(`%${action}%`);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (userEmail LIKE ? OR resource LIKE ? OR details LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const logs = await db.allAsync(sql, params);
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error('Audit logs query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getSystemStats(req, res) {
  try {
    const userCount = await db.getAsync('SELECT count(*) as count FROM Users');
    const roleCount = await db.getAsync('SELECT count(*) as count FROM Roles');
    const permCount = await db.getAsync('SELECT count(*) as count FROM Permissions');
    const auditCount = await db.getAsync('SELECT count(*) as count FROM AuditLogs');
    const recentAccessDenied = await db.getAsync("SELECT count(*) as count FROM AuditLogs WHERE status = 'ACCESS_DENIED'");

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: userCount.count,
        totalRoles: roleCount.count,
        totalPermissions: permCount.count,
        totalAuditEvents: auditCount.count,
        securityViolationsBlocked: recentAccessDenied.count
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  updateRolePermissions,
  getAuditLogs,
  getSystemStats
};
