// Mock data + hook-shaped getters for the Cross analytics tab.
// Replace with real Supabase RPCs (see analytics_queries_isla_crm.sql 1.5–1.7).

export type AcceptRateRow = {
  group: "engaged_before" | "cold";
  label: string;
  invites: number;
  accepts: number;
  acceptRate: number; // 0-1
};

export type AcceptRateData = {
  rows: AcceptRateRow[];
  deltaPp: number; // engaged - cold in percentage points
};

export function useEngagedVsColdAcceptRate(_tenantId?: string): {
  data: AcceptRateData;
  isLoading: boolean;
} {
  const engagedRate = 0.585;
  const coldRate = 0.272;
  return {
    isLoading: false,
    data: {
      rows: [
        { group: "engaged_before", label: "Engaged before invite", invites: 135, accepts: 79, acceptRate: engagedRate },
        { group: "cold", label: "Cold lead", invites: 412, accepts: 112, acceptRate: coldRate },
      ],
      deltaPp: Math.round((engagedRate - coldRate) * 100),
    },
  };
}

// ---------- Audience composition / ICP fit proof ----------

export type CompositionSlice = {
  key: string;
  label: string;
  value: number; // absolute count
  pct: number;   // 0-1 share of the dimension total
  isIcp: boolean; // whether this slice counts toward ICP fit
};

export type CompositionDimension = {
  key: "role" | "seniority" | "industry" | "company_size" | "country";
  label: string;
  total: number;
  slices: CompositionSlice[];
};

export type AudienceCompositionData = {
  audienceTotal: number;     // total unique engagers (organic + funnel)
  icpCount: number;          // how many of them are in the ICP kanban
  icpPct: number;            // icpCount / audienceTotal
  dimensions: CompositionDimension[];
};

export function useAudienceComposition(_tenantId?: string): {
  data: AudienceCompositionData;
  isLoading: boolean;
} {
  const dims: CompositionDimension[] = [
    {
      key: "role",
      label: "Role",
      total: 612,
      slices: [
        { key: "founder", label: "Founder", value: 96, pct: 96 / 612, isIcp: true },
        { key: "ceo", label: "CEO", value: 62, pct: 62 / 612, isIcp: true },
        { key: "vp_sales", label: "VP Sales", value: 58, pct: 58 / 612, isIcp: true },
        { key: "head_growth", label: "Head of Growth", value: 54, pct: 54 / 612, isIcp: true },
        { key: "cmo", label: "CMO", value: 44, pct: 44 / 612, isIcp: true },
        { key: "head_product", label: "Head of Product", value: 38, pct: 38 / 612, isIcp: true },
        { key: "cto", label: "CTO", value: 34, pct: 34 / 612, isIcp: true },
        { key: "product_manager", label: "Product Manager", value: 42, pct: 42 / 612, isIcp: false },
        { key: "sales", label: "Sales (AE/BDR)", value: 46, pct: 46 / 612, isIcp: false },
        { key: "marketing", label: "Marketing", value: 30, pct: 30 / 612, isIcp: false },
        { key: "growth", label: "Growth IC", value: 26, pct: 26 / 612, isIcp: false },
        { key: "developer", label: "Developer", value: 22, pct: 22 / 612, isIcp: false },
        { key: "designer", label: "Designer", value: 18, pct: 18 / 612, isIcp: false },
        { key: "investor", label: "Investor", value: 20, pct: 20 / 612, isIcp: false },
        { key: "recruiter", label: "Recruiter", value: 12, pct: 12 / 612, isIcp: false },
        { key: "consultant", label: "Consultant", value: 10, pct: 10 / 612, isIcp: false },
      ],
    },
    {
      key: "seniority",
      label: "Seniority",
      total: 612,
      slices: [
        { key: "c_level", label: "C-level", value: 198, pct: 0.323, isIcp: true },
        { key: "vp", label: "VP / Head", value: 164, pct: 0.268, isIcp: true },
        { key: "manager", label: "Manager", value: 142, pct: 0.232, isIcp: false },
        { key: "ic", label: "Individual contributor", value: 108, pct: 0.176, isIcp: false },
      ],
    },
    {
      key: "industry",
      label: "Industry",
      total: 612,
      slices: [
        { key: "saas", label: "B2B SaaS", value: 268, pct: 0.438, isIcp: true },
        { key: "agency", label: "Agency / Services", value: 142, pct: 0.232, isIcp: true },
        { key: "fintech", label: "Fintech", value: 86, pct: 0.140, isIcp: false },
        { key: "ecom", label: "E-commerce", value: 64, pct: 0.105, isIcp: false },
        { key: "other", label: "Other", value: 52, pct: 0.085, isIcp: false },
      ],
    },
    {
      key: "company_size",
      label: "Company size",
      total: 612,
      slices: [
        { key: "1_10", label: "1–10", value: 142, pct: 0.232, isIcp: true },
        { key: "11_50", label: "11–50", value: 218, pct: 0.356, isIcp: true },
        { key: "51_200", label: "51–200", value: 152, pct: 0.248, isIcp: true },
        { key: "200_plus", label: "200+", value: 100, pct: 0.164, isIcp: false },
      ],
    },
    {
      key: "country",
      label: "Country",
      total: 612,
      slices: [
        { key: "br", label: "Brazil", value: 286, pct: 0.467, isIcp: true },
        { key: "us", label: "United States", value: 138, pct: 0.225, isIcp: true },
        { key: "pt", label: "Portugal", value: 64, pct: 0.105, isIcp: true },
        { key: "mx", label: "Mexico", value: 52, pct: 0.085, isIcp: false },
        { key: "other", label: "Other", value: 72, pct: 0.118, isIcp: false },
      ],
    },
  ];

  return {
    isLoading: false,
    data: {
      audienceTotal: 612,
      icpCount: 388,
      icpPct: 388 / 612,
      dimensions: dims,
    },
  };
}

