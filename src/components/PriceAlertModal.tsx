import React, { useState, useEffect } from 'react';
import { X, Bell, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import type { AlertCondition } from '@/services/priceAlert.service';
import '@/styles/components/price-alerts.css';

export const PriceAlertModal: React.FC = () => {
  const { isModalOpen, targetSymbol, initialPrice, closeModal, addAlert, error, isLoading } =
    usePriceAlertStore();

  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<AlertCondition>('ABOVE');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      setSymbol(targetSymbol || '');
      setCondition('ABOVE');
      setFormError(null);
      if (initialPrice && initialPrice > 0) {
        setTargetPrice(initialPrice.toString());
      } else {
        setTargetPrice('');
      }
    }
  }, [isModalOpen, targetSymbol, initialPrice]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanSymbol = symbol.trim().toUpperCase();
    const priceNum = parseFloat(targetPrice);

    if (!cleanSymbol) {
      setFormError('Stock symbol is required.');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid target price greater than $0.00.');
      return;
    }

    try {
      await addAlert(cleanSymbol, priceNum, condition);
    } catch (err: any) {
      // Error handles in Zustand store state
    }
  };

  const adjustPriceByPercent = (percent: number) => {
    const current = parseFloat(targetPrice) || initialPrice || 100;
    const newPrice = current * (1 + percent / 100);
    setTargetPrice(newPrice.toFixed(2));
  };

  return (
    <div className="vercel-modal-backdrop" onClick={closeModal}>
      <div className="vercel-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vercel-modal-header">
          <div className="vercel-modal-title-group">
            <div className="vercel-modal-icon">
              <Bell size={18} strokeWidth={2.5} style={{ color: '#00e599' }} />
            </div>
            <div>
              <h3 className="vercel-modal-title">Set Price Target Alarm</h3>
              <p className="vercel-modal-sub">
                Get notified when the stock hits your target threshold.
              </p>
            </div>
          </div>
          <button className="vercel-modal-close-btn" onClick={closeModal} title="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Error Alert */}
        {(error || formError) && (
          <div className="vercel-alert-banner error">
            <AlertCircle size={15} strokeWidth={2.5} />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="vercel-alert-form">
          {/* Symbol Input */}
          <div className="vercel-form-group">
            <label className="vercel-form-label">Stock Symbol / Ticker</label>
            <input
              type="text"
              className="vercel-form-input uppercase"
              placeholder="e.g. AAPL, TSLA, NVDA"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              maxLength={10}
              required
            />
          </div>

          {/* Condition Selector Pills */}
          <div className="vercel-form-group">
            <label className="vercel-form-label">Condition</label>
            <div className="vercel-condition-pills">
              <button
                type="button"
                className={`vercel-pill-btn ${condition === 'ABOVE' ? 'active above' : ''}`}
                onClick={() => setCondition('ABOVE')}
              >
                <TrendingUp size={15} strokeWidth={2.5} />
                <span>GOES ABOVE OR EQUAL</span>
              </button>

              <button
                type="button"
                className={`vercel-pill-btn ${condition === 'BELOW' ? 'active below' : ''}`}
                onClick={() => setCondition('BELOW')}
              >
                <TrendingDown size={15} strokeWidth={2.5} />
                <span>GOES BELOW OR EQUAL</span>
              </button>
            </div>
          </div>

          {/* Target Price Input */}
          <div className="vercel-form-group">
            <div className="vercel-label-row">
              <label className="vercel-form-label">Target Price ($)</label>
              {initialPrice && initialPrice > 0 && (
                <span className="vercel-current-price-tag">
                  Current: ${initialPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="vercel-price-input-wrapper">
              <span className="vercel-currency-symbol">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="vercel-form-input price"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
              />
            </div>

            {/* Quick Adjust Percentage Buttons */}
            <div className="vercel-quick-adjust-row">
              <button
                type="button"
                className="vercel-quick-btn"
                onClick={() => adjustPriceByPercent(1)}
              >
                +1%
              </button>
              <button
                type="button"
                className="vercel-quick-btn"
                onClick={() => adjustPriceByPercent(5)}
              >
                +5%
              </button>
              <button
                type="button"
                className="vercel-quick-btn"
                onClick={() => adjustPriceByPercent(-1)}
              >
                -1%
              </button>
              <button
                type="button"
                className="vercel-quick-btn"
                onClick={() => adjustPriceByPercent(-5)}
              >
                -5%
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="vercel-modal-footer">
            <button
              type="button"
              className="vercel-btn-cancel"
              onClick={closeModal}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="vercel-btn-submit" disabled={isLoading}>
              {isLoading ? 'Creating Alarm...' : 'Set Price Alarm 🔔'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
