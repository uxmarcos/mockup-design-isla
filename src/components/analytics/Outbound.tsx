import { Clock, Flame, Send, Snowflake, Thermometer, UserCheck, ClipboardList } from "lucide-react";
import { OUTBOUND } from "@/lib/analytics-screens-data";
import { StatCard } from "./Inbound";

export function Outbound({ factor, sender }: { factor: number; sender: string }) {
  const share = sender === "all" ? 1 : 0.18;
  const scale = (n: number) => Math.round(n * factor * share);
  const first = scale(OUTBOUND.funnel[0]!.value) || 1;

  const warm = [
    { key: "cold", label: "Cold", value: scale(OUTBOUND.warmup.cold), icon: <Snowflake className="size-3 text-sky-400" /> },
    { key: "warming", label: "Warming", value: scale(OUTBOUND.warmup.warming), icon: <Thermometer className="size-3 text-amber-400" /> },
    { key: "hot", label: "Hot", value: scale(OUTBOUND.warmup.hot), icon: <Flame className="size-3 text-orange-500" /> },
  ];

  return (
    <div className="space-y-5">
      <section className="flex flex-col items-stretch overflow-hidden rounded-2xl border border-border bg-card sm:flex-row">
        <div className="flex flex-1 items-center gap-2 px-6 py-5">
          <Clock className="size-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Warm-up</h3>
        </div>
        <div className="flex items-stretch">
          {warm.map((w) => (
            <div
              key={w.key}
              className="flex min-w-[88px] flex-col justify-center gap-1 border-t border-border px-5 py-3 sm:border-l sm:border-t-0"
            >
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {w.icon}
                {w.label}
              </span>
              <span className="text-2xl font-semibold leading-none">{w.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total leads" value={scale(OUTBOUND.kpis.totalLeads).toLocaleString("en-US")} icon={<ClipboardList className="size-3.5" />} />
        <StatCard label="Invites sent" value={scale(OUTBOUND.kpis.invitesSent).toLocaleString("en-US")} icon={<Send className="size-3.5" />} />
        <StatCard label="Invites accepted" value={scale(OUTBOUND.kpis.invitesAccepted).toLocaleString("en-US")} icon={<UserCheck className="size-3.5" />} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.08em]">Conversion funnel</h3>
        <ol className="space-y-3.5">
          {OUTBOUND.funnel.map((stage) => {
            const value = scale(stage.value);
            const width = `${Math.max(4, (value / first) * 100)}%`;
            return (
              <li key={stage.key} className="grid grid-cols-[112px_minmax(0,1fr)_52px] items-center gap-x-3">
                <span className="text-xs font-semibold">{stage.label}</span>
                <div className="h-[22px] rounded-full bg-secondary/50">
                  <div className="h-full rounded-full" style={{ width, background: stage.color }} />
                </div>
                <span className="text-right text-sm font-medium tabular-nums">{value}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
