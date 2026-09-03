const express = require('express');
const router = express.Router();
const zohoController = require('../controllers/zohoController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/apps', zohoController.getAuthorizedApps);
router.get('/app/:appId/data', zohoController.getAppData);
router.post('/app/:appId/launch', zohoController.launchApp);
router.get('/status', zohoController.getZohoStatus);

module.exports = router;
