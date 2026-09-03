const axios = require('axios');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(`
========================================================================
🔑 Zoho One Refresh Token Generator Helper
========================================================================

Usage:
  node scripts/get-refresh-token.js <CLIENT_ID> <CLIENT_SECRET> <AUTH_CODE> [ACCOUNTS_URL]

Example:
  node scripts/get-refresh-token.js 1000.XXXXX 6789abcdef 1000.authcode https://accounts.zoho.in
========================================================================
  `);
  process.exit(0);
}

const [clientId, clientSecret, code, accountsUrl = 'https://accounts.zoho.in'] = args;

async function exchangeToken() {
  console.log(`\n⏳ Exchanging authorization code with ${accountsUrl}...`);

  try {
    const response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
      params: {
        grant_type: 'authorization_code',
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        code: code.trim()
      }
    });

    if (response.data.error) {
      console.error('\n❌ Zoho API Error:', response.data.error);
      if (response.data.error === 'invalid_code') {
        console.error('👉 The authorization code has expired (valid for 10 min) or has already been used. Please generate a fresh code in Zoho API Console.');
      } else if (response.data.error === 'invalid_client') {
        console.error('👉 Invalid client ID or secret, OR your regional ACCOUNTS_URL does not match (e.g. try https://accounts.zoho.in).');
      }
      return;
    }

    const { refresh_token, access_token, api_domain } = response.data;

    console.log('\n🎉 SUCCESS! Generated Zoho Refresh Token:');
    console.log('----------------------------------------------------');
    console.log(`ZOHO_MODE=live`);
    console.log(`ZOHO_ACCOUNTS_URL=${accountsUrl}`);
    console.log(`ZOHO_CLIENT_ID=${clientId.trim()}`);
    console.log(`ZOHO_CLIENT_SECRET=${clientSecret.trim()}`);
    console.log(`ZOHO_REFRESH_TOKEN=${refresh_token}`);
    if (api_domain) console.log(`API_DOMAIN=${api_domain}`);
    console.log('----------------------------------------------------');

    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (!envContent.includes('ZOHO_MODE=')) {
        envContent += '\nZOHO_MODE=live';
      } else {
        envContent = envContent.replace(/ZOHO_MODE=.*/, 'ZOHO_MODE=live');
      }
      envContent = envContent.replace(/ZOHO_CLIENT_ID=.*/, `ZOHO_CLIENT_ID=${clientId.trim()}`);
      envContent = envContent.replace(/ZOHO_CLIENT_SECRET=.*/, `ZOHO_CLIENT_SECRET=${clientSecret.trim()}`);
      envContent = envContent.replace(/ZOHO_REFRESH_TOKEN=.*/, `ZOHO_REFRESH_TOKEN=${refresh_token}`);
      envContent = envContent.replace(/ZOHO_ACCOUNTS_URL=.*/, `ZOHO_ACCOUNTS_URL=${accountsUrl.trim()}`);
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('✅ Updated backend/.env automatically with your live Zoho credentials!');
      console.log('👉 Restart the backend server (`node server.js`) to start making real-time API calls.');
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.response?.data || error.message);
  }
}

exchangeToken();
