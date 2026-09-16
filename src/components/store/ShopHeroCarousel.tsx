"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CloudinaryProductImage from "@/components/CloudinaryProductImage";

type HeroProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  category: {
    name: string;
  };
};

type ShopHeroCarouselProps = {
  latestProducts: HeroProduct[];
  bestSellingProduct: HeroProduct | null;
};

const AUTO_PLAY_MS = 5000;

export default function ShopHeroCarousel({
  latestProducts,
  bestSellingProduct,
}: ShopHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // ==========================================
  // AUTO PLAY
  // ==========================================

  useEffect(() => {
    if (latestProducts.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % latestProducts.length;
      });
    }, AUTO_PLAY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [latestProducts.length]);

  // ==========================================
  // KEEP ACTIVE INDEX VALID
  // ==========================================

  useEffect(() => {
    if (latestProducts.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= latestProducts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, latestProducts.length]);

  const activeProduct = latestProducts[activeIndex] ?? null;

  return (
    <section
      dir="rtl"
      className="
        w-full
        overflow-hidden
        border-b
        border-(--olive-200)
        bg-white

        lg:h-[66vh]
        lg:min-h-[500px]
      "
      aria-label="متجر كومتك"
    >
      <div
        className="
          grid
          w-full

          grid-cols-1

          lg:h-full
          lg:grid-cols-2
        "
      >
        {/* =================================================
            RIGHT / LATEST PRODUCTS
            MOBILE FIRST
        ================================================== */}

        <div
          className="
            relative
            order-1
            h-[58svh]
            min-h-[430px]
            max-h-[620px]
            overflow-hidden
            bg-(--olive-100)

            sm:h-[60svh]

            lg:order-2
            lg:h-full
            lg:min-h-0
            lg:max-h-none
          "
        >
          {activeProduct ? (
            <>
              {latestProducts.map((product, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={product.id}
                    className={`
                      absolute
                      inset-0
                      transition-all
                      duration-700
                      ease-out

                      ${
                        isActive
                          ? "z-10 translate-x-0 opacity-100"
                          : "pointer-events-none z-0 opacity-0"
                      }
                    `}
                    aria-hidden={!isActive}
                  >
                    {/* =====================================
                        IMAGE BACKGROUND
                    ====================================== */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-b
                        from-white/10
                        via-transparent
                        to-(--olive-900)/25
                      "
                    />

                    {/* =====================================
                        PRODUCT IMAGE
                    ====================================== */}

                    {product.imagePublicId ||
                    product.imageUrl ? (
                      <CloudinaryProductImage
                        imagePublicId={product.imagePublicId}
                        imageUrl={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="
                          100vw
                          "
                        className="
                          object-contain

                          p-7
                          pb-28

                          sm:p-10
                          sm:pb-32

                          lg:p-16
                          lg:pb-36

                          transition-transform
                          duration-700
                          hover:scale-[1.025]
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          items-center
                          justify-center
                          text-lg
                          font-semibold
                          text-(--olive-600)
                        "
                      >
                        Kometik
                      </div>
                    )}

                    {/* =====================================
                        BOTTOM GRADIENT
                    ====================================== */}

                    <div
                      className="
                        absolute
                        inset-x-0
                        bottom-0
                        h-[42%]
                        bg-gradient-to-t
                        from-black/75
                        via-black/35
                        to-transparent
                      "
                    />

                    {/* =====================================
                        PRODUCT INFO
                    ====================================== */}

                    <div
                      className="
                        absolute
                        inset-x-0
                        bottom-0
                        z-20
                        px-5
                        pb-14
                        pt-16
                        text-white

                        sm:px-8
                        sm:pb-16

                        lg:px-10
                        lg:pb-12
                      "
                    >
                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.18em]
                          text-white/70

                          sm:text-[10px]
                        "
                      >
                        {product.category.name}
                      </p>

                      <Link
                        href={`/shop/products/${product.id}`}
                        tabIndex={isActive ? 0 : -1}
                        className="
                          mt-1.5
                          block
                          max-w-[92%]
                          text-xl
                          font-semibold
                          leading-[1.25]
                          transition-opacity
                          hover:opacity-80

                          sm:text-2xl

                          lg:max-w-lg
                          lg:text-3xl
                        "
                      >
                        {product.name}
                      </Link>

                      <p
                        className="
                          mt-1.5
                          text-sm
                          font-semibold
                          text-white/90

                          sm:text-base
                        "
                        dir="ltr"
                      >
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* ==========================================
                  TOP LABEL
              =========================================== */}

              <div
                className="
                  absolute
                  right-4
                  top-4
                  z-30
                  rounded-full
                  border
                  border-white/25
                  bg-black/20
                  px-3
                  py-1.5
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.17em]
                  text-white
                  backdrop-blur-md

                  sm:right-6
                  sm:top-6
                  sm:px-4
                  sm:py-2
                  sm:text-[10px]
                "
              >
                أحدث الإضافات
              </div>

              {/* ==========================================
                  DOTS
              =========================================== */}

              {latestProducts.length > 1 && (
                <div
                  className="
                    absolute
                    bottom-5
                    left-5
                    z-30
                    flex
                    min-h-8
                    items-center
                    gap-2

                    sm:bottom-6
                    sm:left-6
                  "
                  role="tablist"
                  aria-label="أحدث المنتجات"
                >
                  {latestProducts.map((product, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setActiveIndex(index);
                        }}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`الانتقال إلى المنتج ${
                          index + 1
                        }`}
                        className={`
                          flex
                          h-8
                          items-center
                          justify-center

                          transition-all
                          duration-300
                        `}
                      >
                        <span
                          className={`
                            block
                            rounded-full
                            transition-all
                            duration-300

                            ${
                              isActive
                                ? "h-2 w-8 bg-white"
                                : "h-2 w-2 bg-white/45"
                            }
                          `}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-sm
                font-semibold
                text-(--olive-600)
              "
            >
              لا توجد منتجات حالياً
            </div>
          )}
        </div>

        {/* =================================================
            LEFT
            TEXT + BEST SELLER
        ================================================== */}

        <div
          className="
            order-2
            grid
            min-h-0
            grid-rows-[auto_auto]
            bg-white

            lg:order-1
            lg:h-full
            lg:grid-rows-[42%_58%]
          "
        >
          {/* =================================================
              TEXT PANEL
          ================================================== */}

          <div
            className="
              relative
              min-h-[285px]
              overflow-hidden
              border-b
              border-(--olive-200)
              text-white

              sm:min-h-[300px]

              lg:min-h-0
            "
          >
            {/* ==============================================
                VIDEO
            =============================================== */}

            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
              aria-hidden="true"
            >
              <source
                src="/videos/ShopHero.mp4"
                type="video/mp4"
              />
            </video>

            {/* ==============================================
                OVERLAY
            =============================================== */}

            <div
              className="
                absolute
                inset-0
                bg-black/50
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-l
                from-black/70
                via-black/35
                to-black/10
              "
            />

            {/* ==============================================
                CONTENT
            =============================================== */}

            <div
              className="
                relative
                z-10
                flex
                h-full
                flex-col
                justify-center

                px-5
                py-7

                sm:px-8
                sm:py-8

                lg:px-10
                lg:py-5
              "
            >
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.24em]
                  text-white/70

                  sm:text-[9px]

                  lg:text-[10px]
                "
              >
                Kometik Beauty Shop
              </p>

              <h1
                className="
                  mt-2
                  max-w-[340px]
                  text-[25px]
                  font-semibold
                  leading-[1.08]
                  tracking-tight
                  text-white

                  sm:max-w-lg
                  sm:text-3xl

                  lg:text-4xl
                "
              >
                اكتشف ما يناسب روتينك.
              </h1>

              <p
                className="
                  mt-3
                  max-w-[330px]
                  text-[11px]
                  leading-5
                  text-white/75

                  sm:max-w-md
                  sm:text-sm
                  sm:leading-7
                "
              >
                منتجات مختارة بعناية للعناية بالبشرة
                والجمال، لتبني روتينًا أبسط وأجمل.
              </p>

              <Link
                href="/shop/products"
                className="
                  mt-4
                  inline-flex
                  w-fit
                  items-center
                  justify-center
                  
                  bg-white
                  px-4
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-red-700
                  transition-all
                  duration-200

                  hover:bg-(--cream)
                  hover:scale-[1.02]
                  active:scale-[0.98]

                  sm:px-5
                  sm:py-2.5
                  sm:text-xs
                "
              >
                تسوق جميع المنتجات
              </Link>
            </div>
          </div>

          {/* =================================================
              BEST SELLER
          ================================================== */}

          <div
            className="
              grid
              min-h-[255px]
              overflow-hidden
              bg-(--cream)
              grid-cols-[0.95fr_1.05fr]

              sm:min-h-[280px]

              lg:min-h-0
            "
          >
            {/* ==============================================
                INFO
            =============================================== */}

            <div
              className="
                flex
                min-h-0
                flex-col
                justify-center

                px-4
                py-5

                sm:px-6
                sm:py-6

                lg:px-7
              "
            >
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-(--brick-600)

                  sm:text-[9px]
                "
              >
                الأكثر مبيعاً
              </p>

              {bestSellingProduct ? (
                <>
                  <h2
                    className="
                      mt-2
                      line-clamp-3
                      text-base
                      font-bold
                      leading-5
                      text-(--olive-900)

                      sm:text-lg
                      sm:leading-6

                      lg:text-xl
                    "
                  >
                    {bestSellingProduct.name}
                  </h2>

                  <p
                    className="
                      mt-1.5
                      text-sm
                      font-bold
                      text-(--brick-600)

                      sm:text-base
                    "
                    dir="ltr"
                  >
                    ${bestSellingProduct.price.toFixed(2)}
                  </p>

                  <Link
                    href={`/shop/products/${bestSellingProduct.id}`}
                    className="
                      mt-3
                      inline-flex
                      w-fit
                      items-center
                      
                      border
                      border-(--olive-300)
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      text-(--olive-900)
                      transition

                      hover:bg-white

                      sm:px-3.5
                      sm:text-[11px]
                    "
                  >
                    عرض المنتج
                  </Link>
                </>
              ) : (
                <p
                  className="
                    mt-2
                    text-xs
                    text-(--olive-600)
                  "
                >
                  لا توجد مبيعات بعد.
                </p>
              )}
            </div>

            {/* ==============================================
                IMAGE
            =============================================== */}

            <div
              className="
                relative
                min-h-0
                overflow-hidden
                bg-white
              "
            >
              {bestSellingProduct &&
              (bestSellingProduct.imagePublicId ||
                bestSellingProduct.imageUrl) ? (
                <CloudinaryProductImage
                  imagePublicId={
                    bestSellingProduct.imagePublicId
                  }
                  imageUrl={bestSellingProduct.imageUrl}
                  alt={bestSellingProduct.name}
                  fill
                  sizes="
                    (max-width: 640px) 52vw,
                    (max-width: 1024px) 50vw,
                    25vw
                  "
                  className="
                    object-contain

                    p-4

                    sm:p-5

                    transition-transform
                    duration-500
                    hover:scale-[1.04]
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    text-xs
                    font-semibold
                    text-(--olive-500)
                  "
                >
                  Kometik
                </div>
              )}

              <div
                className="
                  absolute
                  right-3
                  top-3
                  rounded-full
                  bg-(--olive-900)
                  px-2.5
                  py-1
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-white

                  sm:right-4
                  sm:top-4
                  sm:px-3
                  sm:py-1.5
                  sm:text-[9px]
                "
              >
                Best Seller
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}