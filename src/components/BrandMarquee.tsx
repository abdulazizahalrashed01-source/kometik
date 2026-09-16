"use client";

import Image from "next/image";

const brands = [
  {
    name: "L'Oreal",
    src: "/logos/loreal.png",
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
    name: "La Roche-Posay",
    src: "/logos/la_roche.png",
  },
  {
    name: "Garnier",
    src: "/logos/garnier.png",
  },
];

function BrandGroup() {
  return (
    <div className="flex shrink-0 items-center gap-16 px-8 sm:gap-20 sm:px-10 lg:gap-24 lg:px-12">
      {brands.map((brand) => (
        <div
          key={brand.name}
          className="relative flex h-12 w-28 shrink-0 items-center justify-center opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-14 sm:w-36"
        >
          <Image
            src={brand.src}
            alt=""
            fill
            sizes="144px"
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export default function BrandMarquee() {
  return (
    <section
      aria-label="Brands"
      className="overflow-hidden border-y border-(--olive-200) bg-white"
    >
      <div className="py-7 sm:py-8">
        <div className="mb-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-(--olive-500) sm:text-xs">
            Brands we love
          </p>
        </div>

        <div className="brand-marquee-track flex w-max">
          <BrandGroup />
          <BrandGroup />
        </div>
      </div>

      <style>{`
        .brand-marquee-track {
          animation: brand-marquee 34s linear infinite;
        }

        .brand-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes brand-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .brand-marquee-track {
            animation: none;
            width: 100%;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
