// Mock data powering the Create Content hub. Swap for backend data later.

export type ContentCounts = {
  contentIdeas: number;
  likedIdeas: number;
  drafts: number;
  scheduledPosts: number;
};

export const contentCounts: ContentCounts = {
  contentIdeas: 12,
  likedIdeas: 7,
  drafts: 3,
  scheduledPosts: 4,
};

export type Momentum = "high" | "rising";

export type TrendingTopic = {
  id: string;
  headline: string;
  context: string;
  momentum: Momentum;
  why: string;
  date: string;
  source: string;
};

export const trendingTopics: TrendingTopic[] = [
  {
    id: "t1",
    headline: "NVIDIA receives $500M to expand AI chip production",
    context:
      "New capital accelerates supply for enterprise inference workloads through 2027.",
    momentum: "high",
    why: "Compute scarcity is the constraint every AI founder is talking about right now.",
    date: "Aug 13, 2026",
    source: "Semiconductor Weekly",
  },
  {
    id: "t2",
    headline: "OpenAI announces new enterprise AI initiative",
    context:
      "A dedicated program pairing deployment engineers with large accounts.",
    momentum: "high",
    why: "Enterprise buyers are shifting from experimentation to procurement — a hot GTM angle.",
    date: "Aug 12, 2026",
    source: "The Information",
  },
  {
    id: "t3",
    headline: "Microsoft expands AI infrastructure investment",
    context: "Three new regions announced, with capacity reserved for copilot workloads.",
    momentum: "rising",
    why: "Infra spend signals where budget will land next year — useful for B2B positioning posts.",
    date: "Aug 12, 2026",
    source: "Reuters",
  },
  {
    id: "t4",
    headline: "AI agents reshape SaaS workflows",
    context: "Teams are replacing multi-step internal tools with single agent surfaces.",
    momentum: "rising",
    why: "Your audience of operators is actively rethinking their stack around agents.",
    date: "Aug 11, 2026",
    source: "SaaStr",
  },
  {
    id: "t5",
    headline: "Founders shift toward AI-native products",
    context:
      "Seed rounds increasingly fund products that cannot exist without models.",
    momentum: "high",
    why: "Strong-opinion territory — your best performing hook type.",
    date: "Aug 11, 2026",
    source: "Crunchbase News",
  },
  {
    id: "t6",
    headline: "B2B buyers cut vendor shortlists by half",
    context: "Committees are consolidating around fewer, deeper platform bets.",
    momentum: "rising",
    why: "Direct implication for anyone selling into mid-market — high comment potential.",
    date: "Aug 10, 2026",
    source: "Gartner",
  },
  {
    id: "t7",
    headline: "LinkedIn tightens reach for outbound-heavy accounts",
    context: "Distribution now favors accounts with consistent original commentary.",
    momentum: "high",
    why: "Meta-topic your network cares about: how visibility is actually earned.",
    date: "Aug 10, 2026",
    source: "Social Media Today",
  },
  {
    id: "t8",
    headline: "Series A bar rises to $2M ARR with efficient growth",
    context: "Investors reward capital efficiency over raw growth multiples.",
    momentum: "rising",
    why: "Founders in your audience are benchmarking themselves against this right now.",
    date: "Aug 9, 2026",
    source: "SaaS Capital",
  },
  {
    id: "t9",
    headline: "Engineering teams rethink hiring loops around AI tooling",
    context: "Take-home tests and interview rubrics are being rewritten.",
    momentum: "rising",
    why: "Pairs perfectly with personal-story format — your highest engagement format.",
    date: "Aug 8, 2026",
    source: "Pragmatic Engineer",
  },
  {
    id: "t10",
    headline: "RevOps becomes the fastest-growing GTM role",
    context: "Hiring data shows a sharp increase in RevOps-titled openings.",
    momentum: "high",
    why: "Your ICP is hiring for this — a credible, useful post for decision makers.",
    date: "Aug 7, 2026",
    source: "LinkedIn Talent Insights",
  },
  {
    id: "t11",
    headline: "Cold outbound reply rates hit a new low",
    context: "Benchmarks across 40M sends show reply rates below 2%.",
    momentum: "rising",
    why: "Perfect setup for your contrarian take on content-led pipeline.",
    date: "Aug 6, 2026",
    source: "Outbound Benchmarks 2026",
  },
];

