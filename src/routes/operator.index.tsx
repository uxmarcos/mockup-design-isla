import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, ClipboardCheck, Lightbulb, MessageSquareText, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startOfWeek } from "@/lib/operator-data";
import { seatStats, useOperatorWorkspace } from "@/lib/operator-store";
import { NotificationRow } from "@/components/operator/NotificationRow";
import { OLink, useNewPost } from "@/components/operator/nav";
import { EmptyBox, HealthBadge, PageBody, PageHeader, WorkspaceLogo } from "@/components/operator/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operator/")({
  component: OverviewPage,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Kpi({
  label,
  value,
  icon: Icon,
  to,
  search,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  to: string;
  search?: Record<string, string>;
  tone?: "alert";
}) {
  return (
    <OLink
      to={to}
      search={search}
      className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className={cn("mt-3 text-3xl font-semibold", tone === "alert" && value > 0 && "text-destructive")}>{value}</p>
    </OLink>
  );
}

function OverviewPage() {
  const ws = useOperatorWorkspace();
  const openNewPost = useNewPost();
  const weekStart = startOfWeek(ws.now);

  const stats = useMemo(
    () => new Map(ws.seats.map((s) => [s.id, seatStats(s, ws.posts, weekStart, ws.now)])),
    [ws.seats, ws.posts, weekStart, ws.now],
  );
  const noPosts = ws.seats.filter((s) => (stats.get(s.id)?.scheduledThisWeek ?? 0) === 0 && s.cadence > 0);
  const openFeedback = ws.posts.filter((p) => p.status === "changes").length;
  const newIdeas = ws.posts.filter((p) => p.status === "writing" && p.origin === "idea" && !p.operator).length;
  const awaiting = ws.posts.filter((p) => p.status === "awaiting").length;

  const attention = ws.notifications.filter((n) => !n.read || n.priority === 1).slice(0, 8);
  const health = [...ws.seats]
    .map((s) => ({ s, st: stats.get(s.id)! }))
    .sort((a, b) => ["risk", "attention", "ok"].indexOf(a.st.health) - ["risk", "attention", "ok"].indexOf(b.st.health))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${ws.operator.name.split(" ")[0]}`}
        subtitle="Here's what needs your attention across your clients today."
      />
      <PageBody>
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Kpi label="Clients" value={ws.seats.length} icon={Users} to="/operator/clients" />
          <Kpi label="Open feedback" value={openFeedback} icon={MessageSquareText} to="/operator/inbox" search={{ type: "feedback" }} tone="alert" />
          <Kpi label="New ideas" value={newIdeas} icon={Lightbulb} to="/operator/inbox" search={{ type: "ideas" }} />
          <Kpi label="Awaiting approval" value={awaiting} icon={ClipboardCheck} to="/operator/posts" />
          <Kpi label="No posts this week" value={noPosts.length} icon={CalendarDays} to="/operator/calendar" tone="alert" />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <h2 className="text-sm font-semibold">Needs your attention</h2>
              <OLink to="/operator/inbox" className="text-xs font-medium text-primary hover:underline light:text-[#0B6A8F]">
                Open inbox
              </OLink>
            </div>
            {attention.length === 0 ? (
              <div className="p-4">
                <EmptyBox>You're all caught up. Nothing needs your attention right now.</EmptyBox>
              </div>
            ) : (
              <ul>
                {attention.map((n) => (
                  <NotificationRow key={n.key} n={n} seat={ws.getSeat(n.seatId)} onRead={(k) => ws.markRead([k])} />
                ))}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Clients without post this week</h2>
              {noPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Every seat has content scheduled.</p>
              ) : (
                <ul className="space-y-2.5">
                  {noPosts.map((s) => (
                    <li key={s.id} className="flex items-center gap-2.5">
                      <WorkspaceLogo workspace={s.workspace} className="size-7" />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-sm font-medium">{s.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{s.workspace.name}</span>
                      </span>
                      <Button variant="outline" size="sm" onClick={() => openNewPost({ seatId: s.id })}>
                        Create post
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                <h2 className="text-sm font-semibold">Client Health</h2>
                <OLink to="/operator/clients" className="text-xs font-medium text-primary hover:underline light:text-[#0B6A8F]">
                  All clients
                </OLink>
              </div>
              <ul>
                {health.map(({ s, st }) => (
                  <li key={s.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                    <WorkspaceLogo workspace={s.workspace} />
                    <OLink
                      to="/operator/clients/$clientId"
                      params={{ clientId: s.id }}
                      className="min-w-0 flex-1 leading-tight hover:underline"
                    >
                      <span className="block truncate text-sm font-medium">{s.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.workspace.name} · {st.healthReason}
                      </span>
                    </OLink>
                    <HealthBadge health={st.health} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </PageBody>
    </>
  );
}
