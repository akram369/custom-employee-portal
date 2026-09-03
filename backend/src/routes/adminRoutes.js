const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/rbac');

// All admin endpoints require authentication AND Admin role verification
router.use(authenticateToken);
router.use(verifyRole('Admin'));

// System metrics
router.get('/stats', adminController.getSystemStats);

// User management
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Role & Permission management
router.get('/roles', adminController.listRoles);
router.put('/roles/:roleId/permissions', adminController.updateRolePermissions);

// Audit logging trail
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
