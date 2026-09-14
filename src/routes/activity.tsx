import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVITY_LOG,
  ACTIVITY_LABEL,
  activityDate,
  formatRelative,
  type ActivityType,
} from "@/lib/activity-data";
import { LeadInline, LeadPreviewProvider } from "@/components/LeadPreviewSheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Isla" },
      { name: "description", content: "Full activity history across your workspace." },
    ],
  }),
  component: ActivityPage,
});

const TYPE_OPTIONS: { value: ActivityType | "all"; label: string }[] = [
  { value: "all", label: "All activity types" },
  ...(Object.keys(ACTIVITY_LABEL) as ActivityType[]).map((t) => ({
    value: t,
    label: ACTIVITY_LABEL[t],
  })),
];

function ActivityPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const [type, setType] = useState<ActivityType | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const now = useMemo(() => Date.now(), []);

  const filtered = useMemo(() => {
    return ACTIVITY_LOG.filter((a) => {
      if (type !== "all" && a.type !== type) return false;
      if (dateRange?.from) {
        const d = activityDate(a, now);
        const from = startOfDay(dateRange.from);
        if (isBefore(d, from)) return false;
        if (dateRange.to && isAfter(d, endOfDay(dateRange.to))) return false;
      }
      return true;
    });
  }, [type, dateRange, now]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof ACTIVITY_LOG>();
    for (const a of filtered) {
      const d = activityDate(a, now);
      const key = format(d, "EEEE, MMM d");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries());
  }, [filtered, now]);

  const clearFilters = () => {
    setType("all");
    setDateRange(undefined);
  };

  const hasFilters = type !== "all" || !!dateRange?.from;

  return (
    <LeadPreviewProvider>
    <div className="flex min-h-screen bg-background text-foreground surface-soft">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="mx-auto max-w-3xl px-8 py-16">
          <header className="mb-10">
            <BackButton to="/home" className="mb-6">
              Back to Home
            </BackButton>
            <h1 className="text-3xl font-semibold tracking-tight">Recent activity</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything that happened across your workspace.
            </p>
          </header>

          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Select value={type} onValueChange={(v) => setType(v as ActivityType | "all")}>
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue placeholder="All activity types" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 w-[240px] justify-start text-left text-xs font-normal",
                    !dateRange?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-3.5" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL d, y")} —{" "}
                        {format(dateRange.to, "LLL d, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL d, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
                <X className="mr-1 size-3" />
                Clear
              </Button>
            )}

            <span className="ml-auto text-[11px] text-muted-foreground">
              {filtered.length} of {ACTIVITY_LOG.length}
            </span>
          </div>

          {grouped.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No recent activity.
            </div>
          ) : (
            <div className="space-y-10">
              {grouped.map(([day, items]) => (
                <section key={day}>
                  <h2 className="mb-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    {day}
                  </h2>
                  <ul className="card-soft divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
                    {items.map((a) => {
                      const personName = a.personName;
                      const idx = personName ? a.summary.indexOf(personName) : -1;
                      const before = idx >= 0 ? a.summary.slice(0, idx) : "";
                      const after =
                        idx >= 0 && personName
                          ? a.summary.slice(idx + personName.length)
                          : a.summary;
                      const renderPostTitle = (text: string) => {
                        if (!a.postUrl || !a.postTitle) return text;
                        const [b, rest = ""] = text.split(`"${a.postTitle}"`);
                        return (
                          <>
                            {b}
                            <a
                              href={a.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00BFFF] hover:underline"
                            >
                              "{a.postTitle}"
                            </a>
                            {rest}
                          </>
                        );
                      };
                      return (
                        <li
                          key={a.id}
                          className="grid grid-cols-[80px_1fr] items-start gap-4 px-5 py-4 text-xs"
                        >
                          <span className="pt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                            {formatRelative(a.minutesAgo)}
                          </span>
                          <p className="leading-relaxed text-foreground/85">
                            {idx >= 0 && personName ? (
                              <>
                                {before}
                                <LeadInline name={personName} avatarUrl={a.avatarUrl} />
                                {renderPostTitle(after)}
                              </>
                            ) : (
                              renderPostTitle(after)
                            )}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </LeadPreviewProvider>
  );
}
