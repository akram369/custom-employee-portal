import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Check, 
  Minus,
  Activity,
  Key,
  ShieldCheck,
  Server
} from 'lucide-react';
import ZohoAppCard from '../components/ZohoAppCard';
import ZohoDataModal from '../components/ZohoDataModal';
import { zohoAPI, authAPI } from '../services/api';

export default function DashboardPage({ currentUser, onSwitchUser, initialSubView = 'all' }) {
  const [authorizedApps, setAuthorizedApps] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadApps = async () => {
    setLoading(true);
    try {
      const res = await zohoAPI.getAuthorizedApps();
      if (res.success) {
        setAuthorizedApps(res.authorizedApps || []);
        setAllApps(res.allApps || []);
      }
    } catch (err) {
      console.error('Failed to load Zoho applications:', err);
      showToast('Failed to fetch authorized applications from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
    authAPI.getDemoAccounts()
      .then(res => { if (res.success) setDemoAccounts(res.demoAccounts); })
      .catch(err => console.warn(err));
  }, [currentUser]);

  const handleInspect = async (app) => {
    setSelectedApp(app);
    setModalLoading(true);
    setModalError('');
    setModalData(null);

    try {
      const res = await zohoAPI.getAppData(app.id);
      if (res.success) {
        setModalData(res);
      } else {
        setModalError(res.message || 'Error fetching data from Zoho service');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Access Denied: Backend rejected proxy request.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLaunch = async (app) => {
    try {
      const res = await zohoAPI.launchApp(app.id);
      if (res.success) {
        showToast(`Launching ${res.appName} via secure backend service redirection...`, 'success');
        window.open(res.targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not launch application', 'error');
    }
  };

  const userRoles = currentUser?.roles || [];
  const primaryRole = userRoles[0] || 'Employee';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const catalogApps = [
    { id: 'zoho_crm', name: 'Zoho CRM', role: 'Sales' },
    { id: 'zoho_people', name: 'Zoho People', role: 'HR' },
    { id: 'zoho_desk', name: 'Zoho Desk', role: 'Support' },
    { id: 'zoho_books', name: 'Zoho Books', role: 'Finance' }
  ];

  return (
    <div className="main-content">
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? '#16a34a' : 'var(--primary-500)',
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
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="dashboard-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <span className="badge badge-neutral" style={{ background: '#eff6ff', color: 'var(--primary-600)', border: '1px solid #bfdbfe' }}>
              <ShieldCheck size={13} />
              <span>ROLE-BASED ACCESS</span>
            </span>
            <span className={`badge badge-${primaryRole}`}>
              {primaryRole}
            </span>
          </div>

          <h1 className="dashboard-hero-title">
            {getGreeting()}, {currentUser?.name?.split(' ')[0] || currentUser?.name}!
          </h1>
          <p className="dashboard-hero-sub">
            Here's your personalized workspace. Access your authorized enterprise applications below.
          </p>
        </div>

        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid var(--border-default)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Your Role
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-title)' }}>
              {primaryRole}
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border-default)' }} />
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Authorized Apps
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-500)' }}>
              {authorizedApps.length} of 4
            </div>
          </div>
        </div>
      </div>

      <section id="applications-section" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-title)' }}>
              Your applications
            </h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>
              Services provisioned exclusively for the <strong>{primaryRole}</strong> role.
            </p>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={loadApps}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RefreshCw size={32} className="spin" style={{ color: 'var(--primary-500)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Evaluating role permissions...</p>
          </div>
        ) : (
          <div className="saas-apps-grid">
            {authorizedApps.map((app) => (
              <ZohoAppCard
                key={app.id}
                app={app}
                isAllowed={true}
                userRoles={userRoles}
                onInspect={handleInspect}
                onLaunch={handleLaunch}
              />
            ))}
          </div>
        )}
      </section>

      <section className="access-viz-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Security Architecture
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-title)', marginTop: '0.2rem' }}>
              Your Access
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Visual verification of backend Role-Based Access Control isolation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ASSIGNED ROLE</span>
              <div style={{ fontWeight: 800, color: 'var(--text-title)' }}>{primaryRole.toUpperCase()}</div>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              {authorizedApps.length} of 4 Authorized
            </span>
          </div>
        </div>

        <div className="access-viz-grid">
          {catalogApps.map((app) => {
            const isAuthorized = primaryRole === 'Admin' || primaryRole === app.role;
            return (
              <div 
                key={app.id} 
                className={`access-viz-item ${isAuthorized ? 'authorized' : 'restricted'}`}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-title)' }}>
                    {app.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Role: {app.role}
                  </div>
                </div>

                {isAuthorized ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Check size={18} />
                    <span>Active</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>
                    <Minus size={16} />
                    <span>Restricted</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section id="activity-section" style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-title)' }}>
            Recent Activity
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Session activity and security events associated with your portal identity.
          </p>
        </div>

        <div className="saas-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <Check size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-title)' }}>
                  Signed in successfully
                </div>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                  Authenticated as {currentUser?.email} via corporate JWT credentials
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} />
                <span>Today</span>
              </div>
            </div>

            <div style={{ width: '100%', height: 1, background: 'var(--border-subtle)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', color: '#0c66e4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <Server size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-title)' }}>
                  Backend Zoho OAuth Service Account Active
                </div>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                  Centralized token management verified. Zero employee credentials required.
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} />
                <span>Today</span>
              </div>
            </div>

            <div style={{ width: '100%', height: 1, background: 'var(--border-subtle)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <Check size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-title)' }}>
                  Role verified: {primaryRole}
                </div>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                  Role-to-application access policy applied across all backend routes.
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} />
                <span>Session Start</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-switcher-dock">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--primary-500)' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-title)' }}>
              Quick Demo Access
            </h4>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click any role to test instant RBAC reconfiguration
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {demoAccounts.map((acc) => {
            const isActive = currentUser?.email === acc.email;
            return (
              <div
                key={acc.id}
                onClick={() => onSwitchUser(acc.email, 'Password@123')}
                style={{
                  background: isActive ? 'var(--primary-50)' : '#ffffff',
                  border: isActive ? '2px solid var(--primary-500)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span className={`badge badge-${acc.role}`} style={{ fontSize: '0.675rem' }}>
                    {acc.role}
                  </span>
                  {isActive && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary-600)', fontWeight: 800 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>
                  {acc.name}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {acc.targetApp}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedApp && (
        <ZohoDataModal
          app={selectedApp}
          data={modalData}
          loading={modalLoading}
          error={modalError}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => handleInspect(selectedApp)}
        />
      )}
    </div>
  );
}
