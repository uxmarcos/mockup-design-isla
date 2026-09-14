// Prototype-only activity feed data.

export type ActivityType =
  | "post_like"
  | "post_comment"
  | "you_commented"
  | "you_reacted"
  | "message_received"
  | "connection_accepted"
  | "leads_added"
  | "lead_hot"
  | "lead_reach_out"
  | "lead_follow_up"
  | "ideas_generated"
  | "draft_ready"
  | "post_published";

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  post_like: "Post like",
  post_comment: "Post comment",
  you_commented: "Your comment",
  you_reacted: "Your reaction",
  message_received: "Inbox message",
  connection_accepted: "Connection accepted",
  leads_added: "Leads added",
  lead_hot: "Hot lead",
  lead_reach_out: "Moved to Reach Out",
  lead_follow_up: "Moved to Follow Up",
  ideas_generated: "Ideas generated",
  draft_ready: "Draft ready",
  post_published: "Post published",
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  minutesAgo: number;
  /** Full sentence in past tense used for both feed rendering and filtering. */
  summary: string;
  /** LinkedIn profile picture for the person involved, if any. */
  avatarUrl?: string;
  personName?: string;
  postTitle?: string;
  postUrl?: string;
};

const av = (seed: string) => `https://i.pravatar.cc/64?u=${encodeURIComponent(seed)}`;

export const ACTIVITY_LOG: ActivityItem[] = [
  {
    id: "a1",
    type: "post_like",
    minutesAgo: 12,
    personName: "Marina Costa",
    avatarUrl: av("marina-costa"),
    postTitle: "How we scaled outbound at Nortex",
    postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7150000000000001/",
    summary: "Marina Costa liked your post \"How we scaled outbound at Nortex\".",
  },
  {
    id: "a2",
    type: "message_received",
    minutesAgo: 38,
    personName: "Rafael Duarte",
    avatarUrl: av("rafael-duarte"),
    summary: "Rafael Duarte sent you a message.",
  },
  {
    id: "a3",
    type: "leads_added",
    minutesAgo: 60,
    summary: "3 new high-ICP leads were added to Connect.",
  },
  {
    id: "a4",
    type: "ideas_generated",
    minutesAgo: 120,
    summary: "Isla generated 4 post ideas.",
  },
  {
    id: "a5",
    type: "connection_accepted",
    minutesAgo: 60 * 22,
    personName: "Lucas Prado",
    avatarUrl: av("lucas-prado"),
    summary: "Lucas Prado accepted your connection request.",
  },
  {
    id: "a6",
    type: "lead_reach_out",
    minutesAgo: 60 * 26,
    personName: "Camila Ferreira",
    avatarUrl: av("camila-ferreira"),
    summary: "Camila Ferreira moved to Reach Out.",
  },
  {
    id: "a7",
    type: "post_comment",
    minutesAgo: 60 * 28,
    personName: "Thiago Almeida",
    avatarUrl: av("thiago-almeida"),
    postTitle: "Retention isn't a metric, it's a habit",
    postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7150000000000002/",
    summary: "Thiago Almeida commented on your post \"Retention isn't a metric, it's a habit\".",
  },
  {
    id: "a8",
    type: "post_like",
    minutesAgo: 60 * 30,
    personName: "Beatriz Nogueira",
    avatarUrl: av("beatriz-nogueira"),
    postTitle: "Why founders shouldn't chase virality",
    postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7150000000000003/",
    summary: "Beatriz Nogueira liked your post \"Why founders shouldn't chase virality\".",
  },
  {
    id: "a9",
    type: "you_commented",
    minutesAgo: 60 * 31,
    personName: "João Batista",
    avatarUrl: av("joao-batista"),
    postTitle: "The state of B2B SaaS in LATAM",
    postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7150000000000004/",
    summary: "You commented on João Batista's post \"The state of B2B SaaS in LATAM\".",
  },
  {
    id: "a10",
    type: "draft_ready",
    minutesAgo: 60 * 32,
    postTitle: "3 lessons from launching in LATAM",
    summary: "Your draft \"3 lessons from launching in LATAM\" is ready for review.",
  },
  {
    id: "a11",
    type: "connection_accepted",
    minutesAgo: 60 * 40,
    personName: "Beatriz Nogueira",
    avatarUrl: av("beatriz-nogueira"),
    summary: "Beatriz Nogueira accepted your connection request.",
  },
  {
    id: "a12",
    type: "lead_hot",
    minutesAgo: 60 * 44,
    personName: "Diego Ramos",
    avatarUrl: av("diego-ramos"),
    summary: "Diego Ramos moved into Hot Leads.",
  },
  {
    id: "a13",
    type: "message_received",
    minutesAgo: 60 * 48,
    personName: "Ana Beatriz",
    avatarUrl: av("ana-beatriz"),
    summary: "Ana Beatriz sent you a message.",
  },
  {
    id: "a14",
    type: "post_comment",
    minutesAgo: 60 * 52,
    personName: "Fernanda Lopes",
    avatarUrl: av("fernanda-lopes"),
    postTitle: "How we built our GTM engine",
    postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7150000000000005/",
    summary: "Fernanda Lopes commented on your post \"How we built our GTM engine\".",
  },
  {
    id: "a15",
    type: "post_published",
    minutesAgo: 60 * 58,
    postTitle: "The playbook we wish we had at seed",
    postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7150000000000006/",
    summary: "\"The playbook we wish we had at seed\" was published.",
  },
  {
    id: "a16",
    type: "leads_added",
    minutesAgo: 60 * 68,
    summary: "5 new high-ICP leads were added to Connect.",
  },
  {
    id: "a17",
    type: "ideas_generated",
    minutesAgo: 60 * 72,
    summary: "Isla generated 6 post ideas.",
  },
  {
    id: "a18",
    type: "connection_accepted",
    minutesAgo: 60 * 90,
    personName: "Priscila Duarte",
    avatarUrl: av("priscila-duarte"),
    summary: "Priscila Duarte accepted your connection request.",
  },
  {
    id: "a19",
    type: "lead_follow_up",
    minutesAgo: 60 * 96,
    personName: "Rafael Duarte",
    avatarUrl: av("rafael-duarte"),
    summary: "Rafael Duarte moved to Follow Up.",
  },
  {
    id: "a20",
    type: "you_reacted",
    minutesAgo: 60 * 110,
    personName: "Marcelo Silveira",
    avatarUrl: av("marcelo-silveira"),
    postTitle: "Rebuilding trust after a bad launch",
    postUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7150000000000007/",
    summary: "You reacted to Marcelo Silveira's post \"Rebuilding trust after a bad launch\".",
  },
];

export function formatRelative(minutesAgo: number): string {
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

export function activityDate(item: ActivityItem, now = Date.now()): Date {
  return new Date(now - item.minutesAgo * 60 * 1000);
}
