import { createContext, useContext } from "react";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
  useExternalStoreRuntime,
  type AppendMessage,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ChatLine = { id: string; role: "user" | "team"; text: string; at: string };

const DeleteContext = createContext<((id: string) => void) | null>(null);
const ReadOnlyContext = createContext(false);
const PeerContext = createContext("Isla team");

function Stamp() {
  const readOnly = useContext(ReadOnlyContext);
  const createdAt = useAuiState((s) => s.message.createdAt);
  if (!readOnly || !createdAt) return null;
  return (
    <div className="mt-1 text-[10px] text-muted-foreground">
      {createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
      {createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
    </div>
  );
}

function UserMessage() {
  const id = useAuiState((s) => s.message.id);
  const onDelete = useContext(DeleteContext);
  const readOnly = useContext(ReadOnlyContext);
  return (
    <MessagePrimitive.Root className="group flex items-center justify-end gap-1">
      {!readOnly && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(id)}
          aria-label="Delete message"
          title="Delete message"
          className="grid size-6 place-items-center rounded-[8px] text-muted-foreground opacity-0 transition hover:bg-white/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 light:hover:bg-black/5"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
      <div className="max-w-[85%]">
        <div className="rounded-2xl rounded-br-sm bg-muted px-3 py-2 text-[13px] leading-relaxed text-foreground">
          <MessagePrimitive.Parts />
        </div>
        <div className="text-right">
          <Stamp />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

/** Messages from the other side of the conversation — written by a person, nothing here is automated. */
function TeamMessage() {
  const peer = useContext(PeerContext);
  return (
    <MessagePrimitive.Root className="flex justify-start">
      <div className="max-w-[85%] text-[13px] leading-relaxed text-foreground/90">
        <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-primary">
          {peer}
        </div>
        <MessagePrimitive.Parts />
        <Stamp />
      </div>
    </MessagePrimitive.Root>
  );
}

const toMessage =
  (viewer: ChatLine["role"]) =>
  (m: ChatLine): ThreadMessageLike => ({
    id: m.id,
    role: m.role === viewer ? "user" : "assistant",
    content: [{ type: "text", text: m.text }],
    createdAt: new Date(m.at),
  });

/**
 * ChatGPT-style thread (assistant-ui) controlled by the caller. The user can send several
 * requests and delete their own; the Isla team answers manually later.
 */
export function ChangeRequestChat({
  messages,
  onSend,
  onDelete,
  readOnly = false,
  viewer = "user",
  peerLabel = "Isla team",
  placeholder = "Describe the changes you'd like…",
  emptyTitle = "No requests yet",
  emptyHint = "Tell our team what you'd like to change.",
}: {
  messages: ChatLine[];
  onSend?: (text: string) => void;
  onDelete?: (id: string) => void;
  /** Whose side is on the right. The client platform is "user"; the Operator Panel is "team". */
  viewer?: ChatLine["role"];
  /** Label above the other side's messages. */
  peerLabel?: string;
  placeholder?: string;
  emptyTitle?: string;
  emptyHint?: string;
  /** Closed conversation (the post was already approved): no composer, no delete. */
  readOnly?: boolean;
}) {
  const runtime = useExternalStoreRuntime<ChatLine>({
    messages,
    convertMessage: toMessage(viewer),
    isRunning: false,
    onNew: async (message: AppendMessage) => {
      const text = message.content
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("")
        .trim();
      if (text) onSend?.(text);
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ReadOnlyContext.Provider value={readOnly}>
      <PeerContext.Provider value={peerLabel}>
      <DeleteContext.Provider value={onDelete ?? null}>
        <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
          <ThreadPrimitive.Viewport className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            <ThreadPrimitive.Empty>
              <div className="grid h-full place-items-center py-8 text-center">
                <div>
                  <MessageSquare className="mx-auto size-7 text-muted-foreground/50" />
                  <div className="mt-2 text-sm font-medium">{emptyTitle}</div>
                  <p className="mx-auto mt-1 max-w-[220px] text-xs text-muted-foreground">
                    {emptyHint}
                  </p>
                </div>
              </div>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages
              components={{ UserMessage, AssistantMessage: TeamMessage }}
            />
          </ThreadPrimitive.Viewport>

          {readOnly ? (
            <div className="shrink-0 border-t border-border/60 px-3 py-2.5 text-center text-[11px] text-muted-foreground">
              Approved — this conversation is closed.
            </div>
          ) : (
          <div className="shrink-0 border-t border-border/60 p-3">
            <ComposerPrimitive.Root className="flex items-end gap-1 rounded-xl border border-border bg-background/60 px-3 py-1.5 transition focus-within:border-primary/50">
              <ComposerPrimitive.Input
                rows={1}
                placeholder={placeholder}
                className="max-h-32 min-h-0 flex-1 resize-none bg-transparent py-2 text-[13px] outline-none placeholder:text-muted-foreground"
              />
              <ComposerPrimitive.Send asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Send message"
                  title="Send message"
                  className="mb-0.5 size-7 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <Send className="size-3.5" />
                </Button>
              </ComposerPrimitive.Send>
            </ComposerPrimitive.Root>
          </div>
          )}
        </ThreadPrimitive.Root>
      </DeleteContext.Provider>
      </PeerContext.Provider>
      </ReadOnlyContext.Provider>
    </AssistantRuntimeProvider>
  );
}
