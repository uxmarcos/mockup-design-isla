import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { z } from "zod";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { ReportTemplate } from "@/components/analytics/ReportTemplate";
import { exportReportPdf } from "@/lib/export-report";
import {
  REPORT_RANGE_FACTOR,
  REPORT_RANGE_LABEL,
  type ReportRange,
} from "@/lib/cross-filters";

const searchSchema = z.object({
  range: z.enum(["7d", "14d", "30d", "60d", "90d"]).catch("30d"),
  senders: z.string().catch(""), // comma-separated names; empty = all
});

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Generated Report" },
      { name: "description", content: "Generated GTM analytics report preview." },
    ],
  }),
  validateSearch: (search) => searchSchema.parse(search),
  component: ReportPage,
});

function ReportPage() {
  const { range, senders: sendersParam } = Route.useSearch();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const factor = REPORT_RANGE_FACTOR[range as ReportRange];
  const rangeLabel = REPORT_RANGE_LABEL[range as ReportRange];
  const sendersList = sendersParam
    ? sendersParam.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const senderLabel = sendersList.length === 0 ? "All profiles" : sendersList.join(", ");

  const handleExport = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      await exportReportPdf(reportRef.current, `isla-analytics-${range}.pdf`);
      toast.success("Report exported");
    } catch (err) {
      console.error("PDF export failed", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-4">
          <BackButton onClick={() => navigate({ to: "/" })}>
            Back to Analytics
          </BackButton>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {rangeLabel} · {senderLabel}
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting}
              size="sm"
              className="h-9 gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="size-4" />
              {exporting ? "Exporting…" : "Export PDF"}
            </Button>
          </div>
        </div>
      </header>
      <div className="py-10">
        <ReportTemplate
          ref={reportRef}
          rangeLabel={rangeLabel}
          factor={factor}
          sender={senderLabel}
          senders={sendersList}
          visible
        />
      </div>
    </div>
  );
}
