const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Backend RBAC & Zoho Integration Tests ---');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  try {
    const health = await axios.get(`${BASE_URL}/health`);
    assert(health.data.status === 'UP', 'Health check returns UP');

    const demo = await axios.get(`${BASE_URL}/auth/demo-accounts`);
    assert(demo.data.demoAccounts.length >= 5, 'Demo accounts endpoint returns at least 5 accounts');

    const salesLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'sales@company.com',
      password: 'Password@123'
    });
    const salesToken = salesLogin.data.token;
    assert(salesLogin.data.success === true, 'Sales login succeeds');
    assert(salesLogin.data.user.roles.includes('Sales'), 'Sales user has role Sales');

    const salesApps = await axios.get(`${BASE_URL}/zoho/apps`, {
      headers: { Authorization: `Bearer ${salesToken}` }
    });
    const authorizedAppIds = salesApps.data.authorizedApps.map(a => a.id);
    assert(
      authorizedAppIds.includes('zoho_crm') && !authorizedAppIds.includes('zoho_books'),
      'Sales user only receives Zoho CRM as authorized application'
    );

    const crmData = await axios.get(`${BASE_URL}/zoho/app/zoho_crm/data`, {
      headers: { Authorization: `Bearer ${salesToken}` }
    });
    assert(crmData.data.success === true && crmData.data.app.name === 'Zoho CRM', 'Sales user can proxy Zoho CRM data');

    try {
      await axios.get(`${BASE_URL}/zoho/app/zoho_books/data`, {
        headers: { Authorization: `Bearer ${salesToken}` }
      });
      assert(false, 'Sales user blocked from accessing Zoho Books');
    } catch (err) {
      assert(err.response?.status === 403, 'Sales user receives HTTP 403 when accessing Zoho Books');
    }

    try {
      await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${salesToken}` }
      });
      assert(false, 'Sales user blocked from accessing Admin endpoints');
    } catch (err) {
      assert(err.response?.status === 403, 'Sales user receives HTTP 403 when accessing /api/admin/users');
    }

    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@company.com',
      password: 'Password@123'
    });
    const adminToken = adminLogin.data.token;
    assert(adminLogin.data.success === true && adminLogin.data.user.roles.includes('Admin'), 'Admin login succeeds');

    const adminApps = await axios.get(`${BASE_URL}/zoho/apps`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminApps.data.authorizedApps.length === 4, 'Admin receives all 4 integrated Zoho One applications');

    const userList = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(userList.data.users.length >= 5, 'Admin can list users');

    const auditLogs = await axios.get(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const hasAccessDenied = auditLogs.data.logs.some(l => l.status === 'ACCESS_DENIED');
    assert(hasAccessDenied, 'Audit logs recorded recent ACCESS_DENIED security events');

    console.log(`\nResults: ${passed}/${total} tests passed.`);
  } catch (error) {
    console.error('Test suite failed with unhandled error:', error.response?.data || error.message);
  }
}

runTests();
