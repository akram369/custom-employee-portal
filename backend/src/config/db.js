const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '../../', process.env.DB_PATH)
  : path.resolve(__dirname, 'portal.sqlite');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDatabase() {
  await db.runAsync('PRAGMA foreign_keys = ON;');

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS Roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS Permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      module TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      department TEXT,
      designation TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS UserRoles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      roleId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE,
      UNIQUE(userId, roleId)
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS RolePermissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roleId INTEGER NOT NULL,
      permissionId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permissionId) REFERENCES Permissions(id) ON DELETE CASCADE,
      UNIQUE(roleId, permissionId)
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS AuditLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      userEmail TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details TEXT,
      ipAddress TEXT,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await seedDatabase();
}

async function seedDatabase() {
  const existingRole = await db.getAsync('SELECT count(*) as count FROM Roles;');
  if (existingRole && existingRole.count > 0) {
    return;
  }

  console.log('Seeding initial Roles, Permissions, and Default Users...');

  const roles = [
    { name: 'Admin', description: 'Full system administration and access to all integrated Zoho One applications' },
    { name: 'HR', description: 'Human Resources management and access to Zoho People' },
    { name: 'Sales', description: 'Sales, lead nurturing, and access to Zoho CRM' },
    { name: 'Support', description: 'Customer support, ticketing, and access to Zoho Desk' },
    { name: 'Finance', description: 'Financial operations, billing, and access to Zoho Books' }
  ];

  const roleMap = {};
  for (const r of roles) {
    const res = await db.runAsync(
      'INSERT INTO Roles (name, description) VALUES (?, ?)',
      [r.name, r.description]
    );
    roleMap[r.name] = res.lastID;
  }

  const permissions = [
    { name: 'manage_users', module: 'admin', description: 'Create, update, and deactivate portal users' },
    { name: 'manage_roles', module: 'admin', description: 'Assign roles and configure permission matrices' },
    { name: 'view_audit_logs', module: 'admin', description: 'Inspect audit trail and access logs' },
    { name: 'configure_zoho', module: 'admin', description: 'Manage backend Zoho OAuth credentials' },
    { name: 'access_zoho_people', module: 'hr', description: 'Access Zoho People HR application' },
    { name: 'view_employees', module: 'hr', description: 'View company staff directories and profiles' },
    { name: 'manage_leave', module: 'hr', description: 'Review and approve leave requests' },
    { name: 'access_zoho_crm', module: 'sales', description: 'Access Zoho CRM sales application' },
    { name: 'view_leads', module: 'sales', description: 'View and track incoming sales leads' },
    { name: 'manage_deals', module: 'sales', description: 'Update pipeline opportunities and deals' },
    { name: 'access_zoho_desk', module: 'support', description: 'Access Zoho Desk customer support application' },
    { name: 'view_tickets', module: 'support', description: 'View assigned support tickets and SLAs' },
    { name: 'manage_cases', module: 'support', description: 'Resolve and update customer helpdesk cases' },
    { name: 'access_zoho_books', module: 'finance', description: 'Access Zoho Books accounting application' },
    { name: 'view_invoices', module: 'finance', description: 'Inspect client invoices and payment records' },
    { name: 'manage_estimates', module: 'finance', description: 'Generate accounting estimates and journal entries' }
  ];

  const permMap = {};
  for (const p of permissions) {
    const res = await db.runAsync(
      'INSERT INTO Permissions (name, module, description) VALUES (?, ?, ?)',
      [p.name, p.module, p.description]
    );
    permMap[p.name] = res.lastID;
  }

  const rolePermMapping = {
    Admin: Object.keys(permMap),
    HR: ['access_zoho_people', 'view_employees', 'manage_leave'],
    Sales: ['access_zoho_crm', 'view_leads', 'manage_deals'],
    Support: ['access_zoho_desk', 'view_tickets', 'manage_cases'],
    Finance: ['access_zoho_books', 'view_invoices', 'manage_estimates']
  };

  for (const [roleName, permList] of Object.entries(rolePermMapping)) {
    const rId = roleMap[roleName];
    for (const pName of permList) {
      const pId = permMap[pName];
      if (rId && pId) {
        await db.runAsync(
          'INSERT INTO RolePermissions (roleId, permissionId) VALUES (?, ?)',
          [rId, pId]
        );
      }
    }
  }

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  const defaultUsers = [
    {
      name: 'Alexander Davis',
      email: 'admin@company.com',
      department: 'Executive / IT',
      designation: 'Portal Administrator',
      role: 'Admin'
    },
    {
      name: 'Sarah Jenkins',
      email: 'hr@company.com',
      department: 'Human Resources',
      designation: 'HR Operations Lead',
      role: 'HR'
    },
    {
      name: 'Marcus Vance',
      email: 'sales@company.com',
      department: 'Global Sales',
      designation: 'Enterprise Account Executive',
      role: 'Sales'
    },
    {
      name: 'Elena Rostova',
      email: 'support@company.com',
      department: 'Customer Support',
      designation: 'Senior Support Specialist',
      role: 'Support'
    },
    {
      name: 'David Chen',
      email: 'finance@company.com',
      department: 'Corporate Finance',
      designation: 'Financial Controller',
      role: 'Finance'
    }
  ];

  for (const u of defaultUsers) {
    const userRes = await db.runAsync(
      'INSERT INTO Users (name, email, password, department, designation, isActive) VALUES (?, ?, ?, ?, ?, 1)',
      [u.name, u.email, defaultPasswordHash, u.department, u.designation]
    );
    const userId = userRes.lastID;
    const roleId = roleMap[u.role];
    await db.runAsync(
      'INSERT INTO UserRoles (userId, roleId) VALUES (?, ?)',
      [userId, roleId]
    );
  }

  await db.runAsync(
    `INSERT INTO AuditLogs (userId, userEmail, action, resource, details, ipAddress, status) 
     VALUES (NULL, 'SYSTEM', 'SYSTEM_SEED', 'DATABASE', 'Initial schema creation and seed data populated', '127.0.0.1', 'SUCCESS')`
  );

  console.log('Database seeded successfully with default roles and demo accounts.');
}

module.exports = {
  db,
  initDatabase
};
