import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getExtraLeads } from "@/lib/kanban-store";
import { addSentMessage } from "@/lib/inbox-store";
import {
  Search,
  Filter,
  Plus,
  Play,
  LayoutGrid,
  List,
  ChevronRight,
  Clock,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Flame,
  Linkedin,
  Pencil,
  X,
  Sparkles,
  ArrowRight,
  MessageCircle,
  UserX,
  Send,
  Lock,

} from "lucide-react";

import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetOverlay, SheetPortal } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import * as SheetPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/kanban")({
  head: () => ({
    meta: [
      { title: "Lead Board — Isla" },
      {
        name: "description",
        content: "Track every lead from first signal to closed revenue.",
      },
    ],
  }),
  component: KanbanPage,
});

type Stage = "leads" | "connecting" | "engaging" | "ready" | "reach_out";

type LeadState =
  | "pending_approval"
  | "scheduled"
  | "awaiting_accept"
  | "invite_declined"
  | "need_attention"
  | "engaging"
  | "ready"
  | "sent";

export type Lead = {
  id: string;
  name: string;
  role: string;
  company: string;
  score: number;
  scoreTone: "cold" | "warm" | "hot";
  stage: Stage;
  source: string; // origin badge
  state: LeadState; // drives contextual CTA
  nextAt?: string; // e.g. "Tomorrow, 5pm"
  avatarSeed: number;
};

const STAGES: {
  key: Stage;
  label: string;
  dot: string;
}[] = [
  { key: "leads", label: "New Prospects", dot: "bg-[#475569]" },
  { key: "connecting", label: "Connecting", dot: "bg-[#6366F1]" },
  { key: "engaging", label: "Engaging", dot: "bg-[#8B5CF6]" },
  { key: "ready", label: "Ready to Reach Out", dot: "bg-[#FB923C]" },
  { key: "reach_out", label: "Reaching Out", dot: "bg-[#22C55E]" },
];

/** Left-side card indicator: mirrors the Pipeline column dot color. */
function stageIndicator(stage: Stage) {
  const s = STAGES.find((x) => x.key === stage);
  return { cls: s?.dot ?? "bg-muted", label: s?.label ?? "" };
}


// Origin badges — uniform neutral style for all sources.
const SOURCE_STYLE =
  "bg-[#3c3c3c] text-white dark:bg-[#3c3c3c] dark:text-white light:bg-neutral-100 light:text-neutral-700";
const SOURCE_STYLES: Record<string, string> = {
  "Connection List": SOURCE_STYLE,
  Research: SOURCE_STYLE,
  "Competitor Post": SOURCE_STYLE,
  Engagement: SOURCE_STYLE,
};

const SOURCE_TOOLTIPS: Record<string, string> = {
  "Connection List": "Imported from your existing LinkedIn connections.",
  Research: "Discovered by Isla's research agent based on your ICP.",
  "Competitor Post": "Engaged with a competitor's post recently.",
  Engagement: "Interacted with your own content on LinkedIn.",
};

const STATE_TOOLTIPS: Record<string, string> = {
  pending_approval: "Waiting for you to approve before Isla starts outreach.",
  scheduled: "An automated action is scheduled and will fire soon.",
  awaiting_accept: "Connection invite sent — waiting for the lead to accept.",
  invite_declined: "This lead declined your LinkedIn invitation.",
  need_attention: "Something went wrong with this lead — needs your attention.",
  engaging: "Isla is warming this lead through interactions on their posts.",
  ready: "Lead is warm and ready — needs an outreach message.",
  sent: "Outreach message was sent — waiting for a reply.",
};

