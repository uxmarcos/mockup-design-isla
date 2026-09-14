import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import islaAiIcon from "@/assets/isla-ai-icon.svg";


import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import {
  Heart,
  X,
  Undo2,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Mic,
  MessageSquare,
  Check,
  Bold,
  Italic,
  Heading1,
  List,
  Loader2,
  Wand2,
  Users,
  FileText,
  Plus,
  Paperclip,
  CalendarClock,
  Eye,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Linkedin,
  ArrowDown,
  Image as ImageIcon,
  Trash2,
  Waypoints,
  PhoneOff,
  Phone,
  Keyboard,
  Volume2,
  Save,
  Edit3,
  LayoutGrid,
  Rows3,
  CalendarDays,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  ThumbsDown,
  Flame,



} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import chrisAvatar from "@/assets/chris-theroux.jpg";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { HubBreadcrumb } from "@/components/content/HubBreadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {

  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { IDEAS, FEED_IDEAS } from "@/lib/idea-data";

const searchSchema = z.object({
  tab: z.enum(["ideas", "liked", "drafts", "schedule"]).optional(),
  start: z.literal("scratch").optional(),
  topic: z.string().optional(),
  /** Opens the editor in edit mode for an existing post (title used as content seed). */
  edit: z.string().optional(),
  /** ISO date of the post being edited, when it is already scheduled. */
  at: z.string().optional(),
  /** Where the user came from, so the breadcrumb reflects the real path. */
  from: z.string().optional(),
  /** Opens the editor directly with this text as the starting point. */
  seed: z.string().optional(),
  /** Known idea id backing the seed, so the editor keeps the full idea context. */
  ideaId: z.string().optional(),
  /** Pillar/context label shown for a free-text seed. */
  pillar: z.string().optional(),
  /** "1" → the seed is the user's own copy and becomes the draft body verbatim. */
  raw: z.literal("1").optional(),
});

export const Route = createFileRoute("/post-ideas")({
  head: () => ({
    meta: [
      { title: "Create Content — Isla" },
      {
        name: "description",
        content:
          "Pick an idea, let the AI interview you, and turn the conversation into a LinkedIn post.",
      },
    ],
  }),
  validateSearch: (search) => searchSchema.parse(search),
  component: PostIdeasPage,
});

/* ============================ TYPES ============================ */

type Idea = {
  id: string;
  hook: string;
  angle: string;
  pillar: string;
  why: string;
  tags: string[];
  trending?: boolean;
  source?: string;
};


const BLANK_IDEA: Idea = {
  id: "blank",
  hook: "",
  angle: "New post",
  pillar: "From scratch",
  why: "",
  tags: [],
};

type Stage = "manager" | "interview" | "hooks" | "draft" | "call" | "call-hooks" | "select-refinement";

type PostStatus =
  | "Isla Review"
  | "VR Review"
  | "Ready to Post"
  | "Posted"
  | "Missed";

type DraftRecord = {
  id: string;
  idea: Idea;
  hook: string;
  content: string;
  createdAt: string; // ISO
  reviewRequested?: boolean;
  scheduledAt?: string | null;
  status?: PostStatus;
};

type ManagerTab = "ideas" | "liked" | "drafts" | "schedule";
type FeedFilter = "all" | "saved";


function IslaLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 960 925" fill="none" className={className}>
      <path d="M536.142 100.408C617.823 97.3663 698.237 109.907 743.553 186.745C756.025 213.541 775.181 225.944 789.001 234.891C793.956 238.099 798.226 240.863 801.255 243.687C806.547 248.768 822.139 257.196 838.854 266.23C860.509 277.935 884.049 290.657 889.513 298.438C935.357 362.84 941.558 400.973 939.736 478.121C924.704 552.361 864.077 728.198 741.826 837.625C667.606 878.783 603.995 909.886 519.418 903.391C517.088 903.234 514.745 903.081 512.393 902.928C495.809 901.845 478.784 900.733 462.601 897.943C448.638 895.856 435.057 892.397 421.46 888.934C413.603 886.934 405.74 884.931 397.794 883.191C393.115 882.167 388.502 881.167 383.95 880.18C312.138 864.608 255.563 852.34 197.169 799.905C186.247 790.098 177.864 778.594 169.309 766.854C168.365 765.559 167.418 764.26 166.466 762.961C130.765 714.231 103.943 660.403 100.591 599.023C99.1833 573.235 100.269 545.83 104.066 520.261C105.214 512.527 106.757 504.852 108.298 497.179C109.433 491.532 110.567 485.885 111.545 480.216C112.767 473.126 114.01 466.033 115.255 458.936C120.316 430.063 125.388 401.13 129.096 372.092C131.388 354.152 132.749 336.234 134.117 318.246C134.36 315.045 134.604 311.841 134.853 308.635C135.019 306.497 135.177 304.355 135.335 302.213C136.393 287.821 137.456 273.36 141.168 259.384C146.922 237.711 157.833 215.982 172.88 199.276C248.503 115.318 410.692 106.912 524.641 101.007C528.533 100.805 532.369 100.607 536.142 100.408ZM555.762 203.891C476.003 153.946 378.379 114.173 298.817 164.432C181.783 238.364 127.873 357.796 169.755 514.099C203.015 638.229 260.425 729.632 324.502 798.629C425.379 907.252 603.535 847.893 708.123 742.837C817.866 632.602 923.863 546.139 887.856 411.759C841.921 240.326 720.719 307.186 555.762 203.891Z" fill="#FFFFFF"/>
    </svg>
  );
}

/* ============================ MOCK DATA ============================ */

const HOOK_TEMPLATES = (idea: Idea) => [
  `I killed the "${idea.pillar.toLowerCase()}" report last quarter. Here's what happened next.`,
  `Everyone told me ${idea.tags[0]} was the answer. They were measuring the wrong thing.`,
  `The uncomfortable truth about ${idea.pillar.toLowerCase()} that nobody in the room wants to say out loud:`,
  `3 years ago I would have disagreed with this post. Today I'd bet the company on it.`,
  `Your ${idea.tags[0]} strategy is probably fine. Your ${idea.tags[1] ?? "measurement"} strategy is what's killing you.`,
];

const DRAFT_TEMPLATE = (idea: Idea, hook: string) => `${hook}

Two years ago I would have laughed at this idea. Then I watched it play out inside our own team.

We were shipping fast, hitting our numbers on paper, and losing every strategic conversation in the boardroom. The metrics looked clean. The story was empty.

Here's what changed:

→ We stopped reporting on volume.
→ We started reporting on named accounts and named humans.
→ Every number came with a story a non-${idea.pillar.toLowerCase()} person could repeat.

Suddenly the conversation shifted. We weren't defending our function anymore — we were shaping the roadmap.

The lesson: ${idea.angle.toLowerCase()}

If your dashboards can't survive a hostile question from someone outside your team, you don't have a dashboard. You have a comfort blanket.

Curious — what's the one metric your team defends that you privately think is a waste of time?`;

const INTERVIEW_QUESTIONS = [
  "What happened that made you realize this?",
  "Who exactly do you disagree with — and what's the cost of ignoring it?",
  "After reading your post, what should someone do or believe differently on Monday morning?",
];

const MOCK_TRANSCRIPTS = [
  "So basically I was building the pipeline dashboard for our head of sales, and I realized the number he actually cared about was nowhere on it — he just wanted to know which deals were slipping this week, and everything else was noise.",
  "I disagree with the CFO playbook of measuring marketing on MQL volume. The cost is real — I've watched two teams get gutted because they hit their MQL number but couldn't defend a single deal in QBR.",
  "Stop reporting on lead count in your next leadership meeting. Bring three deals you influenced, name the humans, and tell the story. That's the only version of marketing accountability that survives a downturn.",
];

const REFINEMENT_PRESETS = [
  "Make it shorter",
  "Add more storytelling",
  "Be more controversial",
  "More technical",
  "Less salesy",
];

/* ============================ ROOT ============================ */

