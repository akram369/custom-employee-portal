-- ==========================================================
-- Enterprise Employee Portal - Relational Database Schema
-- Compatible with: SQLite, PostgreSQL, and MySQL
-- ==========================================================

-- Enable Foreign Key Constraints
PRAGMA foreign_keys = ON;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS Roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS Permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    isActive INTEGER DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. UserRoles Table (Many-to-Many join table)
CREATE TABLE IF NOT EXISTS UserRoles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    roleId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE,
    UNIQUE(userId, roleId)
);

-- 5. RolePermissions Table (Many-to-Many join table)
CREATE TABLE IF NOT EXISTS RolePermissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roleId INTEGER NOT NULL,
    permissionId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permissionId) REFERENCES Permissions(id) ON DELETE CASCADE,
    UNIQUE(roleId, permissionId)
);

-- 6. AuditLogs Table (Security & Activity Trail)
CREATE TABLE IF NOT EXISTS AuditLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    userEmail VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    details TEXT,
    ipAddress VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Fast RBAC Lookups & Security Auditing
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_userroles_user ON UserRoles(userId);
CREATE INDEX IF NOT EXISTS idx_userroles_role ON UserRoles(roleId);
CREATE INDEX IF NOT EXISTS idx_rolepermissions_role ON RolePermissions(roleId);
CREATE INDEX IF NOT EXISTS idx_auditlogs_timestamp ON AuditLogs(timestamp);

-- ==========================================================
-- Initial Seed Data
-- Default Corporate Roles
-- ==========================================================
INSERT OR IGNORE INTO Roles (id, name, description) VALUES
(1, 'Admin', 'Full administrative authority and access to all integrated Zoho One applications'),
(2, 'HR', 'Human Resources management and access to Zoho People'),
(3, 'Sales', 'Sales operations, deal pipeline, and access to Zoho CRM'),
(4, 'Support', 'Customer support, ticketing, and access to Zoho Desk'),
(5, 'Finance', 'Financial operations, billing, and access to Zoho Books');

-- Permissions Seed
INSERT OR IGNORE INTO Permissions (id, name, module, description) VALUES
(1, 'manage_users', 'admin', 'Create, edit, and deactivate portal employees'),
(2, 'manage_roles', 'admin', 'Assign roles and configure permission matrices'),
(3, 'view_audit_logs', 'admin', 'Inspect security audit logs and blocked attempts'),
(4, 'configure_zoho', 'admin', 'Manage backend Zoho OAuth service account credentials'),
(5, 'access_zoho_people', 'hr', 'Access Zoho People HR application'),
(6, 'view_employees', 'hr', 'View employee directory records'),
(7, 'manage_leave', 'hr', 'Manage and approve employee leave requests'),
(8, 'access_zoho_crm', 'sales', 'Access Zoho CRM sales application'),
(9, 'view_leads', 'sales', 'View and track incoming sales leads'),
(10, 'manage_deals', 'sales', 'Manage CRM deals and pipelines'),
(11, 'access_zoho_desk', 'support', 'Access Zoho Desk customer support application'),
(12, 'view_tickets', 'support', 'View customer support cases and SLAs'),
(13, 'resolve_tickets', 'support', 'Update ticket resolution status'),
(14, 'access_zoho_books', 'finance', 'Access Zoho Books accounting application'),
(15, 'view_invoices', 'finance', 'View invoices and account receivables'),
(16, 'manage_billing', 'finance', 'Manage financial billing statements');
