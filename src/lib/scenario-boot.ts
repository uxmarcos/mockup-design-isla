import { applyScenario } from "@/lib/scenario-store";

/** Set right before the scenario switcher reloads the page, so that one reload keeps the chosen scenario. */
export const SCENARIO_SKIP_BOOT_KEY = "isla.boot.skip";

// Every time the mockup is opened (any full page load) it starts fully configured:
// "Fully Set Up — Daily Use", with the daily missions on Home and the whole Kanban unlocked.
// Runs at import time so pages read that state on their very first effect.
if (typeof window !== "undefined") {
  try {
    if (sessionStorage.getItem(SCENARIO_SKIP_BOOT_KEY)) {
      sessionStorage.removeItem(SCENARIO_SKIP_BOOT_KEY);
    } else {
      applyScenario("daily");
    }
  } catch {
    /* storage unavailable — pages fall back to their defaults */
  }
}
