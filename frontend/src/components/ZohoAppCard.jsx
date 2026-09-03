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
  ShieldAlert 
} from 'lucide-react';

export default function ZohoAppCard({ app, isAllowed, userRoles, onInspect, onLaunch }) {
  // Map icon name to Lucide component
  const getIcon = () => {
    switch (app.id) {
      case 'zoho_people':
        return <Users size={26} />;
      case 'zoho_crm':
        return <TrendingUp size={26} />;
      case 'zoho_desk':
        return <Headphones size={26} />;
      case 'zoho_books':
        return <Receipt size={26} />;
      default:
        return <ExternalLink size={26} />;
    }
  };

  return (
    <div 
      className={`app-card ${!isAllowed ? 'locked' : ''}`}
      style={{
        '--card-accent': app.themeColor,
        '--card-glow': `${app.themeColor}33`
      }}
    >
      <div>
        {/* Card Header */}
        <div className="app-header">
          <div 
            className="app-icon-wrap" 
            style={{ 
              background: isAllowed 
                ? `linear-gradient(135deg, ${app.themeColor} 0%, #1e1b4b 140%)` 
                : '#334155' 
            }}
          >
            {isAllowed ? getIcon() : <Lock size={24} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
            <span className={`badge badge-${app.role}`}>
              {app.role} Access Only
            </span>
            {isAllowed ? (
              <span className="badge badge-live" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                <CheckCircle2 size={12} /> Authorized
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                <ShieldAlert size={12} /> Restricted
              </span>
            )}
          </div>
        </div>

        {/* Title and Category */}
        <div className="app-category">{app.category}</div>
        <h3 className="app-title">{app.name}</h3>
        <p className="app-description">{app.description}</p>

        {/* Key Features */}
        <div className="app-features">
          {app.features?.map((f, i) => (
            <span key={i} className="feature-pill">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="app-actions">
        {isAllowed ? (
          <>
            <button
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => onInspect(app)}
              title="Query backend API proxy to fetch live Zoho data"
            >
              <Eye size={15} />
              <span>Live Data</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2 }}
              onClick={() => onLaunch(app)}
              title="Launch Zoho application with backend service authentication"
            >
              <span>Launch App</span>
              <ExternalLink size={15} />
            </button>
          </>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
            disabled
          >
            <Lock size={15} />
            <span>Role Restricted ({app.role} required)</span>
          </button>
        )}
      </div>
    </div>
  );
}
