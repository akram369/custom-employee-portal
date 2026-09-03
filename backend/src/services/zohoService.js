const axios = require('axios');

// In-memory cache for Zoho access token
let cachedToken = null;
let tokenExpiresAt = 0;

// Zoho Applications Registry with RBAC mappings
const ZOHO_APPS = [
  {
    id: 'zoho_people',
    name: 'Zoho People',
    role: 'HR',
    category: 'Human Resources & Talent',
    description: 'Centralized employee directory, leave requests, attendance, and HR document management.',
    officialUrl: 'https://people.zoho.com',
    icon: 'Users',
    themeColor: '#10B981', // Emerald
    accentBg: 'rgba(16, 185, 129, 0.1)',
    features: ['Employee Directory', 'Leave Tracking', 'Performance Reviews', 'Timesheets']
  },
  {
    id: 'zoho_crm',
    name: 'Zoho CRM',
    role: 'Sales',
    category: 'Customer Relationship Management',
    description: 'Omnichannel lead pipeline, account tracking, deal negotiations, and sales analytics.',
    officialUrl: 'https://crm.zoho.com',
    icon: 'TrendingUp',
    themeColor: '#3B82F6', // Blue
    accentBg: 'rgba(59, 130, 246, 0.1)',
    features: ['Lead Generation', 'Deal Pipeline', 'Contact Management', 'Sales Forecasting']
  },
  {
    id: 'zoho_desk',
    name: 'Zoho Desk',
    role: 'Support',
    category: 'Customer Service & Ticketing',
    description: 'Context-aware customer service helpdesk, ticket prioritization, and SLA resolution engine.',
    officialUrl: 'https://desk.zoho.com',
    icon: 'Headphones',
    themeColor: '#F59E0B', // Amber
    accentBg: 'rgba(245, 158, 11, 0.1)',
    features: ['Ticket Management', 'SLA Tracking', 'Knowledge Base', 'Customer Satisfaction']
  },
  {
    id: 'zoho_books',
    name: 'Zoho Books',
    role: 'Finance',
    category: 'Accounting & Financial Control',
    description: 'Online accounting, customer invoices, payment reconciliation, and GST/VAT compliant reporting.',
    officialUrl: 'https://books.zoho.com',
    icon: 'Receipt',
    themeColor: '#8B5CF6', // Purple
    accentBg: 'rgba(139, 92, 246, 0.1)',
    features: ['Invoices & Billing', 'Expense Tracking', 'Bank Reconciliation', 'Financial Reports']
  }
];

/**
 * Checks if the backend has valid production Zoho credentials configured
 */
function isZohoConfigured() {
  if (process.env.ZOHO_MODE === 'demo') return false;
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;
  return (
    ZOHO_CLIENT_ID &&
    ZOHO_CLIENT_SECRET &&
    ZOHO_REFRESH_TOKEN &&
    !ZOHO_CLIENT_ID.startsWith('demo_') &&
    !ZOHO_REFRESH_TOKEN.startsWith('demo_')
  );
}

/**
 * Retrieves a Zoho OAuth Access Token using the backend service account refresh token.
 * Caches token in memory until expiration.
 */
async function getZohoAccessToken() {
  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return { token: cachedToken, isLive: true, cached: true };
  }

  if (!isZohoConfigured()) {
    // Return simulated backend service token in demo mode
    cachedToken = 'zoho_simulated_backend_token_' + Date.now();
    tokenExpiresAt = Date.now() + 3600 * 1000;
    return { token: cachedToken, isLive: false, cached: false };
  }

  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in';

  try {
    const response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    });

    if (response.data && response.data.access_token) {
      cachedToken = response.data.access_token;
      // Expires in seconds (usually 3600), subtract 2 minutes buffer
      const expiresInSec = response.data.expires_in || 3600;
      tokenExpiresAt = Date.now() + (expiresInSec - 120) * 1000;
      return { token: cachedToken, isLive: true, cached: false };
    } else {
      throw new Error(response.data.error || 'No access_token returned by Zoho');
    }
  } catch (error) {
    console.error('Zoho OAuth Token Retrieval Error:', error.response?.data || error.message);
    // Fallback to simulated token to prevent service interruption
    cachedToken = 'zoho_simulated_backend_token_fallback_' + Date.now();
    tokenExpiresAt = Date.now() + 1800 * 1000;
    return { token: cachedToken, isLive: false, error: error.message };
  }
}

