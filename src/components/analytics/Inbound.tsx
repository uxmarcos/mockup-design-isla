import { FileText, Eye, Heart, UserPlus, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KpiCard, Panel } from "./shared";
import { followerGrowth, inboundKpis, topPosts } from "@/lib/analytics-data";

export function Inbound() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Posts" value={inboundKpis.posts} icon={<FileText className="size-4" />} />
        <KpiCard label="Impressions" value={inboundKpis.impressions.toLocaleString("de-DE")} hint="sum across posts" icon={<Eye className="size-4" />} />
        <KpiCard label="Engagement" value={inboundKpis.engagement} hint="reactions + comments + reposts" icon={<Heart className="size-4" />} />
        <KpiCard label="New Followers" value={`+${inboundKpis.newFollowers.toLocaleString()}`} icon={<UserPlus className="size-4" />} />
        <KpiCard label="Avg Engagement Rate" value={`${inboundKpis.avgEngagementRate}%`} icon={<Sparkles className="size-4 text-[color:var(--cyan)]" />} glow="cyan" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Follower Growth">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={followerGrowth} margin={{ top: 4, left: -10, right: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="g_fol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="followers" stroke="var(--cyan)" fill="url(#g_fol)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top Posts">
          <ul className="divide-y divide-border">
            {topPosts.map((p) => (
              <li key={p.title} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-2 text-sm text-foreground/90">{p.title}</p>
                  <div className="shrink-0 rounded-md bg-secondary/70 px-2 py-0.5 text-xs font-medium text-[color:var(--cyan)]">
                    {p.engagementRate.toFixed(2)}%
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span><Eye className="mr-1 inline size-3" />{p.impressions.toLocaleString()}</span>
                  <span><Heart className="mr-1 inline size-3" />{p.reactions}</span>
                  <span>💬 {p.comments}</span>
                  <span>🔁 {p.reposts}</span>
                  {p.engagedProspects != null && (
                    <span className="text-[color:var(--emerald)]">→ {p.engagedProspects} engaged prospects</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
