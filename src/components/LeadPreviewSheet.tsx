import { useState, createContext, useContext, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LeadDetailSheet, findOrSynthLead, type Lead } from "@/routes/kanban";

type PreviewLead = {
  name: string;
  avatarUrl?: string;
};

type Ctx = {
  open: (lead: PreviewLead) => void;
};

const LeadPreviewContext = createContext<Ctx | null>(null);

export function LeadPreviewProvider({ children }: { children: ReactNode }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const value = useMemo<Ctx>(
    () => ({ open: (l) => setLead(findOrSynthLead(l.name)) }),
    [],
  );
  return (
    <LeadPreviewContext.Provider value={value}>
      {children}
      <LeadDetailSheet lead={lead} onClose={() => setLead(null)} />
    </LeadPreviewContext.Provider>
  );
}

function useLeadPreview() {
  return useContext(LeadPreviewContext);
}

/**
 * Inline avatar+name that opens the full lead drawer (same as Kanban) on the current page.
 */
export function LeadInline({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string;
  className?: string;
}) {
  const ctx = useLeadPreview();
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    ctx?.open({ name, avatarUrl });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline items-baseline rounded-sm px-0.5 -mx-0.5 outline-none transition-colors",
        "hover:text-[#00BFFF] focus-visible:text-[#00BFFF] focus-visible:ring-1 focus-visible:ring-[#00BFFF]/40",
        className,
      )}
      aria-label={`Preview ${name}`}
    >
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          className="mr-1 inline-block size-4 rounded-full object-cover align-[-2px] ring-1 ring-transparent transition-all group-hover:ring-[#00BFFF]/60"
        />
      )}
      <span className="font-medium text-foreground/90 underline-offset-2 group-hover:underline group-hover:text-[#00BFFF]">
        {name}
      </span>
    </button>
  );
}
