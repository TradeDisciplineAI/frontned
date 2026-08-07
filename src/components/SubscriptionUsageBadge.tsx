import React, { useEffect } from 'react';
import { Sparkles, Zap, AlertCircle, Crown } from 'lucide-react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

export const SubscriptionUsageBadge: React.FC = () => {
  const { status, fetchSubscriptionStatus, openPaywall } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  if (!status) {
    return null;
  }

  const { is_pro, trades_count, max_free_trades, remaining_free_trades } = status;

  if (is_pro) {
    return (
      <button
        onClick={() => openPaywall('manual')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.3))',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          color: '#fbbf24',
          boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
        }}
        title="PRO Plan Active — Unlimited Trades"
      >
        <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>PRO Tier</span>
        <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-md uppercase font-bold">
          PRO
        </span>
      </button>
    );
  }

  const isLimitReached = remaining_free_trades === 0 || trades_count >= max_free_trades;
  const isWarning = remaining_free_trades <= 2 && !isLimitReached;

  return (
    <button
      onClick={() => openPaywall(isLimitReached ? 'trade_limit' : 'manual')}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer ${
        isLimitReached
          ? 'animate-bounce border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20'
          : isWarning
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
      }`}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        backdropFilter: 'blur(8px)',
      }}
      title={`Free Trade Limit: ${trades_count} / ${max_free_trades} trades executed`}
    >
      {isLimitReached ? (
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      ) : (
        <Zap className="w-3.5 h-3.5 text-emerald-400" />
      )}

      <span>
        {isLimitReached ? (
          <strong className="text-red-400">Limit Reached (6/6)</strong>
        ) : (
          <span>
            Free Trades: <strong className="font-bold">{trades_count}</strong>/{max_free_trades}
          </span>
        )}
      </span>

      <span className="flex items-center gap-1 text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md font-semibold border border-indigo-500/30 hover:bg-indigo-500/30">
        <Sparkles className="w-2.5 h-2.5" />
        Upgrade
      </span>
    </button>
  );
};
