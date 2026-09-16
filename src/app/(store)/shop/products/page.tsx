import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import AddToCartButton from "./[id]/AddToCartButton";
import CloudinaryProductImage from "@/components/CloudinaryProductImage";

// ==========================================
// TYPES
// ==========================================

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    collection?: string;
  }>;
};

type ProductListItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  imagePublicId: string | null;

  category: {
    id: string;
    name: string;
  };
};

// ==========================================
// PAGE
// ==========================================

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  // ========================================
  // QUERY PARAMS
  // ========================================

  const search =
    typeof params.search === "string"
      ? params.search.trim()
      : "";

  const categoryId =
    typeof params.categoryId === "string"
      ? params.categoryId
      : "";

  const collectionSlug =
    typeof params.collection === "string"
      ? params.collection.trim()
      : "";

  // ========================================
  // GET CATEGORIES
  // ========================================

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  // ========================================
  // GET COLLECTION
  // ========================================

  let collection:
    | {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        imagePublicId: string | null;
        active: boolean;
        type: "MANUAL" | "TAG";
        tagId: string | null;
      }
    | null = null;

  if (collectionSlug) {
    collection = await prisma.collection.findUnique({
      where: {
        slug: collectionSlug,
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        imagePublicId: true,
        active: true,
        type: true,
        tagId: true,
      },
    });
  }

  // ========================================
  // COMMON FILTER
  // ========================================

  const commonWhere = {
    ...(categoryId
      ? {
          categoryId,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  // ========================================
  // PRODUCT SELECT
  // ========================================

  const productSelect = {
    id: true,
    name: true,
    description: true,
    price: true,
    stock: true,
    imageUrl: true,
    imagePublicId: true,

    category: {
      select: {
        id: true,
        name: true,
      },
    },
  } as const;

  // ========================================
  // PRODUCTS
  // ========================================

  let products: ProductListItem[] = [];

  // ========================================
  // COLLECTION FILTER
  // ========================================

  if (collectionSlug) {
    // --------------------------------------
    // COLLECTION NOT FOUND / INACTIVE
    // --------------------------------------

    if (!collection || !collection.active) {
      products = [];
    }

    // --------------------------------------
    // TAG COLLECTION
    // --------------------------------------

    else if (
      collection.type === "TAG" &&
      collection.tagId
    ) {
      products = await prisma.product.findMany({
        where: {
          ...commonWhere,

          tags: {
            some: {
              tagId: collection.tagId,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        select: productSelect,
      });
    }

    // --------------------------------------
    // MANUAL COLLECTION
    // --------------------------------------

    else if (collection.type === "MANUAL") {
      products = await prisma.product.findMany({
        where: {
          ...commonWhere,

          collections: {
            some: {
              collectionId: collection.id,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        select: productSelect,
      });
    }
  }

  // ========================================
  // NORMAL PRODUCTS
  // ========================================

  else {
    products = await prisma.product.findMany({
      where: commonWhere,

      orderBy: {
        createdAt: "desc",
      },

      select: productSelect,
    });
  }

  // ========================================
  // ACTIVE CATEGORY
  // ========================================

  const activeCategory = categories.find(
    (category) => category.id === categoryId
  );

  const isCollectionPage =
    Boolean(collectionSlug) &&
    Boolean(collection?.active);

  // ========================================
  // PAGE TITLE
  // ========================================

  let pageTitle = "جميع المنتجات";

  if (isCollectionPage && collection) {
    pageTitle = collection.name;
  } else if (activeCategory) {
    pageTitle = activeCategory.name;
  } else if (search) {
    pageTitle = "نتائج البحث";
  }

  // ========================================
  // PAGE DESCRIPTION
  // ========================================

  const pageDescription =
    isCollectionPage && collection?.description
      ? collection.description
      : "اكتشف منتجات العناية والجمال المختارة بعناية.";

  // ========================================
  // COLLECTION LABEL
  // ========================================

  const collectionTypeLabel =
    collection?.type === "TAG"
      ? "اختيار مرتبط بالتصنيف"
      : "اختيار كومتك";

  // ========================================
  // COLLECTION IMAGE
  // ========================================

  const hasCollectionImage = Boolean(
    collection?.imagePublicId || collection?.imageUrl
  );

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-(--background)
        text-(--foreground)
      "
    >
      {/* ==================================================
          COLLECTION HERO
      ================================================== */}

      {isCollectionPage && collection ? (
        <section
          className="
            relative
            isolate
            min-h-[280px]
            overflow-hidden
            border-b
            border-(--olive-200)
            bg-(--olive-900)
            sm:min-h-[330px]
            lg:min-h-[380px]
          "
        >
          {/* COLLECTION IMAGE */}

          {hasCollectionImage ? (
            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                -z-20
              "
            >
              <CloudinaryProductImage
                imagePublicId={collection.imagePublicId}
                imageUrl={collection.imageUrl}
                alt=""
                fill
                sizes="100vw"
                className="
                  object-cover
                  object-center
                "
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                -z-20
                bg-(--cream)
              "
            />
          )}

          {/* OVERLAY */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              -z-10
              bg-black/40
              sm:bg-black/35
            "
          />

          {/* TEXT GRADIENT */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              -z-10
              bg-linear-to-r
              from-black/65
              via-black/35
              to-black/20
            "
          />

          {/* BOTTOM FADE */}

          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              bottom-0
              z-0
              h-28
              bg-linear-to-t
              from-black/45
              to-transparent
            "
          />

          {/* CONTENT */}

          <div
            className="
              relative
              mx-auto
              flex
              min-h-[280px]
              max-w-7xl
              items-end
              px-4
              py-9
              sm:min-h-[330px]
              sm:px-6
              sm:py-11
              lg:min-h-[380px]
              lg:px-8
              lg:py-14
            "
          >
            <div
              className="
                max-w-3xl
                text-white
              "
            >
              {/* LABEL */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-white/30
                    bg-white/10
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-white
                    backdrop-blur-md
                  "
                >
                  Collection
                </span>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-white/70
                  "
                >
                  {collectionTypeLabel}
                </span>
              </div>

              {/* TITLE */}

              <h1
                className="
                  mt-4
                  max-w-3xl
                  text-3xl
                  font-semibold
                  leading-[1.08]
                  tracking-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                  xl:text-6xl
                "
              >
                {collection.name}
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-white/85
                  sm:text-base
                  sm:leading-8
                "
              >
                {pageDescription}
              </p>

              {/* ACTIONS */}

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-white/25
                    bg-white/10
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    backdrop-blur-md
                  "
                >
                  {products.length === 1
                    ? "منتج واحد"
                    : `${products.length} منتجات`}
                </span>

                <Link
                  href="/shop/products"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-(--olive-900)
                    transition
                    hover:bg-(--cream)
                  "
                >
                  كل المنتجات
                  <ArrowLeft size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ==================================================
           NORMAL SHOP HEADER
        ================================================== */

        <section
          className="
            border-b
            border-(--olive-200)
            bg-(--olive-50)
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              py-10
              sm:px-6
              lg:px-8
              lg:py-14
            "
          >
            <div
              className="
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              {/* TITLE */}

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
                  Kometik Shop
                </p>

                <h1
                  className="
                    mt-2
                    text-3xl
                    font-bold
                    tracking-tight
                    text-(--olive-900)
                    sm:text-4xl
                  "
                >
                  {pageTitle}
                </h1>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-7
                    text-(--olive-600)
                    sm:text-base
                  "
                >
                  {pageDescription}
                </p>
              </div>

              {/* SEARCH */}

              <ShopSearchForm
                search={search}
                categoryId={categoryId}
                collectionSlug={collectionSlug}
              />
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          SEARCH FOR COLLECTION
      ================================================== */}

      {isCollectionPage && (
        <section
          className="
            border-b
            border-(--olive-200)
            bg-white
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              py-4
              sm:px-6
              lg:px-8
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-(--olive-500)
                "
              >
                <span>المجموعة</span>

                <span>•</span>

                <span className="text-(--olive-800)">
                  {collection?.name}
                </span>
              </div>

              <div className="w-full sm:w-auto sm:min-w-[320px]">
                <ShopSearchForm
                  search={search}
                  categoryId={categoryId}
                  collectionSlug={collectionSlug}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          FILTERS
      ================================================== */}

      <section
        className="
          border-b
          border-(--olive-200)
          bg-white
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            overflow-x-auto
            px-4
            py-4
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              flex
              w-max
              items-center
              gap-2
            "
          >
            {/* ALL */}

            <Link
              href={
                search
                  ? `/shop/products?search=${encodeURIComponent(
                      search
                    )}`
                  : "/shop/products"
              }
              scroll={false}
              className={`
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                transition
                ${
                  !categoryId && !collectionSlug
                    ? "bg-(--brick-600) text-white"
                    : "bg-(--olive-50) text-(--olive-700) hover:bg-(--olive-100)"
                }
              `}
            >
              جميع المنتجات
            </Link>

            {/* CATEGORIES */}

            {categories.map((category) => {
              const query = new URLSearchParams();

              query.set(
                "categoryId",
                category.id
              );

              if (search) {
                query.set(
                  "search",
                  search
                );
              }

              if (collectionSlug) {
                query.set(
                  "collection",
                  collectionSlug
                );
              }

              return (
                <Link
                  key={category.id}
                  href={`/shop/products?${query.toString()}`}
                  scroll={false}
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    transition
                    ${
                      categoryId === category.id
                        ? "bg-(--brick-600) text-white"
                        : "bg-(--olive-50) text-(--olive-700) hover:bg-(--olive-100)"
                    }
                  `}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          PRODUCTS
      ================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-10
          sm:px-6
          lg:px-8
          lg:py-14
        "
      >
        {/* RESULT HEADER */}

        <div
          className="
            mb-8
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            {isCollectionPage && collection ? (
              <>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-(--brick-500)
                  "
                >
                  Curated selection
                </p>

                <h2
                  className="
                    mt-1.5
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-(--olive-900)
                    sm:text-3xl
                  "
                >
                  مختارات {collection.name}
                </h2>
              </>
            ) : (
              <p
                className="
                  text-sm
                  text-(--olive-600)
                "
              >
                {products.length === 1
                  ? "منتج واحد"
                  : `${products.length} منتجات`}
              </p>
            )}
          </div>

          <div
            className="
              text-sm
              text-(--olive-500)
            "
          >
            {products.length === 1
              ? "منتج واحد"
              : `${products.length} منتجات`}
          </div>
        </div>

        {/* EMPTY */}

        {products.length === 0 ? (
          <div
            className="
              flex
              min-h-90
              flex-col
              items-center
              justify-center
              rounded-4xl
              border
              border-dashed
              border-(--olive-200)
              bg-(--olive-50)
              px-6
              text-center
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-white
                text-(--olive-500)
                shadow-sm
              "
            >
              <ShoppingCart
                size={24}
                strokeWidth={1.7}
              />
            </div>

            <h2
              className="
                mt-5
                text-xl
                font-bold
                text-(--olive-900)
              "
            >
              {isCollectionPage
                ? "هذه المجموعة فارغة حاليًا"
                : "لا توجد منتجات"}
            </h2>

            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-(--olive-600)
              "
            >
              {isCollectionPage
                ? "لم نعثر على منتجات ضمن هذه المجموعة في الوقت الحالي."
                : "لم نعثر على منتجات مطابقة للبحث أو التصنيف المحدد."}
            </p>

            <Link
              href="/shop/products"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
              "
            >
              عرض جميع المنتجات
              <ArrowLeft size={15} />
            </Link>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              gap-x-4
              gap-y-10
              sm:grid-cols-2
              sm:gap-6
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {products.map((product) => {
              const outOfStock =
                product.stock <= 0;

              return (
                <article
                  key={product.id}
                  className="group min-w-0"
                >
                  {/* IMAGE */}

                  <Link
                    href={`/shop/products/${product.id}`}
                    className="block"
                  >
                    <div
                      className="
                        relative
                        aspect-[4/4.8]
                        overflow-hidden
                        rounded-2xl
                        bg-(--olive-100)
                        ring-1
                        ring-(--olive-200)
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
                            (max-width: 1280px) 33vw,
                            25vw
                          "
                          className="
                            object-contain
                            p-4
                            transition-transform
                            duration-500
                            ease-out
                            group-hover:scale-[1.04]
                            sm:p-6
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
                            text-(--olive-500)
                          "
                        >
                          لا توجد صورة
                        </div>
                      )}

                      {/* CATEGORY */}

                      <span
                        className="
                          absolute
                          right-3
                          top-3
                          rounded-full
                          bg-white/90
                          px-2.5
                          py-1.5
                          text-[10px]
                          font-semibold
                          text-(--olive-700)
                          shadow-sm
                          backdrop-blur-sm
                        "
                      >
                        {product.category.name}
                      </span>

                      {/* OUT OF STOCK */}

                      {outOfStock && (
                        <div
                          className="
                            absolute
                            inset-x-3
                            bottom-3
                            rounded-xl
                            bg-white/90
                            px-3
                            py-2
                            text-center
                            text-xs
                            font-semibold
                            text-red-600
                            shadow-sm
                            backdrop-blur-sm
                          "
                        >
                          نفد المخزون
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* INFO */}

                  <div className="pt-4">
                    <Link
                      href={`/shop/products/${product.id}`}
                    >
                      <h2
                        className="
                          line-clamp-2
                          min-h-12
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
                      </h2>
                    </Link>

                    {product.description ? (
                      <p
                        className="
                          mt-1.5
                          line-clamp-2
                          min-h-10
                          text-xs
                          leading-5
                          text-(--olive-600)
                          sm:text-sm
                        "
                      >
                        {product.description}
                      </p>
                    ) : (
                      <div className="min-h-10" />
                    )}

                    {/* PRICE */}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <p
                        className="
                          font-bold
                          text-(--brick-600)
                        "
                        dir="ltr"
                      >
                        ${product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* ADD TO CART */}

                    <div className="mt-4">
                      <AddToCartButton
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        stock={product.stock}
                        imageUrl={product.imageUrl}
                        imagePublicId={
                          product.imagePublicId
                        }
                        compact
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================================================
          COLLECTION FOOTER
      ================================================== */}

      {isCollectionPage && collection && (
        <section
          className="
            border-t
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
            <div
              className="
                flex
                flex-col
                gap-6
                rounded-4xl
                border
                border-(--olive-200)
                bg-(--cream)
                p-6
                sm:p-8
                lg:flex-row
                lg:items-center
                lg:justify-between
                lg:p-10
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-(--brick-500)
                  "
                >
                  Continue exploring
                </p>

                <h3
                  className="
                    mt-2
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-(--olive-900)
                    sm:text-3xl
                  "
                >
                  اكتشف المزيد من منتجات كومتك
                </h3>

                <p
                  className="
                    mt-2
                    max-w-xl
                    text-sm
                    leading-7
                    text-(--olive-600)
                  "
                >
                  انتقل بين المنتجات والمجموعات واكتشف
                  اختيارات جديدة تناسب روتينك.
                </p>
              </div>

              <Link
                href="/shop/products"
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-(--olive-900)
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-(--olive-800)
                "
              >
                استكشف المتجر
                <ArrowLeft size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

// ==========================================
// SEARCH FORM
// ==========================================

function ShopSearchForm({
  search,
  categoryId,
  collectionSlug,
}: {
  search: string;
  categoryId: string;
  collectionSlug: string;
}) {
  return (
    <form
      action="/shop/products"
      className="w-full"
    >
      {categoryId && (
        <input
          type="hidden"
          name="categoryId"
          value={categoryId}
        />
      )}

      {collectionSlug && (
        <input
          type="hidden"
          name="collection"
          value={collectionSlug}
        />
      )}

      <div
        className="
          flex
          items-center
          gap-2
          rounded-2xl
          border
          border-(--olive-200)
          bg-white
          p-2
          shadow-sm
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-(--olive-50)
            text-(--olive-600)
          "
        >
          <Search
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="ابحث عن منتج..."
          className="
            min-w-0
            flex-1
            bg-transparent
            px-2
            text-sm
            text-(--olive-900)
            outline-none
            placeholder:text-(--olive-400)
          "
        />

        <button
          type="submit"
          className="
            rounded-xl
            bg-(--brick-600)
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-(--brick-700)
          "
        >
          بحث
        </button>
      </div>
    </form>
  );
}