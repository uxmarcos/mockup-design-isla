import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startOfWeek } from "@/lib/operator-data";
import type { Workspace } from "@/lib/operator-data";
import { seatStats, useOperatorWorkspace } from "@/lib/operator-store";
import { OLink } from "@/components/operator/nav";
import { AddClientDialog } from "@/components/operator/AddClientDialog";
import { ManageWorkspaceSheet } from "@/components/operator/ManageWorkspaceSheet";
import { formatWhen, HealthBadge, PageBody, PageHeader, SeatAvatar, WorkspaceLogo } from "@/components/operator/ui";

export const Route = createFileRoute("/ops/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  const ws = useOperatorWorkspace();
  const weekStart = startOfWeek(ws.now);
  const stats = useMemo(
    () => new Map(ws.seats.map((s) => [s.id, seatStats(s, ws.posts, weekStart, ws.now)])),
    [ws.seats, ws.posts, weekStart, ws.now],
  );
  const [managing, setManaging] = useState<Workspace | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${ws.seats.length} seats across ${ws.workspaces.length} workspaces in your portfolio.`}
        hideBell
        hideNewPost
        actions={
          <Button size="sm" className="text-white" onClick={() => setAdding(true)}>
            <Plus className="mr-1 size-4" />
            Add new client
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-2">
          {ws.workspaces.map((w) => {
            const seats = ws.seats.filter((s) => s.workspaceId === w.id);
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
                  <Button variant="outline" size="sm" onClick={() => setManaging(w)}>
                    <Settings2 className="size-3.5" />
                    Manage
                  </Button>
                </div>
                <ul>
                  {seats.map((s) => {
                    const st = stats.get(s.id)!;
                    return (
                      <li key={s.id} className="border-b border-border last:border-b-0">
                        <OLink
                          to="/ops/clients/$clientId"
                          params={{ clientId: s.id }}
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

      <ManageWorkspaceSheet
        workspace={managing}
        seats={managing ? ws.seats.filter((s) => s.workspaceId === managing.id) : []}
        open={!!managing}
        onOpenChange={(v) => !v && setManaging(null)}
      />
      <AddClientDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}
