import { RefreshCw, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { PortfolioTable } from "@/components/PortfolioTable";
import { SectorSummaryCards } from "@/components/SectorSummaryCards";

export default function App() {
  const { data, loading, error, refresh, lastUpdated } = usePortfolio();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Portfolio Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Dynamic portfolio insights · Octa Byte AI case study
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-border font-normal">
              Auto-refresh: 15s
            </Badge>
            {data?.marketData ? (
              <Badge
                variant={data.marketData.liveCmpCount > 0 ? "default" : "secondary"}
                className="font-normal"
              >
                Live CMP: {data.marketData.liveCmpCount}/{data.marketData.totalHoldings}
              </Badge>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Loading portfolio data…
          </div>
        ) : null}

        {data ? (
          <>
            <PortfolioSummary data={data} />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sector Overview</h2>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                    {data.marketData.fallbackCmpCount > 0
                      ? ` · ${data.marketData.fallbackCmpCount} holdings using seeded fallback CMP`
                      : ""}
                  </p>
                )}
              </div>
              <SectorSummaryCards sectors={data.sectors} />
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-semibold">Holdings by Sector</h2>
              {data.sectors.map((sector) => (
                <PortfolioTable
                  key={sector.sector}
                  sectorLabel={sector.sector}
                  holdings={sector.holdings}
                />
              ))}
            </section>

            <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              {data.disclaimer}
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
}
