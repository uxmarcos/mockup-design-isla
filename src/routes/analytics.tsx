import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Sidebar } from "@/components/analytics/Sidebar";
import { Inbound } from "@/components/analytics/Inbound";
import { Outbound } from "@/components/analytics/Outbound";
import { SENDERS } from "@/lib/cross-data";
import { personAvatar } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Isla" },
      {
        name: "description",
        content: "Real-time visibility into pipeline health, conversions and MRR.",
      },
    ],
  }),
  component: AnalyticsPage,
});

type Tab = "inbound" | "outbound";
type RangeKey = "7d" | "30d" | "all" | "custom";

const HISTORY_DAYS = 95;
const RANGE_FACTOR = { "7d": 0.22, "30d": 0.55, all: 1 } as const;

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("inbound");
  const [collapsed, setCollapsed] = useState(false);
  const [range, setRange] = useState<RangeKey>("all");
  const [sender, setSender] = useState("all");
  const [customOpen, setCustomOpen] = useState(false);
  const [customTo, setCustomTo] = useState(() => isoDay(new Date()));
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return isoDay(d);
  });

  const customDays = Math.min(
    HISTORY_DAYS,
    Math.max(
      1,
      Math.round((new Date(customTo).getTime() - new Date(customFrom).getTime()) / 86400000) + 1,
    ),
  );

  const windowDays =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "custom" ? Math.max(2, customDays) : null;
  const factor =
    range === "custom" ? Math.max(0.05, customDays / HISTORY_DAYS) : RANGE_FACTOR[range];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={`flex-1 px-6 py-8 lg:px-10 transition-[margin] duration-200 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"}`}
      >
        <div className="mx-auto max-w-[1400px] space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Real-time visibility into pipeline health, conversions and MRR.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sender} onValueChange={setSender}>
                <SelectTrigger className="h-10 w-[150px] rounded-lg border-border bg-card text-sm">
                  <SelectValue placeholder="All profiles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All profiles</SelectItem>
                  {SENDERS.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarImage src={personAvatar(s.name)} alt={s.name} />
                          <AvatarFallback className="text-[9px]">{initials(s.name)}</AvatarFallback>
                        </Avatar>
                        <span>{s.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover open={customOpen} onOpenChange={setCustomOpen}>
                <PopoverAnchor asChild>
                  <div>
                    <Tabs
                      value={range}
                      onValueChange={(v) => {
                        setRange(v as RangeKey);
                        if (v === "custom") setCustomOpen(true);
                      }}
                    >
                      <TabsList className="h-10">
                        <TabsTrigger value="7d">7d</TabsTrigger>
                        <TabsTrigger value="30d">30d</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="custom" onClick={() => setCustomOpen(true)}>
                          <CalendarIcon className="size-3.5" />
                          Custom
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </PopoverAnchor>
                <PopoverContent align="end" className="w-[280px] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="range-from" className="text-xs">
                        From
                      </Label>
                      <Input
                        id="range-from"
                        type="date"
                        value={customFrom}
                        max={customTo}
                        onChange={(e) => setCustomFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="range-to" className="text-xs">
                        To
                      </Label>
                      <Input
                        id="range-to"
                        type="date"
                        value={customTo}
                        min={customFrom}
                        onChange={(e) => setCustomTo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" className="text-white" onClick={() => setCustomOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </header>

          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value="inbound">Inbound</TabsTrigger>
              <TabsTrigger value="outbound">Outbound</TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "inbound" ? (
            <Inbound factor={factor} sender={sender} windowDays={windowDays} />
          ) : (
            <Outbound factor={factor} sender={sender} />
          )}
        </div>
      </main>
    </div>
  );
}
