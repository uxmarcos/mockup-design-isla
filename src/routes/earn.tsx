import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { Sidebar } from "@/components/analytics/Sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { loadScenario } from "@/lib/scenario-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/earn")({
  head: () => ({
    meta: [
      { title: "Earn — Isla" },
      {
        name: "description",
        content:
          "Invite friends to Isla and earn 20% of everything they spend — for as long as they stay.",
      },
    ],
  }),
  component: EarnPage,
});

type Entry = {
  id: string;
  kind: "commission" | "withdrawal";
  title: string;
  subtitle: string;
  date: string;
  amount: number;
};

const HISTORY: Entry[] = [
  { id: "1", kind: "commission", title: "Ana Carvalho", subtitle: "used your code", date: "Nov 15, 2024", amount: 120.4 },
  { id: "2", kind: "withdrawal", title: "Manual withdrawal", subtitle: "sent to your account", date: "Nov 10, 2024", amount: 200 },
  { id: "3", kind: "commission", title: "Pedro Lima", subtitle: "used your code", date: "Oct 28, 2024", amount: 87.2 },
  { id: "4", kind: "commission", title: "Julia Martins", subtitle: "used your code", date: "Oct 14, 2024", amount: 140 },
  { id: "5", kind: "withdrawal", title: "Manual withdrawal", subtitle: "sent to your account", date: "Sep 30, 2024", amount: 150 },
  { id: "6", kind: "withdrawal", title: "Manual withdrawal", subtitle: "sent to your account", date: "Sep 12, 2024", amount: 100 },
];

const VISIBLE_RECORDS = 5;
const PLATFORM_TOTAL = 41360.32;
const EARNINGS = 347.6;
const ACTIVE_REFERRALS = 4;

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const secondary = "text-[#bdbdbd]";

type Filter = "commission" | "withdrawal" | "all";

function EarnPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [filled, setFilled] = useState(true);
  const [code, setCode] = useState("fxp4mr");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [stripeOpen, setStripeOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setFilled(loadScenario() === "daily");
  }, []);

  const link = `https://isla.app/join/${code}`;
  const earnings = filled ? EARNINGS : 0;
  const referrals = filled ? ACTIVE_REFERRALS : 0;

  const rows = useMemo(
    () => (filter === "all" ? HISTORY : HISTORY.filter((e) => e.kind === filter)),
    [filter],
  );
  const visible = showAll ? rows : rows.slice(0, VISIBLE_RECORDS);
  const hidden = rows.length - visible.length;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 px-6 py-8 lg:px-[60px] transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="font-manrope mx-auto w-full max-w-[1100px] space-y-6">
          <header className="space-y-1.5">
            <h1 className="text-[28px] font-extrabold leading-normal text-white">Earn</h1>
            <p className={cn("text-sm", secondary)}>
              Invite friends to Isla and earn 20% of everything they spend — for as long as they
              stay.
            </p>
          </header>

          <div className="flex flex-col items-stretch gap-6 lg:flex-row">
            <section className="flex flex-1 flex-col gap-4 rounded-[20px] border border-border bg-card p-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold text-white">Get paid for invites</h2>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[12px] font-semibold uppercase leading-[18px] tracking-[0.3px] text-primary">
                    Earn 20%, forever
                  </span>
                </div>
                <p className={cn("text-sm leading-normal", secondary)}>
                  Send this link and earn on every payment your invite makes.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-stretch gap-2">
                  <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-border bg-background px-3">
                    <p className="truncate text-[13px] font-bold text-white">{link}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={copyLink}
                    className="h-11 w-[90px] gap-1 rounded-[10px] bg-transparent"
                  >
                    <Copy className="size-4" />
                    Copy
                  </Button>
                </div>
                <button
                  onClick={() => setCustomizeOpen(true)}
                  className="flex items-center gap-2 text-[13px] font-bold text-primary hover:opacity-80"
                >
                  <img src="/earn/sliders.svg" alt="" className="size-4" />
                  Customize this code
                </button>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center rounded-[18px] border border-border bg-background p-5">
                <div className="flex flex-col items-center gap-8">
                  <div className="relative size-[202px] overflow-hidden rounded-[18px]">
                    <img
                      src="/earn/qr.png"
                      alt="Invite QR code"
                      className="absolute left-[-2.97%] top-[-2.97%] h-[107.43%] w-[106.93%] max-w-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        toast("Add to Apple Wallet", { description: "Prototype flow." })
                      }
                      className="flex h-11 items-center gap-2 rounded-xl bg-white px-3.5 text-[13px] font-extrabold text-[#0b0b0b] transition-opacity hover:opacity-90"
                    >
                      <img src="/earn/smartphone.svg" alt="" className="size-[18px]" />
                      Add to Apple Wallet
                    </button>
                    <a
                      href="/earn/qr.png"
                      download="isla-invite-qr.png"
                      className="flex h-11 items-center gap-2 rounded-xl border border-border bg-[#0b0b0b] px-3.5 text-[13px] font-extrabold text-white transition-opacity hover:opacity-90"
                    >
                      <img src="/earn/download.svg" alt="" className="size-[18px]" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[286px]">
              <section className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
                    <span className="text-base font-extrabold text-[#0b0b0b]">MF</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-extrabold leading-[21px] text-white">
                      Marcos Figueiredo
                    </p>
                    <p className={cn("text-xs leading-[18px]", secondary)}>Isla Evangelist</p>
                  </div>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="space-y-2.5">
                  <StatRow label="Platform total" value={usd(PLATFORM_TOTAL)} valueClass="text-white" />
                  <StatRow label="Your total earnings" value={usd(earnings)} />
                  <StatRow
                    label="Active referrals"
                    value={String(referrals)}
                    valueClass={referrals > 0 ? "text-green-400" : undefined}
                  />
                </div>
              </section>

              <section className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold text-white">WITHDRAWAL</p>
                  <p className={cn("text-xs", secondary)}>Manual</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-border bg-background p-4">
                  <p className={cn("text-[11px] uppercase leading-[16.5px] tracking-[0.55px]", secondary)}>
                    Available to withdraw
                  </p>
                  <p className="text-[28px] font-extrabold leading-[35px] text-white">
                    {usd(earnings)}
                  </p>
                </div>
                <Button
                  onClick={() => setStripeOpen(true)}
                  className="h-10 w-full gap-1 rounded-[10px] text-white"
                >
                  <img src="/earn/wallet.svg" alt="" className="size-4" />
                  Request withdrawal
                </Button>
                <div className="space-y-1 rounded-xl border border-border bg-background p-3">
                  <p className="text-xs font-extrabold leading-[18px] text-white">Payments</p>
                  <p className={cn("text-[11px] leading-[18px]", secondary)}>
                    Payments are processed manually. The Isla team will contact you when the amount
                    is available.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <section className="flex flex-col gap-5 rounded-[20px] border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold text-white">Activity</h2>
              <Tabs
                value={filter}
                onValueChange={(v) => {
                  setFilter(v as Filter);
                  setShowAll(false);
                }}
              >
                <TabsList>
                  <TabsTrigger value="commission">Commission</TabsTrigger>
                  <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {filled ? (
              <div>
                {visible.map((e, i) => (
                  <ActivityRow key={e.id} entry={e} divider={i > 0} />
                ))}
                {hidden > 0 && (
                  <div className="pt-3">
                    <button
                      onClick={() => setShowAll(true)}
                      className="flex h-9 w-full items-center justify-center text-[13px] font-bold text-[#f8f8f8] hover:opacity-80"
                    >
                      View {hidden} more {hidden === 1 ? "record" : "records"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 pb-1 pt-3 text-center">
                <p className="text-[13px] font-bold text-[#f8f8f8]">No earnings yet</p>
                <p className={cn("text-xs", secondary)}>Share your link and start earning today</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <StripeDialog open={stripeOpen} onOpenChange={setStripeOpen} amount={earnings} />
      <CustomizeDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        code={code}
        onSave={(next) => {
          setCode(next);
          setCustomizeOpen(false);
          toast.success("Invite code updated");
        }}
      />
    </div>
  );
}

function StatRow({
  label,
  value,
  valueClass = "text-[#f8f8f8]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className={cn("text-xs leading-[18px]", secondary)}>{label}</p>
      <p className={cn("text-[13px] font-extrabold leading-[19.5px]", valueClass)}>{value}</p>
    </div>
  );
}

function ActivityRow({ entry, divider }: { entry: Entry; divider: boolean }) {
  const isCommission = entry.kind === "commission";
  return (
    <div className={cn(divider && "border-t border-border")}>
      <div className="flex items-center gap-3.5 px-1 py-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[14px]",
            isCommission ? "bg-[#0d1a2e]" : "bg-[#1e1600]",
          )}
        >
          <img
            src={isCommission ? "/earn/arrow-up.svg" : "/earn/arrow-down.svg"}
            alt=""
            className="size-[18px]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-[17.5px] text-white">{entry.title}</p>
          <p className={cn("pt-0.5 text-[13px] leading-[19.5px]", secondary)}>
            {entry.subtitle} · {entry.date}
          </p>
        </div>
        {isCommission ? (
          <span className="rounded-full bg-[#0a2a1a] px-[7px] py-1 text-xs font-bold leading-[18px] text-green-400">
            Commission
          </span>
        ) : (
          <span className="rounded-full border border-[#3a3a3a] bg-[#1e1e1e] px-2.5 py-1 text-xs font-bold leading-[18px] text-[#9c9c9c]">
            Paid
          </span>
        )}
        <p
          className={cn(
            "w-[90px] shrink-0 text-right text-[15px] font-extrabold leading-[22.5px]",
            isCommission ? "text-green-400" : "text-white",
          )}
        >
          {isCommission ? "+" : "-"}
          {usd(entry.amount)}
        </p>
      </div>
    </div>
  );
}

function StripeDialog({
  open,
  onOpenChange,
  amount,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-manrope max-w-[448px] gap-0 rounded-3xl border-[#333] bg-[#1e1e1e] px-[46px] pb-8 pt-[66px] sm:rounded-3xl">
        <div className="mx-auto flex size-[44px] items-center justify-center rounded-xl bg-[#635bff]">
          <span className="text-[26px] font-extrabold leading-none text-white">S</span>
        </div>
        <DialogTitle className="mt-4 text-center text-base font-bold text-white">
          Set up payouts with Stripe
        </DialogTitle>
        <DialogDescription className="mt-3 text-center text-[13px] leading-relaxed text-[#bdbdbd]">
          To withdraw {usd(amount)}, connect a payout account through Stripe Connect. Takes about
          2 minutes.
        </DialogDescription>
        <Button
          onClick={() => {
            onOpenChange(false);
            toast("Continue with Stripe", { description: "Prototype flow." });
          }}
          className="mt-8 h-11 w-full rounded-xl bg-[#635bff] text-sm font-bold text-white hover:bg-[#635bff]/90"
        >
          Continue with Stripe
        </Button>
        <button
          onClick={() => onOpenChange(false)}
          className="mt-4 py-2 text-sm font-bold text-white hover:opacity-80"
        >
          Cancel
        </button>
      </DialogContent>
    </Dialog>
  );
}

function CustomizeDialog({
  open,
  onOpenChange,
  code,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  code: string;
  onSave: (code: string) => void;
}) {
  const [draft, setDraft] = useState(code);

  useEffect(() => {
    if (open) setDraft(code);
  }, [open, code]);

  const valid = draft.length >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-manrope max-w-[448px] gap-0 rounded-3xl border-[#333] bg-[#1e1e1e] p-[46px] sm:rounded-3xl">
        <DialogTitle className="text-lg font-bold text-white">Customize your code</DialogTitle>
        <DialogDescription className="mt-1 text-[13px] text-[#bdbdbd]">
          Pick a memorable code for your invite link.
        </DialogDescription>
        <label className="mt-7 flex h-11 items-center gap-1 rounded-xl border border-border bg-background px-4 text-sm">
          <span className="shrink-0 text-[#9c9c9c]">https://isla.app/join/</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            maxLength={20}
            spellCheck={false}
            aria-label="Invite code"
            className="min-w-0 flex-1 bg-transparent font-bold text-white outline-none"
          />
        </label>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 w-[98px] rounded-xl border-border bg-[#1a1a1a] text-sm font-bold text-white"
          >
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => onSave(draft)}
            className="h-10 w-[205px] rounded-xl text-sm font-bold text-white"
          >
            Save Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
