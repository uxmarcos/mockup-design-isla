import { useEffect, useState } from "react";
import { CalendarClock, Linkedin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CURRENT_USER } from "@/lib/current-user";
import chrisAvatar from "@/assets/chris-theroux.jpg";

/* ============================ SCHEDULE MODAL ============================ */

export function ScheduleModal({
  open,
  onOpenChange,
  value,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: Date | null;
  onSave: (d: Date) => void;
}) {
  const defaultDate = value ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [date, setDate] = useState(defaultDate.toISOString().slice(0, 10));
  const [time, setTime] = useState(
    `${String(defaultDate.getHours()).padStart(2, "0")}:${String(defaultDate.getMinutes()).padStart(2, "0")}`,
  );

  useEffect(() => {
    if (!open) return;
    const d = value ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
    setDate(d.toISOString().slice(0, 10));
    setTime(
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    );
  }, [open, value]);

  const quickPicks = [
    { label: "Tomorrow 9:00", offsetH: 24, hour: 9 },
    { label: "Tomorrow 12:00", offsetH: 24, hour: 12 },
    { label: "In 3 days", offsetH: 72, hour: 9 },
    { label: "Next Monday 8:00", offsetH: 0, hour: 8, nextMonday: true },
  ];

  function pick(q: (typeof quickPicks)[number]) {
    const d = new Date();
    if (q.nextMonday) {
      const day = d.getDay();
      const diff = (8 - day) % 7 || 7;
      d.setDate(d.getDate() + diff);
    } else {
      d.setTime(d.getTime() + q.offsetH * 60 * 60 * 1000);
    }
    d.setHours(q.hour, 0, 0, 0);
    setDate(d.toISOString().slice(0, 10));
    setTime(`${String(d.getHours()).padStart(2, "0")}:00`);
  }

  function handleSave() {
    const [y, m, dd] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(y, (m ?? 1) - 1, dd ?? 1, hh ?? 9, mm ?? 0, 0);
    onSave(d);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" /> Schedule post
          </DialogTitle>
          <DialogDescription>
            Pick a date and time to publish this post on LinkedIn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Quick picks
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPicks.map((q) => (
                <button
                  key={q.label}
                  onClick={() => pick(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 border border-border/60 transition"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-full">
            <CalendarClock className="size-4 mr-1" /> Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ LINKEDIN PREVIEW MODAL ============================ */

export function LinkedInPreviewModal({
  open,
  onOpenChange,
  content,
  image,
  scheduledAt,
  author,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: string;
  image: string | null;
  scheduledAt: Date | null;
  /** Whose profile the post is previewed on. Defaults to the signed-in client user. */
  author?: { name: string; headline: string; avatar?: string };
}) {
  const who = author ?? {
    name: CURRENT_USER.name,
    headline: "Head of Growth at Nortex | B2B pipeline, content & RevOps",
    avatar: chrisAvatar,
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[94vw] p-0 overflow-hidden bg-white border-0 gap-0 [&>button]:hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>LinkedIn preview</DialogTitle>
          <DialogDescription>Preview how this post will look on LinkedIn.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#e0dfdc] shrink-0">
          <div className="size-8 rounded grid place-items-center bg-[#0a66c2] text-white">
            <Linkedin className="size-5" fill="currentColor" strokeWidth={0} />
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="size-7 grid place-items-center rounded-full border border-[#e0dfdc] text-[#00000099] hover:bg-[#f4f2ee] transition"
            aria-label="Close preview"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.4fr_0.7fr] bg-[#f4f2ee] p-4 gap-4 h-[75vh] max-h-[760px]">
          {/* LEFT — skeletons */}
          <div className="hidden md:flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4">
              <div className="size-14 rounded-full bg-[#ebe9e6]" />
              <div className="mt-4 space-y-2">
                <div className="h-2.5 w-3/4 rounded bg-[#ebe9e6]" />
                <div className="h-2 w-full rounded bg-[#ebe9e6]" />
                <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-2 w-full rounded bg-[#ebe9e6]" />
                <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4 space-y-2">
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
            </div>
          </div>

          {/* CENTER — post preview */}
          <div className="bg-white rounded-lg border border-[#e0dfdc] overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto flex-1">
              <div className="flex items-start gap-2.5 px-5 pt-4">
                {who.avatar ? (
                  <img
                    src={who.avatar}
                    alt={who.name}
                    loading="lazy"
                    className="size-12 rounded-full object-cover border border-[#e0dfdc]"
                  />
                ) : (
                  <div className="size-12 shrink-0 rounded-full border border-[#e0dfdc] bg-[#ebe9e6] grid place-items-center text-sm font-semibold text-[#00000099]">
                    {who.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-[#0a0a0a] leading-tight flex items-center gap-1">
                    {who.name}
                  </div>
                  <div className="text-[12px] text-[#00000099] leading-tight mt-0.5">
                    {who.headline}
                  </div>
                  <div className="text-[12px] text-[#00000099] leading-tight mt-1 flex items-center gap-1">
                    {scheduledAt ? (
                      <>
                        Scheduled ·{" "}
                        {scheduledAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · <CalendarClock className="size-3" />
                      </>
                    ) : (
                      <>Now · 🌐</>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pt-3 pb-4">
                <p className="text-[14px] text-[#0a0a0a] whitespace-pre-wrap leading-[1.55]">
                  {content}
                </p>
              </div>

              {image && (
                <div className="border-t border-[#e0dfdc]">
                  <img
                    src={image}
                    alt="post attachment"
                    className="w-full max-h-[360px] object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — skeletons */}
          <div className="hidden md:flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4 space-y-2">
              <div className="h-2 w-3/4 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
            </div>
            <div className="bg-white rounded-lg border border-[#e0dfdc] p-4 space-y-2.5">
              <div className="h-2 w-3/4 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-full rounded bg-[#ebe9e6]" />
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-4/5 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-1/2 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-3/4 rounded bg-[#ebe9e6]" />
              <div className="h-2 w-2/3 rounded bg-[#ebe9e6]" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


