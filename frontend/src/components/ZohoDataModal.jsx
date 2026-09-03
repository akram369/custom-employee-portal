import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Database, 
  Code, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function ZohoDataModal({ app, data, loading, error, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('formatted'); // 'formatted' | 'raw'

  if (!app) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: app.themeColor || 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {app.name} - Live Backend Proxy Data
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Protected Backend Service Account Proxy • Role Requirement: {app.role}
              </p>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Security Banner */}
        <div 
          style={{ 
            background: 'rgba(99, 102, 241, 0.08)', 
            borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
            padding: '0.75rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc' }}>
            <ShieldCheck size={16} />
            <span><strong>Zero-Credential Security Architecture:</strong> Proxied via backend OAuth token. No employee Zoho password required.</span>
          </div>

          {data?.integration && (
            <span className={`badge ${data.integration.isLive ? 'badge-live' : 'badge-demo'}`}>
              {data.integration.isLive ? 'Live Zoho Cloud' : 'Demo Verification Mode'}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw className="spin" size={32} style={{ color: 'var(--primary-500)', margin: '0 auto 1rem' }} />
              <p>Contacting backend Zoho proxy service...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: 'var(--danger)', margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Failed to Load Data</h4>
              <p style={{ fontSize: '0.875rem' }}>{error}</p>
            </div>
          ) : (
            <div>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'formatted' ? '2px solid var(--primary-500)' : '2px solid transparent',
                    color: activeTab === 'formatted' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '0.5rem 0.25rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                  onClick={() => setActiveTab('formatted')}
                >
                  Business Records View
                </button>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'raw' ? '2px solid var(--primary-500)' : '2px solid transparent',
                    color: activeTab === 'raw' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '0.5rem 0.25rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  onClick={() => setActiveTab('raw')}
                >
                  <Code size={14} />
                  <span>Raw API Response</span>
                </button>
              </div>

              {activeTab === 'formatted' ? (
                <div>
                  {/* Summary Metric Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {app.id === 'zoho_people' && (
                      <>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL EMPLOYEES</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981' }}>{data?.payload?.totalEmployees || 48}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ON LEAVE TODAY</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b' }}>{data?.payload?.activeLeavesToday || 3}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPEN REQUISITIONS</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#6366f1' }}>{data?.payload?.openRequisitions || 5}</div>
                        </div>
                      </>
                    )}

                    {app.id === 'zoho_crm' && (
                      <>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PIPELINE VALUE</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#3b82f6' }}>{data?.payload?.activePipelineValue || '$485,000'}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CLOSING THIS MONTH</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981' }}>{data?.payload?.dealsClosingThisMonth || 8}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONVERSION RATE</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#8b5cf6' }}>{data?.payload?.conversionRate || '34.2%'}</div>
                        </div>
                      </>
                    )}

                    {app.id === 'zoho_desk' && (
                      <>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPEN TICKETS</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b' }}>{data?.payload?.openTickets || 14}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVG RESOLUTION</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981' }}>{data?.payload?.avgResolutionTime || '2.4 Hours'}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLA COMPLIANCE</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#3b82f6' }}>{data?.payload?.slaCompliance || '98.6%'}</div>
                        </div>
                      </>
                    )}

                    {app.id === 'zoho_books' && (
                      <>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECEIVABLES</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#8b5cf6' }}>{data?.payload?.totalReceivables || '$142,850.00'}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UNPAID INVOICES</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b' }}>{data?.payload?.unpaidInvoices || 6}</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OVERDUE AMOUNT</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ef4444' }}>{data?.payload?.overdueAmount || '$12,400.00'}</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Data Records Table */}
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        {app.id === 'zoho_people' && (
                          <tr>
                            <th>EMP ID</th>
                            <th>EMPLOYEE NAME</th>
                            <th>DEPARTMENT</th>
                            <th>DESIGNATION</th>
                            <th>STATUS</th>
                            <th>LEAVE BALANCE</th>
                          </tr>
                        )}
                        {app.id === 'zoho_crm' && (
                          <tr>
                            <th>LEAD ID</th>
                            <th>COMPANY</th>
                            <th>CONTACT PERSON</th>
                            <th>PIPELINE VALUE</th>
                            <th>SALES STAGE</th>
                            <th>PROBABILITY</th>
                          </tr>
                        )}
                        {app.id === 'zoho_desk' && (
                          <tr>
                            <th>TICKET ID</th>
                            <th>SUBJECT</th>
                            <th>CUSTOMER</th>
                            <th>PRIORITY</th>
                            <th>STATUS</th>
                            <th>AGENT</th>
                          </tr>
                        )}
                        {app.id === 'zoho_books' && (
                          <tr>
                            <th>INVOICE #</th>
                            <th>CLIENT</th>
                            <th>AMOUNT</th>
                            <th>STATUS</th>
                            <th>ISSUE DATE</th>
                            <th>DUE DATE</th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {data?.payload?.records?.map((rec, i) => (
                          <tr key={i}>
                            {app.id === 'zoho_people' && (
                              <>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rec.id}</td>
                                <td style={{ fontWeight: 600 }}>{rec.name}</td>
                                <td>{rec.department}</td>
                                <td>{rec.role}</td>
                                <td>
                                  <span className={`badge ${rec.status === 'Active' ? 'badge-HR' : 'badge-Support'}`}>
                                    {rec.status}
                                  </span>
                                </td>
                                <td>{rec.leaveBalance}</td>
                              </>
                            )}

                            {app.id === 'zoho_crm' && (
                              <>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rec.id}</td>
                                <td style={{ fontWeight: 600 }}>{rec.company}</td>
                                <td>{rec.contact}</td>
                                <td style={{ color: '#38bdf8', fontWeight: 600 }}>{rec.value}</td>
                                <td>
                                  <span className="badge badge-Sales">{rec.stage}</span>
                                </td>
                                <td>{rec.probability}</td>
                              </>
                            )}

                            {app.id === 'zoho_desk' && (
                              <>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rec.id}</td>
                                <td style={{ fontWeight: 600 }}>{rec.subject}</td>
                                <td>{rec.customer}</td>
                                <td>
                                  <span className={`badge ${rec.priority === 'Urgent' || rec.priority === 'High' ? 'badge-Admin' : 'badge-Support'}`}>
                                    {rec.priority}
                                  </span>
                                </td>
                                <td>{rec.status}</td>
                                <td>{rec.assignedTo}</td>
                              </>
                            )}

                            {app.id === 'zoho_books' && (
                              <>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rec.id}</td>
                                <td style={{ fontWeight: 600 }}>{rec.client}</td>
                                <td style={{ color: '#a78bfa', fontWeight: 600 }}>{rec.amount}</td>
                                <td>
                                  <span className={`badge ${rec.status === 'Paid' ? 'badge-HR' : rec.status === 'Overdue' ? 'badge-Admin' : 'badge-Finance'}`}>
                                    {rec.status}
                                  </span>
                                </td>
                                <td>{rec.date}</td>
                                <td>{rec.dueDate}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <pre className="json-viewer">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Data</span>
          </button>
          <a
            href={app.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <span>Open {app.name} Portal</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
