import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Bold,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Eye,
  Heading1,
  Image as ImageIcon,
  Italic,
  List,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChangeRequestChat } from "@/components/ChangeRequestChat";
import { HubBreadcrumb } from "@/components/content/HubBreadcrumb";
import { LinkedInPreviewModal, ScheduleModal } from "@/components/content/PostModals";
import {
  markOperatorSeen,
  operatorReply,
  saveOperatorDraft,
  sendForApproval,
  seatOf,
} from "@/lib/content-requests-store";
import { postDate, useOperatorWorkspace } from "@/lib/operator-store";
import { OLink, useGo } from "@/components/operator/nav";
import { fileToPostImage, formatWhen, MAX_POST_IMAGE_BYTES, timeAgo } from "@/components/operator/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operator/posts/$postId")({
  validateSearch: z.object({ from: z.enum(["calendar", "inbox", "posts", "clients"]).optional() }),
  component: PostEditorPage,
});

const MAX_CHARS = 3000;

const ROOTS = {
  calendar: { label: "Calendar", to: "/operator/calendar" },
  inbox: { label: "Inbox", to: "/operator/inbox" },
  clients: { label: "Clients", to: "/operator/clients" },
  posts: { label: "Posts", to: "/operator/posts" },
} as const;

function ToolbarBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function StatusCard({
  tone,
  icon,
  title,
  children,
}: {
  tone: "violet" | "amber" | "green" | "neutral";
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-2xl border p-3",
        tone === "violet" && "border-violet/40 bg-violet/5",
        tone === "amber" && "border-amber/40 bg-amber/5",
        tone === "green" && "border-[#22C55E]/40 bg-[#22C55E]/5",
        tone === "neutral" && "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        {icon} {title}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>
    </div>
  );
}

