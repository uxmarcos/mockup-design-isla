import { CalendarX2, CheckCircle2, Clock, Lightbulb, MessageSquareText, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SeatAccount } from "@/lib/operator-data";
import type { NotificationType, OpNotification } from "@/lib/operator-store";
import { useGo, useNewPost } from "@/components/operator/nav";
import { timeAgo, WorkspaceLogo } from "@/components/operator/ui";

const TYPE: Record<NotificationType, { icon: LucideIcon; cls: string; action: string; label: string }> = {
  idea: { icon: Lightbulb, cls: "text-amber light:text-[#7A5200]", action: "Start draft", label: "Idea" },
  feedback: { icon: MessageSquareText, cls: "text-destructive", action: "Review feedback", label: "Feedback" },
  approval: { icon: CheckCircle2, cls: "text-[#22C55E] light:text-green-700", action: "View post", label: "Approval" },
  gap: { icon: CalendarX2, cls: "text-amber light:text-[#7A5200]", action: "Create post", label: "Calendar gap" },
  due: { icon: Clock, cls: "text-destructive", action: "Open post", label: "Due soon" },
};

export const NOTIFICATION_LABEL = (t: NotificationType) => TYPE[t].label;

export function NotificationRow({
  n,
  seat,
  onRead,
}: {
  n: OpNotification;
  seat?: SeatAccount;
  onRead: (key: string) => void;
}) {
  const go = useGo();
  const openNewPost = useNewPost();
  const t = TYPE[n.type];

  const act = () => {
    onRead(n.key);
    if (n.type === "gap") openNewPost({ seatId: n.seatId });
    else if (n.postId) go("/operator/posts/$postId", { params: { postId: n.postId }, search: { from: "inbox" } });
  };

  return (
    <li
      className={cn(
        "flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0",
        !n.read && "bg-primary/[0.04]",
      )}
    >
      {seat ? <WorkspaceLogo workspace={seat.workspace} /> : <span className="size-8" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <t.icon className={cn("size-3.5 shrink-0", t.cls)} />
          <p className="truncate text-sm font-medium">{n.title}</p>
          {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {seat && <span className="font-medium text-foreground/70">{seat.workspace.name} · </span>}
          {n.detail}
        </p>
      </div>
      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {n.type === "gap" ? "This week" : timeAgo(n.at)}
      </span>
      <Button variant="outline" size="sm" onClick={act}>
        {t.action}
      </Button>
    </li>
  );
}
