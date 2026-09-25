import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarClock,
  Check,
  Copy,
  ImagePlus,
  Images,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  PenLine,
  Plus,
  Settings2,
  StopCircle,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubBreadcrumb } from "@/components/content/HubBreadcrumb";
import { postTitle, seatOf } from "@/lib/content-requests-store";
import { startOfWeek } from "@/lib/operator-data";
import { lastUserMessage, postDate, seatStats, useOperatorWorkspace } from "@/lib/operator-store";
import {
  formatTimer,
  TASK_TYPE_LABEL,
  useServiceDesk,
  type ClientTask,
  type TaskType,
} from "@/lib/session-store";
import { OLink, useGo, useNewPost } from "@/components/operator/nav";
import {
  EmptyBox,
  fileToPostImage,
  formatWhen,
  HealthBadge,
  MAX_POST_IMAGE_BYTES,
  PageBody,
  SeatAvatar,
  StatusBadge,
  timeAgo,
  WorkspaceLogo,
} from "@/components/operator/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ops/clients/$workspaceId")({
  component: ClientPage,
});

const TABS = ["overview", "tasks", "posts", "feedback", "brain", "images"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  overview: "Overview",
  tasks: "Tasks",
  posts: "Posts",
  feedback: "Feedback",
  brain: "Brain",
  images: "Image bank",
};
const TAB_ICON: Record<Tab, typeof ListChecks> = {
  overview: LayoutGrid,
  tasks: ListChecks,
  posts: LayoutGrid,
  feedback: MessageSquareText,
  brain: BookOpen,
  images: Images,
};

const TASK_TYPES: TaskType[] = [
  "personal_post",
  "institutional_post",
  "approval_request",
  "monthly_call",
  "feedback_request",
  "photo_request",
  "custom",
];

/** Every task guides the operator to the thing it wants done next; custom tasks have no fixed target. */
const TASK_ACTION: Partial<Record<TaskType, { label: string; icon: LucideIcon }>> = {
  personal_post: { label: "Write", icon: PenLine },
  institutional_post: { label: "Write", icon: PenLine },
  approval_request: { label: "Copy link", icon: Copy },
  feedback_request: { label: "Copy link", icon: Copy },
  photo_request: { label: "Open bank", icon: Images },
  monthly_call: { label: "Open calendar", icon: CalendarClock },
};

