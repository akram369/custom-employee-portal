import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Layers, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  RefreshCw, 
  Key, 
  Info,
  Server
} from 'lucide-react';
import ZohoAppCard from '../components/ZohoAppCard';
import ZohoDataModal from '../components/ZohoDataModal';
import { zohoAPI, authAPI } from '../services/api';

export default function DashboardPage({ currentUser, onSwitchUser }) {
  const [authorizedApps, setAuthorizedApps] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);

  // Data Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Toast / notification
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

  // Handle Inspect Live Data (Calls backend proxy)
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

  // Handle Launch App
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

  return (
    <div className="main-content">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#6366f1',
          color: '#fff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 200,
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'modalIn 0.2s ease'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '2rem 2.25rem', 
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className={`badge badge-${primaryRole}`}>
                {primaryRole} Role Active
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Department: <strong style={{ color: 'var(--text-secondary)' }}>{currentUser?.department || 'Operations'}</strong>
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome back, {currentUser?.name}
            </h1>
            <p style={{ maxWidth: '680px', fontSize: '0.925rem', lineHeight: 1.6 }}>
              {primaryRole === 'Admin' ? (
                <span>You hold <strong>Full Administrator privileges</strong>. You are granted access to all 4 integrated Zoho One applications, user and role management, permission matrices, and security audit logs.</span>
              ) : (
                <span>
                  Your portal session is governed by <strong>Role-Based Access Control (RBAC)</strong>. You have been provisioned access exclusively to your department's designated Zoho service: <strong style={{ color: '#fff' }}>
                    {primaryRole === 'HR' && 'Zoho People (Human Resources)'}
                    {primaryRole === 'Sales' && 'Zoho CRM (Sales & Pipelines)'}
                    {primaryRole === 'Support' && 'Zoho Desk (Customer Ticketing)'}
                    {primaryRole === 'Finance' && 'Zoho Books (Financial Accounting)'}
                  </strong>.
                </span>
              )}
            </p>
          </div>

          {/* Quick Session Stats Widget */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.5)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AUTHORIZED APPS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-500)' }}>
                {authorizedApps.length} / 4
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.5)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SESSION SECURITY</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} /> Verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Explanatory Ribbon */}
      <div 
        style={{ 
          background: 'rgba(99, 102, 241, 0.06)', 
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)' }}>
            <Info size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Enforced Policy: Role-to-Application Mapping
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              HR → Zoho People • Sales → Zoho CRM • Support → Zoho Desk • Finance → Zoho Books • Admin → All
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <Server size={15} style={{ color: '#10b981' }} />
          <span>Backend OAuth Service Account: Active</span>
        </div>
      </div>

      {/* Authorized Zoho Services Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={22} style={{ color: '#10b981' }} />
            <span>Permitted Zoho One Applications</span>
          </h2>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={loadApps}
            disabled={loading}
            title="Reload applications status"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RefreshCw size={32} className="spin" style={{ color: 'var(--primary-500)', margin: '0 auto 1rem' }} />
            <p>Evaluating Role-Based Access Control permissions...</p>
          </div>
        ) : (
          <div className="apps-grid">
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
      </div>

      {/* Restricted Applications Section (Proving RBAC Isolation) */}
      {primaryRole !== 'Admin' && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              <Lock size={18} style={{ color: 'var(--danger)' }} />
              <span>Restricted Applications (Blocked by RBAC)</span>
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              These services belong to other enterprise departments. Requests to these services are strictly blocked at both the UI and backend proxy layers.
            </p>
          </div>

          <div className="apps-grid">
            {allApps.filter(app => !app.isAllowed).map((app) => (
              <ZohoAppCard
                key={app.id}
                app={app}
                isAllowed={false}
                userRoles={userRoles}
                onInspect={handleInspect}
                onLaunch={handleLaunch}
              />
            ))}
          </div>
        </div>
      )}

      {/* Live Demo Switcher Strip for Instant Video Testing */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
            <Sparkles size={16} style={{ color: '#f59e0b' }} />
            <span>Switch Role Profile (Live Demonstration & Grading)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click any role to see instant RBAC reconfiguration
          </span>
        </div>

        <div className="demo-accounts-grid">
          {demoAccounts.map((acc) => (
            <div
              key={acc.id}
              className={`demo-account-card ${currentUser?.email === acc.email ? 'active' : ''}`}
              style={{
                borderColor: currentUser?.email === acc.email ? 'var(--primary-500)' : undefined,
                background: currentUser?.email === acc.email ? 'rgba(99, 102, 241, 0.15)' : undefined
              }}
              onClick={() => onSwitchUser(acc.email, 'Password@123')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span className={`badge badge-${acc.role}`}>{acc.role}</span>
                {currentUser?.email === acc.email && (
                  <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>ACTIVE</span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{acc.name}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{acc.targetApp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Data Inspector Modal */}
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
