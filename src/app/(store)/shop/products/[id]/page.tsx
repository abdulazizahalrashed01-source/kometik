import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import AddToCartButton from "./AddToCartButton";

import CloudinaryProductImage from "@/components/CloudinaryProductImage";
import CategoryBreadcrumbs from "@/components/store/CategoryBreadcrumbs";

// ==========================================
// TYPES
// ==========================================

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// ==========================================
// PRODUCT DETAILS PAGE
// ==========================================

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  // ========================================
  // GET PRODUCT
  // ========================================

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },

      select: {
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
      },
    });

  // ========================================
  // PRODUCT NOT FOUND
  // ========================================

  if (!product) {
    notFound();
  }

  // ========================================
  // GET SIMILAR PRODUCTS
  // ========================================

  const similarProducts =
    await prisma.product.findMany({
      where: {
        categoryId:
          product.category.id,

        id: {
          not: product.id,
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
        stock: true,

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

  // ========================================
  // STOCK
  // ========================================

  const outOfStock =
    product.stock <= 0;

  // ========================================
  // PAGE
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
          PRODUCT DETAILS
      ================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          lg:px-8
          lg:py-12
        "
      >

        <CategoryBreadcrumbs
          categoryId={product.category.id}
          productName={product.name}
        />
        {/* ====================================
            BACK TO SHOP
        ==================================== */}

        <Link
          href="/shop"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-(--olive-200)
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-(--olive-700)
            shadow-sm
            transition
            hover:border-(--brick-200)
            hover:bg-(--olive-50)
            hover:text-(--brick-700)
          "
        >
          <ArrowRight
            size={16}
            strokeWidth={1.9}
          />

          العودة إلى المتجر
        </Link>

        {/* ====================================
            PRODUCT GRID
        ==================================== */}

        <div
          className="
            grid
            gap-10
            lg:grid-cols-2
            lg:gap-16
          "
        >
          {/* ==================================
              IMAGE
          ================================== */}

          <div>
            <div
              className="
                relative
                aspect-square
                overflow-hidden
                rounded-[2rem]
                border
                border-(--olive-200)
                bg-(--olive-100)
                shadow-[var(--shadow-soft)]
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
                  alt={
                    product.name
                  }
                  fill
                  sizes="
                    (max-width: 1024px) 100vw,
                    50vw
                  "
                  className="
                    object-contain
                    p-8
                    transition-transform
                    duration-700
                    hover:scale-[1.03]
                    sm:p-12
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    text-sm
                    text-(--olive-500)
                  "
                >
                  لا توجد صورة
                </div>
              )}
            </div>
          </div>

          {/* ==================================
              INFORMATION
          ================================== */}

          <div
            className="
              flex
              flex-col
              justify-center
            "
          >
            {/* CATEGORY */}

            <Link
              href={`/shop?category=${product.category.id}`}
              className="
                mb-4
                w-fit
                rounded-full
                bg-(--brick-50)
                px-3.5
                py-1.5
                text-xs
                font-semibold
                text-(--brick-700)
                transition
                hover:bg-(--brick-100)
              "
            >
              {product.category.name}
            </Link>

            {/* NAME */}

            <h1
              className="
                text-3xl
                font-bold
                leading-tight
                tracking-tight
                text-(--olive-900)
                sm:text-4xl
                lg:text-5xl
              "
            >
              {product.name}
            </h1>

            {/* PRICE */}

            <div
              className="
                mt-6
                flex
                items-end
                gap-3
              "
            >
              <p
                className="
                  text-3xl
                  font-bold
                  text-(--brick-600)
                "
                dir="ltr"
              >
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* STOCK STATUS */}

            <div className="mt-4">
              {outOfStock ? (
                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-red-50
                    px-3.5
                    py-1.5
                    text-sm
                    font-semibold
                    text-red-600
                  "
                >
                  نفد المخزون
                </span>
              ) : (
                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-(--olive-100)
                    px-3.5
                    py-1.5
                    text-sm
                    font-semibold
                    text-(--olive-700)
                  "
                >
                  متوفر
                </span>
              )}
            </div>

            {/* DESCRIPTION */}

            {product.description && (
              <div
                className="
                  mt-8
                  border-t
                  border-(--olive-200)
                  pt-7
                "
              >
                <h2
                  className="
                    text-base
                    font-bold
                    text-(--olive-900)
                  "
                >
                  وصف المنتج
                </h2>

                <p
                  className="
                    mt-3
                    whitespace-pre-line
                    text-sm
                    leading-7
                    text-(--olive-600)
                    sm:text-base
                  "
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* ADD TO CART */}

            <div
              className="
                mt-8
              "
            >
              <AddToCartButton
                id={product.id}
                name={product.name}
                price={product.price}
                stock={product.stock}
                imageUrl={
                  product.imageUrl
                }
                imagePublicId={
                  product.imagePublicId
                }
                showQuantitySelector
              />
            </div>

            {/* PRODUCT META */}

            <div
              className="
                mt-8
                overflow-hidden
                rounded-2xl
                border
                border-(--olive-200)
                bg-(--olive-50)
              "
            >
              {/* CATEGORY */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-(--olive-200)
                  px-5
                  py-4
                  text-sm
                "
              >
                <span
                  className="
                    text-(--olive-600)
                  "
                >
                  التصنيف
                </span>

                <span
                  className="
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  {product.category.name}
                </span>
              </div>

              {/* AVAILABILITY */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-(--olive-200)
                  px-5
                  py-4
                  text-sm
                "
              >
                <span
                  className="
                    text-(--olive-600)
                  "
                >
                  التوفر
                </span>

                <span
                  className={`
                    font-semibold
                    ${
                      outOfStock
                        ? "text-red-600"
                        : "text-(--olive-900)"
                    }
                  `}
                >
                  {outOfStock
                    ? "غير متوفر"
                    : "متوفر"}
                </span>
              </div>

              {/* PRODUCT ID */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  px-5
                  py-4
                  text-sm
                "
              >
                <span
                  className="
                    text-(--olive-600)
                  "
                >
                  رقم المنتج
                </span>

                <span
                  dir="ltr"
                  className="
                    max-w-[60%]
                    truncate
                    font-mono
                    text-xs
                    text-(--olive-800)
                  "
                >
                  {product.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SIMILAR PRODUCTS
      ================================================== */}

      {similarProducts.length > 0 && (
        <section
          className="
            border-t
            border-(--olive-200)
            bg-white
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
            {/* SECTION HEADER */}

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
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-(--brick-500)
                  "
                >
                  ربما يعجبك أيضًا
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
                  منتجات مشابهة
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-(--olive-600)
                  "
                >
                  منتجات أخرى من نفس التصنيف
                  قد تناسبك.
                </p>
              </div>

              <Link
                href={`/shop?category=${product.category.id}`}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-(--brick-600)
                  transition
                  hover:text-(--brick-700)
                "
              >
                عرض المزيد

                <ArrowRight
                  size={16}
                  strokeWidth={1.9}
                />
              </Link>
            </div>

            {/* PRODUCTS */}

            <div
              className="
                grid
                grid-cols-2
                gap-x-4
                gap-y-8
                sm:grid-cols-2
                sm:gap-6
                lg:grid-cols-4
              "
            >
              {similarProducts.map(
                (similarProduct) => (
                  <Link
                    key={
                      similarProduct.id
                    }
                    href={`/shop/products/${similarProduct.id}`}
                    className="
                      group
                      min-w-0
                    "
                  >
                    {/* IMAGE */}

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
                      {similarProduct.imagePublicId ||
                      similarProduct.imageUrl ? (
                        <CloudinaryProductImage
                          imagePublicId={
                            similarProduct.imagePublicId
                          }
                          imageUrl={
                            similarProduct.imageUrl
                          }
                          alt={
                            similarProduct.name
                          }
                          fill
                          sizes="
                            (max-width: 640px) 50vw,
                            (max-width: 1024px) 25vw,
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
                        {
                          similarProduct
                            .category.name
                        }
                      </span>
                    </div>

                    {/* INFO */}

                    <div className="pt-4">
                      <h3
                        className="
                          line-clamp-2
                          min-h-[3rem]
                          text-sm
                          font-semibold
                          leading-6
                          text-(--olive-900)
                          transition-colors
                          group-hover:text-(--brick-700)
                          sm:text-base
                        "
                      >
                        {
                          similarProduct.name
                        }
                      </h3>

                      {similarProduct.description ? (
                        <p
                          className="
                            mt-1.5
                            line-clamp-2
                            min-h-[2.5rem]
                            text-xs
                            leading-5
                            text-(--olive-600)
                            sm:text-sm
                          "
                        >
                          {
                            similarProduct.description
                          }
                        </p>
                      ) : (
                        <div className="min-h-[2.5rem]" />
                      )}

                      <div
                        className="
                          mt-3
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
                          $
                          {similarProduct.price.toFixed(
                            2
                          )}
                        </p>

                        <span
                          className="
                            inline-flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            bg-(--brick-50)
                            text-(--brick-600)
                            transition
                            group-hover:bg-(--brick-100)
                          "
                          aria-hidden="true"
                        >
                          <ShoppingBag
                            size={16}
                            strokeWidth={1.8}
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          BOTTOM CTA
      ================================================== */}

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
            py-10
            text-center
            sm:px-6
            lg:px-8
          "
        >
          <p
            className="
              text-sm
              text-(--olive-600)
            "
          >
            اكتشف المزيد من منتجات العناية
            والجمال.
          </p>

          <Link
            href="/shop"
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-(--brick-600)
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-(--brick-700)
            "
          >
            متابعة التسوق

            <ArrowRight
              size={16}
              strokeWidth={1.9}
            />
          </Link>
        </div>
      </section>
    </main>
  );
}