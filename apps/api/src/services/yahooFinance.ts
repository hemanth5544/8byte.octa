import YahooFinance from "yahoo-finance2";
import type { LiveQuote } from "@portfolio/shared";
import { toYahooSymbol } from "../utils/symbols.js";
import { FALLBACK_CMP, sanitizeCmp } from "../data/fallbackQuotes.js";

const yahooFinance = new YahooFinance();

interface CacheEntry {
  data: LiveQuote;
  expiresAt: number;
  staleUntil: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15_000;
const STALE_TTL_MS = 60 * 60 * 1000;
const REQUEST_DELAY_MS = 400;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getCached(key: string, allowStale = true): LiveQuote | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const now = Date.now();
  if (now <= entry.expiresAt) return entry.data;
  if (allowStale && now <= entry.staleUntil) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: LiveQuote): void {
  const now = Date.now();
  cache.set(key, {
    data,
    expiresAt: now + CACHE_TTL_MS,
    staleUntil: now + STALE_TTL_MS,
  });
}

function withFallback(exchangeCode: string, quote: LiveQuote, purchasePrice?: number): LiveQuote {
  const sanitized = sanitizeCmp(exchangeCode, quote.cmp, purchasePrice);
  if (sanitized !== null) {
    return { ...quote, cmp: sanitized, error: quote.error };
  }
  const fallback = FALLBACK_CMP[exchangeCode];
  if (fallback === undefined) return quote;
  return {
    ...quote,
    cmp: fallback,
    error: quote.error ? `${quote.error}; using seeded fallback CMP` : "Using seeded fallback CMP",
  };
}

async function fetchSingle(exchangeCode: string, purchasePrice?: number): Promise<LiveQuote> {
  const cacheKey = `yahoo:${exchangeCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const symbol = toYahooSymbol(exchangeCode);
  const now = new Date().toISOString();

  try {
    const quote = await yahooFinance.quote(symbol, {
      fields: ["regularMarketPrice", "postMarketPrice", "preMarketPrice"],
    });
    const cmp =
      quote.regularMarketPrice ??
      quote.postMarketPrice ??
      quote.preMarketPrice ??
      null;

    const result = withFallback(exchangeCode, {
      cmp: typeof cmp === "number" ? cmp : null,
      peRatio: null,
      latestEarnings: null,
      lastUpdated: now,
    }, purchasePrice);
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Yahoo Finance fetch failed";
    const result = withFallback(exchangeCode, {
      cmp: null,
      peRatio: null,
      latestEarnings: null,
      lastUpdated: now,
      error: message,
    }, purchasePrice);
    if (result.cmp !== null) setCache(cacheKey, result);
    return result;
  }
}

export async function fetchYahooPrice(exchangeCode: string, purchasePrice?: number): Promise<LiveQuote> {
  return fetchSingle(exchangeCode, purchasePrice);
}

export async function fetchYahooPricesBatch(
  exchangeCodes: string[],
  purchasePrices?: Map<string, number>,
): Promise<Map<string, LiveQuote>> {
  const unique = [...new Set(exchangeCodes)];
  const results = new Map<string, LiveQuote>();

  for (const code of unique) {
    const cached = getCached(`yahoo:${code}`);
    if (cached) {
      results.set(code, cached);
      continue;
    }
    const quote = await fetchSingle(code, purchasePrices?.get(code));
    results.set(code, quote);
    await delay(REQUEST_DELAY_MS);
  }

  return results;
}
