import React, { useEffect } from 'react';
import { X, Bell, Trash2, Plus, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import '@/styles/components/price-alerts.css';

export const ActiveAlertsDrawer: React.FC = () => {
  const {
    alerts,
    isDrawerOpen,
    setDrawerOpen,
    fetchAlerts,
    removeAlert,
    openModal,
    isLoading,
  } = usePriceAlertStore();

  useEffect(() => {
    if (isDrawerOpen) {
      fetchAlerts();
    }
  }, [isDrawerOpen, fetchAlerts]);

  if (!isDrawerOpen) return null;

  const activeAlerts = alerts.filter((a) => !a.is_triggered);
  const triggeredAlerts = alerts.filter((a) => a.is_triggered);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="vercel-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
      <div className="vercel-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="vercel-drawer-header">
          <div className="vercel-drawer-title-group">
            <Bell size={18} strokeWidth={2.5} style={{ color: '#00e599' }} />
            <h3 className="vercel-drawer-title">Price Target Alarms</h3>
            <span className="vercel-drawer-count-badge">
              {activeAlerts.length} / 10 Active
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="vercel-icon-btn"
              onClick={() => fetchAlerts()}
              title="Refresh Alerts"
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            </button>
            <button
              className="vercel-drawer-close-btn"
              onClick={() => setDrawerOpen(false)}
              title="Close Drawer"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Drawer Subheader Action */}
        <div className="vercel-drawer-subbar">
          <button
            className="vercel-btn-create-alert"
            onClick={() => {
              openModal();
            }}
          >
            <Plus size={14} strokeWidth={3} />
            <span>Create New Price Alarm</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="vercel-drawer-body">
          {isLoading && alerts.length === 0 ? (
            <div className="vercel-drawer-empty">Loading active price alarms...</div>
          ) : alerts.length === 0 ? (
            <div className="vercel-drawer-empty">
              <Bell size={32} strokeWidth={1.5} style={{ color: '#444444', marginBottom: '12px' }} />
              <p style={{ margin: 0, fontWeight: 600, color: '#ededed' }}>No Price Alarms Set</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888888' }}>
                Set target price alarms for your stocks to receive instant Web and Email notifications.
              </p>
            </div>
          ) : (
            <div className="vercel-alerts-list">
              {/* Active Alarms Section */}
              {activeAlerts.length > 0 && (
                <div className="vercel-alert-group">
                  <h4 className="vercel-group-label">Active Alarms ({activeAlerts.length})</h4>
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="vercel-alert-item">
                      <div className="vercel-item-left">
                        <div className="vercel-symbol-avatar">
                          {alert.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="vercel-symbol-name">{alert.symbol}</span>
                            <span className={`vercel-condition-badge ${alert.condition.toLowerCase()}`}>
                              {alert.condition === 'ABOVE' ? (
                                <TrendingUp size={11} strokeWidth={3} />
                              ) : (
                                <TrendingDown size={11} strokeWidth={3} />
                              )}
                              {alert.condition} ${alert.target_price.toFixed(2)}
                            </span>
                          </div>
                          <span className="vercel-alert-time">Set {formatDate(alert.created_at)}</span>
                        </div>
                      </div>

                      <button
                        className="vercel-alert-delete-btn"
                        onClick={() => removeAlert(alert.id)}
                        title="Delete Alert"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Triggered Alarms Section */}
              {triggeredAlerts.length > 0 && (
                <div className="vercel-alert-group" style={{ marginTop: '20px' }}>
                  <h4 className="vercel-group-label">Triggered History ({triggeredAlerts.length})</h4>
                  {triggeredAlerts.map((alert) => (
                    <div key={alert.id} className="vercel-alert-item triggered">
                      <div className="vercel-item-left">
                        <div className="vercel-symbol-avatar triggered">🔔</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="vercel-symbol-name">{alert.symbol}</span>
                            <span className="vercel-triggered-tag">
                              Triggered @ ${alert.target_price.toFixed(2)}
                            </span>
                          </div>
                          <span className="vercel-alert-time">
                            Triggered {formatDate(alert.triggered_at)}
                          </span>
                        </div>
                      </div>

                      <button
                        className="vercel-alert-delete-btn"
                        onClick={() => removeAlert(alert.id)}
                        title="Dismiss Alert"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
