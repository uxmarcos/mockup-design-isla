import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ClipboardList, PlayCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGo } from "@/components/operator/nav";
import { PageBody, PageHeader, WorkspaceLogo } from "@/components/operator/ui";
import { formatTimer, useServiceDesk } from "@/lib/session-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ops/")({
  component: ServiceDeskHome,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function ServiceDeskHome() {
  const desk = useServiceDesk();
  const go = useGo();

  const activeWorkspace = desk.activeSession ? desk.workspaces.find((w) => w.id === desk.activeSession!.workspaceId) : null;
  const elapsed = desk.activeSession ? desk.now.getTime() - new Date(desk.activeSession.startedAt).getTime() : 0;

  const ranked = useMemo(
    () =>
      [...desk.workspaces].sort((a, b) => {
        const diff = desk.openTaskCount(b.id) - desk.openTaskCount(a.id);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }),
    [desk],
  );

  const attend = (workspaceId: string) => {
    if (!desk.activeSession || desk.activeSession.workspaceId !== workspaceId) {
      desk.startSession(workspaceId);
    }
    go("/ops/session/$workspaceId", { params: { workspaceId } });
  };

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${desk.operator.name.split(" ")[0]}`}
        subtitle="Attend one client at a time — work their task list while the clock runs."
        hideNewPost
        actions={
          <Button variant="outline" size="sm" onClick={() => go("/ops/reports")}>
            <Timer className="size-3.5" />
            Weekly report
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
                <p className="text-xs text-muted-foreground">Started at {new Date(desk.activeSession!.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-background/60 px-3 py-1.5 font-mono text-lg font-semibold tabular-nums">
                {formatTimer(elapsed)}
              </span>
              <Button size="sm" className="text-white" onClick={() => go("/ops/session/$workspaceId", { params: { workspaceId: activeWorkspace.id } })}>
                Open session
              </Button>
            </div>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Your clients</h2>
          <span className="text-xs text-muted-foreground">Ordered by open tasks</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((w) => {
            const openTasks = desk.openTaskCount(w.id);
            const isActive = desk.activeSession?.workspaceId === w.id;
            return (
              <div
                key={w.id}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border bg-card p-4",
                  isActive ? "border-primary/50" : "border-border",
                )}
              >
                <div className="flex items-center gap-3">
                  <WorkspaceLogo workspace={w} className="size-9" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-semibold">{w.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{w.plan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <ClipboardList className="size-3.5 text-muted-foreground" />
                  {openTasks > 0 ? (
                    <span className="font-medium text-amber light:text-[#7A5200]">
                      {openTasks} open {openTasks === 1 ? "task" : "tasks"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No pending tasks</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className={cn("mt-auto", isActive && "text-white")}
                  onClick={() => attend(w.id)}
                >
                  <PlayCircle className="size-3.5" />
                  {isActive ? "Continue attending" : "Start session"}
                </Button>
              </div>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}
