import { useMemo } from "react";
import type { PortfolioResponse } from "@portfolio/shared";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import type { PieData } from "@/components/charts/pie-context";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieHoverTooltip } from "@/components/charts/PieHoverTooltip";
import { ChartConfigProvider } from "@/components/charts/chart-config-context";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gainLossColor, sectorColor } from "@/lib/chartColors";
import { formatCurrency } from "@/lib/utils";

interface PortfolioChartsProps {
  data: PortfolioResponse;
}

export function PortfolioCharts({ data }: PortfolioChartsProps) {
  const pieData = useMemo<PieData[]>(
    () =>
      data.sectors.map((sector, index) => ({
        label: sector.sector,
        value: sector.totalInvestment,
        color: sectorColor(index),
      })),
    [data.sectors],
  );

  const barData = useMemo(
    () =>
      data.sectors.map((sector, index) => ({
        sector: sector.sector,
        // Bar chart scale is 0-based; use magnitude for bar length
        gainLoss: Math.abs(sector.gainLoss),
        gainLossSigned: sector.gainLoss,
        barColor: sectorColor(index),
        investment: sector.totalInvestment,
        presentValue: sector.totalPresentValue,
      })),
    [data.sectors],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sector Allocation</CardTitle>
          <CardDescription>Hover slices for investment breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto w-full max-w-[280px]">
            <PieChart className="mx-auto" data={pieData} innerRadius={58} padAngle={0.02}>
              {pieData.map((_, index) => (
                <PieSlice index={index} key={pieData[index]?.label ?? index} />
              ))}
              <PieCenter defaultLabel="Total Investment" prefix="₹" />
              <PieHoverTooltip />
            </PieChart>
          </div>
          <div className="mt-4 grid gap-2">
            {pieData.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
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
          <CardDescription>Hover bars for sector performance details</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartConfigProvider>
            <BarChart
              aspectRatio="4 / 3"
              barGap={0.35}
              className="min-h-[280px]"
              data={barData}
              margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
              orientation="horizontal"
              xDataKey="sector"
            >
              <Bar animate dataKey="gainLoss" />
              <ChartTooltip
                rows={(point) => {
                  const signed = point.gainLossSigned as number;
                  const barColor = point.barColor as string;
                  return [
                    {
                      color: gainLossColor(signed),
                      label: "Gain / Loss",
                      value: formatCurrency(signed),
                    },
                    {
                      color: barColor,
                      label: "Investment",
                      value: formatCurrency(point.investment as number),
                    },
                    {
                      color: barColor,
                      label: "Present Value",
                      value: formatCurrency(point.presentValue as number),
                    },
                  ];
                }}
                showCrosshair={false}
                showDatePill={false}
                showDots={false}
              />
            </BarChart>
          </ChartConfigProvider>
          <div className="mt-4 grid gap-2">
            {barData.map((item) => (
              <div key={item.sector} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: item.barColor }}
                  />
                  <span>{item.sector}</span>
                </div>
                <span
                  className="font-medium"
                  style={{ color: gainLossColor(item.gainLossSigned) }}
                >
                  {formatCurrency(item.gainLossSigned)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
