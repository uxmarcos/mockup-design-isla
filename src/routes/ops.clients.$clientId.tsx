import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { postTitle, seatOf } from "@/lib/content-requests-store";
import { startOfWeek } from "@/lib/operator-data";
import { lastUserMessage, postDate, seatStats, useOperatorWorkspace } from "@/lib/operator-store";
import { OLink, useNewPost } from "@/components/operator/nav";
import { HubBreadcrumb } from "@/components/content/HubBreadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyBox,
  formatWhen,
  HealthBadge,
  PageBody,
  StatusBadge,
  timeAgo,
  WorkspaceLogo,
} from "@/components/operator/ui";

export const Route = createFileRoute("/ops/clients/$clientId")({
  component: ClientPage,
});

const TABS = ["Overview", "Posts", "Feedback", "Context", "Settings"] as const;
type Tab = (typeof TABS)[number];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ClientPage() {
  const { clientId } = Route.useParams();
  const ws = useOperatorWorkspace();
  const openNewPost = useNewPost();
  const [tab, setTab] = useState<Tab>("Overview");
  const seat = ws.getSeat(clientId);

  const posts = useMemo(
    () =>
      ws.posts
        .filter((p) => seatOf(p) === clientId)
        .sort((a, b) => (postDate(b)?.getTime() ?? 0) - (postDate(a)?.getTime() ?? 0)),
    [ws.posts, clientId],
  );
  const stats = seat ? seatStats(seat, ws.posts, startOfWeek(ws.now), ws.now) : null;

  const [cadence, setCadence] = useState("");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (!seat) return;
    setCadence(String(seat.cadence));
    setNotes(ws.overrides[seat.id]?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seat?.id]);

  if (!seat || !stats) {
    return (
      <div className="mx-auto max-w-[600px] py-20 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This seat isn't part of your portfolio, or it doesn't exist.
        </p>
        <OLink to="/ops/clients" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to clients
        </OLink>
      </div>
    );
  }

  const feedbackPosts = posts.filter((p) => p.status === "changes" || (p.thread && p.thread.length > 0));

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-border/70 px-8 py-4">
        <HubBreadcrumb
          page={seat.name}
          root={{ label: "Clients", to: "/ops/clients" }}
          trail={[{ label: seat.workspace.name }]}
          className="min-w-0"
        />
        <Button size="sm" className="text-white" onClick={() => openNewPost({ seatId: seat.id })}>
          New post
        </Button>
      </div>
      <PageBody className="max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <WorkspaceLogo workspace={seat.workspace} className="size-12" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{seat.name}</h1>
            <p className="text-sm text-muted-foreground">
              {seat.title} · {seat.workspace.name}
            </p>
          </div>
          <div className="ml-auto">
            <HealthBadge health={stats.health} />
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-6">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["This week", `${stats.scheduledThisWeek}/${seat.cadence}`],
                ["Awaiting approval", String(stats.awaiting)],
                ["Open feedback", String(stats.changes)],
                ["Ideas to write", String(stats.ideas)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{l}</p>
                  <p className="mt-2 text-2xl font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm">{stats.healthReason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Next post: {stats.nextPost ? `${postTitle(stats.nextPost)} · ${formatWhen(new Date(stats.nextPost.scheduledAt!))}` : "nothing scheduled"}
              </p>
            </div>
          </div>
        )}

        {tab === "Posts" &&
          (posts.length === 0 ? (
            <EmptyBox>No posts for this seat yet.</EmptyBox>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-border bg-card">
              {posts.map((p) => {
                const d = postDate(p);
                return (
                  <li key={p.id} className="border-b border-border last:border-b-0">
                    <OLink to="/ops/posts/$postId" params={{ postId: p.id }} search={{ from: "clients" }} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{postTitle(p)}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">{d ? formatWhen(d) : "No date"}</span>
                      <StatusBadge post={p} now={ws.now} />
                    </OLink>
                  </li>
                );
              })}
            </ul>
          ))}

        {tab === "Feedback" &&
          (feedbackPosts.length === 0 ? (
            <EmptyBox>No feedback from {seat.name}.</EmptyBox>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-border bg-card">
              {feedbackPosts.map((p) => {
                const last = lastUserMessage(p);
                return (
                  <li key={p.id} className="border-b border-border last:border-b-0">
                    <OLink to="/ops/posts/$postId" params={{ postId: p.id }} search={{ from: "clients" }} className="block px-4 py-3.5 hover:bg-muted/40">
                      <span className="flex items-center gap-3">
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

        {tab === "Context" && (
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
            <Field label="Seat brand DNA">{seat.brandDna}</Field>
            <Field label="Ideal customer profile">{seat.icp}</Field>
            <Field label="Email">{seat.email}</Field>
            <Field label="Workspace">
              {seat.workspace.name} · {seat.workspace.plan} · client since {seat.workspace.since}
            </Field>
            <Field label="Language · Time zone">
              {seat.workspace.language} · {seat.workspace.timezone}
            </Field>
            <Field label="Workspace contact">{seat.workspace.contactEmail}</Field>
          </div>
        )}

        {tab === "Settings" && (
          <div className="max-w-md space-y-5 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <WorkspaceLogo workspace={seat.workspace} />
              <p className="text-sm font-medium">
                {seat.name} <span className="text-muted-foreground">· {seat.workspace.name}</span>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cadence">Posts per week</Label>
              <Input id="cadence" type="number" min={0} max={14} value={cadence} onChange={(e) => setCadence(e.target.value)} />
              <p className="text-xs text-muted-foreground">Used for the calendar progress and the weekly gap alerts for this seat.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to the Isla team." />
            </div>
            <Button
              className="text-white"
              onClick={() => {
                const n = Math.max(0, Math.min(14, Number.parseInt(cadence, 10) || 0));
                ws.setSeatOverride(seat.id, { cadence: n, notes });
                setCadence(String(n));
                toast.success("Seat settings saved");
              }}
            >
              Save
            </Button>
          </div>
        )}
      </PageBody>
    </>
  );
}
