import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  icon,
  glow,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  glow?: "emerald" | "cyan";
}) {
  const glowCls = glow === "emerald" ? "glow-emerald" : glow === "cyan" ? "glow-cyan" : "";
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${glowCls}`}>
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
        {icon && (
          <div className="grid size-8 place-items-center rounded-lg bg-secondary text-foreground/80">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <div className="text-4xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="text-sm text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  right,
  children,
  className = "",
  glow,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  glow?: "emerald" | "cyan";
}) {
  const glowCls = glow === "emerald" ? "glow-emerald" : glow === "cyan" ? "glow-cyan" : "";
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 ${glowCls} ${className}`}>
      {(title || right) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h3>
            )}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
