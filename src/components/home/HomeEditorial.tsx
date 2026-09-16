import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function HomeEditorial() {
  return (
    <section
      id="editorial"
      dir="rtl"
      className="
        relative
        overflow-hidden
        bg-[var(--brick)]
        px-5
        py-14
        text-white
        sm:px-6
        sm:py-20
        lg:px-10
        lg:py-[105px]
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          left-0
          right-0
          top-[-1px]
          h-[48px]
          bg-[var(--cream)]
          sm:h-[60px]
          lg:h-[76px]
        "
        style={{
          clipPath:
            "polygon(0 0,100% 0,100% 28%,90% 52%,80% 38%,70% 58%,60% 40%,49% 62%,38% 42%,27% 58%,16% 39%,7% 55%,0 35%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div
          className="
            grid
            items-center
            gap-8
            lg:grid-cols-2
            lg:gap-[64px]
          "
        >
          <ScrollReveal>
            <div
              className="
                relative
                mx-auto
                aspect-square
                w-full
                max-w-[470px]
                overflow-hidden
                shadow-[0_25px_65px_rgba(0,0,0,0.16)]
                lg:max-w-none
              "
              style={{
                clipPath:
                  "polygon(7% 0,100% 8%,93% 100%,0 92%)",
              }}
            >
              <Image
                src="/full_bleed_hero.webp"
                alt="Kometik editorial beauty"
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-[1.05]
                "
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="lg:px-3">
              <p
                className="
                  text-[9px]
                  font-medium
                  tracking-[0.2em]
                  text-white/60
                  sm:text-[10px]
                "
              >
                KOMETIK EDIT
              </p>

              <h2
                className="
                  mt-4
                  text-[36px]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.04em]
                  sm:text-[44px]
                  lg:text-[clamp(45px,4.7vw,62px)]
                "
              >
                الأشياء الجميلة
                <br />
                تبدأ من
                <br />
                <span className="kometik-editorial italic">
                  التفاصيل.
                </span>
              </h2>

              <p
                className="
                  mt-5
                  max-w-[500px]
                  text-[13px]
                  leading-7
                  text-white/72
                  sm:mt-6
                  sm:text-sm
                  sm:leading-8
                "
              >
                منتجات نختارها بعناية، لأننا
                نؤمن أن روتين العناية لا يجب
                أن يكون معقدًا حتى يكون جزءًا
                جميلًا من يومك.
              </p>

              <Link
                href="/shop"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-3
                  
                  bg-black
                  px-5
                  py-3
                  text-xs
                  font-medium
                  text-white
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[var(--cream)]
                  hover:text-black
                  sm:mt-7
                  sm:px-6
                  sm:py-3.5
                  sm:text-sm
                "
              >
                استكشفي الاختيارات
                <ArrowLeft
                  size={14}
                  strokeWidth={1.7}
                />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