export type PerformanceInsight = {
  id: string;
  label: string;
  value: string;
  metric: string;
  support: string;
};

export const performanceInsights: PerformanceInsight[] = [
  {
    id: "hook",
    label: "Best hook",
    value: "Strong opinions",
    metric: "+47% engagement",
    support: "vs. your average post",
  },
  {
    id: "topic",
    label: "Best topic",
    value: "B2B Growth",
    metric: "+42% engagement",
    support: "vs. your average post",
  },
  {
    id: "format",
    label: "Best format",
    value: "Personal stories",
    metric: "+38% engagement",
    support: "vs. your average post",
  },
];

export type TopPerformingPost = {
  id: string;
  rank: number;
  preview: string;
  impressions: number;
  engagements: number;
};

export const topPerformingPosts: TopPerformingPost[] = [
  {
    id: "p1",
    rank: 1,
    preview:
      "Most CTOs treat communication as a soft skill. It is the highest-leverage technical skill they have.",
    impressions: 12400,
    engagements: 684,
  },
  {
    id: "p2",
    rank: 2,
    preview:
      "We almost hired the wrong engineer. The interview was perfect — the first week was not.",
    impressions: 9800,
    engagements: 521,
  },
  {
    id: "p3",
    rank: 3,
    preview:
      "The biggest mistake I made building our GTM engine was optimizing volume before positioning.",
    impressions: 8200,
    engagements: 467,
  },
];

export type ScheduledStatus =
  | "scheduled"
  | "isla-review"
  | "your-review"
  | "ready";

export type ScheduledPost = {
  id: string;
  bucket: "today" | "tomorrow" | "week" | "later";
  when: string;
  preview: string;
  platform: string;
  status: ScheduledStatus;
  author: string;
};

export const scheduledPosts: ScheduledPost[] = [
  {
    id: "s1",
    bucket: "today",
    when: "Today · 4:30 PM",
    preview:
      "The fastest way to lose a technical hire is a vague first week. Here is the onboarding plan we use instead.",
    platform: "LinkedIn",
    status: "ready",
    author: "Rodrigo Baer",
  },
  {
    id: "s2",
    bucket: "tomorrow",
    when: "Tomorrow · 10:30 AM",
    preview:
      "How we changed our onboarding and cut time-to-first-value from 21 days to 4.",
    platform: "LinkedIn",
    status: "scheduled",
    author: "Rodrigo Baer",
  },
  {
    id: "s3",
    bucket: "week",
    when: "Thu · 9:00 AM",
    preview:
      "Most CTOs treat communication as a soft skill. It is the highest-leverage technical skill they have.",
    platform: "LinkedIn",
    status: "isla-review",
    author: "Rodrigo Baer",
  },
  {
    id: "s4",
    bucket: "week",
    when: "Fri · 8:15 AM",
    preview:
      "Cold outbound reply rates just hit a new low. Here is what we are doing instead of sending more email.",
    platform: "LinkedIn",
    status: "your-review",
    author: "Rodrigo Baer",
  },
  {
    id: "s5",
    bucket: "later",
    when: "Aug 24 · 11:00 AM",
    preview:
      "The Series A bar moved to $2M ARR with efficient growth. Three numbers investors ask for first.",
    platform: "LinkedIn",
    status: "scheduled",
    author: "Rodrigo Baer",
  },
];

export const scheduledStatusLabel: Record<ScheduledStatus, string> = {
  scheduled: "Scheduled",
  "isla-review": "Isla Review",
  "your-review": "Your Review",
  ready: "Ready to post",
};

export function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

