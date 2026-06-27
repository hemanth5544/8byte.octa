import type { SectorSummary } from "@portfolio/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent, gainLossClass } from "@/lib/utils";

interface SectorSummaryCardsProps {
  sectors: SectorSummary[];
}

export function SectorSummaryCards({ sectors }: SectorSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sectors.map((sector) => (
        <Card key={sector.sector}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{sector.sector}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatPercent(sector.portfolioPercent)} of portfolio
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investment</span>
              <span className="font-medium">{formatCurrency(sector.totalInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Present Value</span>
              <span className="font-medium">{formatCurrency(sector.totalPresentValue)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Gain/Loss</span>
              <span className={gainLossClass(sector.gainLoss)}>{formatCurrency(sector.gainLoss)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
