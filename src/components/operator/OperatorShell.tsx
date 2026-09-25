import { useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Inbox,
  LogOut,
  Timer,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";
import { CalendarIcon, HomeIcon } from "@/components/analytics/nav-icons";
import { IslaMark, IslaWordmark, rowCls } from "@/components/analytics/Sidebar";
import { OPERATORS } from "@/lib/operator-data";
import { useOperatorWorkspace } from "@/lib/operator-store";
import { NewPostDialog } from "@/components/operator/NewPostDialog";
import { NewPostContext, OLink, type NewPostPreset } from "@/components/operator/nav";
import { cn } from "@/lib/utils";

type NavIcon = (p: { className?: string }) => ReactNode;
const lucide =
  (Icon: LucideIcon): NavIcon =>
  ({ className }) => <Icon className={className} />;

type NavItem = {
  label: string;
  to: string;
  icon: NavIcon;
  badge?: number;
  tone?: "alert";
  active: boolean;
};

export function OperatorShell({ children }: { children: ReactNode }) {
  const ws = useOperatorWorkspace();
  const path = useRouterState({ select: (s) => s.location.pathname }).replace(/\/$/, "") || "/";
  const [collapsed, setCollapsed] = useState(false);

  const [newOpen, setNewOpen] = useState(false);
  const [preset, setPreset] = useState<NewPostPreset>({});
  const openNewPost = (p: NewPostPreset = {}) => {
    setPreset(p);
    setNewOpen(true);
  };

  const items: NavItem[] = [
    {
      label: "Clients",
      to: "/ops/clients",
      icon: HomeIcon,
      active: path.startsWith("/ops/clients"),
    },
    {
      label: "Inbox",
      to: "/ops/inbox",
      icon: lucide(Inbox),
      badge: ws.counts.unread,
      active: path === "/ops/inbox",
    },
    {
      label: "Calendar",
      to: "/ops/calendar",
      icon: CalendarIcon,
      badge: ws.counts.gaps,
      tone: "alert",
      active: path === "/ops/calendar",
    },
    {
      label: "Posts",
      to: "/ops/posts",
      icon: lucide(FileText),
      active: path.startsWith("/ops/posts"),
    },
    {
      label: "Reports",
      to: "/ops/reports",
      icon: lucide(Timer),
      active: path === "/ops/reports",
    },
  ];

  return (
    <NewPostContext.Provider value={openNewPost}>
      <div className="flex min-h-screen bg-background text-foreground">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 hidden shrink-0 flex-col justify-between border-r border-border bg-[#111111] text-sidebar-foreground transition-[width,background-color,color] duration-200 light:border-black/5 light:bg-[#F8F8F8] light:text-neutral-900 lg:flex",
            collapsed ? "w-[72px]" : "w-[240px]",
          )}
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-24 z-30 flex size-6 items-center justify-center rounded-full border border-border bg-[#111111] text-muted-foreground hover:text-foreground light:border-black/10 light:bg-white light:text-neutral-500 light:shadow-sm light:hover:text-neutral-900"
          >
            {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
          </button>

          <div>
            <div
              className={cn(
                "flex h-[60px] items-center border-b border-border light:border-black/5",
                collapsed ? "justify-center px-2" : "gap-2 px-5",
              )}
            >
              {collapsed ? (
                <IslaMark className="size-6 text-foreground light:text-neutral-900" />
              ) : (
                <>
                  <IslaWordmark className="h-6 w-auto text-foreground light:text-neutral-900" />
                  <span className="rounded-full border border-violet/40 bg-violet/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet">
                    Ops
                  </span>
                </>
              )}
            </div>

            <div
              className={cn(
                "border-b border-border py-4 light:border-black/5",
                collapsed ? "flex justify-center px-2" : "px-4",
              )}
            >
              <div className={cn("flex items-center", !collapsed && "gap-2.5")}>
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-xs font-bold text-primary light:text-[#0B6A8F]">
                  {ws.operator.initials}
                </span>
                {!collapsed && (
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-sm font-semibold text-foreground light:text-neutral-900">
                      {ws.operator.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground light:text-neutral-500">
                      {ws.seats.length} seats · {ws.workspaces.length} workspaces
                    </div>
                  </div>
                )}
              </div>
            </div>

            <nav className="space-y-1 p-3">
              {items.map((it) => (
                <OLink
                  key={it.label}
                  to={it.to}
                  title={collapsed ? it.label : undefined}
                  className={rowCls(it.active, collapsed)}
                >
                  <it.icon className="size-4 shrink-0" />
                  {!collapsed && it.label}
                  {!collapsed && !!it.badge && it.badge > 0 && (
                    <span
                      className={cn(
                        "ml-auto grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                        it.tone === "alert"
                          ? "bg-destructive text-white"
                          : "bg-white/10 text-foreground light:bg-black/[0.06] light:text-neutral-700",
                      )}
                    >
                      {it.badge}
                    </span>
                  )}
                </OLink>
              ))}
            </nav>
          </div>

          <div className={collapsed ? "p-3" : "p-4"}>
            <div
              className={cn(
                "flex items-center justify-between border-t border-border pt-4 light:border-black/5",
                collapsed && "flex-col gap-3",
              )}
            >
              {!collapsed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="-ml-1 flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-white/5 light:hover:bg-black/5"
                    >
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate text-sm font-semibold text-foreground light:text-neutral-900">
                          {ws.operator.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground light:text-neutral-500">
                          {ws.operator.email}
                        </span>
                      </span>
                      <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="w-[220px]">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Switch operator (demo)
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {OPERATORS.map((o) => (
                      <DropdownMenuItem key={o.id} onClick={() => ws.setOperatorId(o.id)}>
                        {o.name}
                        {o.id === ws.operator.id && (
                          <span className="ml-auto text-xs text-muted-foreground">current</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
                <AnimatedThemeToggler />
                <button
                  className="inline-flex items-center justify-center rounded-md p-2 text-[#E1634E] hover:bg-white/5 hover:opacity-80 light:hover:bg-black/5"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main
          className={cn(
            "flex min-h-screen flex-1 flex-col transition-[margin] duration-200",
            collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
          )}
        >
          {children}
        </main>

        <NewPostDialog
          open={newOpen}
          onOpenChange={setNewOpen}
          preset={preset}
          seats={ws.seats}
          posts={ws.posts}
          operator={ws.operator}
        />
      </div>
    </NewPostContext.Provider>
  );
}
