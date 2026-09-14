// Simple localStorage helpers to push sent messages from the Kanban into the Inbox.

export type SentMessage = {
  leadId: string;
  leadName: string;
  leadRole: string;
  leadCompany: string;
  avatarSeed: number;
  kind: "reach_out" | "follow_up";
  text: string;
  sentAt: number;
};

const KEY = "isla:inbox:sent-messages";

export function getSentMessages(): SentMessage[] {
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

export function addSentMessage(msg: SentMessage) {
  if (typeof window === "undefined") return;
  const current = getSentMessages();
  const next = [...current, msg];
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
