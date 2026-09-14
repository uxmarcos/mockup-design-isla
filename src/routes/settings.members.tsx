import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Linkedin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { WorkspaceMember } from "@/lib/settings-store";
import {
  Section,
  SettingsShell,
  StatusPill,
  useSettingsData,
} from "@/components/settings/shell";

export const Route = createFileRoute("/settings/members")({
  head: () => ({
    meta: [
      { title: "Members — Isla settings" },
      {
        name: "description",
        content:
          "Manage everyone with access to this Isla workspace, their roles and LinkedIn connection status.",
      },
      { property: "og:title", content: "Members — Isla settings" },
      {
        property: "og:description",
        content: "Invite teammates and manage roles in your Isla workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MembersSettingsPage,
});

function MembersSettingsPage() {
  const { data, update } = useSettingsData();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const members = data?.members ?? [];
  const setMembers = (next: WorkspaceMember[]) => update("members", next);

  const invite = () => {
    if (!inviteEmail.trim()) return;
    setMembers([
      ...members,
      {
        id: `m-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        linkedinConnected: false,
        brandDna: false,
        role: "member",
      },
    ]);
    setInviteEmail("");
    setInviteOpen(false);
    toast.success("Invite sent");
  };

  return (
    <SettingsShell
      title="Members"
      subtitle="Everyone with access to this workspace and each one's LinkedIn connection status."
    >
      <Section
        title="Members"
        subtitle="Roles control who can change workspace settings and automations."
        icon={<Users className="size-4" />}
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Linkedin className="mr-1 size-3.5" />
              Connect LinkedIn
            </Button>
            <Button
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="bg-[#00BFFF] text-xs text-white hover:bg-[#00BFFF]/90"
            >
              <Plus className="mr-1 size-3.5" />
              Invite member
            </Button>
          </div>
        }
      >
        <ul className="divide-y divide-border/60">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
                {m.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{m.name}</span>
                  {m.isYou && (
                    <span className="text-[10px] font-normal text-muted-foreground">
                      (you)
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">{m.email}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  tone={m.linkedinConnected ? "success" : "muted"}
                  label={m.linkedinConnected ? "LinkedIn connected" : "Not connected"}
                />
                {m.brandDna && <StatusPill tone="info" label="Brand DNA" />}
                <Select
                  value={m.role}
                  onValueChange={(v) =>
                    setMembers(
                      members.map((x) =>
                        x.id === m.id ? { ...x, role: v as WorkspaceMember["role"] } : x,
                      ),
                    )
                  }
                >
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">super-admin</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="member">member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a new member</DialogTitle>
            <DialogDescription>
              We'll send an invite email so they can join this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00BFFF] text-white hover:bg-[#00BFFF]/90"
              onClick={invite}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsShell>
  );
}
