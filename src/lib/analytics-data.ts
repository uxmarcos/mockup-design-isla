// Mock data powering the Analytics dashboard. Replace with live data later.

export const outboundKpis = {
  prospected: 494,
  invitesAccepted: 405,
  acceptRate: 82,
  replyRate: 13,
  callsBooked: 7,
  paidUsers: 2,
  mrr: 1500,
};

export type FunnelStage = { key: string; label: string; value: number; color: string };

export const outboundFunnel: FunnelStage[] = [
  { key: "connect", label: "Connect", value: 494, color: "var(--muted-foreground)" },
  { key: "engage", label: "Engage", value: 405, color: "var(--violet)" },
  { key: "reachout", label: "Reach Out", value: 86, color: "var(--blue)" },
  { key: "fup", label: "Follow Up", value: 42, color: "var(--amber)" },
  { key: "replied", label: "Replied", value: 13, color: "var(--cyan)" },
  { key: "callbooked", label: "Call Booked", value: 7, color: "var(--primary)" },
  { key: "interested", label: "Interested", value: 4, color: "var(--pink)" },
  { key: "paid", label: "Paid User", value: 2, color: "var(--emerald)" },
];

export const weeklyLeadsVsCalls = Array.from({ length: 36 }, (_, i) => {
  const t = i / 35;
  const peak = Math.exp(-Math.pow((t - 0.75) * 3.2, 2)) * 320;
  return {
    date: new Date(2026, 4, 25 + i).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
    leads: Math.round(peak + Math.random() * 12),
    calls: Math.round(peak * 0.04),
  };
});

export const inboundKpis = {
  posts: 7,
  impressions: 26193,
  engagement: 431,
  newFollowers: 2700,
  avgEngagementRate: 4.8,
};

export const followerGrowth = Array.from({ length: 14 }, (_, i) => {
  const base = i < 2 ? 420 : 720 + i * 4 + Math.random() * 6;
  return {
    date: new Date(2026, 5, 16 + i).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
    followers: Math.round(base),
  };
});

export type TopPost = {
  title: string;
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  engagementRate: number;
  engagedProspects?: number;
};

export const topPosts: TopPost[] = [
  { title: "She led growth at this $1B startup. Here's what I learned…", impressions: 13420, reactions: 312, comments: 64, reposts: 21, engagementRate: 2.96, engagedProspects: 14 },
  { title: "Meu mestrado fez a Isla nascer — a história completa", impressions: 7180, reactions: 198, comments: 41, reposts: 9, engagementRate: 3.45, engagedProspects: 9 },
  { title: "A PM from a multi-billion company told me this…", impressions: 2410, reactions: 88, comments: 22, reposts: 4, engagementRate: 4.73, engagedProspects: 5 },
  { title: "Meu projeto foi selecionado para o Y Combinator (não)", impressions: 1620, reactions: 62, comments: 18, reposts: 3, engagementRate: 5.12, engagedProspects: 3 },
  { title: "Meu planeta favorito não é a Terra — é o pipeline", impressions: 1340, reactions: 51, comments: 14, reposts: 2, engagementRate: 4.99, engagedProspects: 2 },
];

// ----- Cross / Content Impact -----

export const contentInfluencePct = 68;

export const acceptanceComparison = {
  engaged: { rate: 72, sample: 142 },
  cold: { rate: 34, sample: 358 },
};

export type PipelineFunnel = {
  label: string;
  stages: { label: string; value: number; pct: number }[];
};

export const coldPipeline: PipelineFunnel = {
  label: "Cold Leads",
  stages: [
    { label: "Invited", value: 358, pct: 100 },
    { label: "Accepted", value: 122, pct: 34 },
    { label: "Replied", value: 21, pct: 17 },
    { label: "Call", value: 5, pct: 24 },
    { label: "Paid", value: 1, pct: 20 },
  ],
};

export const engagedPipeline: PipelineFunnel = {
  label: "Content Engaged Leads",
  stages: [
    { label: "Invited", value: 142, pct: 100 },
    { label: "Accepted", value: 102, pct: 72 },
    { label: "Replied", value: 38, pct: 37 },
    { label: "Call", value: 14, pct: 37 },
    { label: "Paid", value: 6, pct: 43 },
  ],
};

export const revenueInfluenced = {
  mrr: 12400,
  pct: 82,
};

export const timeToConversion = {
  cold: 43,
  engaged: 18,
};

export const aiInsights = [
  { icon: "📈", text: "Acceptance Rate increased 11% this month — your warm-up cadence is paying off." },
  { icon: "🔥", text: "Founders convert 2.4x better than Heads of Marketing in your current pipeline." },
  { icon: "⚠️", text: "18 qualified leads have been waiting for follow-up for more than 7 days." },
  { icon: "💡", text: "Leads who liked at least two posts have a 74% invitation acceptance rate." },
  { icon: "🚀", text: "AI-related posts generated 3x more engaged prospects than company updates." },
  { icon: "🎯", text: "Your biggest funnel bottleneck is Reach Out → Replied — only 15% conversion." },
];
