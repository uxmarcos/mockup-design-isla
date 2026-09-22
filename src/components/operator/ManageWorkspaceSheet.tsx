import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SeatAccount, Workspace } from "@/lib/operator-data";
import { useOperatorWorkspace } from "@/lib/operator-store";
import { SeatAvatar, WorkspaceLogo } from "@/components/operator/ui";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ManageWorkspaceSheet({
  workspace,
  seats,
  open,
  onOpenChange,
}: {
  workspace: Workspace | null;
  seats: SeatAccount[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const ws = useOperatorWorkspace();

  const [plan, setPlan] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [cadenceDraft, setCadenceDraft] = useState<Record<string, string>>({});
  const [removingSeat, setRemovingSeat] = useState<SeatAccount | null>(null);

  const [addingSeat, setAddingSeat] = useState(false);
  const [seatName, setSeatName] = useState("");
  const [seatTitle, setSeatTitle] = useState("");
  const [seatEmail, setSeatEmail] = useState("");
  const [seatCadence, setSeatCadence] = useState("2");

  useEffect(() => {
    if (!workspace) return;
    setPlan(workspace.plan);
    setTimezone(workspace.timezone);
    setLanguage(workspace.language);
    setContactEmail(workspace.contactEmail);
    setCadenceDraft(Object.fromEntries(seats.map((s) => [s.id, String(s.cadence)])));
    setAddingSeat(false);
    setSeatName("");
    setSeatTitle("");
    setSeatEmail("");
    setSeatCadence("2");
    setRemovingSeat(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id, open]);

  if (!workspace) return null;

  const save = () => {
    ws.setWorkspaceOverride(workspace.id, { plan, timezone, language, contactEmail });
    for (const seat of seats) {
      if (cadenceDraft[seat.id] === undefined) continue;
      const n = Math.max(0, Math.min(14, Number.parseInt(cadenceDraft[seat.id]!, 10) || 0));
      if (n !== seat.cadence) ws.setSeatOverride(seat.id, { cadence: n });
    }
    toast.success(`${workspace.name} updated`);
    onOpenChange(false);
  };

  const createSeat = () => {
    if (!seatName.trim()) return toast.error("Give the new seat a name.");
    const cadence = Math.max(0, Math.min(14, Number.parseInt(seatCadence, 10) || 0));
    const id = ws.addSeat(workspace.id, {
      name: seatName.trim(),
      title: seatTitle.trim() || "Team member",
      email: seatEmail.trim() || `${seatName.trim().split(" ")[0]!.toLowerCase()}@${workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      cadence,
    });
    // The draft is keyed off the seats the sheet opened with — seed this new one so "Save changes" doesn't zero it out.
    setCadenceDraft((d) => ({ ...d, [id]: String(cadence) }));
    toast.success(`${seatName.trim()} added to ${workspace.name}`);
    setAddingSeat(false);
    setSeatName("");
    setSeatTitle("");
    setSeatEmail("");
    setSeatCadence("2");
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <WorkspaceLogo workspace={workspace} className="size-10" />
            <div>
              <SheetTitle>{workspace.name}</SheetTitle>
              <SheetDescription>Manage this client's workspace and seats.</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <section className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</h3>
          <Field label="Plan" value={plan} onChange={setPlan} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time zone" value={timezone} onChange={setTimezone} />
            <Field label="Language" value={language} onChange={setLanguage} />
          </div>
          <Field label="Contact email" value={contactEmail} onChange={setContactEmail} />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Seats · {seats.length}
          </h3>
          <ul className="space-y-2">
            {seats.map((seat) => (
              <li key={seat.id} className="flex items-center gap-2.5 rounded-xl border border-border p-2.5">
                <SeatAvatar seat={seat} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-medium">{seat.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{seat.title}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={14}
                    value={cadenceDraft[seat.id] ?? ""}
                    onChange={(e) => setCadenceDraft({ ...cadenceDraft, [seat.id]: e.target.value })}
                    className="h-8 w-14 px-2 text-center text-xs"
                  />
                  <span className="text-[11px] text-muted-foreground">posts/wk</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    disabled={seats.length <= 1}
                    title={seats.length <= 1 ? "A client needs at least one seat" : "Remove seat"}
                    onClick={() => setRemovingSeat(seat)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {addingSeat ? (
            <div className="space-y-3 rounded-xl border border-dashed border-border p-3">
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Name" value={seatName} onChange={setSeatName} />
                <Field label="Title" value={seatTitle} onChange={setSeatTitle} />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2.5">
                <Field label="Email (optional)" value={seatEmail} onChange={setSeatEmail} />
                <div className="space-y-1.5">
                  <Label className="text-xs">Posts/wk</Label>
                  <Input
                    type="number"
                    min={0}
                    max={14}
                    value={seatCadence}
                    onChange={(e) => setSeatCadence(e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAddingSeat(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="text-white" onClick={createSeat}>
                  Add seat
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={() => setAddingSeat(true)}>
              <Plus className="size-3.5" />
              Add seat
            </Button>
          )}
        </section>

        <Button className="mt-auto text-white" onClick={save}>
          Save changes
        </Button>
      </SheetContent>
    </Sheet>

    <AlertDialog open={!!removingSeat} onOpenChange={(v) => !v && setRemovingSeat(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {removingSeat?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the seat from your portfolio. Its posts and conversation history won't be shown anymore.
            This can't be undone from the panel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => {
              if (!removingSeat) return;
              ws.removeSeat(removingSeat.id);
              toast.success(`${removingSeat.name} removed`);
              setRemovingSeat(null);
            }}
          >
            Remove seat
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
