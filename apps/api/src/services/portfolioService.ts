import type { HoldingWithMetrics, PortfolioResponse, SectorSummary } from "@portfolio/shared";
import { Holding } from "../models/Holding.js";
import { fetchGoogleFundamentalsBatch } from "./googleFinance.js";
import { fetchYahooPricesBatch } from "./yahooFinance.js";

const DISCLAIMER =
  "Market data is sourced from unofficial Yahoo Finance and Google Finance endpoints. Prices and fundamentals may be delayed or inaccurate. Not financial advice.";

function buildMetrics(
  holding: Holding,
  cmp: number | null,
  peRatio: number | null,
  latestEarnings: number | null,
  totalInvestment: number,
  quoteError?: string,
): HoldingWithMetrics {
  const investment = holding.purchasePrice * holding.quantity;
  const presentValue = cmp !== null ? cmp * holding.quantity : null;
  const gainLoss = presentValue !== null ? presentValue - investment : null;

  return {
    id: holding.id,
    name: holding.name,
    sector: holding.sector,
    purchasePrice: holding.purchasePrice,
    quantity: holding.quantity,
    exchangeCode: holding.exchangeCode,
    sortOrder: holding.sortOrder,
    investment,
    portfolioPercent: totalInvestment > 0 ? investment / totalInvestment : 0,
    presentValue,
    gainLoss,
    cmp,
    peRatio,
    latestEarnings,
    quoteError,
  };
}

export async function getPortfolio(): Promise<PortfolioResponse> {
  const holdings = await Holding.findAll({ order: [["sortOrder", "ASC"]] });
  const totalInvestment = holdings.reduce(
    (sum, h) => sum + h.purchasePrice * h.quantity,
    0,
  );

  const codes = holdings.map((h) => h.exchangeCode);
  const purchasePrices = new Map(holdings.map((h) => [h.exchangeCode, h.purchasePrice]));
  const [yahooQuotes, googleQuotes] = await Promise.all([
    fetchYahooPricesBatch(codes, purchasePrices),
    fetchGoogleFundamentalsBatch(codes),
  ]);

  const withMetrics = holdings.map((holding) => {
    const yahoo = yahooQuotes.get(holding.exchangeCode);
    const google = googleQuotes.get(holding.exchangeCode);
    const errors = [yahoo?.error, google?.error].filter(Boolean).join("; ");
    return buildMetrics(
      holding,
      yahoo?.cmp ?? null,
      google?.peRatio ?? null,
      google?.latestEarnings ?? null,
      totalInvestment,
      errors || undefined,
    );
  });

  const sectorMap = new Map<string, HoldingWithMetrics[]>();
  for (const h of withMetrics) {
    const list = sectorMap.get(h.sector) ?? [];
    list.push(h);
    sectorMap.set(h.sector, list);
  }

  const sectors: SectorSummary[] = [...sectorMap.entries()].map(([sector, sectorHoldings]) => {
    const sectorInvestment = sectorHoldings.reduce((s, h) => s + h.investment, 0);
    const sectorPresent = sectorHoldings.reduce((s, h) => s + (h.presentValue ?? 0), 0);
  return {
      sector,
      totalInvestment: sectorInvestment,
      totalPresentValue: sectorPresent,
      gainLoss: sectorPresent - sectorInvestment,
      portfolioPercent: totalInvestment > 0 ? sectorInvestment / totalInvestment : 0,
      holdings: sectorHoldings,
    };
  });

  const totalPresentValue = withMetrics.reduce((s, h) => s + (h.presentValue ?? 0), 0);
  const gainLoss = totalPresentValue - totalInvestment;

  return {
    holdings: withMetrics,
    sectors,
    totals: {
      totalInvestment,
      totalPresentValue,
      gainLoss,
      gainLossPercent: totalInvestment > 0 ? gainLoss / totalInvestment : 0,
    },
    lastRefreshed: new Date().toISOString(),
    disclaimer: DISCLAIMER,
  };
}
