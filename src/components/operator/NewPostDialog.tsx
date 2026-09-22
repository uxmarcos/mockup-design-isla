import { useEffect, useMemo, useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOperatorPost, postTitle, seatOf, type TeamDraft } from "@/lib/content-requests-store";
import type { Operator, SeatAccount } from "@/lib/operator-data";
import { useGo, type NewPostPreset } from "@/components/operator/nav";
import { fromInputValue, toInputValue, WorkspaceLogo } from "@/components/operator/ui";

const BLANK = "blank";

export function NewPostDialog({
  open,
  onOpenChange,
  preset,
  seats,
  posts,
  operator,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  preset: NewPostPreset;
  seats: SeatAccount[];
  posts: TeamDraft[];
  operator: Operator;
}) {
  const go = useGo();
  const [seatId, setSeatId] = useState("");
  const [source, setSource] = useState(BLANK);
  const [when, setWhen] = useState("");

  useEffect(() => {
    if (!open) return;
    setSeatId(preset.seatId ?? seats[0]?.id ?? "");
    setSource(BLANK);
    if (preset.date) {
      const d = new Date(preset.date);
      d.setHours(9, 0, 0, 0);
      setWhen(toInputValue(d));
    } else {
      setWhen("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const workspaces = useMemo(
    () => Array.from(new Map(seats.map((s) => [s.workspace.id, s.workspace])).values()),
    [seats],
  );

  const ideas = useMemo(
    () => posts.filter((p) => seatOf(p) === seatId && p.status === "writing" && p.origin === "idea"),
    [posts, seatId],
  );

  const create = () => {
    if (!seatId) return;
    if (source !== BLANK) {
      onOpenChange(false);
      go("/ops/posts/$postId", { params: { postId: source } });
      return;
    }
    const date = fromInputValue(when);
    if (date && date.getTime() <= Date.now()) {
      toast.error("Pick a suggested date in the future.");
      return;
    }
    const id = createOperatorPost({ seatId, author: operator.name, suggestedAt: date });
    onOpenChange(false);
    go("/ops/posts/$postId", { params: { postId: id } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>
            Write a post for one of your clients' seats. It stays private until you send it for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Client (seat)</Label>
            <Select
              value={seatId}
              onValueChange={(v) => {
                setSeatId(v);
                setSource(BLANK);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a seat" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectGroup key={w.id}>
                    <SelectLabel className="flex items-center gap-2 text-xs">
                      <WorkspaceLogo workspace={w} className="size-4 rounded-[3px]" />
                      {w.name}
                    </SelectLabel>
                    {seats
                      .filter((s) => s.workspaceId === w.id)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} <span className="text-muted-foreground">· {w.name}</span>
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Start from</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BLANK}>A blank post</SelectItem>
                {ideas.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    Idea: {postTitle(i)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ideas.length === 0 && (
              <p className="text-xs text-muted-foreground">This seat has no ideas waiting.</p>
            )}
          </div>

          {source === BLANK && (
            <div className="space-y-1.5">
              <Label htmlFor="np-when" className="text-xs">
                Suggested date <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input id="np-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="text-white" disabled={!seatId} onClick={create}>
            {source === BLANK ? "Create post" : "Open idea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
