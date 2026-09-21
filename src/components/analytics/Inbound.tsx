import { useMemo } from "react";
import { Eye, FileText, Heart, Target, UserPlus, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { personAvatar } from "@/lib/avatars";
import {
  FOLLOWERS,
  FOLLOWER_SERIES,
  INBOUND_KPIS,
  TOP_POSTS,
} from "@/lib/analytics-screens-data";

const ICP_COLOR = "#22A6F2";
const TOTAL_COLOR = "#22C55E";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </div>
        <div className="grid size-7 place-items-center rounded-lg border border-border bg-background/60 text-foreground/80">
          {icon}
        </div>
      </div>
      <div className="mt-5 flex items-end gap-2">
        <div className="text-[34px] font-semibold leading-none tracking-tight">{value}</div>
        {hint && <div className="max-w-[170px] pb-0.5 text-xs leading-tight text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}

function stepFor(max: number, unit: number) {
  return Math.max(unit, Math.ceil(max / 4 / unit) * unit);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Inbound({
  factor,
  sender,
  windowDays,
}: {
  factor: number;
  sender: string;
  /** How many of the latest days the chart covers; null = the whole history. */
  windowDays: number | null;
}) {
  const share = sender === "all" ? 1 : 0.18;
  const scale = (n: number) => Math.round(n * factor * share);

  const series = useMemo(() => {
    const cut = windowDays ? FOLLOWER_SERIES.slice(-windowDays) : FOLLOWER_SERIES;
    return cut.map((p, i) => ({ ...p, i, total: Math.round(p.total * share), icp: Math.round(p.icp * share) }));
  }, [windowDays, share]);

  const last = series[series.length - 1]!;
  const leftStep = stepFor(Math.max(...series.map((p) => p.total)), 500);
  const rightStep = stepFor(Math.max(...series.map((p) => p.icp)), 50);
  const leftTicks = [0, 1, 2, 3, 4].map((i) => i * leftStep);
  const rightTicks = [0, 1, 2, 3, 4].map((i) => i * rightStep);
  const xTicks = useMemo(() => {
    const n = series.length;
    const count = Math.min(17, Math.max(2, Math.round(n / 5)));
    return Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / Math.max(1, count - 1)));
  }, [series]);

  const rows = TOP_POSTS.filter((p) => sender === "all" || p.sender === sender);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Posts" value={scale(INBOUND_KPIS.posts).toLocaleString("en-US")} icon={<FileText className="size-3.5" />} />
        <StatCard
          label="Impressions"
          value={scale(INBOUND_KPIS.impressions).toLocaleString("en-US")}
          hint="sum across posts in the period"
          icon={<Eye className="size-3.5" />}
        />
        <StatCard
          label="Engagement"
          value={scale(INBOUND_KPIS.engagement).toLocaleString("en-US")}
          hint="reactions + comments + reposts"
          icon={<Heart className="size-3.5" />}
        />
        <StatCard
          label="New Followers"
          value={`+${scale(INBOUND_KPIS.newFollowers).toLocaleString("en-US")}`}
          icon={<UserPlus className="size-3.5" />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col items-stretch border-b border-border sm:flex-row">
          <div className="flex flex-1 items-center gap-2 px-6 py-5">
            <Users className="size-4 text-muted-foreground" />
            <h3 className="text-[15px] font-semibold">Followers and ICP growth</h3>
          </div>
          <div className="flex items-stretch">
            <div className="flex min-w-[170px] flex-col justify-center gap-1 border-t border-border px-8 py-4 sm:border-l sm:border-t-0">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">ICP followers</span>
              <span className="text-[26px] font-semibold leading-none" style={{ color: ICP_COLOR }}>
                {last.icp.toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex min-w-[260px] flex-col justify-center gap-1 border-t border-border px-8 py-4 sm:border-l sm:border-t-0">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                Total followers combined
              </span>
              <span className="text-[26px] font-semibold leading-none" style={{ color: TOTAL_COLOR }}>
                {last.total.toLocaleString("en-US")}
              </span>
            </div>
          </div>
        </div>
        <div className="h-[260px] px-3 pb-3 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, left: 0, right: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fill_total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TOTAL_COLOR} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={TOTAL_COLOR} stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="fill_icp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="i"
                type="number"
                domain={[0, series.length - 1]}
                ticks={xTicks}
                tickFormatter={(i: number) => series[i]?.label ?? ""}
                interval={0}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                padding={{ left: 8, right: 8 }}
              />
              <YAxis
                yAxisId="left"
                ticks={leftTicks}
                domain={[0, leftStep * 4]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                ticks={rightTicks}
                domain={[0, rightStep * 4]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "var(--muted-foreground)" }}
                labelFormatter={(i: number) => series[i]?.label ?? ""}
                formatter={(v: number, name: string) => [v.toLocaleString("en-US"), name === "icp" ? "ICP followers" : "Total followers"]}
              />
              <Area yAxisId="right" type="monotone" dataKey="icp" stroke={ICP_COLOR} strokeWidth={1.6} fill="url(#fill_icp)" dot={false} />
              <Area yAxisId="left" type="stepAfter" dataKey="total" stroke={TOTAL_COLOR} strokeWidth={1.6} fill="url(#fill_total)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <Target className="size-4 text-muted-foreground" />
          <h3 className="text-[15px] font-semibold">Posts that attract ICP leads</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[32px_minmax(0,1fr)_190px_150px_120px_130px_130px] items-center gap-x-3 border-b border-border px-6 py-3 text-sm text-muted-foreground">
              <span>#</span>
              <span>Post</span>
              <span>Sender</span>
              <span>Published</span>
              <span className="text-right">High-ICP leads</span>
              <span className="text-right">Total engagers</span>
              <span className="text-right">ICP conv. rate</span>
            </div>
            {rows.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">No posts for this profile yet.</p>
            ) : (
              rows.map((p, i) => (
                <div
                  key={p.title}
                  className="grid grid-cols-[32px_minmax(0,1fr)_190px_150px_120px_130px_130px] items-center gap-x-3 border-b border-border px-6 py-5 last:border-b-0"
                >
                  <span className="text-sm text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.excerpt}</p>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="size-5 shrink-0">
                      <AvatarImage src={personAvatar(p.sender)} alt={p.sender} />
                      <AvatarFallback className="text-[8px] font-bold">{initials(p.sender)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm">{p.sender}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{p.published}</span>
                  <span className="text-right text-sm font-semibold" style={{ color: ICP_COLOR }}>
                    {p.highIcpLeads}
                  </span>
                  <span className="text-right text-sm">{p.totalEngagers}</span>
                  <span className="text-right text-sm">
                    {Math.round((p.highIcpLeads / p.totalEngagers) * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
