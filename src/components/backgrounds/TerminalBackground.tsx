import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FaultyTerminal = lazy(() => import("./FaultyTerminal.jsx"));

/** Tracks the app's light/dark class on <html> so the shader can adapt. */
function useIsLight() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setIsLight(el.classList.contains("light"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isLight;
}

/**
 * Isla-blue animated terminal backdrop.
 * Sits behind page content; never captures pointer events.
 */
export function TerminalBackground({ className }: { className?: string }) {
  const isLight = useIsLight();

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <FaultyTerminal
            scale={1.6}
            gridMul={[2, 1]}
            digitSize={1.3}
            timeScale={0.35}
            scanlineIntensity={0.4}
            glitchAmount={1}
            flickerAmount={0.6}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0.1}
            tint={isLight ? "#0381A2" : "#00BFFF"}
            mouseReact={false}
            pageLoadAnimation
            brightness={isLight ? 0.9 : 0.5}
            lightMode={isLight}
          />
        </Suspense>
      </ClientOnly>
      {/* Softens the effect so the hub content stays legible in both themes. */}
      <div
        className={cn(
          "absolute inset-0",
          isLight
            ? "bg-gradient-to-b from-white/70 via-white/60 to-white/85"
            : "bg-gradient-to-b from-background/70 via-background/60 to-background/85",
        )}
      />
    </div>
  );
}
