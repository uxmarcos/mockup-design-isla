import { useEffect, useState } from "react";
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
import { useOperatorWorkspace } from "@/lib/operator-store";

export function AddClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const ws = useOperatorWorkspace();

  const [name, setName] = useState("");
  const [plan, setPlan] = useState("Starter · Monthly");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [language, setLanguage] = useState("English");
  const [contactEmail, setContactEmail] = useState("");
  const [seatName, setSeatName] = useState("");
  const [seatTitle, setSeatTitle] = useState("");
  const [seatCadence, setSeatCadence] = useState("2");

  useEffect(() => {
    if (!open) return;
    setName("");
    setPlan("Starter · Monthly");
    setTimezone("America/Sao_Paulo");
    setLanguage("English");
    setContactEmail("");
    setSeatName("");
    setSeatTitle("");
    setSeatCadence("2");
  }, [open]);

  const create = () => {
    if (!name.trim()) return toast.error("Give the client a name.");
    if (!seatName.trim()) return toast.error("Add the first seat's name.");
    const cadence = Math.max(0, Math.min(14, Number.parseInt(seatCadence, 10) || 0));
    const workspaceId = ws.addWorkspace({
      name: name.trim(),
      plan,
      timezone,
      language,
      contactEmail: contactEmail.trim() || `hello@${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    });
    ws.addSeat(workspaceId, {
      name: seatName.trim(),
      title: seatTitle.trim() || "Team member",
      email: `${seatName.trim().split(" ")[0]!.toLowerCase()}@${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      cadence,
    });
    toast.success(`${name.trim()} added to your portfolio`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add new client</DialogTitle>
          <DialogDescription>Create a workspace and its first seat.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Client name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Inc." autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Plan</Label>
              <Input value={plan} onChange={(e) => setPlan(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Language</Label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Time zone</Label>
              <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact email</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="optional" />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-dashed border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First seat</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input value={seatName} onChange={(e) => setSeatName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input value={seatTitle} onChange={(e) => setSeatTitle(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Posts per week</Label>
              <Input
                type="number"
                min={0}
                max={14}
                value={seatCadence}
                onChange={(e) => setSeatCadence(e.target.value)}
                className="w-24"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="text-white" onClick={create}>
            Add client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
