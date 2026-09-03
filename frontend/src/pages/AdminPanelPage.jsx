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
  Server,
  Minus,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { adminAPI, zohoAPI } from '../services/api';

export default function AdminPanelPage({ currentUser }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [zohoStatus, setZohoStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    department: '',
    designation: '',
    roleId: 2
  });

  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(2);

  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatus, setAuditStatus] = useState('');

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
      {notice && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: notice.type === 'error' ? 'var(--danger)' : '#16a34a',
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

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-Admin">ENTERPRISE ADMINISTRATION</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supervisory Governance</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-title)' }}>
              Administration
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Manage employees, access policies and security activity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}>
              <Plus size={16} />
              <span>+ Add Employee</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="saas-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PORTAL EMPLOYEES</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-title)', marginTop: '0.25rem' }}>
              {systemStats?.totalUsers || users.length}
            </div>
          </div>
          <div className="saas-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>RBAC ROLES</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0c66e4', marginTop: '0.25rem' }}>
              {systemStats?.totalRoles || roles.length}
            </div>
          </div>
          <div className="saas-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AUDIT EVENTS</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
              {systemStats?.totalAuditEvents || auditLogs.length}
            </div>
          </div>
          <div className="saas-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>BLOCKED ATTEMPTS</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ea580c', marginTop: '0.25rem' }}>
              {systemStats?.securityViolationsBlocked || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={17} />
          <span>Users</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Sliders size={17} />
          <span>Roles & Permissions</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FileText size={17} />
          <span>Audit Logs</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'zoho' ? 'active' : ''}`}
          onClick={() => setActiveTab('zoho')}
        >
          <Server size={17} />
          <span>Zoho Connection</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-title)' }}>
                Employee Directory
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                View and manage portal user identities, department roles, and active states.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}>
              <Plus size={15} />
              <span>+ Add Employee</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>DEPARTMENT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div 
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            color: 'var(--primary-600)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.825rem'
                          }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-title)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.designation || 'Staff'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {u.roles.map((r) => (
                          <span key={r} className={`badge badge-${r}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{u.department || '—'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit Role Assignment"
                          onClick={() => {
                            setEditingUser(u);
                            const currentRole = roles.find(r => u.roles.includes(r.name));
                            setSelectedRoleId(currentRole ? currentRole.id : 2);
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleActive(u)}
                          disabled={u.id === currentUser?.id}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Employee"
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

      {activeTab === 'roles' && (
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-title)' }}>
              Role & Permission Matrix
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Visual map of role authorizations across integrated Zoho applications and admin capabilities.
            </p>
          </div>

          <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Application Access Overview
            </div>
            <div className="table-responsive">
              <table className="saas-table" style={{ textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>ROLE</th>
                    <th style={{ textAlign: 'center' }}>PEOPLE (HR)</th>
                    <th style={{ textAlign: 'center' }}>CRM (SALES)</th>
                    <th style={{ textAlign: 'center' }}>DESK (SUPPORT)</th>
                    <th style={{ textAlign: 'center' }}>BOOKS (FINANCE)</th>
                    <th style={{ textAlign: 'center' }}>ADMIN CONSOLE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}><span className="badge badge-Admin">Admin</span></td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}><span className="badge badge-HR">HR</span></td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}><span className="badge badge-Sales">Sales</span></td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}><span className="badge badge-Support">Support</span></td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}><span className="badge badge-Finance">Finance</span></td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>✓</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '1rem 0 0.5rem' }}>
              Granular Backend Permissions Toggle
            </div>
            <div className="table-responsive">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>PERMISSION NAME</th>
                    <th>MODULE</th>
                    {roles.map(r => (
                      <th key={r.id} style={{ textAlign: 'center' }}>
                        <span className={`badge badge-${r.name}`}>{r.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPermissions.map((perm) => (
                    <tr key={perm.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{perm.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{perm.description}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{perm.module}</span>
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
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-title)' }}>
                Security Activity
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Immutable audit trail tracking authentications, RBAC checks, and Zoho proxy accesses.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter by user, action..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', paddingBlock: '0.45rem', fontSize: '0.825rem', width: '200px' }}
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
                <option value="ACCESS_DENIED">ACCESS DENIED</option>
                <option value="FAILED">FAILED</option>
              </select>

              <button className="btn btn-secondary btn-sm" onClick={handleAuditFilter}>
                Filter
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="saas-table">
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
                    <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {log.userEmail}
                    </td>
                    <td>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.775rem', 
                        color: log.action.includes('DENIED') ? 'var(--danger)' : log.action.includes('SUCCESS') ? '#16a34a' : 'var(--primary-600)' 
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {log.resource}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                      {log.details}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {log.ipAddress}
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status === 'ACCESS_DENIED' ? 'ACCESS DENIED' : log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'zoho' && (
        <div className="saas-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-success" style={{ padding: '0.3rem 0.75rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                  <span>Connected</span>
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OAuth 2.0 Centralized Service</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)' }}>
                Zoho One Integration
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Employees authenticate only with the Enterprise Portal. Zoho credentials and OAuth tokens remain securely on the backend.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STATUS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                <span>Connected</span>
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Backend service account token pipeline is operational.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AUTHENTICATION</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', marginTop: '0.25rem' }}>
                OAuth 2.0
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Grant Type: refresh_token with automated in-memory caching.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AUTHENTICATION MODE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.25rem' }}>
                Backend Service Account
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Single centralized credentials managed server-side.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>EMPLOYEE ZOHO CREDENTIALS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
                Not Required
              </div>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Employees never handle or enter Zoho usernames/passwords.
              </p>
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid var(--success-border)', borderRadius: '14px', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
              🛡️ Enterprise Security Architecture
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.6 }}>
              The portal communicates directly with Zoho One APIs on behalf of authorized users. When a Sales employee navigates to Zoho CRM or requests CRM data, the backend attaches its internal service account token, routes the request to Zoho servers, and streams the authorized result back. All non-authorized application requests are immediately rejected with HTTP 403 Forbidden.
            </p>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-window" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-clean">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Provision New Employee</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddUserModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body-clean">
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
                  <label className="form-label">Work Email Address *</label>
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

              <div className="modal-footer-clean">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-window" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-clean">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Update Role Assignment</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body-clean">
              <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
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
            <div className="modal-footer-clean">
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
