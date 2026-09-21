import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SENDERS } from "@/lib/cross-data";
import type { ExtraLead, Stage } from "@/lib/kanban-store";

const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: "leads", label: "New Prospects" },
  { value: "connecting", label: "Connecting" },
  { value: "engaging", label: "Engaging" },
  { value: "ready", label: "Ready to Reach Out" },
  { value: "reach_out", label: "Reaching Out" },
];

const MOCK_TITLES = ["Head of Growth", "VP of Marketing", "Founder & CEO", "Director of Sales", "CMO"];
const MOCK_COMPANIES = ["Nuvemshop", "Loft", "iFood", "Hotmart", "RD Station"];

function hash(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function nameFromSlug(slug: string) {
  return slug
    .replace(/[-_]?\d+$/, "")
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const EMPTY = {
  url: "",
  name: "",
  company: "",
  title: "",
  email: "",
  stage: "connecting" as Stage,
  score: "",
  profile: SENDERS[0]!.name,
  language: "en",
};

export function AddContactDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (lead: ExtraLead) => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [searching, setSearching] = useState(false);
  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const search = () => {
    const match = form.url.match(/linkedin\.com\/in\/([^/?#\s]+)/i);
    if (!match) {
      toast.error("Paste a valid LinkedIn profile URL.");
      return;
    }
    setSearching(true);
    window.setTimeout(() => {
      const slug = match[1]!;
      const h = hash(slug);
      setForm((f) => ({
        ...f,
        name: nameFromSlug(slug) || f.name,
        title: MOCK_TITLES[h % MOCK_TITLES.length]!,
        company: MOCK_COMPANIES[(h >> 3) % MOCK_COMPANIES.length]!,
      }));
      setSearching(false);
      toast.success("Profile found — review the fields and save.");
    }, 700);
  };

  const score = form.score === "" ? null : Math.min(100, Math.max(0, Number(form.score) || 0));
  const canAdd = form.name.trim().length > 0;

  const submit = () => {
    if (!canAdd) return;
    const value = score ?? 50;
    const seed = (hash(form.name) % 70) + 1;
    onAdd({
      id: `manual-${Date.now()}`,
      name: form.name.trim(),
      role: form.title.trim() || "—",
      company: form.company.trim() || "—",
      score: value,
      scoreTone: value >= 80 ? "hot" : value >= 60 ? "warm" : "cold",
      stage: form.stage,
      tag: "Manual",
      action: "",
      avatarSeed: seed,
      linkedinUrl: form.url.trim() || undefined,
      email: form.email.trim() || undefined,
      profile: form.profile,
      language: form.language,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-5 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg">Add contact</DialogTitle>
          <DialogDescription>
            Paste the LinkedIn URL to fill the fields automatically, review and save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <Label htmlFor="contact-url" className="text-sm font-medium">
            LinkedIn URL
          </Label>
          <div className="flex gap-3">
            <Input
              id="contact-url"
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="https://www.linkedin.com/in/usuario"
              className="h-10 flex-1"
            />
            <Button variant="secondary" className="h-10 gap-2" onClick={search} disabled={searching}>
              <Search className="size-4" />
              {searching ? "Searching…" : "Search"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="contact-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Full name"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-company" className="text-sm font-medium">
              Company
            </Label>
            <Input
              id="contact-company"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Company name"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="contact-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Job title"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@company.com"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Stage</Label>
            <Select value={form.stage} onValueChange={(v) => set("stage", v as Stage)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-score" className="text-sm font-medium">
              ICP Score
            </Label>
            <Input
              id="contact-score"
              type="number"
              min={0}
              max={100}
              value={form.score}
              onChange={(e) => set("score", e.target.value)}
              placeholder="0–100"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">LinkedIn profile</Label>
            <Select value={form.profile} onValueChange={(v) => set("profile", v)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENDERS.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Lead language</Label>
            <Select value={form.language} onValueChange={(v) => set("language", v)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="items-center gap-2 border-t border-border/60 pt-4 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="text-white" onClick={submit} disabled={!canAdd}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
