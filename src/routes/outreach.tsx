import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Globe,
} from "lucide-react";
import { Sidebar } from "@/components/analytics/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title: "AI Outreach" },
      {
        name: "description",
        content:
          "Relevant posts to comment on today, prioritized by intent signals and engagement.",
      },
    ],
  }),
  component: OutreachPage,
});

type PostItem = {
  id: string;
  author: string;
  role: string;
  postedAt: string;
  content: string;
  extraContent?: string;
  image?: string;
  contextBullets: string[];
  suggestedComment: string;
  likes: number;
  comments: number;
  reposts: number;
};

const POSTS: PostItem[] = [
  {
    id: "1",
    author: "Marcos Figueiredo",
    role: "VP of Customer Experience · UX/UI · Design Systems & Metrics",
    postedAt: "Now",
    content:
      "I automated 100% of my blog article publishing with just a few steps. Without pressing a single button.",
    extraContent:
      " I connected Notion via API, a webhook triggers the deploy on Vercel, and a serverless function regenerates the sitemap. The result: I write the article, mark it as published, and in less than 30 seconds it's live with optimized SEO.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    contextBullets: [
      "Posted today about scaling support beyond 200 agents.",
      "Liked a post about AI tools for support last week.",
      "VP of Customer Experience",
    ],
    suggestedComment:
      "This is amazing! Could you explain how the Notion API connection works? Every time you publish a new article does it deploy automatically to the site or is that part still manual?",
    likes: 215,
    comments: 24,
    reposts: 8,
  },
  {
    id: "2",
    author: "Sarah Chen",
    role: "VP of Customer Experience · Acme Corp",
    postedAt: "2h",
    content:
      "We just crossed 200 support agents and the biggest lesson was: scaling without QA is scaling problems.",
    extraContent:
      " We're redesigning our quality layer from scratch — moving from sampling to full-conversation scoring, with tiered review depending on customer segment. Anyone been through this transition?",
    contextBullets: [
      "Reacted to your post on conversation scoring last week.",
      "Warming lead — visited pricing page twice this month.",
      "Rebuilding CX QA at 200+ agent scale.",
    ],
    suggestedComment:
      "The 200-agent mark is usually where sampling-based QA silently breaks. Curious how you're framing coverage vs. depth in the new layer — full-conversation scoring, or exception-based?",
    likes: 342,
    comments: 47,
    reposts: 12,
  },
  {
    id: "3",
    author: "Julia Almeida",
    role: "Head of Growth · SaaS B2B",
    postedAt: "1d",
    content:
      "Our CAC dropped 34% after we stopped scaling cold outbound and started prioritizing intent signals.",
    extraContent:
      " Nobody talks about this: it takes 2 quarters to work. Q1 you rebuild the motion, Q2 the pipeline starts compounding, and by Q3 the CFO stops asking why paid ads slowed down.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    contextBullets: [
      "Downloaded your intent-signal playbook 2 weeks ago.",
      "Head of Growth · SaaS B2B, ~$20M ARR — exact ICP match.",
      "Publicly rebuilding pipeline motion around intent.",
    ],
    suggestedComment:
      "The 2-quarter lag is the part nobody wants to underwrite internally. How did you get finance comfortable with the delayed payback while you rebuilt the motion?",
    likes: 890,
    comments: 124,
    reposts: 33,
  },
  {
    id: "4",
    author: "Priya Nair",
    role: "VP RevOps · HealthTech",
    postedAt: "2d",
    content:
      "If your forecast is always 20% above what closes, the problem isn't the team — it's the stage definition.",
    extraContent:
      " We rewrote ours and accuracy went from 63% to 91%. The biggest lift was tightening exit criteria per stage — removing anything that wasn't a customer-verifiable event.",
    contextBullets: [
      "Reshared your post on stage exit criteria in October.",
      "VP RevOps · HealthTech — owns forecast, stage architecture.",
      "Publicly wrestling with the exact problem your workflow solves.",
    ],
    suggestedComment:
      "63 → 91 is a huge jump. Curious whether the biggest lift came from tightening exit criteria per stage or from removing stages entirely.",
    likes: 512,
    comments: 68,
    reposts: 19,
  },
  {
    id: "5",
    author: "Marcus Rivera",
    role: "CEO · Fintech Unicorn",
    postedAt: "5h",
    content:
      "Hot take: 90% of SDRs will disappear in the next 3 years.",
    extraContent:
      " Not because AI replaces sellers — but because it replaces the manual work nobody should be doing in 2026. The reps who survive will be the ones who own last-mile judgment calls.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    contextBullets: [
      "Influencer · 180k followers, ideal amplifier.",
      "You reacted to his last 3 hot takes.",
      "CEO · Fintech Unicorn.",
    ],
    suggestedComment:
      "Agree on the direction, but the survivors won't be 'AI SDRs' — they'll be the reps who own the last-mile judgment calls. The manual work dies; the taste doesn't.",
    likes: 2140,
    comments: 312,
    reposts: 87,
  },
  {
    id: "6",
    author: "Elena Martins",
    role: "Head of Sales Ops · Logistics SaaS",
    postedAt: "4h",
    content:
      "Spent the week auditing our lead routing. 40% of high-intent leads were sitting in the wrong queue for 24h+.",
    extraContent:
      " Routing is the most underrated growth lever. We're moving to a scoring-based assignment and killing the rules-based logic entirely.",
    contextBullets: [
      "Visited your pricing page 2x this month.",
      "Head of Sales Ops · Logistics SaaS — owns routing stack.",
      "Warming lead.",
    ],
    suggestedComment:
      "The 24h delay usually kills conversion more than the routing itself. Are you fixing it with rules, or moving to a scoring-based assignment?",
    likes: 468,
    comments: 54,
    reposts: 11,
  },
  {
    id: "7",
    author: "David Kim",
    role: "Founder · YC W24",
    postedAt: "3d",
    content:
      "Founders: stop hiring a Head of Sales before your first 20 customers.",
    extraContent:
      " You are the best salesperson for the product until then. Learned this the hard way — the first 20 is where the ICP gets defined, and you can't outsource that learning loop.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    contextBullets: [
      "He replied to one of your comments 2 months ago.",
      "Founder · YC W24 — founder-audience amplifier.",
      "Influencer with high engagement.",
    ],
    suggestedComment:
      "The hidden cost isn't the hire — it's the founder outsourcing the learning loop right when signal is highest. First 20 is where the ICP gets defined.",
    likes: 3120,
    comments: 428,
    reposts: 156,
  },
];

