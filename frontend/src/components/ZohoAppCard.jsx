import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Headphones, 
  Receipt, 
  Lock, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ZohoAppCard({ app, isAllowed, userRoles, onInspect, onLaunch }) {
  // Map application ID to icon and palette
  const getAppMeta = () => {
    switch (app.id) {
      case 'zoho_people':
        return {
          icon: <Users size={24} />,
          bg: '#ecfdf5',
          color: '#059669',
          dept: 'Human Resources & Talent',
          desc: 'Manage employee records, leave requests, attendance and performance.'
        };
      case 'zoho_crm':
        return {
          icon: <TrendingUp size={24} />,
          bg: '#eff6ff',
          color: '#0c66e4',
          dept: 'Sales & Customer Management',
          desc: 'Manage leads, accounts and sales opportunities.'
        };
      case 'zoho_desk':
        return {
          icon: <Headphones size={24} />,
          bg: '#fff7ed',
          color: '#ea580c',
          dept: 'Customer Support & Ticketing',
          desc: 'Resolve customer tickets, manage SLAs, and support incoming client requests.'
        };
      case 'zoho_books':
        return {
          icon: <Receipt size={24} />,
          bg: '#f5f3ff',
          color: '#7c3aed',
          dept: 'Finance & Accounting',
          desc: 'Track accounts, issue invoices, reconcile expenses, and view financial statements.'
        };
      default:
        return {
          icon: <ExternalLink size={24} />,
          bg: '#f8fafc',
          color: '#0c66e4',
          dept: app.category || 'Business App',
          desc: app.description
        };
    }
  };

  const meta = getAppMeta();

  return (
    <div className={`saas-app-card ${!isAllowed ? 'locked' : ''}`}>
      <div>
        {/* Card Header */}
        <div className="saas-app-header">
          <div 
            className="saas-app-icon" 
            style={{ background: isAllowed ? meta.bg : '#f1f5f9', color: isAllowed ? meta.color : '#94a3b8' }}
          >
            {isAllowed ? meta.icon : <Lock size={22} />}
          </div>

          <div style={{ textAlign: 'right' }}>
            {isAllowed ? (
              <span className="badge badge-success">
                <CheckCircle2 size={12} />
                <span>Authorized</span>
              </span>
            ) : (
              <span className="badge badge-neutral" style={{ color: '#94a3b8' }}>
                <Lock size={12} />
                <span>Restricted</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Department */}
        <div className="saas-app-dept">{meta.dept}</div>
        <h3 className="saas-app-name">{app.name}</h3>
        <p className="saas-app-desc">{meta.desc}</p>
      </div>

      {/* Card Actions */}
      <div className="saas-app-actions">
        {isAllowed ? (
          <>
            <button
              className="btn btn-primary btn-sm"
              style={{ flex: 1.3 }}
              onClick={() => onLaunch(app)}
              title={`Launch ${app.name} via backend service account`}
            >
              <span>Open Application</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ flex: 0.9 }}
              onClick={() => onInspect(app)}
              title="View live backend-proxied records"
            >
              <Eye size={14} />
              <span>View Data</span>
            </button>
          </>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', color: '#94a3b8' }}
            disabled
          >
            <Lock size={14} />
            <span>Requires {app.role} Role</span>
          </button>
        )}
      </div>
    </div>
  );
}
