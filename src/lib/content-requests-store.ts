import { useEffect, useState } from "react";
import { TEAM_DRAFT_SAMPLES } from "@/lib/post-samples";

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
  /** Optional image the team attached to the post. */
  image?: string;
  /** ISO date-time proposed by the team, if any. */
  suggestedAt: string | null;
  status: "awaiting" | "approved" | "changes";
  /** Set on approval — a draft can never be approved without one. */
  scheduledAt?: string;
};

type ContentState = { requests: IdeaRequest[]; drafts: TeamDraft[] };

const KEY = "isla.content.v2";
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
        body: TEAM_DRAFT_SAMPLES[0]!.body,
        image: TEAM_DRAFT_SAMPLES[0]!.image,
        preparedBy: "Isla team",
        preparedAt: ago(2),
        suggestedAt: at(2, 9),
        status: "awaiting",
      },
      {
        id: "td2",
        body: TEAM_DRAFT_SAMPLES[1]!.body,
        image: TEAM_DRAFT_SAMPLES[1]!.image,
        preparedBy: "Isla team",
        preparedAt: ago(26),
        suggestedAt: at(4, 14, 30),
        status: "awaiting",
      },
      {
        id: "td3",
        body: TEAM_DRAFT_SAMPLES[2]!.body,
        image: TEAM_DRAFT_SAMPLES[2]!.image,
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
export function approveDraft(id: string, scheduledAt: Date, image?: string | null) {
  const s = load();
  save({
    ...s,
    drafts: s.drafts.map((d) =>
      d.id === id
        ? {
            ...d,
            image: image === undefined ? d.image : (image ?? undefined),
            status: "approved",
            scheduledAt: scheduledAt.toISOString(),
          }
        : d,
    ),
  });
}

/** The user can only change the date and the image of a post — the text is written by the team. */
export function updateTeamDraft(
  id: string,
  patch: { date?: Date | null; image?: string | null },
) {
  const s = load();
  save({
    ...s,
    drafts: s.drafts.map((d) => {
      if (d.id !== id) return d;
      const iso = patch.date === undefined ? undefined : patch.date ? patch.date.toISOString() : null;
      return {
        ...d,
        ...(patch.image !== undefined ? { image: patch.image ?? undefined } : {}),
        ...(iso === undefined
          ? {}
          : d.status === "approved"
            ? iso
              ? { scheduledAt: iso }
              : {}
            : { suggestedAt: iso }),
      };
    }),
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
