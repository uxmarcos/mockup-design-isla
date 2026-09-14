import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  loadSettings,
  saveSettings,
  type MonitoredProfile,
  type SettingsData,
} from "@/lib/settings-store";

export const MAX_COMPETITORS = 5;
export const MAX_INFLUENCERS = 5;

/** Loads settings only after hydration so SSR and first client render match. */
export function useSettingsData() {
  const [data, setData] = useState<SettingsData | null>(null);

  useEffect(() => {
    setData(loadSettings());
  }, []);

  useEffect(() => {
    if (data) saveSettings(data);
  }, [data]);

  const update = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) =>
    setData((d) => (d ? { ...d, [key]: value } : d));

  return { data, update };
}

export function SettingsShell({
  title,
  subtitle,
  actions,
  wide,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useSidebarState();
  return (
    <div className="flex min-h-screen bg-background text-foreground surface-soft">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className={cn("mx-auto px-8 py-16", wide ? "max-w-7xl" : "max-w-4xl")}>
          <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
          <div className={cn(wide ? "space-y-4" : "space-y-8")}>{children}</div>
        </div>
      </main>
    </div>
  );
}

export function Section({
  id,
  title,
  subtitle,
  icon,
  right,
  status,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  status?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="card-soft overflow-hidden rounded-xl border border-border/70 bg-card/40"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {status}
          </div>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "done" | "pending";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tone === "done"
          ? "bg-[#00BFFF]/15 text-[#00BFFF]"
          : "bg-amber-500/15 text-amber-500",
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({
  tone,
  label,
}: {
  tone: "success" | "info" | "muted";
  label: string;
}) {
  const cls =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-500"
      : tone === "info"
        ? "bg-[#00BFFF]/15 text-[#00BFFF]"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        cls,
      )}
    >
      {label}
    </span>
  );
}

export function extractHandle(url: string): string {
  try {
    const u = url.startsWith("http") ? new URL(url) : new URL(`https://${url}`);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "in" || p === "company");
    return parts[idx + 1] ?? parts[parts.length - 1] ?? u.hostname;
  } catch {
    return url.slice(0, 30);
  }
}

/** Only accepts a personal LinkedIn profile URL (linkedin.com/in/handle). */
export const LINKEDIN_PROFILE_REGEX =
  /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%.]+\/?$/i;

export function isLinkedinProfileUrl(value: string): boolean {
  return LINKEDIN_PROFILE_REGEX.test(value.trim());
}

export function ProfileListSection({
  id,
  title,
  subtitle,
  icon,
  emptyMessage,
  placeholder,
  hint,
  addLabel = "Add",
  max,
  profiles,
  status,
  onChange,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  emptyMessage: string;
  placeholder: string;
  hint?: React.ReactNode;
  addLabel?: string;
  max: number;
  profiles: MonitoredProfile[];
  status?: React.ReactNode;
  onChange: (next: MonitoredProfile[]) => void;
}) {
  const [value, setValue] = useState("");
  const invalid = value.trim().length > 0 && !isLinkedinProfileUrl(value);

  const add = () => {
    const v = value.trim();
    if (!v) return;
    if (!isLinkedinProfileUrl(v)) {
      toast.error("Add a LinkedIn profile URL", {
        description: "It must look like https://www.linkedin.com/in/name — not just a name.",
      });
      return;
    }
    if (profiles.length >= max) {
      toast.error(`You can add up to ${max} profiles.`);
      return;
    }
    onChange([...profiles, { id: `p-${Date.now()}`, name: extractHandle(v), handle: v }]);
    setValue("");
  };


  const remove = (pid: string) => onChange(profiles.filter((p) => p.id !== pid));

  return (
    <Section id={id} title={title} subtitle={subtitle} icon={icon} status={status}>
      <div className="space-y-4 px-5 py-5">
        <div className="space-y-1.5">
          <div className="flex flex-col gap-2 sm:flex-row">
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
              className={cn("flex-1", invalid && "border-red-500 focus-visible:ring-red-500")}
            />
            <Button
              onClick={add}
              disabled={!value.trim() || invalid || profiles.length >= max}
              className="bg-[#00BFFF] text-white hover:bg-[#00BFFF]/90"
            >
              <Plus className="mr-1 size-4" />
              {addLabel}
            </Button>
          </div>
          {invalid && (
            <p className="text-[11px] text-red-500">
              Paste the full LinkedIn profile URL (https://www.linkedin.com/in/name).
            </p>
          )}
          {hint && !invalid && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>


        {profiles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ul className="divide-y divide-border/60 rounded-lg border border-border/70">
            {profiles.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold uppercase text-muted-foreground">
                  {p.name.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <a
                    href={p.handle.startsWith("http") ? p.handle : `https://${p.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-[#00BFFF]"
                  >
                    {p.handle}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(p.id)}
                  className="text-muted-foreground hover:text-red-500"
                  aria-label="Remove profile"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-muted-foreground">
          Isla scans these profiles 3x a day. Max {max} profiles.
        </p>
      </div>
    </Section>
  );
}

export function ChipMultiSelect({
  label,
  options,
  values,
  onChange,
  searchable = false,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter((v) => v !== opt));
    else onChange([...values, opt]);
  };
  const remove = (opt: string) => onChange(values.filter((v) => v !== opt));

  const filtered =
    searchable && search
      ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
      : options;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground">{label}</Label>
        <Popover
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setSearch("");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Edit <ChevronDown className="size-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-1">
            {searchable && (
              <div className="px-1 pb-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#00BFFF]"
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                  No results
                </div>
              )}
              {filtered.map((opt) => {
                const selected = values.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                      selected && "text-foreground",
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {selected && <Check className="size-3.5 text-[#00BFFF]" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {values.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-3 py-2 text-[11px] text-muted-foreground">
          None selected
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${v}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