/**
 * Helper to determine regional API URLs based on accounts domain
 */
function getRegionalApiUrl(service) {
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in';
  const isIndia = accountsUrl.includes('.in');

  switch (service) {
    case 'people':
      return isIndia ? 'https://people.zoho.in/people/api/forms/json/employee/getRecords' : 'https://people.zoho.com/people/api/forms/json/employee/getRecords';
    case 'crm':
      return isIndia ? 'https://www.zohoapis.in/crm/v2/Leads' : 'https://www.zohoapis.com/crm/v2/Leads';
    case 'desk':
      return isIndia ? 'https://desk.zoho.in/api/v1/tickets' : 'https://desk.zoho.com/api/v1/tickets';
    case 'books':
      return isIndia ? 'https://books.zoho.in/api/v3/invoices' : 'https://books.zoho.com/api/v3/invoices';
    default:
      return '';
  }
}

/**
 * Gets Zoho applications permitted for a set of roles
 */
function getApplicationsForRoles(userRoles = []) {
  if (userRoles.includes('Admin')) {
    return ZOHO_APPS; // Admin has access to all integrated Zoho One services
  }

  return ZOHO_APPS.filter(app => userRoles.includes(app.role));
}

/**
 * Fetches data for Zoho People (HR)
 */
async function fetchZohoPeopleData(tokenInfo) {
  if (tokenInfo.isLive && !tokenInfo.error) {
    try {
      const url = getRegionalApiUrl('people');
      const response = await axios.get(url, {
        headers: { Authorization: `Zoho-oauthtoken ${tokenInfo.token}` },
        timeout: 6000
      });
      return {
        isLive: true,
        source: 'Live Zoho People API',
        data: response.data
      };
    } catch (err) {
      console.warn('Live Zoho People API failed, serving verified mock dataset:', err.message);
    }
  }

  // Simulated live Zoho People records
  return {
    isLive: false,
    source: 'Zoho People Backend Proxy (Demo Simulation)',
    data: {
      totalEmployees: 48,
      activeLeavesToday: 3,
      openRequisitions: 5,
      records: [
        { id: 'EMP-1001', name: 'Sophia Sterling', department: 'Human Resources', role: 'HR Specialist', status: 'Active', leaveBalance: '18 Days' },
        { id: 'EMP-1002', name: 'Liam Gallagher', department: 'Engineering', role: 'Fullstack Architect', status: 'Active', leaveBalance: '14 Days' },
        { id: 'EMP-1003', name: 'Maya Lin', department: 'Product Design', role: 'Senior UX Designer', status: 'On Leave', leaveBalance: '9 Days' },
        { id: 'EMP-1004', name: 'Julian Drake', department: 'Customer Success', role: 'Support Engineer', status: 'Active', leaveBalance: '22 Days' }
      ]
    }
  };
}

/**
 * Fetches data for Zoho CRM (Sales)
 */
async function fetchZohoCrmData(tokenInfo) {
  if (tokenInfo.isLive && !tokenInfo.error) {
    try {
      const url = getRegionalApiUrl('crm');
      const response = await axios.get(url, {
        headers: { Authorization: `Zoho-oauthtoken ${tokenInfo.token}` },
        timeout: 6000
      });
      return {
        isLive: true,
        source: 'Live Zoho CRM API',
        data: response.data
      };
    } catch (err) {
      console.warn('Live Zoho CRM API failed, serving verified mock dataset:', err.message);
    }
  }

  // Simulated live Zoho CRM records
  return {
    isLive: false,
    source: 'Zoho CRM Backend Proxy (Demo Simulation)',
    data: {
      activePipelineValue: '$485,000',
      dealsClosingThisMonth: 8,
      conversionRate: '34.2%',
      records: [
        { id: 'LEAD-901', company: 'Vertex Cloud Corp', contact: 'Marcus Green', value: '$120,000', stage: 'Contract Sent', probability: '85%' },
        { id: 'LEAD-902', company: 'Nova Retail Labs', contact: 'Clara Oswald', value: '$65,000', stage: 'Negotiation', probability: '60%' },
        { id: 'LEAD-903', company: 'Apex Biotech Inc', contact: 'Dr. Raymond Shaw', value: '$210,000', stage: 'Proposal Review', probability: '50%' },
        { id: 'LEAD-904', company: 'BlueWave Logistics', contact: 'Ethan Hunt', value: '$90,000', stage: 'Discovery', probability: '30%' }
      ]
    }
  };
}

