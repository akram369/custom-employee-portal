const express = require('express');
const router = express.Router();
const zohoController = require('../controllers/zohoController');
const authenticateToken = require('../middlewares/auth');

// All Zoho integration routes require valid employee portal session
router.use(authenticateToken);

// Get applications filtered by calling user's assigned role
router.get('/apps', zohoController.getAuthorizedApps);

// Backend proxy endpoint for live/demo data (RBAC enforced per application inside controller)
router.get('/app/:appId/data', zohoController.getAppData);

// Generate authorized launch action
router.post('/app/:appId/launch', zohoController.launchApp);

// Inspect Zoho service account status
router.get('/status', zohoController.getZohoStatus);

module.exports = router;
