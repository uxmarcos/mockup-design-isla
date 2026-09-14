import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crosshair, Users, Lightbulb, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  loadSettings,
  saveSettings,
  type SettingsData,
  type MonitoredProfile,
} from "@/lib/settings-store";
import {
  ICP_COMPANY_SIZE_OPTIONS,
  ICP_INDUSTRY_OPTIONS,
  ICP_LOCATION_OPTIONS,
} from "@/lib/onboarding-store";
import {
  MAX_COMPETITORS,
  MAX_INFLUENCERS,
  ProfileListSection,
  Section,
  SettingsShell,
  StatusBadge,
} from "@/components/settings/shell";
import {
  AddChipButton,
  DropdownChipPicker,
  SelectedChip,
} from "@/components/icp/pickers";

export const Route = createFileRoute("/settings/target-audience")({
  head: () => ({
    meta: [
      { title: "Target Audience — Isla settings" },
      {
        name: "description",
        content:
          "Define who lands on your Board: ideal customer profile, competitors and tracked LinkedIn profiles.",
      },
      { property: "og:title", content: "Target Audience — Isla settings" },
      {
        property: "og:description",
        content: "Tune your ICP, competitors and monitored profiles in Isla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TargetAudiencePage,
});

const SECTION_LABEL =
  "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

function TargetAudiencePage() {
  const [draft, setDraft] = useState<SettingsData | null>(null);
  const [saved, setSaved] = useState<SettingsData | null>(null);

  // Load the saved settings into an editable draft once hydrated.
  useEffect(() => {
    const loaded = loadSettings();
    setSaved(loaded);
    setDraft(loaded);
  }, []);

  const set = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const toggle = (key: "icpIndustries" | "icpLocations" | "icpPersonas" | "icpCompanySizes" | "icpSeniorities", v: string) =>
    setDraft((d) => {
      if (!d) return d;
      const list = d[key];
      return { ...d, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    });

  const add = (key: "icpLocations" | "icpPersonas" | "icpSeniorities", v: string) =>
    setDraft((d) => {
      if (!d) return d;
      const list = d[key];
      if (list.includes(v)) return d;
      return { ...d, [key]: [...list, v] };
    });

  const save = () => {
    if (!draft) return;
    saveSettings(draft);
    setSaved(draft);
    toast.success("Target audience saved");
  };

  const cancel = () => {
    setDraft(saved);
    toast.message("Changes discarded");
  };

  const icpConfigured =
    (draft?.icpPersonas.length ?? 0) > 0 && (draft?.icpIndustries.length ?? 0) > 0;

  return (
    <SettingsShell
      wide
      title="Target Audience"
      subtitle="Define who lands on your Board: ICP, competitors and tracked profiles."
      actions={
        draft ? (
          <>
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button onClick={save} className="bg-[#00BFFF] text-white hover:bg-[#00BFFF]/90">
              Save
            </Button>
          </>
        ) : null
      }
    >
      {!draft ? (
        <div className="h-64 rounded-xl border border-border/70 bg-card/40" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* ---------- ICP ---------- */}
          <div className="lg:col-span-3">
            <Section
              title="Ideal Customer Profile (ICP)"
              subtitle="Isla scores everyone who engages with monitored posts against these criteria."
              icon={<Crosshair className="size-4" />}
              status={
                <StatusBadge tone={icpConfigured ? "done" : "pending"}>
                  {icpConfigured ? "Configured" : "Incomplete"}
                </StatusBadge>
              }
            >
              <div className="space-y-6 px-5 py-5">
                <div className="space-y-2">
                  <Label className={SECTION_LABEL}>Role</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {draft.icpPersonas.map((v) => (
                      <SelectedChip key={v} label={v} onRemove={() => toggle("icpPersonas", v)} />
                    ))}
                    {draft.icpPersonas.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No role selected yet.
                      </span>
                    )}
                    <AddChipButton
                      placeholder="new role..."
                      onAdd={(v) => add("icpPersonas", v)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={SECTION_LABEL}>Seniority</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {draft.icpSeniorities.map((v) => (
                      <SelectedChip
                        key={v}
                        label={v}
                        onRemove={() => toggle("icpSeniorities", v)}
                      />
                    ))}
                    {draft.icpSeniorities.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No seniority selected yet.
                      </span>
                    )}
                    <AddChipButton
                      placeholder="e.g.: junior..."
                      onAdd={(v) => add("icpSeniorities", v)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={SECTION_LABEL}>Industry</Label>
                  <DropdownChipPicker
                    options={Array.from(
                      new Set([...draft.icpIndustries, ...ICP_INDUSTRY_OPTIONS]),
                    )}
                    values={draft.icpIndustries}
                    onToggle={(v) => toggle("icpIndustries", v)}
                    triggerLabel="Industry"
                    searchPlaceholder="Search industries"
                    emptyLabel="No industry selected yet."
                  />
                </div>

                <div className="space-y-2">
                  <Label className={SECTION_LABEL}>Location</Label>
                  <DropdownChipPicker
                    options={Array.from(
                      new Set([...draft.icpLocations, ...ICP_LOCATION_OPTIONS]),
                    )}
                    values={draft.icpLocations}
                    onToggle={(v) => toggle("icpLocations", v)}
                    triggerLabel="Location"
                    searchPlaceholder="Search locations"
                    emptyLabel="No location selected yet."
                  />
                </div>

                <div className="space-y-2">
                  <Label className={SECTION_LABEL}>Company size (employees)</Label>
                  <DropdownChipPicker
                    options={ICP_COMPANY_SIZE_OPTIONS}
                    values={draft.icpCompanySizes}
                    onToggle={(v) => toggle("icpCompanySizes", v)}
                    triggerLabel="Company size"
                    emptyLabel="No company size selected yet."
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className={SECTION_LABEL}>Fit signals</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="fit-include"
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="size-1.5 rounded-full bg-emerald-500" /> Include if
                      </Label>
                      <Textarea
                        id="fit-include"
                        rows={4}
                        value={draft.icpFitInclude}
                        onChange={(e) => set("icpFitInclude", e.target.value)}
                        className="resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="fit-exclude"
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="size-1.5 rounded-full bg-red-500" /> Exclude if
                      </Label>
                      <Textarea
                        id="fit-exclude"
                        rows={4}
                        value={draft.icpFitExclude}
                        onChange={(e) => set("icpFitExclude", e.target.value)}
                        className="resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="icp-observation" className={SECTION_LABEL}>
                    Observation
                  </Label>
                  <Textarea
                    id="icp-observation"
                    rows={4}
                    value={draft.icpDescription}
                    onChange={(e) => set("icpDescription", e.target.value)}
                    placeholder="Anything else Isla should know about your best-fit accounts."
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            </Section>
          </div>

          {/* ---------- Right column ---------- */}
          <div className="space-y-4 lg:col-span-2">
            <ProfileListSection
              id="competitors"
              title="Competitors"
              subtitle="Isla finds leads among the people who interact with their posts."
              icon={<Users className="size-4" />}
              emptyMessage="No competitors yet. Add at least one LinkedIn profile."
              placeholder="Competitor LinkedIn profile URL"
              max={MAX_COMPETITORS}
              profiles={draft.competitors}
              onChange={(next: MonitoredProfile[]) => set("competitors", next)}
              status={
                draft.competitors.length === 0 ? (
                  <StatusBadge tone="pending">Add at least 1</StatusBadge>
                ) : (
                  <StatusBadge tone="done">
                    {draft.competitors.length} of {MAX_COMPETITORS}
                  </StatusBadge>
                )
              }
            />

            <ProfileListSection
              id="monitored"
              title="Monitored profiles"
              subtitle="Creators in your niche. Isla finds posts where you can comment and show up to new leads."
              icon={<Lightbulb className="size-4" />}
              emptyMessage="No monitored profiles yet."
              placeholder="Creator LinkedIn profile URL"
              max={MAX_INFLUENCERS}
              profiles={draft.influencers}
              onChange={(next: MonitoredProfile[]) => set("influencers", next)}
              status={
                <StatusBadge tone={draft.influencers.length > 0 ? "done" : "pending"}>
                  {draft.influencers.length} of {MAX_INFLUENCERS}
                </StatusBadge>
              }
            />

            <Section
              title="Automation"
              subtitle="Timezone and daily limits for the automatic workflow."
              icon={<Clock className="size-4" />}
            >
              <div className="space-y-2 px-5 py-5">
                <Label htmlFor="daily-connections" className="text-xs font-medium">
                  Daily connection requests
                </Label>
                <Input
                  id="daily-connections"
                  type="number"
                  min={0}
                  max={30}
                  value={draft.dailyConnectionLimit}
                  onChange={(e) =>
                    set(
                      "dailyConnectionLimit",
                      Math.min(30, Math.max(0, Number(e.target.value) || 0)),
                    )
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Recommended: 10–20/day for a safe, consistent pace.
                </p>
              </div>
            </Section>
          </div>
        </div>
      )}
    </SettingsShell>
  );
}
