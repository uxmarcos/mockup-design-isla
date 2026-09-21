import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, ExternalLink, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TIMEZONES } from "@/lib/settings-store";
import { MembersSection } from "@/components/settings/MembersSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { Section, SettingsShell, useSettingsData } from "@/components/settings/shell";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — Isla" },
      {
        name: "description",
        content: "Customize how Isla works for your team.",
      },
    ],
  }),
  component: SettingsPage,
});

const STRIPE_PORTAL_URL = "https://billing.stripe.com";

function SettingsPage() {
  const { data, update } = useSettingsData();

  return (
    <SettingsShell title="Settings" subtitle="Customize how Isla works for your team.">
      {!data ? (
        <div className="h-40 rounded-xl border border-border/70 bg-card/40" />
      ) : (
        <>
          <Section
            title="Language"
            subtitle="Interface and email language for everyone in this workspace."
            icon={<Languages className="size-4" />}
            right={
              <Tabs value={data.language} onValueChange={(v) => update("language", v as "en" | "pt")}>
                <TabsList>
                  <TabsTrigger value="pt">Portuguese</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
              </Tabs>
            }
          >
            <div className="space-y-2.5 px-5 py-5">
              <Label className="text-sm font-medium">Timezone</Label>
              <Select value={data.timezone} onValueChange={(v) => update("timezone", v)}>
                <SelectTrigger className="sm:w-[288px]">
                  <SelectValue>{data.timezone.replace(/_/g, " ")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Section>

          <MembersSection />

          <PasswordSection />

          <Section
            title="Plan and subscription"
            subtitle="Manage or cancel your subscription in Stripe's security portal."
            icon={<CreditCard className="size-4" />}
          >
            <div className="px-5 py-5">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/40 px-5 py-4">
                <div>
                  <p className="text-base font-semibold">Pro · 1 seat · Yearly</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Active plan
                  </p>
                </div>
                <Button
                  className="gap-1.5 text-white"
                  onClick={() => window.open(STRIPE_PORTAL_URL, "_blank", "noopener,noreferrer")}
                >
                  Manage on Stripe
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>
          </Section>
        </>
      )}
    </SettingsShell>
  );
}
