import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Send, Star, MoreHorizontal, Linkedin } from "lucide-react";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSentMessages } from "@/lib/inbox-store";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — Isla" },
      {
        name: "description",
        content: "LinkedIn conversations from your outreach — reply and follow up.",
      },
    ],
  }),
  component: InboxPage,
});

type Message = { from: "them" | "me"; text: string; time: string };
type Thread = {
  id: string;
  name: string;
  role: string;
  company: string;
  preview: string;
  time: string;
  unread: boolean;
  needsFollowUp: boolean;
  avatarSeed: number;
  messages: Message[];
};

const THREADS: Thread[] = [
  {
    id: "t1",
    name: "Sofia Martins",
    role: "CMO",
    company: "Lumen.io",
    preview: "Makes sense, loved the approach. Let's book?",
    time: "2h",
    unread: true,
    needsFollowUp: true,
    avatarSeed: 6,
    messages: [
      { from: "me", text: "Hi Sofia, I saw your latest post about attribution — 100% agree. You mentioned something interesting about sales alignment, would love to exchange ideas.", time: "Yesterday 14:20" },
      { from: "them", text: "Hi! Thanks for the message. Makes sense, this topic has been quite critical here.", time: "Yesterday 18:47" },
      { from: "me", text: "Great! Here we helped a few B2B companies reduce CAC by 30% using a content-led approach. Does it make sense for me to share the material?", time: "Today 09:12" },
      { from: "them", text: "Makes sense, loved the approach. Let's book?", time: "Today 11:34" },
    ],
  },
  {
    id: "t2",
    name: "Rafael Oliveira",
    role: "Head of Growth",
    company: "Lumen.io",
    preview: "Manda por aqui mesmo, quero ver antes de marcar",
    time: "5h",
    unread: true,
    needsFollowUp: true,
    avatarSeed: 7,
    messages: [
      { from: "me", text: "Rafael, I saw you liked Bruno's post about outbound. I agree with his point — outbound without intent signal has become spam.", time: "Yesterday" },
      { from: "them", text: "Send it here, I want to see it before booking", time: "Today" },
    ],
  },
  {
    id: "t3",
    name: "Gabriel Ferreira",
    role: "CMO",
    company: "Lumen.io",
    preview: "Interessante, me manda um exemplo?",
    time: "1d",
    unread: false,
    needsFollowUp: true,
    avatarSeed: 8,
    messages: [
      { from: "me", text: "Gabriel, I saw your comment on Ricardo's post. You mentioned the challenge of connecting content with pipeline — we have a framework for that.", time: "Yesterday" },
      { from: "them", text: "Interesting, can you send me an example?", time: "Yesterday" },
    ],
  },
  {
    id: "t4",
    name: "Ana Beatriz",
    role: "Marketing Director",
    company: "Northwind",
    preview: "Vou dar uma olhada e te retorno essa semana",
    time: "2d",
    unread: false,
    needsFollowUp: false,
    avatarSeed: 9,
    messages: [
      { from: "them", text: "I'll take a look and get back to you this week", time: "Mon" },
    ],
  },
  {
    id: "t5",
    name: "Larissa Santos",
    role: "VP Marketing",
    company: "Fintrak",
    preview: "Great material you shared — thanks!",
    time: "3d",
    unread: false,
    needsFollowUp: false,
    avatarSeed: 11,
    messages: [
      { from: "them", text: "Great material you shared — thanks!", time: "Sun" },
    ],
  },
];

