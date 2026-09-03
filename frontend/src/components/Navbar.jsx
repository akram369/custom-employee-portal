import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Grid, 
  Activity, 
  Settings, 
  LogOut, 
  CheckCircle2 
} from 'lucide-react';

export default function Navbar({ currentUser, onLogout, currentView, setCurrentView }) {
  const isAdmin = currentUser?.roles?.includes('Admin');
  const userRole = currentUser?.roles?.[0] || 'Employee';

  return (
    <header className="zoho-navbar">
      <div className="zoho-navbar-inner">
        <div className="portal-brand" onClick={() => setCurrentView('dashboard')}>
          <div className="portal-brand-symbol">
            <Shield size={22} />
          </div>
          <div className="portal-brand-text">
            <span className="portal-brand-title">Enterprise Portal</span>
            <span className="portal-brand-subtitle">Zoho One Workspace</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${currentView === 'applications' ? 'active' : ''}`}
            onClick={() => setCurrentView('applications')}
          >
            <Grid size={16} />
            <span>Applications</span>
          </button>

          <button
            className={`nav-item ${currentView === 'activity' ? 'active' : ''}`}
            onClick={() => setCurrentView('activity')}
          >
            <Activity size={16} />
            <span>Activity</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              <Settings size={16} />
              <span>Administration</span>
            </button>
          )}
        </nav>

        <div className="nav-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--primary-50)',
                border: '2px solid var(--primary-200)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>
                  {currentUser?.name || 'Employee'}
                </span>
                <span className={`badge badge-${userRole}`} style={{ fontSize: '0.675rem', padding: '0.15rem 0.5rem' }}>
                  {userRole}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', color: '#16a34a' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                <span>Online</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
            title="Sign out of Enterprise Portal"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
