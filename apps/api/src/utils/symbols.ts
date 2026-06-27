export function isBseCode(code: string): boolean {
  return /^\d+$/.test(code.trim());
}

export function toYahooSymbol(exchangeCode: string): string {
  const code = exchangeCode.trim();
  return isBseCode(code) ? `${code}.BO` : `${code}.NS`;
}

export function toGoogleSymbol(exchangeCode: string): string {
  const code = exchangeCode.trim();
  return isBseCode(code) ? `${code}:BOM` : `${code}:NSE`;
}