export type IcpQualityRow = {
  tier: "low" | "medium" | "high";
  label: string;
  organicEngagers: number; // count among organic engagers
  funnelGeneral: number; // count in general funnel
  color: string;
};

export type IcpQualityData = {
  rows: IcpQualityRow[];
  totals: { organic: number; general: number };
  engagersSkewHigh: boolean;
};

export function useOrganicEngagerIcpQuality(_tenantId?: string): {
  data: IcpQualityData;
  isLoading: boolean;
} {
  const rows: IcpQualityRow[] = [
    { tier: "low", label: "Low fit", organicEngagers: 18, funnelGeneral: 184, color: "var(--icp-low)" },
    { tier: "medium", label: "Medium fit", organicEngagers: 31, funnelGeneral: 196, color: "var(--icp-medium)" },
    { tier: "high", label: "High fit", organicEngagers: 38, funnelGeneral: 232, color: "var(--icp-high)" },
  ];
  const organic = rows.reduce((s, r) => s + r.organicEngagers, 0);
  const general = rows.reduce((s, r) => s + r.funnelGeneral, 0);
  const orgHighPct = rows[2].organicEngagers / organic;
  const genHighPct = rows[2].funnelGeneral / general;
  return {
    isLoading: false,
    data: {
      rows,
      totals: { organic, general },
      engagersSkewHigh: orgHighPct - genHighPct > 0.05,
    },
  };
}

// ---------- ICP audience growth over time ----------

export type IcpAudienceGrowthPoint = {
  date: string; // ISO date
  totalFollowers: number;
  icpFollowers: number;
};

export type IcpAudienceGrowthData = {
  series: IcpAudienceGrowthPoint[];
  icpDelta: number;        // absolute new ICP followers in window
  icpDeltaPct: number;     // 0-1 growth vs first point
  totalDelta: number;
  totalDeltaPct: number;
};

export function useIcpAudienceGrowth(_tenantId?: string): {
  data: IcpAudienceGrowthData;
  isLoading: boolean;
} {
  // 12 weeks of weekly snapshots
  const start = new Date("2026-04-07T00:00:00Z").getTime();
  const week = 7 * 24 * 60 * 60 * 1000;
  const totals = [2840, 2902, 2978, 3041, 3118, 3196, 3274, 3358, 3441, 3522, 3608, 3691];
  const icps   = [ 612,  642,  679,  712,  751,  792,  834,  879,  922,  968, 1014, 1062];
  const series: IcpAudienceGrowthPoint[] = totals.map((t, i) => ({
    date: new Date(start + i * week).toISOString().slice(0, 10),
    totalFollowers: t,
    icpFollowers: icps[i],
  }));
  const first = series[0];
  const last = series[series.length - 1];
  return {
    isLoading: false,
    data: {
      series,
      icpDelta: last.icpFollowers - first.icpFollowers,
      icpDeltaPct: (last.icpFollowers - first.icpFollowers) / first.icpFollowers,
      totalDelta: last.totalFollowers - first.totalFollowers,
      totalDeltaPct: (last.totalFollowers - first.totalFollowers) / first.totalFollowers,
    },
  };
}

