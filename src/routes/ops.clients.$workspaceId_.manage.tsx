import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Plus, Trash2 } from "lucide-react";
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
import { HubBreadcrumb } from "@/components/content/HubBreadcrumb";
import { useOperatorWorkspace } from "@/lib/operator-store";
import { OLink, useGo } from "@/components/operator/nav";
import {
  fileToPostImage,
  MAX_POST_IMAGE_BYTES,
  PageBody,
  SeatAvatar,
  WorkspaceLogo,
} from "@/components/operator/ui";
import type { SeatAccount } from "@/lib/operator-data";

export const Route = createFileRoute("/ops/clients/$workspaceId_/manage")({
  component: ManageWorkspacePage,
});

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ManageWorkspacePage() {
  const { workspaceId } = Route.useParams();
  const ws = useOperatorWorkspace();
  const go = useGo();
  const logoRef = useRef<HTMLInputElement | null>(null);

  const workspace = ws.workspaces.find((w) => w.id === workspaceId);
  const seats = ws.seats.filter((s) => s.workspaceId === workspaceId);

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
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
    setName(workspace.name);
    setLogo(workspace.logo);
    setPlan(workspace.plan);
    setTimezone(workspace.timezone);
    setLanguage(workspace.language);
    setContactEmail(workspace.contactEmail);
    setCadenceDraft(Object.fromEntries(seats.map((s) => [s.id, String(s.cadence)])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id]);

  if (!workspace) {
    return (
      <div className="mx-auto max-w-[600px] py-20 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">This client isn't part of your portfolio, or it doesn't exist.</p>
        <OLink to="/ops/clients" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to clients
        </OLink>
      </div>
    );
  }

  const pickLogo = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_POST_IMAGE_BYTES) return toast.error("Image is too large (max 8 MB).");
    try {
      setLogo(await fileToPostImage(file, 400));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add the image.");
    }
  };

  const save = () => {
    if (!name.trim()) return toast.error("The client needs a name.");
    ws.setWorkspaceOverride(workspace.id, { name: name.trim(), logo, plan, timezone, language, contactEmail });
    for (const seat of seats) {
      if (cadenceDraft[seat.id] === undefined) continue;
      const n = Math.max(0, Math.min(14, Number.parseInt(cadenceDraft[seat.id]!, 10) || 0));
      if (n !== seat.cadence) ws.setSeatOverride(seat.id, { cadence: n });
    }
    toast.success(`${name.trim()} updated`);
    go("/ops/clients/$workspaceId", { params: { workspaceId: workspace.id } });
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
      <div className="border-b border-border/70 px-8 py-4">
        <HubBreadcrumb
          page="Manage"
          root={{ label: "Clients", to: "/ops/clients" }}
          trail={[
            {
              label: workspace.name,
              onClick: () => go("/ops/clients/$workspaceId", { params: { workspaceId: workspace.id } }),
            },
          ]}
          className="min-w-0"
        />
      </div>

      <PageBody className="max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Manage {workspace.name}</h1>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</h2>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="group relative size-16 shrink-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Change logo"
              >
                <WorkspaceLogo workspace={{ name, logo }} className="size-16 rounded-xl" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5 text-white" />
                </span>
              </button>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void pickLogo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Client name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <Field label="Plan" value={plan} onChange={setPlan} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time zone" value={timezone} onChange={setTimezone} />
              <Field label="Language" value={language} onChange={setLanguage} />
            </div>
            <Field label="Contact email" value={contactEmail} onChange={setContactEmail} />
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seats · {seats.length}</h2>
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

          <div className="flex justify-end gap-2 border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={() => go("/ops/clients/$workspaceId", { params: { workspaceId: workspace.id } })}
            >
              Cancel
            </Button>
            <Button className="text-white" onClick={save}>
              Save changes
            </Button>
          </div>
        </div>
      </PageBody>

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
