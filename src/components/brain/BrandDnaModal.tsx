import { CURRENT_USER } from "@/lib/current-user";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Fingerprint, Layers, Lightbulb, TriangleAlert, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCORES = [
  { label: "Autenticidade", value: 18, max: 25 },
  { label: "Construção de comunidade", value: 6, max: 10 },
  { label: "Qualidade do engajamento", value: 9, max: 15 },
  { label: "Liderança de pensamento", value: 3, max: 5 },
  { label: "Consistência de conteúdo", value: 8, max: 15 },
  { label: "Autoridade técnica", value: 15, max: 20 },
  { label: "Otimização da plataforma", value: 5, max: 10 },
];

const HIDDEN_STRENGTHS = [
  "You build in public with actual receipts — MRR numbers, WCAG audit results, Notion API integration details — which is rare and deeply credible among technical founders and senior designers.",
  "Your tool-building instinct signals a product mindset that goes beyond UI delivery. You think in systems and user experiences simultaneously.",
  "Your voice in Portuguese is genuinely distinctive — conversational, self-aware, funny without being performative.",
  "You own a positioning intersection almost no one holds: designer who thinks like a growth engineer.",
];

const BLIND_SPOTS = [
  "You are not making it easy for a stranger to understand who you are and why they should follow you. Your profile shell is under-optimized relative to your achievements.",
  "Borrowed and reshared content attracts vanity metrics from a generic audience and does not convert to high-trust followers.",
  "You have multiple live products but no clear narrative thread connecting them for a first-time visitor.",
  "Your engagement pattern is almost entirely inbound. LinkedIn rewards initiators.",
];

const IDENTITY = [
  "You ship production-ready work solo using AI tools in timeframes that would require a 3-person team — and you document the process publicly.",
  "You operate at the intersection of design craft, product strategy and technical implementation.",
  "You build the tools you wish existed rather than only designing for others.",
  "Years of product validation gave you an iteration muscle that pure UI designers lack.",
];

const PILLARS = [
  {
    title: "Design as a Growth Engine",
    body: "Your most powerful content proves design decisions move business metrics. Every post here should open with a metric and close with a design principle.",
  },
  {
    title: "AI-Assisted Shipping",
    body: "A real-time case study in how solo designers stay competitive in an AI-accelerated world. Post about it weekly.",
  },
  {
    title: "Design Systems in the Wild",
    body: "Practical, honest guidance on design systems that work in real startups — not enterprise theory.",
  },
  {
    title: "Building in Public: the Isla story",
    body: "Document the journey — the pivots, the feature kills, the onboarding experiments, the milestones — as a serialized story.",
  },
];

const AUDIENCE_CORE = [
  "Early-stage SaaS founders who know they need better design but cannot hire a full design team yet.",
  "Mid-career product designers who want a practical guide to staying relevant.",
  "Design system practitioners at startups tired of enterprise-scale advice.",
  "Technical co-founders and CTOs who need a design partner who speaks product and code.",
];

const AUDIENCE_EXPANSION = [
  "Startup ecosystem builders and accelerator communities.",
  "No-code and low-code builders discovering design thinking amplifies their output.",
  "Indie hackers building B2B SaaS who need to connect UX to activation and retention.",
  "International design leaders building out their AI design stack.",
];

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-muted-foreground" />
      <h3 className="text-sm font-semibold tracking-tight">{children}</h3>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground/60" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Brand DNA reader. The dialog stays fixed; only the inner area scrolls.
 * Continue unlocks once the reader actually reaches the bottom.
 */
export function BrandDnaModal({
  open,
  onOpenChange,
  onContinue,
  name = CURRENT_USER.name,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onContinue: () => void;
  name?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [readToEnd, setReadToEnd] = useState(false);

  useEffect(() => {
    if (open) setReadToEnd(false);
  }, [open]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReadToEnd(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[86vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Brand DNA — {name}</DialogTitle>
          <DialogDescription>
            Your pillars, tone and proof points. Read it through to continue.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="min-h-0 flex-1 space-y-8 overflow-y-auto pr-2"
        >
          {/* Score card */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">
                  Silver · The Rising Voice
                </span>
                <p className="mt-2 text-xs text-muted-foreground">
                  Top 38% of profiles analyzed
                </p>
              </div>
              <p className="text-3xl font-semibold leading-none">
                64<span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {SCORES.map((s) => (
                <div key={s.label}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-xs font-semibold">
                      {s.value}/{s.max}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-muted">
                    <div
                      className="h-1 rounded-full bg-[#00BFFF]"
                      style={{ width: `${(s.value / s.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section>
            <SectionTitle icon={Lightbulb}>Diagnóstico</SectionTitle>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              You are a hands-on builder doing some of the most interesting work in your space —
              shipping AI-assisted features, building internal tooling, iterating on real metrics —
              and your profile is only telling about 40% of that story. Your best posts get real
              traction when they are specific, technical and honest.
            </p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Forças ocultas
            </p>
            <Bullets items={HIDDEN_STRENGTHS} />
          </section>

          <section>
            <SectionTitle icon={TriangleAlert}>Pontos cegos</SectionTitle>
            <Bullets items={BLIND_SPOTS} />
          </section>

          <section>
            <SectionTitle icon={Fingerprint}>Identidade central</SectionTitle>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              You are the designer who refuses to wait for a developer. You combine aesthetic
              sensibility with systems thinking and a builder's impatience — and you use AI as the
              lever to compress months of execution into days.
            </p>
            <Bullets items={IDENTITY} />
          </section>

          <section>
            <SectionTitle icon={Layers}>Pilares de conteúdo</SectionTitle>
            <div className="mt-3 space-y-2.5">
              {PILLARS.map((p) => (
                <div key={p.title} className="rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold">{p.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle icon={Users}>Audiência</SectionTitle>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Tribo central
            </p>
            <Bullets items={AUDIENCE_CORE} />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Audiências de expansão
            </p>
            <Bullets items={AUDIENCE_EXPANSION} />
          </section>
        </div>

        <DialogFooter className="shrink-0 sm:justify-between">
          <p
            className={cn(
              "text-xs transition-colors",
              readToEnd ? "text-muted-foreground" : "text-muted-foreground",
            )}
          >
            {readToEnd ? "You're all caught up." : "Scroll to the end to continue."}
          </p>
          <Button
            size="sm"
            disabled={!readToEnd}
            onClick={onContinue}
            className="text-white transition-opacity"
          >
            Continue
            <ArrowRight className="ml-1 size-3" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
