// Shared mock idea deck. Used by the Create Content hub and the post editor flow.

export type IdeaSeed = {
  id: string;
  hook: string;
  angle: string;
  pillar: string;
  why: string;
  tags: string[];
  /** Trending opportunities live in the same feed, flagged with a badge. */
  trending?: boolean;
  /** Where the trend came from (only for trending ideas). */
  source?: string;
};


export const IDEAS: IdeaSeed[] = [
  {
    id: "i1",
    hook: "Stop measuring your marketing team by 'leads'. Start measuring them by pipeline they can defend in a room full of skeptics.",
    angle: "Reframe marketing accountability from vanity metrics to revenue conversations.",
    pillar: "Marketing Leadership",
    why: "Strong opinion posts on measurement consistently outperform on B2B feeds.",
    tags: ["b2b", "revops", "marketing"],
  },
  {
    id: "i2",
    hook: "The best salespeople I've hired weren't the loudest in the interview. They were the ones who asked me the sharpest questions.",
    angle: "Personal hiring story → counterintuitive lesson about sales talent.",
    pillar: "Hiring",
    why: "Story + contrarian take is the highest engagement combo on founder feeds.",
    tags: ["sales", "hiring", "story"],
  },
  {
    id: "i3",
    hook: "Your onboarding email sequence is either your best-paid employee or your quietest silent killer. There is no middle ground.",
    angle: "Punchy binary framing about lifecycle email ROI.",
    pillar: "Lifecycle Marketing",
    why: "Short, quotable, screenshot-worthy — this style consistently gets reshared.",
    tags: ["email", "lifecycle", "growth"],
  },
  {
    id: "i4",
    hook: "I killed 40% of our roadmap last quarter. Revenue went up. Team morale went up. Turns out most 'must-haves' were just loud-haves.",
    angle: "Founder POV about ruthless prioritization with a concrete number.",
    pillar: "Product",
    why: "Specific % + counterintuitive outcome = the algorithm loves this shape.",
    tags: ["product", "founder", "leadership"],
  },
  {
    id: "i5",
    hook: "Cold outbound isn't dead. Boring outbound is dead. If your first line could be sent to 10,000 people, it's already spam.",
    angle: "Defend a controversial channel by attacking how it's executed.",
    pillar: "Outbound",
    why: "Divides the room instantly → high comment velocity in first 60 min.",
    tags: ["sales", "outbound", "opinion"],
  },
  {
    id: "i6",
    hook: "Every dashboard I've built that nobody used had one thing in common: it answered questions no one was asking.",
    angle: "Self-deprecating lesson on building for the decision, not the data.",
    pillar: "Analytics",
    why: "Analytics leaders eat self-aware humility posts for breakfast.",
    tags: ["analytics", "data", "product"],
  },
  {
    id: "i7",
    hook: "The fastest way to double your close rate isn't a new script. It's disqualifying 30% of your pipeline before the first demo.",
    angle: "Counterintuitive sales math with a concrete lever.",
    pillar: "Sales",
    why: "Sales leaders love ratio-flipping ideas that don't require more headcount.",
    tags: ["sales", "pipeline", "process"],
  },
  {
    id: "i8",
    hook: "Nobody buys your product because of the feature list. They buy it because of the story they get to tell their boss on Monday.",
    angle: "Narrative selling framed as internal politics reality.",
    pillar: "Positioning",
    why: "Reframes selling as buyer-enablement — resonates hard with enterprise sellers.",
    tags: ["positioning", "b2b", "narrative"],
  },
];

/**
 * Trending opportunities are not a separate destination anymore — they are
 * ideas inside the same feed, flagged so the user can spot what is timely.
 */
export const TRENDING_IDEAS: IdeaSeed[] = [
  {
    id: "tr1",
    hook: "Compute is the new headcount. The teams winning right now aren't hiring faster — they're buying inference smarter.",
    angle: "Tie the $500M NVIDIA capacity expansion to how B2B teams should budget for AI.",
    pillar: "AI & GTM",
    why: "Chip scarcity is the single most talked-about constraint in your feed this week.",
    tags: ["ai", "infra", "budget"],
    trending: true,
    source: "Semiconductor Weekly",
  },
  {
    id: "tr2",
    hook: "Enterprise AI just moved from 'experiment' to 'procurement'. Most GTM teams are still selling to the experiment.",
    angle: "React to OpenAI's enterprise program with a positioning lesson for B2B sellers.",
    pillar: "Positioning",
    why: "Your ICP is actively debating enterprise AI buying committees right now.",
    tags: ["enterprise", "ai", "sales"],
    trending: true,
    source: "The Information",
  },
  {
    id: "tr3",
    hook: "Follow the infrastructure spend and you'll know where next year's budget lands. It isn't where your roadmap thinks it is.",
    angle: "Use the new cloud AI regions as a signal for 2027 budget planning.",
    pillar: "Marketing Leadership",
    why: "Budget-signal posts perform well with the operators in your network.",
    tags: ["budget", "cloud", "strategy"],
    trending: true,
    source: "Reuters",
  },
];

/** The Post Ideas feed: personalized ideas + timely trending opportunities. */
export const FEED_IDEAS: IdeaSeed[] = [
  IDEAS[0]!,
  TRENDING_IDEAS[0]!,
  IDEAS[1]!,
  IDEAS[2]!,
  TRENDING_IDEAS[1]!,
  IDEAS[3]!,
  IDEAS[4]!,
  TRENDING_IDEAS[2]!,
  IDEAS[5]!,
];
