import { useEffect, useState } from "react";

/** Prototype-only store for the managed flow: ideas sent to the Isla team and the drafts they send back. */

export type IdeaRequest = {
  id: string;
  hook: string;
  pillar: string;
  note?: string;
  sentAt: string;
  /** "changes" = a draft the user sent back to the team. */
  status: "with_isla" | "changes";
};

export type TeamDraft = {
  id: string;
  /** Full post text — the first line is the title shown in lists. */
  body: string;
  preparedBy: string;
  preparedAt: string;
  /** ISO date-time proposed by the team, if any. */
  suggestedAt: string | null;
  status: "awaiting" | "approved" | "changes";
  /** Set on approval — a draft can never be approved without one. */
  scheduledAt?: string;
};

type ContentState = { requests: IdeaRequest[]; drafts: TeamDraft[] };

const KEY = "isla.content.v1";
export const CONTENT_EVENT = "isla:content-change";

export const draftTitle = (d: Pick<TeamDraft, "body">) => d.body.split("\n")[0]!.trim();

function at(daysFromNow: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function ago(hours: number) {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

function seed(): ContentState {
  return {
    requests: [],
    drafts: [
      {
        id: "td1",
        body: "Stop measuring marketing by leads. Measure defensible pipeline.\n\nTwo years ago I would have laughed at this. Then I watched two teams hit their MQL number and still lose every strategic room.\n\nWe stopped reporting on volume. We started reporting on named accounts and named humans.\n\nWhat's the one metric your team defends that you privately think is a waste of time?",
        preparedBy: "Isla team",
        preparedAt: ago(2),
        suggestedAt: at(2, 9),
        status: "awaiting",
      },
      {
        id: "td2",
        body: "The best salespeople I hired asked me the sharpest questions.\n\nNot about commission. About the customer, the buying committee and what we'd do if the deal stalled in week three.\n\nHire for curiosity first — the rest can be coached.",
        preparedBy: "Isla team",
        preparedAt: ago(26),
        suggestedAt: at(4, 14, 30),
        status: "awaiting",
      },
      {
        id: "td3",
        body: "I killed 40% of our roadmap. Revenue went up.\n\nHere is what we cut, how we decided, and the one conversation that made it easy.\n\nSaying no is a growth strategy.",
        preparedBy: "Isla team",
        preparedAt: ago(72),
        suggestedAt: null,
        status: "awaiting",
      },
    ],
  };
}

function load(): ContentState {
  if (typeof window === "undefined") return { requests: [], drafts: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as ContentState;
  } catch {
    /* fall through to a fresh seed */
  }
  const fresh = seed();
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

function save(next: ContentState) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CONTENT_EVENT));
}

export function addIdeaRequest(idea: { hook: string; pillar: string }, note?: string) {
  const s = load();
  save({
    ...s,
    requests: [
      {
        id: `req-${Date.now()}`,
        hook: idea.hook,
        pillar: idea.pillar,
        note: note?.trim() || undefined,
        sentAt: new Date().toISOString(),
        status: "with_isla",
      },
      ...s.requests,
    ],
  });
}

/** Approving always requires a date — callers must pass one. */
export function approveDraft(id: string, scheduledAt: Date, body?: string) {
  const s = load();
  save({
    ...s,
    drafts: s.drafts.map((d) =>
      d.id === id
        ? { ...d, body: body ?? d.body, status: "approved", scheduledAt: scheduledAt.toISOString() }
        : d,
    ),
  });
}

export function requestDraftChanges(id: string, note?: string) {
  const s = load();
  const draft = s.drafts.find((d) => d.id === id);
  if (!draft) return;
  save({
    requests: [
      {
        id: `chg-${id}-${Date.now()}`,
        hook: draftTitle(draft),
        pillar: "Changes requested",
        note: note?.trim() || undefined,
        sentAt: new Date().toISOString(),
        status: "changes",
      },
      ...s.requests,
    ],
    drafts: s.drafts.map((d) => (d.id === id ? { ...d, status: "changes" } : d)),
  });
}

export function useContentStore(): ContentState {
  const [state, setState] = useState<ContentState>({ requests: [], drafts: [] });
  useEffect(() => {
    const sync = () => setState(load());
    sync();
    window.addEventListener(CONTENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONTENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}
