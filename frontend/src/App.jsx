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
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'admin'

  // Restore session from token on mount
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-icon spin" style={{ width: 48, height: 48, margin: '0 auto 1rem' }}>
            ⚡
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Initializing secure portal session...</p>
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

      {currentView === 'dashboard' && (
        <DashboardPage
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {currentView === 'admin' && (
        isAdmin ? (
          <AdminPanelPage currentUser={currentUser} />
        ) : (
          <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div className="glass-panel" style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 2rem' }}>
              <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f87171' }}>
                403 Forbidden: Insufficient Privileges
              </h2>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Your assigned role is <strong>{currentUser.roles?.join(', ')}</strong>. The Administrator Control Center is restricted strictly to the <strong>Admin</strong> role. This unauthorized attempt has been recorded in the security audit trail.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentView('dashboard')}
              >
                <ArrowLeft size={16} />
                <span>Return to Authorized Dashboard</span>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