// ---------- Post theme ↔ audience type ----------

export type PostThemeAudienceRow = {
  theme: string;             // e.g. "Fundraising"
  postCount: number;
  totalEngaged: number;
  audienceMix: {
    key: string;
    label: string;           // e.g. "Investors", "Founders"
    pct: number;             // 0-1, sums ~1 across the row
    isIcp: boolean;
  }[];
  topAudienceLabel: string;  // headline persona this theme attracts
};

export function usePostThemeAudience(_tenantId?: string): {
  data: PostThemeAudienceRow[];
  isLoading: boolean;
} {
  const rows: PostThemeAudienceRow[] = [
    {
      theme: "Fundraising",
      postCount: 6,
      totalEngaged: 184,
      topAudienceLabel: "Investors & founders",
      audienceMix: [
        { key: "investors", label: "Investors", pct: 0.42, isIcp: false },
        { key: "founders", label: "Founders", pct: 0.38, isIcp: true },
        { key: "operators", label: "Operators", pct: 0.12, isIcp: true },
        { key: "other", label: "Other", pct: 0.08, isIcp: false },
      ],
    },
    {
      theme: "Product & build",
      postCount: 9,
      totalEngaged: 246,
      topAudienceLabel: "Product & growth leaders",
      audienceMix: [
        { key: "product", label: "Product leaders", pct: 0.36, isIcp: true },
        { key: "growth", label: "Growth leaders", pct: 0.31, isIcp: true },
        { key: "founders", label: "Founders", pct: 0.18, isIcp: true },
        { key: "other", label: "Other", pct: 0.15, isIcp: false },
      ],
    },
    {
      theme: "Outbound playbooks",
      postCount: 12,
      totalEngaged: 318,
      topAudienceLabel: "Heads of Sales",
      audienceMix: [
        { key: "head_sales", label: "Heads of Sales", pct: 0.44, isIcp: true },
        { key: "sdr", label: "SDR / AE", pct: 0.27, isIcp: false },
        { key: "founders", label: "Founders", pct: 0.19, isIcp: true },
        { key: "other", label: "Other", pct: 0.10, isIcp: false },
      ],
    },
    {
      theme: "ICP & qualification",
      postCount: 7,
      totalEngaged: 212,
      topAudienceLabel: "Founders & Heads of Sales",
      audienceMix: [
        { key: "founders", label: "Founders", pct: 0.41, isIcp: true },
        { key: "head_sales", label: "Heads of Sales", pct: 0.29, isIcp: true },
        { key: "rev_ops", label: "RevOps", pct: 0.18, isIcp: true },
        { key: "other", label: "Other", pct: 0.12, isIcp: false },
      ],
    },
    {
      theme: "Hiring & team",
      postCount: 4,
      totalEngaged: 132,
      topAudienceLabel: "Operators & talent",
      audienceMix: [
        { key: "talent", label: "Talent / Recruiters", pct: 0.38, isIcp: false },
        { key: "founders", label: "Founders", pct: 0.28, isIcp: true },
        { key: "operators", label: "Operators", pct: 0.22, isIcp: true },
        { key: "other", label: "Other", pct: 0.12, isIcp: false },
      ],
    },
  ];
  return { isLoading: false, data: rows };
}

// ---------- Warm-up velocity ----------

export type WarmupStageCounts = {
  cold: number;
  warming: number;
  hot: number;
};

export type WarmupVelocityData = {
  avgDays: number;           // first engagement → "hot"
  medianDays: number;
  p25Days: number;
  p75Days: number;
  sampleSize: number;
  distribution: { bucket: string; days: [number, number]; count: number }[];
  deltaVsPrevPct: number;    // negative = faster than previous window
  stages: WarmupStageCounts;
};

