import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  FileText, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Key, 
  ExternalLink,
  Lock,
  Server
} from 'lucide-react';
import { adminAPI, zohoAPI } from '../services/api';

export default function AdminPanelPage({ currentUser }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'audit' | 'zoho'
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [zohoStatus, setZohoStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // New User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    department: '',
    designation: '',
    roleId: 2 // default HR
  });

  // Role Edit Modal
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(2);

  // Audit Logs Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatus, setAuditStatus] = useState('');

  // Toast / Feedback
  const [notice, setNotice] = useState(null);

  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, rolesRes, auditRes, zohoRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getRoles(),
        adminAPI.getAuditLogs({ limit: 100 }),
        zohoAPI.getStatus()
      ]);

      if (statsRes.success) setSystemStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (rolesRes.success) {
        setRoles(rolesRes.roles);
        setAllPermissions(rolesRes.allPermissions);
      }
      if (auditRes.success) setAuditLogs(auditRes.logs);
      if (zohoRes.success) setZohoStatus(zohoRes);
    } catch (err) {
      console.error('Error loading admin data:', err);
      showNotice(err.response?.data?.message || 'Failed to load administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter audit logs
  const handleAuditFilter = async () => {
    try {
      const res = await adminAPI.getAuditLogs({
        search: auditSearch,
        status: auditStatus,
        limit: 100
      });
      if (res.success) {
        setAuditLogs(res.logs);
      }
    } catch (err) {
      console.error('Failed to filter audit logs:', err);
    }
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createUser(newUser);
      if (res.success) {
        showNotice(`Employee ${newUser.name} created successfully!`);
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          password: 'Password@123',
          department: '',
          designation: '',
          roleId: 2
        });
        loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to create user', 'error');
    }
  };

  // Toggle User Active Status
  const handleToggleActive = async (user) => {
    try {
      const res = await adminAPI.updateUser(user.id, { isActive: !user.isActive });
      if (res.success) {
        showNotice(`User ${user.name} ${!user.isActive ? 'activated' : 'deactivated'}`);
        loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name} (${user.email})?`)) return;

    try {
      const res = await adminAPI.deleteUser(user.id);
      if (res.success) {
        showNotice(`User ${user.name} deleted`);
        loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  // Save Role Change
  const handleSaveRole = async () => {
    if (!editingUser) return;
    try {
      const res = await adminAPI.updateUser(editingUser.id, { roleId: selectedRoleId });
      if (res.success) {
        showNotice(`Role updated for ${editingUser.name}`);
        setEditingUser(null);
        loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to update user role', 'error');
    }
  };

  // Toggle Role Permission
  const handleTogglePermission = async (role, permId) => {
    const currentPermIds = role.permissions.map(p => p.id);
    let updated;
    if (currentPermIds.includes(permId)) {
      updated = currentPermIds.filter(id => id !== permId);
    } else {
      updated = [...currentPermIds, permId];
    }

    try {
      const res = await adminAPI.updateRolePermissions(role.id, updated);
      if (res.success) {
        showNotice(`Permissions updated for role ${role.name}`);
        loadData();
      }
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to update permissions', 'error');
    }
  };

  return (
    <div className="main-content">
      {/* Notice Alert */}
      {notice && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: notice.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 200,
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {notice.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notice.msg}</span>
        </div>
      )}

      {/* Admin Header & Stats */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-Admin">Administrator Control Center</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supervisory Governance</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Access Control & Audit Management
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Refresh Stats</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}>
              <Plus size={16} />
              <span>Add New Employee</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PORTAL USERS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {systemStats?.totalUsers || users.length}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONFIGURED ROLES</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ec4899', marginTop: '0.25rem' }}>
              {systemStats?.totalRoles || roles.length}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL AUDIT EVENTS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
              {systemStats?.totalAuditEvents || auditLogs.length}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>UNAUTHORIZED BLOCKED</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
              {systemStats?.securityViolationsBlocked || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Sliders size={18} />
          <span>Roles & Permissions Matrix</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FileText size={18} />
          <span>Security Audit Trail</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'zoho' ? 'active' : ''}`}
          onClick={() => setActiveTab('zoho')}
        >
          <Server size={18} />
          <span>Zoho One Service Account</span>
        </button>
      </div>

      {/* Tab 1: Users Management */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Company Employee Directory</h2>
              <p style={{ fontSize: '0.85rem' }}>Manage portal identities, role assignments, and account active states.</p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>EMAIL</th>
                  <th>DEPARTMENT</th>
                  <th>DESIGNATION</th>
                  <th>ASSIGNED ROLES</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar-badge" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>{u.department || '—'}</td>
                    <td>{u.designation || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {u.roles.map((r) => (
                          <span key={r} className={`badge badge-${r}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-live' : 'badge-demo'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Change Assigned Role"
                          onClick={() => {
                            setEditingUser(u);
                            const currentRole = roles.find(r => u.roles.includes(r.name));
                            setSelectedRoleId(currentRole ? currentRole.id : 2);
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Role</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          title={u.isActive ? 'Deactivate User' : 'Activate User'}
                          onClick={() => handleToggleActive(u)}
                          disabled={u.id === currentUser?.id}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete User"
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.id === currentUser?.id}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>RBAC Permissions Matrix</h2>
            <p style={{ fontSize: '0.85rem' }}>Configure fine-grained module permissions for each role. Changes apply immediately to backend route authorization.</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>PERMISSION / MODULE</th>
                  {roles.map(r => (
                    <th key={r.id} style={{ textAlign: 'center', minWidth: 110 }}>
                      <span className={`badge badge-${r.name}`}>{r.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.map((perm) => (
                  <tr key={perm.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{perm.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{perm.description} (Module: {perm.module})</div>
                    </td>
                    {roles.map((r) => {
                      const hasPerm = r.permissions?.some(p => p.id === perm.id) || r.name === 'Admin';
                      const isAdmin = r.name === 'Admin';

                      return (
                        <td key={r.id} style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={hasPerm}
                            disabled={isAdmin}
                            onChange={() => handleTogglePermission(r, perm.id)}
                            style={{ width: 18, height: 18, accentColor: 'var(--primary-500)', cursor: isAdmin ? 'not-allowed' : 'pointer' }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>System Security Audit Logs</h2>
              <p style={{ fontSize: '0.85rem' }}>Comprehensive immutable log of authentication, authorization decisions, and Zoho proxy accesses.</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search user, action, resource..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', paddingRight: '1rem', width: '220px', paddingBlock: '0.45rem', fontSize: '0.825rem' }}
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuditFilter()}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '150px', paddingBlock: '0.45rem', fontSize: '0.825rem' }}
                value={auditStatus}
                onChange={(e) => {
                  setAuditStatus(e.target.value);
                  setTimeout(handleAuditFilter, 10);
                }}
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="ACCESS_DENIED">ACCESS_DENIED</option>
                <option value="FAILED">FAILED</option>
              </select>

              <button className="btn btn-secondary btn-sm" onClick={handleAuditFilter}>
                Filter
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>USER</th>
                  <th>ACTION</th>
                  <th>RESOURCE</th>
                  <th>DETAILS</th>
                  <th>IP</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.775rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.825rem' }}>
                      {log.userEmail}
                    </td>
                    <td>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.75rem', 
                        color: log.action.includes('DENIED') ? '#ef4444' : log.action.includes('SUCCESS') ? '#10b981' : '#38bdf8' 
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {log.resource}
                    </td>
                    <td style={{ fontSize: '0.775rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                      {log.details}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {log.ipAddress}
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'SUCCESS' ? 'badge-live' : 'badge-Admin'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Zoho Service Account Integration */}
      {activeTab === 'zoho' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Zoho One Backend Service Account Architecture
            </h2>
            <p style={{ fontSize: '0.9rem' }}>
              The portal utilizes a centralized backend service account OAuth token pipeline. Employees never hold or input individual Zoho credentials.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>INTEGRATION MODE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: zohoStatus?.configured ? '#10b981' : '#f59e0b', marginTop: '0.35rem' }}>
                {zohoStatus?.mode || 'Demo Verification Mode'}
              </div>
              <p style={{ fontSize: '0.775rem', marginTop: '0.5rem' }}>
                {zohoStatus?.configured 
                  ? 'Active production OAuth 2.0 refresh token connected' 
                  : 'Automated verification mock active. Connect real Zoho trial keys in backend/.env anytime.'}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>OAUTH ACCOUNTS URL</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {zohoStatus?.accountsUrl || 'https://accounts.zoho.com'}
              </div>
              <p style={{ fontSize: '0.775rem', marginTop: '0.5rem' }}>Configurable for regional domains (e.g. accounts.zoho.in, accounts.zoho.eu)</p>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOKEN CACHING & REFRESH</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={18} /> In-Memory Cache Active
              </div>
              <p style={{ fontSize: '0.775rem', marginTop: '0.5rem' }}>Tokens cached with expiration buffer to prevent rate limiting</p>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Target Zoho One Applications Mapped:
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span className="badge badge-HR">HR</span>
                <strong>Zoho People:</strong> <code style={{ color: '#38bdf8' }}>https://people.zoho.com</code>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span className="badge badge-Sales">Sales</span>
                <strong>Zoho CRM:</strong> <code style={{ color: '#38bdf8' }}>https://crm.zoho.com</code>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span className="badge badge-Support">Support</span>
                <strong>Zoho Desk:</strong> <code style={{ color: '#38bdf8' }}>https://desk.zoho.com</code>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span className="badge badge-Finance">Finance</span>
                <strong>Zoho Books:</strong> <code style={{ color: '#38bdf8' }}>https://books.zoho.com</code>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {showAddUserModal && (
        <div className="modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Provision New Employee Account</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddUserModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Jordan Miller"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="jordan@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Talent Operations"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Recruitment Partner"
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Role *</label>
                  <select
                    className="form-select"
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({ ...newUser, roleId: Number(e.target.value) })}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — ({r.description.slice(0, 45)}...)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Role */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Update Role Assignment</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Select new role for <strong>{editingUser.name}</strong> ({editingUser.email}):
              </p>

              <div className="form-group">
                <label className="form-label">Target Role</label>
                <select
                  className="form-select"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveRole}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
