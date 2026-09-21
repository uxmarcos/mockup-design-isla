// Simple localStorage helpers so other screens can push leads into the Kanban board.

export type Stage = "leads" | "connecting" | "engaging" | "ready" | "reach_out";

export type ExtraLead = {
  id: string;
  name: string;
  role: string;
  company: string;
  score: number;
  scoreTone: "cold" | "warm" | "hot";
  stage: Stage;
  tag: string;
  action: string;
  avatarSeed: number;
  avatarUrl?: string;
  linkedinUrl?: string;
  email?: string;
  /** LinkedIn profile (sender) that will contact this lead. */
  profile?: string;
  language?: string;
};

const KEY = "isla:kanban:extra-leads";

export function getExtraLeads(): ExtraLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addExtraLead(lead: ExtraLead) {
  if (typeof window === "undefined") return;
  const current = getExtraLeads();
  if (current.some((l) => l.id === lead.id)) return;
  const next = [...current, lead];
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function hasExtraLead(id: string): boolean {
  return getExtraLeads().some((l) => l.id === id);
}
