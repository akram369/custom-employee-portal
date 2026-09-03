import React from 'react';
import { Shield, LayoutDashboard, Settings, LogOut, KeyRound, ExternalLink } from 'lucide-react';
import { authUtil } from '../utils/auth';

export default function Navbar({ currentUser, onLogout, currentView, setCurrentView }) {
  const isAdmin = currentUser?.roles?.includes('Admin');

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <div className="brand-title">WavePortal</div>
            <div className="brand-subtitle">Zoho One Enterprise RBAC</div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="nav-links">
          <button
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              <Settings size={18} />
              <span>Admin Management</span>
            </button>
          )}
        </nav>

        {/* User Info & Actions */}
        <div className="user-profile-menu">
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser?.name || 'Employee User'}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
              {currentUser?.roles?.map((role) => (
                <span key={role} className={`badge badge-${role}`}>
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="user-avatar-badge" title={currentUser?.email}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
            title="Sign out of Employee Portal"
            style={{ marginLeft: '0.5rem' }}
          >
            <LogOut size={16} />
            <span style={{ display: 'inline' }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
