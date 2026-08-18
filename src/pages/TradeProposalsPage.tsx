import React from 'react';
import { Menu, Sparkles, Info } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { TradeProposalsList } from '@/components/tradeProposal/TradeProposalsList';
import { CreateProposalModal } from '@/components/tradeProposal/CreateProposalModal';
import { PreRiskReviewModal } from '@/components/tradeProposal/PreRiskReviewModal';
import '@/styles/components/tradeProposal.css';

export const TradeProposalsPage: React.FC = () => {
  const { user, logout } = useUserStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const {
    proposals,
    activeProposal,
    draftProposal,
    isLoading,
    isCreateModalOpen,
    isReviewModalOpen,
    openCreateModal,
    closeCreateModal,
    openReviewModal,
    closeReviewModal,
    fetchProposals,
  } = useTradeProposalStore();

  React.useEffect(() => {
    fetchProposals(user?.id);
  }, [fetchProposals, user?.id]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--color-bg-primary, #0b1120)',
        color: '#f3f4f6',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .proposals-main-container {
          margin-left: 280px;
          flex: 1;
          padding: 40px;
          box-sizing: border-box;
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          min-width: 0;
        }

        @media (max-width: 900px) {
          .proposals-main-container {
            margin-left: 0;
            padding: 20px;
          }
        }
      `}</style>

      {/* Navigation Sidebar */}
      <Sidebar
        user={user}
        onLogout={logout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="proposals-main-container">
        {/* Top Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
              className="mobile-sidebar-toggle"
            >
              <Menu size={24} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Trade Proposals & Pre-Risk Review
                </h1>
                <span
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 9999,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Pre-Risk Stage
                </span>
                <span className="tp-paper-badge">PAPER TRADING</span>
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
                Persistent decision-support trade proposals logged in AI-Service & staged for Agent 4 Risk analysis
              </p>
            </div>
          </div>

          <button
            className="tp-btn-primary"
            onClick={() => openCreateModal()}
            data-testid="header-new-proposal-btn"
          >
            <Sparkles size={16} />
            New Proposal
          </button>
        </header>

        {/* Paper Trading Information Notice Banner */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.18)',
            borderRadius: 10,
            padding: '0.75rem 1rem',
            fontSize: '0.825rem',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <Info size={16} color="#fbbf24" />
          <span>
            <strong style={{ color: '#fbbf24' }}>Paper Trading Environment:</strong> Simulated trade proposals for decision support. No real money or real exchange execution is involved.
          </span>
        </div>

        {/* Content Area */}
        <TradeProposalsList
          proposals={proposals}
          isLoading={isLoading}
          onOpenCreate={() => openCreateModal()}
          onReview={(p) => openReviewModal(p)}
        />

        {/* Modals */}
        <CreateProposalModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          initialData={draftProposal}
        />

        <PreRiskReviewModal
          proposal={activeProposal}
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
        />
      </main>
    </div>
  );
};
