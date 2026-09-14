import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Cmd =
  | { kind: "block"; tag: string }
  | { kind: "inline"; name: "bold" | "italic" }
  | { kind: "list"; name: "insertUnorderedList" | "insertOrderedList" }
  | { kind: "hr" };

const TOOLS: { label: string; icon: typeof Bold; cmd: Cmd }[] = [
  { label: "Text", icon: Type, cmd: { kind: "block", tag: "p" } },
  { label: "Heading 1", icon: Heading1, cmd: { kind: "block", tag: "h1" } },
  { label: "Heading 2", icon: Heading2, cmd: { kind: "block", tag: "h2" } },
  { label: "Heading 3", icon: Heading3, cmd: { kind: "block", tag: "h3" } },
  { label: "Bold", icon: Bold, cmd: { kind: "inline", name: "bold" } },
  { label: "Italic", icon: Italic, cmd: { kind: "inline", name: "italic" } },
  { label: "Bullet list", icon: List, cmd: { kind: "list", name: "insertUnorderedList" } },
  {
    label: "Numbered list",
    icon: ListOrdered,
    cmd: { kind: "list", name: "insertOrderedList" },
  },
  { label: "Quote", icon: Quote, cmd: { kind: "block", tag: "blockquote" } },
  { label: "Divider", icon: Minus, cmd: { kind: "hr" } },
];

const PROSE = [
  "outline-none",
  "[&_h1]:mt-8 [&_h1]:mb-2 [&_h1]:text-[28px] [&_h1]:font-semibold [&_h1]:tracking-tight",
  "[&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mt-6 [&_h3]:mb-1.5 [&_h3]:text-[17px] [&_h3]:font-semibold",
  "[&_p]:my-2 [&_p]:text-[15px] [&_p]:leading-8",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:text-[15px] [&_li]:leading-8",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-[15px] [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  "[&_hr]:my-8 [&_hr]:border-border",
  "[&_b]:font-semibold [&_strong]:font-semibold",
].join(" ");

export function DocEditor({
  docId,
  content,
  onChange,
  placeholder = "Start writing what Isla should know…",
}: {
  docId: string;
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [toolbar, setToolbar] = useState<{ top: number; left: number } | null>(null);
  const [empty, setEmpty] = useState(!content);

  // Load content when switching documents (never while typing).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = content || "<p><br></p>";
    setEmpty(!content);
    // place caret at start for a fresh doc
    if (!content) {
      requestAnimationFrame(() => {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const html = el.innerHTML;
    const text = el.textContent?.trim() ?? "";
    setEmpty(text.length === 0);
    onChange(text.length === 0 ? "" : html);
  }, [onChange]);

  const updateToolbar = useCallback(() => {
    const sel = window.getSelection();
    const el = ref.current;
    if (!sel || sel.isCollapsed || !el || sel.rangeCount === 0) {
      setToolbar(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      setToolbar(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setToolbar(null);
      return;
    }
    setToolbar({ top: rect.top - 46, left: rect.left + rect.width / 2 });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbar);
    window.addEventListener("scroll", updateToolbar, true);
    return () => {
      document.removeEventListener("selectionchange", updateToolbar);
      window.removeEventListener("scroll", updateToolbar, true);
    };
  }, [updateToolbar]);

  const run = (cmd: Cmd) => {
    ref.current?.focus();
    if (cmd.kind === "block") document.execCommand("formatBlock", false, cmd.tag);
    else if (cmd.kind === "inline") document.execCommand(cmd.name);
    else if (cmd.kind === "list") document.execCommand(cmd.name);
    else document.execCommand("insertHorizontalRule");
    emit();
    updateToolbar();
  };

  return (
    <div className="relative">
      {toolbar && (
        <div
          className="fixed z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
          style={{ top: toolbar.top, left: toolbar.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {TOOLS.map((t) => (
            <button
              key={t.label}
              title={t.label}
              onClick={() => run(t.cmd)}
              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <t.icon className="size-3.5" />
            </button>
          ))}
        </div>
      )}

      {/* clicking anywhere in the area focuses the editor */}
      <div
        className="min-h-[60vh]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) ref.current?.focus();
        }}
      >
        <div className="relative">
          {empty && (
            <span className="pointer-events-none absolute left-0 top-0 text-[15px] leading-8 text-muted-foreground/60">
              {placeholder}
            </span>
          )}
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            role="textbox"
            aria-multiline="true"
            aria-label="Document content"
            onInput={emit}
            onBlur={emit}
            onMouseUp={updateToolbar}
            onKeyUp={updateToolbar}
            className={cn("min-h-[60vh] w-full text-foreground", PROSE)}
          />
        </div>
      </div>
    </div>
  );
}
