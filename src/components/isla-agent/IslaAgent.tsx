import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { X, Send, Play, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import islaLogo from "@/assets/isla-ai-icon.svg";
import { guideForPath, tutorReply, type ScreenGuide } from "@/lib/agent-guides";
import {
  agentIntroSeen,
  isScreenVisited,
  markAgentIntroSeen,
  markScreenVisited,
  SCENARIO_EVENT,
} from "@/lib/scenario-store";

type Msg = { id: string; role: "assistant" | "user"; content: string; video?: string };

const uid = () => Math.random().toString(36).slice(2);

export function IslaAgent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const guide = useMemo(() => guideForPath(pathname), [pathname]);

  const [open, setOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [answered, setAnswered] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [bump, setBump] = useState(0);

  // React to scenario switches (visited screens are reset there).
  useEffect(() => {
    const onChange = () => setBump((b) => b + 1);
    window.addEventListener(SCENARIO_EVENT, onChange);
    return () => window.removeEventListener(SCENARIO_EVENT, onChange);
  }, []);

  // On a screen's first visit the panel shows video + FAQs, but only when the user opens it.
  useEffect(() => {
    const fresh = !isScreenVisited(guide.key);
    setFirstVisit(fresh);
    setMessages([]);
    setAnswered([]);
    setInput("");
    if (fresh) {
      markScreenVisited(guide.key);
      if (!agentIntroSeen() && pathname !== "/onboarding") {
        setIntroOpen(true);
      }
    }
    setOpen(false);
  }, [guide.key, pathname, bump]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const push = (m: Msg) => setMessages((prev) => [...prev, m]);

  const reply = (content: string, video?: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      push({ id: uid(), role: "assistant", content, video });
    }, 550);
  };

  const askFaq = (q: string, a: string, video?: string) => {
    push({ id: uid(), role: "user", content: q });
    setAnswered((prev) => [...prev, q]);
    reply(a, video);
  };

  const submit = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    push({ id: uid(), role: "user", content: text });
    const r = tutorReply(text, guide);
    reply(r.a, r.video);
  };

  const remainingFaqs = guide.faqs.filter((f) => !answered.includes(f.q));

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Isla Agent"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-border light:border-[#E6E6E6] bg-[#111111] light:bg-white px-4 py-3 text-sm font-medium text-white light:text-neutral-900 shadow-lg transition-transform hover:scale-[1.03]"
        >
          <img src={islaLogo} alt="" className="size-6 rounded-md" />
          Ask Isla
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex h-[min(640px,calc(100vh-3rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border light:border-[#E6E6E6] bg-card light:bg-white shadow-2xl">
          <header className="flex items-center gap-3 border-b border-border light:border-[#E6E6E6] px-4 py-3">
            <img src={islaLogo} alt="" className="size-8 rounded-md" />
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-semibold text-foreground">Isla Agent</div>
              <div className="truncate text-[11px] text-muted-foreground">
                Guiding you on {guide.title}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Isla Agent"
              className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {firstVisit && (
              <>
                <p className="text-sm leading-relaxed text-foreground/90">{guide.summary}</p>

                {/* Video preview */}
                <button
                  onClick={() => setVideoOpen(true)}
                  className="group relative w-full overflow-hidden rounded-xl border border-border light:border-[#E6E6E6] bg-muted/40 text-left"
                >
                  <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-[#00BFFF]/15 via-transparent to-[#00BFFF]/5">
                    {guide.videoSrc && (
                      <video
                        src={guide.videoSrc}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 size-full object-cover"
                      />
                    )}
                    <span className="relative flex size-12 items-center justify-center rounded-full bg-[#00BFFF] text-white transition-transform group-hover:scale-110">
                      <Play className="size-5 fill-current" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-border light:border-[#E6E6E6] px-3 py-2">
                    <span className="text-xs font-medium text-foreground">{guide.videoTitle}</span>
                    <span className="text-[11px] text-muted-foreground">{guide.videoLength}</span>
                  </div>
                </button>
              </>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-muted text-foreground"
                      : "text-foreground/90",
                  )}
                >
                  {m.content}
                  {m.video && (
                    <video
                      src={m.video}
                      controls
                      playsInline
                      preload="metadata"
                      className="mt-2.5 w-full rounded-xl border border-border light:border-[#E6E6E6] bg-black"
                    />
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" />
                Isla is typing...
              </div>
            )}

            {/* FAQs — first visit only, remaining ones stay visible */}
            {firstVisit && remainingFaqs.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <MessageCircleQuestion className="size-3.5" />
                  Frequently asked questions
                </div>
                {remainingFaqs.map((f) => (
                  <button
                    key={f.q}
                    onClick={() => askFaq(f.q, f.a, f.video)}
                    className="w-full rounded-xl border border-border light:border-[#E6E6E6] bg-card/60 light:bg-white px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                  >
                    {f.q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border light:border-[#E6E6E6] p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="Ask Isla anything about this screen..."
                className="h-10 flex-1 rounded-lg border border-border light:border-[#E6E6E6] bg-background light:bg-white px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#00BFFF]"
              />
              <Button
                size="icon"
                onClick={submit}
                disabled={!input.trim() || typing}
                className="size-10 shrink-0 bg-primary text-white hover:bg-primary/90"
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/70 backdrop-blur-md" />
        </DialogPortal>
        <DialogContent className="max-w-3xl border-border bg-card p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">{guide.videoTitle}</DialogTitle>
          {guide.videoSrc ? (
            <video
              src={guide.videoSrc}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full rounded-t-lg bg-black"
            />
          ) : (
          <div className="flex aspect-video items-center justify-center rounded-t-lg bg-gradient-to-br from-[#00BFFF]/20 via-black/60 to-black">
            <div className="text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#00BFFF] text-white">
                <Play className="size-7 fill-current" />
              </span>
              <p className="mt-4 text-sm font-medium text-white">{guide.videoTitle}</p>
              <p className="mt-1 text-xs text-white/60">
                Tutorial · {guide.videoLength} · prototype placeholder
              </p>
            </div>
          </div>
          )}
          <div className="px-6 pb-6 pt-4">
            <h3 className="text-base font-semibold text-foreground">{guide.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{guide.summary}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agent intro modal */}
      <IslaIntroDialog
        open={introOpen}
        onClose={() => {
          markAgentIntroSeen();
          setIntroOpen(false);
        }}
        guide={guide}
      />
    </>
  );
}

function IslaIntroDialog({
  open,
  onClose,
  guide,
}: {
  open: boolean;
  onClose: () => void;
  guide: ScreenGuide;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center">
          <img src={islaLogo} alt="" className="size-14 rounded-xl" />
          <DialogTitle className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Meet the Isla Agent
          </DialogTitle>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The Isla Agent is here to teach you how to use Isla. It guides you through your first
            steps, explains what each part of the platform does, and you can ask it whenever you
            have a question.
          </p>
          <ul className="mt-4 w-full space-y-2 text-left text-sm text-foreground/90">
            <li>· Explains every screen the first time you open it</li>
            <li>· Short tutorial videos for each area</li>
            <li>· Answers your questions any time from the bottom-right corner</li>
          </ul>
          <Button
            onClick={onClose}
            className="mt-6 w-full bg-primary text-white hover:bg-primary/90"
          >
            Start with {guide.title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
