import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { startOfWeek } from "@/lib/operator-data";
import { formatMinutes, useServiceDesk } from "@/lib/session-store";
import { OLink } from "@/components/operator/nav";
import { EmptyBox, PageBody, PageHeader, WorkspaceLogo } from "@/components/operator/ui";

export const Route = createFileRoute("/ops/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const desk = useServiceDesk();
  const weekStart = startOfWeek(desk.now);

  const rows = useMemo(() => {
    const totals = desk.weeklyMinutesByWorkspace();
    return desk.workspaces
      .map((w) => ({
        workspace: w,
        minutes: totals.get(w.id) ?? 0,
        sessions: desk.sessions.filter((s) => s.workspaceId === w.id && new Date(s.startedAt) >= weekStart).length,
      }))
      .filter((r) => r.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
  }, [desk, weekStart]);

  const totalMinutes = rows.reduce((sum, r) => sum + r.minutes, 0);
  const maxMinutes = Math.max(1, ...rows.map((r) => r.minutes));
  const range = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${desk.now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <>
      <PageHeader title="Weekly report" subtitle={`Time spent attending each client, ${range}.`} hideNewPost />
      <PageBody>
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Total this week</p>
          <p className="mt-2 text-3xl font-semibold">{formatMinutes(totalMinutes)}</p>
        </div>

        {rows.length === 0 ? (
          <EmptyBox>No sessions logged yet this week. Start attending a client from the Service Desk.</EmptyBox>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <ul>
              {rows.map((r) => (
                <li key={r.workspace.id} className="border-b border-border px-4 py-3.5 last:border-b-0">
                  <div className="mb-2 flex items-center gap-3">
                    <WorkspaceLogo workspace={r.workspace} className="size-8" />
                    <OLink
                      to="/ops/clients/$clientId"
                      params={{ clientId: r.workspace.id }}
                      className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                    >
                      {r.workspace.name}
                    </OLink>
                    <span className="text-xs text-muted-foreground">
                      {r.sessions} {r.sessions === 1 ? "session" : "sessions"}
                    </span>
                    <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">{formatMinutes(r.minutes)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(r.minutes / maxMinutes) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageBody>
    </>
  );
}
