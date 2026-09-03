import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { authAPI } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    // Load pre-configured demo accounts for 1-click login
    authAPI.getDemoAccounts()
      .then(res => {
        if (res.success) {
          setDemoAccounts(res.demoAccounts);
        }
      })
      .catch(err => console.warn('Could not load demo accounts:', err));
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        onLoginSuccess(response.token, response.user);
      } else {
        setError(response.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (acc) => {
    setEmail(acc.email);
    setPassword('Password@123');
    // Direct submit
    setLoading(true);
    authAPI.login(acc.email, 'Password@123')
      .then(res => {
        if (res.success) {
          onLoginSuccess(res.token, res.user);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Login failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            className="brand-icon" 
            style={{ width: '56px', height: '56px', margin: '0 auto 1rem', borderRadius: '16px' }}
          >
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Enterprise Employee Portal
          </h1>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            Zoho One Unified Role-Based Access Control System
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel" style={{ padding: '2.25rem', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={20} style={{ color: 'var(--primary-500)' }} />
            <span>Sign In to Your Workspace</span>
          </h2>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.75rem 1rem', 
              color: '#f87171', 
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Corporate Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Portal Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type="password"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Authenticate & Enter Portal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Zero Credential Guarantee */}
          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1.25rem', 
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.775rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            textAlign: 'center'
          }}>
            🛡️ <strong>Zero Zoho Credential Guarantee:</strong> Employees log in using company portal credentials. Zoho service authorization is managed securely on the backend via OAuth service account.
          </div>
        </div>

        {/* Demo Fast Login Switcher (Designed for video demo and evaluator review) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <Sparkles size={16} style={{ color: '#f59e0b' }} />
              <span>1-Click Role Switcher (Evaluation Demo)</span>
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Auto-fills & logs in</span>
          </div>

          <div className="demo-accounts-grid">
            {demoAccounts.map((acc) => (
              <div
                key={acc.id}
                className="demo-account-card"
                onClick={() => handleQuickLogin(acc)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span className={`badge badge-${acc.role}`}>{acc.role}</span>
                  <UserCheck size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {acc.name}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Target: <strong style={{ color: '#cbd5e1' }}>{acc.targetApp}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