const MISSION_TOTAL = POSTS.length;

type Tab = "suggested" | "commented";

function OutreachPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<Tab>("suggested");
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [commentedIds, setCommentedIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(POSTS.map((p) => [p.id, p.suggestedComment])),
  );
  const [regenId, setRegenId] = useState<string | null>(null);

  const queue = useMemo(
    () =>
      POSTS.filter(
        (p) => !skippedIds.has(p.id) && !commentedIds.has(p.id),
      ),
    [skippedIds, commentedIds],
  );
  const current = queue[0];

  const setDraft = (id: string, v: string) =>
    setDrafts((d) => ({ ...d, [id]: v.slice(0, 1250) }));

  const regenerate = (post: PostItem) => {
    setRegenId(post.id);
    window.setTimeout(() => {
      const variants = [
        post.suggestedComment,
        `Really resonates. The part I'd push on: what does the leading indicator look like before the outcome shows up?`,
        `Strong take, ${post.author.split(" ")[0]}. What was the hardest internal sell — the change itself, or the short-term dip while it took hold?`,
      ];
      const next = variants[Math.floor(Math.random() * variants.length)];
      setDrafts((d) => ({ ...d, [post.id]: next }));
      setRegenId(null);
      toast("Comment regenerated");
    }, 500);
  };

  const skip = (id: string) => setSkippedIds((s) => new Set(s).add(id));
  const send = (post: PostItem) => {
    setCommentedIds((s) => new Set(s).add(post.id));
    toast.success(`Comment sent on ${post.author}'s post`);
  };

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 px-6 py-8 lg:px-10 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight">AI Outreach</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Relevant posts to comment on today, prioritized by intent signals and engagement.
            </p>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
              <TabsList>
                <TabsTrigger value="suggested">Suggested</TabsTrigger>
                <TabsTrigger value="commented">Commented ({commentedIds.size})</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" className="gap-2">
              <Sparkles className="size-4" /> Generate New Comment
            </Button>
          </div>

          {tab === "suggested" && current ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <MissionCard done={commentedIds.size + skippedIds.size} total={MISSION_TOTAL} />
                <PostCard post={current} />
              </div>
              <div className="space-y-6">
                <ContextCard bullets={current.contextBullets} />
                <ComposerCard
                  key={current.id}
                  post={current}
                  value={drafts[current.id] ?? ""}
                  onChange={(v) => setDraft(current.id, v)}
                  onRegenerate={() => regenerate(current)}
                  regenerating={regenId === current.id}
                  onSkip={() => skip(current.id)}
                  onSend={() => send(current)}
                />
              </div>
            </div>
          ) : tab === "suggested" ? (
            <EmptyState />
          ) : (
            <CommentedList count={commentedIds.size} />
          )}
        </div>
      </main>
    </div>
  );
}

