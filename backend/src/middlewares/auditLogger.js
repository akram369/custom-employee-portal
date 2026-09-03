const { db } = require('../config/db');

async function logAuditEvent({
  userId = null,
  userEmail = 'ANONYMOUS',
  action,
  resource,
  details = '',
  ipAddress = '127.0.0.1',
  status = 'SUCCESS'
}) {
  try {
    const stringDetails = typeof details === 'object' ? JSON.stringify(details) : String(details);
    await db.runAsync(
      `INSERT INTO AuditLogs (userId, userEmail, action, resource, details, ipAddress, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, userEmail, action, resource, stringDetails, ipAddress, status]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

function auditMiddleware(req, res, next) {
  req.logAudit = async (action, resource, details = '', status = 'SUCCESS') => {
    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : (req.body && req.body.email ? req.body.email : 'ANONYMOUS');
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    await logAuditEvent({
      userId,
      userEmail,
      action,
      resource,
      details,
      ipAddress,
      status
    });
  };
  next();
}

module.exports = {
  logAuditEvent,
  auditMiddleware
};
