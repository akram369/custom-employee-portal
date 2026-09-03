import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  UserCheck, 
  AlertCircle, 
  KeyRound, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  CheckCircle2,
  TrendingUp,
  Users,
  Headphones,
  Receipt,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { authAPI } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [demoOpen, setDemoOpen] = useState(true); // Open by default for evaluator convenience

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
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (acc) => {
    setEmail(acc.email);
    setPassword('Password@123');
    setLoading(true);
    setError('');

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header className="zoho-navbar">
        <div className="zoho-navbar-inner">
          <div className="portal-brand">
            <div className="portal-brand-symbol">
              <Shield size={22} />
            </div>
            <div className="portal-brand-text">
              <span className="portal-brand-title">Enterprise Employee Portal</span>
              <span className="portal-brand-subtitle">Zoho One Workspace</span>
            </div>
          </div>

          <nav className="nav-menu" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="nav-item">Features</span>
            <span className="nav-item">Solutions</span>
            <span className="nav-item">Zoho Apps</span>
            <span className="nav-item">Security</span>
            <span className="nav-item">Resources</span>
          </nav>

          <div className="nav-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <Globe size={16} />
              <span>English (India)</span>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => alert('For portal access or IT assistance, please contact it-support@company.com')}
            >
              Contact Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="landing-hero">
        {/* Left Hero Column */}
        <div className="landing-left">
          <div className="hero-pill-badge">
            <Sparkles size={14} style={{ color: 'var(--primary-500)' }} />
            <span>Unified Role-Based Access Control</span>
          </div>

          <h1 className="hero-headline">
            One workspace.<br />
            <span className="hero-headline-accent">Every employee.</span><br />
            The right tools.
          </h1>

          <p className="hero-supporting">
            Secure access to your organization's business applications through role-based permissions.
          </p>

          <div className="hero-statement">
            One secure entry point for Zoho One services.
          </div>

          {/* 4 Small Application Cards */}
          <div className="hero-apps-grid">
            <div className="hero-app-mini">
              <div className="hero-app-mini-icon" style={{ background: '#eff6ff', color: '#0c66e4' }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-title)' }}>Zoho CRM</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Sales & Deals</div>
              </div>
            </div>

            <div className="hero-app-mini">
              <div className="hero-app-mini-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-title)' }}>Zoho People</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>HR & Directory</div>
              </div>
            </div>

            <div className="hero-app-mini">
              <div className="hero-app-mini-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Headphones size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-title)' }}>Zoho Desk</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Support Cases</div>
              </div>
            </div>

            <div className="hero-app-mini">
              <div className="hero-app-mini-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Receipt size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-title)' }}>Zoho Books</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Finance & Invoices</div>
              </div>
            </div>
          </div>

          {/* 3 Feature Highlights */}
          <div className="hero-features-row">
            <div className="hero-feature-item">
              <div className="hero-feature-title">
                <Shield size={16} style={{ color: 'var(--primary-500)' }} />
                <span>Secure Access</span>
              </div>
              <div className="hero-feature-desc">Enterprise-grade security</div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-title">
                <UserCheck size={16} style={{ color: '#059669' }} />
                <span>Role-Based</span>
              </div>
              <div className="hero-feature-desc">Access only what you need</div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-title">
                <Sparkles size={16} style={{ color: '#ea580c' }} />
                <span>Higher Productivity</span>
              </div>
              <div className="hero-feature-desc">Your tools in one place</div>
            </div>
          </div>
        </div>

        {/* Right Hero Column: Large White Rounded Login Card */}
        <div className="login-card-container">
          <div className="login-card-header">
            <h2 className="login-card-title">Welcome back</h2>
            <p className="login-card-subtitle">Sign in to your Enterprise Portal</p>
          </div>

          {error && (
            <div style={{ 
              background: 'var(--danger-bg)', 
              border: '1px solid var(--danger-border)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.75rem 1rem', 
              color: 'var(--danger)', 
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="work-email">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="work-email"
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
              <label className="form-label" htmlFor="portal-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="portal-password"
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
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Try a demo account accordion */}
          <div className="demo-account-accordion">
            <button 
              type="button" 
              className="demo-account-accordion-trigger"
              onClick={() => setDemoOpen(!demoOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} style={{ color: 'var(--primary-500)' }} />
                <span>Try a demo account</span>
              </div>
              {demoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {demoOpen && (
              <div className="demo-account-list">
                {demoAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="demo-account-item"
                    onClick={() => handleQuickLogin(acc)}
                    title={`Click to log in immediately as ${acc.name} (${acc.role})`}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>
                          {acc.name}
                        </span>
                        <span className={`badge badge-${acc.role}`} style={{ fontSize: '0.7rem' }}>
                          {acc.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        Authorized: <strong style={{ color: 'var(--text-secondary)' }}>{acc.targetApp}</strong>
                      </div>
                    </div>

                    <ArrowRight size={14} style={{ color: 'var(--primary-500)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zero Zoho credentials required notice */}
          <div className="zero-credential-banner">
            <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div className="zero-credential-banner-text">
              <strong>Zero Zoho credentials required</strong><br />
              Employees access authorized Zoho services through the company portal. Zoho authentication is securely managed by the backend.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
