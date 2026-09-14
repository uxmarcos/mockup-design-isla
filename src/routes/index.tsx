import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Sidebar } from "@/components/analytics/Sidebar";
import { Cross } from "@/components/analytics/Cross";
import { CrossFiltersProvider, useCrossFilters, type Range } from "@/lib/cross-filters";
import { SENDERS } from "@/lib/cross-data";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ReportRange } from "@/lib/cross-filters";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
  head: () => ({
    meta: [
      { title: "Isla" },
      { name: "description", content: "AI-powered content and pipeline workspace for B2B teams." },
    ],
  }),
  component: AnalyticsPage,
});

type Tab = "outbound" | "inbound" | "cross";

const REPORT_RANGES: { value: ReportRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
  { value: "30d", label: "30 days" },
  { value: "60d", label: "60 days" },
  { value: "90d", label: "90 days" },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function GenerateReportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [range, setRange] = useState<ReportRange>("30d");
  const allChecked = selected.length === 0;

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  const handleGenerate = () => {
    navigate({
      to: "/report",
      search: { range, senders: selected.join(",") },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate report</DialogTitle>
          <DialogDescription>
            Choose which profiles to include and the time window.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Profiles
            </Label>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-border p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={() => setSelected([])}
                />
                <span className="text-sm">All profiles</span>
              </label>
              <div className="my-2 h-px bg-border" />
              {SENDERS.map((s) => (
                <label
                  key={s.name}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(s.name)}
                    onCheckedChange={() => toggle(s.name)}
                  />
                  <Avatar className="size-6">
                    <AvatarImage src={s.avatar} alt={s.name} />
                    <AvatarFallback className="text-[9px]">
                      {initials(s.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Time range
            </Label>
            <div className="flex flex-wrap gap-2">
              {REPORT_RANGES.map((r) => {
                const active = range === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="gap-2">
            <FileText className="size-4" />
            Generate report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HeaderControls({ onOpenReport }: { onOpenReport: () => void }) {
  const { range, setRange, sender, setSender } = useCrossFilters();
  return (
    <div className="flex items-center gap-2">
      <Select value={sender} onValueChange={setSender}>
        <SelectTrigger className="h-9 w-[200px] rounded-lg border-border bg-card text-sm">
          <SelectValue placeholder="All profiles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All profiles</SelectItem>
          {SENDERS.map((s) => (
            <SelectItem key={s.name} value={s.name}>
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarImage src={s.avatar} alt={s.name} />
                  <AvatarFallback className="text-[9px]">{initials(s.name)}</AvatarFallback>
                </Avatar>
                <span>{s.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex rounded-lg border border-border bg-card p-1">
        {(["7d", "30d", "all"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              range === r ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r === "all" ? "All" : r}
          </button>
        ))}
      </div>
      <Button
        onClick={onOpenReport}
        size="sm"
        className="h-9 gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <FileText className="size-4" />
        Generate Report
      </Button>
    </div>
  );
}

function AnalyticsInner({
  tab,
  tabsSlot,
  onOpenReport,
}: {
  tab: Tab;
  tabsSlot: React.ReactNode;
  onOpenReport: () => void;
}) {
  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time visibility into pipeline health, conversions and MRR.
          </p>
        </div>
        <HeaderControls onOpenReport={onOpenReport} />
      </header>
      {tabsSlot}
      {tab === "cross" && <Cross />}
    </>
  );
}



function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("cross");
  const [collapsed, setCollapsed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const tabs: { id: Tab; label: string; disabled: boolean }[] = [
    { id: "outbound", label: "Outbound", disabled: true },
    { id: "inbound", label: "Inbound", disabled: true },
    { id: "cross", label: "Cross", disabled: false },
  ];

  const tabsSlot = (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
      <TabsList>
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id} disabled={t.disabled}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );


  return (
    <CrossFiltersProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className={`flex-1 px-6 py-8 lg:px-10 transition-[margin] duration-200 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"}`}>
          <div className="mx-auto max-w-[1400px] space-y-6">
            <AnalyticsInner
              tab={tab}
              tabsSlot={tabsSlot}
              onOpenReport={() => setReportOpen(true)}
            />
          </div>
        </main>
      </div>
      <GenerateReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </CrossFiltersProvider>
  );
}

