import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProposalModal } from '@/components/tradeProposal/CreateProposalModal';
import { portfolioService } from '@/services/portfolio.service';

vi.mock('@/services/portfolio.service', () => ({
  portfolioService: {
    getPortfolio: vi.fn(),
    createPortfolio: vi.fn(),
  },
}));

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: { id: 'usr-1234-uuid', email: 'trader@example.com' },
  }),
}));

describe('CreateProposalModal Portfolio Selector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders portfolio selector when user has a portfolio', async () => {
    (portfolioService.getPortfolio as any).mockResolvedValue({
      id: 'port-1111-2222',
      name: 'Main Paper Portfolio',
      type: 'PAPER',
      holdings: [],
      positions: [],
    });

    render(<CreateProposalModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('portfolio-select')).toBeInTheDocument();
    });

    expect(screen.getByText(/Main Paper Portfolio/i)).toBeInTheDocument();
  });

  it('shows no portfolio warning and create button when portfolio does not exist', async () => {
    (portfolioService.getPortfolio as any).mockRejectedValue({
      response: { status: 404 },
    });

    render(<CreateProposalModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('no-portfolio-alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Create a Paper Portfolio first to submit a Trade Proposal/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-paper-portfolio-btn')).toBeInTheDocument();
  });
});
