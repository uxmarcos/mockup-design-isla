import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DAY_MS,
  OPERATORS,
  SEATS,
  WORKSPACES,
  addDays,
  startOfWeek,
  type Operator,
  type SeatAccount,
} from "@/lib/operator-data";
import { postTitle, seatOf, useAllContent, type TeamDraft } from "@/lib/content-requests-store";

/* ------------------------- small persisted state ------------------------- */

const EVENT = "isla:operator-change";
const SESSION_KEY = "isla.operator.session.v1";
const READ_KEY = "isla.operator.read.v1";
const SEAT_KEY = "isla.operator.seats.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setValue(readJson(key, fallback));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [value, (v) => writeJson(key, v)];
}

/* -------------------------------- session -------------------------------- */

/** Who is signed in to the panel (demo: switchable to show that portfolios are isolated). */
export function useOperatorSession(): { operator: Operator; setOperatorId: (id: string) => void } {
  const [id, setId] = useStored<string>(SESSION_KEY, OPERATORS[0]!.id);
  const operator = OPERATORS.find((o) => o.id === id) ?? OPERATORS[0]!;
  return { operator, setOperatorId: setId };
}

/* -------------------------- per-seat operator data -------------------------- */

type SeatOverride = { cadence?: number; notes?: string };

function useSeatOverrides() {
  return useStored<Record<string, SeatOverride>>(SEAT_KEY, {});
}

/* ------------------------------ derived helpers ------------------------------ */

/** The date a post is (or would be) published on. */
export function postDate(p: TeamDraft): Date | null {
  const iso = p.status === "approved" ? p.scheduledAt : (p.operator?.draftSuggestedAt ?? p.suggestedAt);
  return iso ? new Date(iso) : null;
}

export const isApproved = (p: TeamDraft) => p.status === "approved";
export const isPosted = (p: TeamDraft, now = new Date()) =>
  p.status === "approved" && !!p.scheduledAt && new Date(p.scheduledAt) < now;

export function inWeek(date: Date | null, weekStart: Date) {
  return !!date && date >= weekStart && date < addDays(weekStart, 7);
}

/** Posts a seat's owner has approved for that week (the ones that count toward the cadence). */
export function scheduledInWeek(posts: TeamDraft[], weekStart: Date) {
  return posts.filter((p) => isApproved(p) && inWeek(postDate(p), weekStart));
}

export type Health = "ok" | "attention" | "risk";

export type SeatStats = {
  scheduledThisWeek: number;
  awaiting: number;
  changes: number;
  ideas: number;
  drafts: number;
  nextPost: TeamDraft | null;
  lastActivity: string | null;
  oldestOpenFeedbackAt: string | null;
  health: Health;
  healthReason: string;
};

export const FEEDBACK_SLA_HOURS = 4;

export function lastUserMessage(p: TeamDraft) {
  return [...(p.thread ?? [])].reverse().find((m) => m.role === "user") ?? null;
}

export function seatStats(seat: SeatAccount, posts: TeamDraft[], weekStart: Date, now = new Date()): SeatStats {
  const mine = posts.filter((p) => seatOf(p) === seat.id);
  const scheduledThisWeek = scheduledInWeek(mine, weekStart).length;
  const awaiting = mine.filter((p) => p.status === "awaiting").length;
  const changesPosts = mine.filter((p) => p.status === "changes");
  const ideas = mine.filter((p) => p.status === "writing" && p.origin === "idea").length;
  const drafts = mine.filter((p) => p.status === "draft").length;
  const upcoming = mine
    .filter((p) => isApproved(p) && !isPosted(p, now))
    .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!));
  const activity = mine
    .flatMap((p) => [p.preparedAt, p.approvedAt, p.operator?.updatedAt, lastUserMessage(p)?.at])
    .filter((x): x is string => !!x)
    .sort()
    .pop();
  const oldestOpenFeedbackAt =
    changesPosts
      .map((p) => lastUserMessage(p)?.at)
      .filter((x): x is string => !!x)
      .sort()[0] ?? null;

  let health: Health = "ok";
  let healthReason = "On track";
  const feedbackHours = oldestOpenFeedbackAt
    ? (now.getTime() - new Date(oldestOpenFeedbackAt).getTime()) / 3600_000
    : 0;
  if (seat.cadence > 0 && scheduledThisWeek === 0) {
    health = "risk";
    healthReason = "No posts scheduled this week";
  } else if (changesPosts.length > 0 && feedbackHours > FEEDBACK_SLA_HOURS) {
    health = "risk";
    healthReason = "Feedback waiting over 4h";
  } else if (seat.cadence > 0 && scheduledThisWeek < seat.cadence) {
    health = "attention";
    healthReason = `${scheduledThisWeek}/${seat.cadence} posts scheduled this week`;
  } else if (changesPosts.length > 0) {
    health = "attention";
    healthReason = "Open feedback";
  }

  return {
    scheduledThisWeek,
    awaiting,
    changes: changesPosts.length,
    ideas,
    drafts,
    nextPost: upcoming[0] ?? null,
    lastActivity: activity ?? null,
    oldestOpenFeedbackAt,
    health,
    healthReason,
  };
}

/* ------------------------------- notifications ------------------------------- */

export type NotificationType = "idea" | "feedback" | "approval" | "gap" | "due";

export type OpNotification = {
  key: string;
  type: NotificationType;
  /** 1 = high, 2 = medium, 3 = low */
  priority: 1 | 2 | 3;
  seatId: string;
  postId?: string;
  title: string;
  detail: string;
  at: string;
  read: boolean;
};

