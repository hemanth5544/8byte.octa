import type { PortfolioResponse } from "@portfolio/shared";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent, gainLossClass } from "@/lib/utils";
import { PortfolioCharts } from "./PortfolioCharts";

interface PortfolioSummaryProps {
  data: PortfolioResponse;
}

export function PortfolioSummary({ data }: PortfolioSummaryProps) {
  const { totals } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Investment</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totals.totalInvestment)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Present Value</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totals.totalPresentValue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gain / Loss</CardDescription>
            <CardTitle className={`text-2xl ${gainLossClass(totals.gainLoss)}`}>
              {formatCurrency(totals.gainLoss)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Return</CardDescription>
            <CardTitle className={`text-2xl ${gainLossClass(totals.gainLoss)}`}>
              {formatPercent(totals.gainLossPercent)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <PortfolioCharts data={data} />
    </div>
  );
}
