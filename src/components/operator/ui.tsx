import { useState, type ReactNode } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeamDraft } from "@/lib/content-requests-store";
import { isPosted, useOperatorWorkspace, type Health } from "@/lib/operator-store";
import type { Workspace } from "@/lib/operator-data";
import { OLink, useNewPost } from "@/components/operator/nav";

/** Workspace logo (falls back to the initial when the image is missing). */
export function WorkspaceLogo({
  workspace,
  className,
}: {
  workspace: Pick<Workspace, "name" | "logo">;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !workspace.logo) {
    return (
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-foreground",
          className,
        )}
        aria-hidden
      >
        {workspace.name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={workspace.logo}
      alt={workspace.name}
      onError={() => setFailed(true)}
      className={cn("size-8 shrink-0 rounded-md bg-white object-cover", className)}
    />
  );
}

/**
 * A seat is a person — shown as initials on a round avatar, distinct from a workspace's square
 * logo. Kept neutral on purpose: in the Clients screen the only color should come from the
 * workspace logo and the health badges, not from the seats themselves.
 */
export function SeatAvatar({ seat, className }: { seat: { id: string; name: string }; className?: string }) {
  const initials = seat.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-neutral-700 text-[11px] font-bold text-white",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

type StatusKey = "draft" | "writing" | "awaiting" | "changes" | "approved" | "posted";

const STATUS: Record<StatusKey, { label: string; cls: string; dot: string }> = {
  draft: {
    label: "Draft",
    cls: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  writing: {
    label: "Idea to write",
    cls: "border-amber/40 bg-amber/10 text-amber light:text-[#7A5200]",
    dot: "bg-amber",
  },
  awaiting: {
    label: "Awaiting client",
    cls: "border-violet/40 bg-violet/10 text-violet",
    dot: "bg-violet",
  },
  changes: {
    label: "Changes requested",
    cls: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  approved: {
    label: "Scheduled",
    cls: "border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] light:text-green-700",
    dot: "bg-[#22C55E]",
  },
  posted: {
    label: "Posted",
    cls: "border-border bg-secondary text-foreground/70",
    dot: "bg-foreground/40",
  },
};

export function statusKey(p: TeamDraft, now = new Date()): StatusKey {
  return isPosted(p, now) ? "posted" : p.status;
}

export const statusStyle = (p: TeamDraft, now = new Date()) => STATUS[statusKey(p, now)];

export function StatusBadge({ post, now }: { post: TeamDraft; now?: Date }) {
  const s = statusStyle(post, now);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        s.cls,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

const HEALTH: Record<Health, { label: string; cls: string }> = {
  ok: { label: "On track", cls: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30 light:text-green-700" },
  attention: { label: "Attention", cls: "bg-amber/10 text-amber border-amber/40 light:text-[#7A5200]" },
  risk: { label: "At risk", cls: "bg-destructive/10 text-destructive border-destructive/40" },
};

export function HealthBadge({ health }: { health: Health }) {
  const h = HEALTH[health];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        h.cls,
      )}
    >
      {h.label}
    </span>
  );
}

/** Same header as the client platform: full-width bar with the title on the left and actions on the right. */
export function PageHeader({
  title,
  subtitle,
  actions,
  hideNewPost,
  hideBell,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  hideNewPost?: boolean;
  hideBell?: boolean;
}) {
  const ws = useOperatorWorkspace();
  const openNewPost = useNewPost();
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-border/70 px-8 py-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {actions}
        {!hideBell && (
          <OLink
            to="/ops/inbox"
            title="Inbox"
            className="relative grid size-9 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground light:hover:bg-black/5"
          >
            <Bell className="size-4" />
            {ws.counts.unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                {ws.counts.unread}
              </span>
            )}
          </OLink>
        )}
        {!hideNewPost && (
          <Button size="sm" className="text-white" onClick={() => openNewPost()}>
            <Plus className="mr-1 size-4" />
            New post
          </Button>
        )}
      </div>
    </header>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-8 py-8", className)}>{children}</div>;
}

/** Small uppercase section label with an optional count, as used across the client platform. */
export function SectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
      {!!count && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#FFD667]/15 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#FFD667] light:bg-[#B7791F]/15 light:text-[#7A5200]">
          {count}
        </span>
      )}
    </h2>
  );
}

export function EmptyBox({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[10px] border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function timeAgo(iso: string, now = new Date()) {
  const mins = Math.max(1, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export function formatWhen(d: Date) {
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** `datetime-local` input value for a date. */
export function toInputValue(d: Date | null) {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fromInputValue(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const MAX_POST_IMAGE_BYTES = 8 * 1024 * 1024;

/** Downsizes a chosen image so several posts fit in localStorage. */
export function fileToPostImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read the image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read the image."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Couldn't process the image."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
