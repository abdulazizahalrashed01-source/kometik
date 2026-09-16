import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export type HomeCategory = {
  id: string;
  name: string;
  parentId: string | null;
  _count: {
    products: number;
  };
};

type HomeCategoriesProps = {
  categories: HomeCategory[];
};

const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=85",
] as const;

const CARD_CLIPS = [
  "polygon(0 0,100% 6%,94% 100%,6% 94%)",
  "polygon(7% 4%,100% 0,94% 94%,0 100%)",
  "polygon(0 7%,94% 0,100% 92%,6% 100%)",
  "polygon(5% 0,100% 7%,95% 100%,0 94%)",
  "polygon(0 6%,93% 0,100% 95%,8% 100%)",
  "polygon(7% 0,100% 6%,93% 100%,0 94%)",
] as const;

export default function HomeCategories({
  categories,
}: HomeCategoriesProps) {
  const items = [
    {
      id: "all",
      name: "جميع المنتجات",
      count: categories.reduce(
        (total, category) =>
          total + category._count.products,
        0
      ),
    },
    ...categories.slice(0, 5).map(
      (category) => ({
        id: category.id,
        name: category.name,
        count: category._count.products,
      })
    ),
  ].slice(0, 6);

  return (
    <section
      id="categories"
      dir="rtl"
      className="
        relative
        overflow-hidden
        bg-[var(--cream)]
        scroll-mt-24
        px-5
        py-14
        sm:px-6
        sm:py-18
        lg:px-10
        lg:py-[92px]
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            SECTION INTRO
        ================================================== */}

        <ScrollReveal>
          <div className="max-w-2xl">
            <p
              className="
                text-[9px]
                font-medium
                tracking-[0.2em]
                text-[var(--brick)]
              "
            >
              EXPLORE COLLECTIONS
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
              اكتشفي عالم{" "}
              <span className="kometik-editorial italic text-[var(--olive-dark)]">
                Kometik
              </span>
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                text-[13px]
                leading-7
                text-black/48
                sm:text-sm
                sm:leading-8
              "
            >
              كل ما تحتاجينه لروتينك الجمالي،
              مرتب بطريقة تساعدك على الوصول
              لما تبحثين عنه بسهولة.
            </p>
          </div>
        </ScrollReveal>

        {/* =================================================
            CATEGORY GRID
        ================================================== */}

        <div
          className="
            mt-8
            grid
            grid-cols-1
            gap-3
            sm:mt-10
            sm:grid-cols-2
            sm:gap-4
            lg:mt-12
            lg:grid-cols-3
            lg:gap-[18px]
          "
        >
          {items.map(
            (
              item,
              index
            ) => {
              const image =
                CATEGORY_IMAGES[
                  index %
                    CATEGORY_IMAGES.length
                ];

              const clip =
                CARD_CLIPS[
                  index %
                    CARD_CLIPS.length
                ];

              const href =
                item.id === "all"
                  ? "/shop/products"
                  : `/shop/products?categoryId=${encodeURIComponent(
                      item.id
                    )}`;

              return (
                <ScrollReveal
                  key={item.id}
                  delay={index * 50}
                >
                  <Link
                    id={`category-${item.id}`}
                    href={href}
                    className="
                      group
                      relative
                      block
                      min-h-[210px]
                      overflow-hidden
                      text-right
                      transition
                      duration-500
                      hover:-translate-y-1.5
                      hover:shadow-[0_24px_50px_rgba(0,0,0,0.16)]
                      sm:min-h-[230px]
                      lg:min-h-[300px]
                    "
                    style={{
                      clipPath: clip,
                    }}
                  >
                    {/* =================================================
                        IMAGE
                    ================================================== */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        inset-0
                        bg-cover
                        bg-center
                        transition
                        duration-700
                        ease-[var(--ease-editorial)]
                        group-hover:scale-[1.045]
                      "
                      style={{
                        backgroundImage: `url("${image}")`,
                      }}
                    />

                    {/* =================================================
                        DARK / BRAND OVERLAY
                    ================================================== */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/65
                        via-black/20
                        to-black/5
                        transition
                        duration-500
                        group-hover:from-black/70
                        group-hover:via-black/25
                      "
                    />

                    {/* =================================================
                        OLIVE TINT
                    ================================================== */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        inset-0
                        bg-[var(--olive-dark)]/10
                        mix-blend-multiply
                        transition
                        duration-500
                        group-hover:bg-[var(--brick)]/10
                      "
                    />

                    {/* =================================================
                        DECORATIVE LIGHT
                    ================================================== */}

                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        -left-10
                        -top-10
                        h-28
                        w-28
                        rounded-full
                        bg-white/10
                        blur-[2px]
                        transition
                        duration-700
                        group-hover:scale-125
                      "
                    />

                    {/* =================================================
                        CONTENT
                    ================================================== */}

                    <div
                      className="
                        relative
                        z-10
                        flex
                        min-h-[210px]
                        flex-col
                        justify-between
                        p-5
                        sm:min-h-[230px]
                        sm:p-6
                        lg:min-h-[300px]
                        lg:p-7
                      "
                    >
                      {/* TOP */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <span
                          className="
                            kometik-editorial
                            text-xs
                            text-white/80
                            sm:text-sm
                          "
                        >
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span
                          className="
                            rounded-full
                            border
                            border-white/20
                            bg-black/10
                            px-3
                            py-1.5
                            text-[7px]
                            tracking-[0.15em]
                            text-white/75
                            backdrop-blur-sm
                            sm:text-[8px]
                          "
                        >
                          {item.count} PRODUCTS
                        </span>
                      </div>

                      {/* BOTTOM */}

                      <div>
                        <h3
                          className="
                            max-w-[13ch]
                            text-lg
                            font-semibold
                            leading-[1.45]
                            text-white
                            drop-shadow-[0_3px_15px_rgba(0,0,0,0.25)]
                            sm:text-xl
                            lg:text-[22px]
                          "
                        >
                          {item.name}
                        </h3>

                        <span
                          className="
                            mt-4
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/20
                            bg-white/10
                            text-white
                            backdrop-blur-sm
                            transition
                            duration-300
                            group-hover:bg-white
                            group-hover:text-[var(--ink)]
                            lg:mt-5
                            lg:h-11
                            lg:w-11
                          "
                        >
                          <ArrowLeft
                            size={15}
                            strokeWidth={1.7}
                            className="
                              transition
                              duration-300
                              group-hover:-translate-x-0.5
                            "
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}