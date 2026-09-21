import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type CrumbItem = { label: string; onClick?: () => void };

/**
 * Contextual navigation for the post-idea subpages, reached from Calendar.
 * The first crumb carries the ← affordance and returns to the origin screen.
 *
 * Examples:
 *   ← Calendar / Post Ideas
 *   ← Calendar / Post Ideas / Post title
 */
export function HubBreadcrumb({
  page,
  className,
  onBack,
  /** First crumb. Defaults to "Calendar" → /calendar. */
  root,
  /** Optional intermediate crumbs between root and the current page. */
  trail = [],
  /** Truncate the current page label (px). */
  pageMaxWidth,
}: {
  page: string;
  className?: string;
  onBack?: () => void;
  root?: { label: string; to?: string; onClick?: () => void };
  trail?: CrumbItem[];
  pageMaxWidth?: number;
}) {
  const rootLabel = root?.label ?? "Calendar";
  const rootTo = root?.to ?? "/calendar";
  const rootOnClick = root?.onClick ?? onBack;

  const label = (
    <span className="font-medium text-muted-foreground transition-colors group-hover:text-foreground">
      {rootLabel}
    </span>
  );

  const linkClass =
    "group -ml-1 inline-flex items-center gap-2 rounded-md px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const Separator = () => (
    <span aria-hidden className="text-muted-foreground/50">
      /
    </span>
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex min-w-0 items-center gap-2 text-sm", className)}
    >
      {rootOnClick ? (
        <button type="button" onClick={rootOnClick} className={linkClass}>
          <ArrowLeft className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          {label}
        </button>
      ) : (
        <Link to={rootTo} className={linkClass}>
          <ArrowLeft className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          {label}
        </Link>
      )}

      {trail.map((crumb) => (
        <span key={crumb.label} className="flex items-center gap-2">
          <Separator />
          {crumb.onClick ? (
            <button
              type="button"
              onClick={crumb.onClick}
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="font-medium text-muted-foreground">{crumb.label}</span>
          )}
        </span>
      ))}

      <Separator />
      <span
        className="truncate font-semibold text-foreground"
        style={pageMaxWidth ? { maxWidth: pageMaxWidth } : undefined}
        title={page}
      >
        {page}
      </span>
    </nav>
  );
}
