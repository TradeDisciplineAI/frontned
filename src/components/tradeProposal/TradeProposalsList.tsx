import React, { useState } from 'react';
import { Plus, Search, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import type { TradeProposal } from '@/types/tradeProposal.types';
import { TradeProposalCard } from './TradeProposalCard';
import '@/styles/components/tradeProposal.css';

interface TradeProposalsListProps {
  proposals: TradeProposal[];
  isLoading: boolean;
  onOpenCreate: () => void;
  onReview: (proposal: TradeProposal) => void;
}

export const TradeProposalsList: React.FC<TradeProposalsListProps> = ({
  proposals,
  isLoading,
  onOpenCreate,
  onReview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.primary_strategy && p.primary_strategy.toLowerCase().includes(searchTerm.toLowerCase()));

    const pStatus = p.status || 'PENDING_RISK';
    const matchesStatus = statusFilter === 'ALL' || pStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Search & Filter Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 220 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search symbol or strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tp-form-input"
              style={{ paddingLeft: 36, width: '100%' }}
              data-testid="proposals-search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="#94a3b8" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="tp-form-select"
              style={{ padding: '0.55rem 0.75rem', fontSize: '0.825rem' }}
              data-testid="proposals-status-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_RISK">PENDING RISK</option>
              <option value="PROPOSED">PROPOSED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        <button
          className="tp-btn-primary"
          onClick={onOpenCreate}
          data-testid="open-create-proposal-btn"
        >
          <Plus size={16} />
          New Trade Proposal
        </button>
      </div>

      {/* List / Cards Grid */}
      {isLoading ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: 12,
            color: '#94a3b8',
          }}
        >
          Loading Trade Proposals...
        </div>
      ) : filteredProposals.length === 0 ? (
        <div
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
          data-testid="proposals-empty-state"
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={24} color="#3b82f6" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
              No Trade Proposals Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, maxWidth: 460 }}>
              No proposals created in current session. Create a new proposal or use "Propose Trade" on Live Market AI Signals to generate one.
            </p>
          </div>
          <button className="tp-btn-primary" onClick={onOpenCreate} style={{ marginTop: '0.5rem' }}>
            <Sparkles size={16} />
            Create First Proposal
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
          data-testid="proposals-grid"
        >
          {filteredProposals.map((proposal) => (
            <TradeProposalCard key={proposal.id} proposal={proposal} onReview={onReview} />
          ))}
        </div>
      )}
    </div>
  );
};
