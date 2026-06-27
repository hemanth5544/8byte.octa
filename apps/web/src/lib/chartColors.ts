/** Shared sector palette — used by pie and bar charts so colors stay in sync. */
export const SECTOR_COLORS = [
  "oklch(0.48 0.16 255)", // Financial — blue
  "oklch(0.52 0.18 285)", // Tech — indigo
  "oklch(0.58 0.14 175)", // Consumer — teal
  "oklch(0.62 0.16 85)", // Power — olive
  "oklch(0.55 0.19 45)", // Pipe — orange
  "oklch(0.5 0.17 320)", // Others — magenta
] as const;

export const GAIN_COLOR = "oklch(0.52 0.16 145)";
export const LOSS_COLOR = "oklch(0.55 0.2 25)";

export function sectorColor(index: number): string {
  return SECTOR_COLORS[index % SECTOR_COLORS.length];
}

export function gainLossColor(value: number): string {
  return value >= 0 ? GAIN_COLOR : LOSS_COLOR;
}