function PostIdeasPage() {
  const {
    tab: searchTab,
    start: startParam,
    topic: topicParam,
    edit: editParam,
    at: atParam,
    from: fromParam,
    seed: seedParam,
    ideaId: ideaIdParam,
    pillar: pillarParam,
    raw: rawParam,
  } = Route.useSearch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useSidebarState();
  const [stage, setStage] = useState<Stage>("manager");

  // The feed mixes personalized ideas with timely trending opportunities.
  const [deck, setDeck] = useState<Idea[]>(FEED_IDEAS);
  // "Salvar para depois" collection — a secondary action, never a required step.
  const [liked, setLiked] = useState<Idea[]>(() => IDEAS.slice(6, 8));

  const [history, setHistory] = useState<{ idea: Idea; decision: "like" | "pass" }[]>([]);

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  // When set, the editor is editing an existing post instead of creating one.
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<DraftRecord | null>(null);
  const [drafts, setDrafts] = useState<DraftRecord[]>(() => {
    const at = (dayOffset: number, hour: number, minute: number) => {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      d.setHours(hour, minute, 0, 0);
      return d.toISOString();
    };
    const mk = (
      id: string,
      ideaIdx: number,
      scheduledAt: string | null,
      createdOffsetH: number,
      status?: PostStatus,
      hookIdx = 0,
    ): DraftRecord => {
      const idea = IDEAS[ideaIdx];
      const hooks = HOOK_TEMPLATES(idea);
      const hook = hooks[hookIdx % hooks.length]!;
      return {
        id,
        idea,
        hook,
        content: DRAFT_TEMPLATE(idea, hook),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * createdOffsetH).toISOString(),
        reviewRequested: false,
        scheduledAt,
        status,
      };
    };
    return [
      mk("d-mock-1", 0, null, 6, undefined, 0),
      mk("d-mock-2", 1, null, 26, undefined, 2),
      mk("d-sched-1", 2, at(0, 10, 30), 30, "Isla Review", 1),
      mk("d-sched-2", 3, at(0, 15, 0), 34, "VR Review", 3),
      mk("d-sched-3", 4, at(1, 9, 0), 40, "Ready to Post", 4),
      mk("d-sched-4", 5, at(4, 14, 30), 52, "Ready to Post", 2),
    ];

  });

  // Create Content is only about starting: ideas feed + optional saved ideas.
  const managerTab: ManagerTab = "ideas";
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const setManagerTab = useCallback(
    (_t: ManagerTab) => {
      navigate({ to: "/post-ideas", search: (prev) => ({ ...prev, tab: undefined }) });
    },
    [navigate],
  );

  const [callIdeas, setCallIdeas] = useState<Idea[]>([]);
  const [callHookIdx, setCallHookIdx] = useState(0);
  const [callHookSelections, setCallHookSelections] = useState<Record<string, string>>({});


  const [scratch, setScratch] = useState(false);

  // Deep-link: /post-ideas?start=scratch opens an empty instance of the post editor.
  // Drafts and scheduled posts now live in Calendar, so those legacy tabs redirect.
  // Only reacts to URL changes — never to internal stage transitions, otherwise
  // opening an idea or a draft would immediately snap back to the manager.
  const lastDeepLink = useRef<string | null>(null);
  useEffect(() => {
    const key = `${startParam ?? ""}|${searchTab ?? ""}|${topicParam ?? ""}|${editParam ?? ""}|${atParam ?? ""}|${seedParam ?? ""}|${ideaIdParam ?? ""}|${rawParam ?? ""}`;
    if (lastDeepLink.current === key) return;
    lastDeepLink.current = key;

    if (!editParam && !startParam && !seedParam && !topicParam &&
        (searchTab === "drafts" || searchTab === "schedule")) {
      navigate({ to: "/calendar", search: { view: "list" } });
      return;
    }
    if (searchTab === "liked") setFeedFilter("saved");



    if (editParam) {
      // Coming from the calendar: edit that existing post, never create a new one.
      const existing = drafts.find(
        (d) => d.id === editParam || d.content.startsWith(editParam),
      );
      const record: DraftRecord =
        existing ??
        {
          id: `cal-${editParam.slice(0, 24)}`,
          idea: { ...BLANK_IDEA, id: `cal-${editParam.slice(0, 24)}`, hook: editParam },
          hook: editParam,
          content: editParam,
          createdAt: new Date().toISOString(),
          reviewRequested: false,
          scheduledAt: atParam ?? null,
          status: atParam ? "Isla Review" : undefined,
        };
      if (!existing) setDrafts((ds) => [record, ...ds]);
      setScratch(false);
      setSelectedIdea(record.idea);
      setSelectedHook(record.hook);
      setEditingDraftId(record.id);
      setEditingDraft(record);
      setStage("draft");
      return;
    }
    if (startParam === "scratch") {
      // Completely empty editor — no title, no content.
      setScratch(true);
      setEditingDraftId(null);
      setEditingDraft(null);
      setSelectedIdea(BLANK_IDEA);
      setSelectedHook("");
      setStage("draft");
      return;
    }
    if (seedParam) {
      // Creation-first entry: land straight in the editor with the idea loaded.
      const known = ideaIdParam ? IDEAS.find((i) => i.id === ideaIdParam) : undefined;
      const idea: Idea =
        known ?? {
          id: `seed-${seedParam.slice(0, 24)}`,
          hook: seedParam,
          angle: pillarParam ? `${pillarParam} angle` : "Your own idea",
          pillar: pillarParam ?? "From you",
          why: "You told Isla this is what you want to talk about.",
          tags: [],
        };
      const hook = known ? HOOK_TEMPLATES(known)[0]! : seedParam;
      setScratch(false);
      setEditingDraftId(null);
      setEditingDraft(
        rawParam === "1"
          ? {
              id: `seed-${Date.now()}`,
              idea,
              hook,
              content: seedParam,
              createdAt: new Date().toISOString(),
              reviewRequested: false,
              scheduledAt: null,
            }
          : null,
      );
      setSelectedIdea(idea);
      setSelectedHook(hook);
      setStage("draft");
      return;
    }
    if (topicParam) {
      setSelectedIdea({
        id: `topic-${topicParam.slice(0, 24)}`,
        hook: topicParam,
        angle: "Trending topic turned into a post",
        pillar: "Trending Topics",
        why: "This topic is gaining momentum with your audience right now.",
        tags: ["Trending"],
      });
      setStage("select-refinement");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startParam, searchTab, topicParam, editParam, atParam, seedParam, ideaIdParam, rawParam]);


  function startCall(ideas: Idea[]) {
    if (ideas.length === 0) return;
    setCallIdeas(ideas);
    setStage("call");
  }

  function completeCall(result: { ideas: Idea[]; extraIdea: Idea | null }) {
    const allIdeas = result.extraIdea ? [...result.ideas, result.extraIdea] : result.ideas;
    if (allIdeas.length === 0) {
      setStage("manager");
      return;
    }
    setCallIdeas(allIdeas);
    setCallHookIdx(0);
    setCallHookSelections({});
    setStage("call-hooks");
  }

  function finalizeCallHooks(selections: Record<string, string>) {
    const now = new Date().toISOString();
    const newDrafts: DraftRecord[] = callIdeas.map((idea) => {
      const hook = selections[idea.id] ?? HOOK_TEMPLATES(idea)[0];
      return {
        id: `d${Date.now()}-${idea.id}`,
        idea,
        hook,
        content: DRAFT_TEMPLATE(idea, hook),
        createdAt: now,
      };
    });
    setDrafts((d) => [...newDrafts, ...d]);
    const draftedIds = new Set(callIdeas.map((i) => i.id));
    setLiked((l) => l.filter((i) => !draftedIds.has(i.id)));

    // Open the first idea's draft directly (as requested).
    const first = callIdeas[0];
    const firstHook = selections[first.id] ?? HOOK_TEMPLATES(first)[0];
    setSelectedIdea(first);
    setSelectedHook(firstHook);
    setCallIdeas([]);
    setCallHookIdx(0);
    setCallHookSelections({});
    setStage("draft");
    toast.success(
      `${newDrafts.length} draft${newDrafts.length === 1 ? "" : "s"} ready · opening the first one`,
    );
  }


  const current = deck[0];
  const next = deck[1];
  const nextNext = deck[2];

  function decide(decision: "like" | "pass") {
    if (!current) return;
    setHistory((h) => [...h, { idea: current, decision }]);
    const newDeck = deck.slice(1);
    setDeck(newDeck);
    if (decision === "like") {
      setLiked((l) => [...l, current]);
    }
    if (newDeck.length === 0) {
      setStage("manager");
    }
  }

  /** Save for later / not interested — both secondary actions on the feed. */
  function decideIdea(idea: Idea, decision: "like" | "pass") {
    setHistory((h) => [...h, { idea, decision }]);
    setDeck((d) => d.filter((i) => i.id !== idea.id));
    if (decision === "like") setLiked((l) => [...l, idea]);
  }

  /**
   * The conversion moment: creating an idea always goes through the existing
   * refinement selection screen first — never straight into the editor.
   */
  function createFromIdea(idea: Idea) {
    setScratch(false);
    setEditingDraftId(null);
    setEditingDraft(null);
    setSelectedIdea(idea);
    setSelectedHook(null);
    setStage("select-refinement");
  }



  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setDeck((d) => [last.idea, ...d]);
    if (last.decision === "like") setLiked((l) => l.filter((i) => i.id !== last.idea.id));
  }

  function reset() {
    setDeck(FEED_IDEAS);
    setLiked([]);
    setHistory([]);
    setSelectedIdea(null);
    setAnswers([]);
    setSelectedHook(null);
    setDrafts([]);
    setManagerTab("ideas");
    setStage("manager");
  }

  function saveDraftAndBack(
    content: string,
    meta?: { reviewRequested?: boolean; scheduledAt?: Date | null },
  ) {
    if (!selectedIdea || selectedHook === null) return;
    const scheduledAt = meta?.scheduledAt ? meta.scheduledAt.toISOString() : null;

    if (editingDraftId) {
      // Editing an existing post: the date decides Drafts vs Schedule.
      setDrafts((ds) =>
        ds.map((d) =>
          d.id === editingDraftId
            ? {
                ...d,
                content,
                reviewRequested: meta?.reviewRequested ?? d.reviewRequested,
                scheduledAt,
                status: scheduledAt ? (d.status ?? "Isla Review") : undefined,
              }
            : d,
        ),
      );
    } else {
      const record: DraftRecord = {
        id: `d${Date.now()}`,
        idea: selectedIdea,
        hook: selectedHook,
        content,
        createdAt: new Date().toISOString(),
        reviewRequested: meta?.reviewRequested ?? false,
        scheduledAt,
        status: scheduledAt ? "Isla Review" : undefined,
      };
      setDrafts((d) => [record, ...d]);
      // remove from liked (it's been drafted)
      setLiked((l) => l.filter((i) => i.id !== selectedIdea.id));
    }

    setEditingDraftId(null);
    setEditingDraft(null);
    setSelectedIdea(null);
    setSelectedHook(null);
    setAnswers([]);
    setStage("manager");
    // Content that already exists is managed in Calendar → List view.
    navigate({ to: "/calendar", search: { view: "list" } });
  }



  /**
   * Breadcrumb is derived from the navigation source, never hardcoded.
   * Calendar → Post title · Create Content → Post Ideas → Post title.
   */
  const breadcrumb = (() => {
    const backToFeed = () => {
      setEditingDraftId(null);
      setEditingDraft(null);
      setScratch(false);
      setStage("manager");
    };

    if (stage === "draft") {
      const title =
        (editingDraft?.idea.hook ?? selectedIdea?.hook ?? "").trim() || "Untitled post";

      if (fromParam === "calendar") {
        return {
          page: title,
          pageMaxWidth: 420,
          root: { label: "Calendar", to: "/calendar" as const },
        };
      }
      if (scratch || !selectedIdea || selectedIdea.id === "blank") {
        return { page: title, pageMaxWidth: 420 };
      }
      return {
        page: title,
        pageMaxWidth: 420,
        trail: [{ label: "Post Ideas", onClick: backToFeed }],
      };
    }

    if (stage === "select-refinement") {
      return {
        page: "Refine Idea",
        trail: [{ label: "Post Ideas", onClick: backToFeed }],
      };
    }

    if (stage === "interview" || stage === "hooks" || stage === "call-hooks") {
      return {
        page: "Refinement",
        trail: [{ label: "Post Ideas", onClick: backToFeed }],
      };
    }

    return { page: "Post Ideas" };
  })();


  return (
    <div className="font-manrope dark min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[240px]"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-5 sm:px-10 lg:px-14 lg:pt-12 lg:pb-12">
          {stage !== "call" && (
            <HubBreadcrumb
              {...breadcrumb}
              className="mb-5"
            />
          )}
          <AnimatePresence mode="wait">
            {stage === "manager" && (
              <motion.div
                key="manager"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <IdeasFeedStage
                  ideas={deck}
                  saved={liked}
                  filter={feedFilter}
                  onFilter={setFeedFilter}
                  onCreate={createFromIdea}
                  onSave={(idea) => {
                    decideIdea(idea, "like");
                    toast.success("Saved for later");
                  }}
                  onDismiss={(idea) => {
                    decideIdea(idea, "pass");
                    toast("Got it — we won't show that idea again");
                  }}
                />

              </motion.div>
            )}


            {stage === "select-refinement" && selectedIdea && (
              <motion.div
                key="select-refinement"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SelectRefinementStage
                  idea={selectedIdea}
                  onCall={() => startCall([selectedIdea])}
                  onChat={() => setStage("interview")}
                />

              </motion.div>
            )}

            {stage === "call" && callIdeas.length > 0 && (
              <motion.div
                key="call"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CallStage
                  ideas={callIdeas}
                  onComplete={completeCall}
                  onCancel={() => {
                    setCallIdeas([]);
                    setStage("manager");
                  }}
                />
              </motion.div>
            )}

            {stage === "call-hooks" && callIdeas.length > 0 && callIdeas[callHookIdx] && (
              <motion.div
                key={`call-hooks-${callHookIdx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-3 text-xs text-muted-foreground">
                  Post {callHookIdx + 1} of {callIdeas.length}
                </div>
                <HookSelectionStage
                  idea={callIdeas[callHookIdx]}
                  selected={callHookSelections[callIdeas[callHookIdx].id] ?? null}
                  onSelect={(h) =>
                    setCallHookSelections((prev) => ({
                      ...prev,
                      [callIdeas[callHookIdx].id]: h,
                    }))
                  }
                  onGenerate={() => {
                    const isLast = callHookIdx >= callIdeas.length - 1;
                    if (isLast) {
                      finalizeCallHooks(callHookSelections);
                    } else {
                      setCallHookIdx((i) => i + 1);
                    }
                  }}
                />

              </motion.div>
            )}


            {stage === "interview" && selectedIdea && (
              <motion.div
                key="interview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <InterviewStage
                  idea={selectedIdea}
                  onComplete={(a) => {
                    setAnswers(a);
                    setSelectedHook(null);
                    setStage("hooks");
                  }}
                />
              </motion.div>
            )}

            {stage === "hooks" && selectedIdea && (
              <motion.div
                key="hooks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <HookSelectionStage
                  idea={selectedIdea}
                  selected={selectedHook}
                  onSelect={setSelectedHook}
                  onGenerate={() => setStage("draft")}
                />
              </motion.div>
            )}

            {stage === "draft" && selectedIdea && (selectedHook !== null) && (
              <motion.div
                key="draft"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <DraftStage
                  key={editingDraftId ?? "new-draft"}
                  blank={scratch}
                  idea={selectedIdea}
                  hook={selectedHook}
                  initialContent={editingDraft?.content}
                  initialScheduledAt={
                    editingDraft?.scheduledAt ? new Date(editingDraft.scheduledAt) : null
                  }
                  onCreateAnother={(content, meta) => saveDraftAndBack(content, meta)}
                  onContinueRefining={() => {
                    /* stays on draft */
                  }}
                  onBack={() => {
                    const back = editingDraft?.scheduledAt ? "schedule" : "drafts";
                    setEditingDraftId(null);
                    setEditingDraft(null);
                    setManagerTab(back);
                    setStage("manager");
                  }}
                  collapsed={collapsed}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* answers is intentionally passed downstream via state; suppress unused warning */}
          <span className="hidden">{answers.length}</span>
        </div>
      </main>
    </div>
  );
}

/* ============================ SWIPE ============================ */

function SwipeStage({
  current,
  next,
  nextNext,
  deckLen,
  likedCount,
  history,
  onDecide,
  onUndo,
  onRefine,
}: {
  current: Idea | undefined;
  next: Idea | undefined;
  nextNext: Idea | undefined;
  deckLen: number;
  likedCount: number;
  history: { idea: Idea; decision: "like" | "pass" }[];
  onDecide: (d: "like" | "pass") => void;
  onUndo: () => void;
  onRefine: (idea: Idea) => void;
}) {
  if (!current) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">No new ideas right now</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          You've gone through every idea in this deck. Wait for a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start">
      <div className="mb-4 text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {deckLen} idea{deckLen === 1 ? "" : "s"} left · {likedCount} liked
        </div>
        <h1 className="text-2xl font-bold mt-1.5 tracking-tight">Swipe through your ideas</h1>
      </div>

      <div className="relative w-full h-[420px] flex items-start justify-center">
        {nextNext && <IdeaCard key={nextNext.id} idea={nextNext} stacked depth={2} />}
        {next && <IdeaCard key={next.id} idea={next} stacked depth={1} />}
        <IdeaCard key={current.id} idea={current} onDecide={onDecide} />
      </div>

      <div className="flex items-center justify-center gap-5 mt-5">
        <button
          onClick={() => onDecide("pass")}
          className="size-14 rounded-full bg-card border border-border flex items-center justify-center text-destructive hover:scale-105 transition"
          aria-label="Pass"
        >
          <X className="size-6" />
        </button>
        {history.length > 0 && (
          <button
            onClick={onUndo}
            className="size-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Undo"
          >
            <Undo2 className="size-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => current && onRefine(current)}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Refine This Idea
        </button>
        <button
          onClick={() => onDecide("like")}
          className="size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition shadow-[0_0_24px_hsl(var(--primary)/0.4)]"
          aria-label="Like"
        >
          <Heart className="size-6 fill-current" />
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">
        ← pass · → like · ⌘Z undo
      </p>

    </div>
  );
}

/* ============================ GRAPH MODAL ============================ */

type GraphCategory =
  | "Opportunity"
  | "Opinion"
  | "Monitored"
  | "Lead"
  | "Pillar"
  | "Company"
  | "News"
  | "Profile";

const GRAPH_CATEGORIES: { key: GraphCategory; color: string }[] = [
  { key: "Opportunity", color: "#10b981" },
  { key: "Opinion", color: "#ec4899" },
  { key: "Monitored", color: "#22c55e" },
  { key: "Lead", color: "#f59e0b" },
  { key: "Pillar", color: "#06b6d4" },
  { key: "Company", color: "#14b8a6" },
  { key: "News", color: "#84cc16" },
  { key: "Profile", color: "#a855f7" },
];
const CATEGORY_COLOR: Record<GraphCategory, string> = Object.fromEntries(
  GRAPH_CATEGORIES.map((c) => [c.key, c.color]),
) as Record<GraphCategory, string>;

type GraphNode = {
  id: string;
  label: string;
  category: GraphCategory;
  x: number;
  y: number;
  connected: boolean;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGraphForIdea(idea: Idea): { nodes: GraphNode[]; center: GraphNode } {
  const seed = idea.id
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 17);
  const rand = mulberry32(seed);

  const center: GraphNode = {
    id: `${idea.id}-center`,
    label: idea.hook.length > 44 ? idea.hook.slice(0, 44) + "…" : idea.hook,
    category: "Opportunity",
    x: 0,
    y: 0,
    connected: true,
  };

  // Connected supporting nodes — feed for this idea
  const connectedSpecs: { label: string; category: GraphCategory }[] = [
    { label: idea.pillar, category: "Pillar" },
    { label: `Pillar sub-theme · ${idea.tags[0] ?? "growth"}`, category: "Pillar" },
    { label: "Marcos Figueiredo", category: "Profile" },
    { label: `Lead · ${idea.tags[1] ?? "b2b"} operator`, category: "Lead" },
    { label: `Company · ${idea.pillar.split(" ")[0]} Co`, category: "Company" },
    { label: `News · ${idea.tags[0] ?? "market"} shift 2026`, category: "News" },
  ];

  // Ambient (non-connected) nodes to give context
  const ambientSpecs: { label: string; category: GraphCategory }[] = [
    { label: "Founders Must Double Down…", category: "Opinion" },
    { label: "What to Post and What Not…", category: "Monitored" },
    { label: "Building in public — shipp…", category: "Lead" },
    { label: "Founder Builds 68 Targeted…", category: "Monitored" },
    { label: "Design systems, Figma stru…", category: "Company" },
    { label: "AI PR Is Killing Your Star…", category: "News" },
    { label: "LinkedIn Launches Creator …", category: "News" },
    { label: "Short-Form Native Video Un…", category: "Opinion" },
  ];

  const nodes: GraphNode[] = [center];

  // Place connected nodes on an inner ring
  connectedSpecs.forEach((spec, i) => {
    const angle = (i / connectedSpecs.length) * Math.PI * 2 + rand() * 0.5;
    const radius = 180 + rand() * 40;
    nodes.push({
      id: `${idea.id}-c-${i}`,
      label: spec.label,
      category: spec.category,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      connected: true,
    });
  });

  // Place ambient nodes further out
  ambientSpecs.forEach((spec, i) => {
    const angle = (i / ambientSpecs.length) * Math.PI * 2 + rand() * 1.2;
    const radius = 320 + rand() * 120;
    nodes.push({
      id: `${idea.id}-a-${i}`,
      label: spec.label,
      category: spec.category,
      x: Math.cos(angle) * radius + (rand() - 0.5) * 60,
      y: Math.sin(angle) * radius + (rand() - 0.5) * 60,
      connected: false,
    });
  });

  return { nodes, center };
}

function GraphModal({
  idea,
  open,
  onOpenChange,
}: {
  idea: Idea;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { nodes, center } = useMemo(() => buildGraphForIdea(idea), [idea]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const draggingRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) setTransform({ x: 0, y: 0, scale: 1 });
  }, [open, idea.id]);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = draggingRef.current;
    if (!d) return;
    setTransform((t) => ({ ...t, x: d.tx + (e.clientX - d.x), y: d.ty + (e.clientY - d.y) }));
  }
  function onPointerUp(e: React.PointerEvent) {
    draggingRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setTransform((t) => {
      const nextScale = Math.min(2.4, Math.max(0.35, t.scale * (1 + delta)));
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return { ...t, scale: nextScale };
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const k = nextScale / t.scale;
      return {
        scale: nextScale,
        x: cx - (cx - t.x) * k,
        y: cy - (cy - t.y) * k,
      };
    });
  }

  function zoomBy(factor: number) {
    setTransform((t) => ({ ...t, scale: Math.min(2.4, Math.max(0.35, t.scale * factor)) }));
  }
  function reset() {
    setTransform({ x: 0, y: 0, scale: 1 });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden bg-[#0a0a0f] border-border/60">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Waypoints className="size-4 text-[hsl(200_100%_60%)]" />
            Where this idea came from
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground line-clamp-2">
            {idea.hook}
          </DialogDescription>
        </DialogHeader>

        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          className="relative h-[560px] overflow-hidden bg-[radial-gradient(circle_at_center,#0f1220_0%,#050509_100%)] cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "none" }}
        >
          {/* Legend */}
          <div className="pointer-events-none absolute top-3 right-3 z-20 flex flex-wrap gap-1.5 max-w-[420px] justify-end">
            {GRAPH_CATEGORIES.map((c) => (
              <span
                key={c.key}
                className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full bg-black/60 border border-white/10 text-white/80 backdrop-blur"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: c.color }}
                />
                {c.key}
              </span>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              onClick={() => zoomBy(1.2)}
              className="size-8 rounded-md bg-black/70 border border-white/10 text-white/80 hover:bg-black/90 text-lg leading-none"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => zoomBy(1 / 1.2)}
              className="size-8 rounded-md bg-black/70 border border-white/10 text-white/80 hover:bg-black/90 text-lg leading-none"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              onClick={reset}
              className="size-8 rounded-md bg-black/70 border border-white/10 text-white/80 hover:bg-black/90"
              aria-label="Reset view"
            >
              <RotateCcw className="size-3.5 mx-auto" />
            </button>
          </div>

          {/* Hint */}
          <div className="pointer-events-none absolute bottom-3 left-4 z-20 text-[11px] text-white/40">
            Drag to move · scroll to zoom · highlighted nodes formed this idea
          </div>

          {/* Transformable canvas */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(calc(50% + ${transform.x}px), calc(50% + ${transform.y}px)) scale(${transform.scale})`,
              transformOrigin: "0 0",
              willChange: "transform",
            }}
          >
            {/* Edges */}
            <svg
              className="absolute overflow-visible pointer-events-none"
              style={{ left: 0, top: 0, width: 0, height: 0 }}
            >
              {nodes
                .filter((n) => n.connected && n.id !== center.id)
                .map((n) => (
                  <line
                    key={`edge-${n.id}`}
                    x1={center.x}
                    y1={center.y}
                    x2={n.x}
                    y2={n.y}
                    stroke="hsl(200 100% 60% / 0.55)"
                    strokeWidth={1.2}
                    strokeDasharray="4 4"
                  />
                ))}
              {/* Ambient dim links between nearby ambient nodes for texture */}
              {nodes
                .filter((n) => !n.connected)
                .map((n, i, arr) => {
                  const next = arr[(i + 1) % arr.length];
                  return (
                    <line
                      key={`amb-${n.id}`}
                      x1={n.x}
                      y1={n.y}
                      x2={next.x}
                      y2={next.y}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={1}
                    />
                  );
                })}
            </svg>

            {/* Nodes */}
            {nodes.map((n) => {
              const color = CATEGORY_COLOR[n.category];
              const isCenter = n.id === center.id;
              const size = isCenter ? 40 : n.connected ? 28 : 20;
              return (
                <div
                  key={n.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: n.x, top: n.y }}
                >
                  <div
                    className="rounded-full relative"
                    style={{
                      width: size,
                      height: size,
                      background: n.connected ? color : `${color}55`,
                      boxShadow: n.connected
                        ? `0 0 0 3px hsl(200 100% 60% / 0.9), 0 0 24px 2px hsl(200 100% 60% / 0.35)`
                        : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                      opacity: n.connected ? 1 : 0.55,
                    }}
                  >
                    {isCenter && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: "hsl(200 100% 60% / 0.35)" }}
                      />
                    )}
                  </div>
                  <span
                    className="mt-1.5 whitespace-nowrap text-[10px] font-medium"
                    style={{
                      color: n.connected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {n.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IdeaCard({
  idea,
  stacked,
  depth = 0,
  onDecide,
}: {
  idea: Idea;
  stacked?: boolean;
  depth?: number;
  onDecide?: (d: "like" | "pass") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-14, 14]);
  const likeOp = useTransform(x, [40, 140], [0, 1]);
  const passOp = useTransform(x, [-140, -40], [1, 0]);

  // Single smooth border color transition: red → subtle → blue
  const borderColor = useTransform(
    x,
    [-160, -20, 0, 20, 160],
    [
      "hsl(0 84% 60%)",
      "hsl(0 84% 60% / 0)",
      "hsl(220 10% 30% / 0)",
      "hsl(200 100% 60% / 0)",
      "hsl(200 100% 60%)",
    ],
  );
  const boxShadow = useTransform(
    x,
    [-200, -40, 0, 40, 200],
    [
      "0 0 40px -4px hsl(0 84% 60% / 0.55), 0 20px 60px -20px rgba(0,0,0,0.6)",
      "0 0 0px 0 hsl(0 84% 60% / 0), 0 20px 60px -20px rgba(0,0,0,0.6)",
      "0 20px 60px -20px rgba(0,0,0,0.6)",
      "0 0 0px 0 hsl(200 100% 60% / 0), 0 20px 60px -20px rgba(0,0,0,0.6)",
      "0 0 40px -4px hsl(200 100% 60% / 0.55), 0 20px 60px -20px rgba(0,0,0,0.6)",
    ],
  );
  const [showWhy, setShowWhy] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 120) onDecide?.("like");
    else if (info.offset.x < -120) onDecide?.("pass");
  }

  if (stacked) {
    const d = depth || 1;
    // Peek behind the top card: barely offset so it's revealed while swiping
    const translateY = 8 * d;
    const scale = 1 - 0.025 * d;
    const rot = d % 2 === 0 ? 1.5 : -1.5;
    const opacity = d === 1 ? 0.9 : 0.6;
    return (
      <motion.div
        className="absolute inset-x-0 mx-auto w-[92%] max-w-lg h-[420px] rounded-3xl bg-card border border-border p-5 flex flex-col overflow-hidden"
        style={{
          transform: `translateY(${translateY}px) scale(${scale}) rotate(${rot}deg)`,
          opacity,
          zIndex: 10 - d,
        }}
      >
        <div className="mb-2 text-xs font-semibold text-primary">
          <span className="text-primary/60 mr-1">Pillar:</span>
          {idea.pillar}
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight">{idea.hook}</h2>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
          <span className="text-foreground/80 font-semibold">Angle: </span>
          {idea.angle}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      drag={onDecide ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      style={{ x, rotate, boxShadow, zIndex: 20 }}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="absolute inset-x-0 mx-auto w-[92%] max-w-lg h-[420px] rounded-3xl bg-card border border-border p-5 cursor-grab active:cursor-grabbing flex flex-col"
    >

      {/* Smooth unified colored outline */}
      <motion.div
        aria-hidden
        style={{ borderColor }}
        className="pointer-events-none absolute inset-0 rounded-3xl border-2"
      />

      {/* LIKE / PASS pill badges */}
      <motion.div
        style={{ opacity: likeOp }}
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-[-24px] px-5 py-2.5 rounded-full bg-[hsl(200_100%_60%)] text-white font-bold tracking-wider flex items-center gap-2 shadow-lg"
      >
        <Heart className="size-4 fill-white" />
        LIKE
      </motion.div>
      <motion.div
        style={{ opacity: passOp }}
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-[-24px] px-5 py-2.5 rounded-full bg-destructive text-white font-bold tracking-wider flex items-center gap-2 shadow-lg"
      >
        <X className="size-4" />
        PASS
      </motion.div>

      <div className="mb-2 text-xs font-semibold text-primary">
        <span className="text-primary/60 mr-1">Pillar:</span>
        {idea.pillar}
      </div>

      <h2 className="text-xl font-bold leading-tight tracking-tight">{idea.hook}</h2>

      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        <span className="text-foreground/80 font-semibold">Angle: </span>
        {idea.angle}
      </p>

      <div className="mt-3">
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          <span className="text-foreground/80 font-semibold">Why: </span>
          {idea.why}
        </p>

        <button
          type="button"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setGraphOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(200_100%_60%)] hover:underline underline-offset-4 mb-2"
        >
          <Waypoints className="size-4" />
          View idea in graph
        </button>


        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/60">
          {idea.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 font-mono"
            >
              <span className="text-muted-foreground/60 mr-0.5">#</span>
              {t}
            </span>
          ))}
        </div>
        {showWhy && (
          <button
            onClick={() => setShowWhy(false)}
            className="text-xs uppercase tracking-widest text-muted-foreground mt-2 flex items-center gap-1"
          >
            <ChevronUp className="size-3" />
          </button>
        )}
      </div>
      <GraphModal idea={idea} open={graphOpen} onOpenChange={setGraphOpen} />
    </motion.div>
  );
}

/* ============================ SELECT REFINEMENT ============================ */

function RefinementCard({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="clickable-card group relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(195_100%_50%)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: hovered
            ? `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, hsl(195 100% 50% / 0.22), transparent 45%)`
            : undefined,
        }}
      />
      <div className="relative z-10 flex h-full flex-col items-center text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-border bg-muted/50 transition-colors duration-300 group-hover:border-[hsl(195_100%_50%_/0.5)] group-hover:bg-[hsl(195_100%_50%_/0.08)]">
          <Icon className="size-10 text-foreground transition-colors duration-300 group-hover:text-[hsl(195_100%_50%)]" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(195_100%_50%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-6px_hsl(195_100%_50%)]">
            {cta} <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </button>
  );
}

