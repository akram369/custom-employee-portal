const {
  ZOHO_APPS,
  isZohoConfigured,
  getZohoAccessToken,
  getApplicationsForRoles,
  fetchZohoPeopleData,
  fetchZohoCrmData,
  fetchZohoDeskData,
  fetchZohoBooksData
} = require('../services/zohoService');
const { logAuditEvent } = require('../middlewares/auditLogger');

async function getAuthorizedApps(req, res) {
  const userRoles = req.user.roles || [];
  const authorizedApps = getApplicationsForRoles(userRoles);

  const allAppsWithStatus = ZOHO_APPS.map(app => {
    const isAllowed = userRoles.includes('Admin') || userRoles.includes(app.role);
    return {
      ...app,
      isAllowed
    };
  });

  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  await logAuditEvent({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'FETCH_AUTHORIZED_APPS',
    resource: '/api/zoho/apps',
    details: `Retrieved ${authorizedApps.length} authorized apps for roles [${userRoles.join(', ')}]`,
    ipAddress,
    status: 'SUCCESS'
  });

  return res.status(200).json({
    success: true,
    userRoles,
    authorizedApps,
    allApps: allAppsWithStatus
  });
}

async function getAppData(req, res) {
  const { appId } = req.params;
  const userRoles = req.user.roles || [];
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  const app = ZOHO_APPS.find(a => a.id === appId);
  if (!app) {
    return res.status(404).json({
      success: false,
      message: `Unknown Zoho service: ${appId}`
    });
  }

  const isAllowed = userRoles.includes('Admin') || userRoles.includes(app.role);

  if (!isAllowed) {
    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ZOHO_PROXY_DENIED',
      resource: `/api/zoho/app/${appId}/data`,
      details: `Unauthorized attempt: User roles [${userRoles.join(', ')}] cannot access ${app.name} (${app.role} role required)`,
      ipAddress,
      status: 'ACCESS_DENIED'
    });

    return res.status(403).json({
      success: false,
      message: `Access Denied: Your assigned role (${userRoles.join(', ')}) is not permitted to access ${app.name}. Requires ${app.role} role.`
    });
  }

  try {
    const tokenInfo = await getZohoAccessToken();

    let result;
    switch (appId) {
      case 'zoho_people':
        result = await fetchZohoPeopleData(tokenInfo);
        break;
      case 'zoho_crm':
        result = await fetchZohoCrmData(tokenInfo);
        break;
      case 'zoho_desk':
        result = await fetchZohoDeskData(tokenInfo);
        break;
      case 'zoho_books':
        result = await fetchZohoBooksData(tokenInfo);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unsupported service' });
    }

    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ZOHO_PROXY_SUCCESS',
      resource: `/api/zoho/app/${appId}/data`,
      details: `Backend proxied data for ${app.name} (${result.source})`,
      ipAddress,
      status: 'SUCCESS'
    });

    return res.status(200).json({
      success: true,
      app: {
        id: app.id,
        name: app.name,
        role: app.role,
        category: app.category,
        officialUrl: app.officialUrl
      },
      integration: {
        isLive: result.isLive,
        source: result.source,
        backendServiceAccount: true,
        credentialsExposedToClient: false
      },
      payload: result.data
    });
  } catch (error) {
    console.error(`Zoho proxy error for ${appId}:`, error);
    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ZOHO_PROXY_ERROR',
      resource: `/api/zoho/app/${appId}/data`,
      details: error.message,
      ipAddress,
      status: 'FAILED'
    });

    return res.status(500).json({
      success: false,
      message: `Failed to retrieve data from ${app.name}`,
      error: error.message
    });
  }
}

async function launchApp(req, res) {
  const { appId } = req.params;
  const userRoles = req.user.roles || [];
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  const app = ZOHO_APPS.find(a => a.id === appId);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const isAllowed = userRoles.includes('Admin') || userRoles.includes(app.role);
  if (!isAllowed) {
    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ZOHO_LAUNCH_DENIED',
      resource: `/api/zoho/app/${appId}/launch`,
      details: `User roles [${userRoles.join(', ')}] blocked from launching ${app.name}`,
      ipAddress,
      status: 'ACCESS_DENIED'
    });

    return res.status(403).json({
      success: false,
      message: `Access Denied: Cannot launch ${app.name}. Assigned role required: ${app.role}`
    });
  }

  await logAuditEvent({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'ZOHO_LAUNCH_SUCCESS',
    resource: `/api/zoho/app/${appId}/launch`,
    details: `Portal user launched ${app.name} via backend authorization`,
    ipAddress,
    status: 'SUCCESS'
  });

  return res.status(200).json({
    success: true,
    appName: app.name,
    targetUrl: app.officialUrl,
    requiresEmployeeCredentials: false,
    authProtocol: 'OAuth2_Backend_Service_Account'
  });
}

async function getZohoStatus(req, res) {
  const configured = isZohoConfigured();
  const tokenInfo = await getZohoAccessToken();

  return res.status(200).json({
    success: true,
    configured,
    mode: configured ? 'Production OAuth' : 'Demo Verification Mode',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in',
    tokenStatus: {
      hasActiveToken: Boolean(tokenInfo.token),
      isLive: tokenInfo.isLive,
      cached: tokenInfo.cached || false,
      error: tokenInfo.error || null
    },
    supportedApps: ZOHO_APPS.map(a => ({ id: a.id, name: a.name, role: a.role, url: a.officialUrl }))
  });
}

module.exports = {
  getAuthorizedApps,
  getAppData,
  launchApp,
  getZohoStatus
};
