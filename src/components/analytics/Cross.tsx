import { useMemo, useState } from "react";
import { Clock, ExternalLink, FileText, Flame, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Sector,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Linkedin, UserPlus } from "lucide-react";
import { addExtraLead, hasExtraLead } from "@/lib/kanban-store";
import { toast } from "sonner";


import {
  useEngagedVsColdAcceptRate,
  useAudienceComposition,
  useIcpAudienceGrowth,
  usePostThemeAudience,
  useWarmupVelocity,
  useTopContentByIcpEngagement,
  useContentAttribution,
  type ContentRow,
  type CompositionDimension,
  type PostThemeAudienceRow,
  type AttributionLead,
} from "@/lib/cross-data";
import { useCrossFilters, useTween, scaleCount } from "@/lib/cross-filters";

function Num({ value, format = (n: number) => Math.round(n).toLocaleString() }: { value: number; format?: (n: number) => string }) {
  const v = useTween(value);
  return <>{format(v)}</>;
}

// ---------- shared bits ----------

function SectionShell({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="animate-cross-in" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border bg-card/30 px-3 py-4 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

const NO_DATA = "Not enough data — collect engagement and run prospecting.";

// ---------- Section 1: Hero ----------

function HeroAcceptRate() {
  const { data, isLoading } = useEngagedVsColdAcceptRate();

  if (isLoading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  const max = Math.max(...data.rows.map((r) => r.acceptRate));
  const positive = data.deltaPp >= 0;

  return (
    <Card className="shadow-glow border-[var(--board-surface-border)] bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-muted-foreground" />
            Accept Rate: Engaged Before vs Cold Lead
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            Do people who interact with content before the invite accept more?
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        {data.rows.map((row) => {
          const pct = Math.round(row.acceptRate * 100);
          const width = `${Math.round((row.acceptRate / max) * 100)}%`;
          const isHot = row.group === "engaged_before";
          return (
            <Tooltip key={row.group}>
              <TooltipTrigger asChild>
                <div className="cursor-default space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/90">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      <span className="font-semibold text-foreground">{pct}%</span>{" "}
                      <span className="text-xs">
                        ({row.accepts}/{row.invites})
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width,
                        background: isHot
                          ? "linear-gradient(90deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 55%, var(--border)) 100%)"
                          : "var(--muted-foreground)",
                        opacity: isHot ? 1 : 0.55,
                      }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {row.invites} invites · {row.accepts} accepts
              </TooltipContent>
            </Tooltip>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ---------- Section 2: Audience composition / ICP fit proof ----------

const ROLE_COLOR: Record<string, string> = {
  ceo: "hsl(var(--icp-role-ceo))",
  cto: "hsl(var(--icp-role-cto))",
  cmo: "hsl(var(--icp-role-cmo))",
  cfo: "hsl(var(--icp-role-cfo))",
  coo: "hsl(var(--icp-role-coo))",
  founder: "hsl(var(--icp-role-founder))",
  vp_sales: "hsl(var(--icp-role-vp-sales))",
  vp_marketing: "hsl(var(--icp-role-vp-marketing))",
  head_growth: "hsl(var(--icp-role-head-growth))",
  head_product: "hsl(var(--icp-role-head-product))",
  head_people: "hsl(var(--icp-role-head-people))",
  developer: "hsl(var(--icp-role-developer))",
  product_manager: "hsl(var(--icp-role-product-manager))",
  designer: "hsl(var(--icp-role-designer))",
  sales: "hsl(var(--icp-role-sales))",
  marketing: "hsl(var(--icp-role-marketing))",
  growth: "hsl(var(--icp-role-growth))",
  investor: "hsl(var(--icp-role-investor))",
  recruiter: "hsl(var(--icp-role-recruiter))",
  consultant: "hsl(var(--icp-role-consultant))",
};

const FALLBACK_PALETTE = [
  "hsl(var(--icp-role-founder))",
  "hsl(var(--icp-role-ceo))",
  "hsl(var(--icp-role-vp-sales))",
  "hsl(var(--icp-role-head-growth))",
  "hsl(var(--icp-role-cmo))",
  "hsl(var(--icp-role-head-product))",
  "hsl(var(--icp-role-developer))",
  "hsl(var(--icp-role-designer))",
  "hsl(var(--icp-role-marketing))",
  "hsl(var(--icp-role-growth))",
  "hsl(var(--icp-role-investor))",
  "hsl(var(--icp-role-recruiter))",
  "hsl(var(--icp-role-consultant))",
  "hsl(var(--icp-role-cfo))",
  "hsl(var(--icp-role-coo))",
  "hsl(var(--icp-role-head-people))",
];

function CompositionPie({ dim, notIcpCount }: { dim: CompositionDimension; notIcpCount: number }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const rows = useMemo(() => {
    const sorted = [...dim.slices].sort((a, b) => b.value - a.value);
    const base = sorted.map((s, i) => ({
      ...s,
      fill: dim.key === "role" ? ROLE_COLOR[s.key] ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length] : FALLBACK_PALETTE[i % FALLBACK_PALETTE.length],
    }));
    const grandTotal = dim.total + notIcpCount;
    base.push({
      key: "not_icp",
      label: "Not ICP",
      value: notIcpCount,
      pct: notIcpCount / grandTotal,
      isIcp: false,
      fill: "var(--muted-foreground)",
    });
    // recompute pct for existing slices against grandTotal
    return base.map((r) =>
      r.key === "not_icp" ? r : { ...r, pct: r.value / grandTotal },
    );
  }, [dim, notIcpCount]);

  const chartConfig = useMemo(() => {
    const cfg: ChartConfig = { value: { label: "People" } };
    rows.forEach((r) => {
      cfg[r.key] = { label: r.label, color: r.fill };
    });
    return cfg;
  }, [rows]);


  const activeIndex = activeKey ? rows.findIndex((r) => r.key === activeKey) : -1;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,240px)_1fr] md:items-center">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[220px] w-[220px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
          <Pie
            data={rows}
            dataKey="value"
            nameKey="key"
            innerRadius={55}
            outerRadius={95}
            strokeWidth={2}
            stroke="var(--card)"
            activeIndex={activeIndex >= 0 ? activeIndex : undefined}
            activeShape={(props: any) => {
              const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
              return (
                <Sector
                  cx={cx}
                  cy={cy}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius + 6}
                  startAngle={startAngle}
                  endAngle={endAngle}
                  fill={fill}
                />
              );
            }}
          >
            {rows.map((r) => (
              <Cell
                key={r.key}
                fill={r.fill}
                opacity={activeKey && activeKey !== r.key ? 0.28 : 1}
                style={{ transition: "opacity 150ms ease" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        {rows.map((r) => {
          const pct = Math.round(r.pct * 100);
          const isActive = activeKey === r.key;
          return (
            <Tooltip key={r.key}>
              <TooltipTrigger asChild>
                <li
                  onMouseEnter={() => setActiveKey(r.key)}
                  onMouseLeave={() => setActiveKey(null)}
                  className="flex cursor-default items-center justify-between gap-2 rounded-md px-1.5 py-0.5 transition-colors"
                  style={{
                    background: isActive ? "color-mix(in oklab, var(--foreground) 6%, transparent)" : "transparent",
                    opacity: activeKey && !isActive ? 0.45 : 1,
                  }}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-[3px]"
                      style={{ background: r.fill }}
                    />
                    <span className="truncate text-foreground/90">{r.label}</span>
                    {r.isIcp && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">ICP</span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    <span className="font-semibold text-foreground">{pct}%</span>{" "}
                    <span className="text-[10px]">({r.value})</span>
                  </span>
                </li>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-[2px]" style={{ background: r.fill }} />
                  <span className="font-medium">{r.label}</span>
                  {r.isIcp && (
                    <span className="text-[9px] uppercase tracking-wider opacity-70">ICP</span>
                  )}
                </div>
                <div className="mt-1 tabular-nums opacity-80">
                  {r.value} engagers · {pct}%
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ul>
    </div>
  );
}

function AudienceComposition() {
  const { data, isLoading } = useAudienceComposition();
  const [active, setActive] = useState<CompositionDimension["key"]>("role");

  if (isLoading) return <Skeleton className="h-80 w-full rounded-2xl" />;

  const icpPct = Math.round(data.icpPct * 100);
  const dim = data.dimensions.find((d) => d.key === active) ?? data.dimensions[0];


  const { factor } = useCrossFilters();
  const stats = [
    { key: "followers", label: "Followers", value: scaleCount(data.audienceTotal, factor), color: undefined as string | undefined },
    { key: "icp", label: "ICP Followers", value: scaleCount(data.icpCount, factor), color: "var(--icp-high)" },
  ];

  return (
    <Card className="bg-card py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:pt-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="size-4 text-muted-foreground" />
            Who is my audience?
          </CardTitle>
        </div>
        <div className="flex">
          {stats.map((s) => (
            <div
              key={s.key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            >
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                {s.label}
              </span>
              <span
                className="text-lg leading-none font-semibold tabular-nums sm:text-2xl"
                style={{ color: s.color }}
              >
                <Num value={s.value} />
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">


        {/* Dimension tabs */}
        <div className="flex flex-wrap gap-1.5">
          {data.dimensions.map((d) => {
            const isActive = d.key === active;
            return (
              <button
                key={d.key}
                onClick={() => setActive(d.key)}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: isActive ? "var(--board-surface-border)" : "var(--border)",
                  background: isActive ? "var(--board-surface)" : "transparent",
                  color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <CompositionPie dim={dim} notIcpCount={data.audienceTotal - data.icpCount} />
      </CardContent>
    </Card>
  );
}


// ---------- Section 3a: ICP audience growth ----------

function IcpAudienceGrowth() {
  const { data, isLoading } = useIcpAudienceGrowth();
  const { factor } = useCrossFilters();

  const chartData = useMemo(
    () =>
      data.series.map((p, i, arr) => {
        const prev = i > 0 ? arr[i - 1] : p;
        return {
          date: p.date,
          icpFollowers: scaleCount(p.icpFollowers, factor),
          totalFollowers: scaleCount(p.totalFollowers, factor),
          newIcp: scaleCount(Math.max(0, p.icpFollowers - prev.icpFollowers), factor),
        };
      }),
    [data, factor],
  );

  const chartConfig = {
    icpFollowers: { label: "ICP followers", color: "#00BFFF" },
    newIcp: { label: "New ICP on this period", color: "var(--primary)" },
    totalFollowers: { label: "Total followers combined", color: "#22C55E" },
  } satisfies ChartConfig;

  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("totalFollowers");

  const totals = useMemo(() => {
    const last = chartData[chartData.length - 1];
    return {
      icpFollowers: last?.icpFollowers ?? 0,
      totalFollowers: last?.totalFollowers ?? 0,
      newIcp: chartData.reduce((acc, p) => acc + p.newIcp, 0),
    };
  }, [chartData]);

  if (isLoading) return <Skeleton className="h-72 w-full rounded-2xl" />;

  return (
    <Card className="bg-card py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:pt-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="size-4 text-muted-foreground" />
            Followers and ICP growth
          </CardTitle>
        </div>

        <div className="flex">
          {(["icpFollowers", "newIcp", "totalFollowers"] as const).map((key) => {
            const isActive = activeChart === key;
            return (
              <button
                key={key}
                data-active={isActive}
                type="button"
                onClick={() => setActiveChart(key)}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-colors"
              >
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  {chartConfig[key].label}
                </span>
                <span
                  className="text-lg leading-none font-semibold tabular-nums sm:text-2xl"
                  style={{ color: isActive ? chartConfig[key].color : undefined }}
                >
                  <Num value={totals[key]} />
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[260px] w-full"
        >
          <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
             <defs>
    <linearGradient id="icpFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.12} />
      <stop offset="95%" stopColor="#00BFFF" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.12} />
      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
    </linearGradient>
  </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              fontSize={11}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis tickLine={false} axisLine={false} fontSize={11} width={42} />
            <ChartTooltip
              cursor={{ stroke: "var(--border)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const filtered = payload.filter((p: any) => {
                  const c = p.color;
                  return c && typeof c === "string" && !c.startsWith("url");
                });
                return (
                  <ChartTooltipContent
                    active={active}
                    payload={filtered}
                    label={label}
                    className="w-[180px]"
                    nameKey={activeChart === "totalFollowers" ? undefined : activeChart}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                );
              }}
            />
            {activeChart === "icpFollowers" && (
              <Area type="monotone" dataKey="icpFollowers" stroke="none" fill="url(#icpFill)" />
            )}
            {activeChart === "newIcp" && (
              <Area type="monotone" dataKey="newIcp" stroke="none" fill="url(#icpFill)" />
            )}
            {activeChart === "totalFollowers" && (
              <Area type="monotone" dataKey="icpFollowers" stroke="none" fill="url(#icpFill)" />
            )}
            {activeChart === "totalFollowers" && (
              <Area type="monotone" dataKey="totalFollowers" stroke="none" fill="url(#totalFill)" />
            )}
            {activeChart === "totalFollowers" && (
              <Line
                dataKey="icpFollowers"
                type="monotone"
                stroke="#00BFFF"
                strokeWidth={2}
                dot={false}
              />
            )}
            {activeChart === "totalFollowers" && (
              <Line
                dataKey="totalFollowers"
                type="monotone"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
              />
            )}
            {activeChart !== "totalFollowers" && (
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={chartConfig[activeChart].color}
                strokeWidth={2}
                dot={false}
              />
            )}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


// ---------- Section 3b: Post theme ↔ audience ----------

function PostThemeRowItem({ row }: { row: PostThemeAudienceRow }) {
  const mix = [...row.audienceMix].sort((a, b) => b.pct - a.pct);
  return (
    <div className="space-y-2 rounded-lg border border-transparent px-2 py-3 transition-colors hover:border-[var(--board-surface-border)] hover:bg-card/60">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground/90">{row.theme}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
            {row.postCount} posts · {row.totalEngaged} engaged · attracts{" "}
            <span className="font-medium text-foreground/80">{row.topAudienceLabel}</span>
          </div>
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-2 w-full cursor-default overflow-hidden rounded-full bg-muted">
            {mix.map((m) => (
              <div
                key={m.key}
                className="h-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.round(m.pct * 100)}%`,
                  background: m.isIcp ? "var(--icp-high)" : "var(--muted-foreground)",
                  opacity: m.isIcp ? 1 : 0.45,
                }}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-0.5">
            {mix.map((m) => (
              <div key={m.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      background: m.isIcp ? "var(--icp-high)" : "var(--muted-foreground)",
                      opacity: m.isIcp ? 1 : 0.5,
                    }}
                  />
                  {m.label}
                </span>
                <span className="tabular-nums">{Math.round(m.pct * 100)}%</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
        {mix.slice(0, 3).map((m) => (
          <span key={m.key} className="flex items-center gap-1">
            <span
              className="size-1.5 rounded-full"
              style={{
                background: m.isIcp ? "var(--icp-high)" : "var(--muted-foreground)",
                opacity: m.isIcp ? 1 : 0.5,
              }}
            />
            {m.label} <span className="tabular-nums">{Math.round(m.pct * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function PostThemeAudience() {
  const { data, isLoading } = usePostThemeAudience();
  if (isLoading) return <Skeleton className="h-80 w-full rounded-2xl" />;
  return (
    <Card className="bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FileText className="size-4 text-muted-foreground" />
          Which Post Type Attracts Which Audience
        </CardTitle>
        <CardDescription className="text-sm">
          Direct input for your content calendar: each theme and the persona it pulls in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="-mx-2 divide-y divide-border/60">
          {data.map((row) => (
            <PostThemeRowItem key={row.theme} row={row} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Section 3c: Warm-up velocity ----------

function WarmupVelocity() {
  const { data, isLoading } = useWarmupVelocity();
  const { factor } = useCrossFilters();

  if (isLoading) return <Skeleton className="h-24 w-full rounded-2xl" />;

  const stageMeta = [
    { key: "cold" as const, label: "❄️ Cold", count: scaleCount(data.stages.cold, factor) },
    { key: "warming" as const, label: "🌡️ Warming", count: scaleCount(data.stages.warming, factor) },
    { key: "hot" as const, label: "🔥 Hot", count: scaleCount(data.stages.hot, factor) },
  ];

  return (
    <Card className="bg-card py-0 overflow-hidden">
      <div className="flex flex-col items-stretch sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="size-4 text-muted-foreground" />
            Warm-up Velocity
          </CardTitle>
        </div>
        <div className="flex flex-1 items-stretch">
          {stageMeta.map((s) => (
            <div
              key={s.key}
              className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 sm:border-t-0 sm:border-l"
            >
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider whitespace-nowrap">
                {s.label}
              </span>
              <span className="text-lg leading-none font-semibold tabular-nums sm:text-xl text-foreground">
                <Num value={s.count} />
              </span>
            </div>
          ))}
          <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 sm:border-t-0 sm:border-l">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider whitespace-nowrap">
              From Cold to Hot
            </span>
            <span
              className="text-lg leading-none font-semibold tabular-nums sm:text-xl whitespace-nowrap"
              style={{ color: "var(--primary)" }}
            >
              Avg {data.avgDays} days
            </span>
          </div>
        </div>

      </div>
    </Card>
  );
}




// --- Helpers for High-ICP leads modal ---

type IcpLead = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  linkedinUrl: string;
};

const ICP_FIRST_NAMES = [
  "Isabela", "Rafael", "Bianca", "Thiago", "Camila", "Gustavo", "Larissa",
  "Rodrigo", "Fernanda", "Vinicius", "Beatriz", "Matheus", "Juliana",
  "Leonardo", "Renata", "Pedro", "Aline", "Diego", "Priscila", "Henrique",
];
const ICP_LAST_NAMES = [
  "Alves", "Ribeiro", "Mendes", "Cardoso", "Nogueira", "Barreto", "Machado",
  "Xavier", "Peixoto", "Antunes", "Pires", "Coelho", "Duarte", "Freitas",
  "Rangel", "Bittencourt", "Moraes", "Prado", "Sales", "Vasconcelos",
];
const ICP_ROLES = [
  "Head of Growth", "VP of Sales", "Founder & CEO", "Chief Revenue Officer",
  "Head of Marketing", "Director of Demand Gen", "Head of RevOps",
  "VP Marketing", "CMO", "Co-founder", "Head of Partnerships",
];
const ICP_COMPANIES = [
  "Northwind Labs", "Cortex AI", "Vela Systems", "Kepler Growth", "Orbit CRM",
  "Lumen.io", "Fjord Sales", "Ember Analytics", "Meridian SaaS", "Palladio",
  "Atlas Revenue", "Havoc Labs", "Signal Peak",
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type IcpLeadWithStatus = IcpLead & { alreadyConnected: boolean };

function generateIcpLeads(row: ContentRow): IcpLeadWithStatus[] {
  const count = row.highIcpEngaged;
  const seed = hashString(row.id);
  const leads: IcpLeadWithStatus[] = [];
  for (let i = 0; i < count; i++) {
    const first = ICP_FIRST_NAMES[(seed + i * 7) % ICP_FIRST_NAMES.length];
    const last = ICP_LAST_NAMES[(seed + i * 13) % ICP_LAST_NAMES.length];
    const role = ICP_ROLES[(seed + i * 5) % ICP_ROLES.length];
    const company = ICP_COMPANIES[(seed + i * 11) % ICP_COMPANIES.length];
    const slug = `${first}-${last}-${i}`.toLowerCase();
    // ~28% of leads are already in the user's LinkedIn network
    const alreadyConnected = (seed + i * 17) % 100 < 28;
    leads.push({
      id: `${row.id}-icp-${i}`,
      name: `${first} ${last}`,
      role,
      company,
      avatar: `https://i.pravatar.cc/80?u=${slug}`,
      linkedinUrl: `https://www.linkedin.com/in/${slug}`,
      alreadyConnected,
    });
  }
  return leads;
}

function IcpLeadsDialog({
  row,
  open,
  onOpenChange,
}: {
  row: ContentRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const leads = useMemo(() => (row ? generateIcpLeads(row) : []), [row]);

  const handleAdd = (lead: IcpLeadWithStatus) => {
    if (lead.alreadyConnected || added[lead.id] || hasExtraLead(lead.id)) return;
    addExtraLead({
      id: lead.id,
      name: lead.name,
      role: lead.role,
      company: lead.company,
      score: 82,
      scoreTone: "warm",
      stage: "connecting",
      tag: "Content Engagement",
      action: "Just added",
      avatarSeed: hashString(lead.id) % 1000,
      avatarUrl: lead.avatar,
      linkedinUrl: lead.linkedinUrl,
    });
    setAdded((prev) => ({ ...prev, [lead.id]: true }));
    toast.success(`${lead.name} added to your pipeline`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base">High-ICP leads attracted</DialogTitle>
          <DialogDescription className="text-xs">
            {row ? (
              <>
                {row.highIcpEngaged} high-ICP leads engaged with{" "}
                <span className="font-medium text-foreground/80">"{row.title}"</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {leads.map((lead) => {
            const isAdded = added[lead.id] || hasExtraLead(lead.id);
            const isConnected = lead.alreadyConnected;
            return (
              <div
                key={lead.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={lead.avatar} alt={lead.name} />
                  <AvatarFallback className="text-[10px]">
                    {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {lead.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {lead.role} · {lead.company}
                  </div>
                  {isConnected ? (
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Check className="size-3" />
                      Already in your LinkedIn network — no need to add again
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin />
                      Open LinkedIn
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={isConnected || isAdded}
                    onClick={() => handleAdd(lead)}
                  >
                    {isConnected ? (
                      <>
                        <Check />
                        Connected
                      </>
                    ) : isAdded ? (
                      <>
                        <Check />
                        Added
                      </>
                    ) : (
                      <>
                        <UserPlus />
                        Add to Pipeline
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ---------- Section 4: Content that attracts high-ICP ----------



function ContentTable({ rows }: { rows: ContentRow[] }) {
  const [selected, setSelected] = useState<ContentRow | null>(null);
  return (
    <>
      <IcpLeadsDialog row={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
      <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12 text-center text-[10px] uppercase tracking-wider text-muted-foreground">#</TableHead>
          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Post</TableHead>
          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Sender</TableHead>
          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Published</TableHead>
          <TableHead className="text-right text-[10px] uppercase tracking-wider text-muted-foreground">High-ICP leads</TableHead>
          <TableHead className="text-right text-[10px] uppercase tracking-wider text-muted-foreground">Total engagers</TableHead>
          <TableHead className="text-right text-[10px] uppercase tracking-wider text-muted-foreground">ICP conv. rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => {
          const date = new Date(row.publishedAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const pct = Math.round(row.highIcpPct * 100);
          const senderInitials = row.author
            .split(/\s+/)
            .map((s) => s[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <TableRow key={row.id} className="group">
              <TableCell className="text-center text-sm font-semibold tabular-nums text-muted-foreground">
                {i + 1}
              </TableCell>
              <TableCell className="max-w-[280px]">
                <HoverCard openDelay={120}>
                  <HoverCardTrigger asChild>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link block min-w-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground/90 group-hover/link:text-foreground group-hover/link:underline">
                          {row.title}
                        </span>
                        <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{row.excerpt}</div>
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="start" className="w-80">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                        <FileText className="size-3" />
                        LinkedIn post · {row.author}
                      </div>
                      <div className="text-sm font-semibold leading-snug">{row.title}</div>
                      <p className="text-xs text-muted-foreground">{row.excerpt}</p>
                      <Separator />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Published</span>
                        <span className="tabular-nums">{date}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">High-ICP engaged</span>
                        <span className="font-semibold tabular-nums" style={{ color: "var(--icp-high)" }}>
                          {row.highIcpEngaged} / {row.totalEngaged}
                        </span>
                      </div>
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-foreground hover:underline"
                      >
                        Open post on LinkedIn
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={row.authorAvatar} alt={row.author} />
                    <AvatarFallback className="text-[10px]">{senderInitials || "—"}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs text-foreground/80">{row.author}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                {date}
              </TableCell>
              <TableCell className="text-right">
                <button
                  type="button"
                  onClick={() => setSelected(row)}
                  className="ml-auto inline-flex items-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums transition-colors hover:bg-[color-mix(in_oklch,var(--icp-high)_15%,transparent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--icp-high)]/40"
                  style={{ color: "var(--icp-high)" }}
                  aria-label={`See ${row.highIcpEngaged} high-ICP leads`}
                >
                  <Num value={row.highIcpEngaged} />
                </button>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm font-semibold tabular-nums text-foreground"><Num value={row.totalEngaged} /></div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm font-semibold tabular-nums text-foreground">{pct}%</div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </>
  );
}


function ContentByIcp() {
  const { sender, factor } = useCrossFilters();
  const { data, isLoading } = useTopContentByIcpEngagement(undefined, 10);

  if (isLoading) return <Skeleton className="h-72 w-full rounded-2xl" />;

  const filtered = sender === "all" ? data : data.filter((r) => r.author === sender);
  const rows: ContentRow[] = filtered.map((r) => ({
    ...r,
    highIcpEngaged: scaleCount(r.highIcpEngaged, factor),
    totalEngaged: scaleCount(r.totalEngaged, factor),
  }));

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="size-4 text-muted-foreground" />
          Content That Attracts High-ICP Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {rows.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyHint>{NO_DATA}</EmptyHint>
          </div>
        ) : (
          <ContentTable rows={rows} />
        )}
      </CardContent>
    </Card>
  );
}


// ---------- Section 4b: Top engagers of the period ----------

type TopEngager = {
  id: string;
  name: string;
  headline: string;
  signal: string;
  signalTone: "hot" | "warm" | "cool";
  linkedinSlug: string;
  avatar: string;
  highIcp: boolean;
  inbound: boolean;
};

const TOP_ENGAGERS: TopEngager[] = [
  { id: "e1", name: "Daniel Victorino", headline: "Co-founder & CEO at Galaxies | AI | M&L | Data | Tech | Pr…", signal: "\"Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "danielvictorino", avatar: "https://i.pravatar.cc/80?u=daniel-victorino", highIcp: true, inbound: true },
  { id: "e2", name: "Rafael Alvares", headline: "Technology Executive | Head of Engineering | Governan…", signal: "\"Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "rafael-alvares", avatar: "https://i.pravatar.cc/80?u=rafael-alvares", highIcp: true, inbound: true },
  { id: "e3", name: "Italo Castro", headline: "AWS Certified | Full Stack Developer (Java, Node.js & Rea…", signal: "\"Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "italo-castro", avatar: "https://i.pravatar.cc/80?u=italo-castro", highIcp: true, inbound: true },
  { id: "e4", name: "Leonardo Zambelli", headline: "CFG | Expanding the capital markets under B… regulation", signal: "\"Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "leonardozamb", avatar: "https://i.pravatar.cc/80?u=leo-zambelli", highIcp: true, inbound: true },
  { id: "e5", name: "Anderson Antunes", headline: "Senior Software Engineer | Backend, Distributed Systems |…", signal: "\"Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "whereisanzi", avatar: "https://i.pravatar.cc/80?u=anderson-a", highIcp: true, inbound: true },
  { id: "e6", name: "Fernando Ribeiro", headline: "Sr. Software Developer Manager @ Adobe | Leading Dev…", signal: "\"[…] Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "fernandohr", avatar: "https://i.pravatar.cc/80?u=fernando-r", highIcp: true, inbound: true },
  { id: "e7", name: "Alan Alves", headline: "Building AI Agents | CTO at VIK", signal: "\"Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "alanalvestech", avatar: "https://i.pravatar.cc/80?u=alan-alves", highIcp: true, inbound: true },
  { id: "e8", name: "Rodrigo Ferreira", headline: "Chief Commercial Officer", signal: "\"Want to know more.\" (direct intent)", signalTone: "hot", linkedinSlug: "rodrigo-tav-fer", avatar: "https://i.pravatar.cc/80?u=rodrigo-f", highIcp: true, inbound: true },
  { id: "e9", name: "Douglas L. Nico", headline: "Founder and CEO @ Incentiv.me", signal: "Decision-maker, founder", signalTone: "warm", linkedinSlug: "douglaslnico", avatar: "https://i.pravatar.cc/80?u=douglas-lnico", highIcp: true, inbound: false },
  { id: "e10", name: "Rafael Moret", headline: "CEO at Noris / Iriun", signal: "C-level decision-maker", signalTone: "warm", linkedinSlug: "rafamoret", avatar: "https://i.pravatar.cc/80?u=rafa-moret", highIcp: true, inbound: false },
  { id: "e11", name: "Wilian Luis Dias", headline: "CIO & Digital Transformation Executive | AI-driven efficie…", signal: "Decision-maker, focused on AI/efficiency", signalTone: "warm", linkedinSlug: "wdom", avatar: "https://i.pravatar.cc/80?u=wilian-luis", highIcp: true, inbound: false },
  { id: "e12", name: "Charles Schweitzer", headline: "Director of Technological Innovation | Digital Products", signal: "Decision-maker, long engaged comment", signalTone: "warm", linkedinSlug: "charles-schwei", avatar: "https://i.pravatar.cc/80?u=charles-sch", highIcp: true, inbound: false },
  { id: "e13", name: "Andrey Luiz", headline: "Leader in Data & Analytics | Strategy and Innovation", signal: "High-level analytical comment", signalTone: "cool", linkedinSlug: "o-lino", avatar: "https://i.pravatar.cc/80?u=andrey-luiz", highIcp: false, inbound: false },
  { id: "e14", name: "Francisco Daniel", headline: "Technical lead in data science", signal: "Technical lead, strong opinion", signalTone: "cool", linkedinSlug: "francisco-dani", avatar: "https://i.pravatar.cc/80?u=francisco-d", highIcp: false, inbound: false },
  { id: "e15", name: "Lazaro da Silva", headline: "Senior Manager | MBA Production Eng.", signal: "Manager, reflective comment", signalTone: "cool", linkedinSlug: "lazarodasilva", avatar: "https://i.pravatar.cc/80?u=lazaro-s", highIcp: false, inbound: false },
];

function TopEngagers() {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Flame className="size-4 text-muted-foreground" />
          Top engagers of the period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table */}
        <div className="-mx-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-[10px] uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Headline</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Hot signal</TableHead>
                <TableHead className="pr-6 text-[10px] uppercase tracking-wider text-muted-foreground">LinkedIn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_ENGAGERS.map((lead) => (
                <TableRow key={lead.id} className="border-border/60">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={lead.avatar} alt={lead.name} />
                        <AvatarFallback className="text-[10px]">
                          {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{lead.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[360px]">
                    <span className="block truncate text-sm text-muted-foreground">{lead.headline}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-foreground/90">
                      {lead.signalTone === "hot" ? (
                        <Flame className="size-3.5 shrink-0" style={{ color: "var(--icp-high)" }} />
                      ) : null}
                      <span className="truncate">{lead.signal}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <a
                      href={`https://www.linkedin.com/in/${lead.linkedinSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      /{lead.linkedinSlug}
                      <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}




function AttributionLeadRow({ lead }: { lead: AttributionLead }) {
  const isCustomer = lead.outcome === "customer";
  const date = new Date(lead.outcomeAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const touches = [...lead.touches].sort((a, b) => b.daysBeforeOutcome - a.daysBeforeOutcome);
  return (
    <div className="rounded-lg border border-transparent px-2 py-3 transition-colors hover:border-[var(--board-surface-border)] hover:bg-card/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground/90">{lead.name}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {lead.role} · {lead.company}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
            {isCustomer ? "Closed" : "Meeting booked"} · {date}
            {isCustomer && lead.dealValue ? ` · $${lead.dealValue.toLocaleString()}` : ""} ·{" "}
            {lead.touches.length} touch{lead.touches.length === 1 ? "" : "es"}
          </div>
        </div>
        <Badge
          variant="secondary"
          className="border-0 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: isCustomer
              ? "color-mix(in oklab, var(--icp-high) 18%, transparent)"
              : "color-mix(in oklab, var(--primary) 18%, transparent)",
            color: isCustomer ? "var(--icp-high)" : "var(--primary)",
          }}
        >
          {isCustomer ? "Customer" : "Meeting"}
        </Badge>
      </div>

      {/* Touch chain */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {touches.map((t, i) => (
          <div key={`${t.postId}-${i}`} className="flex items-center gap-1.5">
            <HoverCard openDelay={120}>
              <HoverCardTrigger asChild>
                <a
                  href={t.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/touch inline-flex max-w-[220px] items-center gap-1.5 rounded-md border border-[var(--board-surface-border)] bg-[var(--board-surface)] px-2 py-1 text-[11px] transition-colors hover:border-[var(--primary)]"
                >
                  <FileText className="size-3 shrink-0" style={{ color: "var(--icp-high)" }} />
                  <span className="truncate text-foreground/90 group-hover/touch:text-foreground">{t.postTitle}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">−{t.daysBeforeOutcome}d</span>
                </a>
              </HoverCardTrigger>
              <HoverCardContent side="top" align="start" className="w-72">
                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.type} · {t.daysBeforeOutcome}d before {isCustomer ? "close" : "meeting"}
                  </div>
                  <div className="text-sm font-semibold leading-snug">{t.postTitle}</div>
                  <a
                    href={t.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
                  >
                    Open post on LinkedIn
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </HoverCardContent>
            </HoverCard>
            {i < touches.length - 1 && (
              <span className="text-muted-foreground/60" aria-hidden>
                →
              </span>
            )}
          </div>
        ))}
        <span className="text-muted-foreground/60" aria-hidden>→</span>
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold"
          style={{
            background: isCustomer
              ? "color-mix(in oklab, var(--icp-high) 14%, transparent)"
              : "color-mix(in oklab, var(--primary) 14%, transparent)",
            color: isCustomer ? "var(--icp-high)" : "var(--primary)",
          }}
        >
          {isCustomer ? "Closed" : "Meeting"}
        </span>
      </div>
    </div>
  );
}

function ContentAttribution() {
  const { data, isLoading } = useContentAttribution();

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  const { leads } = data;

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Target className="size-4 text-muted-foreground" />
            Content Attribution: Posts → Meetings & Customers
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            The posts each lead engaged with before booking a meeting or closing. This is the ROI story for the board.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Lead journeys */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Recent lead journeys</div>
          <div className="-mx-2 divide-y divide-border/60">
            {leads.map((lead) => (
              <AttributionLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Tab root ----------

export function Cross() {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-8">
        {/* Section 0 — header note */}
        <p className="text-xs italic text-muted-foreground">
          Where inbound meets outbound: content's impact on prospecting (all-time, ignores the period filter).
        </p>

        {/* Section 1 — Warm-up velocity */}
        <SectionShell>
          <WarmupVelocity />
        </SectionShell>

        {/* Section 2 — Audience composition / ICP fit proof */}
        <SectionShell delay={40}>
          <AudienceComposition />
        </SectionShell>

        {/* Section 3 — Audience growth (full width) */}
        <SectionShell delay={80}>
          <IcpAudienceGrowth />
        </SectionShell>

        {/* Section 4 — Content that attracts high-ICP */}
        <SectionShell delay={120}>
          <ContentByIcp />
        </SectionShell>

        {/* Section 4b — Top engagers of the period */}
        <SectionShell delay={160}>
          <TopEngagers />
        </SectionShell>
      </div>
    </TooltipProvider>
  );
}
