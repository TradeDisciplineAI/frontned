import React from 'react';
import { Menu, Sparkles, Info, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { TradeProposalsList } from '@/components/tradeProposal/TradeProposalsList';
import { CreateProposalModal } from '@/components/tradeProposal/CreateProposalModal';
import { PreRiskReviewModal } from '@/components/tradeProposal/PreRiskReviewModal';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
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

  const proposalCount = proposals.length;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#040810',
        color: '#f8fafc',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        .proposals-main-container {
          margin-left: 280px;
          flex: 1;
          padding: 36px 40px;
          box-sizing: border-box;
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 20px;
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
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <>
        {/* Terminal Page Header */}
        <motion.header
          className="tpl-page-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="tpl-header-title-group">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="mobile-sidebar-toggle tpl-mobile-toggle"
              aria-label="Toggle mobile menu"
            >
              <Menu size={24} />
            </button>
            <div>
              <div className="tpl-header-heading-row">
                <h1 className="tpl-header-title">TRADE PROPOSALS</h1>
                <span className="tpl-sub-badge">Pre-Risk Decision Queue</span>
              </div>
              <div className="tpl-header-meta-row">
                <span className="tpl-meta-pill">
                  <ShieldCheck size={11} /> PAPER TRADING
                </span>
                <span className="tpl-meta-dot">•</span>
                <span className="tpl-meta-text">
                  <Activity size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Agent 4 Risk Engine
                </span>
                <span className="tpl-meta-dot">•</span>
                <span className="tpl-meta-count">{proposalCount} {proposalCount === 1 ? 'proposal' : 'proposals'}</span>
              </div>
            </div>
          </div>

          <button
            className="tpl-btn-primary-header"
            onClick={() => openCreateModal()}
            data-testid="header-new-proposal-btn"
          >
            <Sparkles size={15} />
            New Proposal
          </button>
        </motion.header>

        {/* Paper Trading Status Bar Banner */}
        <motion.div
          className="tpl-paper-notice-bar"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Info size={14} className="tpl-notice-icon" />
          <span>
            <strong>PAPER TRADING:</strong> Simulated execution only — no real money or exchange execution is involved.
          </span>
        </motion.div>

        {/* Trade Proposals List Component */}
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
          </>
        )}
      </main>
    </div>
  );
};
