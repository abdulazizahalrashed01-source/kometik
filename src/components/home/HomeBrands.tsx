import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const brands = [
  {
    name: "La Roche-Posay",
    src: "/logos/la_roche.png",
  },
  {
    name: "CeraVe",
    src: "/logos/cerave.png",
  },
  {
    name: "Eucerin",
    src: "/logos/eucerin.png",
  },
  {
    name: "Garnier",
    src: "/logos/garnier.png",
  },
  {
    name: "L'Oréal",
    src: "/logos/loreal.png",
  },
];

export default function HomeBrands() {
  return (
    <section
      id="brands"
      dir="rtl"
      className="
        bg-[var(--sand)]
        px-5
        py-14
        sm:px-6
        sm:py-18
        lg:px-10
        lg:py-[82px]
      "
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-black/10
              pb-5
              sm:flex-row
              sm:items-end
              sm:justify-between
              sm:gap-5
              sm:pb-6
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  tracking-[0.2em]
                  text-[var(--brick)]
                "
              >
                BRANDS WE LOVE
              </p>

              <h2
                className="
                  mt-2.5
                  text-[32px]
                  font-semibold
                  leading-[1.12]
                  tracking-[-0.04em]
                  text-[var(--ink)]
                  sm:text-[42px]
                "
              >
                أفضل{" "}
                <span className="kometik-editorial italic text-[var(--olive)]">
                  العلامات
                </span>
              </h2>

              <p
                className="
                  mt-3
                  text-[13px]
                  leading-7
                  text-black/48
                  sm:text-sm
                "
              >
                علامات مختارة بعناية لتكون
                جزءًا من عالم Kometik.
              </p>
            </div>

            <Link
              href="/shop"
              className="
                inline-flex
                items-center
                gap-2
                text-xs
                font-medium
                text-[var(--olive-dark)]
                transition
                hover:text-[var(--brick-dark)]
                sm:text-sm
              "
            >
              استكشفي المتجر
              <ArrowLeft
                size={14}
                strokeWidth={1.6}
              />
            </Link>
          </div>
        </ScrollReveal>

        <div
          className="
            mt-1
            grid
            grid-cols-2
            sm:grid-cols-3
            lg:grid-cols-5
          "
        >
          {brands.map(
            (brand, index) => (
              <ScrollReveal
                key={brand.name}
                delay={index * 50}
                className="
                  flex
                  min-h-[92px]
                  items-center
                  justify-center
                  border-b
                  border-black/10
                  px-3
                  sm:min-h-[110px]
                  sm:px-4
                  lg:min-h-[125px]
                  lg:border-b-0
                  lg:border-l
                  lg:last:border-l-0
                "
              >
                <div
                  className="
                    relative
                    h-11
                    w-28
                    opacity-55
                    grayscale
                    transition
                    duration-500
                    hover:opacity-100
                    hover:grayscale-0
                    sm:h-14
                    sm:w-32
                    lg:h-16
                    lg:w-36
                  "
                >
                  <Image
                    src={
                      brand.src
                    }
                    alt={
                      brand.name
                    }
                    fill
                    sizes="144px"
                    className="object-contain"
                  />
                </div>
              </ScrollReveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}
