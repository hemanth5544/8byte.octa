function isReasonableCmp(cmp: number, purchasePrice: number): boolean {
  if (!Number.isFinite(cmp) || cmp <= 0) return false;
  const ratio = cmp / purchasePrice;
  return ratio >= 0.05 && ratio <= 20;
}

/** Seeded CMP values from the case study Excel (used when live Yahoo fetch fails). */
export const FALLBACK_CMP: Record<string, number> = {
  HDFCBANK: 1700.15,
  BAJFINANCE: 8419.6,
  "532174": 1215.5,
  "544252": 112.85,
  "511577": 14.86,
  AFFLE: 1459.6,
  LTIM: 4793.8,
  "542651": 1293.1,
  "544028": 662,
  "544107": 152.9,
  "532790": 449.5,
  DMART: 3451.1,
  "532540": 961.1,
  "500331": 2730,
  "500400": 351,
  "542323": 402.4,
  "532667": 51.36,
  "542851": 372.6,
  "543517": 355.75,
  ASTRAL: 1317.6,
  "542652": 5000,
  "543318": 1237.45,
  "506401": 1927.9,
  "541557": 3743,
  "533282": 1614.2,
  "540719": 1405.45,
};

export function sanitizeCmp(
  exchangeCode: string,
  cmp: number | null,
  purchasePrice?: number,
): number | null {
  if (cmp === null) return FALLBACK_CMP[exchangeCode] ?? null;

  if (purchasePrice !== undefined && !isReasonableCmp(cmp, purchasePrice)) {
    return FALLBACK_CMP[exchangeCode] ?? null;
  }

  return cmp;
}

/** Seeded fundamentals from Excel (used when Google Finance scrape fails). */
export const FALLBACK_FUNDAMENTALS: Record<string, { peRatio: number | null; latestEarnings: number | null }> = {
  HDFCBANK: { peRatio: 18.69, latestEarnings: 91.02 },
  BAJFINANCE: { peRatio: 32.63, latestEarnings: 257.8 },
  "532174": { peRatio: 17.68, latestEarnings: 68.72 },
  "544252": { peRatio: 85.72, latestEarnings: 2.53 },
  "511577": { peRatio: null, latestEarnings: null },
  AFFLE: { peRatio: 55.53, latestEarnings: 26.11 },
  LTIM: { peRatio: 34.69, latestEarnings: 145.92 },
  "542651": { peRatio: 46.57, latestEarnings: 27.77 },
  "544028": { peRatio: 41.68, latestEarnings: 15.88 },
  "544107": { peRatio: 26.3, latestEarnings: 5.8 },
  "532790": { peRatio: 11.64, latestEarnings: 39.48 },
  DMART: { peRatio: 82.63, latestEarnings: 41.75 },
  "532540": { peRatio: 26.56, latestEarnings: 134.77 },
  "500331": { peRatio: 71.13, latestEarnings: 38.36 },
  "500400": { peRatio: 29.36, latestEarnings: 11.94 },
  "542323": { peRatio: 29.26, latestEarnings: 13.75 },
  "532667": { peRatio: 61.25, latestEarnings: 0.84 },
  "542851": { peRatio: 39.51, latestEarnings: 5.57 },
  "543517": { peRatio: 17.98, latestEarnings: 19.78 },
  ASTRAL: { peRatio: 67.13, latestEarnings: 19.59 },
  "542652": { peRatio: 40.91, latestEarnings: 121.97 },
  "543318": { peRatio: 50.37, latestEarnings: 24.52 },
  "506401": { peRatio: 41.86, latestEarnings: 37.26 },
  "541557": { peRatio: 41.86, latestEarnings: 37.26 },
  "533282": { peRatio: 41.86, latestEarnings: 37.26 },
  "540719": { peRatio: null, latestEarnings: -5.82 },
};
