import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Range = "7d" | "30d" | "all";
export type ReportRange = "7d" | "14d" | "30d" | "60d" | "90d";

type Ctx = {
  range: Range;
  setRange: (r: Range) => void;
  sender: string; // "all" or sender name
  setSender: (s: string) => void;
  factor: number; // scales mocked numbers
};

const RANGE_FACTOR: Record<Range, number> = {
  "7d": 0.22,
  "30d": 0.55,
  all: 1,
};

export const REPORT_RANGE_FACTOR: Record<ReportRange, number> = {
  "7d": 0.22,
  "14d": 0.36,
  "30d": 0.55,
  "60d": 0.78,
  "90d": 1,
};

export const REPORT_RANGE_LABEL: Record<ReportRange, string> = {
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
  "60d": "Last 60 days",
  "90d": "Last 90 days",
};

const CrossFiltersContext = createContext<Ctx>({
  range: "30d",
  setRange: () => {},
  sender: "all",
  setSender: () => {},
  factor: RANGE_FACTOR["30d"],
});

export function CrossFiltersProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<Range>("30d");
  const [sender, setSender] = useState<string>("all");
  return (
    <CrossFiltersContext.Provider
      value={{ range, setRange, sender, setSender, factor: RANGE_FACTOR[range] }}
    >
      {children}
    </CrossFiltersContext.Provider>
  );
}

export function useCrossFilters() {
  return useContext(CrossFiltersContext);
}

/** Tween a numeric value whenever it changes. */
export function useTween(target: number, duration = 600) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

/** Round a scaled number, keeping at least 1 when the base > 0. */
export function scaleCount(n: number, factor: number) {
  if (n <= 0) return 0;
  return Math.max(1, Math.round(n * factor));
}