function SelectRefinementStage({
  idea,
  onCall,
  onChat,
}: {
  idea: Idea;
  onCall: () => void;
  onChat: () => void;
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        How do you want to refine this idea?
      </h1>
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="text-xs text-muted-foreground mb-2">
          Pillar: <span className="text-[hsl(195_100%_50%)] font-semibold">{idea.pillar}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{idea.hook}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <RefinementCard
          icon={Phone}
          title="Refine with Call"
          description="A continuous, real-time conversation with Isla — like a strategy call."
          cta="Start Call"
          onClick={onCall}
        />
        <RefinementCard
          icon={MessageSquare}
          title="Refine with Chat"
          description="Isla asks a few questions in a text chat. Your answers become the post."
          cta="Start Chat"
          onClick={onChat}
        />
      </div>
    </div>
  );
}

/* ============================ MANAGER (tabs) ============================ */

type ViewMode = "cards" | "list";

function ViewToggle({
  mode,
  onMode,
}: {
  mode: ViewMode;
  onMode: (m: ViewMode) => void;
}) {
  const opts: { key: ViewMode; label: string; icon: LucideIcon }[] = [
    { key: "cards", label: "Cards", icon: LayoutGrid },
    { key: "list", label: "List", icon: Rows3 },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onMode(o.key)}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            mode === o.key
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <o.icon className="size-3.5" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LifecycleBadge({ stage }: { stage: string }) {
  const tone =
    stage === "Need to Refine" || stage === "Idea"
      ? "bg-muted text-foreground/80 border-border"
      : stage === "Saved"
        ? "bg-primary/10 text-primary border-primary/30"


      : stage === "Liked"
        ? "bg-muted text-muted-foreground border-border/60"
        : stage === "Refined"
          ? "bg-primary/15 text-primary border-primary/30"
          : stage === "Draft"
            ? "bg-[#FFD667]/15 text-[#FFD667] border-[#FFD667]/30"
            : "bg-[#00BFFF]/15 text-[#00BFFF] border-[#00BFFF]/30";
  return (
    <span
      className={`shrink-0 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${tone}`}
    >
      {stage}
    </span>
  );
}

/** Operational status of a post that already has a date. */
function StatusBadge({ status }: { status: PostStatus }) {
  const tone: Record<PostStatus, string> = {
    "Isla Review": "bg-[#FFB743]/15 text-[#FFB743] border-[#FFB743]/30",
    "VR Review": "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30",
    "Ready to Post": "bg-[#00BFFF]/15 text-[#00BFFF] border-[#00BFFF]/30",
    Posted: "bg-[#1DA855]/15 text-[#1DA855] border-[#1DA855]/30",
    Missed: "bg-[#E1634E]/15 text-[#E1634E] border-[#E1634E]/30",
  };
  return (
    <span
      className={`shrink-0 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${tone[status]}`}
    >
      {status}
    </span>
  );
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayHeading(d: Date) {
  const now = new Date();
  if (dayKey(d) === dayKey(now)) return "TODAY";
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

function timeLabel(d: Date) {
  return d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toUpperCase();
}

/* ============================== IDEAS FEED ============================== */

/**
 * The discovery surface. One job: help the user find an idea worth writing and
 * hand it straight to the editor. Trending opportunities live inline here —
 * there is no separate Trending destination anymore.
  */


function IdeasFeedStage({
  ideas,
  saved,
  filter,
  onFilter,
  onCreate,
  onSave,
  onDismiss,
}: {
  ideas: Idea[];
  saved: Idea[];
  filter: FeedFilter;
  onFilter: (f: FeedFilter) => void;
  onCreate: (idea: Idea) => void;
  onSave: (idea: Idea) => void;
  onDismiss: (idea: Idea) => void;
}) {
  const [detailIdea, setDetailIdea] = useState<Idea | null>(null);
  // Entrance stagger plays every time this feed is opened.
  const animateEntrance = true;

  const savedIds = useMemo(() => new Set(saved.map((i) => i.id)), [saved]);
  const items = filter === "saved" ? saved : ideas;

  const filters: { key: FeedFilter; label: string; count: number }[] = [
    { key: "all", label: "Ideas for you", count: ideas.length },
    { key: "saved", label: "Saved for later", count: saved.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Pick an idea</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Personalized ideas plus timely trending opportunities. Open the one that
          resonates and turn it into a post.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilter(f.key)}
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                filter === f.key
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {f.label}
              <span className="ml-1.5 rounded bg-[#4A4A4A] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[45vh] items-center justify-center">
          <div className="max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
            <h2 className="text-2xl font-bold">
              {filter === "saved" ? "Nothing saved yet" : "No new ideas right now"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {filter === "saved"
                ? "Saving is optional — open an idea and create the post as soon as something clicks."
                : "You have been through every idea in this cycle. New opportunities show up soon."}
            </p>
            {filter === "saved" && (
              <button
                type="button"
                onClick={() => onFilter("all")}
                className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Browse ideas
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((idea, index) => (
            <div
              key={idea.id}
              role="button"
              tabIndex={0}
              onClick={() => setDetailIdea(idea)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDetailIdea(idea);
                }
              }}
              style={
                animateEntrance
                  ? { animationDelay: `${Math.min(index, 11) * 70}ms` }
                  : undefined
              }
              className={`clickable-card flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-left${animateEntrance ? " animate-idea-rise" : ""}`}
            >

              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {idea.pillar}
                </span>
                {idea.trending ? (
                  <span className="inline-flex items-center gap-1 rounded border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                    <Flame className="size-3" />
                    Trending
                  </span>
                ) : (
                  <LifecycleBadge stage={savedIds.has(idea.id) ? "Saved" : "Idea"} />
                )}
              </div>
              <h3 className="text-[14px] font-semibold leading-relaxed">{idea.hook}</h3>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {idea.angle}
              </p>
              {idea.source && (
                <p className="text-[11px] text-muted-foreground/70">{idea.source}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <IdeaDetailModal
        idea={detailIdea}
        open={detailIdea !== null}
        saved={detailIdea ? savedIds.has(detailIdea.id) : false}
        onOpenChange={(v) => !v && setDetailIdea(null)}
        onCreate={(idea) => {
          setDetailIdea(null);
          onCreate(idea);
        }}
        onSave={(idea) => {
          setDetailIdea(null);
          onSave(idea);
        }}
        onDismiss={(idea) => {
          setDetailIdea(null);
          onDismiss(idea);
        }}
      />
    </div>
  );
}


/* ============================ IDEA DETAIL MODAL ============================ */

function IdeaDetailModal({
  idea,
  open,
  saved,
  onOpenChange,
  onCreate,
  onSave,
  onDismiss,
}: {
  idea: Idea | null;
  open: boolean;
  saved: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (idea: Idea) => void;
  onSave: (idea: Idea) => void;
  onDismiss: (idea: Idea) => void;
}) {
  const [graphOpen, setGraphOpen] = useState(false);

  if (!idea) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {idea.pillar}
              </span>
              {idea.trending ? (
                <span className="inline-flex items-center gap-1 rounded border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                  <Flame className="size-3" />
                  Trending
                </span>
              ) : (
                <LifecycleBadge stage={saved ? "Saved" : "Idea"} />
              )}
            </div>

            <DialogTitle className="text-left text-xl font-bold leading-snug">
              {idea.hook}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground/80">Angle: </span>
              {idea.angle}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground/80">Why: </span>
              {idea.why}
            </p>

            <button
              type="button"
              onClick={() => setGraphOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(200_100%_60%)] underline-offset-4 hover:underline"
            >
              <Waypoints className="size-4" />
              View idea in graph
            </button>

            {idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {idea.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-md border border-border/60 bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    <span className="mr-0.5 text-muted-foreground/60">#</span>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* One cohesive action row: dismiss · save · primary CTA */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onDismiss(idea)}
                aria-label="Not interested"
                title="Not interested"
                className="mr-auto inline-flex size-10 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onSave(idea)}
                disabled={saved}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border/60 px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save for later"}
              </button>
              <button
                type="button"
                onClick={() => onCreate(idea)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Create this idea
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

        </DialogContent>
      </Dialog>
      <GraphModal idea={idea} open={graphOpen} onOpenChange={setGraphOpen} />
    </>
  );
}





/* ============================ REALTIME CALL ============================ */

const CALL_QUESTIONS_PER_IDEA = [
  (idea: Idea) =>
    `Let's start with "${idea.hook.slice(0, 60)}${idea.hook.length > 60 ? "…" : ""}". What actually happened that made you realize this?`,
  (_idea: Idea) => `Interesting. Who exactly do you disagree with — and what's the cost of ignoring it?`,
  (_idea: Idea) =>
    `Last one on this — after reading your post, what should someone do differently on Monday morning?`,
];

const CALL_MOCK_TRANSCRIPTS = [
  "So basically I was building the pipeline dashboard for our head of sales, and I realized the number he actually cared about was nowhere on it — he just wanted to know which deals were slipping this week.",
  "I disagree with the CFO playbook of measuring marketing on MQL volume. I've watched two teams get gutted because they hit their MQL number but couldn't defend a single deal.",
  "Stop reporting on lead count in your next leadership meeting. Bring three deals you influenced, name the humans, and tell the story.",
];

const CALL_AI_ACKS = [
  "Got it — that's the concrete moment we need.",
  "Yeah, that's the tension. Let's keep going.",
  "Perfect. Moving on.",
  "That's a strong take. One more.",
  "Love it. Just one more thing.",
];

const CALL_EXTRA_QUESTION =
  "Before we hang up — did anything interesting happen this week that you think could become a post? A story, an opinion, a lesson?";

const CALL_EXTRA_TRANSCRIPT =
  "Actually yes — a founder pushed back hard on my pricing framework in a workshop. He said charging by seat kills product-led growth. I've been thinking about it all week.";

const CALL_EXTRA_IDEA: Idea = {
  id: `extra-${Date.now()}`,
  hook: "A founder told me seat-based pricing kills product-led growth. He was mostly right — and here's the part he missed.",
  angle: "Pricing structure as a growth lever, not an accounting choice.",
  pillar: "Pricing",
  why: "Fresh from this week's conversation — sharp POV with a public disagreement built in.",
  tags: ["pricing", "plg", "positioning"],
};

type CallPhase =
  | "connecting"
  | "greeting"
  | "asking"
  | "listening"
  | "thinking"
  | "acking"
  | "wrap-up"
  | "goodbye";

type CallTurn = {
  ideaId: string; // "extra" for the bonus turn
  qIndex: number; // 0..2, or 0 for extra
  question: string;
  answer: string;
};

function CallStage({
  ideas,
  onComplete,
  onCancel,
}: {
  ideas: Idea[];
  onComplete: (result: { ideas: Idea[]; extraIdea: Idea | null }) => void;
  onCancel: () => void;
}) {
  // Build the full script: 3 questions per idea + 1 extra
  const script = useMemo(() => {
    const steps: { ideaId: string; ideaLabel: string; qIndex: number; question: string; mockAnswer: string }[] = [];
    ideas.forEach((idea) => {
      CALL_QUESTIONS_PER_IDEA.forEach((make, qi) => {
        steps.push({
          ideaId: idea.id,
          ideaLabel: idea.hook,
          qIndex: qi,
          question: make(idea),
          mockAnswer: CALL_MOCK_TRANSCRIPTS[qi] ?? "",
        });
      });
    });
    steps.push({
      ideaId: "extra",
      ideaLabel: "Extra opportunity",
      qIndex: 0,
      question: CALL_EXTRA_QUESTION,
      mockAnswer: CALL_EXTRA_TRANSCRIPT,
    });
    return steps;
  }, [ideas]);

  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<CallPhase>("connecting");
  const [partial, setPartial] = useState("");
  const [turns, setTurns] = useState<CallTurn[]>([]);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [confirmHangup, setConfirmHangup] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function clearAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (typeTimer.current) {
      clearInterval(typeTimer.current);
      typeTimer.current = null;
    }
  }

  function schedule(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  useEffect(() => {
    // elapsed timer
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      clearInterval(id);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot the call
  useEffect(() => {
    schedule(() => setPhase("greeting"), 700);
    schedule(() => setPhase("asking"), 2600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive listening after "asking"
  useEffect(() => {
    if (phase !== "asking") return;
    // AI "speaks" the question for ~2.6s then goes to listening
    const t = setTimeout(() => {
      if (textMode) return; // wait for user submit
      startListening();
    }, 2600);
    timers.current.push(t);
    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stepIdx, textMode]);

  function startListening() {
    setPhase("listening");
    setPartial("");
    const step = script[stepIdx];
    if (!step) return;
    const full = step.mockAnswer;
    let i = 0;
    if (typeTimer.current) clearInterval(typeTimer.current);
    typeTimer.current = setInterval(() => {
      i += 2;
      setPartial(full.slice(0, i));
      if (i >= full.length) {
        if (typeTimer.current) clearInterval(typeTimer.current);
        typeTimer.current = null;
        // Small silence detection pause, then submit
        schedule(() => commitAnswer(full), 700);
      }
    }, 28);
  }

  function commitAnswer(answer: string) {
    const step = script[stepIdx];
    if (!step) return;
    const turn: CallTurn = {
      ideaId: step.ideaId,
      qIndex: step.qIndex,
      question: step.question,
      answer,
    };
    setTurns((t) => [...t, turn]);
    setPartial("");
    setPhase("thinking");
    schedule(() => {
      setPhase("acking");
      schedule(() => advance(), 1600);
    }, 900);
  }

  function advance() {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= script.length) {
      finishCall();
      return;
    }
    setStepIdx(nextIdx);
    setPhase("asking");
  }

  function finishCall() {
    setPhase("goodbye");
    schedule(() => {
      // Use functional read to get latest turns
      setTurns((latest) => {
        const hasExtra = !!latest.find(
          (t) => t.ideaId === "extra" && t.answer.trim().length > 20,
        );
        onComplete({
          ideas,
          extraIdea: hasExtra ? { ...CALL_EXTRA_IDEA, id: `extra-${Date.now()}` } : null,
        });
        return latest;
      });
    }, 2200);
  }

  function submitText() {
    if (!textInput.trim()) return;
    clearAll();
    commitAnswer(textInput.trim());
    setTextInput("");
  }

  function interrupt() {
    // Barge-in: if AI is speaking (asking/acking), jump straight to listening
    clearAll();
    if (phase === "asking" || phase === "acking" || phase === "greeting") {
      if (textMode) {
        setPhase("asking");
        setTimeout(() => textareaRef.current?.focus(), 50);
      } else {
        startListening();
      }
    }
  }

  function toggleTextMode() {
    setTextMode((v) => {
      const next = !v;
      if (next) {
        // pause listening simulation, wait for user
        clearAll();
        setPartial("");
        setPhase("asking");
        setTimeout(() => textareaRef.current?.focus(), 50);
      } else {
        // resume voice; if we're already asking, kick listening
        setTimeout(() => startListening(), 200);
      }
      return next;
    });
  }

  const step = script[stepIdx];
  const total = script.length;
  const progress = ((stepIdx + (phase === "acking" || phase === "thinking" ? 1 : 0)) / total) * 100;

  const statusLabel: Record<CallPhase, string> = {
    connecting: "Connecting…",
    greeting: "Isla is speaking",
    asking: "Isla is speaking",
    listening: "Listening",
    thinking: "Isla is thinking",
    acking: "Isla is speaking",
    "wrap-up": "Wrapping up",
    goodbye: "Ending call…",
  };

  const isAiSpeaking = phase === "greeting" || phase === "asking" || phase === "acking";
  const isListening = phase === "listening";

  const currentIdea = step?.ideaId === "extra"
    ? null
    : ideas.find((i) => i.id === step?.ideaId) ?? null;

  function mmss(s: number) {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${String(ss).padStart(2, "0")}`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-2.5 rounded-full bg-primary" />
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
          </div>
          <div className="text-sm font-semibold">Live call with Isla</div>
          <div className="text-xs text-muted-foreground tabular-nums">{mmss(elapsed)}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground hidden md:block">
            {step?.ideaId === "extra"
              ? `Extra opportunity`
              : `Idea ${ideas.findIndex((i) => i.id === step?.ideaId) + 1} of ${ideas.length} · Q${(step?.qIndex ?? 0) + 1}/3`}
          </div>
          <div className="w-40 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_360px] overflow-hidden">
        {/* Left: idea being refined */}
        <div className="hidden lg:flex flex-col border-r border-border/60 bg-card/30 p-6">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
            Refining now
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {currentIdea ? (
              <>
                <div className="space-y-2">
                  <span className="inline-flex items-center text-[10px] uppercase tracking-widest text-primary px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                    Idea {ideas.findIndex((i) => i.id === step?.ideaId) + 1} of {ideas.length}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug">{currentIdea.hook}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Pillar</div>
                    <div className="text-sm font-medium">{currentIdea.pillar}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Angle</div>
                    <div className="text-sm text-muted-foreground leading-snug">{currentIdea.angle}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentIdea.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <span className="inline-flex items-center text-[10px] uppercase tracking-widest text-primary px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                  Extra opportunity
                </span>
                <h3 className="text-sm font-semibold leading-snug">Last question — any interesting story, opinion, or lesson from this week?</h3>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-border/60">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Call progress</div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {step?.ideaId === "extra"
                ? "Final question"
                : `Q${(step?.qIndex ?? 0) + 1}/3 · ${Math.max(0, total - stepIdx - 1)} left`}
            </div>
          </div>
        </div>

        {/* Center: stage */}
        <div className="flex flex-col items-center justify-center px-8 py-10 relative">
          {/* Avatar */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
              animate={{
                scale: isAiSpeaking ? [1, 1.3, 1] : isListening ? [1, 1.1, 1] : 1,
                opacity: isAiSpeaking ? [0.4, 0.8, 0.4] : isListening ? [0.2, 0.4, 0.2] : 0.2,
              }}
              transition={{ duration: isAiSpeaking ? 1.2 : 2, repeat: Infinity }}
            />
            <div
              className={`relative size-40 rounded-full grid place-items-center overflow-hidden border-2 transition-colors ${
                isAiSpeaking
                  ? "border-primary"
                  : isListening
                    ? "border-primary/40"
                    : "border-border"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
              <div className="relative size-24 rounded-full bg-primary/20 backdrop-blur grid place-items-center">
                <IslaLogo className="size-12 text-primary" />
              </div>
            </div>
            {/* Ring pulses */}
            {isAiSpeaking && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-primary/60 animate-ping" />
                <span
                  className="absolute -inset-3 rounded-full border border-primary/30 animate-ping"
                  style={{ animationDuration: "1.8s" }}
                />
              </>
            )}
          </div>

          {/* Status */}
          <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            {isAiSpeaking && <Volume2 className="size-3.5 text-primary animate-pulse" />}
            {isListening && (
              <span className="flex items-end gap-0.5 h-3">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    className="w-0.5 bg-primary rounded-full"
                    animate={{ height: [3, 10, 5, 12, 4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </span>
            )}
            {statusLabel[phase]}
          </div>

          {/* Current question */}
          <div className="mt-8 max-w-2xl w-full text-center min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.h2
                key={stepIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-2xl md:text-[28px] font-semibold tracking-tight leading-snug"
              >
                {phase === "connecting"
                  ? "Connecting to Isla…"
                  : phase === "goodbye"
                    ? "Thanks — building your drafts now."
                    : step?.question}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Partial transcript / text input */}
          <div className="mt-6 w-full max-w-2xl min-h-[160px]">
            {textMode ? (
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Keyboard className="size-3" /> Typing instead of speaking
                </div>
                <Textarea
                  ref={textareaRef}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitText();
                    }
                  }}
                  placeholder="Type your answer and press Enter…"
                  rows={3}
                  className="resize-none border-0 bg-transparent focus-visible:ring-0 text-base p-0"
                />
                <div className="flex items-center justify-end mt-2">
                  <Button size="sm" onClick={submitText} disabled={!textInput.trim()}>
                    Send <Send className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {(partial || isListening) && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl bg-card/60 border border-border/60 p-4 text-left backdrop-blur"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      You
                    </div>
                    <p className="text-[15px] leading-relaxed text-foreground/90 min-h-[1.5em]">
                      {partial || <span className="text-muted-foreground italic">Go ahead, I'm listening…</span>}
                      {isListening && partial && (
                        <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 align-middle animate-pulse" />
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right: transcript log */}
        <div className="hidden lg:flex flex-col border-l border-border/60 bg-card/30">
          <div className="px-5 py-4 border-b border-border/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            Transcript
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {turns.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Your answers will appear here as the call goes.
              </p>
            )}
            {turns.map((t, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-start">
                  <div className="max-w-[85%] space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-primary">
                      <img src={islaAiIcon} alt="Isla" className="size-2.5" /> Isla
                    </div>
                    <div className="text-[13px] leading-relaxed text-foreground/90">
                      {t.question}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-muted px-3 py-2 text-[13px] leading-relaxed text-foreground">
                    {t.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="border-t border-border/60 px-6 py-4 flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={toggleTextMode}
          className="rounded-full"
        >
          {textMode ? <Mic className="size-4 mr-2" /> : <Keyboard className="size-4 mr-2" />}
          {textMode ? "Switch to voice" : "Type instead"}
        </Button>
        {isAiSpeaking && !textMode && (
          <Button variant="ghost" size="lg" onClick={interrupt} className="rounded-full">
            Interrupt
          </Button>
        )}
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setConfirmHangup(true)}
          className="rounded-full"
        >
          <PhoneOff className="size-4 mr-2" /> End call
        </Button>
      </div>

      {/* Hangup confirm */}
      <Dialog open={confirmHangup} onOpenChange={setConfirmHangup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End the call?</DialogTitle>
            <DialogDescription>
              {turns.length > 0
                ? `I'll generate drafts from what we've covered so far (${turns.length} answer${turns.length === 1 ? "" : "s"}).`
                : "We haven't covered anything yet — the call will be discarded."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmHangup(false)}>
              Keep talking
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAll();
                if (turns.length === 0) {
                  onCancel();
                } else {
                  const hasExtra = !!turns.find(
                    (t) => t.ideaId === "extra" && t.answer.trim().length > 20,
                  );
                  onComplete({
                    ideas,
                    extraIdea: hasExtra
                      ? { ...CALL_EXTRA_IDEA, id: `extra-${Date.now()}` }
                      : null,
                  });
                }
              }}
            >
              End call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================ INTERVIEW ============================ */

type MicState = "idle" | "listening" | "recording" | "thinking";

function InterviewStage({
  idea,
  onComplete,
}: {
  idea: Idea;
  onComplete: (answers: string[]) => void;
}) {

  const [qIndex, setQIndex] = useState(0);
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [micState, setMicState] = useState<MicState>("idle");
  const [transcript, setTranscript] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTypingTimer() {
    if (typingTimer.current) {
      clearInterval(typingTimer.current);
      typingTimer.current = null;
    }
  }

  useEffect(() => () => clearTypingTimer(), []);

  function startRecording() {
    if (micState !== "idle") return;
    setMicState("listening");
    setTranscript("");
    // shortly move to recording + typewriter simulation
    setTimeout(() => {
      setMicState("recording");
      const full = MOCK_TRANSCRIPTS[qIndex] ?? "";
      let i = 0;
      clearTypingTimer();
      typingTimer.current = setInterval(() => {
        i += 2;
        setTranscript(full.slice(0, i));
        if (i >= full.length) {
          clearTypingTimer();
        }
      }, 22);
    }, 500);
  }

  function stopAndSubmit() {
    clearTypingTimer();
    const full = MOCK_TRANSCRIPTS[qIndex] ?? "";
    const answer = transcript.length > 20 ? transcript : full;
    setTranscript(answer);
    submitAnswer(answer);
  }

  function submitAnswer(answer: string) {
    setMicState("thinking");
    setTransitioning(true);
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setTimeout(() => {
      if (qIndex + 1 >= INTERVIEW_QUESTIONS.length) {
        onComplete(nextAnswers);
        return;
      }
      setQIndex((i) => i + 1);
      setTranscript("");
      setChatInput("");
      setMicState("idle");
      setTransitioning(false);
    }, 1600);
  }

  function submitChat() {
    if (!chatInput.trim()) return;
    submitAnswer(chatInput.trim());
  }

  const question = INTERVIEW_QUESTIONS[qIndex];

  return (
    <div>



      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">Step 2 of 4</div>
          <h1 className="text-3xl font-bold mt-2 tracking-tight">AI Interview</h1>
          <p className="text-muted-foreground mt-2">
            Let's turn this idea into an authentic LinkedIn post.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Progress
          </div>
          <div className="text-sm font-semibold mt-1">
            Question {qIndex + 1} of {INTERVIEW_QUESTIONS.length}
          </div>
          <div className="flex items-center gap-1 mt-2 justify-end">
            {INTERVIEW_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-colors ${
                  i < qIndex
                    ? "bg-primary"
                    : i === qIndex
                      ? "bg-primary/60"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Idea card compact */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-8 flex items-start gap-3">
        <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Working on
          </div>
          <p className="text-sm font-semibold leading-snug mt-0.5 line-clamp-2">{idea.hook}</p>
        </div>
      </div>

      {/* Main interview area */}
      <div className="rounded-3xl bg-card border border-border p-10 min-h-[440px] flex flex-col items-center justify-center relative">
        <button
          onClick={() => setMode(mode === "voice" ? "chat" : "voice")}
          className="absolute top-5 right-5 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background/40"
        >
          {mode === "voice" ? (
            <>
              <MessageSquare className="size-3.5" /> Switch to chat
            </>
          ) : (
            <>
              <Mic className="size-3.5" /> Switch to voice
            </>
          )}
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-2xl text-center"
          >
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
              Question {qIndex + 1}
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              {question}
            </h2>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 w-full flex flex-col items-center">
          {mode === "voice" ? (
            <VoiceControl
              micState={micState}
              transcript={transcript}
              onStart={startRecording}
              onStop={stopAndSubmit}
              transitioning={transitioning}
            />
          ) : (
            <ChatControl
              value={chatInput}
              onChange={setChatInput}
              onSubmit={submitChat}
              thinking={micState === "thinking"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function VoiceControl({
  micState,
  transcript,
  onStart,
  onStop,
  transitioning,
}: {
  micState: MicState;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
  transitioning: boolean;
}) {
  const label = {
    idle: "Tap to speak",
    listening: "Listening…",
    recording: "Recording — tap to finish",
    thinking: "Isla is thinking…",
  }[micState];

  const isActive = micState === "listening" || micState === "recording";

  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={isActive ? onStop : onStart}
        disabled={micState === "thinking" || transitioning}
        className="relative size-24 rounded-full bg-primary text-primary-foreground grid place-items-center transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label={label}
      >
        {micState === "thinking" ? (
          <Loader2 className="size-8 animate-spin" />
        ) : (
          <Mic className="size-8" />
        )}
        {isActive && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40" />
            <span
              className="absolute -inset-4 rounded-full border border-primary/40 animate-ping opacity-30"
              style={{ animationDuration: "2s" }}
            />
          </>
        )}
      </button>

      <div className="mt-5 text-sm text-muted-foreground uppercase tracking-widest text-xs">
        {label}
      </div>

      {/* Live waveform mock */}
      {isActive && (
        <div className="mt-6 flex items-end gap-1 h-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{ height: [6, 22, 10, 26, 8, 18, 6][i % 7] }}
              transition={{
                duration: 0.6 + (i % 5) * 0.1,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.03,
              }}
              style={{ height: 6 }}
            />
          ))}
        </div>
      )}

      {/* Live transcript */}
      <div className="mt-8 min-h-[80px] w-full max-w-2xl">
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-background/60 border border-border/60 p-4 text-left"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Transcript
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {transcript}
                {micState === "recording" && (
                  <span className="inline-block w-2 h-4 bg-primary/70 ml-0.5 align-middle animate-pulse" />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChatControl({
  value,
  onChange,
  onSubmit,
  thinking,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  thinking: boolean;
}) {
  return (
    <div className="w-full max-w-2xl">
      {thinking && (
        <div className="mb-3 text-xs text-muted-foreground animate-pulse text-center">
          Isla is thinking…
        </div>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-background/60 p-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={2}
          placeholder="Type your answer…"
          disabled={thinking}
          className="resize-none border-0 bg-transparent focus-visible:ring-0 text-base"
        />
        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!value.trim() || thinking}
          className="shrink-0 rounded-xl"
        >
          <Send className="size-4" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}

/* ============================ HOOK SELECTION ============================ */

function HookSelectionStage({
  idea,
  selected,
  onSelect,
  onGenerate,
}: {
  idea: Idea;
  selected: string | null;
  onSelect: (h: string) => void;
  onGenerate: () => void;
}) {

  const hooks = useMemo(() => HOOK_TEMPLATES(idea), [idea]);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>



      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-primary">Step 3 of 4</div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">Pick your hook</h1>
        <p className="text-muted-foreground mt-2">
          Isla drafted 5 openings based on your interview. Pick the one that hits.
        </p>
      </div>

      {generating ? (
        <div className="rounded-3xl bg-card border border-border p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative">
            <Wand2 className="size-10 text-primary" />
            <span className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          </div>
          <div className="mt-6 text-sm font-medium">Generating hooks…</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Reading your answers and matching your voice
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {hooks.map((h, i) => {
              const active = selected === h;
              return (
                <motion.button
                  key={h}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => onSelect(h)}
                  className={`text-left rounded-2xl border p-5 transition-all ${
                    active
                      ? "bg-primary/5 border-primary shadow-[0_0_0_1px_hsl(var(--primary))]"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 size-6 rounded-full grid place-items-center text-xs font-mono ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <p className="text-base leading-snug font-medium">{h}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-10 flex justify-end">
            <Button
              size="lg"
              disabled={!selected}
              onClick={onGenerate}
              className="rounded-full px-8"
            >
              Generate Draft <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================ DRAFT ============================ */

function DraftStage({
  blank = false,
  idea,
  hook,
  initialContent,
  initialScheduledAt = null,
  onCreateAnother,
  onBack,
  collapsed,
}: {
  blank?: boolean;
  idea: Idea;
  hook: string;
  initialContent?: string;
  initialScheduledAt?: Date | null;
  onCreateAnother: (
    content: string,
    meta?: { reviewRequested?: boolean; scheduledAt?: Date | null },
  ) => void;
  onContinueRefining: () => void;
  onBack: () => void;
  collapsed: boolean;
}) {
  const [draft, setDraft] = useState(initialContent ?? "");
  const [generating, setGenerating] = useState(!blank && !initialContent);
  const [refining, setRefining] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { id: string; role: "user" | "assistant"; text: string }[]
  >([
    {
      id: "welcome",
      role: "assistant",
      text: "I'll help you shape this post. Try a preset below, or tell me what to change — shorter, add a story, more controversial, whatever fits.",
    },
  ]);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(initialScheduledAt);
  const [reviewRequested, setReviewRequested] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [reviewsRemaining, setReviewsRemaining] = useState(() => {
    if (typeof window === "undefined") return 2;
    const raw = window.localStorage.getItem("isla-review-credits");
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) ? Math.max(0, Math.min(2, n)) : 2;
  });

  const [image, setImage] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<
    { id: string; author: string; text: string; createdAt: number }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const chatViewportRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    if (initialContent) {
      // Editing an existing post — keep its saved content.
      setGenerating(false);
      return;
    }
    if (blank) {
      setGenerating(false);
      setDraft("");
      return;
    }
    setGenerating(true);
    const t = setTimeout(() => {
      setDraft(DRAFT_TEMPLATE(idea, hook));
      setGenerating(false);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll chat viewport to bottom when pinned
  useEffect(() => {
    const el = chatViewportRef.current;
    if (!el) return;
    if (pinned) {
      el.scrollTop = el.scrollHeight;
      setHasUnseen(false);
    } else {
      setHasUnseen(true);
    }
  }, [chatMessages, pinned]);

  function onChatScroll() {
    const el = chatViewportRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setPinned(nearBottom);
    if (nearBottom) setHasUnseen(false);
  }

  function jumpToLatest() {
    const el = chatViewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setPinned(true);
    setHasUnseen(false);
  }

  function streamAssistant(fullText: string) {
    const id = `a-${Date.now()}`;
    setChatMessages((m) => [...m, { id, role: "assistant", text: "" }]);
    let i = 0;
    const tick = () => {
      i += Math.max(2, Math.round(fullText.length / 80));
      setChatMessages((m) =>
        m.map((msg) =>
          msg.id === id ? { ...msg, text: fullText.slice(0, i) } : msg,
        ),
      );
      if (i < fullText.length) setTimeout(tick, 30);
    };
    setTimeout(tick, 120);
  }

  function applyRefinement(instruction: string) {
    if (!instruction.trim() || refining) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      text: instruction,
    };
    setChatMessages((m) => [...m, userMsg]);
    setRefineInput("");
    setRefining(true);
    setTimeout(() => {
      setDraft((prev) => mockRefine(prev, instruction, idea, hook));
      setRefining(false);
      streamAssistant(
        `Done. I've reshaped the draft around "${instruction}". Take a look on the left — keep going if you want another pass.`,
      );
    }, 1000);
  }

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-9rem)] overflow-hidden">



      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] flex-1 min-h-0">
        {/* Editor */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/60 bg-background/40 shrink-0">
            <ToolbarBtn>
              <Heading1 className="size-3.5" />
            </ToolbarBtn>
            <ToolbarBtn>
              <Bold className="size-3.5" />
            </ToolbarBtn>
            <ToolbarBtn>
              <Italic className="size-3.5" />
            </ToolbarBtn>
            <ToolbarBtn>
              <List className="size-3.5" />
            </ToolbarBtn>
            <label
              className="ml-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2 py-1 hover:bg-muted transition-colors"
              title="Add image"
            >
              <ImageIcon className="size-3.5" />
              <span className="hidden sm:inline">Add image</span>
              <input type="file" accept="image/*" className="hidden" onChange={onFilePick} />
            </label>
            {scheduledAt ? (
              <div className="inline-flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 text-primary bg-primary/10">
                <button
                  type="button"
                  onClick={() => setScheduleOpen(true)}
                  className="inline-flex items-center gap-1.5 hover:opacity-80"
                  title="Change schedule"
                >
                  <CalendarClock className="size-3.5" />
                  <span className="hidden sm:inline">
                    {scheduledAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduledAt(null)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 text-primary"
                  title="Cancel schedule"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium rounded-md px-2 py-1 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Schedule post"
              >
                <CalendarClock className="size-3.5" />
                <span className="hidden sm:inline">Schedule post</span>
              </button>
            )}

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                disabled={generating || !draft}
                className="h-7 px-2 text-xs"
              >
                <Eye className="size-3.5 mr-1" /> Preview on LinkedIn
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-6 relative">
            {generating ? (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-6 text-primary animate-spin" />
                  <div className="text-sm">Writing your post…</div>
                  <div className="text-xs text-muted-foreground">
                    Weaving your story, angle and hook together
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {refining && (
                  <div className="sticky top-0 z-10 -mt-1 mb-1 flex items-center justify-end gap-2 text-[11px] text-primary">
                    <Loader2 className="size-3 animate-spin" /> Refining…
                  </div>
                )}
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full bg-transparent outline-none resize-none text-[14px] leading-[1.7] font-normal tracking-[0.005em]"
                  style={{ minHeight: "auto" }}
                  rows={Math.max(12, draft.split("\n").length + 2)}
                  spellCheck={false}
                />

                {/* Attachments preview */}
                {image && (
                  <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap gap-2">
                    <div className="relative group rounded-xl overflow-hidden border border-border w-28 h-28">
                      <img src={image} alt="attachment" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImage(null)}
                        className="absolute top-1 right-1 size-6 grid place-items-center rounded-full bg-background/80 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right column: Human Review + Refinement chat */}
        <div className="flex flex-col gap-4 min-h-0">
        {/* Human review card (compact) */}
        <div className="rounded-2xl border border-border bg-card p-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <Users className="size-4 text-primary" /> Isla Human Review
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCommentsOpen(true)}
              className="rounded-[10px] gap-1.5 hover:bg-muted hover:text-foreground"
            >
              <MessageSquare className="size-4" />
              Comments
              {comments.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                >
                  {comments.length}
                </Badge>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setReviewOpen(true)}
              disabled={generating || !draft || reviewRequested}
              className="ml-auto flex-1 rounded-[10px] text-white [&_svg]:text-white"
            >
              {reviewRequested ? "Review requested" : "Request review"}
            </Button>
          </div>

        </div>


        {/* Refinement chat */}
        <div className="rounded-2xl bg-card border border-border flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/60 shrink-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
              <img src={islaAiIcon} alt="Isla" className="size-3" /> Refinement chat
            </div>

          </div>


          <div className="px-3 pt-2.5 pb-2 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {REFINEMENT_PRESETS.map((p) => (
                <button
                  key={p}
                  disabled={refining || generating}
                  onClick={() => applyRefinement(p)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 border border-border/60 disabled:opacity-50 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chat viewport */}
          <div className="relative flex-1 min-h-0">
            <div
              ref={chatViewportRef}
              onScroll={onChatScroll}
              role="log"
              aria-relevant="additions"
              className="absolute inset-0 overflow-y-auto px-3 py-2 space-y-2.5 scroll-smooth"
            >
              <AnimatePresence initial={false}>
                {chatMessages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[85%] rounded-2xl rounded-br-sm bg-muted px-3 py-1.5 text-[13px] leading-relaxed text-foreground"
                          : "max-w-[85%] text-[13px] leading-relaxed text-foreground/90"
                      }
                    >
                      {m.role === "assistant" && (
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-primary mb-0.5">
                          <img src={islaAiIcon} alt="Isla" className="size-2.5" /> Isla
                        </div>

                      )}
                      {m.text || (
                        <span className="inline-flex gap-1 opacity-60">
                          <span className="size-1.5 rounded-full bg-current animate-pulse" />
                          <span
                            className="size-1.5 rounded-full bg-current animate-pulse"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="size-1.5 rounded-full bg-current animate-pulse"
                            style={{ animationDelay: "300ms" }}
                          />
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {refining && (
                <div className="flex justify-start">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <Loader2 className="size-3 animate-spin" /> Refining draft…
                  </div>
                </div>
              )}
            </div>

            {/* Jump to latest */}
            <AnimatePresence>
              {!pinned && hasUnseen && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  onClick={jumpToLatest}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-border bg-background/95 backdrop-blur px-3 py-1 text-[11px] shadow-sm hover:bg-muted"
                >
                  <ArrowDown className="size-3" /> New message
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Composer */}
          <div className="p-2.5 border-t border-border/60 shrink-0">
            <div className="rounded-xl border border-border bg-background/60 focus-within:border-primary/50 transition">
              <Textarea
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    applyRefinement(refineInput);
                  }
                }}
                rows={2}
                placeholder="Ask Isla to reshape the draft…"
                disabled={refining || generating}
                className="resize-none border-0 bg-transparent focus-visible:ring-0 text-[13px] min-h-0 py-2"
              />
              <div className="flex items-center gap-1 px-1.5 pb-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFilePick}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="size-7 grid place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  title="Attach image to post"
                >
                  <ImageIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleOpen(true)}
                  className={`size-7 grid place-items-center rounded-lg transition ${scheduledAt ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title="Schedule post"
                >
                  <CalendarClock className="size-3.5" />
                </button>
                <div className="ml-auto">
                  <Button
                    size="icon"
                    onClick={() => applyRefinement(refineInput)}
                    disabled={!refineInput.trim() || refining || generating}
                    className="size-7 rounded-lg"
                  >
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-end gap-2 pt-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={generating}
            className="rounded-[10px] hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onCreateAnother(draft, { reviewRequested, scheduledAt })}
            disabled={generating || !draft}
            className="rounded-[10px] text-white [&_svg]:text-white"
          >
            Save
          </Button>
        </div>
        </div>
      </div>



      <ReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        remaining={reviewsRemaining}
        onConfirm={() => {
          if (reviewsRemaining <= 0) return;
          const next = reviewsRemaining - 1;
          setReviewsRemaining(next);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("isla-review-credits", String(next));
          }
          setReviewOpen(false);
          setReviewRequested(true);
          onCreateAnother(draft, { reviewRequested: true, scheduledAt });
          toast.success("Review requested. A strategist will reply within 24h.");
        }}
      />

      <ScheduleModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        value={scheduledAt}
        onSave={(d) => {
          setScheduledAt(d);
          setScheduleOpen(false);
          toast.success(
            `Scheduled for ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`,
          );
        }}
      />
      <LinkedInPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        content={draft}
        image={image}
        scheduledAt={scheduledAt}
      />
      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle className="text-base">Comments</SheetTitle>
            <SheetDescription className="text-xs">
              Leave notes for whoever reviews this draft.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
            {comments.length === 0 ? (
              <div className="h-full grid place-items-center text-center py-16">
                <div>
                  <MessageSquare className="size-8 mx-auto text-muted-foreground/50" />
                  <div className="mt-3 text-sm font-medium">No comments yet</div>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[240px] mx-auto">
                    Add the first note — reviewers will see it before publishing.
                  </p>
                </div>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="size-8 rounded-full bg-primary/15 grid place-items-center text-[11px] font-semibold text-primary shrink-0">
                    {c.author
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-foreground">
                        {c.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelative(c.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-[13px] leading-relaxed text-foreground">
                      {c.text}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border p-3">
            <div className="rounded-xl border border-border bg-background/60 focus-within:border-primary/50 transition">
              <Textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const text = commentInput.trim();
                    if (!text) return;
                    setComments((cs) => [
                      ...cs,
                      { id: `c-${Date.now()}`, author: "You", text, createdAt: Date.now() },
                    ]);
                    setCommentInput("");
                  }
                }}
                rows={2}
                placeholder="Write a comment…"
                className="resize-none border-0 bg-transparent focus-visible:ring-0 text-[13px] min-h-0 py-2"
              />
              <div className="flex items-center justify-end px-1.5 pb-1.5">
                <Button
                  size="sm"
                  onClick={() => {
                    const text = commentInput.trim();
                    if (!text) return;
                    setComments((cs) => [
                      ...cs,
                      { id: `c-${Date.now()}`, author: "You", text, createdAt: Date.now() },
                    ]);
                    setCommentInput("");
                  }}
                  disabled={!commentInput.trim()}
                  className="h-7 rounded-lg text-white [&_svg]:text-white"
                >
                  <Send className="size-3.5 mr-1" /> Send
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}

function formatRelative(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function ToolbarBtn({ children }: { children: React.ReactNode }) {

  return (
    <button
      type="button"
      className="size-8 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
    >
      {children}
    </button>
  );
}

function mockRefine(prev: string, instruction: string, idea: Idea, hook: string): string {
  const i = instruction.toLowerCase();
  if (i.includes("short")) {
    return `${hook}\n\nTwo years ago I would have laughed at this.\n\nThen I watched it play out on my own team: cleaner metrics, emptier stories, losing every strategic room.\n\nWe stopped reporting on volume. We started reporting on named accounts and named humans. Every number came with a story.\n\n${idea.angle}\n\nWhat's the one metric your team defends that you privately think is a waste of time?`;
  }
  if (i.includes("story")) {
    return `${hook}\n\nLast quarter I sat in a QBR with our head of sales. He asked a simple question: "Which of these deals did marketing actually influence?"\n\nSilence.\n\nI had a dashboard with 14 charts. Not one of them could answer him.\n\nWe rebuilt it in a week. Three columns: deal, human, story. That's it.\n\nThe next QBR was a completely different room.\n\n${idea.angle}\n\nCurious — when's the last time your dashboard survived a hostile question?`;
  }
  if (i.includes("controversial")) {
    return `${hook}\n\nMost marketing dashboards are theater.\n\nThey exist to make VPs feel safe in meetings, not to shape a single decision. If yours can't survive one skeptical question from finance, you don't have analytics. You have a coping mechanism.\n\nI've killed three dashboards this year. Nobody missed them.\n\n${idea.angle}\n\nName one metric you'd delete tomorrow if nobody would notice.`;
  }
  if (i.includes("technical")) {
    return `${hook}\n\nHere's the tactical version:\n\n1. Kill any metric where the denominator isn't a real business event (impressions, opens, sessions).\n2. Replace with counts of named accounts moving between defined stages.\n3. Attach a 1-line qualitative note to every number in your weekly report.\n4. If a chart hasn't been referenced in a decision in 30 days, archive it.\n\n${idea.angle}\n\nWhich of those four would break your current stack the most?`;
  }
  if (i.includes("salesy") || i.includes("sales")) {
    return `${hook}\n\nI'm not going to pretend I figured this out from a framework.\n\nI figured it out because I lost an argument I should have won, in a room I care about, with people I respect.\n\nThat's usually how the important lessons arrive.\n\n${idea.angle}\n\nWhat's a lesson you only learned because it embarrassed you first?`;
  }
  // free-form: just append a subtle marker
  return prev + `\n\n(edited: ${instruction})`;
}

/* ============================ REVIEW MODAL ============================ */

function ReviewModal({
  open,
  onOpenChange,
  onConfirm,
  remaining,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  remaining: number;
}) {
  const [note, setNote] = useState("");
  const weeklyLimit = 2;
  const noCredits = remaining <= 0;
  const afterRemaining = Math.max(0, remaining - 1);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-4 text-primary" /> Request Human Review
          </DialogTitle>
          <DialogDescription>
            Our content strategists will review this post and send suggestions within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Weekly review credits
              </div>
              <div className="text-2xl font-bold mt-0.5">
                {remaining} <span className="text-muted-foreground font-medium">/ {weeklyLimit}</span>
              </div>
            </div>
            <FileText className="size-8 text-primary/60" />
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(remaining / weeklyLimit) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            {noCredits ? (
              <>
                You've used both weekly reviews. Credits reset next Monday.
              </>
            ) : (
              <>
                Confirming will consume <span className="font-medium text-foreground">1 credit</span>{" "}
                — you'll have{" "}
                <span className="font-medium text-foreground">
                  {afterRemaining} of {weeklyLimit}
                </span>{" "}
                left this week.
              </>
            )}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Anything specific to check? (optional)
          </label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Is the hook strong enough?"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={noCredits} className="rounded-full text-white [&_svg]:text-white">
            {noCredits ? "No credits left" : "Use 1 credit & request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


/* ============================ SCHEDULE MODAL ============================ */

function ScheduleModal({
  open,
  onOpenChange,
  value,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: Date | null;
  onSave: (d: Date) => void;
}) {
  const defaultDate = value ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [date, setDate] = useState(defaultDate.toISOString().slice(0, 10));
  const [time, setTime] = useState(
    `${String(defaultDate.getHours()).padStart(2, "0")}:${String(defaultDate.getMinutes()).padStart(2, "0")}`,
  );

  useEffect(() => {
    if (!open) return;
    const d = value ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
    setDate(d.toISOString().slice(0, 10));
    setTime(
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    );
  }, [open, value]);

  const quickPicks = [
    { label: "Tomorrow 9:00", offsetH: 24, hour: 9 },
    { label: "Tomorrow 12:00", offsetH: 24, hour: 12 },
    { label: "In 3 days", offsetH: 72, hour: 9 },
    { label: "Next Monday 8:00", offsetH: 0, hour: 8, nextMonday: true },
  ];

  function pick(q: (typeof quickPicks)[number]) {
    const d = new Date();
    if (q.nextMonday) {
      const day = d.getDay();
      const diff = (8 - day) % 7 || 7;
      d.setDate(d.getDate() + diff);
    } else {
      d.setTime(d.getTime() + q.offsetH * 60 * 60 * 1000);
    }
    d.setHours(q.hour, 0, 0, 0);
    setDate(d.toISOString().slice(0, 10));
    setTime(`${String(d.getHours()).padStart(2, "0")}:00`);
  }

  function handleSave() {
    const [y, m, dd] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(y, (m ?? 1) - 1, dd ?? 1, hh ?? 9, mm ?? 0, 0);
    onSave(d);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" /> Schedule post
          </DialogTitle>
          <DialogDescription>
            Pick a date and time to publish this post on LinkedIn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Quick picks
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPicks.map((q) => (
                <button
                  key={q.label}
                  onClick={() => pick(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 border border-border/60 transition"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-full">
            <CalendarClock className="size-4 mr-1" /> Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ LINKEDIN PREVIEW MODAL ============================ */

function LinkedInPreviewModal({
  open,
  onOpenChange,
  content,
  image,
  scheduledAt,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: string;
  image: string | null;
  scheduledAt: Date | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[94vw] p-0 overflow-hidden bg-white border-0 gap-0 [&>button]:hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>LinkedIn preview</DialogTitle>
          <DialogDescription>Preview how this post will look on LinkedIn.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#e0dfdc] shrink-0">
          <div className="size-8 rounded grid place-items-center bg-[#0a66c2] text-white">
            <Linkedin className="size-5" fill="currentColor" strokeWidth={0} />
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="size-7 grid place-items-center rounded-full border border-[#e0dfdc] text-[#00000099] hover:bg-[#f4f2ee] transition"
            aria-label="Close preview"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.4fr_0.7fr] bg-[#f4f2ee] p-4 gap-4 h-[75vh] max-h-[760px]">
          {/* LEFT — skeletons */}
          <div className="hidden md:flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4">
              <div className="size-14 rounded-full bg-[#ebe9e6]" />
              <div className="mt-4 space-y-2">
                <div className="h-2.5 w-3/4 rounded bg-[#ebe9e6]" />
                <div className="h-2 w-full rounded bg-[#ebe9e6]" />
                <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-2 w-full rounded bg-[#ebe9e6]" />
                <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4 space-y-2">
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
            </div>
          </div>

          {/* CENTER — post preview */}
          <div className="bg-white rounded-lg border border-[#e0dfdc] overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto flex-1">
              <div className="flex items-start gap-2.5 px-5 pt-4">
                <img
                  src={chrisAvatar}
                  alt="Chris Theroux"
                  loading="lazy"
                  width={816}
                  height={816}
                  className="size-12 rounded-full object-cover border border-[#e0dfdc]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-[#0a0a0a] leading-tight flex items-center gap-1">
                    Chris Theroux
                  </div>
                  <div className="text-[12px] text-[#00000099] leading-tight mt-0.5">
                    Head of Growth at Nortex | B2B pipeline, content & RevOps
                  </div>
                  <div className="text-[12px] text-[#00000099] leading-tight mt-1 flex items-center gap-1">
                    {scheduledAt ? (
                      <>
                        Scheduled ·{" "}
                        {scheduledAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · <CalendarClock className="size-3" />
                      </>
                    ) : (
                      <>Now · 🌐</>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pt-3 pb-4">
                <p className="text-[14px] text-[#0a0a0a] whitespace-pre-wrap leading-[1.55]">
                  {content}
                </p>
              </div>

              {image && (
                <div className="border-t border-[#e0dfdc]">
                  <img
                    src={image}
                    alt="post attachment"
                    className="w-full max-h-[360px] object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — skeletons */}
          <div className="hidden md:flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4 space-y-2">
              <div className="h-2 w-3/4 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
            </div>
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4 space-y-2.5">
              <div className="h-2 w-3/4 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-full rounded bg-[#ebe9e6]" />
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-4/5 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-3/4 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