function avatarUrl(seed: number, name: string) {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}-${encodeURIComponent(name)}`;
}

function InboxPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "followup">("followup");
  const [activeId, setActiveId] = useState<string>(THREADS[0].id);
  const [reply, setReply] = useState("");
  const [threads, setThreads] = useState<Thread[]>(THREADS);

  useEffect(() => {
    const sent = getSentMessages();
    if (sent.length === 0) return;
    setThreads((prev) => {
      const next = [...prev];
      const timeLabel = (ts: number) => {
        const diffMin = Math.max(1, Math.round((Date.now() - ts) / 60000));
        if (diffMin < 60) return `${diffMin}m`;
        const h = Math.round(diffMin / 60);
        if (h < 24) return `${h}h`;
        return `${Math.round(h / 24)}d`;
      };
      for (const m of sent) {
        const existing = next.find(
          (t) => t.name.toLowerCase() === m.leadName.toLowerCase(),
        );
        const msg = { from: "me" as const, text: m.text, time: timeLabel(m.sentAt) };
        if (existing) {
          if (existing.messages.some((x) => x.text === m.text && x.from === "me")) continue;
          existing.messages = [...existing.messages, msg];
          existing.preview = m.text;
          existing.time = timeLabel(m.sentAt);
          existing.needsFollowUp = false;
        } else {
          next.unshift({
            id: `sent-${m.leadId}-${m.sentAt}`,
            name: m.leadName,
            role: m.leadRole,
            company: m.leadCompany,
            preview: m.text,
            time: timeLabel(m.sentAt),
            unread: false,
            needsFollowUp: false,
            avatarSeed: m.avatarSeed,
            messages: [msg],
          });
        }
      }
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((t) => {
      if (filter === "unread" && !t.unread) return false;
      if (filter === "followup" && !t.needsFollowUp) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q)
      );
    });
  }, [threads, query, filter]);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  const send = () => {
    const text = reply.trim();
    if (!text) return;
    setThreads((ts) =>
      ts.map((t) =>
        t.id === active.id
          ? {
              ...t,
              needsFollowUp: false,
              unread: false,
              preview: text,
              time: "agora",
              messages: [...t.messages, { from: "me", text, time: "agora" }],
            }
          : t,
      ),
    );
    setReply("");
    toast("Message sent", { description: "Reply sent on LinkedIn." });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="px-6 py-8 lg:px-10">
          <header className="mb-6 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#0A66C2] text-white">
              <Linkedin className="size-4" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
              <p className="text-sm text-muted-foreground">
                LinkedIn conversations — reply and keep the follow-ups moving.
              </p>
            </div>
          </header>

          <div className="grid h-[calc(100vh-180px)] grid-cols-[360px_1fr] overflow-hidden rounded-2xl border border-border bg-card">
            {/* Thread list */}
            <div className="flex flex-col border-r border-border">
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="h-9 pl-9 text-sm"
                  />
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  {(["followup", "unread", "all"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "rounded-md px-2 py-1 text-[11px] font-medium",
                        filter === f
                          ? "bg-[color:var(--blue)] text-white"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {f === "followup" ? "Follow-ups" : f === "unread" ? "Unread" : "All"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.map((t) => {
                  const isActive = t.id === active.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveId(t.id)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors",
                        isActive ? "bg-muted" : "hover:bg-muted/50",
                      )}
                    >
                      <img
                        src={avatarUrl(t.avatarSeed, t.name)}
                        alt=""
                        className="size-10 shrink-0 rounded-full bg-muted"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={cn(
                              "truncate text-sm",
                              t.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                            )}
                          >
                            {t.name}
                          </div>
                          <div className="shrink-0 text-[10px] text-muted-foreground">{t.time}</div>
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {t.role} · {t.company}
                        </div>
                        <div
                          className={cn(
                            "mt-1 line-clamp-1 text-xs",
                            t.unread ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {t.preview}
                        </div>
                        {t.needsFollowUp && (
                          <Badge
                            variant="outline"
                            className="mt-1.5 h-4 rounded-md border-[#F5A524]/30 bg-[#F5A524]/10 px-1.5 text-[9px] font-medium text-[#F5A524]"
                          >
                            Follow-up
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No conversations match this filter.
                  </div>
                )}
              </div>
            </div>

            {/* Active thread */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                <img
                  src={avatarUrl(active.avatarSeed, active.name)}
                  alt=""
                  className="size-9 rounded-full bg-muted"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{active.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {active.role} · {active.company}
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <Star className="size-4" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
                {active.messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      m.from === "me" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div className="max-w-[75%] space-y-1">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm",
                          m.from === "me"
                            ? "bg-[color:var(--blue)] text-white"
                            : "bg-muted text-foreground",
                        )}
                      >
                        {m.text}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] text-muted-foreground",
                          m.from === "me" ? "text-right" : "text-left",
                        )}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-4">
                <div className="rounded-xl border border-border bg-background p-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[60px] resize-none border-0 bg-transparent p-2 text-sm focus-visible:ring-0"
                  />
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setReply(
                            `Sounds good! How about ${new Date().toLocaleDateString("en-US", { weekday: "long" })} at 3pm?`,
                          )
                        }
                        className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/70"
                      >
                        Suggest time
                      </button>
                      <button
                        onClick={() => setReply("Here's the material we discussed: [link]. Let me know if you have any questions!")}
                        className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/70"
                      >
                        Send material
                      </button>
                    </div>
                    <Button
                      onClick={send}
                      className="h-8 gap-1.5 bg-[color:var(--blue)] text-white hover:opacity-90"
                    >
                      <Send className="size-3.5" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