export function deriveNotifications(
  posts: TeamDraft[],
  seats: SeatAccount[],
  readKeys: Set<string>,
  now = new Date(),
): OpNotification[] {
  const out: OpNotification[] = [];
  const name = (id: string) => seats.find((s) => s.id === id)?.name ?? id;
  const weekStart = startOfWeek(now);

  for (const p of posts) {
    const seatId = seatOf(p);
    if (p.status === "writing" && p.origin === "idea") {
      const key = `idea-${p.id}`;
      out.push({
        key,
        type: "idea",
        priority: 2,
        seatId,
        postId: p.id,
        title: `New idea from ${name(seatId)}`,
        detail: postTitle(p),
        at: p.preparedAt,
        read: !!p.operator || readKeys.has(key),
      });
    }
    // Messages the seat wrote about a post (change requests, or notes on an idea being written).
    const last = lastUserMessage(p);
    const isNote = p.status === "writing" && last && last.at > p.preparedAt && p.thread!.length > 1;
    if (last && (p.status === "changes" || isNote)) {
      const seen = !!p.operatorSeenAt && p.operatorSeenAt >= last.at;
      out.push({
        key: `fb-${p.id}-${last.id}`,
        type: "feedback",
        priority: p.status === "changes" ? 1 : 2,
        seatId,
        postId: p.id,
        title:
          p.status === "changes"
            ? `${name(seatId)} requested changes`
            : `${name(seatId)} added a note to an idea`,
        detail: last.text,
        at: last.at,
        read: seen || readKeys.has(`fb-${p.id}-${last.id}`),
      });
    }
    if (p.status === "approved" && p.approvedAt && now.getTime() - new Date(p.approvedAt).getTime() < 3 * DAY_MS) {
      const key = `ap-${p.id}`;
      out.push({
        key,
        type: "approval",
        priority: 3,
        seatId,
        postId: p.id,
        title: `${name(seatId)} approved a post`,
        detail: `${postTitle(p)} · scheduled for ${new Date(p.scheduledAt!).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
        at: p.approvedAt,
        read: readKeys.has(key),
      });
    }
    if (["draft", "writing", "awaiting", "changes"].includes(p.status)) {
      const when = postDate(p);
      if (when && when > now && when.getTime() - now.getTime() < DAY_MS) {
        const key = `due-${p.id}`;
        out.push({
          key,
          type: "due",
          priority: 1,
          seatId,
          postId: p.id,
          title: `${name(seatId)}: publishing soon without approval`,
          detail: postTitle(p),
          at: when.toISOString(),
          read: readKeys.has(key),
        });
      }
    }
  }

  for (const c of seats) {
    if (c.cadence <= 0) continue;
    const scheduled = scheduledInWeek(
      posts.filter((p) => seatOf(p) === c.id),
      weekStart,
    ).length;
    if (scheduled >= c.cadence) continue;
    const key = `gap-${c.id}-${weekStart.toISOString().slice(0, 10)}`;
    out.push({
      key,
      type: "gap",
      priority: scheduled === 0 ? 1 : 2,
      seatId: c.id,
      title: scheduled === 0 ? `${c.name} has no posts this week` : `${c.name} is below the cadence`,
      detail: `${scheduled} of ${c.cadence} posts scheduled for this week`,
      at: weekStart.toISOString(),
      read: readKeys.has(key),
    });
  }

  return out.sort((a, b) => a.priority - b.priority || b.at.localeCompare(a.at));
}

/* ---------------------------------- hook ---------------------------------- */

/** Everything the panel needs, already limited to the signed-in operator's portfolio (workspaces and their seats). */
export function useOperatorWorkspace() {
  const all = useAllContent();
  const { operator, setOperatorId } = useOperatorSession();
  const [overrides, setOverrides] = useSeatOverrides();
  const [readList, setReadList] = useStored<string[]>(READ_KEY, []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const workspaces = useMemo(() => WORKSPACES.filter((w) => w.operatorId === operator.id), [operator.id]);
  const seats = useMemo<SeatAccount[]>(
    () =>
      SEATS.flatMap((s) => {
        const workspace = workspaces.find((w) => w.id === s.workspaceId);
        return workspace ? [{ ...s, workspace, cadence: overrides[s.id]?.cadence ?? s.cadence }] : [];
      }),
    [workspaces, overrides],
  );
  const seatIds = useMemo(() => new Set(seats.map((s) => s.id)), [seats]);
  const posts = useMemo(() => all.drafts.filter((p) => seatIds.has(seatOf(p))), [all.drafts, seatIds]);
  const readKeys = useMemo(() => new Set(readList), [readList]);
  const notifications = useMemo(
    () => deriveNotifications(posts, seats, readKeys, now),
    [posts, seats, readKeys, now],
  );

  const markRead = useCallback(
    (keys: string[]) => setReadList(Array.from(new Set([...readList, ...keys]))),
    [readList, setReadList],
  );

  const setSeatOverride = useCallback(
    (seatId: string, patch: SeatOverride) =>
      setOverrides({ ...overrides, [seatId]: { ...overrides[seatId], ...patch } }),
    [overrides, setOverrides],
  );

  const unread = notifications.filter((n) => !n.read);
  const counts = {
    unread: unread.length,
    ideas: notifications.filter((n) => n.type === "idea" && !n.read).length,
    feedback: notifications.filter((n) => n.type === "feedback" && !n.read).length,
    gaps: notifications.filter((n) => n.type === "gap").length,
  };

  return {
    operator,
    setOperatorId,
    workspaces,
    seats,
    seatIds,
    posts,
    requests: all.requests,
    now,
    notifications,
    counts,
    overrides,
    markRead,
    setSeatOverride,
    getSeat: (id: string) => seats.find((s) => s.id === id),
  };
}
