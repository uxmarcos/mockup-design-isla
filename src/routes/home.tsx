import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  UserCheck,
  MessageCircleReply,
  MessageSquare,
  Sparkles,
  FileCheck2,
  ArrowRight,
  Check,
  Users,
  Upload,
  Linkedin,
  Settings,
  PenSquare,
  FileText,
  PenLine,
  Flame,
  Send,
  CalendarClock,
  ExternalLink,
  Lock,
  Download,
  PartyPopper,
  X,
  Play,
} from "lucide-react";
import { extractHandle, isLinkedinProfileUrl } from "@/components/settings/shell";
import { BrandDnaModal } from "@/components/brain/BrandDnaModal";

import {
  loadSettings,
  saveSettings,
  type MonitoredProfile,
  type SettingsData,
} from "@/lib/settings-store";



import { Button } from "@/components/ui/button";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  loadOnboarding,
  loadUser,
  saveOnboarding,
  makeInitialTasks,
  isTaskUnlocked,
  isCoreSetupComplete,
  isWorkspaceSetupComplete,
  areAllMissionsComplete,
  completeSetupMission,
  SETTINGS_SUBTASKS_DEFAULT,
  BRAIN_SUBTASK_KEYS,
  getBrainSubtasks,

  type HomeTask,
  type TaskType,
  type OnboardingData,
} from "@/lib/onboarding-store";

import { ACTIVITY_LOG, formatRelative } from "@/lib/activity-data";
import { LeadInline, LeadPreviewProvider } from "@/components/LeadPreviewSheet";
import islaLogo from "@/assets/isla-ai-icon.svg";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Isla" },
      { name: "description", content: "Today's tasks and workspace activity." },
    ],
  }),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const ICON_FOR: Record<TaskType, typeof CheckCircle2> = {
  view_crm: Users,
  import_connections: Upload,
  connect_linkedin: Linkedin,
  settings: Settings,
  first_post: PenSquare,
  approve_outreach: UserCheck,
  follow_up: MessageCircleReply,
  comment_posts: MessageSquare,
  generate_content: Sparkles,
  review_content: FileCheck2,
};
const iconFor = (type: TaskType) => ICON_FOR[type] ?? CheckCircle2;

type DailyTask = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  destination: string;
  count?: number;
  icon: typeof CheckCircle2;
  visible: boolean;
};

// Prototype daily-task predicates — flip a flag to hide any card.
function getDailyTasks(): DailyTask[] {
  return [
    {
      id: "daily-comment",
      title: "Comment on today's ICP posts",
      description: "It helps to warm up leads and to bring new prospects.",
      ctaLabel: "Write comments",
      destination: "/outreach",
      count: 7,
      icon: MessageSquare,
      visible: true,
    },
    {
      id: "daily-review-draft",
      title: "Review content draft",
      description: "You have a post waiting for your approval.",
      ctaLabel: "Review",
      destination: "/post-ideas?tab=drafts",
      count: 1,
      icon: FileCheck2,
      visible: true,
    },
    {
      id: "daily-approve-scheduled",
      title: "Approve a scheduled post",
      description: "Review it before it goes live.",
      ctaLabel: "Approve",
      destination: "/post-ideas?tab=drafts",
      icon: CalendarClock,
      visible: true,
    },
    {
      id: "daily-hot-leads",
      title: "Check your hottest leads",
      description: "See the prospects showing the strongest buying signals.",
      ctaLabel: "Open Kanban",
      destination: "/kanban",
      count: 4,
      icon: Flame,
      visible: true,
    },
    {
      id: "daily-outreach",
      title: "Write outreach messages",
      description: "Write the message for today's recommended prospects.",
      ctaLabel: "Review",
      destination: "/kanban",
      count: 5,
      icon: Send,
      visible: true,
    },
    {
      id: "daily-ideas",
      title: "Check content ideas",
      description: "Swipe through new ideas picked for you.",
      ctaLabel: "Review ideas",
      destination: "/post-ideas",
      icon: Sparkles,
      visible: true,
    },
  ].filter((t) => t.visible);
}

const EMPTY_DATA: OnboardingData = {
  state: "waiting_linkedin",
  icp: [],
  messages: [],
  tasks: [],
};

