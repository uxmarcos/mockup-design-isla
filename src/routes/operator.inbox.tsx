import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useOperatorWorkspace, type NotificationType } from "@/lib/operator-store";
import { NotificationRow } from "@/components/operator/NotificationRow";
import { useGo } from "@/components/operator/nav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyBox, PageBody, PageHeader } from "@/components/operator/ui";

const TABS = ["all", "ideas", "feedback", "alerts", "approvals"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/operator/inbox")({
  validateSearch: z.object({ type: z.enum(TABS).optional() }),
  component: InboxPage,
});

const MATCH: Record<Tab, NotificationType[]> = {
  all: ["idea", "feedback", "approval", "gap", "due"],
  ideas: ["idea"],
  feedback: ["feedback"],
  alerts: ["gap", "due"],
  approvals: ["approval"],
};

const LABEL: Record<Tab, string> = {
  all: "All",
  ideas: "Ideas",
  feedback: "Feedback",
  alerts: "Alerts",
  approvals: "Approvals",
};

function InboxPage() {
  const ws = useOperatorWorkspace();
  const go = useGo();
  const { type } = Route.useSearch();
  const tab: Tab = type ?? "all";

  const list = ws.notifications.filter((n) => MATCH[tab].includes(n.type));
  const unreadIn = (t: Tab) => ws.notifications.filter((n) => MATCH[t].includes(n.type) && !n.read).length;

  return (
    <>
      <PageHeader
        title="Inbox"
        subtitle="Ideas, feedback and alerts from the seats in your portfolio."
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={ws.counts.unread === 0}
            onClick={() => ws.markRead(ws.notifications.map((n) => n.key))}
          >
            Mark all as read
          </Button>
        }
      />
      <PageBody className="max-w-4xl">
        <Tabs
          value={tab}
          onValueChange={(v) => go("/operator/inbox", { search: v === "all" ? {} : { type: v } })}
          className="mb-5"
        >
          <TabsList>
            {TABS.map((t) => {
              const unread = unreadIn(t);
              return (
                <TabsTrigger key={t} value={t} className="gap-2">
                  {LABEL[t]}
                  {unread > 0 && (
                    <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-4 text-white">
                      {unread}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {list.length === 0 ? (
          <EmptyBox>Nothing here. New items from your clients will appear as they arrive.</EmptyBox>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {list.map((n) => (
              <NotificationRow key={n.key} n={n} seat={ws.getSeat(n.seatId)} onRead={(k) => ws.markRead([k])} />
            ))}
          </ul>
        )}
      </PageBody>
    </>
  );
}
