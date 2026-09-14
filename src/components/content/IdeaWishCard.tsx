/**
 * "Discover new post ideas" card — faithful reproduction of the provided
 * 3D LinkedIn-post mock card (340px, #0F0F0F body, #2C2C2C hairline, cyan CTA).
 *
 * Three layers:
 *   1. ambient glow
 *   2. floating neon sparkles (NOT clipped — they orbit outside the card)
 *      + animated beam traveling the full rounded perimeter
 *   3. the card itself (clipping stays local to the card body)
 */
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/registry/magicui/border-beam";

function Sparkle({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M12 0c.6 6.2 5.2 10.8 12 12-6.8 1.2-11.4 5.8-12 12-.6-6.2-5.2-10.8-12-12C6.8 10.8 11.4 6.2 12 0Z"
        fill="url(#sp)"
      />
      <defs>
        <linearGradient id="sp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EAF9FF" />
          <stop offset="100%" stopColor="#00BFFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** orbital sparkles — each one circles the card on its own ellipse/timing */
const SPARKLES: Array<{
  size: number;
  angle: number;
  rx: number;
  ry: number;
  duration: number;
  delay: number;
  depth: number;
  reverse?: boolean;
}> = [
  { size: 44, angle: 0, rx: 210, ry: 150, duration: 16, delay: 0, depth: 0.95 },
  { size: 22, angle: 55, rx: 190, ry: 170, duration: 20, delay: -3, depth: 0.6, reverse: true },
  { size: 30, angle: 110, rx: 225, ry: 140, duration: 18, delay: -6, depth: 0.8 },
  { size: 16, angle: 160, rx: 175, ry: 185, duration: 23, delay: -9, depth: 0.45, reverse: true },
  { size: 38, angle: 210, rx: 215, ry: 155, duration: 17, delay: -2, depth: 0.9 },
  { size: 20, angle: 255, rx: 240, ry: 130, duration: 21, delay: -12, depth: 0.5 },
  { size: 26, angle: 300, rx: 195, ry: 175, duration: 19, delay: -5, depth: 0.7, reverse: true },
  { size: 18, angle: 340, rx: 165, ry: 195, duration: 22, delay: -8, depth: 0.5 },
];

export function IdeaWishCard({
  label = "Discover new post ideas",
  onClick,
  className,
}: {
  label?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("group relative w-[340px]", className)}>
      <style>{`
        @keyframes isla-orbit {
          from { transform: rotate(var(--a)); }
          to   { transform: rotate(calc(var(--a) + 360deg)); }
        }
        @keyframes isla-orbit-rev {
          from { transform: rotate(var(--a)); }
          to   { transform: rotate(calc(var(--a) - 360deg)); }
        }
        @keyframes isla-orbit-counter {
          from { transform: translateX(var(--rx)) rotate(0deg); }
          to   { transform: translateX(var(--rx)) rotate(-360deg); }
        }
        @keyframes isla-orbit-counter-rev {
          from { transform: translateX(var(--rx)) rotate(0deg); }
          to   { transform: translateX(var(--rx)) rotate(360deg); }
        }
      `}</style>

      {/* layer 1 — ambient glow */}
      <div
        className="pointer-events-none absolute -inset-16 -z-10 opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,150,220,0.35), rgba(0,120,190,0.12) 55%, transparent 78%)",
        }}
        aria-hidden="true"
      />

      {/* layer 2 — orbital sparkles, only on hover, deliberately NOT clipped */}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-visible opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      >
        {SPARKLES.map((s, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 size-0"
            style={
              {
                ["--a" as string]: `${s.angle}deg`,
                animation: `${s.reverse ? "isla-orbit-rev" : "isla-orbit"} ${s.duration}s linear ${s.delay}s infinite`,
              } as React.CSSProperties
            }
          >
            <div
              className="absolute"
              style={
                {
                  ["--rx" as string]: `${s.rx}px`,
                  transform: `translateX(${s.rx}px)`,
                  animation: `${s.reverse ? "isla-orbit-counter-rev" : "isla-orbit-counter"} ${s.duration}s linear ${s.delay}s infinite`,
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  opacity: 0.35 + s.depth * 0.45,
                  filter: `drop-shadow(0 0 ${6 + s.depth * 12}px rgba(0,191,255,${0.35 + s.depth * 0.5})) blur(${(1 - s.depth) * 1.1}px)`,
                  transform: "translate(-50%,-50%)",
                }}
              >
                <Sparkle size={s.size} style={{ transform: `scale(${0.75 + s.depth * 0.35})` }} />
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* layer 3 — the card */}
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={cn(
          "relative z-10 cursor-pointer rounded-[22px] bg-[#2C2C2C] p-[1.5px] outline-none",
          "shadow-[0_30px_70px_rgba(0,0,0,0.45)] transition-transform duration-[420ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1.5",
        )}
      >
        {/* single long animated beam traveling the full rounded perimeter */}
        <BorderBeam
          size={220}
          duration={8}
          borderWidth={1.5}
          colorFrom="#0A66C2"
          colorTo="#BFEEFF"
          className="opacity-90"
        />


        <div className="relative overflow-hidden rounded-[20.5px] bg-[#0F0F0F] px-5 pb-5 pt-[22px]">
          {/* cyan wash on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[20.5px] opacity-0 transition-opacity duration-[420ms] ease-in-out group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(185deg, rgba(50,203,255,0.52) -6.45%, rgba(15,15,15,0.52) 98.01%)",
            }}
          />

          {/* 3D post mock */}
          <div className="relative mb-[18px] flex h-[222px] items-center justify-center [perspective:900px]">
            <div
              className="relative z-[3] w-[210px] rounded-[14px] border border-white/10 p-[15px] [transform-style:preserve-3d] transition-[transform,box-shadow] duration-[480ms] [transform:rotateX(9deg)_rotateY(-10deg)] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] group-hover:[transform:rotateX(6deg)_rotateY(-6deg)_translate3d(0,-6px,24px)]"
              style={{
                background: "linear-gradient(155deg, #1E1E1E 0%, #161616 100%)",
                boxShadow:
                  "0 22px 46px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.11)",
              }}
            >
              <div className="mb-3.5 flex items-center gap-2.5">
                <div
                  className="size-[30px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(150deg, rgba(255,255,255,0.24), rgba(255,255,255,0.09))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
                  }}
                />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-[7px] w-2/3 rounded bg-white/20" />
                  <div className="h-1.5 w-2/5 rounded bg-white/10" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-[7px] w-full rounded bg-white/[0.14]" />
                <div className="h-[7px] w-[92%] rounded bg-white/[0.14]" />
                <div className="h-[7px] w-[74%] rounded bg-white/[0.14]" />
                <div className="h-[7px] w-[58%] rounded bg-[rgba(0,191,255,0.42)]" />
                <div
                  className="mt-[3px] h-12 w-full rounded-[9px] border border-white/[0.07]"
                  style={{
                    background:
                      "linear-gradient(140deg, rgba(0,191,255,0.14), rgba(255,255,255,0.045))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                />
              </div>

              {/* LinkedIn badge */}
              <div className="absolute -bottom-4 -right-[22px] size-9 [transform-style:preserve-3d] transition-transform duration-[480ms] [transform:rotateX(8deg)_rotateY(-10deg)] group-hover:[transform:rotateX(5deg)_rotateY(-6deg)_translate3d(4px,-4px,14px)]">
                <div className="absolute inset-0 rounded-[10px] bg-[#052C4D] [transform:translate3d(2px,4px,-7px)]" />
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-[10px] text-[19px] font-semibold tracking-tight text-white"
                  style={{
                    background:
                      "linear-gradient(155deg, #1483E0 0%, #0A66C2 55%, #073E6E 100%)",
                    boxShadow:
                      "0 14px 26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1.5px 0 rgba(0,0,0,0.30)",
                  }}
                >
                  in
                </div>
              </div>
            </div>
          </div>

          {/* CTA — system primary button */}
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="relative z-[3] h-[42px] w-full justify-between rounded-[12px] px-4 text-[16px] font-medium text-primary-foreground"
          >
            <span>{label}</span>
            <ChevronRight className="size-4" />
          </Button>

        </div>
      </div>
    </div>
  );
}