function MissionCard({ done, total }: { done: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (done / total) * 100));
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Today's Mission
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-semibold text-primary">{done}</span>
        <span className="text-2xl font-semibold text-muted-foreground">/{total}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PostItem }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = !!post.extraContent;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #4B6FA5 0%, #2D4B7A 100%)" }}
            aria-hidden
          >
            {post.author
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-card-foreground">
                {post.author}
              </span>
              <span aria-hidden>👋</span>
            </div>
            <div className="truncate text-[12px] text-muted-foreground">{post.role}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
              <span>{post.postedAt}</span>
              <span>·</span>
              <Globe className="size-3" />
            </div>
          </div>
        </div>
        <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.5] text-card-foreground">
          {post.content}
          {expanded && post.extraContent}
          {hasMore && !expanded && (
            <>
              {"... "}
              <button
                onClick={() => setExpanded(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                more
              </button>
            </>
          )}
        </p>
      </div>

      {post.image && (
        <div className="border-t border-border/60">
          <img
            src={post.image}
            alt=""
            className="block h-auto max-h-[360px] w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex items-center gap-6 border-t border-border/60 px-5 py-3 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="size-3.5" /> {post.likes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="size-3.5" /> {post.comments}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Repeat2 className="size-3.5" /> {post.reposts}
        </span>
      </div>
    </div>
  );
}

function ContextCard({ bullets }: { bullets: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
        Context about this lead
      </div>
      <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-card-foreground">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComposerCard({
  value,
  onChange,
  onRegenerate,
  regenerating,
  onSkip,
  onSend,
}: {
  post: PostItem;
  value: string;
  onChange: (v: string) => void;
  onRegenerate: () => void;
  regenerating: boolean;
  onSkip: () => void;
  onSend: () => void;
}) {
  const MAX = 1250;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold text-card-foreground">Your Comment</div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {value.length}/{MAX}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="mt-3 resize-none border-border bg-background/40 text-[14px] leading-relaxed text-card-foreground"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={regenerating}
          className="gap-2"
        >
          <RefreshCw className={cn("size-4", regenerating && "animate-spin")} />
          Regenerate
        </Button>
        <button
          onClick={onSkip}
          className="text-[13px] text-muted-foreground hover:text-foreground"
        >
          Skip
        </button>
        <Button onClick={onSend} className="gap-2 text-white [&_svg]:text-white">
          <Send className="size-4" /> Send Comment
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <div className="text-sm font-medium text-card-foreground">You're all caught up</div>
      <p className="mt-1 text-xs text-muted-foreground">
        No more suggested posts for today. Come back tomorrow.
      </p>
    </div>
  );
}

function CommentedList({ count }: { count: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <div className="text-sm font-medium text-card-foreground">
        {count} {count === 1 ? "comment" : "comments"} sent today
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {count === 0
          ? "Comment or skip a post to see it here."
          : "Great work — switch back to Suggested to keep going."}
      </p>
    </div>
  );
}
