import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkedInMark } from "@/components/LinkedInMark";
import { postTitle, seatOf, type TeamDraft } from "@/lib/content-requests-store";
import { addDays, sameDay, startOfWeek, type SeatAccount } from "@/lib/operator-data";
import { inWeek, postDate, scheduledInWeek, useOperatorWorkspace } from "@/lib/operator-store";
import { OLink, useNewPost } from "@/components/operator/nav";
import { PageHeader, statusKey, WorkspaceLogo } from "@/components/operator/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ops/calendar")({
  component: CalendarPage,
});

function hhmm(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Matches the card colors from the real Isla calendar: blue = ready to post, purple = under review. */
const CARD_STATUS: Record<ReturnType<typeof statusKey>, { accent: string; bg: string }> = {
  draft: { accent: "border-l-border", bg: "bg-card" },
  writing: { accent: "border-l-amber", bg: "bg-amber/10" },
  awaiting: { accent: "border-l-violet", bg: "bg-violet/10" },
  changes: { accent: "border-l-destructive", bg: "bg-destructive/10" },
  approved: { accent: "border-l-primary", bg: "bg-primary/10" },
  posted: { accent: "border-l-[#22C55E]", bg: "bg-[#22C55E]/10" },
};

/** The seat is already implied by the column, so the card only needs the post itself. */
function Chip({ post, seat, now }: { post: TeamDraft; seat: SeatAccount; now: Date }) {
  const s = CARD_STATUS[statusKey(post, now)];
  const d = postDate(post)!;
  return (
    <OLink
      to="/ops/posts/$postId"
      params={{ postId: post.id }}
      search={{ from: "calendar" }}
      title={`${seat.name} · ${postTitle(post)}`}
      className={cn(
        "block rounded-lg border border-border/40 border-l-[2.5px] p-2 text-left transition-colors hover:brightness-110",
        s.accent,
        s.bg,
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <LinkedInMark className="size-[12.8px]" />
          <span className="text-[10px] font-semibold tabular-nums text-foreground/80">{hhmm(d)}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[8px] font-semibold text-foreground/70">
          <Zap className="size-2.5" />
          AUTO
          <Clock className="size-2.5" />
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-foreground/90">{postTitle(post)}</p>
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
          <div className="grid min-w-[1160px] grid-cols-[210px_repeat(7,minmax(148px,1fr))]">
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
                              to="/ops/clients/$workspaceId"
                              params={{ workspaceId: c.workspace.id }}
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
                          // A seat only ever has one post scheduled per day.
                          const post = posts.find((p) => sameDay(postDate(p)!, d));
                          return (
                            <div key={d.toISOString()} className="group relative min-h-[80px] border-b border-l border-border p-1.5">
                              {post ? (
                                <Chip post={post} seat={c} now={ws.now} />
                              ) : (
                                <button
                                  onClick={() => {
                                    const date = new Date(d);
                                    date.setHours(10, 0, 0, 0);
                                    openNewPost({ seatId: c.id, date });
                                  }}
                                  aria-label={`New post for ${c.name} on ${d.toDateString()}`}
                                  className="absolute inset-1.5 grid place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              )}
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
            ["Ready to post", "bg-primary"],
            ["Under review", "bg-violet"],
            ["Changes requested", "bg-destructive"],
            ["Idea to write", "bg-amber"],
            ["Posted", "bg-[#22C55E]"],
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
