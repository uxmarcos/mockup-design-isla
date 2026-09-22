import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postTitle, seatOf } from "@/lib/content-requests-store";
import { postDate, useOperatorWorkspace } from "@/lib/operator-store";
import { OLink } from "@/components/operator/nav";
import { EmptyBox, formatWhen, PageBody, PageHeader, StatusBadge, statusKey, WorkspaceLogo } from "@/components/operator/ui";

export const Route = createFileRoute("/ops/posts/")({
  component: PostsPage,
});

const STATUSES = [
  ["all", "All statuses"],
  ["draft", "Draft"],
  ["writing", "Idea to write"],
  ["awaiting", "Awaiting client"],
  ["changes", "Changes requested"],
  ["approved", "Scheduled"],
  ["posted", "Posted"],
] as const;

function PostsPage() {
  const ws = useOperatorWorkspace();
    const [seat, setSeat] = useState("all");
  const [status, setStatus] = useState<string>("all");

  const list = useMemo(
    () =>
      ws.posts
        .filter((p) => (seat === "all" || seatOf(p) === seat) && (status === "all" || statusKey(p, ws.now) === status))
        .sort((a, b) => (postDate(b)?.getTime() ?? 0) - (postDate(a)?.getTime() ?? 0)),
    [ws.posts, ws.now, seat, status],
  );

  return (
    <>
      <PageHeader title="Posts" subtitle="Every post across your clients' seats." />
      <PageBody>
        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={seat} onValueChange={setSeat}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {ws.workspaces.map((w) => (
                <SelectGroup key={w.id}>
                  <SelectLabel className="text-xs">{w.name}</SelectLabel>
                  {ws.seats
                    .filter((s) => s.workspaceId === w.id)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {list.length === 0 ? (
          <EmptyBox>No posts match these filters.</EmptyBox>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {list.map((p) => {
              const s = ws.getSeat(seatOf(p))!;
              const d = postDate(p);
              return (
                <li key={p.id} className="border-b border-border last:border-b-0">
                  <OLink
                    to="/ops/posts/$postId"
                    params={{ postId: p.id }}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40"
                  >
                    <WorkspaceLogo workspace={s.workspace} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{postTitle(p)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {s.name} · {s.workspace.name}
                      </span>
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:block">{d ? formatWhen(d) : "No date"}</span>
                    <StatusBadge post={p} now={ws.now} />
                  </OLink>
                </li>
              );
            })}
          </ul>
        )}
      </PageBody>
    </>
  );
}
