import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  FileText,
  Globe,
  PenLine,
  Plus,
  Sparkles,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  validateSearch: z.object({
    // Calendar is where existing content is managed: grid or chronological list.
    view: z.enum(["week", "month", "list"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Content calendar — Isla" },
      {
        name: "description",
        content: "Plan and schedule your LinkedIn posts across the week or month with Isla.",
      },
      { property: "og:title", content: "Content calendar — Isla" },
      {
        property: "og:description",
        content: "See what is scheduled, in review, ready to post or already published.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});


/* ---------------- statuses ---------------- */

type Status = "isla-review" | "your-review" | "ready" | "posted" | "missed";

const STATUS: Record<
  Status,
  { label: string; icon: LucideIcon; color: string; border: string; bg: string }
> = {
  "isla-review": {
    label: "Isla Review",
    icon: CircleDashed,
    color: "text-amber",
    border: "border-border/70",
    bg: "bg-card",
  },
  "your-review": {
    label: "Your Review",
    icon: CheckCircle2,
    color: "text-violet",
    border: "border-violet/40",
    bg: "bg-violet/5",
  },
  ready: {
    label: "Ready to post",
    icon: Globe,
    color: "text-primary",
    border: "border-primary/60",
    bg: "bg-primary/10",
  },
  posted: {
    label: "Posted",
    icon: CheckCircle2,
    color: "text-[#22C55E]",
    border: "border-[#22C55E]/50",
    bg: "bg-[#22C55E]/8",
  },
  missed: {
    label: "Missed",
    icon: XCircle,
    color: "text-destructive",
    border: "border-destructive/50",
    bg: "bg-destructive/8",
  },
};

const LEGEND: Status[] = ["isla-review", "your-review", "ready", "posted", "missed"];

type Post = { id: string; time: string; title: string; status: Status; thumb?: boolean };

/** Post templates used to fill every week with content. */
const TEMPLATES: { title: string; time: string; thumb?: boolean }[] = [
  { title: "The ICP mistake most B2B teams keep repeating", time: "08:30" },
  { title: "3 lessons from 100 demos", time: "10:00", thumb: true },
  { title: "Why most outbound fails (and what we do instead)", time: "11:30" },
  { title: "Our pipeline teardown: numbers, not vibes", time: "15:00", thumb: true },
  { title: "Hiring for GTM without burning 6 months", time: "16:00" },
  { title: "How we cut time-to-first-value from 21 days to 4", time: "09:00" },
  { title: "Content-led pipeline: what actually compounds", time: "13:00", thumb: true },
];

/** Weekdays that always carry a post — guarantees 4+ posts per week. */
const POST_DAYS = [1, 2, 4, 5];

const FUTURE_STATUS: Status[] = ["ready", "isla-review", "your-review", "ready"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Deterministic mock schedule: every week gets at least 4 posts. */
function postsFor(d: Date, today: Date): Post[] {
  const weekday = d.getDay();
  const slot = POST_DAYS.indexOf(weekday);
  if (slot === -1) return [];

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isPast = d < startOfToday;

  const seed = Math.floor(d.getTime() / 86400000);
  const base = TEMPLATES[seed % TEMPLATES.length]!;
  const count = weekday === 2 || weekday === 4 ? 2 : 1;

  return Array.from({ length: count }, (_, i) => {
    const t = TEMPLATES[(seed + i * 3) % TEMPLATES.length]!;
    const status: Status = isPast
      ? seed % 7 === 0 && i === 0
        ? "missed"
        : "posted"
      : FUTURE_STATUS[(seed + i) % FUTURE_STATUS.length]!;
    return {
      id: `${dayKey(d)}-${i}`,
      time: i === 0 ? base.time : t.time,
      title: t.title,
      status,
      thumb: t.thumb,
    };
  });
}


const WEEKDAYS_SUN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function LinkedinMark() {
  return (
    <span className="grid size-4 shrink-0 place-items-center rounded-[3px] bg-[#0A66C2] text-[7px] font-bold text-white">
      in
    </span>
  );
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const s = STATUS[post.status];
  const Icon = s.icon;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-full rounded-[6px] border px-2 py-1.5 text-left transition-colors hover:brightness-125",
        s.border,
        s.bg,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <LinkedinMark />
        <span className="text-[10px] tabular-nums text-foreground/80">{post.time}</span>
        <Icon className={cn("size-3", s.color)} />
      </div>
      <div className="mt-1 flex items-start gap-1.5">
        {post.thumb && (
          <span className="mt-0.5 size-7 shrink-0 rounded-[3px] bg-gradient-to-br from-primary/40 to-violet/40" />
        )}
        <span className="line-clamp-2 text-[10.5px] leading-snug text-foreground/90">
          {post.title}
        </span>
      </div>
    </button>
  );
}

/** Drafts have no date yet — they only exist in the list view. */
const DRAFT_ITEMS: { id: string; title: string; updated: string }[] = [
  { id: "dr1", title: "Stop measuring marketing by leads. Measure defensible pipeline.", updated: "Updated 2h ago" },
  { id: "dr2", title: "The best salespeople I hired asked me the sharpest questions.", updated: "Updated yesterday" },
  { id: "dr3", title: "I killed 40% of our roadmap. Revenue went up.", updated: "Updated 3 days ago" },
];

function CalendarPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const navigate = useNavigate();
  const { view: viewParam } = Route.useSearch();
  const view = viewParam ?? "week";
  const setView = (v: "week" | "month" | "list") =>
    navigate({ to: "/calendar", search: { view: v } });

  const [offset, setOffset] = useState(0);
  const [pathOpen, setPathOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const today = useMemo(() => new Date(), []);

  /* week view days */
  const week = useMemo(() => {
    const base = new Date(today);
    base.setDate(base.getDate() - base.getDay() + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [today, offset]);

  /* month view days */
  const month = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return {
      leading: d.getDay(),
      days: Array.from({ length: total }, (_, i) => new Date(d.getFullYear(), d.getMonth(), i + 1)),
    };
  }, [today, offset]);

  const rangeLabel = useMemo(() => {
    if (view === "month") {
      return new Date(today.getFullYear(), today.getMonth() + offset, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    const a = week[0];
    const b = week[6];
    const sameMonth = a.getMonth() === b.getMonth();
    const fmt = (d: Date, withMonth: boolean) =>
      withMonth ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : String(d.getDate());
    return `${fmt(a, true)} - ${fmt(b, !sameMonth)}, ${b.getFullYear()}`;
  }, [view, week, offset, today]);

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const openPost = (post: Post, d: Date) => {
    const at = new Date(d);
    const [h, m] = post.time.split(":").map(Number);
    at.setHours(h, m, 0, 0);
    navigate({
      to: "/post-ideas",
      search: { edit: post.title, at: at.toISOString(), from: "calendar" },
    });
  };
  const openPath = (day: number | null) => {
    setSelectedDay(day);
    setPathOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        {/* header */}
        <header className="flex flex-wrap items-center gap-4 border-b border-border/70 px-8 py-5">
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <span className="text-sm text-muted-foreground">{rangeLabel}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOffset(0)}
              className="rounded-[4px] px-1 text-sm text-foreground/80 hover:text-foreground"
            >
              Today
            </button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-[4px]"
              aria-label="Previous"
              onClick={() => setOffset((o) => o - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-[4px]"
              aria-label="Next"
              onClick={() => setOffset((o) => o + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center rounded-[8px] border border-border/70 bg-secondary p-1">
              {(["week", "month", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setView(v);
                    setOffset(0);
                  }}
                  className={cn(
                    "rounded-[6px] px-4 py-1.5 text-sm capitalize transition-colors",
                    view === v ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button size="sm" className="rounded-[8px] text-white" onClick={() => openPath(null)}>
              <Plus className="mr-1 size-4" />
              Create New Post
            </Button>
          </div>
        </header>

        {/* grid */}
        <div className="flex-1 overflow-auto">
          {view === "list" ? (
            <ListView today={today} onOpenPost={openPost} onNewPost={() => openPath(null)} />
          ) : view === "week" ? (

            <div className="grid min-h-full grid-cols-7">
              {week.map((d) => {
                const posts = postsFor(d, today);
                const active = isToday(d);
                return (
                  <div
                    key={d.toISOString()}
                    role="button"
                    tabIndex={0}
                    onClick={() => openPath(d.getDate())}
                    className={cn(
                      "flex flex-col border-r border-border/50 text-left last:border-r-0",
                      active && "bg-primary/[0.04]",
                    )}
                  >
                    <div
                      className={cn(
                        "border-b border-border/50 px-3 py-3 text-center",
                        active && "bg-primary/10",
                      )}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {WEEKDAYS_SUN[d.getDay()]}
                      </div>
                      <div
                        className={cn(
                          "mx-auto mt-1 grid size-8 place-items-center rounded-[6px] text-lg font-medium",
                          active ? "bg-primary text-white" : "text-foreground",
                        )}
                      >
                        {d.getDate()}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5 p-2">
                      {posts.map((p) => (
                        <PostCard key={p.id} post={p} onClick={() => openPost(p, d)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 border-b border-border/50">
                {WEEKDAYS_SUN.map((w) => (
                  <div
                    key={w}
                    className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: month.leading }, (_, i) => (
                  <div key={`lead-${i}`} className="min-h-[132px] border-b border-r border-border/40" />
                ))}
                {month.days.map((d) => {
                  const posts = postsFor(d, today);
                  const active = isToday(d);
                  return (
                    <div
                      key={d.toISOString()}
                      role="button"
                      tabIndex={0}
                      onClick={() => openPath(d.getDate())}
                      className={cn(
                        "group min-h-[132px] border-b border-r border-border/40 p-2 text-left align-top transition-colors hover:bg-secondary/40",
                        active && "bg-primary/[0.06]",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "grid size-6 place-items-center rounded-[6px] text-[11px] font-medium",
                            active ? "bg-primary text-white" : "text-muted-foreground",
                          )}
                        >
                          {d.getDate()}
                        </span>
                        <Plus className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {posts.map((p) => (
                          <PostCard key={p.id} post={p} onClick={() => openPost(p, d)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* legend */}
        <footer className="flex flex-wrap items-center gap-5 border-t border-border/70 px-8 py-3">
          {LEGEND.map((s) => {
            const Icon = STATUS[s].icon;
            return (
              <span key={s} className="flex items-center gap-1.5 text-xs text-foreground/80">
                <Icon className={cn("size-3.5", STATUS[s].color)} />
                {STATUS[s].label}
              </span>
            );
          })}
        </footer>
      </main>

      <Dialog open={pathOpen} onOpenChange={setPathOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>How do you want to create this post?</DialogTitle>
            <DialogDescription>
              {selectedDay ? `Planning for day ${selectedDay}.` : "Pick a starting point."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <PathOption
              icon={Sparkles}
              title="Discover a new idea"
              description="Swipe through fresh ideas Isla generated for your audience."
              onClick={() => {
                setPathOpen(false);
                navigate({ to: "/post-ideas", search: { tab: "ideas" } });
              }}
            />
            <PathOption
              icon={FileText}
              title="Use an existing draft"
              description="Continue from a draft you already started."
              onClick={() => {
                setPathOpen(false);
                setView("list");
              }}
            />

            <PathOption
              icon={PenLine}
              title="Create from scratch"
              description="Write it yourself with Isla assisting."
              onClick={() => {
                setPathOpen(false);
                navigate({ to: "/post-ideas", search: { start: "scratch" } });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PathOption({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="clickable-card-row flex w-full items-center gap-3 rounded-[10px] border border-border/70 px-4 py-3 text-left"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

/* ------------------------------ list view ------------------------------ */

/**
 * Chronological management view: drafts without a date, then everything that
 * already has one, grouped by day. This is where content that exists lives.
 */
function ListView({
  today,
  onOpenPost,
  onNewPost,
}: {
  today: Date;
  onOpenPost: (post: Post, d: Date) => void;
  onNewPost: () => void;
}) {
  const groups = useMemo(() => {
    const out: { date: Date; posts: Post[] }[] = [];
    for (let i = 0; i < 28; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const posts = postsFor(d, today);
      if (posts.length) out.push({ date: d, posts });
    }
    return out;
  }, [today]);

  const heading = (d: Date) => {
    const diff = Math.round(
      (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        86400000,
    );
    const label = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (diff === 0) return `Today · ${label}`;
    if (diff === 1) return `Tomorrow · ${label}`;
    return label;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-8">
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Drafts · no date yet
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#FFD667]/15 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#FFD667]">
              {DRAFT_ITEMS.length}
            </span>
          </h2>
          <Button variant="outline" size="sm" className="rounded-[8px]" onClick={onNewPost}>
            <Plus className="mr-1 size-3.5" />
            New
          </Button>
        </div>
        <ul className="space-y-2">
          {DRAFT_ITEMS.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() =>
                  onOpenPost(
                    { id: d.id, time: "09:00", title: d.title, status: "your-review" },
                    today,
                  )
                }
                className="clickable-card-row flex w-full items-center gap-3 rounded-[10px] border border-border/70 px-4 py-3 text-left"
              >
                <CircleDashed className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{d.title}</span>
                  <span className="block text-xs text-muted-foreground">{d.updated}</span>
                </span>
                <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Draft
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Scheduled
        </h2>
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.date.toISOString()}>
              <p className="mb-2 text-xs font-semibold text-foreground/70">{heading(g.date)}</p>
              <ul className="space-y-2">
                {g.posts.map((p) => {
                  const s = STATUS[p.status];
                  const Icon = s.icon;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => onOpenPost(p, g.date)}
                        className="clickable-card-row flex w-full items-center gap-3 rounded-[10px] border border-border/70 px-4 py-3 text-left"
                      >
                        <LinkedinMark />
                        <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">
                          {p.time}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">{p.title}</span>
                        <span
                          className={cn(
                            "flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            s.border,
                            s.bg,
                            s.color,
                          )}
                        >
                          <Icon className="size-3" />
                          {s.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
