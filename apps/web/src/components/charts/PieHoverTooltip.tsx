"use client";

import { useEffect, useState } from "react";
import { usePie } from "@/components/charts/pie-context";
import { TooltipBox } from "@/components/charts/tooltip/tooltip-box";
import { TooltipContent } from "@/components/charts/tooltip/tooltip-content";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function PieHoverTooltip() {
  const { hoveredIndex, data, totalValue, containerRef, size } = usePie();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible = hoveredIndex !== null;
  const item = hoveredIndex !== null ? data[hoveredIndex] : null;
  const container = containerRef.current;

  if (!(mounted && container && visible && item)) {
    return null;
  }

  const share = totalValue > 0 ? item.value / totalValue : 0;
  const color = item.color ?? "var(--chart-1)";

  return (
    <TooltipBox
      animate
      containerHeight={size}
      containerRef={containerRef}
      containerWidth={size}
      visible={visible}
      x={size * 0.72}
      y={size * 0.28}
    >
      <TooltipContent
        rows={[
          { color, label: "Investment", value: formatCurrency(item.value) },
          { color, label: "Portfolio share", value: formatPercent(share) },
        ]}
        title={item.label}
      />
    </TooltipBox>
  );
}
