import { createFileRoute } from "@tanstack/react-router";
import { Clock, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TIMEZONES } from "@/lib/settings-store";
import {
  Section,
  SettingsShell,
  StatusBadge,
  useSettingsData,
} from "@/components/settings/shell";

export const Route = createFileRoute("/settings/general")({
  head: () => ({
    meta: [
      { title: "General settings — Isla" },
      {
        name: "description",
        content: "Language, timezone and automation limits for your Isla workspace.",
      },
      { property: "og:title", content: "General settings — Isla" },
      {
        property: "og:description",
        content: "Language, timezone and automation limits in Isla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GeneralSettingsPage,
});


const RECOMMENDED_CONNECTIONS = 20;
const SAFE_CONNECTIONS_CEILING = 25;
const MAX_SAFE_CONNECTIONS = 30;

function GeneralSettingsPage() {
  const { data, update } = useSettingsData();
  const limit = data?.dailyConnectionLimit ?? RECOMMENDED_CONNECTIONS;
  const limitTone: "low" | "safe" | "high" =
    limit > SAFE_CONNECTIONS_CEILING ? "high" : limit < 10 ? "low" : "safe";


  return (
    <SettingsShell
      title="General"
      subtitle="Language, timezone and automation limits."
    >

      {!data ? (
        <div className="h-40 rounded-xl border border-border/70 bg-card/40" />
      ) : (
        <>
          <Section
            title="Language"
            subtitle="Interface and email language for everyone in this workspace."
            icon={<Languages className="size-4" />}
          >
            <div className="px-5 py-5">
              <div className="inline-flex rounded-lg border border-border/70 p-1">
                {(
                  [
                    { v: "en", label: "English" },
                    { v: "pt", label: "Português" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => update("language", opt.v)}
                    className={cn(
                      "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
                      data.language === opt.v
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>


          <Section
            title="Automation"
            subtitle="Timezone and daily limits for the automatic workflow."
            icon={<Clock className="size-4" />}
          >
            <div className="grid grid-cols-1 gap-6 px-5 py-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Timezone</Label>
                <Select value={data.timezone} onValueChange={(v) => update("timezone", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Isla spreads actions through your working hours in this timezone, so activity
                  looks human.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Daily connection requests</Label>
                  <StatusBadge tone={limitTone === "safe" ? "done" : "pending"}>
                    {limitTone === "safe"
                      ? "Safe range"
                      : limitTone === "low"
                        ? "Very conservative"
                        : "Above safe limit"}
                  </StatusBadge>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={MAX_SAFE_CONNECTIONS}
                  value={data.dailyConnectionLimit}
                  onChange={(e) =>
                    update(
                      "dailyConnectionLimit",
                      Math.min(MAX_SAFE_CONNECTIONS, Math.max(0, Number(e.target.value) || 0)),
                    )
                  }
                />
                <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5">
                  <p className="text-[11px] font-medium text-foreground">
                    Recommended: {RECOMMENDED_CONNECTIONS} per day · Hard cap:{" "}
                    {MAX_SAFE_CONNECTIONS} per day
                  </p>
                  <ul className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                    <li>
                      LinkedIn restricts accounts that send too many invites. Isla never goes
                      above {MAX_SAFE_CONNECTIONS} per day to protect your account.
                    </li>
                    <li>
                      New or low-activity accounts should stay between 10 and 15 for the first
                      two weeks, then increase gradually.
                    </li>
                    <li>0 pauses automatic connection requests entirely.</li>
                  </ul>
                </div>
                {limitTone === "high" && (
                  <p className="text-[11px] text-red-500">
                    Above {SAFE_CONNECTIONS_CEILING} per day increases the risk of a LinkedIn
                    restriction.
                  </p>
                )}
              </div>
            </div>
          </Section>

        </>
      )}
    </SettingsShell>
  );
}
