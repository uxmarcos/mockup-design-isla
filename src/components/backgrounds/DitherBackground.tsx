import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// @ts-expect-error -- JS component from React Bits, no types shipped
const Dither = lazy(() => import("./Dither.jsx"));

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
 * Dithered wave backdrop tuned to the Isla blue palette.
 * Sits behind page content; never captures pointer events.
 */
export function DitherBackground({ className }: { className?: string }) {
  const isLight = useIsLight();

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          {/*
            Opacity keeps the dither texture subtle; Light Mode needs more
            presence so the motion reads against the white page.
            pointer-events-auto only on this layer so the original shader
            mouse interaction receives movement — foreground content sits on
            a higher z-index and stays fully interactive.
          */}
          <div
            className={cn(
              "pointer-events-auto absolute inset-0",
              isLight ? "opacity-80" : "opacity-30",
            )}
          >
          <Dither
            waveSpeed={0.03}
            waveFrequency={2.6}
            waveAmplitude={0.32}
            colorNum={5}
            pixelSize={3}
            enableMouseInteraction
            mouseRadius={0.5}
            // Neutral gray #909090 in both themes (no blue tint)
            waveColor={[0.565, 0.565, 0.565]}
            backgroundColor={isLight ? [1, 1, 1] : [0.04, 0.04, 0.04]}
          />
          </div>
        </Suspense>
      </ClientOnly>
      {/* Softens the effect so the hub content stays legible in both themes. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isLight
            ? "bg-gradient-to-b from-white/40 via-white/30 to-white/55"
            : "bg-gradient-to-b from-background/55 via-background/45 to-background/70",
        )}
      />

    </div>
  );
}
