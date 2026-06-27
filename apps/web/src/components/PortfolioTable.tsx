import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import type { HoldingWithMetrics } from "@portfolio/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  gainLossClass,
} from "@/lib/utils";

interface PortfolioTableProps {
  holdings: HoldingWithMetrics[];
  sectorLabel?: string;
}

export function PortfolioTable({ holdings, sectorLabel }: PortfolioTableProps) {
  const columns = useMemo<ColumnDef<HoldingWithMetrics>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Particulars",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "purchasePrice",
        header: "Purchase Price",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ getValue }) => formatNumber(getValue<number>(), 0),
      },
      {
        accessorKey: "investment",
        header: "Investment",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: "portfolioPercent",
        header: "Portfolio (%)",
        cell: ({ getValue }) => formatPercent(getValue<number>()),
      },
      {
        accessorKey: "exchangeCode",
        header: "NSE/BSE",
        cell: ({ getValue }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{getValue<string>()}</code>
        ),
      },
      {
        accessorKey: "cmp",
        header: "CMP",
        cell: ({ getValue }) => formatCurrency(getValue<number | null>()),
      },
      {
        accessorKey: "presentValue",
        header: "Present Value",
        cell: ({ getValue }) => formatCurrency(getValue<number | null>()),
      },
      {
        accessorKey: "gainLoss",
        header: "Gain/Loss",
        cell: ({ getValue }) => {
          const value = getValue<number | null>();
          return <span className={gainLossClass(value)}>{formatCurrency(value)}</span>;
        },
      },
      {
        accessorKey: "peRatio",
        header: "P/E Ratio",
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
      },
      {
        accessorKey: "latestEarnings",
        header: "Latest Earnings",
        cell: ({ getValue }) => formatCurrency(getValue<number | null>()),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: holdings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-3">
      {sectorLabel && (
        <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">{sectorLabel}</h3>
      )}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No holdings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
