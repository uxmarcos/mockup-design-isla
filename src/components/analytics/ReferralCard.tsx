import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";

/** Card art is drawn on the Figma canvas (746 × 305) and scaled down to the sidebar width. */
const CANVAS_W = 746;
const CANVAS_H = 305;
const CARD_W = 208;
const SCALE = CARD_W / CANVAS_W;
const SESSION_KEY = "isla.referralCard.closed";

type Layer = {
  src: string;
  left: number;
  top: number;
  w: number;
  h: number;
  /** Figma "inset" bleed for the soft ring layers. */
  inset?: string;
};

type Variant = {
  bg: string;
  title: string;
  sub: string;
  radius: number;
  pad: [number, number];
  layers: Layer[];
  coins: { left: number; top: number; w: number; h: number; iw: number; ih: number };
  close: { left: number; top: number };
};

/** Dark card: shown in light mode so it stands out. */
const DARK: Variant = {
  bg: "#00141b",
  title: "#ffffff",
  sub: "#d8d8d8",
  radius: 40.089,
  pad: [40.089, 53.452],
  layers: [
    { src: "/referral/dark-e4.svg", left: 487, top: 30.63, w: 407.57, h: 407.57 },
    { src: "/referral/dark-e5.svg", left: 525, top: 64.63, w: 335, h: 336 },
    { src: "/referral/dark-e1.svg", left: 414.25, top: 52.83, w: 481.067, h: 320.711, inset: "-30.73% -20.49%" },
    { src: "/referral/dark-e2.svg", left: 497.77, top: 102.94, w: 437.637, h: 220.489, inset: "-44.7% -22.52%" },
  ],
  coins: { left: 407.57, top: -100.84, w: 405.585, h: 512.217, iw: 457.682, ih: 230.179 },
  close: { left: 656.54, top: 19.74 },
};

/** Light card: shown in dark mode so it stands out. */
const LIGHT: Variant = {
  bg: "#d5f1fb",
  title: "#000000",
  sub: "#414141",
  radius: 40.196,
  pad: [40.196, 53.595],
  layers: [
    { src: "/referral/light-e3.svg", left: 368.47, top: 16.13, w: 529.252, h: 529.252 },
    { src: "/referral/light-e4.svg", left: 428.76, top: 76.42, w: 408.663, h: 408.663 },
    { src: "/referral/light-e5.svg", left: 495.76, top: 140.06, w: 278.025, h: 278.025 },
    { src: "/referral/light-e1.svg", left: 415.36, top: 52.97, w: 482.357, h: 321.571, inset: "-30.73% -20.49%" },
    { src: "/referral/light-e2.svg", left: 499.11, top: 103.22, w: 438.81, h: 221.08, inset: "-44.7% -22.52%" },
  ],
  coins: { left: 408.66, top: -101.11, w: 406.672, h: 513.59, iw: 458.909, ih: 230.796 },
  close: { left: 656.54, top: 19.48 },
};

const abs = (left: number, top: number, w?: number, h?: number): CSSProperties => ({
  position: "absolute",
  left,
  top,
  width: w,
  height: h,
});

function CardArt({ v }: { v: Variant }) {
  return (
    <div
      className="font-manrope"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: CANVAS_W,
        height: CANVAS_H,
        transform: `scale(${SCALE})`,
        transformOrigin: "top left",
        background: v.bg,
        borderRadius: v.radius,
        overflow: "hidden",
      }}
    >
      {v.layers.map((l) => (
        <div key={l.src} style={abs(l.left, l.top, l.w, l.h)}>
          {l.inset ? (
            <div style={{ position: "absolute", inset: l.inset }}>
              <img src={l.src} alt="" style={{ display: "block", width: "100%", height: "100%", maxWidth: "none" }} />
            </div>
          ) : (
            <img src={l.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none" }} />
          )}
        </div>
      ))}

      <div
        style={{
          ...abs(v.pad[0], 0, 394.2),
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 13.4,
          lineHeight: 1.3,
        }}
      >
        <p style={{ margin: 0, fontSize: 43.43, fontWeight: 600, color: v.title }}>Earn Money</p>
        <p style={{ margin: 0, fontSize: 33.4, fontWeight: 500, color: v.sub }}>
          Get 20% of everything your referrals spend on Isla. Forever!
        </p>
      </div>

      <div
        style={{
          ...abs(v.coins.left, v.coins.top, v.coins.w, v.coins.h),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ transform: "rotate(115.64deg)", flex: "none" }}>
          <div style={{ position: "relative", width: v.coins.iw, height: v.coins.ih }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
              <img
                src="/referral/coins.png"
                alt=""
                style={{ position: "absolute", height: "116.28%", left: "-11.85%", top: "-9.3%", width: "120.78%", maxWidth: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      <img
        src="/referral/close.svg"
        alt=""
        style={{ ...abs(v.close.left, v.close.top, 70.344, 70.344), pointerEvents: "none" }}
      />
    </div>
  );
}

/**
 * Referral promo in the sidebar. The dark card is used in light mode and the light card in
 * dark mode for contrast. It can be closed, but it comes back on every new session.
 */
export function ReferralCard() {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      setClosed(sessionStorage.getItem(SESSION_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  if (closed) return null;

  const close = () => {
    setClosed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="relative mb-3 overflow-hidden rounded-[11px]"
      style={{ width: CARD_W, height: CANVAS_H * SCALE }}
    >
      <Link
        to="/earn"
        aria-label="Earn money: get 20% of everything your referrals spend on Isla"
        className="absolute inset-0 block transition-transform hover:scale-[1.02]"
      >
        <span className="light:hidden">
          <CardArt v={LIGHT} />
        </span>
        <span className="hidden light:inline">
          <CardArt v={DARK} />
        </span>
      </Link>
      <button
        type="button"
        onClick={close}
        aria-label="Close referral card"
        className="absolute rounded-full"
        style={{
          left: 656.54 * SCALE,
          top: 19.6 * SCALE,
          width: 70.344 * SCALE,
          height: 70.344 * SCALE,
        }}
      />
    </div>
  );
}
