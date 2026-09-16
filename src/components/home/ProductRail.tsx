"use client";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ProductRailProps = {
  children: ReactNode;
};

export default function ProductRail({
  children,
}: ProductRailProps) {
  const railRef =
    useRef<HTMLDivElement | null>(null);

  const [canScrollPrev, setCanScrollPrev] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(false);

  const updateRailState =
    useCallback(() => {
      const rail = railRef.current;

      if (!rail) {
        return;
      }

      const maxScroll =
        rail.scrollWidth -
        rail.clientWidth;

      if (maxScroll <= 4) {
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }

      const position = Math.abs(
        rail.scrollLeft
      );

      const normalizedPosition =
        Math.min(
          maxScroll,
          Math.max(0, position)
        );

      setCanScrollPrev(
        normalizedPosition > 4
      );

      setCanScrollNext(
        normalizedPosition <
          maxScroll - 4
      );
    }, []);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const frame =
      window.requestAnimationFrame(() => {
        updateRailState();
      });

    rail.addEventListener(
      "scroll",
      updateRailState,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateRailState
    );

    return () => {
      window.cancelAnimationFrame(frame);

      rail.removeEventListener(
        "scroll",
        updateRailState
      );

      window.removeEventListener(
        "resize",
        updateRailState
      );
    };
  }, [
    children,
    updateRailState,
  ]);

  function scrollRail(
    direction: "next" | "prev"
  ) {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const amount =
      rail.clientWidth * 0.72;

    rail.scrollBy({
      left:
        direction === "next"
          ? -amount
          : amount,
      behavior: "smooth",
    });
  }

  return (
    <div
      className="
        relative
        w-full
      "
    >
      {/* =================================================
          PRODUCTS RAIL
      ================================================== */}

      <div
        ref={railRef}
        dir="rtl"
        className="
          flex
          w-full

          snap-x
          snap-mandatory

          gap-4

          overflow-x-auto
          overflow-y-visible

          scroll-smooth

          pb-2

          sm:gap-5
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>

      {/* =================================================
          PREVIOUS
      ================================================== */}

      <button
        type="button"
        onClick={() =>
          scrollRail("prev")
        }
        disabled={!canScrollPrev}
        aria-label="المنتجات السابقة"
        className={`
          group/prev

          pointer-events-auto

          absolute
          right-0
          top-[40%]
          z-[100]

          flex
          h-16
          w-20

          -translate-y-1/2

          items-center
          justify-start

          overflow-hidden

          pr-2

          transition-all
          duration-500
          ease-[var(--ease-editorial)]

          disabled:pointer-events-none
          disabled:opacity-0

          sm:h-20
          sm:w-24
          sm:pr-3
        `}
      >
        <span
          className="
            pointer-events-none
            absolute
            inset-y-0
            right-0
            w-full

            bg-gradient-to-l
            from-[var(--cream)]/90
            via-[var(--cream)]/35
            to-transparent

            opacity-0

            transition-opacity
            duration-500

            group-hover/prev:opacity-100
          "
        />

        <span
          className="
            relative
            z-10

            flex
            items-center
            gap-2

            text-[var(--ink)]/80

            transition-all
            duration-500
            ease-[var(--ease-editorial)]

            group-hover/prev:text-[var(--brick)]
          "
        >
          <span
            className="
              block
              h-[1px]
              w-8

              origin-right

              bg-current

              transition-all
              duration-500
              ease-[var(--ease-editorial)]

              group-hover/prev:w-11
            "
          />

          <ArrowRight
            size={18}
            strokeWidth={1.5}
            className="
              shrink-0

              transition-transform
              duration-500
              ease-[var(--ease-editorial)]

              group-hover/prev:translate-x-1
            "
          />
        </span>
      </button>

      {/* =================================================
          NEXT
      ================================================== */}

      <button
        type="button"
        onClick={() =>
          scrollRail("next")
        }
        disabled={!canScrollNext}
        aria-label="المنتجات التالية"
        className={`
          group/next

          pointer-events-auto

          absolute
          left-0
          top-[40%]
          z-[100]

          flex
          h-16
          w-20

          -translate-y-1/2

          items-center
          justify-end

          overflow-hidden

          pl-2

          transition-all
          duration-500
          ease-[var(--ease-editorial)]

          disabled:pointer-events-none
          disabled:opacity-0

          sm:h-20
          sm:w-24
          sm:pl-3
        `}
      >
        <span
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            w-full

            bg-gradient-to-r
            from-[var(--cream)]/90
            via-[var(--cream)]/35
            to-transparent

            opacity-0

            transition-opacity
            duration-500

            group-hover/next:opacity-100
          "
        />

        <span
          className="
            relative
            z-10

            flex
            items-center
            gap-2

            text-[var(--ink)]/80

            transition-all
            duration-500
            ease-[var(--ease-editorial)]

            group-hover/next:text-[var(--brick)]
          "
        >
          <ArrowLeft
            size={18}
            strokeWidth={1.5}
            className="
              shrink-0

              transition-transform
              duration-500
              ease-[var(--ease-editorial)]

              group-hover/next:-translate-x-1
            "
          />

          <span
            className="
              block
              h-[1px]
              w-8

              origin-left

              bg-current

              transition-all
              duration-500
              ease-[var(--ease-editorial)]

              group-hover/next:w-11
            "
          />
        </span>
      </button>
    </div>
  );
}