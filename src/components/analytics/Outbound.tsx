import { Users, UserCheck, MessageSquare, CalendarCheck, TrendingUp, DollarSign, ArrowDown, AlertTriangle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KpiCard, Panel } from "./shared";
import { outboundFunnel, outboundKpis, weeklyLeadsVsCalls } from "@/lib/analytics-data";

export function Outbound() {
  // compute step-to-step conversion + biggest bottleneck
  const transitions = outboundFunnel.slice(1).map((s, i) => {
    const prev = outboundFunnel[i];
    const pct = prev.value === 0 ? 0 : Math.round((s.value / prev.value) * 100);
    return { from: prev.label, to: s.label, pct };
  });
  const bottleneck = transitions.reduce((min, t) => (t.pct < min.pct ? t : min), transitions[0]);

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label="Prospected" value={outboundKpis.prospected} hint="invites sent in the period" icon={<Users className="size-4" />} />
        <KpiCard label="Invites Accepted" value={outboundKpis.invitesAccepted} hint={`${outboundKpis.acceptRate}% accept rate`} icon={<UserCheck className="size-4" />} />
        <KpiCard label="Reply Rate" value={`${outboundKpis.replyRate}%`} hint="replies ÷ reach outs" icon={<MessageSquare className="size-4" />} glow="cyan" />
        <KpiCard label="Calls Booked" value={outboundKpis.callsBooked} icon={<CalendarCheck className="size-4" />} />
        <KpiCard label="Paid Users" value={outboundKpis.paidUsers} icon={<TrendingUp className="size-4" />} />
        <KpiCard label="Total MRR" value={`$${outboundKpis.mrr.toLocaleString()}`} hint="USD/mo" icon={<DollarSign className="size-4 text-[color:var(--emerald)]" />} glow="emerald" />
      </div>

      {/* Funnel + bottleneck */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Conversion Funnel">
          <ol className="space-y-1">
            {outboundFunnel.map((stage, i) => {
              const max = outboundFunnel[0].value;
              const width = `${Math.max(4, (stage.value / max) * 100)}%`;
              const transition = i > 0 ? transitions[i - 1] : null;
              return (
                <li key={stage.key}>
                  {transition && (
                    <div className="flex items-center gap-2 py-1 pl-[35%] text-xs text-muted-foreground">
                      <ArrowDown className="size-3" />
                      <span>{transition.pct}% conversion</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[110px_1fr_56px] items-center gap-3">
                    <span className="text-sm text-foreground/85">{stage.label}</span>
                    <div className="h-2.5 rounded-full bg-secondary/60">
                      <div
                        className="h-full rounded-full"
                        style={{ width, background: stage.color }}
                      />
                    </div>
                    <span className="text-right text-sm font-medium tabular-nums">{stage.value}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        <div className="space-y-4">
          <Panel title="Biggest Bottleneck" glow="emerald">
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <AlertTriangle className="size-4 text-[color:var(--amber)]" />
              <span>{bottleneck.from} → {bottleneck.to}</span>
            </div>
            <div className="mt-3 text-4xl font-semibold tracking-tight">{bottleneck.pct}%</div>
            <div className="text-xs text-muted-foreground">conversion at this step</div>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-[color:var(--amber)]">
              <ArrowDown className="size-3" /> 8% vs last month
            </div>
          </Panel>

          <Panel title="Weekly — Leads added vs Calls">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyLeadsVsCalls} margin={{ top: 4, left: -16, right: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g_leads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="var(--cyan)" fill="url(#g_leads)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
