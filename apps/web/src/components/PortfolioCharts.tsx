import { useMemo } from "react";
import type { PortfolioResponse } from "@portfolio/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = [
  "oklch(0.55 0.18 255)",
  "oklch(0.62 0.16 175)",
  "oklch(0.68 0.14 85)",
  "oklch(0.58 0.2 25)",
  "oklch(0.52 0.15 305)",
  "oklch(0.5 0.12 220)",
];

interface PortfolioChartsProps {
  data: PortfolioResponse;
}

function DonutChart({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total <= 0) return null;

  let cumulative = 0;
  const slices = items.map((item) => {
    const start = (cumulative / total) * 360;
    cumulative += item.value;
    const end = (cumulative / total) * 360;
    return { ...item, start, end };
  });

  const gradient = slices
    .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
    .join(", ");

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[220px]">
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-card text-center">
        <span className="text-lg font-bold">{formatCurrency(total)}</span>
        <span className="text-xs text-muted-foreground">Allocation</span>
      </div>
    </div>
  );
}

function BarChart({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = (Math.abs(item.value) / max) * 100;
        const positive = item.value >= 0;
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="truncate pr-2">{item.label}</span>
              <span className={positive ? "text-emerald-600" : "text-red-600"}>
                {formatCurrency(item.value)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${width}%`,
                  backgroundColor: positive ? "oklch(0.55 0.15 145)" : "oklch(0.55 0.2 25)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PortfolioCharts({ data }: PortfolioChartsProps) {
  const sectorAllocation = useMemo(
    () =>
      data.sectors.map((s, i) => ({
        label: s.sector,
        value: s.totalInvestment,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [data.sectors],
  );

  const sectorGainLoss = useMemo(
    () =>
      data.sectors.map((s) => ({
        label: s.sector,
        value: s.gainLoss,
        color: s.gainLoss >= 0 ? "oklch(0.55 0.15 145)" : "oklch(0.55 0.2 25)",
      })),
    [data.sectors],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sector Allocation</CardTitle>
          <CardDescription>Investment weight by sector (bklit-style donut)</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart items={sectorAllocation} />
          <div className="mt-4 grid gap-2">
            {sectorAllocation.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  <span>{item.label}</span>
                </div>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sector Gain / Loss</CardTitle>
          <CardDescription>Performance by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart items={sectorGainLoss} />
        </CardContent>
      </Card>
    </div>
  );
}
