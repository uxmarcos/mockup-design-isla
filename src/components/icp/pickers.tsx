import { useState } from "react";
import { Plus, X, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Selected value as a removable accent chip (same treatment used in onboarding). */
export function SelectedChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
    >
      {label}
      <X className="ml-1 inline size-3 opacity-70" />
    </button>
  );
}

/** Dashed "Add" affordance that turns into a free-text input — same as onboarding. */
export function AddChipButton({
  onAdd,
  placeholder = "Custom...",
  label = "Add",
}: {
  onAdd: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (v) onAdd(v);
    setDraft("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
      >
        <Plus className="mr-1 inline size-3" /> {label}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft("");
          setAdding(false);
        }
      }}
      onBlur={commit}
      placeholder={placeholder}
      className="h-8 w-36 text-xs"
    />
  );
}

/** Selected chips + free-text add button (onboarding ChipGroup, selected-only mode). */
export function ChipGroup({
  options,
  values,
  onToggle,
  allowAdd,
  onAdd,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  allowAdd?: boolean;
  onAdd?: (v: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (v && onAdd) onAdd(v);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            {opt}
            {active && <X className="ml-1 inline size-3 opacity-70" />}
          </button>
        );
      })}
      {allowAdd && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <Plus className="mr-1 inline size-3" /> Add
        </button>
      )}
      {allowAdd && adding && (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={commit}
          placeholder="Custom..."
          className="h-8 w-32 text-xs"
        />
      )}
    </div>
  );
}

/**
 * Selected chips + a dropdown listing the available options (searchable).
 * Used for Industry and Company size.
 */
export function DropdownChipPicker({
  options,
  values,
  onToggle,
  triggerLabel = "Select",
  searchPlaceholder,
  emptyLabel = "Nothing selected yet.",
}: {
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
  triggerLabel?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {values.map((v) => (
          <SelectedChip key={v} label={v} onRemove={() => onToggle(v)} />
        ))}
        {values.length === 0 && (
          <span className="text-xs text-muted-foreground">{emptyLabel}</span>
        )}
        <Popover
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <Plus className="size-3" /> {triggerLabel}
              <ChevronDown className="size-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-1">
            {searchPlaceholder && (
              <div className="px-1 pb-1">
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-8 text-xs"
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                  No results
                </div>
              )}
              {filtered.map((opt) => {
                const selected = values.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onToggle(opt)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                      selected && "text-foreground",
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {selected && <Check className="size-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

/** Selected chips + free-text field with autocomplete suggestions (Location). */
export function AutocompleteChipPicker({
  options,
  values,
  onToggle,
  onAdd,
  placeholder = "Type a country",
  emptyLabel = "Nothing selected yet.",
}: {
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
  onAdd: (v: string) => void;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q
    ? options.filter((o) => o.toLowerCase().includes(q) && !values.includes(o)).slice(0, 6)
    : [];

  const commit = (v: string) => {
    const value = v.trim();
    if (!value || values.includes(value)) {
      setQuery("");
      return;
    }
    onAdd(value);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <SelectedChip key={v} label={v} onRemove={() => onToggle(v)} />
        ))}
        {values.length === 0 && (
          <span className="text-xs text-muted-foreground">{emptyLabel}</span>
        )}
      </div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(results[0] ?? query);
          }
        }}
        placeholder={placeholder}
        className="h-8 max-w-xs text-xs"
      />
      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => commit(opt)}
              className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <Plus className="mr-1 inline size-3" />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