export const LEADS: Lead[] = [
  { id: "l1", name: "Mariana Costa", role: "CMO", company: "Lumen.io", score: 28, scoreTone: "cold", stage: "leads", source: "Connection List", state: "pending_approval", avatarSeed: 1 },
  { id: "l2", name: "Lucas Almeida", role: "CMO", company: "Lumen.io", score: 69, scoreTone: "warm", stage: "leads", source: "Research", state: "pending_approval", avatarSeed: 2 },
  { id: "l3", name: "Felipe Santos", role: "CMO", company: "Lumen.io", score: 69, scoreTone: "warm", stage: "leads", source: "Competitor Post", state: "pending_approval", avatarSeed: 3 },
  { id: "l4", name: "Camila Silva", role: "CMO", company: "Lumen.io", score: 82, scoreTone: "hot", stage: "leads", source: "Competitor Post", state: "pending_approval", avatarSeed: 4 },
  { id: "l5", name: "Bruno Ferreira", role: "CMO", company: "Lumen.io", score: 41, scoreTone: "cold", stage: "leads", source: "Connection List", state: "pending_approval", avatarSeed: 5 },

  { id: "c1", name: "Sofia Martins", role: "CMO", company: "Lumen.io", score: 97, scoreTone: "hot", stage: "connecting", source: "Competitor Post", state: "invite_declined", avatarSeed: 6 },
  { id: "c2", name: "Rafael Oliveira", role: "CMO", company: "Lumen.io", score: 74, scoreTone: "warm", stage: "connecting", source: "Connection List", state: "awaiting_accept", avatarSeed: 7 },
  { id: "c3", name: "Carlos Pinheiro", role: "Head of Growth", company: "Lumen.io", score: 55, scoreTone: "warm", stage: "connecting", source: "Connection List", state: "awaiting_accept", avatarSeed: 17 },
  { id: "c4", name: "Beatriz Ramos", role: "VP Marketing", company: "Lumen.io", score: 84, scoreTone: "hot", stage: "connecting", source: "Research", state: "need_attention", avatarSeed: 22 },

  { id: "e1", name: "Gabriel Ferreira", role: "CMO", company: "Lumen.io", score: 97, scoreTone: "hot", stage: "engaging", source: "Competitor Post", state: "engaging", avatarSeed: 8 },
  { id: "e2", name: "Ana Beatriz", role: "CMO", company: "Lumen.io", score: 44, scoreTone: "cold", stage: "engaging", source: "Engagement", state: "engaging", avatarSeed: 9 },
  { id: "e3", name: "Juliana Mendes", role: "CMO", company: "Lumen.io", score: 51, scoreTone: "cold", stage: "engaging", source: "Research", state: "engaging", avatarSeed: 10 },
  { id: "e4", name: "Larissa Santos", role: "CMO", company: "Lumen.io", score: 91, scoreTone: "hot", stage: "engaging", source: "Competitor Post", state: "engaging", avatarSeed: 11 },

  { id: "r1", name: "Carla Lima", role: "CMO", company: "Lumen.io", score: 78, scoreTone: "warm", stage: "ready", source: "Research", state: "scheduled", nextAt: "2d", avatarSeed: 12 },
  { id: "r2", name: "Thiago Pereira", role: "CMO", company: "Lumen.io", score: 72, scoreTone: "warm", stage: "ready", source: "Research", state: "ready", avatarSeed: 13 },
  { id: "r3", name: "André Souza", role: "CMO", company: "Lumen.io", score: 95, scoreTone: "hot", stage: "ready", source: "Engagement", state: "ready", avatarSeed: 14 },

  { id: "o1", name: "Sofia Martins", role: "CMO", company: "Lumen.io", score: 97, scoreTone: "hot", stage: "reach_out", source: "Competitor Post", state: "sent", avatarSeed: 15 },
  { id: "o2", name: "Rafael Oliveira", role: "CMO", company: "Lumen.io", score: 88, scoreTone: "hot", stage: "reach_out", source: "Connection List", state: "sent", nextAt: "replied", avatarSeed: 16 },
];

