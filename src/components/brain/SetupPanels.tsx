import { useEffect, useState } from "react";
import { Check, Copy, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  loadSettings,
  saveSettings,
  type MonitoredProfile,
  type SettingsData,
} from "@/lib/settings-store";
import { setBrainSubtask } from "@/lib/onboarding-store";

export const ICP_TEMPLATE = `# Ideal Customer Profile

## Who they are
Role and seniority:
Type of company:
Company size:
Region:

## Context
What they are responsible for:
How they are measured:

## Pain
Main problem they face today:
What they already tried:

## Trigger
What makes them look for a solution now:

## Value
What changes for them after using our product:

## Language
Words they use:
Words to avoid:`;

function isLinkedinProfileUrl(v: string) {
  return /^https?:\/\/(www\.)?linkedin\.com\/in\/[^/\s]+/i.test(v.trim());
}

function handleName(v: string) {
  const m = v.trim().match(/linkedin\.com\/in\/([^/?#\s]+)/i);
  return m ? m[1].replace(/-/g, " ") : v.trim();
}

function useSettings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  useEffect(() => setSettings(loadSettings()), []);
  const patch = (p: Partial<SettingsData>) =>
    setSettings((s) => {
      if (!s) return s;
      const next = { ...s, ...p };
      saveSettings(next);
      return next;
    });
  return { settings, patch };
}

function PanelShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="my-10 h-px bg-border" />
      {children}
    </div>
  );
}

export function IcpPanel({ onDone }: { onDone: () => void }) {
  const { settings, patch } = useSettings();
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings) setValue(settings.icpDescription ?? "");
  }, [settings]);

  const save = () => {
    patch({ icpDescription: value });
    if (value.trim().length >= 40) {
      setBrainSubtask("icp", true);
      onDone();
    }
    toast.success("ICP saved");
  };

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(ICP_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <PanelShell
      title="Ideal Customer Profile"
      description="One text field. Isla reads it before writing content or messages."
    >
      <div className="space-y-6">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe your ideal customer using the template below."
          className="min-h-[320px] resize-y text-sm leading-relaxed"
        />
        <div className="flex items-center gap-3">
          <Button size="sm" className="text-white" onClick={save}>
            Save ICP
          </Button>
          <Button size="sm" variant="outline" onClick={copyTemplate}>
            {copied ? (
              <Check className="mr-1.5 size-3.5" />
            ) : (
              <Copy className="mr-1.5 size-3.5" />
            )}
            {copied ? "Copied" : "Copy template"}
          </Button>
        </div>

        <div className="rounded-xl border border-border p-5">
          <p className="text-sm font-semibold">Recommended template</p>
          <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>1. Copy the template.</li>
            <li>2. Open the AI you use, like ChatGPT.</li>
            <li>3. Attach any document with information about your audience.</li>
            <li>4. Ask it to fill the template with that information.</li>
            <li>5. Paste the result back into the field above.</li>
          </ol>
          <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-muted/50 p-4 text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {ICP_TEMPLATE}
          </pre>
        </div>
      </div>
    </PanelShell>
  );
}

function ProfileList({
  profiles,
  onChange,
  placeholder,
  addLabel,
  max,
}: {
  profiles: MonitoredProfile[];
  onChange: (next: MonitoredProfile[]) => void;
  placeholder: string;
  addLabel: string;
  max: number;
}) {
  const [value, setValue] = useState("");
  const invalid = value.trim().length > 0 && !isLinkedinProfileUrl(value);

  const add = () => {
    const v = value.trim();
    if (!isLinkedinProfileUrl(v)) return;
    if (profiles.length >= max) {
      toast.error(`You can add up to ${max} profiles.`);
      return;
    }
    onChange([...profiles, { id: `p-${Date.now()}`, name: handleName(v), handle: v }]);
    setValue("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className={cn("h-9 text-xs", invalid && "border-red-500")}
        />
        <Button
          size="sm"
          className="text-white"
          disabled={invalid || !value.trim() || profiles.length >= max}
          onClick={add}
        >
          <Plus className="mr-1 size-3.5" />
          {addLabel}
        </Button>
      </div>

      {profiles.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {profiles.map((p) => (
            <li key={p.id} className="flex items-center gap-2 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-xs">{p.name}</span>
              <button
                type="button"
                aria-label={`Remove ${p.name}`}
                onClick={() => onChange(profiles.filter((x) => x.id !== p.id))}
                className="text-muted-foreground transition-colors hover:text-red-500"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CompetitorsPanel({ onDone }: { onDone: () => void }) {
  const { settings, patch } = useSettings();
  if (!settings) return null;
  return (
    <PanelShell
      title="Competitors"
      description="Isla finds leads among the people who interact with their posts."
    >
      <ProfileList
        profiles={settings.competitors}
        max={5}
        placeholder="https://www.linkedin.com/in/competitor-founder"
        addLabel="Add competitor"
        onChange={(next) => {
          patch({ competitors: next });
          setBrainSubtask("competitors", next.length > 0);
          if (next.length > 0) onDone();
        }}
      />
    </PanelShell>
  );
}

export function MonitoredProfilesPanel({ onDone }: { onDone: () => void }) {
  const { settings, patch } = useSettings();
  if (!settings) return null;
  return (
    <PanelShell
      title="Monitored profiles"
      description="Creators in your niche. Isla finds posts where you can comment and show up to new leads."
    >
      <ProfileList
        profiles={settings.influencers}
        max={5}
        placeholder="https://www.linkedin.com/in/creator-in-your-niche"
        addLabel="Add profile"
        onChange={(next) => {
          patch({ influencers: next });
          setBrainSubtask("influencers", next.length > 0);
          if (next.length > 0) onDone();
        }}
      />
    </PanelShell>
  );
}

export function BrandDnaPanel({
  onDone,
  onOpenDoc,
}: {
  onDone: () => void;
  onOpenDoc: () => void;
}) {
  return (
    <PanelShell
      title="Brand DNA"
      description="Your pillars, tone and proof points. Every idea and post starts here."
    >
      <div className="space-y-4">
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>Content pillars and themes you want to own.</li>
          <li>Tone rules Isla follows in every draft.</li>
          <li>Stories and numbers Isla can reuse as proof.</li>
        </ul>
        <Button
          size="sm"
          className="text-white"
          onClick={() => {
            setBrainSubtask("brandDna", true);
            onDone();
            onOpenDoc();
          }}
        >
          Review Brand DNA
        </Button>
      </div>
    </PanelShell>
  );
}