/**
 * Fetches data for Zoho Desk (Support)
 */
async function fetchZohoDeskData(tokenInfo) {
  if (tokenInfo.isLive && !tokenInfo.error) {
    try {
      const url = getRegionalApiUrl('desk');
      const response = await axios.get(url, {
        headers: { Authorization: `Zoho-oauthtoken ${tokenInfo.token}` },
        timeout: 6000
      });
      return {
        isLive: true,
        source: 'Live Zoho Desk API',
        data: response.data
      };
    } catch (err) {
      console.warn('Live Zoho Desk API failed, serving verified mock dataset:', err.message);
    }
  }

  // Simulated live Zoho Desk records
  return {
    isLive: false,
    source: 'Zoho Desk Backend Proxy (Demo Simulation)',
    data: {
      openTickets: 14,
      avgResolutionTime: '2.4 Hours',
      slaCompliance: '98.6%',
      records: [
        { id: 'TICK-4401', subject: 'SSO SAML authentication timeout on mobile', customer: 'Vertex Cloud', priority: 'High', status: 'In Progress', assignedTo: 'Elena Rostova' },
        { id: 'TICK-4402', subject: 'Invoice PDF generation missing tax identifier', customer: 'Acme Global', priority: 'Medium', status: 'Pending Review', assignedTo: 'Elena Rostova' },
        { id: 'TICK-4403', subject: 'API Rate limit adjustment request for webhook', customer: 'Starlight Media', priority: 'Low', status: 'Open', assignedTo: 'David Wright' },
        { id: 'TICK-4404', subject: 'User provisioning webhook sync retry delay', customer: 'OmniCorp', priority: 'Urgent', status: 'Investigating', assignedTo: 'Elena Rostova' }
      ]
    }
  };
}

/**
 * Fetches data for Zoho Books (Finance)
 */
async function fetchZohoBooksData(tokenInfo) {
  if (tokenInfo.isLive && !tokenInfo.error) {
    try {
      const url = getRegionalApiUrl('books');
      const response = await axios.get(url, {
        headers: { Authorization: `Zoho-oauthtoken ${tokenInfo.token}` },
        timeout: 6000
      });
      return {
        isLive: true,
        source: 'Live Zoho Books API',
        data: response.data
      };
    } catch (err) {
      console.warn('Live Zoho Books API failed, serving verified mock dataset:', err.message);
    }
  }

  // Simulated live Zoho Books records
  return {
    isLive: false,
    source: 'Zoho Books Backend Proxy (Demo Simulation)',
    data: {
      totalReceivables: '$142,850.00',
      unpaidInvoices: 6,
      overdueAmount: '$12,400.00',
      records: [
        { id: 'INV-2025-081', client: 'Vertex Cloud Corp', amount: '$35,000.00', status: 'Paid', dueDate: '2025-05-15', date: '2025-05-01' },
        { id: 'INV-2025-082', client: 'Hyperion Logistics', amount: '$18,500.00', status: 'Sent', dueDate: '2025-06-01', date: '2025-05-10' },
        { id: 'INV-2025-083', client: 'Nova Retail Labs', amount: '$42,350.00', status: 'Overdue', dueDate: '2025-04-30', date: '2025-04-15' },
        { id: 'INV-2025-084', client: 'Apex Biotech Inc', amount: '$47,000.00', status: 'Draft', dueDate: '2025-06-15', date: '2025-05-18' }
      ]
    }
  };
}

module.exports = {
  ZOHO_APPS,
  isZohoConfigured,
  getZohoAccessToken,
  getApplicationsForRoles,
  fetchZohoPeopleData,
  fetchZohoCrmData,
  fetchZohoDeskData,
  fetchZohoBooksData
};