/** Find a Lead by name or synthesize a plausible one so the drawer can render. */
export function findOrSynthLead(name: string): Lead {
  const existing = LEADS.find((l) => l.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const roles = ["Head of Growth", "VP of Marketing", "Founder & CEO", "Director of Sales", "Chief Revenue Officer", "CMO"];
  const companies = ["Nortex", "Nuvemshop", "Loft", "iFood", "Hotmart", "RD Station"];
  const sources = ["Connection List", "Research", "Competitor Post", "Engagement"] as const;
  const stages: Stage[] = ["leads", "connecting", "engaging", "ready", "reach_out"];
  const states: LeadState[] = ["pending_approval", "awaiting_accept", "engaging", "ready", "sent"];
  const score = 55 + (h % 45);
  return {
    id: `synth-${h}`,
    name,
    role: roles[h % roles.length],
    company: companies[(h >> 3) % companies.length],
    score,
    scoreTone: score >= 80 ? "hot" : score >= 60 ? "warm" : "cold",
    stage: stages[(h >> 5) % stages.length],
    source: sources[(h >> 7) % sources.length],
    state: states[(h >> 9) % states.length],
    avatarSeed: (h % 70) + 1,
  };
}

function avatarUrl(seed: number, _name: string) {
  // Real human headshots via pravatar (deterministic by seed, 1..70)
  const idx = ((seed - 1) % 70) + 1;
  return `https://i.pravatar.cc/150?img=${idx}`;
}

/** Contextual CTA per stage. Returns null when no action exists. */
function cardCta(lead: Lead): { label: string } | null {
  switch (lead.stage) {
    case "leads":
      return { label: "Move to Connect" };
    case "connecting":
      return { label: "Move to Engage" };
    case "engaging":
      return { label: "Move to Ready" };
    case "ready":
      return lead.state === "scheduled"
        ? { label: "Send message now" }
        : lead.score >= 90
          ? { label: "Send message now" }
          : { label: "Generate message" };
    case "reach_out":
      return lead.nextAt === "replied"
        ? { label: "Chat with lead" }
        : { label: "Send follow-up" };
  }
}

/** State badge — one per card, next to origin. Returns null when the state is neutral. */
function stateBadge(lead: Lead):
  | { label: string; icon: typeof Clock; cls: string }
  | null {
  switch (lead.state) {
    case "invite_declined":
      return {
        label: "Connection Declined",
        icon: UserX,
        cls: "bg-[#462323] text-red-300 dark:bg-[#462323] dark:text-red-300 light:bg-red-50 light:text-red-700",
      };
    case "need_attention":
      return {
        label: "Need Attention",
        icon: AlertTriangle,
        cls: "bg-[#462323] text-white dark:bg-[#462323] dark:text-white light:bg-red-50 light:text-red-700",
      };
    case "awaiting_accept":
      return {
        label: "Waiting Connection",
        icon: Loader2,
        cls: "bg-[#112b32] text-[#00BFFF] dark:bg-[#112b32] dark:text-[#00BFFF] light:bg-sky-50 light:text-sky-700",
      };
    case "engaging":
      return {
        label: "Warming Lead",
        icon: Flame,
        cls: "bg-[#112b32] text-[#00BFFF] dark:bg-[#112b32] dark:text-[#00BFFF] light:bg-sky-50 light:text-sky-700",
      };
    case "scheduled":
      return {
        label: `Action in ${lead.nextAt ?? "2d"}`,
        icon: Clock,
        cls: "bg-[#112b32] text-[#00BFFF] dark:bg-[#112b32] dark:text-[#00BFFF] light:bg-sky-50 light:text-sky-700",
      };
    case "ready":
      return {
        label: "Need Message",
        icon: MessageSquare,
        cls: "bg-[#3a2e12] text-amber-300 dark:bg-[#3a2e12] dark:text-amber-300 light:bg-amber-50 light:text-amber-700",
      };
    case "sent":
      return lead.nextAt === "replied"
        ? {
            label: "Replied",
            icon: CheckCircle2,
            cls: "bg-emerald-500/15 text-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-400 light:bg-emerald-50 light:text-emerald-700",
          }
        : {
            label: "Waiting Reply",
            icon: Clock,
            cls: "bg-[#112b32] text-[#00BFFF] dark:bg-[#112b32] dark:text-[#00BFFF] light:bg-sky-50 light:text-sky-700",
          };
    default:
      return null;
  }
}

type Connection = {
  status: "connected" | "waiting" | "not_connected";
  barCls: string;
  title: string;
  detail: string;
};

function connectionFor(lead: Lead): Connection {
  // Deterministic pseudo-date based on avatarSeed
  const daysAgo = ((lead.avatarSeed * 7) % 28) + 1;
  const sentDate = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const notConnected: Connection = {
    status: "not_connected",
    barCls: "bg-neutral-500/70 light:bg-neutral-300",
    title: "Not connected on LinkedIn",
    detail: "Send a connection request to start engaging with this lead.",
  };
  const waiting: Connection = {
    status: "waiting",
    barCls: "bg-orange-500",
    title: "Waiting for connection",
    detail: `Invitation sent ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago (${sentDate}). Awaiting acceptance.`,
  };
  const connected: Connection = {
    status: "connected",
    barCls: "bg-emerald-500",
    title: "Connected on LinkedIn",
    detail: `Connected since ${sentDate}.`,
  };

  if (lead.stage === "leads") return notConnected;
  if (lead.state === "invite_declined") return notConnected;
  if (lead.stage === "connecting") return waiting;
  if (lead.stage === "engaging") {
    // Some engaging leads may still be waiting or not connected
    const mod = lead.avatarSeed % 5;
    if (mod === 0) return notConnected;
    if (mod === 1) return waiting;
    return connected;
  }
  return connected;
}

function LeadCard({ lead, onOpen }: { lead: Lead; onOpen: (lead: Lead) => void }) {
  const cta = cardCta(lead);
  const state = stateBadge(lead);
  const sourceCls = SOURCE_STYLES[lead.source] ?? "bg-muted text-muted-foreground";
  const indicator = stageIndicator(lead.stage);

  // Score pill: green for <90, slate for top scores — matching reference.
  const scorePill =
    lead.score >= 90
      ? "bg-slate-600 text-white"
      : "bg-green-700 text-white";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(lead)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(lead);
        }
      }}
      className="clickable-card group relative cursor-pointer rounded-[10px] border border-white/10 bg-[#141414] dark:border-white/10 dark:bg-[#141414] light:border-[#E6E6E6] light:bg-white overflow-clip"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-label={`Stage: ${indicator.label}`}
            className={cn("absolute left-0 top-0 h-full w-[3px]", indicator.cls)}
          />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[220px]">
          <p className="font-medium">{indicator.label}</p>
          <p className="text-xs text-muted-foreground">Current pipeline stage.</p>
        </TooltipContent>
      </Tooltip>



      <div className="flex flex-col gap-2.5 pl-4 pr-3 pt-3">
        {/* Row 1: avatar + identity */}
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0 h-9 w-9">
            <img
              src={avatarUrl(lead.avatarSeed, lead.name)}
              alt=""
              className="size-9 rounded-full bg-muted object-cover"
            />
            <span
              className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-[18px] min-w-[26px] items-center justify-center rounded-lg px-1.5 text-[11px] font-semibold tabular-nums ring-2 ring-[#141414] light:ring-white",
                scorePill,
              )}
            >
              {lead.score}
            </span>
          </div>
          <div className="min-w-0 flex-1 pl-1">
            <div className="truncate text-[13px] font-semibold leading-tight text-foreground">
              {lead.name}
            </div>
            <div className="truncate text-[11px] leading-tight text-muted-foreground">
              {lead.role} · {lead.company}
            </div>
          </div>
        </div>

        {/* Row 2: origin + optional state (always same line — column widens if needed) */}
        <div className="flex flex-nowrap items-center gap-1">
          <Badge
            variant="outline"
            className={cn(
              "h-[20px] shrink-0 rounded-lg border-transparent px-1.5 text-[10px] font-semibold whitespace-nowrap",
              sourceCls,
            )}
          >
            {lead.source}
          </Badge>
          {state && (
            <Badge
              variant="outline"
              className={cn(
                "h-[20px] shrink-0 gap-1 rounded-lg border-transparent px-1.5 text-[10px] font-semibold whitespace-nowrap",
                state.cls,
              )}
            >
              <state.icon className="size-2.5" />
              {state.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Footer: single CTA — separated by border-top */}
      {cta ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast(cta.label, { description: lead.name });
          }}
          className="mt-2.5 flex w-full items-center justify-between border-t border-white/10 light:border-[#E6E6E6] pl-4 pr-3 py-2 text-[12px] font-semibold text-foreground/90 hover:bg-white/[0.03] light:hover:bg-neutral-50 hover:text-[#00BFFF] transition-colors"
        >
          <span>{cta.label}</span>
          <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-[#00BFFF]" />
        </button>
      ) : (
        <div className="h-3" />
      )}
    </div>
  );
}

function KanbanPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [activeStage, setActiveStage] = useState<Stage | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Set<Stage>>(new Set());
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Onboarding gating: stages beyond "Leads" stay locked until LinkedIn is
  // connected and the connections CSV is imported.
  const [gate, setGate] = useState<{ linkedin: boolean; connections: boolean } | null>(null);

  useEffect(() => {
    // Mark the "Check your Lead Board" setup task as visited.
    try {
      const raw = localStorage.getItem("isla.onboarding.v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setGate({
          linkedin: !!parsed.linkedinConnected,
          connections: !!parsed.connectionsUploaded,
        });
        if (!parsed.crmVisited) {
          parsed.crmVisited = true;
          if (Array.isArray(parsed.tasks)) {
            parsed.tasks = parsed.tasks.map((t: { id: string; status: string }) =>
              t.id === "task-view-crm" && t.status !== "completed"
                ? { ...t, status: "completed", completedAt: Date.now() }
                : t,
            );
          }
          localStorage.setItem("isla.onboarding.v1", JSON.stringify(parsed));
        }
      } else {
        setGate({ linkedin: true, connections: true });
      }
    } catch {
      setGate({ linkedin: true, connections: true });
    }
  }, []);

  const stagesLocked = !!gate && !(gate.linkedin && gate.connections);
  const gateMessage = !gate
    ? ""
    : !gate.linkedin
      ? "Connect your LinkedIn to unlock all stages"
      : "Upload your LinkedIn connections to unlock all stages";
  const gateDetail = !gate
    ? ""
    : !gate.linkedin
      ? "Isla needs your account connected before it can send invites and warm up leads."
      : "Import your connections so Isla knows who you already know and can start your pipeline.";



  useEffect(() => {
    const merge = () => {
      const extras = getExtraLeads();
      if (!extras.length) return;
      setLeads((prev) => {
        const existing = new Set(prev.map((l) => l.id));
        const additions = extras
          .filter((e) => !existing.has(e.id))
          .map<Lead>((e) => ({
            id: e.id,
            name: e.name,
            role: e.role,
            company: e.company,
            score: e.score,
            scoreTone: e.scoreTone,
            stage: e.stage,
            source: e.tag,
            state: "pending_approval",
            avatarSeed: e.avatarSeed,
          }));
        return additions.length ? [...prev, ...additions] : prev;
      });
    };
    merge();
    window.addEventListener("focus", merge);
    return () => window.removeEventListener("focus", merge);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = stagesLocked ? leads.filter((l) => l.stage === "leads") : leads;
    if (!q) return base;
    return base.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q),
    );
  }, [leads, query, stagesLocked]);


  const byStage = (s: Stage) => filtered.filter((l) => l.stage === s);
  const stageCount = (s: Stage) => leads.filter((l) => l.stage === s).length;

  const toggleCol = (s: Stage) =>
    setCollapsedCols((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col px-6 pt-8 pb-2 lg:px-10">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Lead Board</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track every lead from first signal to closed revenue.
            </p>
          </header>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")}>
              <TabsList>
                <TabsTrigger value="kanban" className="gap-1.5">
                  <LayoutGrid className="size-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5">
                  <List className="size-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="h-10 pl-9 text-sm"
              />
            </div>
            <Button variant="outline" className="h-10 gap-1.5">
              <Filter className="size-4" />
              Filter
            </Button>
            <Button className="h-10 gap-1.5">
              <Plus className="size-4" />
              New Lead
            </Button>
          </div>

          {stagesLocked && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/[0.08] px-4 py-3">
              <Lock className="mt-0.5 size-4 shrink-0 text-[#F59E0B]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#F59E0B]">{gateMessage}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{gateDetail}</p>

              </div>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/home?open=linkedin";
                }}
                className="ml-auto h-9 shrink-0 gap-1.5"
              >
                <Linkedin className="size-4" />
                Connect LinkedIn
              </Button>
            </div>
          )}


          {view === "kanban" ? (
            <div className="flex min-h-0 flex-1 items-start gap-3 overflow-x-auto overflow-y-hidden pb-1">
              {STAGES.map((stage) => {
                const items = byStage(stage.key);
                const total = stageCount(stage.key);
                const isActive = activeStage === stage.key;
                const isLocked = stagesLocked && stage.key !== "leads";
                const isCollapsed = collapsedCols.has(stage.key) && !isLocked;

                if (isLocked) {
                  return (
                    <div
                      key={stage.key}
                      className="relative flex max-h-full w-[290px] shrink-0 flex-col overflow-hidden rounded-[14px] bg-[#1b1b1b]/50 light:bg-[#F5F5F5]/60 px-1.5 py-2.5 grayscale"
                    >
                      <div className="flex items-center gap-1.5 px-2 pb-2.5">
                        <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        <span className="truncate text-[11px] font-semibold text-muted-foreground">
                          {stage.label}
                        </span>
                        <Lock className="size-3 text-muted-foreground/60" />
                      </div>

                      <div className="space-y-2 px-1 blur-[2px]">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded-[12px] bg-[#232323] light:bg-white px-3 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-foreground/10" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-2 w-2/3 rounded bg-foreground/10" />
                                <div className="h-2 w-1/2 rounded bg-foreground/[0.07]" />
                              </div>
                            </div>
                            <div className="mt-3 h-2 w-3/4 rounded bg-foreground/[0.07]" />
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 rounded-[12px] border border-border/60 bg-muted/40 px-3 py-3 text-center">
                        <Lock className="mx-auto mb-1.5 size-3.5 text-muted-foreground/70" />
                        <p className="text-[12px] font-semibold text-muted-foreground">
                          Stage locked
                        </p>
                      </div>

                    </div>
                  );
                }


                if (isCollapsed) {
                  return (
                    <button
                      key={stage.key}
                      onClick={() => toggleCol(stage.key)}
                      className="flex w-10 shrink-0 flex-col items-center gap-3 rounded-[14px] bg-[#1b1b1b] light:bg-[#F5F5F5] py-3 hover:brightness-110"
                    >
                      <span className={cn("size-2 rounded-full", stage.dot)} />
                      <span className="[writing-mode:vertical-rl] text-[11px] font-semibold">
                        {stage.label}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">{total}</span>
                    </button>
                  );
                }

                return (
                  <div
                    key={stage.key}
                    onMouseEnter={() => setActiveStage(stage.key)}
                    onMouseLeave={() => setActiveStage(null)}
                    className={cn(
                      "flex max-h-full w-[290px] shrink-0 flex-col rounded-[14px] bg-[#1b1b1b] light:bg-[#F5F5F5] px-1.5 py-2.5 transition-colors",
                      isActive && "ring-1 ring-white/10 light:ring-neutral-200",
                    )}
                  >
                    {/* Compact header — dot · name · count · Rodar Tudo */}
                    <div className="flex items-center justify-between px-2 pb-2.5">
                      <button
                        onClick={() => toggleCol(stage.key)}
                        className="flex min-w-0 items-center gap-1.5"
                      >
                        <span className={cn("size-1.5 shrink-0 rounded-full", stage.dot)} />
                        <span className="truncate text-[11px] font-semibold tracking-[-0.275px]">
                          {stage.label}
                        </span>
                        <span className="ml-1 rounded-md px-1 text-[11px] tabular-nums text-muted-foreground">
                          {total}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          toast(`Running ${stage.label}`, {
                            description: `${items.length} leads in processing.`,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-foreground/80 hover:text-foreground"
                      >
                        Rodar Tudo
                        <Play className="size-2.5 fill-current" />
                      </button>
                    </div>

                    {/* Scrollable list */}
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-1 pb-1">
                      {items.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} onOpen={setSelectedLead} />
                      ))}
                      {items.length === 0 && (
                        <div className="mt-4 flex flex-col items-center gap-1 rounded-lg py-8 text-center">
                          <div className="text-[13px]">
                            {stage.key === "ready" ? "All caught up 🎉" : "No leads here"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {stage.key === "leads"
                              ? "New leads will show up here."
                              : "Move leads into this stage."}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card">
              <div className="grid grid-cols-[1fr_140px_160px_140px] gap-4 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <div>Lead</div>
                <div>Stage</div>
                <div>Source</div>
                <div>Next Action</div>
              </div>
              {filtered.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="clickable-card-row grid grid-cols-[1fr_140px_160px_140px] items-center gap-4 border-b border-border px-4 py-3 text-sm last:border-0 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl(lead.avatarSeed, lead.name)}
                      alt=""
                      className="size-8 rounded-full bg-muted"
                    />
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.role} · {lead.company}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {STAGES.find((s) => s.key === lead.stage)?.label}
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 rounded border-transparent px-1.5 text-[10px]",
                        SOURCE_STYLES[lead.source] ?? "",
                      )}
                    >
                      {lead.source}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{cardCta(lead)?.label ?? "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <LeadDetailSheet lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  </TooltipProvider>
  );
}

/* ---------- Lead Detail Drawer ---------- */

const DEFAULT_REACH_OUT =
  "Hi {{first_name}}, I noticed your team is investing heavily in LinkedIn content. We help B2B companies turn that activity into a predictable pipeline by identifying high-intent prospects and automating personalized outreach. Thought this could be relevant for your team — would love to swap notes.";

const DEFAULT_FOLLOW_UP =
  "Hello {{first_name}}, I noticed that your team recently published a strong piece on GTM strategy — would love to hear how you're thinking about turning engagement into pipeline.";

function errorForLead(lead: Lead): { title: string; detail: string } | null {
  if (lead.state === "invite_declined") {
    return {
      title: "Connection invite was declined",
      detail:
        "The attendee cannot be invited, either permanently (previous invitation declined) or until an action is taken.",
    };
  }
  if (lead.state === "need_attention") {
    return {
      title: "This lead needs your attention",
      detail:
        "Something went wrong while processing this lead. Review the details and take an action to move it forward.",
    };
  }
  return null;
}

function MessageCard({
  title,
  placeholder,
  open,
  onOpen,
  onCollapse,
  value,
  onChange,
  generating,
  onGenerate,
  sent,
  onSend,
  minRows,
  extraFooter,
}: {
  title: string;
  placeholder: string;
  open: boolean;
  onOpen: () => void;
  onCollapse: () => void;
  value: string;
  onChange: (v: string) => void;
  generating: boolean;
  onGenerate: () => void;
  sent: boolean;
  onSend: () => void;
  minRows: number;
  extraFooter?: React.ReactNode;
}) {
  if (!open) {
    const hasContent = value.trim().length > 0;
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group w-full rounded-[10px] border border-white/10 bg-transparent p-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.03] light:border-[#E6E6E6] light:hover:border-neutral-300 light:hover:bg-neutral-50"
      >
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold">{title}</div>
          <div className="flex items-center gap-2">
            {sent ? (
              <Badge className="h-[20px] gap-1 rounded-md border-transparent bg-emerald-500/15 px-1.5 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/15">
                <CheckCircle2 className="size-3" /> Sent
              </Badge>
            ) : hasContent ? (
              <Badge className="h-[20px] gap-1 rounded-md border-transparent bg-white/10 px-1.5 text-[10px] font-semibold text-white/80 hover:bg-white/10 light:bg-neutral-100 light:text-neutral-600">
                Saved
              </Badge>
            ) : null}
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
              {hasContent ? "Edit" : "Add"}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "mt-1.5 text-[12px]",
            hasContent ? "line-clamp-2 text-foreground/80" : "text-muted-foreground",
          )}
        >
          {hasContent ? value : placeholder}
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-[10px] border border-white/10 bg-white/[0.02] p-3 light:border-[#E6E6E6] light:bg-neutral-50/60">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold">{title}</label>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-[10px] bg-transparent hover:bg-white/5 light:hover:bg-neutral-100"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            Generate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-[10px] p-0"
            onClick={onCollapse}
            aria-label="Collapse"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        style={{ minHeight: minRows }}
        className="mt-2 resize-none"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>{extraFooter}</div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-8 rounded-[10px]"
          >
            Save
          </Button>
          <Button
            size="sm"
            onClick={onSend}
            disabled={sent || !value.trim()}
            className="h-8 gap-1.5 rounded-[10px] text-white [&_svg]:text-white"
          >
            {sent ? (
              <>
                <CheckCircle2 className="size-3.5" /> Sent
              </>
            ) : (
              <>
                <Send className="size-3.5" /> Send message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


export function LeadDetailSheet({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const open = !!lead;
  const [reachOut, setReachOut] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [genRO, setGenRO] = useState(false);
  const [genFU, setGenFU] = useState(false);
  const [whereOpen, setWhereOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<"reach_out" | "follow_up" | null>(null);
  const [sentRO, setSentRO] = useState(false);
  const [sentFU, setSentFU] = useState(false);
  const [openRO, setOpenRO] = useState(false);
  const [openFU, setOpenFU] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (lead) {
      setReachOut("");
      setFollowUp("");
      setSentRO(false);
      setSentFU(false);
      setOpenRO(false);
      setOpenFU(false);
    }
  }, [lead]);

  if (!lead) return null;

  const err = errorForLead(lead);
  const state = stateBadge(lead);
  const conn = connectionFor(lead);
  const stageLabel = STAGES.find((s) => s.key === lead.stage)?.label ?? "";

  const simulateGenerate = (kind: "ro" | "fu") => {
    if (kind === "ro") {
      setGenRO(true);
      setTimeout(() => {
        setReachOut(
          `Hi ${lead.name.split(" ")[0]}, your recent posts on ${lead.company}'s growth caught my eye — especially the angle on partnerships. We're helping B2B teams turn LinkedIn signals into a predictable pipeline. Worth a quick chat next week?`,
        );
        setGenRO(false);
      }, 900);
    } else {
      setGenFU(true);
      setTimeout(() => {
        setFollowUp(
          `Hey ${lead.name.split(" ")[0]}, circling back — saw the update from ${lead.company} this week. Curious if pipeline predictability is on your radar for the next quarter?`,
        );
        setGenFU(false);
      }, 900);
    }
  };

  const confirmSend = () => {
    if (!confirmKind || !lead) return;
    const text = (confirmKind === "reach_out" ? reachOut : followUp).trim();
    if (!text) {
      setConfirmKind(null);
      return;
    }
    addSentMessage({
      leadId: lead.id,
      leadName: lead.name,
      leadRole: lead.role,
      leadCompany: lead.company,
      avatarSeed: lead.avatarSeed,
      kind: confirmKind,
      text,
      sentAt: Date.now(),
    });
    if (confirmKind === "reach_out") {
      setSentRO(true);
      setOpenRO(false);
    } else {
      setSentFU(true);
      setOpenFU(false);
    }
    toast.success("Message sent", {
      description: `Delivered on LinkedIn to ${lead.name.split(" ")[0]}. Check your Inbox.`,
    });
    setConfirmKind(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetPortal>
          <SheetOverlay className="bg-black/70 backdrop-blur-sm" />
          <SheetPrimitive.Content
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-white/10 light:border-[#E6E6E6] bg-[#141414] light:bg-white shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-300 data-[state=open]:duration-500"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 light:border-[#E6E6E6] p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0 h-11 w-11">
                  <img
                    src={avatarUrl(lead.avatarSeed, lead.name)}
                    alt=""
                    className="size-11 rounded-full object-cover"
                  />
                  <span
                    className={cn(
                      "absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-[18px] min-w-[26px] items-center justify-center rounded-lg px-1.5 text-[11px] font-semibold tabular-nums ring-2 ring-[#141414] light:ring-white",
                      lead.score >= 90 ? "bg-slate-600 text-white" : "bg-green-700 text-white",
                    )}
                  >
                    {lead.score}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold">{lead.name}</div>
                  <div className="truncate text-[12px] text-muted-foreground">
                    {lead.role} — {lead.company}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="truncate">
                      <span className="text-foreground/60">Email:</span>{" "}
                      <span className="text-foreground/90">
                        {`${lead.name.toLowerCase().replace(/\s+/g, ".")}@${lead.company.toLowerCase()}`}
                      </span>
                    </span>
                    <span className="truncate">
                      <span className="text-foreground/60">Sender:</span>{" "}
                      <span className="text-foreground/90">Marcos @ Isla</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-[10px] bg-transparent hover:bg-white/5 light:hover:bg-neutral-100"
                  onClick={() =>
                    window.open(
                      `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `${lead.name} ${lead.company}`,
                      )}`,
                      "_blank",
                    )
                  }
                >
                  <Linkedin className="size-3.5" />
                  Open LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-[10px] bg-transparent hover:bg-white/5 light:hover:bg-neutral-100"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <button
                  onClick={onClose}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground light:hover:bg-neutral-100"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Badge row */}
            <TooltipProvider delayDuration={150}>
              <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 light:border-[#E6E6E6] px-5 py-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="h-[22px] cursor-help gap-1 rounded-lg border-transparent bg-green-700 px-2 text-[11px] font-semibold text-white hover:bg-green-700">
                      ICP {lead.score}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px]">
                    <div className="text-[11px] font-semibold">ICP Match Score</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Match against your Ideal Customer Profile (0–100).
                    </div>
                  </TooltipContent>
                </Tooltip>

                {state && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className={cn(
                          "h-[22px] cursor-help gap-1 rounded-lg border-transparent px-2 text-[11px] font-semibold",
                          state.cls,
                        )}
                      >
                        <state.icon className="size-3" />
                        {state.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[240px]">
                      <div className="text-[11px] font-semibold">{state.label}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {STATE_TOOLTIPS[lead.state]}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-[22px] cursor-help rounded-lg border-transparent px-2 text-[11px] font-semibold",
                        SOURCE_STYLES[lead.source] ?? "",
                      )}
                    >
                      {lead.source}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px]">
                    <div className="text-[11px] font-semibold">Origin: {lead.source}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {SOURCE_TOOLTIPS[lead.source]}
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="h-[22px] cursor-help gap-1 rounded-lg border-transparent bg-neutral-700 px-2 text-[11px] font-semibold text-white light:bg-neutral-100 light:text-neutral-700"
                    >
                      {conn.status === "connected"
                        ? "Connected"
                        : conn.status === "waiting"
                          ? "Waiting"
                          : "Not connected"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px]">
                    <div className="text-[11px] font-semibold">{conn.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{conn.detail}</div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="h-[22px] cursor-help gap-1 rounded-lg border-transparent bg-[#112b32] px-2 text-[11px] font-semibold text-[#00BFFF] hover:bg-[#112b32] light:bg-sky-50 light:text-sky-700">
                      <Clock className="size-3" />
                      Stage: {stageLabel}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px]">
                    <div className="text-[11px] font-semibold">Current stage</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Where this lead sits in the pipeline right now.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {err && (
                <div className="flex items-start gap-3 rounded-[10px] border border-red-500/30 bg-red-500/10 p-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-red-300 light:text-red-700">
                      {err.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-red-300/80 light:text-red-700/80">
                      {err.detail}
                    </div>
                  </div>
                </div>
              )}


              {/* Reach out message */}
              <MessageCard
                title="Reach out message"
                placeholder="Click to write or generate a reach out message"
                open={openRO}
                onOpen={() => setOpenRO(true)}
                onCollapse={() => setOpenRO(false)}
                value={reachOut}
                onChange={setReachOut}
                generating={genRO}
                onGenerate={() => simulateGenerate("ro")}
                sent={sentRO}
                onSend={() => setConfirmKind("reach_out")}
                minRows={130}
                extraFooter={
                  <button
                    onClick={() => setWhereOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#00BFFF] hover:underline"
                  >
                    <Sparkles className="size-3.5" />
                    Where it came from?
                  </button>
                }
              />

              {/* Follow up */}
              <MessageCard
                title="Follow up message"
                placeholder="Click to write or generate a follow up message"
                open={openFU}
                onOpen={() => setOpenFU(true)}
                onCollapse={() => setOpenFU(false)}
                value={followUp}
                onChange={setFollowUp}
                generating={genFU}
                onGenerate={() => simulateGenerate("fu")}
                sent={sentFU}
                onSend={() => setConfirmKind("follow_up")}
                minRows={90}
              />


              {/* Timeline */}
              <div className="rounded-[10px] border border-white/10 light:border-[#E6E6E6] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Timeline
                </div>
                <div className="mt-3 space-y-4">
                  <TimelineItem
                    icon={ArrowRight}
                    iconCls="bg-amber-500/20 text-amber-400"
                    title="Moved to Replied to Message"
                    when="8h ago"
                  />
                  <TimelineItem
                    icon={MessageCircle}
                    iconCls="bg-emerald-500/20 text-emerald-400"
                    title="Reply received"
                    detail={`"Morning! Feel free to call me tomorrow at 2pm."`}
                    when="1d ago"
                  />
                  <TimelineItem
                    icon={MessageSquare}
                    iconCls="bg-violet-500/20 text-violet-400"
                    title="Comment on your post"
                    detail={`"Makes total sense — happy to jump on a quick chat."`}
                    when="3d ago"
                  />
                  <TimelineItem
                    icon={Linkedin}
                    iconCls="bg-sky-500/20 text-sky-400"
                    title="Message sent on LinkedIn"
                    detail={`"Hey, saw you're leading GTM at ${lead.company} — makes sense to connect."`}
                    when="5d ago"
                  />
                </div>
              </div>
            </div>
          </SheetPrimitive.Content>
        </SheetPortal>
      </Sheet>

      <WhereItCameFromDialog open={whereOpen} onOpenChange={setWhereOpen} lead={lead} />

      <Dialog open={confirmKind !== null} onOpenChange={(v) => !v && setConfirmKind(null)}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Send this message?</DialogTitle>
            <DialogDescription>
              This will send the {confirmKind === "follow_up" ? "follow-up" : "reach-out"} message to{" "}
              <span className="font-semibold text-foreground">{lead.name}</span> on LinkedIn. It will appear in your Inbox.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-[10px] border border-white/10 light:border-[#E6E6E6] bg-muted/40 p-3 text-[13px] leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap">
            {confirmKind === "follow_up" ? followUp : reachOut}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmKind(null)} className="rounded-[10px]">
              Cancel
            </Button>
            <Button onClick={confirmSend} className="rounded-[10px] gap-1.5 text-white [&_svg]:text-white">
              <Send className="size-3.5" /> Send message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditLeadDialog open={editOpen} onOpenChange={setEditOpen} lead={lead} />
    </>
  );
}

function TimelineItem({
  icon: Icon,
  iconCls,
  title,
  detail,
  when,
}: {
  icon: typeof ArrowRight;
  iconCls: string;
  title: string;
  detail?: string;
  when: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", iconCls)}>
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[13px] font-semibold">{title}</div>
          <div className="shrink-0 text-[11px] text-muted-foreground">{when}</div>
        </div>
        {detail && <div className="mt-0.5 text-[12px] text-muted-foreground">{detail}</div>}
      </div>
    </div>
  );
}

function WhereItCameFromDialog({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Where this message came from</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Why this message
            </div>
            <ul className="mt-2 space-y-2 text-[13px] text-foreground/90">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/60" />
                Recent post on {lead.company}'s GTM playbook was the primary hook — {lead.name.split(" ")[0]} values durable relationships.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/60" />
                Warm, personal tone justifies a direct approach without excessive formality.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/60" />
                Mention of continued partnership opens room for a light connection invite without commercial pressure.
              </li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Signals used
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Profile", "Recent post", "Engagement", "Brand voice"].map((s) => (
                <Badge key={s} variant="outline" className="h-7 rounded-lg px-2.5 text-[12px]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditLeadDialog({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit lead</DialogTitle>
          <DialogDescription>
            Update this lead's details. All fields below are editable.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">Name</label>
            <Input className="mt-1.5 h-10" defaultValue={lead.name} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">Company</label>
            <Input className="mt-1.5 h-10" defaultValue={lead.company} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">Role</label>
            <Input className="mt-1.5 h-10" defaultValue={lead.role} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">Email</label>
            <Input
              className="mt-1.5 h-10"
              defaultValue={`${lead.name.toLowerCase().replace(/\s+/g, ".")}@${lead.company.toLowerCase()}`}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">Stage</label>
            <Input
              className="mt-1.5 h-10"
              defaultValue={STAGES.find((s) => s.key === lead.stage)?.label ?? ""}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">Origin</label>
            <Input className="mt-1.5 h-10" defaultValue={lead.source} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">ICP Score</label>
            <Input className="mt-1.5 h-10" defaultValue={String(lead.score)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[12px] font-semibold">Sender</label>
            <Input className="mt-1.5 h-10" defaultValue="Marcos @ Isla" />
          </div>
          <div className="col-span-2">
            <label className="text-[12px] font-semibold">LinkedIn profile</label>
            <Input
              className="mt-1.5 h-10"
              defaultValue={`https://linkedin.com/in/${lead.name.toLowerCase().replace(/\s+/g, "-")}`}
            />
          </div>
        </div>
        <DialogFooter className="mt-2 flex items-center sm:justify-between">
          <Button
            variant="ghost"
            className="rounded-[10px] text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => {
              toast.success("Lead deleted");
              onOpenChange(false);
            }}
          >
            Delete lead
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-[10px]">
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Lead updated");
                onOpenChange(false);
              }}
              className="rounded-[10px] text-white"
            >
              Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
