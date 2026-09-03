require('dotenv').config();
const { getZohoAccessToken, fetchZohoCrmData, fetchZohoDeskData } = require('../src/services/zohoService');

async function testLive() {
  console.log('--- Testing Live Zoho OAuth Token Exchange ---');
  console.log('Accounts URL:', process.env.ZOHO_ACCOUNTS_URL);
  console.log('Client ID:', process.env.ZOHO_CLIENT_ID?.substring(0, 10) + '...');
  
  const tokenInfo = await getZohoAccessToken();
  console.log('Token Result:', {
    isLive: tokenInfo.isLive,
    cached: tokenInfo.cached,
    tokenPrefix: tokenInfo.token?.substring(0, 15) + '...',
    error: tokenInfo.error
  });

  if (tokenInfo.isLive) {
    console.log('\n--- Fetching Live Zoho CRM Data ---');
    const crmResult = await fetchZohoCrmData(tokenInfo);
    console.log('CRM Result Source:', crmResult.source);
    console.log('CRM Result isLive:', crmResult.isLive);
    if (crmResult.isLive) {
      console.log('Live CRM Data:', JSON.stringify(crmResult.data).substring(0, 200) + '...');
    }

    console.log('\n--- Fetching Live Zoho Desk Data ---');
    const deskResult = await fetchZohoDeskData(tokenInfo);
    console.log('Desk Result Source:', deskResult.source);
    console.log('Desk Result isLive:', deskResult.isLive);
    if (deskResult.isLive) {
      console.log('Live Desk Data:', JSON.stringify(deskResult.data).substring(0, 200) + '...');
    }
  }
}

testLive();
