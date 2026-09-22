import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOperatorWorkspace, type NotificationType, type OpNotification } from "@/lib/operator-store";
import { NotificationRow } from "@/components/operator/NotificationRow";
import { useGo } from "@/components/operator/nav";
import { DateRangePicker } from "@/components/operator/DateRangePicker";
import { EmptyBox, PageBody } from "@/components/operator/ui";

const TABS = ["all", "ideas", "feedback", "approvals"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/ops/inbox")({
  validateSearch: z.object({ type: z.enum(TABS).optional() }),
  component: InboxPage,
});

const MATCH: Record<Tab, NotificationType[]> = {
  all: ["idea", "feedback", "approval"],
  ideas: ["idea"],
  feedback: ["feedback"],
  approvals: ["approval"],
};

const LABEL: Record<Tab, string> = {
  all: "All",
  ideas: "Ideas",
  feedback: "Feedback",
  approvals: "Approvals",
};

const GROUPS_PER_PAGE = 7;

/** Today holds at most 8, Yesterday at most 12, every day after that at most 10 — overflow spills to the next (older) day. */
const capacityFor = (dayIndex: number) => (dayIndex === 0 ? 8 : dayIndex === 1 ? 12 : 10);

const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function keyToDate(key: string) {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

function shiftKey(key: string, deltaDays: number) {
  const d = keyToDate(key);
  d.setDate(d.getDate() + deltaDays);
  return dateKey(d);
}

/** Only Today and Yesterday get special names — every other table is labeled by its calendar date. */
function dayLabel(key: string, now: Date) {
  const date = keyToDate(key);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

type DayGroup = { key: string; items: OpNotification[] };

/**
 * Breaks the feed into one table per day, most recent day first and most recent notification
 * first within it. Each day only holds so many rows — the rest spill into the next (older) day
 * so the tables stay readable instead of one giant pile on "Today".
 */
function groupByDay(list: OpNotification[], now: Date) {
  const map = new Map<string, OpNotification[]>();
  for (const n of list) {
    const key = dateKey(new Date(n.at));
    const group = map.get(key) ?? [];
    group.push(n);
    map.set(key, group);
  }
  const groups: DayGroup[] = [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, items]) => ({ key, items: [...items].sort((a, b) => b.at.localeCompare(a.at)) }));

  for (let i = 0; i < groups.length; i++) {
    const cap = capacityFor(i);
    if (groups[i]!.items.length <= cap) continue;
    const overflow = groups[i]!.items.splice(cap);
    if (i + 1 >= groups.length) {
      groups.splice(i + 1, 0, { key: shiftKey(groups[i]!.key, -1), items: [] });
    }
    groups[i + 1]!.items = [...overflow, ...groups[i + 1]!.items];
  }

  return groups.map((g) => ({ ...g, label: dayLabel(g.key, now) }));
}

function InboxPage() {
  const ws = useOperatorWorkspace();
  const go = useGo();
  const { type } = Route.useSearch();
  const tab: Tab = type ?? "all";

  const [client, setClient] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(0);

  useEffect(() => setPage(0), [client, tab, dateRange]);

  const byTab = ws.notifications.filter((n) => MATCH[tab].includes(n.type));
  const unreadIn = (t: Tab) => ws.notifications.filter((n) => MATCH[t].includes(n.type) && !n.read).length;

  const filtered = useMemo(() => {
    const from = dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null;
    const to = dateRange?.to ?? dateRange?.from;
    const toEnd = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999) : null;
    return byTab.filter((n) => {
      if (client !== "all" && n.seatId !== client) return false;
      if (from && toEnd) {
        const d = new Date(n.at);
        if (d < from || d > toEnd) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byTab, ws.now, client, dateRange]);

  const groups = useMemo(() => groupByDay(filtered, ws.now), [filtered, ws.now]);
  const pageCount = Math.max(1, Math.ceil(groups.length / GROUPS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageGroups = groups.slice(safePage * GROUPS_PER_PAGE, safePage * GROUPS_PER_PAGE + GROUPS_PER_PAGE);

  return (
    <PageBody className="max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => go("/ops/inbox", { search: v === "all" ? {} : { type: v } })}>
          <TabsList>
            {TABS.map((t) => {
              const unread = unreadIn(t);
              return (
                <TabsTrigger key={t} value={t} className="gap-2">
                  {LABEL[t]}
                  {unread > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-4 text-white">
                      {unread}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={client} onValueChange={setClient}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {ws.workspaces.map((w) => (
                <SelectGroup key={w.id}>
                  <SelectLabel className="text-xs">{w.name}</SelectLabel>
                  {ws.seats
                    .filter((s) => s.workspaceId === w.id)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyBox>Nothing matches these filters.</EmptyBox>
      ) : (
        <>
          <div className="space-y-6">
            {pageGroups.map((group) => (
              <section key={group.key}>
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h2>
                <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                  {group.items.map((n) => (
                    <NotificationRow key={n.key} n={n} seat={ws.getSeat(n.seatId)} onRead={(k) => ws.markRead([k])} />
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {safePage + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </PageBody>
  );
}