export function useWarmupVelocity(_tenantId?: string): {
  data: WarmupVelocityData;
  isLoading: boolean;
} {
  return {
    isLoading: false,
    data: {
      avgDays: 11.4,
      medianDays: 9,
      p25Days: 5,
      p75Days: 16,
      sampleSize: 142,
      deltaVsPrevPct: -0.14,
      distribution: [
        { bucket: "0–3d", days: [0, 3], count: 18 },
        { bucket: "4–7d", days: [4, 7], count: 36 },
        { bucket: "8–14d", days: [8, 14], count: 48 },
        { bucket: "15–21d", days: [15, 21], count: 24 },
        { bucket: "22d+",  days: [22, 99], count: 16 },
      ],
      stages: { cold: 412, warming: 198, hot: 142 },
    },
  };
}

export type ContentRow = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  totalEngaged: number;
  highIcpEngaged: number;
  highIcpPct: number;
  url: string;
  author: string;
  authorAvatar: string;
};

export const SENDERS = [
  { name: "Eduardo Schuch", avatar: "https://i.pravatar.cc/80?u=eduardo-schuch" },
  { name: "Marcos Figueiredo", avatar: "https://i.pravatar.cc/80?u=marcos-figueiredo" },
  { name: "Marcos Hollmann", avatar: "https://i.pravatar.cc/80?u=marcos-hollmann" },
  { name: "João Pedro", avatar: "https://i.pravatar.cc/80?u=joao-pedro" },
  { name: "Maycow Jordny", avatar: "https://i.pravatar.cc/80?u=maycow-jordny" },
  { name: "Leonardo Arazo", avatar: "https://i.pravatar.cc/80?u=leonardo-arazo" },
];

export function useTopContentByIcpEngagement(
  _tenantId?: string,
  limit = 10,
): { data: ContentRow[]; isLoading: boolean } {
  const raw = [
    { id: "p1", title: "Founders: stop selling, start qualifying.", excerpt: "A 4-step framework for founders moving from raw outreach to ICP-first qualification. Real numbers from 90 days of testing.", publishedAt: "2026-06-12", totalEngaged: 142, highIcpEngaged: 58, url: "https://www.linkedin.com/posts/isla-crm_founders-qualifying-activity-1" },
    { id: "p2", title: "The 3-touch warm-up that 2x'd our reply rate", excerpt: "Why a comment + a reaction + a DM beats a cold invite — even when your copy is great.", publishedAt: "2026-06-08", totalEngaged: 118, highIcpEngaged: 47, url: "https://www.linkedin.com/posts/isla-crm_3-touch-warmup-activity-2" },
    { id: "p3", title: "Why your ICP score is lying to you", excerpt: "Most ICP scores are built on the wrong signals. Here's what to weight instead.", publishedAt: "2026-06-03", totalEngaged: 96, highIcpEngaged: 41, url: "https://www.linkedin.com/posts/isla-crm_icp-score-activity-3" },
    { id: "p4", title: "We deleted 1,200 leads from our CRM. Here's why.", excerpt: "Pipeline hygiene as a growth lever, not a janitor job.", publishedAt: "2026-05-28", totalEngaged: 84, highIcpEngaged: 33, url: "https://www.linkedin.com/posts/isla-crm_pipeline-hygiene-activity-4" },
    { id: "p5", title: "A boring framework for outbound that actually works", excerpt: "No tricks, no hacks. The 5 questions to answer before sending another invite.", publishedAt: "2026-05-21", totalEngaged: 71, highIcpEngaged: 28, url: "https://www.linkedin.com/posts/isla-crm_outbound-framework-activity-5" },
    { id: "p6", title: "The $0 CAC pipeline: how we replaced ads with LinkedIn content", excerpt: "A 6-month playbook for turning organic engagement into qualified meetings without spending on paid acquisition.", publishedAt: "2026-05-14", totalEngaged: 68, highIcpEngaged: 26, url: "https://www.linkedin.com/posts/isla-crm_zero-cac-pipeline-activity-6" },
    { id: "p7", title: "Your SDRs are burning out. The fix is in the ICP.", excerpt: "Why tighter qualification at the top of funnel reduces churn and increases morale — with data from 4 teams.", publishedAt: "2026-05-07", totalEngaged: 62, highIcpEngaged: 24, url: "https://www.linkedin.com/posts/isla-crm_sdr-burnout-icp-activity-7" },
    { id: "p8", title: "From 0 to 50 demos/month: the content-led growth loop", excerpt: "The exact sequence of posts, comments, and DMs we used to build a predictable demo pipeline in 90 days.", publishedAt: "2026-04-30", totalEngaged: 55, highIcpEngaged: 22, url: "https://www.linkedin.com/posts/isla-crm_content-growth-loop-activity-8" },
    { id: "p9", title: "The one question that improved our qualification rate by 40%", excerpt: "We changed a single question in our discovery call. The downstream impact on close rate was immediate.", publishedAt: "2026-04-23", totalEngaged: 48, highIcpEngaged: 19, url: "https://www.linkedin.com/posts/isla-crm_qualification-question-activity-9" },
    { id: "p10", title: "Why most LinkedIn 'personal brands' fail at pipeline", excerpt: "Engagement without conversion is vanity. Here's how to build content that actually books meetings.", publishedAt: "2026-04-16", totalEngaged: 42, highIcpEngaged: 16, url: "https://www.linkedin.com/posts/isla-crm_personal-brand-pipeline-activity-10" },
  ];
  return {
    isLoading: false,
    data: raw
      .map((r, i) => {
        const sender = SENDERS[i % SENDERS.length];
        return {
          ...r,
          author: sender.name,
          authorAvatar: sender.avatar,
          highIcpPct: r.highIcpEngaged / r.totalEngaged,
        };
      })
      .sort((a, b) => b.highIcpEngaged - a.highIcpEngaged)
      .slice(0, limit),
  };
}


