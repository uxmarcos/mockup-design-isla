// Mock data for the "Connection Quality" (Cross) analytics tab.
// Replace with real React Query hooks against Supabase later.

export type WindowDays = 7 | 14 | 30;

export const senders = [
  { id: "all", name: "All senders" },
  { id: "ana", name: "Ana Martins" },
  { id: "lucas", name: "Lucas Pereira" },
];

export type Filters = { senderId: string; windowDays: WindowDays };

export function getKpis(_f: Filters) {
  return {
    totalInFunnel: 612,
    highIcpPct: 38,
    warmLeadPct: 24,
    recurringEngagers: 87,
  };
}

export type IcpTier = { key: "low" | "medium" | "high"; label: string; value: number; color: string };
export function getIcpDistribution(_f: Filters): IcpTier[] {
  return [
    { key: "low", label: "Low fit (<0.4)", value: 184, color: "var(--icp-low)" },
    { key: "medium", label: "Medium fit (0.4–0.69)", value: 196, color: "var(--icp-medium)" },
    { key: "high", label: "High fit (≥0.7)", value: 232, color: "var(--icp-high)" },
  ];
}

export type TempSlice = { key: "cold" | "warm" | "hot"; label: string; value: number; color: string };
export function getTemperatureDistribution(_f: Filters): TempSlice[] {
  return [
    { key: "cold", label: "Cold", value: 348, color: "var(--icp-cold)" },
    { key: "warm", label: "Warm", value: 198, color: "var(--icp-warm)" },
    { key: "hot", label: "Hot", value: 66, color: "var(--icp-hot)" },
  ];
}

export type FunnelStep = { key: string; label: string; value: number };
export function getConversionFunnel(_f: Filters): FunnelStep[] {
  return [
    { key: "invite_sent", label: "Invite sent", value: 612 },
    { key: "invite_accepted", label: "Invite accepted", value: 421 },
    { key: "message_sent", label: "Message sent", value: 388 },
    { key: "follow_up_sent", label: "Follow-up sent", value: 254 },
    { key: "message_replied", label: "Replied", value: 132 },
    { key: "call_scheduled", label: "Call scheduled", value: 48 },
    { key: "marked_interested", label: "Interested", value: 26 },
    { key: "converted", label: "Converted", value: 11 },
  ];
}

export type Engager = {
  id: string;
  name: string;
  totalEvents: number;
  comments: number;
  reactions: number;
  recurring: boolean;
};
export function getRecurringEngagers(_f: Filters): Engager[] {
  return [
    { id: "1", name: "Júlia Rosa", totalEvents: 14, comments: 6, reactions: 8, recurring: true },
    { id: "2", name: "Pedro Khan", totalEvents: 11, comments: 3, reactions: 8, recurring: true },
    { id: "3", name: "Marina Costa", totalEvents: 9, comments: 4, reactions: 5, recurring: true },
    { id: "4", name: "Caio Henrique", totalEvents: 7, comments: 2, reactions: 5, recurring: true },
    { id: "5", name: "Larissa Tomé", totalEvents: 6, comments: 1, reactions: 5, recurring: true },
    { id: "6", name: "Bruno Sales", totalEvents: 5, comments: 2, reactions: 3, recurring: true },
    { id: "7", name: "Fernanda Lopes", totalEvents: 4, comments: 1, reactions: 3, recurring: true },
    { id: "8", name: "Diego Aratani", totalEvents: 3, comments: 0, reactions: 3, recurring: true },
    { id: "9", name: "Renata Bauer", totalEvents: 2, comments: 1, reactions: 1, recurring: true },
    { id: "10", name: "Tiago Moraes", totalEvents: 1, comments: 0, reactions: 1, recurring: false },
    { id: "11", name: "Sofia Albuquerque", totalEvents: 1, comments: 0, reactions: 1, recurring: false },
    { id: "12", name: "Henrique Vidal", totalEvents: 1, comments: 1, reactions: 0, recurring: false },
  ];
}

export type ContentPost = {
  id: string;
  title: string;
  publishedAt: string;
  totalEngaged: number;
  highIcpEngaged: number;
};
export function getTopContentByIcp(_f: Filters, limit = 5): ContentPost[] {
  return [
    { id: "p1", title: "Founders: stop selling, start qualifying.", publishedAt: "2026-06-12", totalEngaged: 142, highIcpEngaged: 58 },
    { id: "p2", title: "The 3-touch warm-up that 2x'd our reply rate", publishedAt: "2026-06-08", totalEngaged: 118, highIcpEngaged: 47 },
    { id: "p3", title: "Why your ICP score is lying to you", publishedAt: "2026-06-03", totalEngaged: 96, highIcpEngaged: 41 },
    { id: "p4", title: "We deleted 1,200 leads from our CRM. Here's why.", publishedAt: "2026-05-28", totalEngaged: 84, highIcpEngaged: 33 },
    { id: "p5", title: "A boring framework for outbound that actually works", publishedAt: "2026-05-21", totalEngaged: 71, highIcpEngaged: 28 },
  ].slice(0, limit);
}
