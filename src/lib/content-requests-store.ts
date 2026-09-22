import { useEffect, useMemo, useState } from "react";
import { CALENDAR_SAMPLES, TEAM_DRAFT_SAMPLES } from "@/lib/post-samples";
import { DEFAULT_SEAT_ID, addDays, startOfWeek } from "@/lib/operator-data";

/**
 * Prototype-only store shared by the client platform and the Operator Panel.
 * Ideas sent to the Isla team, the drafts the team writes, and the conversation about them.
 * Records carry a `seatId` (content is written and published per seat); the client platform only ever sees the default seat.
 */

export type IdeaRequest = {
  id: string;
  hook: string;
  pillar: string;
  note?: string;
  sentAt: string;
  /** "changes" = a draft the user sent back to the team. */
  status: "with_isla" | "changes";
  /** The draft this request is about. */
  draftId?: string;
  seatId?: string;
};

export type ThreadMessage = { id: string; role: "user" | "team"; text: string; at: string };

export type PostVersion = {
  n: number;
  body: string;
  image?: string;
  suggestedAt: string | null;
  sentAt: string;
  author: string;
};

export type TeamDraft = {
  id: string;
  seatId?: string;
  /** Full post text as the client sees it — the first line is the title shown in lists. */
  body: string;
  preparedBy: string;
  preparedAt: string;
  /** Optional image the team attached to the post. */
  image?: string;
  /** ISO date-time proposed by the team, if any. */
  suggestedAt: string | null;
  /**
   * "draft"   = private to the operator (never shown to the client)
   * "writing" = an idea the client sent that the team is still turning into a post
   */
  status: "draft" | "writing" | "awaiting" | "approved" | "changes";
  origin?: "idea" | "operator";
  /** Messages exchanged about this post: the client asks for changes, the operator answers. */
  thread?: ThreadMessage[];
  /** Where the post stood before changes were requested, restored if every message is deleted. */
  statusBeforeChanges?: "awaiting" | "approved";
  /** Set on approval — a draft can never be approved without one. */
  scheduledAt?: string;
  approvedAt?: string;
  /** Every version the operator sent for approval. */
  versions?: PostVersion[];
  /** The operator's working copy, not visible to the client until it is sent. */
  operator?: {
    draftBody: string;
    draftImage?: string;
    draftSuggestedAt: string | null;
    updatedAt: string;
    author: string;
  };
  /** When the operator last looked at the client's messages on this post. */
  operatorSeenAt?: string;
};

export type ContentState = { requests: IdeaRequest[]; drafts: TeamDraft[] };

const KEY = "isla.content.v5";
export const CONTENT_EVENT = "isla:content-change";

export const seatOf = (x: { seatId?: string }) => x.seatId ?? DEFAULT_SEAT_ID;

export const draftTitle = (d: Pick<TeamDraft, "body">) => d.body.split("\n")[0]!.trim();

/** Title as the operator sees it (their working copy wins). */
export const postTitle = (d: Pick<TeamDraft, "body" | "operator">) =>
  (d.operator?.draftBody || d.body).split("\n")[0]!.trim() || "Untitled post";

/* ------------------------------ seed data ------------------------------ */

