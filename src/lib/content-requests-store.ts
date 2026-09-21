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
  /** The draft this request is about, for change requests. */
  draftId?: string;
};

export type ThreadMessage = { id: string; role: "user" | "team"; text: string; at: string };

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
  /** "writing" = an idea the user sent that the team is still turning into a post. */
  status: "awaiting" | "approved" | "changes" | "writing";
  /** Messages the user sent asking for changes; the Isla team answers manually. */
  thread?: ThreadMessage[];
  /** Where the post stood before changes were requested, restored if every message is deleted. */
  statusBeforeChanges?: "awaiting" | "approved";
  /** Set on approval — a draft can never be approved without one. */
  scheduledAt?: string;
};

type ContentState = { requests: IdeaRequest[]; drafts: TeamDraft[] };

const KEY = "isla.content.v3";
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
  const now = new Date().toISOString();
  const draftId = `td-idea-${Date.now()}`;
  const trimmed = note?.trim();
  const draft: TeamDraft = {
    id: draftId,
    body: `${idea.hook}\n\nOur team is writing this post. The full draft will show up in "Awaiting your approval" as soon as it's ready.`,
    preparedBy: "Isla team",
    preparedAt: now,
    suggestedAt: null,
    status: "writing",
    thread: trimmed
      ? [{ id: `m-${Date.now()}`, role: "user", text: trimmed, at: now }]
      : [],
  };
  save({
    drafts: [draft, ...s.drafts],
    requests: [
      {
        id: `req-${Date.now()}`,
        hook: idea.hook,
        pillar: idea.pillar,
        note: trimmed || undefined,
        sentAt: now,
        status: "with_isla",
        draftId,
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

/**
 * The user asks the team for changes. The first message sends the post back to the
 * team; later messages just continue the conversation.
 */
export function sendChangeRequest(id: string, text: string) {
  const s = load();
  const draft = s.drafts.find((d) => d.id === id);
  if (!draft) return;
  const message: ThreadMessage = {
    id: `m-${Date.now()}`,
    role: "user",
    text,
    at: new Date().toISOString(),
  };
  if (draft.status === "writing") {
    save({
      ...s,
      drafts: s.drafts.map((d) =>
        d.id === id ? { ...d, thread: [...(d.thread ?? []), message] } : d,
      ),
    });
    return;
  }
  const firstRequest = draft.status !== "changes";
  save({
    requests: firstRequest
      ? [
          {
            id: `chg-${id}-${Date.now()}`,
            hook: draftTitle(draft),
            pillar: "Changes requested",
            note: text.trim() || undefined,
            sentAt: message.at,
            status: "changes",
            draftId: id,
          },
          ...s.requests,
        ]
      : s.requests,
    drafts: s.drafts.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "changes",
            statusBeforeChanges: firstRequest
              ? d.status === "approved"
                ? "approved"
                : "awaiting"
              : d.statusBeforeChanges,
            thread: [...(d.thread ?? []), message],
          }
        : d,
    ),
  });
}

/** Deleting your last message withdraws the request: the post goes back to where it was. */
export function deleteChangeRequest(id: string, messageId: string) {
  const s = load();
  const draft = s.drafts.find((d) => d.id === id);
  if (!draft) return;
  const thread = (draft.thread ?? []).filter((m) => m.id !== messageId);
  if (draft.status === "writing") {
    save({ ...s, drafts: s.drafts.map((d) => (d.id === id ? { ...d, thread } : d)) });
    return;
  }
  const withdrawn = !thread.some((m) => m.role === "user");
  save({
    requests: withdrawn ? s.requests.filter((r) => r.draftId !== id) : s.requests,
    drafts: s.drafts.map((d) =>
      d.id === id
        ? withdrawn
          ? { ...d, thread: [], status: d.statusBeforeChanges ?? "awaiting", statusBeforeChanges: undefined }
          : { ...d, thread }
        : d,
    ),
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
