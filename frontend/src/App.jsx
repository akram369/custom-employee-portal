import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import { authUtil } from './utils/auth';
import { authAPI } from './services/api';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const token = authUtil.getToken();
    if (token) {
      authAPI.getMe()
        .then(res => {
          if (res.success && res.user) {
            setCurrentUser(res.user);
            authUtil.setUser(res.user);
          } else {
            authUtil.clearSession();
            setCurrentUser(null);
          }
        })
        .catch(() => {
          authUtil.clearSession();
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (token, user) => {
    authUtil.setToken(token);
    authUtil.setUser(user);
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authUtil.clearSession();
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleSwitchUser = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      if (res.success) {
        handleLoginSuccess(res.token, res.user);
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  useEffect(() => {
    if (currentView === 'applications') {
      const el = document.getElementById('applications-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (currentView === 'activity') {
      const el = document.getElementById('activity-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (currentView === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div 
            className="spin" 
            style={{ 
              width: 44, 
              height: 44, 
              margin: '0 auto 1rem', 
              borderRadius: '50%', 
              border: '3px solid #eff6ff', 
              borderTopColor: '#0c66e4' 
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
            Initializing Enterprise Portal session...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.roles?.includes('Admin');

  return (
    <div className="app-container">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {(currentView === 'dashboard' || currentView === 'applications' || currentView === 'activity') && (
        <DashboardPage
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          initialSubView={currentView}
        />
      )}

      {currentView === 'admin' && (
        isAdmin ? (
          <AdminPanelPage currentUser={currentUser} />
        ) : (
          <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div className="saas-card" style={{ maxWidth: '520px', margin: '0 auto', padding: '3.5rem 2.5rem' }}>
              <div 
                style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  background: 'var(--danger-bg)', 
                  color: 'var(--danger)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.25rem' 
                }}
              >
                <ShieldAlert size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-title)' }}>
                403 Forbidden: Insufficient Privileges
              </h2>
              <p style={{ fontSize: '0.925rem', marginBottom: '1.75rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Your current role is <strong>{currentUser.roles?.join(', ')}</strong>. The Administration Console is restricted strictly to the <strong>Admin</strong> role. This attempt has been logged in the security audit trail.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentView('dashboard')}
              >
                <ArrowLeft size={16} />
                <span>Return to Workspace</span>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