// ---------- Attribution: posts → meeting / customer ----------

export type AttributionOutcome = "meeting" | "customer";

export type AttributionTouch = {
  postId: string;
  postTitle: string;
  postUrl: string;
  publishedAt: string; // ISO
  type: "reaction" | "comment" | "view";
  daysBeforeOutcome: number;
};

export type AttributionLead = {
  id: string;
  name: string;
  role: string;
  company: string;
  outcome: AttributionOutcome;
  outcomeAt: string; // ISO
  dealValue?: number; // USD, when customer
  touches: AttributionTouch[]; // ordered oldest → newest
};

export type ContentAttributionData = {
  totals: {
    influencedMeetings: number;
    totalMeetings: number;
    influencedCustomers: number;
    totalCustomers: number;
    influencedRevenue: number; // USD
  };
  topPosts: {
    postId: string;
    postTitle: string;
    postUrl: string;
    meetings: number;
    customers: number;
    revenue: number;
  }[];
  leads: AttributionLead[];
};

export function useContentAttribution(_tenantId?: string): {
  data: ContentAttributionData;
  isLoading: boolean;
} {
  const leads: AttributionLead[] = [
    {
      id: "l1",
      name: "Marina Alvarez",
      role: "Head of Sales",
      company: "Northwind SaaS",
      outcome: "customer",
      outcomeAt: "2026-06-24",
      dealValue: 24000,
      touches: [
        { postId: "p3", postTitle: "Why your ICP score is lying to you", postUrl: "https://www.linkedin.com/posts/isla-crm_icp-score-activity-3", publishedAt: "2026-06-03", type: "reaction", daysBeforeOutcome: 21 },
        { postId: "p2", postTitle: "The 3-touch warm-up that 2x'd our reply rate", postUrl: "https://www.linkedin.com/posts/isla-crm_3-touch-warmup-activity-2", publishedAt: "2026-06-08", type: "comment", daysBeforeOutcome: 16 },
        { postId: "p1", postTitle: "Founders: stop selling, start qualifying.", postUrl: "https://www.linkedin.com/posts/isla-crm_founders-qualifying-activity-1", publishedAt: "2026-06-12", type: "reaction", daysBeforeOutcome: 12 },
      ],
    },
    {
      id: "l2",
      name: "Rafael Costa",
      role: "Founder & CEO",
      company: "Kavo Labs",
      outcome: "customer",
      outcomeAt: "2026-06-18",
      dealValue: 18500,
      touches: [
        { postId: "p1", postTitle: "Founders: stop selling, start qualifying.", postUrl: "https://www.linkedin.com/posts/isla-crm_founders-qualifying-activity-1", publishedAt: "2026-06-12", type: "comment", daysBeforeOutcome: 6 },
        { postId: "p4", postTitle: "We deleted 1,200 leads from our CRM. Here's why.", postUrl: "https://www.linkedin.com/posts/isla-crm_pipeline-hygiene-activity-4", publishedAt: "2026-05-28", type: "reaction", daysBeforeOutcome: 21 },
      ],
    },
    {
      id: "l3",
      name: "Julia Meyer",
      role: "VP Growth",
      company: "Loopstack",
      outcome: "meeting",
      outcomeAt: "2026-06-26",
      touches: [
        { postId: "p2", postTitle: "The 3-touch warm-up that 2x'd our reply rate", postUrl: "https://www.linkedin.com/posts/isla-crm_3-touch-warmup-activity-2", publishedAt: "2026-06-08", type: "reaction", daysBeforeOutcome: 18 },
        { postId: "p3", postTitle: "Why your ICP score is lying to you", postUrl: "https://www.linkedin.com/posts/isla-crm_icp-score-activity-3", publishedAt: "2026-06-03", type: "reaction", daysBeforeOutcome: 23 },
      ],
    },
    {
      id: "l4",
      name: "Diego Ramos",
      role: "Head of Sales",
      company: "Ferro Digital",
      outcome: "meeting",
      outcomeAt: "2026-06-22",
      touches: [
        { postId: "p1", postTitle: "Founders: stop selling, start qualifying.", postUrl: "https://www.linkedin.com/posts/isla-crm_founders-qualifying-activity-1", publishedAt: "2026-06-12", type: "comment", daysBeforeOutcome: 10 },
      ],
    },
    {
      id: "l5",
      name: "Sofia Nakamura",
      role: "Founder",
      company: "Bright Ops",
      outcome: "customer",
      outcomeAt: "2026-06-10",
      dealValue: 32000,
      touches: [
        { postId: "p5", postTitle: "A boring framework for outbound that actually works", postUrl: "https://www.linkedin.com/posts/isla-crm_outbound-framework-activity-5", publishedAt: "2026-05-21", type: "comment", daysBeforeOutcome: 20 },
        { postId: "p4", postTitle: "We deleted 1,200 leads from our CRM. Here's why.", postUrl: "https://www.linkedin.com/posts/isla-crm_pipeline-hygiene-activity-4", publishedAt: "2026-05-28", type: "reaction", daysBeforeOutcome: 13 },
        { postId: "p3", postTitle: "Why your ICP score is lying to you", postUrl: "https://www.linkedin.com/posts/isla-crm_icp-score-activity-3", publishedAt: "2026-06-03", type: "reaction", daysBeforeOutcome: 7 },
      ],
    },
    {
      id: "l6",
      name: "Tomás Lira",
      role: "Head of Growth",
      company: "Palma Tech",
      outcome: "meeting",
      outcomeAt: "2026-06-28",
      touches: [
        { postId: "p2", postTitle: "The 3-touch warm-up that 2x'd our reply rate", postUrl: "https://www.linkedin.com/posts/isla-crm_3-touch-warmup-activity-2", publishedAt: "2026-06-08", type: "reaction", daysBeforeOutcome: 20 },
      ],
    },
  ];

  const topPostsMap = new Map<string, { postId: string; postTitle: string; postUrl: string; meetings: number; customers: number; revenue: number }>();
  for (const lead of leads) {
    // credit every post the lead touched before the outcome
    const seen = new Set<string>();
    for (const t of lead.touches) {
      if (seen.has(t.postId)) continue;
      seen.add(t.postId);
      const prev = topPostsMap.get(t.postId) ?? {
        postId: t.postId,
        postTitle: t.postTitle,
        postUrl: t.postUrl,
        meetings: 0,
        customers: 0,
        revenue: 0,
      };
      if (lead.outcome === "meeting") prev.meetings += 1;
      if (lead.outcome === "customer") {
        prev.customers += 1;
        prev.revenue += lead.dealValue ?? 0;
      }
      topPostsMap.set(t.postId, prev);
    }
  }
  const topPosts = Array.from(topPostsMap.values())
    .sort((a, b) => b.customers - a.customers || b.meetings - a.meetings)
    .slice(0, 5);

  const influencedRevenue = leads
    .filter((l) => l.outcome === "customer")
    .reduce((s, l) => s + (l.dealValue ?? 0), 0);

  return {
    isLoading: false,
    data: {
      totals: {
        influencedMeetings: leads.filter((l) => l.outcome === "meeting").length + leads.filter((l) => l.outcome === "customer").length,
        totalMeetings: 42,
        influencedCustomers: leads.filter((l) => l.outcome === "customer").length,
        totalCustomers: 9,
        influencedRevenue,
      },
      topPosts,
      leads: leads.sort((a, b) => (a.outcomeAt < b.outcomeAt ? 1 : -1)),
    },
  };
}
