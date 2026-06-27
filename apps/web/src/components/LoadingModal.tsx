import { Loader2, Server } from "lucide-react";

interface LoadingModalProps {
  open: boolean;
}

export function LoadingModal({ open }: LoadingModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-description"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Server className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 id="loading-modal-title" className="text-lg font-semibold">
              Loading portfolio data
            </h2>
            <p id="loading-modal-description" className="text-sm text-muted-foreground">
              The API runs on Vercel serverless and fetches live quotes from Yahoo Finance and
              Google Finance for 26 holdings. The first request can take 30–60 seconds while the
              function starts and market data loads. Please wait.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <span>Fetching market prices and fundamentals…</span>
        </div>
      </div>
    </div>
  );
}
