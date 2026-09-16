"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowDown,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

export default function HeroSection() {
  const [reducedMotion, setReducedMotion] =
    useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotion();

    mediaQuery.addEventListener(
      "change",
      updateMotion
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotion
      );
    };
  }, []);

  return (
    <section
      id="hero"
      dir="rtl"
      aria-labelledby="hero-heading"
      className="
        relative
        isolate
        min-h-[620px]
        h-[78svh]
        max-h-[860px]
        overflow-hidden
        bg-[#cfc4b3]
        text-white
      "
    >
      {/* =====================================================
          VIDEO
      ====================================================== */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-beauty-poster.jpg"
        aria-hidden="true"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
      >
        <source
          src="/videos/hero-beauty.mp4"
          type="video/mp4"
        />
      </video>

      {/* =====================================================
          BASE COLOR
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-[#6d705d]/10
        "
      />

      {/* =====================================================
          CINEMATIC OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-gradient-to-l
          from-black/55
          via-black/22
          to-black/5
        "
      />

      {/* =====================================================
          LOWER DARKENING
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          h-[52%]
          bg-gradient-to-t
          from-black/45
          via-black/10
          to-transparent
        "
      />

      {/* =====================================================
          SUBTLE VIGNETTE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.18)_100%)]
        "
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          w-full
          max-w-[1480px]
          items-center
          px-6
          sm:px-10
          lg:px-14
          xl:px-20
        "
      >
        <div
          className="
            max-w-[650px]
            text-right
            lg:mr-auto
            lg:w-[52%]
          "
        >
          {/* =================================================
              EYEBROW
          ================================================= */}

          <div
            className={`
              flex
              items-center
              justify-start
              gap-3
              text-[9px]
              font-medium
              tracking-[0.34em]
              text-white/70
              sm:text-[10px]
              ${
                reducedMotion
                  ? ""
                  : "animate-[heroFadeUp_850ms_ease-out_both]"
              }
            `}
          >
            <span
              aria-hidden="true"
              className="
                h-px
                w-10
                bg-[var(--brick)]
                sm:w-14
              "
            />

            KOMETIK BEAUTY
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h1
            id="hero-heading"
            className={`
              mt-5
              max-w-[620px]
              text-[clamp(46px,7vw,96px)]
              font-semibold
              leading-[0.91]
              tracking-[-0.055em]
              text-white
              drop-shadow-[0_10px_35px_rgba(0,0,0,0.18)]
              sm:mt-6
              ${
                reducedMotion
                  ? ""
                  : "animate-[heroTitleReveal_1100ms_cubic-bezier(0.22,1,0.36,1)_both]"
              }
            `}
          >
            جمالك،
            <br />

            <span
              className="
                kometik-editorial
                italic
                text-[#e3d5c0]
              "
            >
              بطريقتك.
            </span>
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className={`
              mt-6
              max-w-[460px]
              text-[12px]
              leading-7
              text-white/75
              sm:text-[14px]
              sm:leading-8
              ${
                reducedMotion
                  ? ""
                  : "animate-[heroFadeUp_900ms_ease-out_300ms_both]"
              }
            `}
          >
            عناية مختارة بعناية، ومنتجات تنسجم
            مع احتياجات بشرتك وروتينك اليومي.
          </p>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className={`
              mt-7
              flex
              flex-wrap
              items-center
              justify-start
              gap-5
              ${
                reducedMotion
                  ? ""
                  : "animate-[heroFadeUp_900ms_ease-out_450ms_both]"
              }
            `}
          >
            <Link
              href="/shop"
              className="
                group
                inline-flex
                min-h-12
                w-[30%]
                items-center
                gap-3
                
                bg-[var(--brick)]
                px-7
                text-[11px]
                font-semibold
                text-[var(--ink)]
                shadow-[0_18px_45px_rgba(0,0,0,0.18)]
                transition-all
                duration-500
                hover:-translate-y-1
                hover:bg-[var(--brick)]
                hover:text-white
                sm:px-8
                sm:text-xs
              "
            >
              
              تسوّقي الآن

              <ArrowLeft
                size={15}
                strokeWidth={1.8}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />
            </Link>

            <Link
              href="/shop/categories"
              className="
                inline-flex
                items-center
                gap-2
                text-[11px]
                font-medium
                text-white/70
                transition-colors
                duration-300
                hover:text-white
                sm:text-xs
              "
            >
              اكتشفي المجموعات

              <ArrowDown
                size={13}
                strokeWidth={1.6}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          SCROLL INDICATOR
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-7
          left-1/2
          z-20
          hidden
          -translate-x-1/2
          flex-col
          items-center
          gap-2
          text-white/55
          md:flex
        "
      >
        <span
          className="
            text-[7px]
            tracking-[0.28em]
          "
        >
          SCROLL
        </span>

        <span
          className="
            h-9
            w-px
            bg-gradient-to-b
            from-white/55
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          BRAND META
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-8
          right-6
          z-20
          hidden
          text-right
          lg:block
          lg:right-10
          xl:right-16
        "
      >
        <div
          className="
            text-[7px]
            tracking-[0.28em]
            text-white/40
          "
        >
          EST. 2026
        </div>

        <div
          className="
            mt-1
            text-[7px]
            tracking-[0.18em]
            text-white/30
          "
        >
          BEAUTY · CARE · SELF
        </div>
      </div>

      {/* =====================================================
          BOTTOM BRAND LINE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          bottom-0
          left-0
          z-30
          h-[3px]
          w-full
          bg-[var(--brick)]
        "
      />
    </section>
  );
}