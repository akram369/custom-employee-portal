import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  X,
  FileText,
  ShieldCheck,
  Server,
  Layers,
  Send,
  ExternalLink
} from 'lucide-react';
import { authAPI } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [demoOpen, setDemoOpen] = useState(true);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (India)');

  const [contactForm, setContactForm] = useState({ name: '', email: '', department: 'Sales', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setShowContactModal(false);
      setContactForm({ name: '', email: '', department: 'Sales', message: '' });
    }, 2500);
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="zoho-navbar">
        <div className="zoho-navbar-inner" ref={dropdownRef} style={{ position: 'relative' }}>
          <div className="portal-brand" onClick={() => {}}>
            <div className="portal-brand-symbol">
              <Shield size={22} />
            </div>
            <div className="portal-brand-text">
              <span className="portal-brand-title">Enterprise Employee Portal</span>
              <span className="portal-brand-subtitle">Zoho One Workspace</span>
            </div>
          </div>

          <nav className="nav-menu">
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`nav-item ${activeDropdown === 'features' ? 'active' : ''}`}
                onClick={() => toggleDropdown('features')}
              >
                <span>Features</span>
                <ChevronDown size={14} />
              </button>

              {activeDropdown === 'features' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '320px',
                  padding: '1rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ padding: '0.4rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#eff6ff', color: '#0c66e4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>Role-Based Access Control</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Granular JWT-verified authorization for every department.</div>
                    </div>
                  </div>

                  <div style={{ padding: '0.4rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Server size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>Zero-Credential Backend Proxy</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Employees never hold individual Zoho credentials.</div>
                    </div>
                  </div>

                  <div style={{ padding: '0.4rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>Immutable Audit Trail</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time logging of all logins, role checks, and blocked intrusions.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`nav-item ${activeDropdown === 'solutions' ? 'active' : ''}`}
                onClick={() => toggleDropdown('solutions')}
              >
                <span>Solutions</span>
                <ChevronDown size={14} />
              </button>

              {activeDropdown === 'solutions' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '320px',
                  padding: '1rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.4rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#eff6ff', color: '#0c66e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Sales Operations</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Leads & deals in Zoho CRM</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.4rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>People & Talent</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staff directory in Zoho People</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.4rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Headphones size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Customer Helpdesk</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticketing SLAs in Zoho Desk</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.4rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Receipt size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Corporate Accounting</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoicing & billing in Zoho Books</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`nav-item ${activeDropdown === 'apps' ? 'active' : ''}`}
                onClick={() => toggleDropdown('apps')}
              >
                <span>Zoho Apps</span>
                <ChevronDown size={14} />
              </button>

              {activeDropdown === 'apps' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '300px',
                  padding: '1rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  <a href="https://crm.zoho.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} style={{ color: '#0c66e4' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>Zoho CRM</span>
                    </div>
                    <span className="badge badge-Sales" style={{ fontSize: '0.65rem' }}>Sales</span>
                  </a>

                  <a href="https://people.zoho.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} style={{ color: '#059669' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>Zoho People</span>
                    </div>
                    <span className="badge badge-HR" style={{ fontSize: '0.65rem' }}>HR</span>
                  </a>

                  <a href="https://desk.zoho.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Headphones size={16} style={{ color: '#ea580c' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>Zoho Desk</span>
                    </div>
                    <span className="badge badge-Support" style={{ fontSize: '0.65rem' }}>Support</span>
                  </a>

                  <a href="https://books.zoho.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Receipt size={16} style={{ color: '#7c3aed' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-title)' }}>Zoho Books</span>
                    </div>
                    <span className="badge badge-Finance" style={{ fontSize: '0.65rem' }}>Finance</span>
                  </a>
                </div>
              )}
            </div>

            <button
              type="button"
              className="nav-item"
              onClick={() => setShowSecurityModal(true)}
            >
              <span>Security</span>
            </button>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`nav-item ${activeDropdown === 'resources' ? 'active' : ''}`}
                onClick={() => toggleDropdown('resources')}
              >
                <span>Resources</span>
                <ChevronDown size={14} />
              </button>

              {activeDropdown === 'resources' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '280px',
                  padding: '1rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <a href="/api/health" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-title)', fontSize: '0.875rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                    <span>API Health Check</span>
                  </a>
                  <div onClick={() => setShowSecurityModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-title)', fontSize: '0.875rem', fontWeight: 600 }}>
                    <ShieldCheck size={16} style={{ color: '#0c66e4' }} />
                    <span>OAuth Integration Architecture</span>
                  </div>
                  <a href="https://api-console.zoho.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-title)', fontSize: '0.875rem', fontWeight: 600 }}>
                    <ExternalLink size={16} style={{ color: '#7c3aed' }} />
                    <span>Zoho API Console</span>
                  </a>
                </div>
              )}
            </div>
          </nav>

          <div className="nav-actions">
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid var(--border-default)' }}
                onClick={() => toggleDropdown('lang')}
              >
                <Globe size={15} style={{ color: 'var(--primary-500)' }} />
                <span style={{ fontWeight: 600 }}>{selectedLanguage}</span>
                <ChevronDown size={12} />
              </div>

              {activeDropdown === 'lang' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '180px',
                  padding: '0.5rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  {['English (India)', 'English (US)', 'English (UK)', 'Español', 'Français', 'Deutsch'].map(lang => (
                    <div
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setActiveDropdown(null);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.825rem',
                        fontWeight: selectedLanguage === lang ? 700 : 500,
                        color: selectedLanguage === lang ? 'var(--primary-600)' : 'var(--text-title)',
                        background: selectedLanguage === lang ? 'var(--primary-50)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowContactModal(true)}
            >
              Contact Admin
            </button>
          </div>
        </div>
      </header>

      <main className="landing-hero">
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

          <div className="zero-credential-banner">
            <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div className="zero-credential-banner-text">
              <strong>Zero Zoho credentials required</strong><br />
              Employees access authorized Zoho services through the company portal. Zoho authentication is securely managed by the backend.
            </div>
          </div>
        </div>
      </main>

      {showSecurityModal && (
        <div className="modal-overlay" onClick={() => setShowSecurityModal(false)}>
          <div className="modal-window" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-clean">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#eff6ff', color: '#0c66e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Enterprise Security Architecture</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role-Based Access Control & Zoho Token Management</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSecurityModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body-clean">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    1. Zero-Credential Isolation
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#166534', lineHeight: 1.5 }}>
                    Individual staff members never need personal Zoho accounts or passwords. The backend acts as a single trusted service account using OAuth 2.0 refresh tokens.
                  </div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    2. Enforced RBAC Authorization
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#1e40af', lineHeight: 1.5 }}>
                    Every API request is guarded by <code style={{ color: '#0c66e4', fontWeight: 700 }}>verifyRole()</code> and <code style={{ color: '#0c66e4', fontWeight: 700 }}>verifyPermission()</code> middlewares. Non-authorized calls return HTTP 403 Forbidden.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-title)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    3. Immutable Audit Trails
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    All logins, Zoho proxy queries, and blocked intrusion attempts are logged with client IP address, timestamp, action name, and status in the relational <code style={{ color: '#0c66e4', fontWeight: 700 }}>AuditLogs</code> table.
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-clean">
              <button className="btn btn-primary btn-sm" onClick={() => setShowSecurityModal(false)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-window" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-clean">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#eff6ff', color: '#0c66e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Contact Administrator</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Request account provisioning or report access issues</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowContactModal(false)}>
                <X size={16} />
              </button>
            </div>

            {contactSubmitted ? (
              <div className="modal-body-clean" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '0.5rem' }}>
                  Message Sent to Administrator
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Your request has been routed to <strong>admin@company.com</strong>. You will receive an email response shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                <div className="modal-body-clean">
                  <div className="form-group">
                    <label className="form-label">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Alex Taylor"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Email *</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="alex@company.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={contactForm.department}
                      onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                    >
                      <option value="HR">Human Resources (Zoho People)</option>
                      <option value="Sales">Sales & Business Dev (Zoho CRM)</option>
                      <option value="Support">Customer Support (Zoho Desk)</option>
                      <option value="Finance">Corporate Finance (Zoho Books)</option>
                      <option value="IT">IT Operations & Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Issue or Request Details *</label>
                    <textarea
                      required
                      rows={3}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                      placeholder="Describe the application access needed or password reset request..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer-clean">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowContactModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} />
                    <span>Send Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