function writePostTitle(seatName: string | undefined, workspaceName: string) {
  return seatName ? `Write a post for ${seatName}` : `Write a post for the ${workspaceName} page`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ClientPage() {
  const { workspaceId } = Route.useParams();
  const ws = useOperatorWorkspace();
  const desk = useServiceDesk();
  const go = useGo();
  const openNewPost = useNewPost();
  const [tab, setTab] = useState<Tab>("overview");

  const [addingTask, setAddingTask] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>("custom");
  const [taskSeat, setTaskSeat] = useState<string>("none");
  const [taskTitle, setTaskTitle] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const workspace = ws.workspaces.find((w) => w.id === workspaceId);
  const seats = useMemo(() => ws.seats.filter((s) => s.workspaceId === workspaceId), [ws.seats, workspaceId]);
  const weekStart = startOfWeek(ws.now);
  const stats = useMemo(
    () => new Map(seats.map((s) => [s.id, seatStats(s, ws.posts, weekStart, ws.now)])),
    [seats, ws.posts, weekStart, ws.now],
  );

  const posts = useMemo(
    () =>
      ws.posts
        .filter((p) => seats.some((s) => s.id === seatOf(p)))
        .sort((a, b) => (postDate(b)?.getTime() ?? 0) - (postDate(a)?.getTime() ?? 0)),
    [ws.posts, seats],
  );
  const feedbackPosts = posts.filter((p) => p.status === "changes" || (p.thread && p.thread.length > 0));
  const ideas = posts.filter((p) => p.status === "writing" && p.origin === "idea");

  const tasks = desk.tasksFor(workspaceId);
  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  const bankImages = desk.imagesFor(workspaceId);

  const session = desk.activeSession?.workspaceId === workspaceId ? desk.activeSession : null;
  const elapsed = session ? desk.now.getTime() - new Date(session.startedAt).getTime() : 0;

  if (!workspace) {
    return (
      <div className="mx-auto max-w-[600px] py-20 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">This client isn't part of your portfolio, or it doesn't exist.</p>
        <OLink to="/ops/clients" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to clients
        </OLink>
      </div>
    );
  }

  const createTask = () => {
    if (!taskTitle.trim()) return toast.error("Give the task a title.");
    desk.addTask(workspaceId, { type: taskType, title: taskTitle.trim(), seatId: taskSeat === "none" ? undefined : taskSeat });
    setTaskTitle("");
    setTaskType("custom");
    setTaskSeat("none");
    setAddingTask(false);
  };

  const runTaskAction = (t: ClientTask) => {
    const seat = t.seatId ? seats.find((s) => s.id === t.seatId) : undefined;
    switch (t.type) {
      case "personal_post":
      case "institutional_post":
        openNewPost({ seatId: seat?.id ?? seats[0]?.id });
        return;
      case "approval_request":
      case "feedback_request": {
        const link = `https://isla.to/review/${seat?.id ?? workspace.id}-${t.id.slice(-6)}`;
        void navigator.clipboard.writeText(link);
        toast.success("Link copied to clipboard");
        return;
      }
      case "photo_request":
        setTab("images");
        return;
      case "monthly_call":
        go("/ops/calendar");
        return;
      default:
        return;
    }
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_POST_IMAGE_BYTES) return toast.error("Image is too large (max 8 MB).");
    try {
      const dataUrl = await fileToPostImage(file, 900);
      desk.addImage(workspaceId, dataUrl);
      toast.success("Image added to the bank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add the image.");
    }
  };

  const endSession = () => {
    if (!session) return;
    desk.endSession(session.id);
    toast.success(`Session with ${workspace.name} ended`);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-8 py-4">
        <HubBreadcrumb page={workspace.name} root={{ label: "Clients", to: "/ops/clients" }} className="min-w-0" />
        <div className="flex flex-wrap items-center gap-2">
          {session ? (
            <>
              <span className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-sm font-semibold tabular-nums">
                {formatTimer(elapsed)}
              </span>
              <Button variant="outline" size="sm" onClick={endSession}>
                <StopCircle className="size-3.5" />
                End session
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => desk.startSession(workspaceId)}>
              Start session
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => go("/ops/clients/$workspaceId/manage", { params: { workspaceId } })}
          >
            <Settings2 className="size-3.5" />
            Manage
          </Button>
          <Button
            size="sm"
            className="text-white"
            onClick={() => openNewPost({ seatId: seats[0]?.id })}
            disabled={seats.length === 0}
          >
            New post
          </Button>
        </div>
      </div>

      <PageBody className="max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <WorkspaceLogo workspace={workspace} className="size-12" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground">
              {seats.length} {seats.length === 1 ? "seat" : "seats"} · {workspace.plan}
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-6">
          <TabsList>
            {TABS.map((t) => {
              const Icon = TAB_ICON[t];
              return (
                <TabsTrigger key={t} value={t} className="gap-1.5">
                  <Icon className="size-3.5" />
                  {TAB_LABEL[t]}
                  {t === "tasks" && openTasks.length > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-4 text-white">
                      {openTasks.length}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="min-h-[420px]">
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Seats
                </div>
                <ul>
                  {seats.map((s) => {
                    const st = stats.get(s.id)!;
                    return (
                      <li key={s.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                        <SeatAvatar seat={s} />
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="truncate text-sm font-medium">{s.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {s.title} · {st.scheduledThisWeek}/{s.cadence} this week
                            {st.changes > 0 && ` · ${st.changes} open feedback`}
                          </p>
                        </div>
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                          {st.nextPost ? formatWhen(new Date(st.nextPost.scheduledAt!)) : "No post scheduled"}
                        </span>
                        <HealthBadge health={st.health} />
                      </li>
                    );
                  })}
                </ul>
              </div>

              {ideas.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <Lightbulb className="size-3.5 text-amber light:text-[#7A5200]" />
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      New ideas
                    </h2>
                  </div>
                  <ul>
                    {ideas.map((p) => {
                      const seat = seats.find((s) => s.id === seatOf(p));
                      return (
                        <li key={p.id} className="border-b border-border last:border-b-0">
                          <OLink
                            to="/ops/posts/$postId"
                            params={{ postId: p.id }}
                            search={{ from: "clients" }}
                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40"
                          >
                            {seat && <SeatAvatar seat={seat} className="size-8" />}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{postTitle(p)}</p>
                              <p className="truncate text-xs text-muted-foreground">{seat?.name ?? "Unknown seat"}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Start draft
                            </Button>
                          </OLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === "tasks" && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {openTasks.length === 0 && doneTasks.length === 0 ? (
                  <div className="p-4">
                    <EmptyBox>No tasks for {workspace.name} yet.</EmptyBox>
                  </div>
                ) : (
                  <ul>
                    {[...openTasks, ...doneTasks].map((t) => {
                      const seat = t.seatId ? seats.find((s) => s.id === t.seatId) : undefined;
                      const action = TASK_ACTION[t.type];
                      return (
                        <li key={t.id} className="group flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                          <button
                            onClick={() => desk.toggleTask(t.id)}
                            aria-label={t.done ? "Mark task not done" : "Mark task done"}
                            className={cn(
                              "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                              t.done ? "border-[#22C55E] bg-[#22C55E] text-white" : "border-border text-transparent hover:border-primary",
                            )}
                          >
                            <Check className="size-3.5" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={cn("truncate text-sm font-medium", t.done && "text-muted-foreground line-through")}>
                              {t.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {TASK_TYPE_LABEL[t.type]}
                              {seat && ` · ${seat.name}`}
                            </p>
                          </div>
                          {action && !t.done && (
                            <Button variant="outline" size="sm" className="shrink-0" onClick={() => runTaskAction(t)}>
                              <action.icon className="size-3.5" />
                              {action.label}
                            </Button>
                          )}
                          <button
                            onClick={() => desk.removeTask(t.id)}
                            aria-label="Remove task"
                            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {addingTask ? (
                <div className="space-y-3 rounded-2xl border border-dashed border-border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={taskType}
                        onValueChange={(v) => {
                          const nv = v as TaskType;
                          setTaskType(nv);
                          if (nv === "personal_post" || nv === "institutional_post") {
                            const seat = taskSeat !== "none" ? seats.find((s) => s.id === taskSeat) : undefined;
                            setTaskTitle(writePostTitle(seat?.name, workspace.name));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {TASK_TYPE_LABEL[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {seats.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Seat (optional)</Label>
                        <Select
                          value={taskSeat}
                          onValueChange={(v) => {
                            setTaskSeat(v);
                            if (taskType === "personal_post" || taskType === "institutional_post") {
                              const seat = v !== "none" ? seats.find((s) => s.id === v) : undefined;
                              setTaskTitle(writePostTitle(seat?.name, workspace.name));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Company-wide</SelectItem>
                            {seats.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Ask for feedback on the last published posts" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setAddingTask(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="text-white" onClick={createTask}>
                      Add task
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setAddingTask(true)}>
                  <Plus className="size-3.5" />
                  Add task
                </Button>
              )}
            </div>
          )}

          {tab === "posts" &&
            (posts.length === 0 ? (
              <EmptyBox>No posts for {workspace.name} yet.</EmptyBox>
            ) : (
              <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                {posts.map((p) => {
                  const seat = seats.find((s) => s.id === seatOf(p));
                  const d = postDate(p);
                  return (
                    <li key={p.id} className="border-b border-border last:border-b-0">
                      <OLink
                        to="/ops/posts/$postId"
                        params={{ postId: p.id }}
                        search={{ from: "clients" }}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40"
                      >
                        {seat && <SeatAvatar seat={seat} className="size-8" />}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{postTitle(p)}</span>
                          <span className="block truncate text-xs text-muted-foreground">{seat?.name}</span>
                        </span>
                        <span className="hidden text-xs text-muted-foreground sm:block">{d ? formatWhen(d) : "No date"}</span>
                        <StatusBadge post={p} now={ws.now} />
                      </OLink>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === "feedback" &&
            (feedbackPosts.length === 0 ? (
              <EmptyBox>No feedback from {workspace.name}.</EmptyBox>
            ) : (
              <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                {feedbackPosts.map((p) => {
                  const seat = seats.find((s) => s.id === seatOf(p));
                  const last = lastUserMessage(p);
                  return (
                    <li key={p.id} className="border-b border-border last:border-b-0">
                      <OLink to="/ops/posts/$postId" params={{ postId: p.id }} search={{ from: "clients" }} className="block px-4 py-3.5 hover:bg-muted/40">
                        <span className="flex items-center gap-3">
                          {seat && <SeatAvatar seat={seat} className="size-7" />}
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{postTitle(p)}</span>
                          <StatusBadge post={p} now={ws.now} />
                        </span>
                        {last && (
                          <span className="mt-1 block truncate text-xs text-muted-foreground">
                            "{last.text}" · {timeAgo(last.at, ws.now)}
                          </span>
                        )}
                      </OLink>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === "brain" && (
            <div className="space-y-4">
              {seats.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2.5">
                    <SeatAvatar seat={s} />
                    <div className="leading-tight">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.title}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Brand DNA">{s.brandDna || "Nothing recorded yet."}</Field>
                    <Field label="Ideal customer profile">{s.icp || "Nothing recorded yet."}</Field>
                  </div>
                </div>
              ))}
              <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
                <Field label="Workspace">
                  {workspace.name} · {workspace.plan} · client since {workspace.since}
                </Field>
                <Field label="Language · Time zone">
                  {workspace.language} · {workspace.timezone}
                </Field>
                <Field label="Workspace contact">{workspace.contactEmail}</Field>
              </div>
            </div>
          )}

          {tab === "images" && (
            <div className="space-y-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void pickImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <ImagePlus className="size-3.5" />
                Upload image
              </Button>

              {bankImages.length === 0 ? (
                <EmptyBox>No images in the bank for {workspace.name} yet.</EmptyBox>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {bankImages.map((img) => (
                    <div key={img.id} className="group relative overflow-hidden rounded-xl border border-border">
                      <img src={img.url} alt="" className="aspect-square w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 bg-black/70 p-1.5 backdrop-blur">
                        <button
                          onClick={() => desk.toggleImageUsed(img.id)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            img.used ? "bg-[#22C55E] text-white" : "bg-white/15 text-white hover:bg-white/25",
                          )}
                        >
                          {img.used ? "Used" : "Mark used"}
                        </button>
                        <button
                          onClick={() => desk.removeImage(img.id)}
                          aria-label="Remove image"
                          className="rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      {img.used && (
                        <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-[#22C55E] text-white">
                          <Check className="size-3" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PageBody>

    </>
  );
}
