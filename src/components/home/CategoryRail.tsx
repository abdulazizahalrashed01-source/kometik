"use client";

import { useEffect, useState } from "react";

export type CategoryRailItem = {
  id: string;
  number: string;
  name: string;
};

type CategoryRailProps = {
  items: CategoryRailItem[];
};

export default function CategoryRail({
  items,
}: CategoryRailProps) {
  const [visible, setVisible] =
    useState(false);

  const [activeId, setActiveId] =
    useState(items[0]?.id ?? "");

  /* =====================================================
     SHOW RAIL ONLY WHEN CATEGORIES SECTION IS VISIBLE
  ====================================================== */

  useEffect(() => {
    const section =
      document.getElementById(
        "categories"
      );

    if (!section) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setVisible(
            entry.isIntersecting
          );
        },
        {
          threshold: 0.05,
          rootMargin:
            "-8% 0px -8% 0px",
        }
      );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =====================================================
     TRACK ACTIVE CATEGORY
  ====================================================== */

  useEffect(() => {
    if (!visible) {
      return;
    }

    const elements = items
      .map((item) =>
        document.getElementById(
          `category-${item.id}`
        )
      )
      .filter(
        (
          element
        ): element is HTMLElement =>
          element !== null
      );

    if (!elements.length) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const current = entries
            .filter(
              (entry) =>
                entry.isIntersecting
            )
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            )[0];

          if (!current) {
            return;
          }

          setActiveId(
            current.target.id.replace(
              "category-",
              ""
            )
          );
        },
        {
          threshold: [
            0.2,
            0.4,
            0.6,
            0.8,
          ],
          rootMargin:
            "-12% 0px -35% 0px",
        }
      );

    elements.forEach((element) =>
      observer.observe(element)
    );

    return () => {
      observer.disconnect();
    };
  }, [items, visible]);

  if (!visible) {
    return null;
  }

  function goToCategory(
    id: string
  ) {
    document
      .getElementById(
        `category-${id}`
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  return (
    <aside
      dir="rtl"
      aria-label="تنقل التصنيفات"
      className="
        fixed
        left-4
        top-1/2
        z-[60]
        hidden
        -translate-y-1/2
        xl:block
        animate-[searchDiscoveryIn_550ms_cubic-bezier(.22,1,.36,1)]
      "
    >
      <div
        className="
          relative
          flex
          flex-col
          items-center
          gap-2
          rounded-[26px]
          border
          border-black/[0.06]
          bg-white/92
          p-2
          shadow-[0_18px_50px_rgba(0,0,0,0.08)]
          backdrop-blur-xl
        "
      >
        {/* VERTICAL LINE */}

        <span
          aria-hidden="true"
          className="
            absolute
            bottom-4
            top-4
            left-1/2
            w-px
            -translate-x-1/2
            bg-black/[0.08]
          "
        />

        {items.map(
          (item) => {
            const active =
              activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  goToCategory(
                    item.id
                  )
                }
                aria-label={
                  item.name
                }
                className={`
                  group
                  relative
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    active
                      ? "scale-110 bg-[var(--olive)] text-white shadow-[0_8px_22px_rgba(0,0,0,0.10)]"
                      : "bg-[var(--cream)] text-black/35 hover:scale-105 hover:text-[var(--olive-dark)]"
                  }
                `}
              >
                <span
                  className="
                    kometik-editorial
                    text-[10px]
                  "
                >
                  {item.number}
                </span>

                {/* ACTIVE DOT */}

                <span
                  aria-hidden="true"
                  className="
                    absolute
                    bottom-1
                    left-1/2
                    h-1
                    w-1
                    -translate-x-1/2
                    rounded-full
                    bg-[var(--brick)]
                    opacity-0
                    transition
                    group-hover:opacity-100
                  "
                />

                {/* =================================================
                    LABEL
                    OPENS TO THE LEFT
                ================================================== */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-[calc(100%+14px)]
                    top-1/2
                    -translate-y-1/2
                    translate-x-2
                    whitespace-nowrap
                    rounded-full
                    border
                    border-black/[0.05]
                    bg-white/96
                    px-3
                    py-2
                    text-[10px]
                    font-medium
                    text-black/70
                    opacity-0
                    shadow-[0_12px_28px_rgba(23,23,23,0.07)]
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    group-hover:translate-x-0
                    group-hover:opacity-100
                  "
                >
                  {item.name}
                </span>
              </button>
            );
          }
        )}

        {/* EXPLORE */}

        <span
          aria-hidden="true"
          className="
            absolute
            -bottom-10
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            text-[7px]
            tracking-[0.22em]
            text-black/30
          "
        >
          EXPLORE
        </span>
      </div>
    </aside>
  );
}



