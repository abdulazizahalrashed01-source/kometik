import Link from "next/link";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";

import CloudinaryProductImage from "@/components/CloudinaryProductImage";
import ShopHeroCarousel from "@/components/store/ShopHeroCarousel";

// ==========================================
// TYPES
// ==========================================

type ProductCard = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  category: {
    id: string;
    name: string;
  };
};

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

type CollectionWithProducts = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: ProductCard[];
};

// ==========================================
// SHOP PAGE
// ==========================================

export default async function ShopPage() {
  // ==========================================
  // LATEST 3 PRODUCTS FOR HERO
  // ==========================================

  const latestHeroProducts: HeroProduct[] =
    await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        imagePublicId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

  // ==========================================
  // FEATURED PRODUCTS
  // ==========================================

  const featuredProducts: ProductCard[] =
    await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        imagePublicId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    take: 8,
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  // ==========================================
  // BEST SELLER
  // ==========================================

  const bestSellerAggregate =
    await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          status: {
            not: "CANCELLED",
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 1,
    });

  const bestSellingProductId =
    bestSellerAggregate[0]?.productId ?? null;

  const bestSellingProduct: HeroProduct | null =
    bestSellingProductId
      ? await prisma.product.findUnique({
          where: {
            id: bestSellingProductId,
          },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            imagePublicId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        })
      : null;

  // ==========================================
  // ACTIVE COLLECTIONS
  // ==========================================

  const activeCollections =
    await prisma.collection.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        tagId: true,
      },
    });

  // ==========================================
  // COLLECTION PRODUCTS
  // ==========================================

  const collectionsWithProducts: CollectionWithProducts[] =
    await Promise.all(
      activeCollections.map(async (collection) => {
        let products: ProductCard[] = [];

        // --------------------------------------
        // TAG COLLECTION
        // --------------------------------------

        if (
          collection.type === "TAG" &&
          collection.tagId
        ) {
          products = await prisma.product.findMany({
            where: {
              tags: {
                some: {
                  tagId: collection.tagId,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 4,
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
              imagePublicId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });
        }

        // --------------------------------------
        // MANUAL COLLECTION
        // --------------------------------------

        if (collection.type === "MANUAL") {
          products = await prisma.product.findMany({
            where: {
              collections: {
                some: {
                  collectionId: collection.id,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 4,
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
              imagePublicId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });
        }

        return {
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          description: collection.description,
          products,
        };
      })
    );

  // ==========================================
  // ONLY COLLECTIONS WITH PRODUCTS
  // ==========================================

  const visibleCollections =
    collectionsWithProducts.filter(
      (collection) =>
        collection.products.length > 0
    );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-(--background)
        text-(--foreground)
      "
    >
      {/* =================================================
          HERO
      ================================================== */}

      <ShopHeroCarousel
        latestProducts={latestHeroProducts}
        bestSellingProduct={bestSellingProduct}
      />

      {/* =================================================
          CATEGORIES
      ================================================== */}

     

      {/* =================================================
          FEATURED PRODUCTS
      ================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-12
          sm:px-6
          lg:px-8
          lg:py-16
        "
      >
        <div
          className="
            mb-7
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-(--brick-500)
              "
            >
              جديدنا
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-bold
                tracking-tight
                text-(--olive-900)
                sm:text-3xl
              "
            >
              منتجات تستحق الاكتشاف
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-(--olive-600)
              "
            >
              أحدث المنتجات المختارة من مجموعتنا.
            </p>
          </div>

          <Link
            href="/shop/products"
            className="
              hidden
              items-center
              gap-1
              text-sm
              font-semibold
              text-(--brick-600)
              sm:inline-flex
            "
          >
            عرض الكل
            <ArrowLeft size={15} />
          </Link>
        </div>

        {featuredProducts.length > 0 && (
          <div
            className="
              grid
              grid-cols-2
              gap-x-4
              gap-y-9
              sm:grid-cols-3
              sm:gap-x-6
              lg:grid-cols-4
            "
          >
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/products/${product.id}`}
                className="
                  group
                  min-w-0
                "
              >
                <div
                  className="
                    relative
                    aspect-square
                    overflow-hidden
                    rounded-2xl
                    bg-(--olive-100)
                  "
                >
                  {product.imagePublicId ||
                  product.imageUrl ? (
                    <CloudinaryProductImage
                      imagePublicId={
                        product.imagePublicId
                      }
                      imageUrl={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="
                        (max-width: 640px) 50vw,
                        (max-width: 1024px) 33vw,
                        25vw
                      "
                      className="
                        object-contain
                        p-5
                        transition-transform
                        duration-500
                        group-hover:scale-[1.04]
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        items-center
                        justify-center
                        text-sm
                        font-semibold
                        text-(--olive-500)
                      "
                    >
                      Kometik
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-(--brick-500)
                    "
                  >
                    {product.category.name}
                  </p>

                  <h3
                    className="
                      mt-1.5
                      line-clamp-2
                      text-sm
                      font-semibold
                      leading-6
                      text-(--olive-900)
                      transition-colors
                      group-hover:text-(--brick-700)
                      sm:text-base
                    "
                  >
                    {product.name}
                  </h3>

                  <p
                    className="
                      mt-2
                      font-bold
                      text-(--brick-600)
                    "
                    dir="ltr"
                  >
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* =================================================
          COLLECTIONS
      ================================================== */}

      {visibleCollections.length > 0 && (
        <section
          className="
            border-y
            border-(--olive-200)
            bg-(--olive-50)
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              py-12
              sm:px-6
              lg:px-8
              lg:py-16
            "
          >
            <div className="mb-8">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-(--brick-500)
                "
              >
                Collections
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-bold
                  tracking-tight
                  text-(--olive-900)
                  sm:text-3xl
                "
              >
                اكتشف اختياراتنا
              </h2>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-7
                  text-(--olive-600)
                "
              >
                مجموعات منسقة تساعدك على الوصول إلى المنتجات
                المناسبة بطريقة أبسط.
              </p>
            </div>

            <div className="space-y-12">
              {visibleCollections.map(
                (collection, index) => (
                  <div key={collection.id}>
                    <div
                      className="
                        mb-6
                        flex
                        items-end
                        justify-between
                        gap-4
                      "
                    >
                      <div>
                        <span
                          className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-(--brick-500)
                          "
                        >
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <h3
                          className="
                            mt-1
                            text-xl
                            font-bold
                            text-(--olive-900)
                            sm:text-2xl
                          "
                        >
                          {collection.name}
                        </h3>

                        {collection.description && (
                          <p
                            className="
                              mt-1.5
                              max-w-xl
                              text-sm
                              leading-6
                              text-(--olive-600)
                            "
                          >
                            {
                              collection.description
                            }
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/shop/products?collection=${encodeURIComponent(
                          collection.slug
                        )}`}
                        className="
                          hidden
                          shrink-0
                          items-center
                          gap-1
                          text-sm
                          font-semibold
                          text-(--brick-600)
                          sm:inline-flex
                        "
                      >
                        عرض المجموعة
                        <ArrowLeft size={15} />
                      </Link>
                    </div>

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-x-4
                        gap-y-8
                        sm:grid-cols-4
                        sm:gap-6
                      "
                    >
                      {collection.products.map(
                        (product) => (
                          <Link
                            key={product.id}
                            href={`/shop/products/${product.id}`}
                            className="group min-w-0"
                          >
                            <div
                              className="
                                relative
                                aspect-square
                                overflow-hidden
                                rounded-2xl
                                bg-white
                              "
                            >
                              {product.imagePublicId ||
                              product.imageUrl ? (
                                <CloudinaryProductImage
                                  imagePublicId={
                                    product.imagePublicId
                                  }
                                  imageUrl={
                                    product.imageUrl
                                  }
                                  alt={product.name}
                                  fill
                                  sizes="
                                    (max-width: 640px) 50vw,
                                    25vw
                                  "
                                  className="
                                    object-contain
                                    p-5
                                    transition-transform
                                    duration-500
                                    group-hover:scale-[1.04]
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
                            </div>

                            <div className="pt-3">
                              <h4
                                className="
                                  line-clamp-2
                                  text-sm
                                  font-semibold
                                  leading-6
                                  text-(--olive-900)
                                  transition-colors
                                  group-hover:text-(--brick-700)
                                "
                              >
                                {product.name}
                              </h4>

                              <p
                                className="
                                  mt-1.5
                                  text-sm
                                  font-bold
                                  text-(--brick-600)
                                "
                                dir="ltr"
                              >
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          FINAL CTA
      ================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-12
          sm:px-6
          lg:px-8
          lg:py-16
        "
      >
        <div
          className="
            overflow-hidden
            rounded-4xl
            bg-(--olive-900)
            px-6
            py-12
            text-center
            text-white
            sm:px-10
            lg:px-16
            lg:py-16
          "
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-(--olive-400)
            "
          >
            Kometik
          </p>

          <h2
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-3xl
              font-bold
              tracking-tight
              sm:text-4xl
            "
          >
            ابدأ روتينك من المكان الصحيح.
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-sm
              leading-7
              text-(--olive-300)
              sm:text-base
            "
          >
            تصفح مجموعتنا الكاملة واكتشف ما يناسب
            احتياجاتك اليومية.
          </p>

          <Link
            href="/shop/products"
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-white
              px-7
              py-3.5
              text-sm
              font-semibold
              text-(--olive-900)
              transition
              hover:bg-(--olive-100)
            "
          >
            ابدأ التسوق
            <ArrowLeft size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}