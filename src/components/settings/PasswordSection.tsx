import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Section } from "@/components/settings/shell";

export function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [show, setShow] = useState(false);

  return (
    <Section
      title="Change password"
      subtitle="To update your password, confirm the current one first."
      icon={<Lock className="size-4" />}
    >
      <div className="space-y-3 px-5 py-5">
        <Label htmlFor="current-pw" className="text-xs font-medium">
          Current password
        </Label>
        <div className="relative">
          <Input
            id="current-pw"
            type={show ? "text" : "password"}
            placeholder="Enter your current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="flex justify-end">
          <Button
            className="text-white"
            disabled={!current.trim()}
            onClick={() =>
              toast.success("Password confirmed", {
                description: "You can now set a new password.",
              })
            }
          >
            Continue
          </Button>
        </div>
      </div>
    </Section>
  );
}
