import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Globe,
  Lightbulb,
  MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import {
  approveDraft,
  draftTitle,
  requestDraftChanges,
  useContentStore,
  type TeamDraft,
} from "@/lib/content-requests-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — Isla" },
      {
        name: "description",
        content: "Approve the posts our team prepared, and follow the ideas you sent them.",
      },
    ],
  }),
  component: ApprovalsPage,
});

const pad = (n: number) => String(n).padStart(2, "0");

function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function formatWhen(d: Date) {
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const sectionTitle =
  "flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground";
const countBadge =
  "inline-flex min-w-5 items-center justify-center rounded-full bg-[#FFD667]/15 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#FFD667]";


const emptyBox =
  "rounded-[10px] border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground";

function ApprovalsPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const navigate = useNavigate();
  const { requests, drafts } = useContentStore();
  const [approving, setApproving] = useState<TeamDraft | null>(null);
  const [changing, setChanging] = useState<TeamDraft | null>(null);

  const awaiting = useMemo(() => drafts.filter((d) => d.status === "awaiting"), [drafts]);
  const approved = useMemo(
    () =>
      drafts
        .filter((d) => d.status === "approved" && d.scheduledAt)
        .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!)),
    [drafts],
  );

  const openDraft = (dr: TeamDraft, at: string | null) => {
    navigate({
      to: "/post-ideas",
      search: {
        edit: dr.body,
        ...(at ? { at } : {}),
        ...(dr.image ? { img: dr.image } : {}),
        from: "approvals",
      },
    });
  };

  const futureSuggestion = (dr: TeamDraft) => {
    if (!dr.suggestedAt) return null;
    const d = new Date(dr.suggestedAt);
    return d.getTime() > Date.now() ? d : null;
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
        <header className="flex flex-wrap items-center gap-4 border-b border-border/70 px-8 py-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Posts our team prepared for you, and the ideas you sent them.
            </p>
          </div>
          <Button
            size="sm"
            className="ml-auto text-white"
            onClick={() => navigate({ to: "/post-ideas", search: { tab: "ideas" } })}
          >
            <Lightbulb className="mr-1 size-4" />
            Send an idea
          </Button>
        </header>

        <div className="mx-auto w-full max-w-3xl px-8 py-8">
          <section className="mb-10">
            <h2 className={cn(sectionTitle, "mb-3")}>
              Awaiting your approval
              {awaiting.length > 0 && <span className={countBadge}>{awaiting.length}</span>}
            </h2>
            {awaiting.length === 0 ? (
              <p className={emptyBox}>
                Nothing to approve right now. Drafts from our team will show up here.
              </p>
            ) : (
              <ul className="space-y-3">
                {awaiting.map((dr) => {
                  const suggested = futureSuggestion(dr);
                  const preview = dr.body.split("\n").filter((l) => l.trim())[1];
                  return (
                    <li key={dr.id} className="rounded-[10px] border border-violet/40 bg-violet/5 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-violet" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{draftTitle(dr)}</p>
                          {preview && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{preview}</p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            Prepared by {dr.preparedBy} · {timeAgo(dr.preparedAt)}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/80">
                            <CalendarClock className="size-3.5 text-muted-foreground" />
                            {suggested
                              ? `Suggested: ${formatWhen(suggested)}`
                              : "No date yet — you'll pick one when you approve"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setChanging(dr)}>
                          Request changes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDraft(dr, dr.suggestedAt)}
                        >
                          Review
                        </Button>
                        {suggested && (
                          <Button variant="outline" size="sm" onClick={() => setApproving(dr)}>
                            Change date
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="text-white"
                          onClick={() => {
                            if (suggested) {
                              approveDraft(dr.id, suggested);
                              toast.success(`Approved — scheduled for ${formatWhen(suggested)}`);
                            } else {
                              setApproving(dr);
                            }
                          }}
                        >
                          {suggested ? `Approve · ${formatWhen(suggested)}` : "Approve"}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mb-10">
            <h2 className={cn(sectionTitle, "mb-3")}>
              With the Isla team
              {requests.length > 0 && <span className={countBadge}>{requests.length}</span>}
            </h2>
            {requests.length === 0 ? (
              <p className={emptyBox}>
                Ideas you send to our team will show up here while they write the post.
              </p>
            ) : (
              <ul className="space-y-2">
                {requests.map((r) => {
                  const Icon = r.status === "changes" ? MessageSquareText : Lightbulb;
                  return (
                    <li
                      key={r.id}
                      className="flex items-center gap-3 rounded-[10px] border border-border/70 px-4 py-3"
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.hook}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          Sent {timeAgo(r.sentAt)}
                          {r.note ? ` · “${r.note}”` : ""}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-2 py-0.5 text-[10px] font-semibold text-amber">
                        <CircleDashed className="size-3" />
                        {r.status === "changes" ? "Changes requested" : "In progress"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className={cn(sectionTitle, "mb-3")}>
              Approved
              {approved.length > 0 && <span className={countBadge}>{approved.length}</span>}
            </h2>
            {approved.length === 0 ? (
              <p className={emptyBox}>Posts you approve will show up here with their publishing date.</p>
            ) : (
              <ul className="space-y-2">
                {approved.map((dr) => (
                  <li key={dr.id}>
                    <button
                      type="button"
                      onClick={() => openDraft(dr, dr.scheduledAt ?? null)}
                      className="clickable-card-row flex w-full items-center gap-3 rounded-[10px] border border-border/70 px-4 py-3 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{draftTitle(dr)}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          Scheduled for {formatWhen(new Date(dr.scheduledAt!))}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/60 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <Globe className="size-3" />
                        Ready to post
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <ApproveDialog draft={approving} onClose={() => setApproving(null)} />
      <ChangesDialog draft={changing} onClose={() => setChanging(null)} />
    </div>
  );
}

/** Approving needs a date — the button stays disabled until one (in the future) is set. */
function ApproveDialog({ draft, onClose }: { draft: TeamDraft | null; onClose: () => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");

  useEffect(() => {
    if (!draft) return;
    const s = draft.suggestedAt ? new Date(draft.suggestedAt) : null;
    if (s && s.getTime() > Date.now()) {
      setDate(`${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`);
      setTime(`${pad(s.getHours())}:${pad(s.getMinutes())}`);
    } else {
      setDate("");
      setTime("09:00");
    }
  }, [draft]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const when = date && time ? new Date(`${date}T${time}`) : null;
  const valid = !!when && !Number.isNaN(when.getTime()) && when.getTime() > Date.now();

  return (
    <Dialog open={!!draft} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{draft?.suggestedAt ? "Change date & approve" : "Pick a date to approve"}</DialogTitle>
          <DialogDescription>
            A post can only be approved with a publishing date.
          </DialogDescription>
        </DialogHeader>
        {draft && <p className="line-clamp-2 text-sm font-medium">{draftTitle(draft)}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="approve-date" className="text-xs">
              Date
            </Label>
            <Input
              id="approve-date"
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="approve-time" className="text-xs">
              Time
            </Label>
            <Input
              id="approve-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        {date && !valid && (
          <p className="text-xs text-destructive">Pick a date and time in the future.</p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            className="text-white"
            onClick={() => {
              if (!draft || !when) return;
              approveDraft(draft.id, when);
              toast.success(`Approved — scheduled for ${formatWhen(when)}`);
              onClose();
            }}
          >
            Approve & schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangesDialog({ draft, onClose }: { draft: TeamDraft | null; onClose: () => void }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (draft) setNote("");
  }, [draft]);

  return (
    <Dialog open={!!draft} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
          <DialogDescription>
            Tell our team what to adjust. They'll send back a new version for your approval.
          </DialogDescription>
        </DialogHeader>
        {draft && <p className="line-clamp-2 text-sm font-medium">{draftTitle(draft)}</p>}
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="e.g. Make the opening shorter and add a real number."
          className="resize-none"
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="text-white"
            onClick={() => {
              if (!draft) return;
              requestDraftChanges(draft.id, note);
              toast.success("Sent back to the Isla team");
              onClose();
            }}
          >
            Send to team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
