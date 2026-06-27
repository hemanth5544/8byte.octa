import axios from "axios";
import * as cheerio from "cheerio";
import type { LiveQuote } from "@portfolio/shared";
import { FALLBACK_FUNDAMENTALS } from "../data/fallbackQuotes.js";
import { toGoogleSymbol } from "../utils/symbols.js";

interface CacheEntry {
  peRatio: number | null;
  latestEarnings: number | null;
  expiresAt: number;
  staleUntil: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15_000;
const STALE_TTL_MS = 60 * 60 * 1000;
const REQUEST_DELAY_MS = 350;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[,%\s₹]/g, "").replace(/[^\d.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "—") return null;
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

function getCached(key: string, allowStale = true): { peRatio: number | null; latestEarnings: number | null } | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const now = Date.now();
  if (now <= entry.expiresAt) {
    return { peRatio: entry.peRatio, latestEarnings: entry.latestEarnings };
  }
  if (allowStale && now <= entry.staleUntil) {
    return { peRatio: entry.peRatio, latestEarnings: entry.latestEarnings };
  }
  cache.delete(key);
  return null;
}

function setCache(
  key: string,
  peRatio: number | null,
  latestEarnings: number | null,
): void {
  const now = Date.now();
  cache.set(key, {
    peRatio,
    latestEarnings,
    expiresAt: now + CACHE_TTL_MS,
    staleUntil: now + STALE_TTL_MS,
  });
}

function withFallback(
  exchangeCode: string,
  data: Pick<LiveQuote, "peRatio" | "latestEarnings" | "error">,
): Pick<LiveQuote, "peRatio" | "latestEarnings" | "error"> {
  const fallback = FALLBACK_FUNDAMENTALS[exchangeCode];
  if (!fallback) return data;
  return {
    peRatio: data.peRatio ?? fallback.peRatio,
    latestEarnings: data.latestEarnings ?? fallback.latestEarnings,
    error:
      data.peRatio === null && data.latestEarnings === null && fallback
        ? `${data.error ?? "Google Finance unavailable"}; using seeded fallback`
        : data.error,
  };
}

function extractFromHtml(html: string): { peRatio: number | null; latestEarnings: number | null } {
  const $ = cheerio.load(html);
  let peRatio: number | null = null;
  let latestEarnings: number | null = null;

  $("[data-field]").each((_, el) => {
    const field = $(el).attr("data-field");
    const text = $(el).text().trim();
    if (field === "pe_ratio" || field === "trailing_pe") {
      peRatio = parseNumber(text);
    }
    if (
      field === "earnings_per_share" ||
      field === "eps" ||
      field === "diluted_eps" ||
      field === "basic_eps"
    ) {
      latestEarnings = parseNumber(text);
    }
  });

  $("div").each((_, el) => {
    const label = $(el).find(".gyFHrc").first().text().trim().toLowerCase();
    const value = $(el).find(".P6K39c").first().text().trim();
    if (!label || !value) return;
    if ((label.includes("p/e") || label.includes("pe ratio")) && peRatio === null) {
      peRatio = parseNumber(value);
    }
    if (
      (label.includes("earnings per share") ||
        label.includes("eps") ||
        label === "earnings") &&
      latestEarnings === null
    ) {
      latestEarnings = parseNumber(value);
    }
  });

  const scriptMatch = html.match(/AF_initDataCallback\(\{[^}]*key:\s*'ds:(\d+)'[^}]*\}\);/g);
  if (scriptMatch) {
    for (const block of scriptMatch) {
      const dataMatch = block.match(/data:([\s\S]*?),\s*sideChannel/);
      if (!dataMatch) continue;
      try {
        const jsonStr = dataMatch[1];
        if (jsonStr.includes("P/E ratio") || jsonStr.includes("EPS")) {
          const peMatch = jsonStr.match(/P\/E ratio[^[]*\[\s*null\s*,\s*\[\s*"([^"]+)"/i);
          const epsMatch = jsonStr.match(/EPS[^[]*\[\s*null\s*,\s*\[\s*"([^"]+)"/i);
          if (peMatch && peRatio === null) peRatio = parseNumber(peMatch[1]);
          if (epsMatch && latestEarnings === null) latestEarnings = parseNumber(epsMatch[1]);
        }
      } catch {
        // ignore parse errors
      }
    }
  }

  return { peRatio, latestEarnings };
}

export async function fetchGoogleFundamentals(
  exchangeCode: string,
): Promise<Pick<LiveQuote, "peRatio" | "latestEarnings" | "error">> {
  const cacheKey = `google:${exchangeCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const symbol = toGoogleSymbol(exchangeCode);
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(symbol)}`;

  try {
    const { data: html } = await axios.get<string>(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 12_000,
    });

    const { peRatio, latestEarnings } = extractFromHtml(html);
    setCache(cacheKey, peRatio, latestEarnings);
    return withFallback(exchangeCode, { peRatio, latestEarnings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google Finance fetch failed";
    return withFallback(exchangeCode, { peRatio: null, latestEarnings: null, error: message });
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchGoogleFundamentalsBatch(
  exchangeCodes: string[],
): Promise<Map<string, Pick<LiveQuote, "peRatio" | "latestEarnings" | "error">>> {
  const unique = [...new Set(exchangeCodes)];
  const results = new Map<string, Pick<LiveQuote, "peRatio" | "latestEarnings" | "error">>();

  for (const code of unique) {
    const cached = getCached(`google:${code}`);
    if (cached) {
      results.set(code, cached);
      continue;
    }
    const data = await fetchGoogleFundamentals(code);
    results.set(code, data);
    await delay(REQUEST_DELAY_MS);
  }

  return results;
}
