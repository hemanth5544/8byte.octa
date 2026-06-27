import YahooFinance from "yahoo-finance2";
import type { LiveQuote } from "@portfolio/shared";
import { toYahooSymbol } from "../utils/symbols.js";
import { FALLBACK_CMP, sanitizeCmp } from "../data/fallbackQuotes.js";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

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

function getFreshCache(key: string): LiveQuote | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function getStaleCache(key: string): LiveQuote | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.staleUntil) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: LiveQuote): void {
  const now = Date.now();
  cache.set(key, {
    data,
    expiresAt: now + CACHE_TTL_MS,
    staleUntil: now + STALE_TTL_MS,
  });
}

function withFallback(
  exchangeCode: string,
  quote: LiveQuote,
  purchasePrice?: number,
  usedFallback = false,
): LiveQuote {
  const sanitized = sanitizeCmp(exchangeCode, quote.cmp, purchasePrice);
  if (sanitized !== null) {
    const fromFallback = usedFallback || (quote.cmp === null && FALLBACK_CMP[exchangeCode] !== undefined);
    return {
      ...quote,
      cmp: sanitized,
      source: fromFallback ? "fallback" : "live",
      error: quote.error,
    };
  }
  const fallback = FALLBACK_CMP[exchangeCode];
  if (fallback === undefined) return { ...quote, source: "live" };
  return {
    ...quote,
    cmp: fallback,
    source: "fallback",
    error: quote.error ? `${quote.error}; using seeded fallback CMP` : "Using seeded fallback CMP",
  };
}

function extractCmp(quote: Record<string, unknown> | undefined): number | null {
  if (!quote) return null;
  const candidates = [
    quote.regularMarketPrice,
    quote.postMarketPrice,
    quote.preMarketPrice,
  ];
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

async function fetchSingle(exchangeCode: string, purchasePrice?: number): Promise<LiveQuote> {
  const cacheKey = `yahoo:${exchangeCode}`;
  const fresh = getFreshCache(cacheKey);
  if (fresh) return fresh;

  const symbol = toYahooSymbol(exchangeCode);
  const now = new Date().toISOString();

  try {
    const quote = await yahooFinance.quote(symbol);
    const cmp = extractCmp(quote as Record<string, unknown> | undefined);

    const result = withFallback(
      exchangeCode,
      {
        cmp,
        peRatio: null,
        latestEarnings: null,
        lastUpdated: now,
        source: cmp !== null ? "live" : "fallback",
      },
      purchasePrice,
    );
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    const stale = getStaleCache(cacheKey);
    if (stale) {
      return { ...stale, error: stale.error ?? "Using cached quote after fetch failure" };
    }

    const message = err instanceof Error ? err.message : "Yahoo Finance fetch failed";
    const result = withFallback(
      exchangeCode,
      {
        cmp: null,
        peRatio: null,
        latestEarnings: null,
        lastUpdated: now,
        error: message,
        source: "fallback",
      },
      purchasePrice,
      true,
    );
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
    const fresh = getFreshCache(`yahoo:${code}`);
    if (fresh) {
      results.set(code, fresh);
      continue;
    }
    const quote = await fetchSingle(code, purchasePrices?.get(code));
    results.set(code, quote);
    await delay(REQUEST_DELAY_MS);
  }

  return results;
}