function PostEditorPage() {
  const { postId } = Route.useParams();
  const { from } = Route.useSearch();
  const ws = useOperatorWorkspace();
  const go = useGo();
  const post = ws.posts.find((p) => p.id === postId);
  const seat = post ? ws.getSeat(seatOf(post)) : undefined;

  const [body, setBody] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [sendAfterSchedule, setSendAfterSchedule] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    if (!post || loadedId === post.id) return;
    const w = post.operator;
    setBody(w ? w.draftBody : post.body);
    setImage((w ? w.draftImage : post.image) ?? null);
    setScheduledAt(postDate(post));
    setLoadedId(post.id);
  }, [post, loadedId]);

  useEffect(() => {
    if (post) markOperatorSeen(post.id);
  }, [post?.id, post?.thread?.length]);

  if (!post || !seat) {
    return (
      <div className="mx-auto max-w-[600px] py-20 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">This post isn't part of your portfolio, or it doesn't exist.</p>
        <OLink to="/operator/posts" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to posts
        </OLink>
      </div>
    );
  }

  const first = seat.name.split(" ")[0]!;
  const editable = post.status === "draft" || post.status === "writing" || post.status === "changes";
  const author = ws.operator.name;
  const title = body.split("\n")[0]!.trim() || "Untitled post";
  const root = ROOTS[from ?? "posts"];
  const lastVersion = post.versions?.[post.versions.length - 1];

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_POST_IMAGE_BYTES) return toast.error("Image is too large (max 8 MB).");
    try {
      setImage(await fileToPostImage(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add the image.");
    }
  };

  const save = () => {
    saveOperatorDraft(post.id, { body, image, suggestedAt: scheduledAt }, author);
    toast.success("Draft saved");
  };

  const doSend = (when: Date) => {
    const n = sendForApproval(post.id, { body, image, suggestedAt: when }, author);
    toast.success(`Version ${n} sent to ${seat.name} for approval`);
    go("/operator/posts");
  };

  const send = () => {
    if (!body.trim()) return toast.error("Write the post before sending it.");
    if (body.length > MAX_CHARS) return toast.error(`Posts can have up to ${MAX_CHARS} characters.`);
    if (!scheduledAt || scheduledAt.getTime() <= Date.now()) {
      setSendAfterSchedule(true);
      setScheduleOpen(true);
      return;
    }
    doSend(scheduledAt);
  };

  const discard = () => {
    const w = post.operator;
    setBody(w ? w.draftBody : post.body);
    setImage((w ? w.draftImage : post.image) ?? null);
    setScheduledAt(postDate(post));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-5 pt-8 sm:px-10 lg:px-14 lg:pb-12 lg:pt-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <HubBreadcrumb
          page={title}
          pageMaxWidth={420}
          root={root}
          trail={[{ label: seat.name }]}
          className="min-w-0"
        />
        {editable && (
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={discard}>
              Discard changes
            </Button>
            <Button variant="outline" size="sm" onClick={save}>
              Save draft
            </Button>
            <Button size="sm" onClick={send} className="text-white [&_svg]:text-white">
              Send for approval
            </Button>
          </div>
        )}
      </div>

      <div className="flex h-[calc(100dvh-12rem)] flex-col overflow-hidden">
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_300px]">
          {/* Left: editor */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex shrink-0 items-center gap-1 border-b border-border/60 bg-background/40 px-3 py-1.5">
                {editable && (
                  <>
                    <ToolbarBtn>
                      <Heading1 className="size-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn>
                      <Bold className="size-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn>
                      <Italic className="size-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn>
                      <List className="size-3.5" />
                    </ToolbarBtn>
                    <label
                      className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title={image ? "Change image" : "Add image"}
                    >
                      <ImageIcon className="size-3.5" />
                      <span className="hidden sm:inline">{image ? "Change image" : "Add image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          void pickImage(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </>
                )}
                {scheduledAt ? (
                  <div className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                    <button
                      type="button"
                      onClick={() => editable && setScheduleOpen(true)}
                      className="inline-flex items-center gap-1.5 hover:opacity-80"
                      title="Change schedule"
                    >
                      <CalendarClock className="size-3.5" />
                      <span className="hidden sm:inline">
                        {scheduledAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </button>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => setScheduledAt(null)}
                        className="ml-0.5 rounded-full p-0.5 text-primary hover:bg-primary/20"
                        title="Cancel schedule"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  editable && (
                    <button
                      type="button"
                      onClick={() => setScheduleOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Schedule post"
                    >
                      <CalendarClock className="size-3.5" />
                      <span className="hidden sm:inline">Schedule post</span>
                    </button>
                  )
                )}

                <div className="ml-auto flex items-center gap-1">
                  <span
                    className={cn(
                      "mr-2 text-[11px]",
                      body.length > MAX_CHARS ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {body.length}/{MAX_CHARS}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    disabled={!body}
                    className="h-7 px-2 text-xs"
                  >
                    <Eye className="mr-1 size-3.5" /> Preview on LinkedIn
                  </Button>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-y-auto p-6">
                {editable ? (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write the post. The first line is its title."
                    className="w-full resize-none bg-transparent text-[14px] font-normal leading-[1.7] tracking-[0.005em] outline-none placeholder:text-muted-foreground"
                    rows={Math.max(12, body.split("\n").length + 2)}
                    spellCheck={false}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-[14px] font-normal leading-[1.7] tracking-[0.005em]">{body}</div>
                )}

                {image && (
                  <div className="group relative mt-6 overflow-hidden rounded-xl border border-border">
                    <img src={image} alt="Post" className="max-h-[380px] w-full object-cover" />
                    {editable && (
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        title="Remove image"
                        className="absolute right-2 top-2 grid size-8 place-items-center rounded-[10px] border border-border bg-background/80 opacity-0 backdrop-blur transition hover:bg-background group-hover:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: status, then the conversation with the seat */}
          <div className="flex min-h-0 flex-col gap-4">
            {post.status === "draft" && (
              <StatusCard tone="neutral" icon={<CircleDashed className="size-4 text-muted-foreground" />} title="Private draft">
                Only you can see this. {first} gets it in Approvals once you send it. A post needs a publishing date to be sent.
              </StatusCard>
            )}
            {post.status === "writing" && (
              <StatusCard tone="amber" icon={<CircleDashed className="size-4 text-amber light:text-[#7A5200]" />} title={`Idea from ${first}`}>
                Turn it into a post and send it for approval. Read {first}'s notes in the conversation below.
              </StatusCard>
            )}
            {post.status === "awaiting" && (
              <StatusCard tone="violet" icon={<CheckCircle2 className="size-4 text-violet" />} title={`Awaiting ${first}'s approval`}>
                {lastVersion ? `Version ${lastVersion.n} sent ${timeAgo(lastVersion.sentAt, ws.now)}. ` : ""}
                You can edit again if {first} requests changes.
              </StatusCard>
            )}
            {post.status === "changes" && (
              <StatusCard tone="amber" icon={<CircleDashed className="size-4 text-amber light:text-[#7A5200]" />} title={`${first} requested changes`}>
                Reply in the conversation, edit the post and send a new version.
              </StatusCard>
            )}
            {post.status === "approved" && (
              <StatusCard tone="green" icon={<CheckCircle2 className="size-4 text-[#22C55E] light:text-green-700" />} title={`Approved by ${first}`}>
                {post.scheduledAt ? `Scheduled for ${formatWhen(new Date(post.scheduledAt))}.` : "Scheduled."}
              </StatusCard>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2.5">
                <MessageSquare className="size-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">Conversation with {first}</span>
              </div>
              {post.status === "draft" ? (
                <div className="grid flex-1 place-items-center px-4 text-center text-xs text-muted-foreground">
                  The conversation starts once you send the post to {first}.
                </div>
              ) : (
                <ChangeRequestChat
                  key={post.id}
                  messages={post.thread ?? []}
                  onSend={(text) => operatorReply(post.id, text)}
                  viewer="team"
                  peerLabel={seat.name}
                  placeholder={`Reply to ${first}…`}
                  emptyTitle="No messages yet"
                  emptyHint={`Messages from ${first} about this post appear here.`}
                  readOnly={post.status === "approved"}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ScheduleModal
        open={scheduleOpen}
        onOpenChange={(v) => {
          setScheduleOpen(v);
          if (!v) setSendAfterSchedule(false);
        }}
        value={scheduledAt}
        onSave={(d) => {
          setScheduledAt(d);
          setScheduleOpen(false);
          if (sendAfterSchedule) {
            setSendAfterSchedule(false);
            if (d.getTime() <= Date.now()) return toast.error("Pick a future date and time.");
            if (!body.trim()) return toast.error("Write the post before sending it.");
            doSend(d);
          }
        }}
      />
      <LinkedInPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        content={body}
        image={image}
        scheduledAt={scheduledAt}
        author={{ name: seat.name, headline: `${seat.title} at ${seat.workspace.name}` }}
      />
    </div>
  );
}
