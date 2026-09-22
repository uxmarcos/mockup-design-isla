import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo } from "react";
import { startOfWeek } from "@/lib/operator-data";
import { seatStats, useOperatorWorkspace } from "@/lib/operator-store";
import { OLink } from "@/components/operator/nav";
import { formatWhen, HealthBadge, PageBody, PageHeader, timeAgo, WorkspaceLogo } from "@/components/operator/ui";

export const Route = createFileRoute("/operator/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  const ws = useOperatorWorkspace();
  const weekStart = startOfWeek(ws.now);
  const stats = useMemo(
    () => new Map(ws.seats.map((s) => [s.id, seatStats(s, ws.posts, weekStart, ws.now)])),
    [ws.seats, ws.posts, weekStart, ws.now],
  );

  const th = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground";

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${ws.seats.length} seats across ${ws.workspaces.length} workspaces in your portfolio.`}
      />
      <PageBody>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className={th}>Seat</th>
                <th className={th}>Health</th>
                <th className={th}>This week</th>
                <th className={th}>Awaiting</th>
                <th className={th}>Feedback</th>
                <th className={th}>Next post</th>
                <th className={th}>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {ws.workspaces.map((w) => {
                const seats = ws.seats.filter((s) => s.workspaceId === w.id);
                return (
                  <Fragment key={w.id}>
                    <tr className="border-b border-border bg-muted/40">
                      <td colSpan={7} className="px-4 py-2.5">
                        <span className="flex items-center gap-2.5">
                          <WorkspaceLogo workspace={w} className="size-6" />
                          <span className="text-sm font-semibold">{w.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {seats.length} {seats.length === 1 ? "seat" : "seats"} · {w.plan}
                          </span>
                        </span>
                      </td>
                    </tr>
                    {seats.map((s) => {
                      const st = stats.get(s.id)!;
                      return (
                        <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                          <td className="px-4 py-3 pl-12">
                            <OLink to="/operator/clients/$clientId" params={{ clientId: s.id }} className="block leading-tight">
                              <span className="block font-medium">{s.name}</span>
                              <span className="block text-xs text-muted-foreground">{s.title}</span>
                            </OLink>
                          </td>
                          <td className="px-4 py-3">
                            <HealthBadge health={st.health} />
                          </td>
                          <td className="px-4 py-3">
                            {st.scheduledThisWeek}/{s.cadence}
                          </td>
                          <td className="px-4 py-3">{st.awaiting}</td>
                          <td className="px-4 py-3">
                            {st.changes > 0 ? <span className="font-medium text-destructive">{st.changes} open</span> : "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {st.nextPost ? formatWhen(new Date(st.nextPost.scheduledAt!)) : "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {st.lastActivity ? timeAgo(st.lastActivity, ws.now) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageBody>
    </>
  );
}
