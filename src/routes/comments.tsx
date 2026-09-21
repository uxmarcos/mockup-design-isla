import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Globe,
  ExternalLink,
  Flame,
  Eye,
  Check,
  Loader2,
} from "lucide-react";
import { Sidebar } from "@/components/analytics/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { avatarSrc } from "@/lib/avatars";

export const Route = createFileRoute("/comments")({
  head: () => ({
    meta: [
      { title: "Comments" },
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
  avatar: string;
  headline: string;
  postedAt: string;
  content: string[];
  likes: number;
  comments: number;
  reposts: number;
  source: "Pipeline" | "Monitored profile";
  reason: string;
  context: string;
  suggestedComments: string[];
  url: string;
};

const LINKEDIN_URL = "https://www.linkedin.com/feed/";
const MAX = 1250;

const POSTS: PostItem[] = [
  {
    id: "1",
    author: "Marcos Figueiredo",
    avatar: avatarSrc("M1"),
    headline: "VP of Customer Experience · UX/UI · Design Systems & Metrics",
    postedAt: "1 hour ago",
    content: [
      "I automated 100% of my blog article publishing with just a few steps. Without pressing a single button.",
      "I connected Notion via API, a webhook triggers the deploy on Vercel, and a serverless function regenerates the sitemap.",
      "The result: I write the article, mark it as published, and in less than 30 seconds it's live with optimized SEO.",
    ],
    likes: 215,
    comments: 24,
    reposts: 8,
    source: "Pipeline",
    reason: "Lead in your pipeline — posted today about automation.",
    context: "VP of Customer Experience automating his publishing workflow end to end",
    suggestedComments: [
      "This is amazing! Could you explain how the Notion API connection works? Every time you publish a new article does it deploy automatically to the site or is that part still manual?",
      "Love the zero-click publishing flow. What was the trickiest piece to get right — the webhook, or keeping the sitemap regeneration reliable?",
      "Really clean setup. Did you hit any rate limits with the Notion API once the article volume picked up?",
    ],
    url: LINKEDIN_URL,
  },
  {
    id: "2",
    author: "Sarah Chen",
    avatar: avatarSrc("F1"),
    headline: "VP of Customer Experience · Acme Corp",
    postedAt: "2 hours ago",
    content: [
      "We just crossed 200 support agents and the biggest lesson was: scaling without QA is scaling problems.",
      "We're redesigning our quality layer from scratch — moving from sampling to full-conversation scoring, with tiered review depending on customer segment. Anyone been through this transition?",
    ],
    likes: 342,
    comments: 47,
    reposts: 12,
    source: "Pipeline",
    reason: "Warming lead — reacted to your post on conversation scoring last week.",
    context: "Rebuilding CX quality assurance at 200+ agent scale",
    suggestedComments: [
      "The 200-agent mark is usually where sampling-based QA silently breaks. Curious how you're framing coverage vs. depth in the new layer — full-conversation scoring, or exception-based?",
      "Tiered review by customer segment is a smart call. How are you deciding which segments get full-conversation scoring first?",
      "Been through a similar transition. The hardest part for us was calibrating reviewers once scoring went full-conversation. Are you planning calibration sessions?",
    ],
    url: LINKEDIN_URL,
  },
  {
    id: "3",
    author: "Julia Almeida",
    avatar: avatarSrc("F2"),
    headline: "Head of Growth · SaaS B2B",
    postedAt: "5 hours ago",
    content: [
      "Our CAC dropped 34% after we stopped scaling cold outbound and started prioritizing intent signals.",
      "Nobody talks about this: it takes 2 quarters to work. Q1 you rebuild the motion, Q2 the pipeline starts compounding, and by Q3 the CFO stops asking why paid ads slowed down.",
    ],
    likes: 890,
    comments: 124,
    reposts: 33,
    source: "Pipeline",
    reason: "Exact ICP match — downloaded your intent-signal playbook 2 weeks ago.",
    context: "Head of Growth publicly rebuilding her pipeline motion around intent signals",
    suggestedComments: [
      "The 2-quarter lag is the part nobody wants to underwrite internally. How did you get finance comfortable with the delayed payback while you rebuilt the motion?",
      "34% is a big drop. Which intent signals ended up carrying the most weight in your scoring?",
      "Q2 is where most teams bail. What kept yours committed while the pipeline hadn't started compounding yet?",
    ],
    url: LINKEDIN_URL,
  },
  {
    id: "4",
    author: "Priya Nair",
    avatar: avatarSrc("F5"),
    headline: "VP RevOps · HealthTech",
    postedAt: "8 hours ago",
    content: [
      "If your forecast is always 20% above what closes, the problem isn't the team — it's the stage definition.",
      "We rewrote ours and accuracy went from 63% to 91%. The biggest lift was tightening exit criteria per stage — removing anything that wasn't a customer-verifiable event.",
    ],
    likes: 512,
    comments: 68,
    reposts: 19,
    source: "Monitored profile",
    reason: "Profile you monitor — owns forecast and stage architecture.",
    context: "Fixing forecast accuracy by tightening stage exit criteria",
    suggestedComments: [
      "63 → 91 is a huge jump. Curious whether the biggest lift came from tightening exit criteria per stage or from removing stages entirely.",
      "Customer-verifiable events as exit criteria is a great filter. Did reps push back when the stages got stricter?",
      "How long did it take before the new stage definitions showed up in forecast accuracy?",
    ],
    url: LINKEDIN_URL,
  },
  {
    id: "5",
    author: "Marcus Rivera",
    avatar: avatarSrc("M2"),
    headline: "CEO · Fintech Unicorn",
    postedAt: "1 day ago",
    content: [
      "Hot take: 90% of SDRs will disappear in the next 3 years.",
      "Not because AI replaces sellers — but because it replaces the manual work nobody should be doing in 2026. The reps who survive will be the ones who own last-mile judgment calls.",
    ],
    likes: 2140,
    comments: 312,
    reposts: 87,
    source: "Monitored profile",
    reason: "Profile you monitor — influencer with 180k followers, ideal amplifier.",
    context: "Bold take on the future of SDRs from a fintech CEO with a large audience",
    suggestedComments: [
      "Agree on the direction, but the survivors won't be 'AI SDRs' — they'll be the reps who own the last-mile judgment calls. The manual work dies; the taste doesn't.",
      "The manual work disappearing is the easy part to predict. What do you think the new baseline skill for a rep looks like?",
      "Curious how you'd split it — which parts of the SDR role go first, and which ones stay human the longest?",
    ],
    url: LINKEDIN_URL,
  },
];

const MISSION_TOTAL = POSTS.length;

type Tab = "suggested" | "commented";
type Sent = { post: PostItem; text: string };

function OutreachPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<Tab>("suggested");
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState<Sent[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [generatedCount, setGeneratedCount] = useState<Record<string, number>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const commentedIds = useMemo(() => new Set(sent.map((s) => s.post.id)), [sent]);
  const feed = useMemo(
    () => POSTS.filter((p) => !skippedIds.has(p.id) && !commentedIds.has(p.id)),
    [skippedIds, commentedIds],
  );

  const setDraft = (id: string, v: string) =>
    setDrafts((d) => ({ ...d, [id]: v.slice(0, MAX) }));

  const generate = (post: PostItem) => {
    setGeneratingId(post.id);
    window.setTimeout(() => {
      const n = generatedCount[post.id] ?? 0;
      const next = post.suggestedComments[n % post.suggestedComments.length];
      setDrafts((d) => ({ ...d, [post.id]: next }));
      setGeneratedCount((c) => ({ ...c, [post.id]: n + 1 }));
      setGeneratingId(null);
    }, 600);
  };

  const skip = (id: string) => setSkippedIds((s) => new Set(s).add(id));

  const send = (post: PostItem) => {
    const text = (drafts[post.id] ?? "").trim();
    if (!text) return;
    setSent((s) => [...s, { post, text }]);
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
        <div className="mx-auto w-full max-w-[720px] space-y-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight">Comments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Relevant posts to comment on today, prioritized by intent signals and engagement.
            </p>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
              <TabsList>
                <TabsTrigger value="suggested">Suggested</TabsTrigger>
                <TabsTrigger value="commented">Commented ({sent.length})</TabsTrigger>
              </TabsList>
            </Tabs>

          </div>

          <MissionBar done={sent.length} total={MISSION_TOTAL} />

          {tab === "suggested" ? (
            feed.length > 0 ? (
              <div className="space-y-6">
                {feed.map((post) => (
                  <PostBlock
                    key={post.id}
                    post={post}
                    value={drafts[post.id] ?? ""}
                    onChange={(v) => setDraft(post.id, v)}
                    onGenerate={() => generate(post)}
                    generating={generatingId === post.id}
                    onSkip={() => skip(post.id)}
                    onSend={() => send(post)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="You're all caught up"
                body="No more suggested posts for today. Come back tomorrow."
              />
            )
          ) : sent.length > 0 ? (
            <div className="space-y-4">
              {sent.map(({ post, text }) => (
                <SentCard key={post.id} post={post} text={text} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No comments sent yet"
              body="Comment on a suggested post to see it here."
            />
          )}
        </div>
      </main>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MissionBar({ done, total }: { done: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (done / total) * 100));
  const complete = done >= total;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
      <div className="flex items-baseline gap-1 tabular-nums">
        <span className="text-xl font-semibold text-primary">{done}</span>
        <span className="text-xl font-semibold text-muted-foreground">/ {total}</span>
      </div>
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {complete ? "Mission complete" : "Today's mission"}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PostContent({ post }: { post: PostItem }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-5">
      <div className="flex items-start gap-3">
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={post.avatar} alt={post.author} />
          <AvatarFallback className="text-[13px] font-semibold">
            {initials(post.author)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold text-card-foreground">{post.author}</span>
                {post.source === "Pipeline" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[12px] font-medium leading-none text-amber-300 light:bg-[#B7791F]/15 light:text-[#7A5200]">
                    <Flame className="size-3.5" />
                    Warm up
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-400/15 px-2.5 py-1 text-[12px] font-medium leading-none text-sky-300">
                    <Eye className="size-3.5" />
                    Monitored Profile
                  </span>
                )}
              </div>
              <div className="truncate text-[13px] text-muted-foreground">{post.headline}</div>
            </div>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              View on LinkedIn
            </a>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
            <span>{post.postedAt}</span>
            <span>·</span>
            <Globe className="size-3.5" />
          </div>
        </div>
      </div>

      {post.source === "Pipeline" && (
        <div className="mt-4 rounded-xl bg-amber-400/10 px-4 py-2.5 text-[14px] text-amber-300 light:bg-[#B7791F]/12 light:text-[#7A5200]">
          Engaging lead — comment to warm them up. This is a possible reach out.
        </div>
      )}

      <div className="mt-4 space-y-3 text-[13px] leading-[1.55] text-card-foreground">
        {post.content.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-6 border-t border-border/60 pt-3 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="size-4" /> {post.likes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="size-4" /> {post.comments}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Repeat2 className="size-4" /> {post.reposts}
        </span>
      </div>
    </div>
  );
}

function PostBlock({
  post,
  value,
  onChange,
  onGenerate,
  generating,
  onSkip,
  onSend,
}: {
  post: PostItem;
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  generating: boolean;
  onSkip: () => void;
  onSend: () => void;
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-4">
      <PostContent post={post} />

      <div className="rounded-2xl bg-primary/10 px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          Context about this lead
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.55] text-card-foreground">{post.context}</p>
      </div>

      <div className="px-1">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold text-card-foreground">Your Comment</div>
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {value.length}/{MAX}
          </span>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="Write or tweak the comment..."
          className="mt-3 resize-none rounded-2xl border-border bg-background/40 text-[15px] leading-relaxed text-card-foreground"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGenerate}
            disabled={generating}
            className="h-9 gap-2 px-2"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate comment
          </Button>
          <div className="flex items-center gap-4">
            <button
              onClick={onSkip}
              className="text-xs font-medium text-card-foreground transition-colors hover:text-muted-foreground"
            >
              Skip
            </button>
            <Button
              size="sm"
              onClick={onSend}
              disabled={!value.trim()}
              className="h-9 gap-2 px-4 text-white [&_svg]:text-white"
            >
              <Send className="size-4" /> Send Comment
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SentCard({ post, text }: { post: PostItem; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={post.avatar} alt={post.author} />
          <AvatarFallback className="text-[12px] font-semibold">
            {initials(post.author)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-semibold text-card-foreground">{post.author}</div>
          <div className="truncate text-xs text-muted-foreground">{post.headline}</div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-primary">
          <Check className="size-3.5" /> Sent
        </span>
      </div>
      <p className="mt-3 rounded-xl bg-background/40 px-4 py-3 text-[14px] leading-relaxed text-card-foreground">
        {text}
      </p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <div className="text-sm font-medium text-card-foreground">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
