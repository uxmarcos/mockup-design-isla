import { applyScenario } from "@/lib/scenario-store";

// Every new browser session of the mockup starts in "Fully Set Up — Daily Use".
// Runs at import time so pages read the daily state on their very first effect.
if (typeof window !== "undefined") {
  try {
    if (!sessionStorage.getItem("isla.boot.v1")) {
      sessionStorage.setItem("isla.boot.v1", "1");
      applyScenario("daily");
    }
  } catch {
    /* storage unavailable — pages fall back to their defaults */
  }
}
