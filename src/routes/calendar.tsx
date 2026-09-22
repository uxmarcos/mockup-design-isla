import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Clock,
  Globe,
  Lightbulb,
  Plus,
  XCircle,
  Zap,
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
import { LinkedInMark } from "@/components/LinkedInMark";
import { draftTitle, useContentStore } from "@/lib/content-requests-store";
import { CURRENT_USER } from "@/lib/current-user";
import { CALENDAR_SAMPLES } from "@/lib/post-samples";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  validateSearch: z.object({
    // Calendar is the schedule: week or month grid. Approvals live in their own screen.
    view: z.enum(["week", "month"]).optional().catch(undefined),
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
  { label: string; icon: LucideIcon; color: string; accent: string; bg: string }
> = {
  "isla-review": {
    label: "Isla Review",
    icon: CircleDashed,
    color: "text-amber",
    accent: "border-l-amber",
    bg: "bg-card",
  },
  "your-review": {
    label: "Your Review",
    icon: CheckCircle2,
    color: "text-violet",
    accent: "border-l-violet",
    bg: "bg-violet/5",
  },
  ready: {
    label: "Ready to post",
    icon: Globe,
    color: "text-primary",
    accent: "border-l-primary",
    bg: "bg-primary/10",
  },
  posted: {
    label: "Posted",
    icon: CheckCircle2,
    color: "text-[#22C55E]",
    accent: "border-l-[#22C55E]",
    bg: "bg-[#22C55E]/8",
  },
  missed: {
    label: "Missed",
    icon: XCircle,
    color: "text-destructive",
    accent: "border-l-destructive",
    bg: "bg-destructive/8",
  },
};

// The calendar only holds posts the user already approved.
const LEGEND: Status[] = ["ready", "posted", "missed"];

type Post = {
  id: string;
  time: string;
  title: string;
  status: Status;
  image?: string;
  body?: string;
};

/** Post templates used to fill every week with content (full-length sample posts). */
const TEMPLATES = CALENDAR_SAMPLES.map((p) => ({
  time: p.time,
  image: p.image,
  body: p.body,
  title: p.body.split("\n")[0]!.replace(/\.$/, ""),
}));

/** Weekdays that always carry a post — guarantees 4+ posts per week. */
const POST_DAYS = [1, 2, 4, 5];

const FUTURE_STATUS: Status[] = ["ready"];

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
      image: t.image,
      body: t.body,
    };
  });
}


const WEEKDAYS_SUN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const s = STATUS[post.status];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-full rounded-lg border border-border/40 border-l-[2.5px] p-2 text-left transition-colors hover:brightness-110",
        s.accent,
        s.bg,
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <LinkedInMark className="size-[12.8px]" />
          <span className="text-[10px] font-semibold tabular-nums text-foreground/80">{post.time}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[8px] font-semibold text-foreground/70">
          <Zap className="size-2.5" />
          AUTO
          <Clock className="size-2.5" />
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-foreground/90">{post.title}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-neutral-700 text-[7px] font-bold text-white">
          {CURRENT_USER.initials}
        </span>
        <span className="truncate text-[10px] text-foreground/70">{CURRENT_USER.name}</span>
      </div>
    </button>
  );
}

function CalendarPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const navigate = useNavigate();
  const { view: viewParam } = Route.useSearch();
  const view = viewParam ?? "week";
  const setView = (v: "week" | "month") =>
    navigate({ to: "/calendar", search: { view: v } });

  const [offset, setOffset] = useState(0);
  const [pathOpen, setPathOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const today = useMemo(() => new Date(), []);

  const { drafts } = useContentStore();
  const awaiting = useMemo(() => drafts.filter((d) => d.status === "awaiting"), [drafts]);

  /** Mock schedule plus the drafts the user approved — nothing that still needs approval shows up here. */
  const dayPosts = (d: Date): Post[] => {
    const extra: Post[] = drafts.flatMap((dr) => {
      if (dr.status !== "approved" || !dr.scheduledAt) return [];
      const when = new Date(dr.scheduledAt);
      if (when.toDateString() !== d.toDateString()) return [];
      const time = `${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`;
      return [
        {
          id: `td-${dr.id}`,
          time,
          title: draftTitle(dr),
          status: "ready",
          image: dr.image,
          body: dr.body,
        } satisfies Post,
      ];
    });
    return [...postsFor(d, today), ...extra].sort((a, b) => a.time.localeCompare(b.time));
  };

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
      search: {
        edit: post.body ?? post.title,
        at: at.toISOString(),
        from: "calendar",
        ...(post.image ? { img: post.image } : {}),
      },
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
              {(["week", "month"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setView(v);
                    setOffset(0);
                  }}
                  className={cn(
                    "flex items-center rounded-[6px] px-4 py-1.5 text-sm capitalize transition-colors",
                    view === v ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button size="sm" className=" text-white" onClick={() => openPath(null)}>
              <Plus className="mr-1 size-4" />
              Create New Post
            </Button>
          </div>
        </header>

        {/* grid */}
        <div className="flex-1 overflow-auto">
          {view === "week" ? (

            <div className="grid min-h-full grid-cols-7">
              {week.map((d) => {
                const posts = dayPosts(d);
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
                  const posts = dayPosts(d);
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
            <DialogTitle>What would you like to do?</DialogTitle>
            <DialogDescription>
              {selectedDay
                ? `Planning for day ${selectedDay}.`
                : "Isla's team writes your posts — pick where to start."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <PathOption
              icon={Lightbulb}
              title="Select a post idea"
              description="Choose an idea and it will be sent to our team, who turn it into a real post for you."
              onClick={() => {
                setPathOpen(false);
                navigate({ to: "/post-ideas", search: { tab: "ideas" } });
              }}
            />
            <PathOption
              icon={ClipboardCheck}
              title="Review & approve drafts"
              description="See the drafts our team already prepared and approve the ones that are ready."
              badge={awaiting.length > 0 ? `${awaiting.length} waiting` : undefined}
              onClick={() => {
                setPathOpen(false);
                navigate({ to: "/approvals" });
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
  badge,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
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
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      {badge && (
        <span className="shrink-0 rounded-full bg-[#FFD667]/15 px-2 py-0.5 text-[11px] font-semibold text-[#FFD667] light:bg-[#B7791F]/15 light:text-[#7A5200]">
          {badge}
        </span>
      )}
    </button>
  );
}
