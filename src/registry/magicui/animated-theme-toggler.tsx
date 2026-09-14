"use client";

import { Moon, SunDim } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: Props) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setIsDarkMode(!isLight);
  }, []);

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const apply = () => {
      const nowLight = document.documentElement.classList.toggle("light");
      setIsDarkMode(!nowLight);
    };

    // Fallback for browsers without View Transitions API.
    if (typeof document.startViewTransition !== "function") {
      apply();
      return;
    }

    await document.startViewTransition(() => {
      flushSync(apply);
    }).ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = Math.max(left + width, window.innerWidth - left);
    const bottom = Math.max(top + height, window.innerHeight - top);
    const maxRadius = Math.hypot(right, bottom);

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  return (
    <button
      ref={buttonRef}
      onClick={changeTheme}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors",
        className,
      )}
    >
      {isDarkMode ? <SunDim className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
};

export default AnimatedThemeToggler;
