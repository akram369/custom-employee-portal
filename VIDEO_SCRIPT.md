# Video Presentation Script (3–5 Minutes)
## Enterprise Employee Portal with Zoho One Integration & RBAC

> **Target Duration**: 3:30 to 4:45 minutes  
> **Recommended Tools**: [Loom](https://www.loom.com/) (Free screen + cam recording) or **OBS Studio** / **Windows Game Bar** (`Win + G` or `Win + Alt + R`)  
> **Preparation**:
> 1. Start backend server: `cd backend && node server.js` (Running on `http://localhost:5000`)
> 2. Start frontend dev server: `cd frontend && npm run dev` (Running on `http://localhost:5173`)
> 3. Have VS Code open in the background with `schema.sql` and `zohoService.js`.
> 4. Keep your browser open at `http://localhost:5173`.

---

## Evaluation Rubric Alignment Checklist
Before recording, verify you are covering all 5 rubric areas:
- [x] **RBAC Implementation (30%)**: Show SQLite schema, JWT middleware, conditional role UI, and 403 Forbidden blocking.
- [x] **Zoho API Integration (25%)**: Explain single backend service account, refresh token management, zero-credential proxy, and live Zoho Cloud data.
- [x] **Code Quality & Architecture (20%)**: Show clean separation of frontend/backend, proper HTTP status codes, `.env` security, and `AuditLogs` table.
- [x] **UI/UX & Frontend (15%)**: Highlight responsive Zoho CRM-inspired design language, role-based views, and functional Admin panel.
- [x] **Submission & Explanation (10%)**: Clear, professional presentation delivered smoothly within 3–5 minutes.

---

## Presentation Script & Screen Flow

```
⏱️ TIMELINE BREAKDOWN:
0:00 - 0:45 | Problem Statement & Architecture Overview
0:45 - 2:00 | Role-Based Access Control & Live Zoho Data Demo
2:00 - 3:00 | Backend Architecture, OAuth Proxy & 403 Security Enforcement
3:00 - 4:00 | Admin Governance Panel & Relational Audit Trail
4:00 - 4:30 | Conclusion & Rubric Wrap-up
```

---

### ⏱️ Scene 1: Introduction & Problem Statement (0:00 – 0:45)

**🖥️ Screen to Show**: Browser open to the Enterprise Portal Login Page (`http://localhost:5173`).

**🎙️ Spoken Narration**:
> *"Hello! My name is Wasim Akram, and today I am presenting the Custom Enterprise Employee Portal with Zoho One Integration and Role-Based Access Control.*
> 
> *In many enterprises, organizations use Zoho One applications across departments—like Zoho CRM for Sales, Zoho People for HR, Zoho Desk for Support, and Zoho Books for Finance. However, creating and managing individual Zoho credentials for every single employee poses severe credential sprawl and security risks.*
> 
> *Our solution solves this through a dual-layer architecture: employees log into our unified corporate portal using company credentials governed by strict Role-Based Access Control (RBAC), while the backend communicates with Zoho One using a single, secure OAuth 2.0 service account. Employees never handle or enter individual Zoho credentials."*

---

### ⏱️ Scene 2: Role-Based Access Control & Live Zoho Data Demo (0:45 – 2:00)

**🖥️ Screen Action**: 
1. On the login page, expand **"Try a demo account"**.
2. Click **Marcus Vance (Sales)** to log in with 1 click.

**🎙️ Spoken Narration**:
> *"Let's see this in action. First, let's log in as **Marcus Vance**, our Enterprise Account Executive in **Sales**.*
> 
> *Notice our dashboard dynamically reconfigures based on Marcus's JWT claims: Marcus is strictly authorized to access **Zoho CRM**. The 'Your Access' panel visually confirms that Zoho People, Zoho Desk, and Zoho Books are restricted.*
> 
> *Now, let's click **View CRM Data**."*

**🖥️ Screen Action**: 
3. Click the **View CRM Data** button on the Zoho CRM card.
4. The Live Data Modal opens. Point your cursor to the **"Live Zoho Cloud"** badge and the **Zero-Credential Guarantee** banner.
5. Click **"Raw API Response"** tab to show live Zoho JSON data.
6. Close the modal.

**🎙️ Spoken Narration**:
> *"Notice the green 'Live Zoho Cloud' badge. Our backend service account connected directly to Zoho Cloud's India API endpoints and retrieved live CRM leads. Notice the security guarantee: zero Zoho credentials were exposed to the employee or the browser.*
> 
> *Now let's test instant role switching: at the bottom dock, let's switch to **Sarah Jenkins** in **HR**."*

**🖥️ Screen Action**: 
7. Click **Sarah Jenkins (HR)** on the Quick Demo Switcher dock.
8. Show the dashboard updating instantly to show **Zoho People** authorized, while Zoho CRM is locked.

**🎙️ Spoken Narration**:
> *"Instantly, the UI updates: Sarah now only sees **Zoho People**, while Zoho CRM, Desk, and Books are locked. When she views People data, she receives employee directory records. The same least-privilege principle applies to Elena Rostova in Support for Zoho Desk, and David Chen in Finance for Zoho Books."*

---

### ⏱️ Scene 3: Backend Architecture & 403 Security Enforcement (2:00 – 3:00)

**🖥️ Screen Action**: 
1. Switch to VS Code.
2. Briefly show `backend/src/config/schema.sql`.
3. Switch to `backend/src/services/zohoService.js`.
4. Open the integrated terminal and run `node test-backend.js`.

**🎙️ Spoken Narration**:
> *"Let's look under the hood at the backend architecture.*
> 
> *In `schema.sql`, we have 6 normalized relational tables: `Users`, `Roles`, `Permissions`, `UserRoles`, `RolePermissions`, and `AuditLogs` with strict foreign key constraints.*
> 
> *In `zohoService.js`, our backend uses a single service account refresh token to request access tokens from Zoho's accounts endpoint (`accounts.zoho.in`). We implement in-memory token caching with expiration buffers so requests are fast and we never exhaust API limits.*
> 
> *Security is strictly enforced in middleware: every route is wrapped with `authenticateToken` and `verifyRole`. If an unauthorized role attempts to call an API directly—such as a Sales user trying to access Zoho Books or an Admin route—the server immediately rejects the request with **HTTP 403 Forbidden** and logs the security violation.*
> 
> *Let's run our automated test suite in the terminal: `node test-backend.js`.*
> 
> *Notice: all 12 of 12 tests pass, including the 403 Forbidden blocks for unauthorized service queries."*

---

### ⏱️ Scene 4: Administrator Governance & Security Audit Trail (3:00 – 4:00)

**🖥️ Screen Action**: 
1. Switch back to browser.
2. Log in as **Alexander Davis (Admin)** via the quick switcher.
3. Show that Alexander sees all 4 applications.
4. Click **Administration** in the top navigation bar.

**🎙️ Spoken Narration**:
> *"Now let's switch to our Administrator, **Alexander Davis**.*
> 
> *As an Admin, Alexander has full access to all 4 integrated Zoho applications, plus the **Administration** management portal.*
> 
> *In the Admin Console, we have 4 key management tabs:*
> 1. *First, the **Users Directory**: Admins can provision new employees, assign department roles, deactivate accounts, or delete users.*
> 2. *Second, the **Roles & Permissions Matrix**: A visual grid showing role capabilities where admins can toggle granular backend permissions in real time.*
> 3. *Third, the **Security Activity Audit Logs**: An immutable relational log tracking every authentication event, authorized Zoho proxy access, and blocked intrusion attempt with timestamp, IP address, and status.*
> 4. *And fourth, the **Zoho Connection Tab**: Verifying the operational health and token cache metrics of our centralized OAuth service account."*

---

### ⏱️ Scene 5: Conclusion & Summary (4:00 – 4:30)

**🖥️ Screen Action**: 
1. Click **Dashboard** in the top navigation or return to the landing page.

**🎙️ Spoken Narration**:
> *"In summary, this portal delivers:
> - Strict 30% RBAC implementation with relational schema integrity,
> - 25% Centralized Zoho OAuth 2.0 integration with zero employee credentials,
> - 20% High-quality architecture with comprehensive audit logging,
> - And a 15% responsive enterprise SaaS UI inspired by Zoho's design language.
> 
> All code, automated test scripts, and complete documentation are available in the GitHub repository.
> 
> Thank you for your time!"*

---

## Pro-Tips for a Flawless Recording
1. **Pacing**: Speak at a calm, confident pace. Do not rush.
2. **Cursor Movement**: Move your mouse deliberately to guide the evaluator's eyes to the badges and cards you mention.
3. **Audio Quality**: Record in a quiet room with a headset or dedicated microphone.
4. **Resolution**: Record at 1080p (1920x1080) in full screen for crystal-clear readability of the text and tables.
