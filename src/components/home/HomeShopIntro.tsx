import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function HomeShopIntro() {
  return (
    <section
      id="shop"
      dir="rtl"
      className="
        bg-white
        px-5
        py-12
        sm:px-6
        sm:py-16
        lg:px-10
        lg:py-[78px]
      "
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl text-center">
            <p
              className="
                text-[9px]
                font-medium
                tracking-[0.2em]
                text-[var(--brick)]
              "
            >
              KOMETIK SHOP
            </p>

            <h2
              className="
                mt-2.5
                text-[32px]
                font-semibold
                leading-[1.15]
                tracking-[-0.04em]
                text-[var(--ink)]
                sm:text-[42px]
                lg:text-[clamp(44px,4.7vw,60px)]
              "
            >
              اختاري ما يناسبك
              <br />
              <span className="kometik-editorial italic text-[var(--olive)]">
                واصنعي روتينك.
              </span>
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-lg
                text-[13px]
                leading-7
                text-black/48
                sm:mt-5
                sm:text-sm
                sm:leading-8
              "
            >
              اكتشفي منتجات مختارة بعناية
              لتجعل روتينك اليومي أبسط وأجمل.
            </p>

            <Link
              href="/shop"
              className="
                mx-auto
                mt-5
                inline-flex
                items-center
                gap-2
                text-xs
                font-medium
                text-[var(--olive-dark)]
                transition
                hover:text-[var(--brick-dark)]
                sm:mt-6
                sm:text-sm
              "
            >
              استكشفي المتجر
              <ArrowLeft
                size={14}
                strokeWidth={1.7}
              />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