function HomePage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useSidebarState();
  // Keep the first render deterministic (localStorage is client-only).
  const [data, setData] = useState<OnboardingData>(EMPTY_DATA);
  const [user, setUser] = useState(() => loadUser());
  const [firstVisit, setFirstVisit] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [completedDaily, setCompletedDaily] = useState<Set<string>>(new Set());
  const [csvOpen, setCsvOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [linkedinOpen, setLinkedinOpen] = useState(false);
  const [celebrateOpen, setCelebrateOpen] = useState(false);
  const [firstPostOpen, setFirstPostOpen] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    const loaded = loadOnboarding();
    setFirstVisit(!loaded.homeVisited);
    const fresh = makeInitialTasks();
    const byId = new Map<string, HomeTask>(fresh.map((t) => [t.id, t]));
    // Migrate: if any legacy task IDs exist, replace whole set with fresh.
    const looksLegacy =
      loaded.tasks.length !== fresh.length || loaded.tasks.some((t) => !byId.has(t.id));
    let tasks = (looksLegacy ? fresh : loaded.tasks).map((t) => {
      const template = byId.get(t.id);
      // Keep copy/order/destination in sync with the current template.
      return template ? { ...t, ...template, status: t.status, completedAt: t.completedAt } : t;
    });

    // Auto-complete "Check your CRM" once user visited /kanban
    if (loaded.crmVisited) {
      tasks = tasks.map((t) =>
        t.id === "task-view-crm" && t.status !== "completed"
          ? { ...t, status: "completed", completedAt: Date.now() }
          : t,
      );
    }
    if (loaded.linkedinConnected) {
      tasks = tasks.map((t) =>
        t.id === "task-connect-linkedin" && t.status !== "completed"
          ? { ...t, status: "completed", completedAt: Date.now() }
          : t,
      );
    }
    // Auto-complete "Upload connections" if flag set
    if (loaded.connectionsUploaded) {
      tasks = tasks.map((t) =>
        t.id === "task-import-connections" && t.status !== "completed"
          ? { ...t, status: "completed", completedAt: Date.now() }
          : t,
      );
    }

    // Auto-complete "Complete your settings" when all 3 subtasks done
    const subs = loaded.settingsSubtasks;
    if (subs && BRAIN_SUBTASK_KEYS.every((k) => getBrainSubtasks(loaded)[k])) {
      tasks = tasks.map((t) =>
        t.id === "task-settings" && t.status !== "completed"

          ? { ...t, status: "completed", completedAt: Date.now() }
          : t,
      );
    }

    const next = { ...loaded, tasks, homeVisited: true };
    saveOnboarding(next);
    setData(next);
    setHydrated(true);
  }, []);


  useEffect(() => {
    if (!user.onboardingCompleted && data.state !== "finished") {
      navigate({ to: "/onboarding" });
    }
  }, [user, data.state, navigate]);

  // Deep link: /home?open=linkedin opens the connect dialog directly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("open") === "linkedin") {
      setLinkedinOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const updateTask = (id: string, patch: Partial<HomeTask>) => {

    setData((d) => {
      const next = { ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) };
      saveOnboarding(next);
      return next;
    });
  };

  const startFirstPost = (target: string) => {
    setFirstPostOpen(false);
    completeTask("task-first-post", {});
    toast.success("Setup complete", {
      description: "Your Home is fully unlocked.",
    });
    window.location.href = target;
  };

  const openDestination = (destination: string) => {
    if (destination === "csv-upload") {
      setCsvOpen(true);
      return;
    }
    if (destination === "linkedin-connect") {
      setLinkedinOpen(true);
      return;
    }
    if (destination === "settings-dialog") {
      setSettingsOpen(true);
      return;
    }
    if (destination === "first-post-dialog") {
      setFirstPostOpen(true);
      return;
    }
    if (/^https?:\/\//i.test(destination)) {
      window.open(destination, "_blank", "noopener,noreferrer");
      return;
    }
    const [path, qs] = destination.split("?");
    const knownRoutes = [
      "/post-ideas",
      "/outreach",
      "/report",
      "/kanban",
      "/inbox",
      "/create-content",
      "/analytics",
      "/settings",
    ];
    if (knownRoutes.includes(path)) {
      if (qs) window.location.href = destination;
      else navigate({ to: path });
    } else {
      toast(`Opening ${destination}`, { description: "Prototype flow." });
    }
  };

  const handleTaskClick = (t: HomeTask) => {
    if (t.status === "completed") return;
    // Creating the first post is the last setup step: opening the ideas deck
    // completes it and unlocks the rest of Home.
    if (t.type === "first_post") {
      setFirstPostOpen(true);
      return;
    }
    updateTask(t.id, { status: "in_progress" });
    openDestination(t.destination);
  };

  const completeTask = (id: string, flags: Partial<OnboardingData>) => {
    const loaded = loadOnboarding();
    const next: OnboardingData = {
      ...loaded,
      ...flags,
      tasks: loaded.tasks.map((t) =>
        t.id === id ? { ...t, status: "completed" as const, completedAt: Date.now() } : t,
      ),
    };
    saveOnboarding(next);
    setData(next);
    if (isCoreSetupComplete(next) && !next.onboardingCelebrated) setCelebrateOpen(true);
  };

  const handleCsvUploaded = () => {
    completeTask("task-import-connections", { connectionsUploaded: true });
    setCsvOpen(false);
    toast.success("Connections uploaded", {
      description:
        "We're matching your network against your ICP. Your Lead Board can take up to 24 hours to be fully updated.",
    });
  };


  const handleLinkedinConnected = () => {
    completeTask("task-connect-linkedin", { linkedinConnected: true });
    setLinkedinOpen(false);
    toast.success("LinkedIn connected", {
      description: "Isla can now engage with leads and track replies.",
    });
  };

  const dismissCelebration = () => {
    const loaded = loadOnboarding();
    const next = { ...loaded, onboardingCelebrated: true };
    saveOnboarding(next);
    setData(next);
    setCelebrateOpen(false);
  };

  const onboardingTasks = useMemo(
    () => data.tasks.slice().sort((a, b) => a.priority - b.priority),
    [data.tasks],
  );
  const onbTotal = onboardingTasks.length;
  const onbDone = onboardingTasks.filter((t) => t.status === "completed").length;
  const setupComplete = hydrated && isCoreSetupComplete(data);
  // Today's tasks and Recent activity stay locked until the workspace setup
  // mission is fully completed (last step: viewing the Brand DNA).
  const workspaceReady =
    setupComplete && isWorkspaceSetupComplete(data) && areAllMissionsComplete(data);

  const currentTask = onboardingTasks.find((t) => t.status !== "completed");

  const dailyTasks = useMemo(() => getDailyTasks(), []);
  const dailyTotal = dailyTasks.length;
  const dailyRemaining = dailyTasks.filter((t) => !completedDaily.has(t.id)).length;
  const dailyDone = dailyTotal - dailyRemaining;
  const dailyPct = dailyTotal > 0 ? Math.round((dailyDone / dailyTotal) * 100) : 100;


  return (
    <LeadPreviewProvider>
    <div className="flex min-h-screen bg-background text-foreground surface-soft">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="mx-auto max-w-6xl px-8 py-16">
          <header className="mb-14">
            <h1 className="text-3xl font-semibold tracking-tight">
              {!hydrated || firstVisit
                ? `Welcome, ${user.displayName}`
                : `${greeting()}, ${user.displayName.split(" ")[0]}.`}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {!hydrated || firstVisit
                ? "Here's what's going on with your workspace today."
                : "Here's what needs your attention today."}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_280px]">
            {/* LEFT — actions */}
            <div className="space-y-10">
              {/* Setup — priority */}
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      {setupComplete ? "Finish your workspace" : "Let's get you set up"}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {setupComplete
                        ? "Optional steps to sharpen Isla's recommendations."
                        : "One step at a time — the next step unlocks when you finish this one."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {onbDone} / {onbTotal}
                    </span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-[#00BFFF] transition-all"
                        style={{
                          width: `${onbTotal > 0 ? Math.round((onbDone / onbTotal) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <ul className="card-soft overflow-hidden rounded-xl border border-border/70 bg-card/40">
                  {onboardingTasks.map((t) => {
                    const unlocked = !hydrated || isTaskUnlocked(data.tasks, t.id);
                    return (
                      <TaskRow
                        key={t.id}
                        icon={iconFor(t.type)}
                        title={t.title}
                        description={t.description}
                        ctaLabel={t.ctaLabel}
                        done={t.status === "completed"}
                        inProgress={t.status === "in_progress"}
                        locked={!unlocked}
                        lockedHint={`Finish the step above to unlock this.`}
                        isCurrent={hydrated && currentTask?.id === t.id}
                        showCta={
                          !hydrated ||
                          currentTask?.id === t.id ||
                          t.status === "completed"
                        }
                        onToggle={() =>
                          updateTask(t.id, {
                            status: t.status === "completed" ? "pending" : "completed",
                          })
                        }
                        onCta={() => {
                          if (t.status === "completed") {
                            updateTask(t.id, { status: "in_progress" });
                          } else {
                            handleTaskClick(t);
                          }
                        }}
                        // The whole row opens the same flow as the CTA.
                        onRowClick={() => handleTaskClick(t)}
                        reopenLabel={t.status === "completed" ? "Reopen" : undefined}
                      />

                    );
                  })}
                </ul>
              </section>

              {/* Daily tasks — locked until the workspace setup mission is complete */}
              {workspaceReady ? (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Today's tasks
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dailyRemaining > 0
                        ? `${dailyRemaining} action${dailyRemaining === 1 ? "" : "s"} ready`
                        : "All caught up for today."}
                    </p>
                  </div>
                  {dailyTotal > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {dailyDone} / {dailyTotal}
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-[#00BFFF] transition-all"
                          style={{ width: `${dailyPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {dailyTotal === 0 ? (
                  <div className="card-soft rounded-xl border border-border/70 bg-card/40 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">You're all caught up</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      We'll add new tasks when something needs your attention.
                    </p>
                  </div>
                ) : (
                  <ul className="card-soft overflow-hidden rounded-xl border border-border/70 bg-card/40">
                    {dailyTasks.map((t) => {
                      const done = completedDaily.has(t.id);
                      return (
                        <TaskRow
                          key={t.id}
                          icon={t.icon}
                          title={t.title}
                          description={t.description}
                          ctaLabel={t.ctaLabel}
                          count={t.count}
                          done={done}
                          onToggle={() =>
                            setCompletedDaily((s) => {
                              const n = new Set(s);
                              if (n.has(t.id)) n.delete(t.id);
                              else n.add(t.id);
                              return n;
                            })
                          }
                          onCta={() => openDestination(t.destination)}
                        />
                      );
                    })}
                  </ul>
                )}
              </section>
              ) : null}
            </div>

            {/* RIGHT — activity once set up, contextual Isla chat during setup */}
            <aside>
              {workspaceReady ? (
                <>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Recent activity
                    </h2>
                    <Link
                      to="/activity"
                      className="text-[11px] font-medium text-[#00BFFF] hover:underline"
                    >
                      See all
                    </Link>
                  </div>
                  <ul className="card-soft divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
                    {ACTIVITY_LOG.slice(0, 6).map((a) => (
                      <li key={a.id} className="px-4 py-3">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                          {formatRelative(a.minutesAgo)}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-foreground/85">
                          <ActivityBody item={a} />
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <IslaSetupChat
                  currentTask={currentTask}
                  step={onbDone + 1}
                  total={onbTotal}
                />
              )}
            </aside>


          </div>
        </div>
      </main>

      <CsvUploadDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        onUploaded={handleCsvUploaded}
      />

      <LinkedinConnectDialog
        open={linkedinOpen}
        onOpenChange={setLinkedinOpen}
        onConnected={handleLinkedinConnected}
      />

      <FirstPostDialog
        open={firstPostOpen}
        onOpenChange={setFirstPostOpen}
        onPick={startFirstPost}
      />

      <SetupCompleteDialog open={celebrateOpen} onClose={dismissCelebration} />


      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        subtasks={data.settingsSubtasks ?? SETTINGS_SUBTASKS_DEFAULT}
        onChange={(patch) => {
          setData((d) => {
            const current = d.settingsSubtasks ?? SETTINGS_SUBTASKS_DEFAULT;
            const nextSubs = { ...current, ...patch };
            const allDone = BRAIN_SUBTASK_KEYS.every((k) => nextSubs[k]);

            const next: OnboardingData = {
              ...d,
              settingsSubtasks: nextSubs,
              tasks: d.tasks.map((t) =>
                t.id === "task-settings"
                  ? {
                      ...t,
                      status: allDone
                        ? ("completed" as const)
                        : ("in_progress" as const),
                      completedAt: allDone ? Date.now() : undefined,
                    }
                  : t,
              ),
            };
            saveOnboarding(next);
            if (allDone) {
              toast.success("Settings completed", {
                description: "Nice — Isla will use this to sharpen recommendations.",
              });
            }
            return next;
          });
        }}
        onFinish={() => setData(completeSetupMission())}
      />

    </div>
    </LeadPreviewProvider>
  );
}

function FirstPostDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (target: string) => void;
}) {
  const options = [
    {
      icon: Sparkles,
      title: "Discover a new idea",
      description: "Swipe through fresh ideas Isla generated for your audience.",
      target: "/post-ideas",
    },
    {
      icon: FileText,
      title: "Use an existing draft",
      description: "Continue from a draft you already started.",
      target: "/post-ideas?tab=drafts",
    },
    {
      icon: PenLine,
      title: "Create from scratch",
      description: "Write it yourself with Isla assisting.",
      target: "/post-ideas?start=scratch",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>How do you want to start your first post?</DialogTitle>
          <DialogDescription>Pick a starting point.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {options.map((o) => (
            <button
              key={o.title}
              type="button"
              onClick={() => onPick(o.target)}
              className="clickable-card flex w-full items-center gap-4 rounded-xl border border-border/70 bg-card/40 p-4 text-left"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#00BFFF]/12 text-[#00BFFF]">
                <o.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{o.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {o.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskRow(props: {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  ctaLabel: string;
  count?: number;
  done: boolean;
  inProgress?: boolean;
  locked?: boolean;
  lockedHint?: string;
  isCurrent?: boolean;
  showCta?: boolean;
  reopenLabel?: string;
  onToggle: () => void;
  onCta: () => void;
  /** Makes the whole row open the same flow as the CTA. */
  onRowClick?: () => void;
}) {
  const Icon = props.icon;
  const locked = !!props.locked;
  const rowClickable = !!props.onRowClick && !locked && !props.done;

  return (
    <li
      role={rowClickable ? "button" : undefined}
      tabIndex={rowClickable ? 0 : undefined}
      onClick={rowClickable ? props.onRowClick : undefined}
      onKeyDown={
        rowClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.onRowClick?.();
              }
            }
          : undefined
      }
      aria-disabled={locked ? true : undefined}
      className={cn(
        "group flex items-center gap-4 px-5 py-4 first:rounded-t-xl last:rounded-b-xl border-b border-border/60 last:border-b-0",
        // Hierarchy: current = strongest, upcoming = medium, completed = muted.
        props.isCurrent && !locked && !props.done
          ? "bg-primary/[0.06]"
          : props.done
            ? "opacity-80"
            : "",
        locked
          ? "pointer-events-none select-none opacity-50"
          : "clickable-card-row",
        rowClickable && "cursor-pointer",
      )}

    >
      {locked ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50">
          <Lock className="size-2.5 text-muted-foreground" />
        </span>
      ) : (
        <button
          type="button"
          aria-label={props.done ? "Mark as pending" : "Mark as done"}
          onClick={(e) => {
            e.stopPropagation();
            props.onToggle();
          }}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            props.done
              ? "border-[#00BFFF] bg-[#00BFFF] text-white"
              : props.isCurrent
                ? "border-[#00BFFF] hover:bg-[#00BFFF]/10"
                : "border-muted-foreground/50 hover:border-[#00BFFF]",
          )}
        >
          {props.done && <Check className="size-3" strokeWidth={3} />}
        </button>
      )}

      <Icon
        className={cn(
          "size-4 shrink-0",
          props.isCurrent && !locked && !props.done
            ? "text-[#00BFFF]"
            : props.done
              ? "text-muted-foreground/70"
              : "text-muted-foreground",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm leading-5",
              props.done
                ? "font-medium text-muted-foreground line-through"
                : props.isCurrent && !locked
                  ? "font-semibold text-foreground"
                  : "font-semibold text-foreground/80",
            )}
          >
            {props.title}
          </span>
          {props.isCurrent && !locked && !props.done && (
            <span className="rounded-full bg-[#00BFFF]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25px] leading-[15px] text-[#0284a8] dark:text-[#00bfff]">
              Next step
            </span>
          )}
          {locked && (
            <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25px] leading-[15px] text-muted-foreground">
              Locked
            </span>
          )}
          {props.inProgress && !locked && !props.isCurrent && (
            <span className="rounded-full bg-[#00BFFF]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25px] leading-[15px] text-[#0284a8] dark:text-[#00bfff]">
              In progress
            </span>
          )}
          {typeof props.count === "number" && !props.done && !locked && (
            <span className="rounded-full bg-[#00BFFF]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#0284a8] dark:text-[#00bfff]">
              {props.count}
            </span>
          )}
        </div>

        <p
          className={cn(
            "mt-0.5 text-xs font-normal leading-4",
            props.done
              ? "text-muted-foreground/80 line-through"
              : props.isCurrent && !locked
                ? "text-foreground/70"
                : "text-muted-foreground",
          )}
        >
          {locked ? (props.lockedHint ?? props.description) : props.description}
        </p>
      </div>

      {!locked && props.showCta !== false && (
        <Button
          size="sm"
          className={cn(
            "shrink-0 rounded-[10px] px-2 py-1.5 text-xs font-semibold min-w-[64px]",
            props.isCurrent && !props.done
              ? "bg-[#00BFFF] text-white hover:bg-[#00BFFF]/90"
              : "bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground",
          )}
          onClick={(e) => {
            e.stopPropagation();
            props.onCta();
          }}
        >
          {props.reopenLabel ?? props.ctaLabel}
          <ArrowRight className="ml-1 size-3" />
        </Button>
      )}

    </li>
  );
}

const STEP_CONTEXT: Record<string, string> = {
  "task-view-crm":
    "Start in your Lead Board. I already found people who engaged with your content — take a look at who's there.",
  "task-connect-linkedin":
    "Now connect your LinkedIn account. That's what lets me engage with those leads and track their replies for you.",
  "task-import-connections":
    "Last step: bring in your LinkedIn connections. You download the file from LinkedIn, then upload it here — I'll show you how.",
  "task-settings":
    "Optional, but useful: tell me which competitors and creators to watch so my suggestions get sharper.",
  "task-first-post":
    "Ready to publish? I'll turn your ideas into a first LinkedIn post together with you.",
};

function IslaSetupChat({
  currentTask,
  step,
  total,
}: {
  currentTask?: HomeTask;
  step: number;
  total: number;
}) {
  return (
    <div className="card-soft rounded-xl border border-border/70 bg-card/40 p-5">
      <div className="flex items-center gap-2.5">
        <img src={islaLogo} alt="" className="size-7 rounded-md" />
        <div>
          <p className="text-sm font-semibold leading-none">Isla</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            Setting up your workspace
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-xs leading-relaxed text-foreground/85">
        <p>
          Welcome. Instead of showing you everything at once, I'll walk you through one step
          at a time.
        </p>
        {currentTask ? (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Task {Math.min(step, total)} of {total}
            </p>
            <p>{STEP_CONTEXT[currentTask.id] ?? currentTask.description}</p>
          </>
        ) : (
          <p>Everything's set. Ask me anything whenever you need a hand.</p>
        )}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        The rest of your workspace unlocks once these steps are done.
      </p>
    </div>
  );
}

function LinkedinConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConnected: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "verifying" | "connected">("idle");

  useEffect(() => {
    if (open) setPhase("idle");
  }, [open]);

  const connect = () => {
    setPhase("verifying");
    window.setTimeout(() => setPhase("connected"), 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect your LinkedIn</DialogTitle>
          <DialogDescription>
            Isla reads your profile and activity to personalize your workspace, then engages
            leads and tracks replies for you.
          </DialogDescription>
        </DialogHeader>

        {/* Why → How → Connect */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Need help? Watch the tutorial below.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The video walks you through the connection process step by step.
          </p>
        </div>

        {/* Video placeholder — swap the inner content for the real player later. */}
        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/30">
          <div className="flex aspect-video w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,191,255,0.12),transparent_70%)]">
            <button
              type="button"
              aria-label="Play tutorial video"
              className="grid size-14 place-items-center rounded-full bg-[#00BFFF] text-white transition-transform hover:scale-105"
            >
              <Play className="size-6 translate-x-[1px]" fill="currentColor" />
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5">
            <span className="text-xs font-medium text-foreground">
              How to connect your LinkedIn
            </span>
            <span className="text-[11px] text-muted-foreground">Video coming soon</span>
          </div>
        </div>

        {/* Connection status stays visible so you never have to guess. */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
            phase === "connected"
              ? "border-emerald-500/40 bg-emerald-500/[0.08]"
              : "border-border/70 bg-muted/40",
          )}
        >
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              phase === "connected"
                ? "bg-emerald-500"
                : phase === "verifying"
                  ? "animate-pulse bg-amber-500"
                  : "bg-muted-foreground/50",
            )}
          />
          <p className="text-xs font-semibold">
            {phase === "connected"
              ? "Connected — Isla can act on your account now."
              : phase === "verifying"
                ? "Verifying your connection..."
                : "Not connected yet."}
          </p>
        </div>

        <DialogFooter>
          {phase === "connected" ? (
            <Button className="w-full text-white sm:w-auto" onClick={onConnected}>
              <Check className="mr-1.5 size-4" strokeWidth={3} />
              Done
            </Button>
          ) : (
            <Button
              className="w-full text-white sm:w-auto"
              disabled={phase === "verifying"}
              onClick={connect}
            >
              <Linkedin className="mr-1.5 size-4" />
              {phase === "verifying" ? "Connecting..." : "Connect LinkedIn"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function SetupCompleteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2.5">
            <img src={islaLogo} alt="" className="size-9 rounded-lg" />
            <PartyPopper className="size-4 text-[#00BFFF]" />
          </div>
          <DialogTitle>Your workspace is ready</DialogTitle>
          <DialogDescription>
            Setup is done — everything is unlocked now.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs leading-relaxed text-foreground/85">
          <p>
            I'm Isla, your content and pipeline strategist. From here I'll build your daily
            tasks: who to engage, what to post and which leads are heating up.
          </p>
          <p className="text-muted-foreground">
            If you ever have a question, just ask me here.
          </p>
        </div>
        <DialogFooter>
          <Button className="text-white" onClick={onClose}>
            Start using Isla
            <ArrowRight className="ml-1 size-3" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function ActivityBody({ item }: { item: (typeof ACTIVITY_LOG)[number] }) {
  const renderPostTitle = (text: string) => {
    if (!item.postUrl || !item.postTitle) return text;
    const [b, a = ""] = text.split(`"${item.postTitle}"`);
    return (
      <>
        {b}
        <a
          href={item.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00BFFF] hover:underline"
        >
          "{item.postTitle}"
        </a>
        {a}
      </>
    );
  };

  if (!item.personName) {
    return <>{renderPostTitle(item.summary)}</>;
  }

  const idx = item.summary.indexOf(item.personName);
  if (idx === -1) return <>{renderPostTitle(item.summary)}</>;
  const before = item.summary.slice(0, idx);
  const after = item.summary.slice(idx + item.personName.length);

  return (
    <>
      {before}
      <LeadInline name={item.personName} avatarUrl={item.avatarUrl} />
      {renderPostTitle(after)}
    </>
  );
}

function CsvUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<"idle" | "uploading" | "done">("idle");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (open) {
      setPhase("idle");
      setFileName("");
      setDragOver(false);
    }
  }, [open]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const csv = Array.from(files).find((f) => /\.csv$/i.test(f.name));
    if (!csv) {
      toast.error("Please upload the Connections.csv file.");
      return;
    }
    setFileName(csv.name);
    setPhase("uploading");
    window.setTimeout(() => setPhase("done"), 1600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload your LinkedIn connections</DialogTitle>
          <DialogDescription>
            Connecting LinkedIn doesn't give Isla access to your connections, LinkedIn keeps them
            private. Exporting is the only way to bring your network in.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
              1
            </span>
            <p className="text-sm font-semibold">Request your data on LinkedIn</p>
          </div>
          <button
            type="button"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/mypreferences/d/download-my-data",
                "_blank",
                "noopener,noreferrer",
              )
            }
            className="ml-[34px] inline-flex items-center gap-1.5 text-sm font-semibold text-[#00BFFF] transition-opacity hover:opacity-80"
          >
            Open LinkedIn data export
            <ExternalLink className="size-3.5" />
          </button>
        </div>

        {/* Step 2 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
              2
            </span>
            <p className="text-sm font-semibold">Upload the Connections.csv</p>
          </div>
          <p className="ml-[34px] text-xs text-muted-foreground">
            Find the Connections.csv inside the archive and drop it here.
          </p>
        </div>

        {phase === "idle" ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex animate-fade-in cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
              dragOver
                ? "border-[#00BFFF] bg-[#00BFFF]/5"
                : "border-border hover:border-[#00BFFF]/60",
            )}
          >
            <Download className="mb-3 size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Drop the Connections.csv here</p>
            <p className="mt-1 text-xs text-muted-foreground">or click to select the file</p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        ) : (
          <div
            className={cn(
              "animate-scale-in rounded-xl border px-4 py-5 transition-colors",
              phase === "done"
                ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                : "border-border bg-muted/40",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full",
                  phase === "done" ? "bg-emerald-500 text-white" : "bg-muted",
                )}
              >
                {phase === "done" ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <Upload className="size-4 animate-pulse text-muted-foreground" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {phase === "done" ? "File uploaded successfully" : "Processing your file..."}
                </p>
                {phase === "uploading" && (
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-[#00BFFF]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="text-white"
            disabled={phase !== "done"}
            onClick={onUploaded}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



type SettingsSubtasks = {
  competitors: boolean;
  influencers: boolean;
  brandDna: boolean;
  icp?: boolean;
};

function ProfileQuickList({
  profiles,
  onChange,
  placeholder,
  addLabel,
  max,
  slotLabel,
}: {
  profiles: MonitoredProfile[];
  onChange: (next: MonitoredProfile[]) => void;
  placeholder: string;
  addLabel: string;
  max: number;
  slotLabel: string;
}) {
  const [value, setValue] = useState("");
  const invalid = value.trim().length > 0 && !isLinkedinProfileUrl(value);

  const add = () => {
    const v = value.trim();
    if (!isLinkedinProfileUrl(v)) return;
    if (profiles.length >= max) {
      toast.error(`You can add up to ${max} profiles.`);
      return;
    }
    onChange([...profiles, { id: `p-${Date.now()}`, name: extractHandle(v), handle: v }]);
    setValue("");
  };

  const slots = Array.from({ length: max }, (_, i) => profiles[i]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className={cn(
            "h-9 flex-1 rounded-md border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#00BFFF]",
            invalid ? "border-red-500" : "border-border",
          )}
        />
        <Button
          size="sm"
          disabled={!value.trim() || invalid || profiles.length >= max}
          onClick={add}
          className="text-white"
        >
          {addLabel}
        </Button>
      </div>
      <ul className="divide-y divide-border/60 rounded-lg border border-border/70">
        {slots.map((p, i) => (
          <li key={p?.id ?? `slot-${i}`} className="flex items-center gap-2 px-3 py-2.5">
            {p ? (
              <>
                <span className="min-w-0 flex-1 truncate text-xs">{p.handle}</span>
                <button
                  type="button"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => onChange(profiles.filter((x) => x.id !== p.id))}
                  className="text-muted-foreground transition-colors hover:text-red-500"
                >
                  <X className="size-3.5" />
                </button>
              </>
            ) : (
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/80">
                {slotLabel} {i + 1}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}


function LockedSection({ title, hint }: { title: string; hint: string }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">{title}</h2>
        <span className="flex size-5 items-center justify-center rounded-full border border-[#F59E0B]/50 text-[#F59E0B]">
          <Lock className="size-2.5" />
        </span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/40">
        <div className="space-y-3 p-5 blur-[3px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-5 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-1/3 rounded bg-muted" />
                <div className="h-2 w-2/3 rounded bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center bg-background/40 px-6 text-center">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
    </section>
  );
}

/** Sequential 3-step workspace setup: competitors → monitored profiles → Brand DNA. */
function SettingsDialog({
  open,
  onOpenChange,
  subtasks,
  onChange,
  onFinish,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subtasks: SettingsSubtasks;
  onChange: (patch: Partial<SettingsSubtasks>) => void;
  onFinish: () => void;
}) {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [step, setStep] = useState(1);
  const [dnaOpen, setDnaOpen] = useState(false);


  useEffect(() => {
    if (!open) return;
    setSettings(loadSettings());
    setStep(subtasks.competitors ? (subtasks.influencers ? 3 : 2) : 1);
  }, [open]);

  const patchSettings = (patch: Partial<SettingsData>) => {
    setSettings((s) => {
      if (!s) return s;
      const next = { ...s, ...patch };
      saveSettings(next);
      return next;
    });
  };

  const canContinue =
    step === 1
      ? (settings?.competitors.length ?? 0) > 0
      : step === 2
        ? (settings?.influencers.length ?? 0) > 0
        : true;

  const titles = ["Add competitors", "Add monitored profiles", "Your Brand DNA is ready"];
  const descriptions = [
    "Isla watches who engages with their posts and turns those people into prospects worth reaching out to.",
    "Creators in your niche. Isla finds posts where you can comment and get seen by their audience.",
    "Isla built your pillars, tone and proof points from your profile and website.",
  ];

  return (
    <>
      <Dialog open={open && !dnaOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#00BFFF]">
              Step {step} of 3
            </p>
            <DialogTitle className="flex items-center gap-2">
              {titles[step - 1]}
              {step < 3 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  5 max
                </span>
              )}
            </DialogTitle>
            <DialogDescription>{descriptions[step - 1]}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-[#00BFFF]" : "bg-muted",
                )}
              />
            ))}
          </div>

          {settings && step === 1 && (
            <ProfileQuickList
              profiles={settings.competitors}
              max={5}
              slotLabel="Competitor"
              placeholder="https://www.linkedin.com/in/competitor-linkedin/"
              addLabel="Add"
              onChange={(next) => {
                patchSettings({ competitors: next });
                onChange({ competitors: next.length > 0 });
              }}
            />
          )}

          {settings && step === 2 && (
            <ProfileQuickList
              profiles={settings.influencers}
              max={5}
              slotLabel="Monitored Profile"
              placeholder="https://www.linkedin.com/in/creator-in-your-niche/"
              addLabel="Add"
              onChange={(next) => {
                patchSettings({ influencers: next });
                onChange({ influencers: next.length > 0 });
              }}
            />
          )}

          {step === 3 && (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#00BFFF]" />
                <p className="text-sm font-semibold">Brand DNA created</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>Content pillars and themes you want to own.</li>
                <li>Tone rules Isla follows in every draft.</li>
                <li>Stories and numbers Isla can reuse as proof.</li>
              </ul>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(step - 1) : onOpenChange(false))}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {step > 1 ? "Back" : "I'll finish later"}
            </button>
            {step < 3 ? (
              <Button
                size="sm"
                className="text-white"
                disabled={!canContinue}
                onClick={() => setStep(step + 1)}
              >
                Continue
                <ArrowRight className="ml-1 size-3" />
              </Button>
            ) : (
              <Button size="sm" className="text-white" onClick={() => setDnaOpen(true)}>
                Open Brand DNA
                <ArrowRight className="ml-1 size-3" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BrandDnaModal
        open={dnaOpen}
        onOpenChange={setDnaOpen}
        onContinue={() => {
          onChange({ brandDna: true });
          onFinish();
          setDnaOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}




