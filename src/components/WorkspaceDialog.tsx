import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
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
  MAX_LOGO_BYTES,
  fileToLogoDataUrl,
  saveWorkspaceEdit,
  type WorkspaceView,
} from "@/lib/workspace-store";

export function WorkspaceDialog({
  open,
  onOpenChange,
  workspace,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspace: WorkspaceView;
}) {
  const [name, setName] = useState(workspace.name);
  const [logo, setLogo] = useState(workspace.logo);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setName(workspace.name);
      setLogo(workspace.logo);
    }
    // Only reset when the dialog opens, not on every sidebar sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const trimmed = name.trim();
  const dirty = trimmed !== workspace.name || logo !== workspace.logo;

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    try {
      setLogo(await fileToLogoDataUrl(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read the image.");
    }
  };

  const save = () => {
    saveWorkspaceEdit({ name: trimmed, logo });
    onOpenChange(false);
    toast.success("Workspace updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>Update your workspace name and image.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Change workspace image"
              className="group relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"
            >
              {logo ? (
                <img src={logo} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-xl font-semibold">
                  {trimmed.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5 text-white" />
              </span>
            </button>
            <div className="space-y-1.5">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Change image
              </Button>
              <p className="text-xs text-muted-foreground">PNG or JPG, up to 5 MB.</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                void pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-name" className="text-xs">
              Workspace name
            </Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-slug" className="text-xs">
              Workspace slug
            </Label>
            <Input
              id="workspace-slug"
              value={`/${workspace.slug}`}
              disabled
              readOnly
              className="text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">The slug can't be changed.</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-white/10 hover:text-destructive light:hover:bg-black/5"
          >
            Discard changes
          </Button>
          <Button onClick={save} disabled={!dirty || !trimmed} className="text-white">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
