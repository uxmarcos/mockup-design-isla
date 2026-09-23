import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Check,
  ImagePlus,
  Images,
  Lightbulb,
  ListChecks,
  Plus,
  StopCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { postTitle } from "@/lib/content-requests-store";
import {
  formatTimer,
  TASK_TYPE_LABEL,
  useServiceDesk,
  type TaskType,
} from "@/lib/session-store";
import { OLink, useGo } from "@/components/operator/nav";
import {
  EmptyBox,
  fileToPostImage,
  MAX_POST_IMAGE_BYTES,
  SeatAvatar,
  WorkspaceLogo,
} from "@/components/operator/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ops/session/$workspaceId")({
  component: SessionPage,
});

const TABS = ["tasks", "ideas", "brain", "images"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = { tasks: "Tasks", ideas: "Ideas", brain: "Brain", images: "Image bank" };
const TAB_ICON: Record<Tab, typeof ListChecks> = { tasks: ListChecks, ideas: Lightbulb, brain: BookOpen, images: Images };

const TASK_TYPES: TaskType[] = [
  "personal_post",
  "institutional_post",
  "approval_request",
  "monthly_call",
  "feedback_request",
  "photo_request",
  "custom",
];

function SessionPage() {
  const { workspaceId } = Route.useParams();
  const desk = useServiceDesk();
  const go = useGo();
  const [tab, setTab] = useState<Tab>("tasks");

  const [addingTask, setAddingTask] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>("custom");
  const [taskSeat, setTaskSeat] = useState<string>("none");
  const [taskTitle, setTaskTitle] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const workspace = desk.workspaces.find((w) => w.id === workspaceId);
  const seats = desk.seats.filter((s) => s.workspaceId === workspaceId);
  const tasks = desk.tasksFor(workspaceId);
  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  const ideas = desk.posts.filter((p) => seats.some((s) => s.id === (p.seatId ?? "")) && p.status === "writing" && p.origin === "idea");
  const bankImages = desk.imagesFor(workspaceId);

  const session = desk.activeSession?.workspaceId === workspaceId ? desk.activeSession : null;
  const elapsed = session ? desk.now.getTime() - new Date(session.startedAt).getTime() : 0;

  if (!workspace) {
    return (
      <div className="mx-auto max-w-[600px] py-20 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">This client isn't part of your portfolio, or it doesn't exist.</p>
        <OLink to="/ops" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to Service Desk
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
    go("/ops");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-12 pt-8 sm:px-10">
      <OLink to="/ops" className="mb-4 inline-block text-xs text-muted-foreground hover:text-foreground">
        ← Service Desk
      </OLink>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WorkspaceLogo workspace={workspace} className="size-11" />
          <div className="leading-tight">
            <h1 className="text-xl font-semibold tracking-tight">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground">
              {seats.length} {seats.length === 1 ? "seat" : "seats"} · {workspace.plan}
            </p>
          </div>
        </div>

        {session ? (
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-lg font-semibold tabular-nums">
              {formatTimer(elapsed)}
            </span>
            <Button variant="outline" size="sm" onClick={endSession}>
              <StopCircle className="size-3.5" />
              End session
            </Button>
          </div>
        ) : (
          <Button size="sm" className="text-white" onClick={() => desk.startSession(workspaceId)}>
            Start session
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-5">
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

      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card">
            {openTasks.length === 0 && doneTasks.length === 0 ? (
              <div className="p-4">
                <EmptyBox>No tasks for {workspace.name} yet.</EmptyBox>
              </div>
            ) : (
              <ul>
                {[...openTasks, ...doneTasks].map((t) => {
                  const seat = t.seatId ? seats.find((s) => s.id === t.seatId) : undefined;
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
                  <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
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
                    <Select value={taskSeat} onValueChange={setTaskSeat}>
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

      {tab === "ideas" && (
        <div className="rounded-2xl border border-border bg-card">
          {ideas.length === 0 ? (
            <div className="p-4">
              <EmptyBox>No ideas waiting from {workspace.name}.</EmptyBox>
            </div>
          ) : (
            <ul>
              {ideas.map((p) => {
                const seat = seats.find((s) => s.id === (p.seatId ?? ""));
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
          )}
        </div>
      )}

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
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Brand DNA</p>
                  <p className="mt-1 text-sm leading-relaxed">{s.brandDna || "Nothing recorded yet."}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ideal customer profile</p>
                  <p className="mt-1 text-sm leading-relaxed">{s.icp || "Nothing recorded yet."}</p>
                </div>
              </div>
            </div>
          ))}
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
  );
}
