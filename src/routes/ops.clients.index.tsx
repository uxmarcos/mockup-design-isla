import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlayCircle, Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startOfWeek } from "@/lib/operator-data";
import { seatStats, useOperatorWorkspace } from "@/lib/operator-store";
import { formatTimer, useServiceDesk } from "@/lib/session-store";
import { OLink, useGo } from "@/components/operator/nav";
import { AddClientDialog } from "@/components/operator/AddClientDialog";
import { formatWhen, HealthBadge, PageBody, PageHeader, SeatAvatar, WorkspaceLogo } from "@/components/operator/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ops/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  const ws = useOperatorWorkspace();
  const desk = useServiceDesk();
  const go = useGo();
  const weekStart = startOfWeek(ws.now);
  const stats = useMemo(
    () => new Map(ws.seats.map((s) => [s.id, seatStats(s, ws.posts, weekStart, ws.now)])),
    [ws.seats, ws.posts, weekStart, ws.now],
  );
  const [adding, setAdding] = useState(false);

  const activeWorkspace = desk.activeSession ? ws.workspaces.find((w) => w.id === desk.activeSession!.workspaceId) : null;
  const elapsed = desk.activeSession ? desk.now.getTime() - new Date(desk.activeSession.startedAt).getTime() : 0;

  const attend = (workspaceId: string) => {
    if (!desk.activeSession || desk.activeSession.workspaceId !== workspaceId) {
      desk.startSession(workspaceId);
    }
    go("/ops/clients/$workspaceId", { params: { workspaceId } });
  };

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${ws.seats.length} seats across ${ws.workspaces.length} workspaces in your portfolio.`}
        hideNewPost
        actions={
          <Button size="sm" className="text-white" onClick={() => setAdding(true)}>
            <Plus className="mr-1 size-4" />
            Add new client
          </Button>
        }
      />
      <PageBody>
        {activeWorkspace && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/10 p-4">
            <div className="flex items-center gap-3">
              <WorkspaceLogo workspace={activeWorkspace} className="size-9" />
              <div className="leading-tight">
                <p className="text-sm font-semibold">Currently attending {activeWorkspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  Started at{" "}
                  {new Date(desk.activeSession!.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-background/60 px-3 py-1.5 font-mono text-lg font-semibold tabular-nums">
                {formatTimer(elapsed)}
              </span>
              <Button
                size="sm"
                className="text-white"
                onClick={() => go("/ops/clients/$workspaceId", { params: { workspaceId: activeWorkspace.id } })}
              >
                Open client
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {ws.workspaces.map((w) => {
            const seats = ws.seats.filter((s) => s.workspaceId === w.id);
            const isActive = desk.activeSession?.workspaceId === w.id;
            return (
              <div key={w.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                  <WorkspaceLogo workspace={w} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{w.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {seats.length} {seats.length === 1 ? "seat" : "seats"} · {w.plan}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => go("/ops/clients/$workspaceId/manage", { params: { workspaceId: w.id } })}
                  >
                    <Settings2 className="size-3.5" />
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={cn(isActive && "text-white")}
                    onClick={() => attend(w.id)}
                  >
                    <PlayCircle className="size-3.5" />
                    {isActive ? "Continue" : "Start session"}
                  </Button>
                </div>
                <ul>
                  {seats.map((s) => {
                    const st = stats.get(s.id)!;
                    return (
                      <li key={s.id} className="border-b border-border last:border-b-0">
                        <OLink
                          to="/ops/clients/$workspaceId"
                          params={{ workspaceId: w.id }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
                        >
                          <SeatAvatar seat={s} />
                          <div className="min-w-0 flex-1 leading-tight">
                            <p className="truncate text-sm font-medium">{s.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {s.title} · {st.scheduledThisWeek}/{s.cadence} this week
                              {st.changes > 0 && `  · ${st.changes} open feedback`}
                            </p>
                          </div>
                          <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                            {st.nextPost ? formatWhen(new Date(st.nextPost.scheduledAt!)) : "No post scheduled"}
                          </span>
                          <HealthBadge health={st.health} />
                        </OLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </PageBody>

      <AddClientDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}
