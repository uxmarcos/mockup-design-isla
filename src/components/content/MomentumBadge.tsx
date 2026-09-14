import { cn } from "@/lib/utils";
import type { Momentum } from "@/lib/content-hub-data";

export function MomentumBadge({ momentum }: { momentum: Momentum }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        momentum === "high"
          ? "border-[#00BFFF]/30 bg-[#00BFFF]/10 text-[#00BFFF]"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {momentum === "high" ? "High momentum" : "Rising"}
    </span>
  );
}
