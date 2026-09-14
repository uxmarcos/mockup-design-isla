import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BackButton({ to, onClick, children, className }: BackButtonProps) {
  const baseClass = cn(
    "inline-flex items-center gap-1.5 text-sm font-normal text-secondary-foreground transition-colors duration-200 hover:text-white",
    "[font-family:'Segoe_UI',system-ui,-apple-system,BlinkMacSystemFont,'Helvetica_Neue',sans-serif]",
    className
  );

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        <ArrowLeft className="size-4 shrink-0" />
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClass}>
      <ArrowLeft className="size-4 shrink-0" />
      {children}
    </button>
  );
}
