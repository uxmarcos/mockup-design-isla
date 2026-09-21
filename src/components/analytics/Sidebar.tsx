import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType, type ReactElement, type ReactNode } from "react";
import { LogOut, ChevronLeft, ChevronRight, Gift, Pencil } from "lucide-react";
import {
  HomeIcon,
  LeadBoardIcon,
  CalendarIcon,
  AnalyticsIcon,
  CommentsIcon,
  SettingsIcon,
} from "@/components/analytics/nav-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCENARIOS, applyScenario, loadScenario, type ScenarioId } from "@/lib/scenario-store";
import { loadOnboarding, missionProgress } from "@/lib/onboarding-store";
import { useContentStore } from "@/lib/content-requests-store";
import { WORKSPACE_EVENT, resolveWorkspace, type WorkspaceView } from "@/lib/workspace-store";
import { WorkspaceDialog } from "@/components/WorkspaceDialog";


import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";

const NavLink = Link as unknown as ComponentType<{
  to: string;
  search?: Record<string, string>;
  title?: string;
  className?: string;
  children?: ReactNode;
}>;

const rowCls = (active: boolean, collapsed: boolean) =>
  `flex w-full items-center gap-3 rounded-[6px] text-sm font-medium transition-colors ${
    collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
  } ${
    active
      ? "bg-white/10 light:bg-black/[0.06] text-foreground light:text-neutral-900"
      : "text-muted-foreground light:text-neutral-700 hover:text-foreground light:hover:text-neutral-900 hover:bg-white/5 light:hover:bg-black/5"
  }`;

const groupCls = (active: boolean) =>
  `flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? "text-foreground light:text-neutral-900 bg-white/5 light:bg-black/5"
      : "text-muted-foreground light:text-neutral-700 hover:text-foreground light:hover:text-neutral-900 hover:bg-white/5 light:hover:bg-black/5"
  }`;

const subCls = (active: boolean) =>
  `flex w-full items-center rounded-[6px] px-2.5 py-1.5 text-[13px] transition-colors ${
    active
      ? "bg-white/10 light:bg-black/[0.06] text-foreground light:text-neutral-900 font-medium"
      : "text-muted-foreground light:text-neutral-600 hover:text-foreground light:hover:text-neutral-900 hover:bg-white/5 light:hover:bg-black/5"
  }`;

type NavIcon = (p: { className?: string }) => ReactElement;

const EarnIcon: NavIcon = ({ className }) => <Gift className={className} />;


const topItems: { icon: NavIcon; label: string; to: string }[] = [
  { icon: HomeIcon, label: "Home", to: "/home" },
];

const bottomItems: { icon: NavIcon; label: string; to: string }[] = [
  { icon: AnalyticsIcon, label: "Analytics", to: "/analytics" },
  { icon: EarnIcon, label: "Earn", to: "/earn" },
];

type SubItem = { label: string; to: string; search?: Record<string, string> };

const calendarSubItems: SubItem[] = [
  { label: "Calendar", to: "/calendar" },
  { label: "Approvals", to: "/approvals" },
];

const pipelineSubItems: SubItem[] = [
  { label: "Leads", to: "/kanban" },
  { label: "Comments", to: "/comments" },
  { label: "Target Audience", to: "/settings/target-audience" },
];

const settingsSubItems: SubItem[] = [
  { label: "General", to: "/settings/general" },
  { label: "Members", to: "/settings/members" },
  { label: "Security", to: "/settings/security" },
];



function IslaMark({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 960 925" fill="none" className={className}>
      <path d="M536.142 100.408C617.823 97.3663 698.237 109.907 743.553 186.745C756.025 213.541 775.181 225.944 789.001 234.891C793.956 238.099 798.226 240.863 801.255 243.687C806.547 248.768 822.139 257.196 838.854 266.23C860.509 277.935 884.049 290.657 889.513 298.438C935.357 362.84 941.558 400.973 939.736 478.121C924.704 552.361 864.077 728.198 741.826 837.625C667.606 878.783 603.995 909.886 519.418 903.391C517.088 903.234 514.745 903.081 512.393 902.928C495.809 901.845 478.784 900.733 462.601 897.943C448.638 895.856 435.057 892.397 421.46 888.934C413.603 886.934 405.74 884.931 397.794 883.191C393.115 882.167 388.502 881.167 383.95 880.18C312.138 864.608 255.563 852.34 197.169 799.905C186.247 790.098 177.864 778.594 169.309 766.854C168.365 765.559 167.418 764.26 166.466 762.961C130.765 714.231 103.943 660.403 100.591 599.023C99.1833 573.235 100.269 545.83 104.066 520.261C105.214 512.527 106.757 504.852 108.298 497.179C109.433 491.532 110.567 485.885 111.545 480.216C112.767 473.126 114.01 466.033 115.255 458.936C120.316 430.063 125.388 401.13 129.096 372.092C131.388 354.152 132.749 336.234 134.117 318.246C134.36 315.045 134.604 311.841 134.853 308.635C135.019 306.497 135.177 304.355 135.335 302.213C136.393 287.821 137.456 273.36 141.168 259.384C146.922 237.711 157.833 215.982 172.88 199.276C248.503 115.318 410.692 106.912 524.641 101.007C528.533 100.805 532.369 100.607 536.142 100.408ZM555.762 203.891C476.003 153.946 378.379 114.173 298.817 164.432C181.783 238.364 127.873 357.796 169.755 514.099C203.015 638.229 260.425 729.632 324.502 798.629C425.379 907.252 603.535 847.893 708.123 742.837C817.866 632.602 923.863 546.139 887.856 411.759C841.921 240.326 720.719 307.186 555.762 203.891Z" fill="currentColor"/>
    </svg>
  );
}

function IslaWordmark({ className }: { className?: string }) {
  return (
    <svg width="81" height="31" viewBox="0 0 81 31" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16.2572 1.97943C18.9336 1.87977 21.5685 2.29069 23.0534 4.80844C23.4621 5.68647 24.0898 6.09288 24.5426 6.38605C24.705 6.49116 24.8449 6.58173 24.9441 6.67427C25.1175 6.84076 25.6284 7.11692 26.1761 7.41293C26.8857 7.79647 27.6571 8.21333 27.8361 8.4683C29.3383 10.5786 29.5415 11.8281 29.4818 14.356C28.9892 16.7886 27.0026 22.5503 22.9968 26.1359C20.5649 27.4845 18.4805 28.5037 15.7092 28.2908C15.6328 28.2857 15.556 28.2807 15.479 28.2757C14.9356 28.2402 14.3777 28.2037 13.8474 28.1123C13.3899 28.0439 12.9449 27.9306 12.4994 27.8171C12.2419 27.7516 11.9843 27.6859 11.7239 27.6289C11.5706 27.5954 11.4194 27.5626 11.2703 27.5303C8.91721 27.02 7.06342 26.618 5.15002 24.8999C4.79213 24.5786 4.51745 24.2016 4.23712 23.8169C4.20619 23.7745 4.17516 23.7319 4.14397 23.6894C2.97415 22.0926 2.09527 20.3288 1.98544 18.3176C1.93931 17.4726 1.97489 16.5746 2.0993 15.7368C2.13692 15.4834 2.18748 15.2319 2.23797 14.9805C2.27516 14.7954 2.31232 14.6104 2.34437 14.4246C2.38441 14.1923 2.42514 13.9599 2.46593 13.7273C2.63177 12.7813 2.79796 11.8332 2.91946 10.8817C2.99456 10.2939 3.03916 9.70676 3.08399 9.11735C3.09195 9.01246 3.09994 8.90747 3.1081 8.80242C3.11354 8.73237 3.11872 8.66218 3.1239 8.59199C3.15856 8.12041 3.1934 7.64656 3.31503 7.18861C3.50357 6.47845 3.86109 5.76645 4.35414 5.21905C6.83208 2.46799 12.1465 2.19255 15.8803 1.99906C16.0078 1.99244 16.1335 1.98596 16.2572 1.97943ZM16.9001 5.37027C14.2866 3.73372 11.0877 2.43047 8.48072 4.07731C4.64586 6.49985 2.87939 10.4133 4.25174 15.5349C5.34157 19.6022 7.22273 22.5973 9.32234 24.8581C12.6278 28.4173 18.4654 26.4723 21.8925 23.0299C25.4884 19.4179 28.9616 16.5847 27.7818 12.1815C26.2766 6.56414 22.3052 8.75494 16.9001 5.37027Z" fill="currentColor"/>
      <path d="M34.7334 26.7631V11.2273H38.9046V26.7631H34.7334Z" fill="currentColor"/>
      <path d="M55.5605 13.7424L51.7578 14.1573C51.6504 13.7732 51.462 13.4121 51.1933 13.0741C50.9321 12.7361 50.5786 12.4634 50.1333 12.256C49.6876 12.0486 49.142 11.9449 48.4969 11.9449C47.6289 11.9449 46.8991 12.1331 46.3074 12.5095C45.7238 12.8859 45.4358 13.3737 45.4433 13.9729C45.4358 14.4876 45.6238 14.9063 46.0079 15.2289C46.3998 15.5515 47.045 15.8166 47.9438 16.024L50.9629 16.6693C52.6373 17.0303 53.8818 17.6026 54.6961 18.3862C55.5182 19.1697 55.933 20.1953 55.9406 21.4628C55.933 22.5766 55.6063 23.5599 54.9611 24.4126C54.3235 25.2576 53.4362 25.9183 52.2995 26.3945C51.1625 26.8708 49.8567 27.1089 48.3815 27.1089C46.2153 27.1089 44.4714 26.6557 43.1503 25.7492C41.8291 24.8351 41.0417 23.5638 40.7881 21.9352L44.8558 21.5434C45.0399 22.3423 45.4318 22.9454 46.0311 23.3525C46.6301 23.7596 47.41 23.9632 48.3701 23.9632C49.3609 23.9632 50.1562 23.7596 50.7555 23.3525C51.3623 22.9454 51.6658 22.4422 51.6658 21.843C51.6658 21.336 51.4698 20.9173 51.0779 20.587C50.6939 20.2567 50.0946 20.0032 49.2803 19.8265L46.2615 19.1928C44.5638 18.8394 43.3079 18.244 42.4936 17.4067C41.6793 16.5617 41.276 15.4939 41.2835 14.2034C41.276 13.1125 41.5715 12.1677 42.1709 11.3688C42.7777 10.5621 43.6188 9.93992 44.6942 9.50206C45.7775 9.05649 47.026 8.83374 48.4392 8.83374C50.5134 8.83374 52.1458 9.27544 53.3366 10.1588C54.5349 11.0423 55.276 12.2368 55.5605 13.7424Z" fill="currentColor"/>
      <path d="M61.9291 3.16479V26.7636H57.7578V3.16479H61.9291Z" fill="currentColor"/>
      <path d="M69.689 27.1205C68.5677 27.1205 67.5575 26.9207 66.6587 26.5213C65.7674 26.1141 65.0607 25.515 64.5383 24.7237C64.0239 23.9325 63.7664 22.9569 63.7664 21.7969C63.7664 20.7983 63.9508 19.9725 64.3195 19.3195C64.6881 18.6665 65.1914 18.1442 65.829 17.7524C66.4667 17.3606 67.1849 17.0649 67.9838 16.8651C68.7902 16.6577 69.6238 16.508 70.4843 16.4157C71.5213 16.3082 72.3625 16.2122 73.0077 16.1277C73.6532 16.0355 74.1217 15.8972 74.4134 15.7129C74.7132 15.5208 74.8629 15.2251 74.8629 14.8256V14.7565C74.8629 13.8884 74.6057 13.2162 74.0909 12.74C73.5762 12.2637 72.835 12.0255 71.867 12.0255C70.8454 12.0255 70.0347 12.2483 69.4357 12.6939C68.8443 13.1394 68.4448 13.6656 68.2374 14.2725L64.3424 13.7194C64.6498 12.6439 65.157 11.7452 65.8634 11.0231C66.5702 10.2933 67.4346 9.74788 68.4563 9.38682C69.478 9.01809 70.6071 8.83374 71.8438 8.83374C72.6967 8.83374 73.5454 8.93358 74.3904 9.13333C75.2355 9.33304 76.0075 9.66337 76.7064 10.1243C77.4056 10.5775 77.9663 11.1959 78.389 11.9794C78.8192 12.763 79.0342 13.7424 79.0342 14.9178V26.7633H75.0241V24.3319H74.8859C74.6326 24.8236 74.2751 25.2845 73.8144 25.7147C73.3612 26.1372 72.7888 26.479 72.0974 26.7402C71.4139 26.9937 70.6111 27.1205 69.689 27.1205ZM70.7723 24.0554C71.6095 24.0554 72.3356 23.8902 72.95 23.5599C73.5647 23.2219 74.0372 22.7764 74.3675 22.2233C74.7053 21.6702 74.8744 21.0671 74.8744 20.4142V18.3286C74.744 18.4361 74.5212 18.536 74.2059 18.6281C73.8989 18.7203 73.5532 18.801 73.1692 18.8701C72.7848 18.9393 72.4047 19.0007 72.0282 19.0545C71.6517 19.1082 71.3254 19.1544 71.0488 19.1928C70.4266 19.2773 69.8696 19.4155 69.378 19.6076C68.8865 19.7996 68.4986 20.0685 68.2142 20.4142C67.9301 20.7522 67.7879 21.19 67.7879 21.7278C67.7879 22.496 68.0683 23.0759 68.629 23.4677C69.19 23.8595 69.9043 24.0554 70.7723 24.0554Z" fill="currentColor"/>
      <path d="M34.7878 5.71875H38.9594V9.89013H34.7878V5.71875Z" fill="currentColor"/>
    </svg>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useRouterState({ select: (s) => s.location });
  const currentPath = location.pathname;
  const settingsActive = currentPath.startsWith("/settings");
  const pipelineActive = currentPath === "/kanban" || currentPath === "/comments";
  const [settingsOpen, setSettingsOpen] = useState(settingsActive);
  const [pipelineOpen, setPipelineOpen] = useState(true);
  const calendarActive = currentPath === "/calendar" || currentPath === "/approvals";
  const [calendarOpen, setCalendarOpen] = useState(true);
  const { drafts } = useContentStore();
  const pendingApprovals = drafts.filter((d) => d.status === "awaiting").length;

  const [scenario, setScenario] = useState<ScenarioId>("daily");
  const [missions, setMissions] = useState({ done: 0, total: 5 });
  const [workspace, setWorkspace] = useState<WorkspaceView | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  useEffect(() => {
    setScenario(loadScenario());
  }, []);
  useEffect(() => {
    const sync = () => {
      const data = loadOnboarding();
      setMissions(missionProgress(data));
      setWorkspace(resolveWorkspace());
    };
    sync();
    const id = window.setInterval(sync, 1000);
    window.addEventListener("focus", sync);
    window.addEventListener(WORKSPACE_EVENT, sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", sync);
      window.removeEventListener(WORKSPACE_EVENT, sync);
    };
  }, [currentPath]);


  const selectScenario = (id: ScenarioId) => {
    setScenario(id);
    const route = applyScenario(id);
    // Full reload keeps every simulated screen deterministic for the demo.
    window.location.assign(route);
  };
  return (
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 shrink-0 flex-col justify-between border-r border-border light:border-black/5 bg-[#111111] light:bg-[#F8F8F8] text-sidebar-foreground light:text-neutral-900 z-20 transition-[width,background-color,color] duration-200 ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      {/* Toggle handle */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-24 z-30 flex size-6 items-center justify-center rounded-full border border-border light:border-black/10 bg-[#111111] light:bg-white text-muted-foreground light:text-neutral-500 hover:text-foreground light:hover:text-neutral-900 light:shadow-sm"
      >
        {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      <div>
        {/* Brand */}
        <div className={`flex items-center h-[60px] border-b border-border light:border-black/5 ${collapsed ? "justify-center px-2" : "px-5"}`}>
          {collapsed ? (
            <IslaMark className="size-6 text-foreground light:text-neutral-900" />
          ) : (
            <>
              <IslaWordmark className="h-6 w-auto text-foreground light:text-neutral-900" />
              {/* Hidden scenario switcher — only a subtle chevron, invisible until hover */}
              <Select value={scenario} onValueChange={(v) => selectScenario(v as ScenarioId)}>
                <SelectTrigger
                  aria-label="Select scenario"
                  className="ml-1.5 h-5 w-5 justify-center rounded-[4px] border-0 bg-transparent p-0 text-muted-foreground opacity-0 shadow-none hover:opacity-60 focus:opacity-60 data-[state=open]:opacity-60 [&>svg]:size-3.5"
                />
                <SelectContent align="start" className="w-[260px]">
                  {SCENARIOS.map((sc) => (
                    <SelectItem key={sc.id} value={sc.id} className="items-start">
                      <span className="block">
                        <span className="block text-[13px] font-medium">{sc.label}</span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {sc.hint}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Workspace */}
        <div className={`py-4 border-b border-border light:border-black/5 ${collapsed ? "px-2 flex justify-center" : "px-4"}`}>
          <div className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
            <button
              type="button"
              onClick={() => workspace && setWorkspaceOpen(true)}
              aria-label="Edit workspace"
              title="Edit workspace"
              className="group relative size-9 shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {workspace && !workspace.logo ? (
                <div className="flex size-9 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground light:text-neutral-900">
                  {workspace.name.trim().charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src={workspace?.logo}
                  alt={workspace?.name ?? ""}
                  className="size-9 rounded-md object-cover"
                />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                  <Pencil className="size-3.5 text-white" />
                </span>
              </span>
            </button>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-semibold text-foreground light:text-neutral-900">
                  {workspace?.name ?? "Nortex"}
                </div>
                <div className="text-xs text-muted-foreground light:text-neutral-500">
                  /{workspace?.slug ?? "nortex"}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Nav */}
        <nav className={`p-3 space-y-1`}>
          {topItems.map((it) => {
            const Icon = it.icon;
            const active = currentPath === it.to;
            return (
              <NavLink
                key={it.label}
                to={it.to}
                title={collapsed ? it.label : undefined}
                className={rowCls(active, collapsed)}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && it.label}
                {it.to === "/home" && !collapsed && (
                  <span className="ml-auto rounded-full bg-white/10 light:bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground light:text-neutral-700">
                    {missions.done}/{missions.total}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Pipeline group */}
          {collapsed ? (
            <NavLink to="/kanban" title="Pipeline" className={rowCls(pipelineActive, collapsed)}>
              <LeadBoardIcon className="size-4 shrink-0" />
            </NavLink>
          ) : (
            <div>
              <button
                onClick={() => setPipelineOpen((o) => !o)}
                aria-expanded={pipelineOpen}
                className={groupCls(pipelineActive)}
              >
                <LeadBoardIcon className="size-4 shrink-0" />
                Pipeline
                <ChevronRight
                  className={`ml-auto size-3.5 transition-transform ${pipelineOpen ? "rotate-90" : ""}`}
                />
              </button>
              {pipelineOpen && (
                <div className="mt-1 ml-[26px] space-y-0.5 border-l border-border light:border-black/10 pl-2">
                  {pipelineSubItems.map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.to}
                      search={sub.search}
                      className={subCls(currentPath === sub.to)}
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar group */}
          {collapsed ? (
            <NavLink to="/calendar" title="Calendar" className={rowCls(calendarActive, collapsed)}>
              <CalendarIcon className="size-4 shrink-0" />
            </NavLink>
          ) : (
            <div>
              <button
                onClick={() => setCalendarOpen((o) => !o)}
                aria-expanded={calendarOpen}
                className={groupCls(calendarActive)}
              >
                <CalendarIcon className="size-4 shrink-0" />
                Calendar
                <ChevronRight
                  className={`ml-auto size-3.5 transition-transform ${calendarOpen ? "rotate-90" : ""}`}
                />
              </button>
              {calendarOpen && (
                <div className="mt-1 ml-[26px] space-y-0.5 border-l border-border light:border-black/10 pl-2">
                  {calendarSubItems.map((sub) => (
                    <NavLink key={sub.label} to={sub.to} className={subCls(currentPath === sub.to)}>
                      {sub.label}
                      {sub.to === "/approvals" && pendingApprovals > 0 && (
                        <span className="ml-auto grid min-w-4 h-4 place-items-center rounded-full bg-[#FFD667]/15 px-1 text-[10px] font-semibold tabular-nums text-[#FFD667] light:bg-[#B7791F]/15 light:text-[#7A5200]">
                          {pendingApprovals}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {bottomItems.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.label}
                to={it.to}
                title={collapsed ? it.label : undefined}
                className={rowCls(currentPath === it.to, collapsed)}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && it.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className={`space-y-1 ${collapsed ? "p-3" : "p-4"}`}>
        {/* Settings + submenu, directly above the profile */}
        {collapsed ? (
          <NavLink
            to="/settings/general"
            title="Settings"
            className={rowCls(settingsActive, collapsed)}
          >
            <SettingsIcon className="size-4 shrink-0" />
          </NavLink>
        ) : (
          <div className="mb-2">
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              aria-expanded={settingsOpen}
              className={groupCls(settingsActive)}
            >
              <SettingsIcon className="size-4 shrink-0" />
              Settings
              <ChevronRight
                className={`ml-auto size-3.5 transition-transform ${settingsOpen ? "rotate-90" : ""}`}
              />
            </button>
            {settingsOpen && (
              <div className="mt-1 ml-[26px] space-y-0.5 border-l border-border light:border-black/10 pl-2">
                {settingsSubItems.map((sub) => (
                  <NavLink
                    key={sub.label}
                    to={sub.to}
                    className={subCls(currentPath === sub.to)}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center justify-between border-t border-border light:border-black/5 pt-4 ${collapsed ? "flex-col gap-3" : ""}`}>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground light:text-neutral-900">Chris Theroux</div>
              <div className="text-xs text-muted-foreground light:text-neutral-500">chris@nortex.com</div>
            </div>
          )}
          <div className={`flex items-center gap-1 ${collapsed ? "flex-col" : ""}`}>
            <AnimatedThemeToggler />
            <button className="text-[#E1634E] hover:opacity-80 inline-flex items-center justify-center rounded-md p-2 hover:bg-white/5 light:hover:bg-black/5" aria-label="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </div>
      {workspace && (
        <WorkspaceDialog open={workspaceOpen} onOpenChange={setWorkspaceOpen} workspace={workspace} />
      )}
    </aside>
  );
}



export function useSidebarState() {
  return useState(false);
}
