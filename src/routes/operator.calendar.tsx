import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postTitle, seatOf, type TeamDraft } from "@/lib/content-requests-store";
import { addDays, sameDay, startOfWeek } from "@/lib/operator-data";
import { inWeek, postDate, scheduledInWeek, useOperatorWorkspace } from "@/lib/operator-store";
import { OLink, useNewPost } from "@/components/operator/nav";
import { PageHeader, statusStyle, WorkspaceLogo } from "@/components/operator/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operator/calendar")({
  component: CalendarPage,
});

function hhmm(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Chip({ post, seatName, now }: { post: TeamDraft; seatName: string; now: Date }) {
  const s = statusStyle(post, now);
  const d = postDate(post)!;
  return (
    <OLink
      to="/operator/posts/$postId"
      params={{ postId: post.id }}
      search={{ from: "calendar" }}
      title={`${seatName} · ${postTitle(post)}`}
      className={cn("block rounded-md border px-1.5 py-1 text-[11px] leading-tight hover:brightness-110", s.cls)}
    >
      <span className="flex items-center gap-1">
        <span className="grid size-3.5 shrink-0 place-items-center rounded-[3px] bg-[#0A66C2] text-[8px] font-bold text-white">
          in
        </span>
        <span className="font-semibold">{hhmm(d)}</span>
        <span className="ml-auto truncate font-medium opacity-80">{seatName.split(" ")[0]}</span>
      </span>
      <span className="mt-0.5 block truncate">{postTitle(post)}</span>
    </OLink>
  );
}

function CalendarPage() {
  const ws = useOperatorWorkspace();
  const openNewPost = useNewPost();
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState("all");

  const currentWeek = startOfWeek(ws.now);
  const weekStart = addDays(currentWeek, offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const seats = ws.seats.filter((c) => filter === "all" || c.id === filter);
  const workspaces = ws.workspaces.filter((w) => seats.some((s) => s.workspaceId === w.id));

  const bySeat = useMemo(() => {
    const map = new Map<string, TeamDraft[]>();
    for (const p of ws.posts) {
      if (!inWeek(postDate(p), weekStart)) continue;
      const list = map.get(seatOf(p)) ?? [];
      list.push(p);
      map.set(seatOf(p), list);
    }
    return map;
  }, [ws.posts, weekStart]);

  const range = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  const gaps = seats.filter(
    (c) => c.cadence > 0 && scheduledInWeek(bySeat.get(c.id) ?? [], weekStart).length === 0,
  ).length;

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={
          gaps > 0
            ? `${gaps} ${gaps > 1 ? "seats have" : "seat has"} no posts scheduled this week.`
            : "Every seat has posts scheduled this week."
        }
        actions={
          <>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clients</SelectItem>
                {ws.workspaces.map((w) => (
                  <SelectGroup key={w.id}>
                    <SelectLabel className="text-xs">{w.name}</SelectLabel>
                    {ws.seats
                      .filter((x) => x.workspaceId === w.id)
                      .map((x) => (
                        <SelectItem key={x.id} value={x.id}>
                          {x.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <span className="px-1 text-sm text-muted-foreground">{range}</span>
            <Button variant="outline" size="sm" onClick={() => setOffset(0)} disabled={offset === 0}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => setOffset(offset - 1)} aria-label="Previous week">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => setOffset(offset + 1)} aria-label="Next week">
              <ChevronRight className="size-4" />
            </Button>
          </>
        }
      />

      <div className="px-8 py-6">
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <div className="grid min-w-[1040px] grid-cols-[210px_repeat(7,minmax(0,1fr))]">
            <div className="border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Seat
            </div>
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className={cn(
                  "border-b border-l border-border px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
                  sameDay(d, ws.now) && "bg-primary/10 text-foreground",
                )}
              >
                {d.toLocaleDateString("en-US", { weekday: "short" })} <span className="font-normal">{d.getDate()}</span>
              </div>
            ))}

            {workspaces.map((w) => (
              <Fragment key={w.id}>
                <div className="col-span-8 flex items-center gap-2.5 border-b border-border bg-muted/40 px-4 py-2">
                  <WorkspaceLogo workspace={w} className="size-5" />
                  <span className="text-[13px] font-semibold">{w.name}</span>
                </div>
                {seats
                  .filter((s) => s.workspaceId === w.id)
                  .map((c) => {
                    const posts = bySeat.get(c.id) ?? [];
                    const scheduled = scheduledInWeek(posts, weekStart).length;
                    const short = c.cadence > 0 && scheduled < c.cadence;
                    return (
                      <div key={c.id} className="contents">
                        <div className="flex items-center border-b border-border px-4 py-3 pl-9">
                          <div className="min-w-0 leading-tight">
                            <OLink
                              to="/operator/clients/$clientId"
                              params={{ clientId: c.id }}
                              className="block truncate text-sm font-medium hover:underline"
                            >
                              {c.name}
                            </OLink>
                            <span
                              className={cn(
                                "text-xs",
                                short
                                  ? scheduled === 0
                                    ? "text-destructive"
                                    : "text-amber light:text-[#7A5200]"
                                  : "text-muted-foreground",
                              )}
                            >
                              {scheduled}/{c.cadence} scheduled
                            </span>
                          </div>
                        </div>
                        {days.map((d) => {
                          const cell = posts
                            .filter((p) => sameDay(postDate(p)!, d))
                            .sort((a, b) => postDate(a)!.getTime() - postDate(b)!.getTime());
                          return (
                            <div key={d.toISOString()} className="group relative min-h-[76px] space-y-1 border-b border-l border-border p-1.5">
                              {cell.map((p) => (
                                <Chip key={p.id} post={p} seatName={c.name} now={ws.now} />
                              ))}
                              <button
                                onClick={() => {
                                  const date = new Date(d);
                                  date.setHours(10, 0, 0, 0);
                                  openNewPost({ seatId: c.id, date });
                                }}
                                aria-label={`New post for ${c.name} on ${d.toDateString()}`}
                                className={cn(
                                  "grid w-full place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100",
                                  cell.length === 0 ? "absolute inset-1.5" : "h-5",
                                )}
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {[
            ["Scheduled", "bg-[#22C55E]"],
            ["Awaiting approval", "bg-violet"],
            ["Changes requested", "bg-destructive"],
            ["Idea to write", "bg-amber"],
            ["Draft", "bg-muted-foreground"],
          ].map(([l, dot]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", dot)} />
              {l}
            </span>
          ))}
          <span>Each post belongs to a seat. Only approved posts count toward its weekly cadence.</span>
        </div>
      </div>
    </>
  );
}
