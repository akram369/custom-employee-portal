const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'portal.sqlite');

console.log('🔄 Resetting Enterprise Portal database...');

// Remove existing database file if present
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  Removed existing portal.sqlite file.');
}

// Re-initialize using db.js
const { initDatabase } = require('./db');

initDatabase()
  .then(() => {
    console.log('✅ Database created and freshly seeded with:');
    console.log('   - 5 Roles (Admin, HR, Sales, Support, Finance)');
    console.log('   - 16 Granular Permissions');
    console.log('   - 5 Default Demo Accounts with bcrypt hashed passwords');
    console.log('   - Clean Security Audit Log table');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });
