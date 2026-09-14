// Prototype-only: lets a presenter switch between simulated user states.
import {
  loadOnboarding,
  saveOnboarding,
  saveUser,
  makeInitialTasks,
  type OnboardingData,
} from "@/lib/onboarding-store";

export type ScenarioId = "onboarding" | "workspace_setup" | "daily";

export const SCENARIOS: { id: ScenarioId; label: string; hint: string }[] = [
  {
    id: "onboarding",
    label: "First Interaction — Onboarding",
    hint: "Never entered the platform. Going through onboarding.",
  },
  {
    id: "workspace_setup",
    label: "Workspace Setup",
    hint: "Onboarding done, workspace not configured yet.",
  },
  {
    id: "daily",
    label: "Fully Set Up — Daily Use",
    hint: "All setup complete. Normal daily experience.",
  },
];

const SCENARIO_KEY = "isla.scenario.v1";
const SCREENS_KEY = "isla.screens.v1";
const AGENT_INTRO_KEY = "isla.agentIntro.v1";

export const SCENARIO_EVENT = "isla:scenario-change";

export function loadScenario(): ScenarioId {
  if (typeof window === "undefined") return "daily";
  const raw = localStorage.getItem(SCENARIO_KEY);
  if (raw === "onboarding" || raw === "workspace_setup" || raw === "daily") return raw;
  return "daily";
}

/* ---------- per-screen first visit tracking ---------- */

export function loadVisitedScreens(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCREENS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isScreenVisited(screen: string): boolean {
  return loadVisitedScreens().includes(screen);
}

export function markScreenVisited(screen: string) {
  if (typeof window === "undefined") return;
  const list = loadVisitedScreens();
  if (list.includes(screen)) return;
  localStorage.setItem(SCREENS_KEY, JSON.stringify([...list, screen]));
}

export function resetVisitedScreens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SCREENS_KEY);
}

/* ---------- Isla agent intro modal ---------- */

export function agentIntroSeen(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(AGENT_INTRO_KEY) === "1";
}

export function markAgentIntroSeen() {
  if (typeof window === "undefined") return;
  localStorage.setItem(AGENT_INTRO_KEY, "1");
}

function resetAgentIntro() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AGENT_INTRO_KEY);
}

/* ---------- applying a scenario ---------- */

function completedTasks(ids: string[]) {
  const now = Date.now();
  return makeInitialTasks().map((t) =>
    ids.includes(t.id)
      ? { ...t, status: "completed" as const, completedAt: now }
      : { ...t, status: "pending" as const },
  );
}

/**
 * Writes the simulated state for a scenario and returns the route the
 * presenter should land on.
 */
export function applyScenario(id: ScenarioId): string {
  if (typeof window === "undefined") return "/home";
  localStorage.setItem(SCENARIO_KEY, id);
  resetVisitedScreens();

  const base = loadOnboarding();

  if (id === "onboarding") {
    resetAgentIntro();
    saveUser({ onboardingCompleted: false, displayName: "there" });
    const next: OnboardingData = {
      state: "waiting_linkedin",
      icp: [],
      messages: [],
      tasks: [],
    };
    saveOnboarding(next);
    window.dispatchEvent(new Event(SCENARIO_EVENT));
    return "/onboarding";
  }

  saveUser({ onboardingCompleted: true, displayName: base.linkedinUrl ? "there" : "there" });

  if (id === "workspace_setup") {
    resetAgentIntro();
    const next: OnboardingData = {
      ...base,
      state: "finished",
      completedAt: Date.now(),
      tasks: completedTasks(["task-view-crm"]),
      homeVisited: true,
      crmVisited: true,
      linkedinConnected: false,
      connectionsUploaded: false,
      onboardingCelebrated: false,
      settingsSubtasks: { competitors: false, influencers: false, brandDna: false },
    };
    saveOnboarding(next);
    window.dispatchEvent(new Event(SCENARIO_EVENT));
    return "/home";
  }

  // daily
  markAgentIntroSeen();
  const next: OnboardingData = {
    ...base,
    state: "finished",
    completedAt: Date.now(),
    tasks: completedTasks([
      "task-view-crm",
      "task-connect-linkedin",
      "task-import-connections",
      "task-settings",
      "task-first-post",
    ]),
    homeVisited: true,
    crmVisited: true,
    linkedinConnected: true,
    connectionsUploaded: true,
    onboardingCelebrated: true,
    settingsSubtasks: { competitors: true, influencers: true, brandDna: true },
  };
  saveOnboarding(next);
  window.dispatchEvent(new Event(SCENARIO_EVENT));
  return "/home";
}
