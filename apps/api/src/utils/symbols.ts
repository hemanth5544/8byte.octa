/** BSE numeric codes mapped to NSE tickers for Yahoo Finance (BSE .BO symbols are unreliable). */
const BSE_TO_NSE_YAHOO: Record<string, string> = {
  "500331": "PIDILITIND",
  "500400": "TATAPOWER",
  "506401": "DEEPAKNTR",
  "511577": "SAVANIFIN",
  "532174": "ICICIBANK",
  "532540": "TATACONSUM",
  "532667": "SUZLON",
  "532790": "TANLA",
  "533282": "GRAVITA",
  "540719": "SBILIFE",
  "541557": "FINEORG",
  "542323": "KPIGREEN",
  "542651": "KPITTECH",
  "542652": "POLYCAB",
  "542851": "GENSOL",
  "543318": "CLEAN",
  "543517": "HARIOMPIPE",
  "544028": "TATATECH",
  "544107": "BLSE",
  "544252": "BAJAJHFL",
};

export function isBseCode(code: string): boolean {
  return /^\d+$/.test(code.trim());
}

export function toYahooSymbol(exchangeCode: string): string {
  const code = exchangeCode.trim().toUpperCase();
  if (isBseCode(code)) {
    const nseTicker = BSE_TO_NSE_YAHOO[code];
    if (nseTicker) return `${nseTicker}.NS`;
    return `${code}.BO`;
  }
  return `${code}.NS`;
}

export function toGoogleSymbol(exchangeCode: string): string {
  const code = exchangeCode.trim();
  return isBseCode(code) ? `${code}:BOM` : `${code}:NSE`;
}
