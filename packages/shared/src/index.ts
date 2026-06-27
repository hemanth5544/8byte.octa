export interface Holding {
  id: number;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string;
  sortOrder: number;
}

export interface LiveQuote {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  lastUpdated: string;
  error?: string;
}

export interface HoldingWithMetrics extends Holding {
  investment: number;
  portfolioPercent: number;
  presentValue: number | null;
  gainLoss: number | null;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  quoteError?: string;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  portfolioPercent: number;
  holdings: HoldingWithMetrics[];
}

export interface PortfolioResponse {
  holdings: HoldingWithMetrics[];
  sectors: SectorSummary[];
  totals: {
    totalInvestment: number;
    totalPresentValue: number;
    gainLoss: number;
    gainLossPercent: number;
  };
  lastRefreshed: string;
  disclaimer: string;
}
