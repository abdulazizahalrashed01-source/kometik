"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="العودة إلى الأعلى"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`
        fixed
        bottom-5
        left-5
        z-[80]
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-black/8
        bg-[var(--editorial-white)]/92
        px-3.5
        py-3
        text-[var(--olive-dark)]
        shadow-[0_14px_40px_rgba(23,23,23,0.12)]
        backdrop-blur-xl
        transition-all
        duration-500
        ease-[var(--ease-editorial)]
        sm:bottom-6
        sm:left-6
        sm:px-4
        ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-90 opacity-0"
        }
        hover:-translate-y-0.5
        hover:border-[var(--brick)]/20
        hover:text-[var(--brick)]
        active:scale-95
        focus-visible:outline-2
        focus-visible:outline-[var(--brick)]
        focus-visible:outline-offset-3
      `}
    >
      <ArrowUp size={16} strokeWidth={1.8} />

      <span className="hidden text-xs font-medium sm:inline">
        العودة إلى الأعلى
      </span>
    </button>
  );
}
