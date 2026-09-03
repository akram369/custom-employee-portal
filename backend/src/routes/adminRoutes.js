const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/rbac');

router.use(authenticateToken);
router.use(verifyRole('Admin'));

router.get('/stats', adminController.getSystemStats);

router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/roles', adminController.listRoles);
router.put('/roles/:roleId/permissions', adminController.updateRolePermissions);

router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