function at(daysFromNow: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function ago(hours: number) {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

/** ISO date-time of a day (0 = Monday) in the current week (+ `week` weeks). */
function weekAt(week: number, day: number, hour: number, minute = 0) {
  const d = addDays(startOfWeek(new Date()), week * 7 + day);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const SOURCES = [
  ...TEAM_DRAFT_SAMPLES.map((s) => ({ body: s.body, image: s.image })),
  ...CALENDAR_SAMPLES.map((s) => ({ body: s.body, image: s.image })),
];

function seed(): ContentState {
  let pick = 0;
  const drafts: TeamDraft[] = [];
  const requests: IdeaRequest[] = [];

  const source = () => SOURCES[pick++ % SOURCES.length]!;

  const post = (seatId: string, n: number, over: Partial<TeamDraft>): TeamDraft => {
    const src = source();
    const preparedAt = over.preparedAt ?? ago(30);
    return {
      id: `sd-${seatId}-${n}`,
      seatId,
      body: src.body,
      image: src.image,
      preparedBy: "Isla team",
      preparedAt,
      suggestedAt: null,
      status: "awaiting",
      origin: "operator",
      versions: [
        {
          n: 1,
          body: src.body,
          image: src.image,
          suggestedAt: over.suggestedAt ?? null,
          sentAt: preparedAt,
          author: "Laura Mendes",
        },
      ],
      ...over,
    };
  };

  const approved = (seatId: string, n: number, week: number, day: number, hour: number, min = 0) => {
    const when = weekAt(week, day, hour, min);
    drafts.push(
      post(seatId, n, {
        status: "approved",
        suggestedAt: when,
        scheduledAt: when,
        approvedAt: ago(20 + n * 3),
        preparedAt: ago(48 + n),
      }),
    );
  };

  const idea = (seatId: string, n: number, hook: string, note: string | undefined, hoursAgo: number) => {
    const id = `sd-idea-${seatId}-${n}`;
    const sentAt = ago(hoursAgo);
    drafts.push({
      id,
      seatId,
      body: `${hook}\n\nOur team is writing this post. The full draft will show up in "Awaiting your approval" as soon as it's ready.`,
      preparedBy: "Isla team",
      preparedAt: sentAt,
      suggestedAt: null,
      status: "writing",
      origin: "idea",
      thread: note ? [{ id: `${id}-m1`, role: "user", text: note, at: sentAt }] : [],
    });
    requests.push({
      id: `req-${id}`,
      seatId,
      hook,
      pillar: "Content",
      note,
      sentAt,
      status: "with_isla",
      draftId: id,
    });
  };

  // Nortex — the client whose real platform runs in this mockup.
  const nortexBodies = TEAM_DRAFT_SAMPLES;
  drafts.push(
    {
      id: "td1",
      body: nortexBodies[0]!.body,
      image: nortexBodies[0]!.image,
      preparedBy: "Isla team",
      preparedAt: ago(2),
      suggestedAt: at(2, 9),
      status: "awaiting",
      origin: "operator",
      versions: [{ n: 1, body: nortexBodies[0]!.body, image: nortexBodies[0]!.image, suggestedAt: at(2, 9), sentAt: ago(2), author: "Laura Mendes" }],
    },
    {
      id: "td2",
      body: nortexBodies[1]!.body,
      image: nortexBodies[1]!.image,
      preparedBy: "Isla team",
      preparedAt: ago(26),
      suggestedAt: at(4, 14, 30),
      status: "awaiting",
      origin: "operator",
      versions: [{ n: 1, body: nortexBodies[1]!.body, image: nortexBodies[1]!.image, suggestedAt: at(4, 14, 30), sentAt: ago(26), author: "Laura Mendes" }],
    },
    {
      id: "td3",
      body: nortexBodies[2]!.body,
      image: nortexBodies[2]!.image,
      preparedBy: "Isla team",
      preparedAt: ago(72),
      suggestedAt: null,
      status: "awaiting",
      origin: "operator",
      versions: [{ n: 1, body: nortexBodies[2]!.body, image: nortexBodies[2]!.image, suggestedAt: null, sentAt: ago(72), author: "Laura Mendes" }],
    },
  );

  // Lumen.io — fully covered this week.
  approved("lumen", 1, 0, 1, 9);
  approved("lumen", 2, 0, 2, 11, 30);
  approved("lumen", 3, 0, 4, 8, 30);
  approved("lumen", 4, 1, 2, 10);
  drafts.push(post("lumen", 5, { suggestedAt: weekAt(1, 0, 9), preparedAt: ago(6) }));

  // Brightpath — one scheduled, one waiting on the operator to address feedback.
  approved("brightpath", 1, 0, 3, 9);
  const bpFeedback = post("brightpath", 2, {
    status: "changes",
    suggestedAt: weekAt(0, 4, 10),
    statusBeforeChanges: "awaiting",
    preparedAt: ago(30),
    thread: [
      {
        id: "sd-brightpath-2-m1",
        role: "user",
        text: "Can we make the opening sharper and drop the second stat? It feels like too much for a first read.",
        at: ago(3),
      },
    ],
  });
  drafts.push(bpFeedback);
  requests.push({
    id: "req-sd-brightpath-2",
    seatId: "brightpath",
    hook: postTitle(bpFeedback),
    pillar: "Changes requested",
    note: bpFeedback.thread![0]!.text,
    sentAt: bpFeedback.thread![0]!.at,
    status: "changes",
    draftId: bpFeedback.id,
  });

  // Orbital Labs — an idea nobody has started yet, nothing scheduled.
  idea("orbital", 1, "How we onboard enterprise customers in 10 days", "Please keep the tone technical but friendly.", 5);

  // Kestrel Analytics — on target.
  approved("kestrel", 1, 0, 1, 14);
  approved("kestrel", 2, 0, 3, 9, 30);
  drafts.push(post("kestrel", 3, { suggestedAt: weekAt(0, 4, 10), preparedAt: ago(20) }));

  // Pine & Co — a private draft in progress and one waiting for the client; nothing scheduled.
  const pineText =
    "Succession is not a legal event. It's a family conversation.\n\nMost owners start the paperwork at 60. The good ones start the conversation at 45.\n\nHere are the three questions I ask every family before we open a single document:\n\n1. Who do you want to run this in ten years?\n2. What would you regret not saying out loud?\n3. What does \"fair\" mean to each of you?";
  drafts.push({
    id: "sd-pine-1",
    seatId: "pine",
    body: pineText.split("\n")[0]!,
    preparedBy: "Isla team",
    preparedAt: ago(4),
    suggestedAt: null,
    status: "draft",
    origin: "operator",
    operator: {
      draftBody: pineText,
      draftSuggestedAt: weekAt(0, 2, 10),
      updatedAt: ago(2),
      author: "Laura Mendes",
    },
  });
  drafts.push(post("pine", 2, { suggestedAt: weekAt(0, 3, 15), preparedAt: ago(30) }));

  // Vantage Cloud — almost there (3 of 4).
  approved("vantage", 1, 0, 0, 9);
  approved("vantage", 2, 0, 1, 9);
  approved("vantage", 3, 0, 3, 9);
  approved("vantage", 4, 1, 1, 9);

  // Helio Health — one scheduled, one new idea with a note from the client.
  approved("helio", 1, 0, 2, 16);
  idea("helio", 2, "What our clinics learned about patient onboarding", "Please mention the pilot with the 3 clinics.", 26);

  // More Nortex founders: each seat has its own content and cadence.
  approved("nortex-ana", 1, 0, 1, 10);
  approved("nortex-ana", 2, 0, 3, 11);
  idea("nortex-diego", 1, "What breaking up our monolith taught us about hiring", "Focus on the hiring angle, not the tech.", 7);

  // A second seat at Lumen.io and at Vantage Cloud.
  approved("lumen-tiago", 1, 0, 2, 9);
  approved("vantage-elisa", 1, 0, 2, 15);
  const elisaFeedback = post("vantage-elisa", 2, {
    status: "changes",
    suggestedAt: weekAt(0, 4, 9),
    statusBeforeChanges: "awaiting",
    preparedAt: ago(20),
    thread: [
      {
        id: "sd-vantage-elisa-2-m1",
        role: "user",
        text: "Could we add the retention number from the Q2 deck? It makes the point much stronger.",
        at: ago(1),
      },
    ],
  });
  drafts.push(elisaFeedback);
  requests.push({
    id: "req-sd-vantage-elisa-2",
    seatId: "vantage-elisa",
    hook: postTitle(elisaFeedback),
    pillar: "Changes requested",
    note: elisaFeedback.thread![0]!.text,
    sentAt: elisaFeedback.thread![0]!.at,
    status: "changes",
    draftId: elisaFeedback.id,
  });

  // Another operator's portfolio: must stay invisible to Laura.
  approved("aurora", 1, 0, 0, 10);
  approved("aurora", 2, 0, 2, 10);
  approved("aurora", 3, 0, 4, 10);
  idea("nimbus", 1, "Why we stopped using engagement surveys", undefined, 8);
  drafts.push(post("cobalt", 1, { suggestedAt: weekAt(0, 3, 11), preparedAt: ago(10) }));

  return { requests, drafts };
}

/* ------------------------------ persistence ------------------------------ */

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

const uid = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/* ------------------------- client platform actions ------------------------- */

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
    origin: "idea",
    thread: trimmed ? [{ id: `m-${Date.now()}`, role: "user", text: trimmed, at: now }] : [],
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
            approvedAt: new Date().toISOString(),
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
            seatId: draft.seatId,
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

/* --------------------------- operator panel actions --------------------------- */

/** New private post for a client, optionally pre-filled and with a suggested date. */
export function createOperatorPost(input: {
  seatId: string;
  author: string;
  suggestedAt?: Date | null;
}): string {
  const s = load();
  const now = new Date().toISOString();
  const id = uid("op");
  const draft: TeamDraft = {
    id,
    seatId: input.seatId,
    body: "Untitled post",
    preparedBy: "Isla team",
    preparedAt: now,
    suggestedAt: null,
    status: "draft",
    origin: "operator",
    operator: {
      draftBody: "",
      draftSuggestedAt: input.suggestedAt ? input.suggestedAt.toISOString() : null,
      updatedAt: now,
      author: input.author,
    },
  };
  save({ ...s, drafts: [draft, ...s.drafts] });
  return id;
}

/** Saves the operator's working copy. The client does not see it until it is sent. */
export function saveOperatorDraft(
  id: string,
  patch: { body: string; image?: string | null; suggestedAt: Date | null },
  author: string,
) {
  const s = load();
  save({
    ...s,
    drafts: s.drafts.map((d) =>
      d.id === id
        ? {
            ...d,
            operator: {
              draftBody: patch.body,
              draftImage: patch.image ?? undefined,
              draftSuggestedAt: patch.suggestedAt ? patch.suggestedAt.toISOString() : null,
              updatedAt: new Date().toISOString(),
              author,
            },
          }
        : d,
    ),
  });
}

/**
 * Sends a new version to the client for approval. It becomes what the client sees in
 * Approvals, resolves any open change request and keeps the whole history.
 */
export function sendForApproval(
  id: string,
  payload: { body: string; image?: string | null; suggestedAt: Date | null },
  author: string,
): number {
  const s = load();
  const draft = s.drafts.find((d) => d.id === id);
  if (!draft) return 0;
  const now = new Date().toISOString();
  const versions = [
    ...(draft.versions ?? []),
    {
      n: (draft.versions?.length ?? 0) + 1,
      body: payload.body,
      image: payload.image ?? undefined,
      suggestedAt: payload.suggestedAt ? payload.suggestedAt.toISOString() : null,
      sentAt: now,
      author,
    },
  ];
  save({
    requests: s.requests.filter((r) => r.draftId !== id),
    drafts: s.drafts.map((d) =>
      d.id === id
        ? {
            ...d,
            body: payload.body,
            image: payload.image ?? undefined,
            suggestedAt: payload.suggestedAt ? payload.suggestedAt.toISOString() : null,
            status: "awaiting",
            statusBeforeChanges: undefined,
            preparedAt: now,
            preparedBy: "Isla team",
            versions,
            operatorSeenAt: now,
            operator: {
              draftBody: payload.body,
              draftImage: payload.image ?? undefined,
              draftSuggestedAt: payload.suggestedAt ? payload.suggestedAt.toISOString() : null,
              updatedAt: now,
              author,
            },
          }
        : d,
    ),
  });
  return versions.length;
}

/** The operator answers in the conversation; the client sees it as "Isla team". */
export function operatorReply(id: string, text: string) {
  const s = load();
  const now = new Date().toISOString();
  save({
    ...s,
    drafts: s.drafts.map((d) =>
      d.id === id
        ? {
            ...d,
            operatorSeenAt: now,
            thread: [...(d.thread ?? []), { id: uid("t"), role: "team" as const, text, at: now }],
          }
        : d,
    ),
  });
}

export function markOperatorSeen(id: string) {
  const s = load();
  const draft = s.drafts.find((d) => d.id === id);
  if (!draft) return;
  const lastUser = [...(draft.thread ?? [])].reverse().find((m) => m.role === "user");
  if (!lastUser || (draft.operatorSeenAt && draft.operatorSeenAt >= lastUser.at)) return;
  save({
    ...s,
    drafts: s.drafts.map((d) => (d.id === id ? { ...d, operatorSeenAt: new Date().toISOString() } : d)),
  });
}

/* --------------------------------- hooks --------------------------------- */

/** Everything, for every client — used by the Operator Panel. */
export function useAllContent(): ContentState {
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

/** What the client platform sees: only its own client, never the operator's private drafts. */
export function useContentStore(): ContentState {
  const all = useAllContent();
  return useMemo(
    () => ({
      requests: all.requests.filter((r) => seatOf(r) === DEFAULT_SEAT_ID),
      drafts: all.drafts.filter((d) => seatOf(d) === DEFAULT_SEAT_ID && d.status !== "draft"),
    }),
    [all],
  );
}
