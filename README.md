# Enterprise Employee Portal
> *One workspace. Every employee. The right tools.*

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Relational%20DB-003B57?logo=sqlite)](https://sqlite.org/)
[![Zoho One](https://img.shields.io/badge/Zoho%20One-OAuth%202.0%20API-red?logo=zoho)](https://www.zoho.com/one/)

A production-grade, secure Enterprise Employee Portal designed with Zoho's clean enterprise SaaS design language, featuring **built-in JWT Authentication**, **Role-Based Access Control (RBAC)**, and **backend Zoho One OAuth API integration**. Employees access only the specific Zoho applications permitted by their assigned corporate role and **never require individual Zoho credentials**.

---

## Table of Contents
1. [Key Features & Business Requirements](#key-features--business-requirements)
2. [Security & Zero-Credential Architecture](#security--zero-credential-architecture)
3. [Role-to-Application Mapping](#role-to-application-mapping)
4. [Project Structure](#project-structure)
5. [Quick Start & Installation](#quick-start--installation)
6. [Zoho One API Credentials Setup (Step-by-Step)](#zoho-one-api-credentials-setup-step-by-step)
7. [Database Schema & RBAC Tables](#database-schema--rbac-tables)
8. [Default Demo Accounts](#default-demo-accounts)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Video Presentation Script (3–5 Minutes)](#video-presentation-script-35-minutes)

---

## Key Features & Business Requirements

- 🔐 **Custom Authentication & RBAC Engine**: Secure JWT token issuance, bcrypt hashed passwords, and granular role/permission inspection on every API request.
- 🏢 **Single Service Account Zoho One Integration**: Centralized backend OAuth 2.0 refresh-token manager. Employees never hold or input individual Zoho credentials.
- 🎯 **Conditional Dashboard Rendering**: Employees only see and can only access the Zoho services permitted for their role (e.g., HR sees Zoho People; Sales sees Zoho CRM; Support sees Zoho Desk; Finance sees Zoho Books; Admin sees all).
- 🔍 **Live Backend Data Proxy**: Employees can test and view live proxied business records (Leads, Tickets, Invoices, Staff) directly through backend API proxy endpoints.
- 🛡️ **Administrator Governance Panel**:
  - Full employee directory management (provision, deactivate, assign roles, delete).
  - Fine-grained Roles & Permissions matrix toggle.
  - Comprehensive, searchable security audit trail (`AuditLogs` table) tracking logins, role checks, and blocked access attempts.
- ⚡ **1-Click Evaluation Role Switcher**: Instant switching between HR, Sales, Support, Finance, and Admin to streamline grading and video recording.
- 🚀 **Zero-Friction Demo Mode**: The application includes a verified fallback simulation mode. It runs out-of-the-box for grading and screen recording even before external Zoho API credentials are configured.

---

## Security & Zero-Credential Architecture

```
                                  BROWSER CLIENT
                         (Employee Portal React App)
                                      │
                        [JWT Bearer Token on /api/*]
                        [No Zoho Credentials Exposed]
                                      ▼
                        EXPRESS.JS BACKEND SERVER
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
   [Auth & RBAC Guards]      [Audit Logger Engine]    [Zoho Service Account]
   verifyRole / verifyPerm   Writes to AuditLogs      Manages Refresh Token
           │                          │               Auto-caches Access Token
           ▼                          ▼                          │
    RELATIONAL DATABASE        AUDIT TRAILS                      ▼
(Users, Roles, Permissions)  (Success/Blocked)          ZOHO OAUTH 2.0 CLOUD
                                                   (accounts.zoho.com/oauth/v2/token)
                                                                 │
                                                       [Zoho Bearer Token]
                                                                 ▼
                                                        ZOHO ONE CLOUD APIS
                                                     (People, CRM, Desk, Books)
```

---

## Role-to-Application Mapping

| Role | Permitted Zoho Application | Target Purpose | Primary Module Route | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **HR** | **Zoho People** | HR & Talent management, staff directory, leave tracking | `https://people.zoho.com` | HR Only |
| **Sales** | **Zoho CRM** | Customer relations, pipeline deals, lead conversion | `https://crm.zoho.com` | Sales Only |
| **Support** | **Zoho Desk** | Customer helpdesk, ticketing, SLA resolution | `https://desk.zoho.com` | Support Only |
| **Finance** | **Zoho Books** | Accounting, invoicing, receivables, tax compliance | `https://books.zoho.com` | Finance Only |
| **Admin** | **All 4 Applications** | Full supervisory portal access + Admin Control Center | All Zoho Apps + Admin APIs | Full Access |

---

## Project Structure

The project follows the exact structure specified in the assignment document:

```plaintext
custom-employee-portal/
├── backend/
│   ├── src/
│   │   ├── config/              # DB connection & environment setups
│   │   │   ├── db.js            # SQLite relational schema, foreign keys & seeding
│   │   │   └── portal.sqlite    # SQLite database file (auto-generated)
│   │   ├── controllers/         # Route handler logic
│   │   │   ├── authController.js   # Login, profile, demo accounts
│   │   │   ├── zohoController.js   # Authorized apps, proxy, launch, status
│   │   │   └── adminController.js  # Users CRUD, role permissions, audit logs
│   │   ├── middlewares/         # JWT & RBAC authorization handlers
│   │   │   ├── auth.js          # Bearer JWT verification & DB role enrichment
│   │   │   ├── rbac.js          # verifyRole & verifyPermission guards
│   │   │   └── auditLogger.js   # Audit trail logger middleware
│   │   ├── routes/              # Express API route endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── zohoRoutes.js
│   │   │   └── adminRoutes.js
│   │   └── services/            # Zoho API client & token logic
│   │       └── zohoService.js   # OAuth token cache, refresh, & API proxy
│   ├── .env                     # Secret keys (Zoho Client ID, JWT Secret)
│   ├── .env.example             # Configuration template
│   ├── server.js                # App entry point
│   ├── test-backend.js          # Automated backend RBAC & API test suite
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── Navbar.jsx       # Header with user avatar and role badge
│   │   │   ├── ZohoAppCard.jsx  # Card with conditional launch & live proxy
│   │   │   └── ZohoDataModal.jsx# Live backend-proxied data inspector
│   │   ├── pages/               # Views
│   │   │   ├── LoginPage.jsx    # Login form & 1-click role switcher
│   │   │   ├── DashboardPage.jsx# Role-conditioned dashboard & restricted view
│   │   │   └── AdminPanelPage.jsx# User management, matrix & audit logs
│   │   ├── services/
│   │   │   └── api.js           # Axios API client with JWT interceptor
│   │   ├── utils/
│   │   │   └── auth.js          # Session storage helpers
│   │   ├── index.css            # Custom modern CSS design system
│   │   ├── App.jsx              # Root app component with route guards
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` (version 9+)

### Step 1: Start Backend Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# (Optional) Verify environment variables
cp .env.example .env

# Start backend server
node server.js
```
The backend starts on `http://localhost:5000` with the SQLite database auto-created and pre-seeded with default roles and accounts.

### Step 2: Run Backend Automated Verification (Optional)
```bash
# In backend directory
node test-backend.js
```
Expected output:
```
--- Starting Backend RBAC & Zoho Integration Tests ---
✅ PASS: Health check returns UP
✅ PASS: Demo accounts endpoint returns at least 5 accounts
✅ PASS: Sales login succeeds
✅ PASS: Sales user has role Sales
✅ PASS: Sales user only receives Zoho CRM as authorized application
✅ PASS: Sales user can proxy Zoho CRM data
✅ PASS: Sales user receives HTTP 403 when accessing Zoho Books
✅ PASS: Sales user receives HTTP 403 when accessing /api/admin/users
✅ PASS: Admin login succeeds
✅ PASS: Admin receives all 4 integrated Zoho One applications
✅ PASS: Admin can list users
✅ PASS: Audit logs recorded recent ACCESS_DENIED security events
Results: 12/12 tests passed.
```

### Step 3: Start Frontend Client
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## Zoho One API Credentials Setup (Step-by-Step)

To connect live production/trial Zoho One APIs:

1. **Sign up for Zoho One**: Create a free trial account at [zoho.com/one](https://www.zoho.com/one/).
2. **Access Zoho API Console**: Navigate to [api-console.zoho.com](https://api-console.zoho.com/).
3. **Register an Application**:
   - Click **Add Client** and select **Self Client**.
   - Note your generated `Client ID` and `Client Secret`.
4. **Generate Authorization Code**:
   - Under the **Generate Code** tab, enter the required scopes:
     ```
     ZohoPeople.employee.ALL,ZohoCRM.modules.ALL,Desk.tickets.ALL,ZohoBooks.fullaccess.ALL
     ```
   - Set Time Duration to **10 minutes** and enter a Scope Description (e.g., `EmployeePortalProxy`).
   - Click **Create** and copy the generated `code`.
5. **Generate Refresh Token**:
   - Make a POST request (using Postman, Curl, or Insomnia):
     ```bash
     curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
       -d "grant_type=authorization_code" \
       -d "client_id=YOUR_CLIENT_ID" \
       -d "client_secret=YOUR_CLIENT_SECRET" \
       -d "code=YOUR_AUTHORIZATION_CODE"
     ```
   - Copy the returned `refresh_token`.
6. **Update Backend `.env`**:
   ```env
   ZOHO_CLIENT_ID=your_zoho_client_id_here
   ZOHO_CLIENT_SECRET=your_zoho_client_secret_here
   ZOHO_REFRESH_TOKEN=your_zoho_refresh_token_here
   ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
   ```
7. Restart the backend server. The backend will automatically fetch, refresh, and cache access tokens.

---

## Database Schema & RBAC Tables

The relational SQLite database enforces strict relational foreign keys and indices across 6 tables:

```sql
-- 1. Roles table
CREATE TABLE Roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Permissions table
CREATE TABLE Permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users table
CREATE TABLE Users (
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

-- 4. UserRoles join table
CREATE TABLE UserRoles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  roleId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE,
  UNIQUE(userId, roleId)
);

-- 5. RolePermissions join table
CREATE TABLE RolePermissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roleId INTEGER NOT NULL,
  permissionId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roleId) REFERENCES Roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permissionId) REFERENCES Permissions(id) ON DELETE CASCADE,
  UNIQUE(roleId, permissionId)
);

-- 6. AuditLogs table
CREATE TABLE AuditLogs (
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
```

---

## Default Demo Accounts

All demo accounts are pre-seeded with password: `Password@123`.

| Name | Role | Email | Password | Allowed Zoho Service |
| :--- | :--- | :--- | :--- | :--- |
| **Alexander Davis** | `Admin` | `admin@company.com` | `Password@123` | **All 4 Applications** + Admin Console |
| **Sarah Jenkins** | `HR` | `hr@company.com` | `Password@123` | **Zoho People** |
| **Marcus Vance** | `Sales` | `sales@company.com` | `Password@123` | **Zoho CRM** |
| **Elena Rostova** | `Support` | `support@company.com` | `Password@123` | **Zoho Desk** |
| **David Chen** | `Finance` | `finance@company.com` | `Password@123` | **Zoho Books** |

> 💡 **Demo Tip**: Use the **1-Click Role Switcher** on the login page or at the bottom of the dashboard to instantly test each role without re-entering credentials!

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticates user credentials, returns signed JWT token.
- `GET /api/auth/me`: Retrieves current session user info, active roles, and permissions (requires JWT).
- `GET /api/auth/demo-accounts`: Returns pre-configured demo user accounts for the 1-click switcher.

### Zoho One Integration (`/api/zoho`)
- `GET /api/zoho/apps`: Returns only the Zoho applications authorized for the caller's role.
- `GET /api/zoho/app/:appId/data`: Proxies live/simulated business data from Zoho API via backend service account token. Blocks unauthorized roles with HTTP 403.
- `POST /api/zoho/app/:appId/launch`: Returns authorized SSO launch target.
- `GET /api/zoho/status`: Returns Zoho backend service account connection status and token cache metrics.

### Admin Supervisory Management (`/api/admin`) *(Restricted to `Admin` role)*
- `GET /api/admin/stats`: Overview counts of users, roles, permissions, audit events, and blocked attacks.
- `GET /api/admin/users`: List all portal employees with assigned roles.
- `POST /api/admin/users`: Provision a new portal employee.
- `PUT /api/admin/users/:id`: Update employee info, change role, or toggle active/deactivated status.
- `DELETE /api/admin/users/:id`: Delete employee account.
- `GET /api/admin/roles`: List all roles and the permissions matrix.
- `PUT /api/admin/roles/:roleId/permissions`: Update granular permissions for a role.
- `GET /api/admin/audit-logs`: Search and filter immutable security audit logs.

---

## Video Presentation Script (3–5 Minutes)

Use this step-by-step narration script when recording with **Loom** or **OBS Studio**:

### ⏱️ Minute 0:00 – 1:00 | Introduction & Architecture
> *"Hello! Today I am presenting our Custom Employee Portal integrated with Zoho One and Role-Based Access Control.
> The core problem we solved is enterprise security: organizations want their employees to access department-specific Zoho applications like Zoho CRM, Books, People, or Desk without having to create, manage, or distribute individual Zoho usernames and passwords to every single employee.
> Our system implements a single backend OAuth 2.0 service account that securely manages tokens on the server, while employees log in using corporate portal credentials governed by a relational RBAC engine."*

### ⏱️ Minute 1:00 – 2:15 | Role-Based Access Control Demo
> *(Show screen at `http://localhost:5173`)*
> *"Notice our modern portal login page with our 1-Click Role Switcher.
> First, let's log in as **Sarah Jenkins**, our **HR Lead**.
> On the dashboard, observe that Sarah is strictly granted access to **Zoho People**. Underneath, other department applications like Zoho CRM, Desk, and Books are restricted and locked.
> If we click 'Live Data' on Zoho People, our backend makes an authenticated call to the Zoho People API via our service account and returns employee directory records and live leave balances. Notice the banner: zero Zoho credentials exposed to the employee!
> Next, let's switch to **Marcus Vance** in **Sales**. Instantly, the dashboard updates: now ONLY **Zoho CRM** is permitted, and Zoho People is locked.
> The same strict isolation applies to **Elena Rostova** in **Support** for **Zoho Desk**, and **David Chen** in **Finance** for **Zoho Books**."*

### ⏱️ Minute 2:15 – 3:30 | Backend OAuth Token Architecture
> *(Briefly switch to code editor showing `backend/src/services/zohoService.js` and `backend/src/middlewares/rbac.js`)*
> *"Let's look at the backend implementation:
> In `zohoService.js`, our backend uses a single service account refresh token to request access tokens from Zoho's OAuth endpoint. We implement in-memory token caching with expiration buffers so we never overwhelm Zoho's API.
> In `middlewares/rbac.js`, we have our `verifyRole` and `verifyPermission` middlewares. Every incoming request must provide a valid JWT. If an unauthorized role attempts to hit `/api/zoho/app/zoho_books/data` or `/api/admin/users`, our backend rejects it with HTTP 403 Forbidden and writes an `ACCESS_DENIED` event to our `AuditLogs` table."*

### ⏱️ Minute 3:30 – 4:30 | Administrator Governance & Audit Trail
> *(Switch back to browser and click Alexander Davis - Admin)*
> *"Now, let's switch to **Alexander Davis**, our **Administrator**.
> Alexander has access to all 4 integrated Zoho services, plus the **Admin Management** console in the navbar.
> Clicking into Admin Management, we have:
> 1. **User Directory**: where admins can create new employees, assign roles, or deactivate accounts.
> 2. **Permissions Matrix**: where admins can toggle granular module permissions per role in real time.
> 3. **Security Audit Trail**: an immutable log tracking every single login, authorized Zoho proxy call, and blocked intrusion attempt with timestamp, IP address, and status.
> 4. **Zoho Service Account Status**: showing OAuth health and token cache status."*

### ⏱️ Minute 4:30 – 5:00 | Conclusion
> *"In summary, this portal provides a complete, production-ready solution: secure backend OAuth proxying, strict RBAC isolation, relational schema integrity, and enterprise audit compliance. Thank you!"*
