"use client";

import { useEffect } from "react";
import Link from "next/link";

import {
  ArrowUpLeft,
  Heart,
  ShoppingBag,
} from "lucide-react";

import CloudinaryProductImage from "@/components/CloudinaryProductImage";
import { useCart } from "@/store/useCart";
import {
  useWishlist,
  type WishlistItem,
} from "@/store/useWishlist";

function WishlistProductCard({
  item,
}: {
  item: WishlistItem;
}) {
  const addItem = useCart(
    (state) => state.addItem
  );

  const removeFromWishlist = useWishlist(
    (state) => state.removeFromWishlist
  );

  const product = item.product;

  function addProductToCart() {
    if (product.stock <= 0) {
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      imagePublicId: product.imagePublicId,
    });
  }

  return (
    <article className="group">
      <div
        className="
          relative
          overflow-hidden
          rounded-[28px]
          bg-white
        "
      >
        <Link
          href={`/shop/products/${product.id}`}
          aria-label={`عرض ${product.name}`}
          className="block"
        >
          <div
            className="
              relative
              aspect-[4/5]
              overflow-hidden
              bg-[#f3f1ed]
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
                  duration-700
                  ease-[var(--ease-editorial)]
                  group-hover:scale-[1.055]
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
                  text-[var(--olive-dark)]/50
                "
              >
                لا توجد صورة
              </div>
            )}
          </div>
        </Link>

        {/* STOCK */}

        <span
          className="
            absolute
            right-3
            top-3
            z-10
            text-[8px]
            font-medium
            uppercase
            tracking-[0.17em]
            text-[var(--olive-dark)]/55
          "
        >
          {product.stock > 0
            ? "IN STOCK"
            : "SOLD OUT"}
        </span>

        {/* REMOVE */}

        <button
          type="button"
          onClick={() => {
            void removeFromWishlist(
              product.id
            );
          }}
          aria-label={`إزالة ${product.name} من المفضلة`}
          className="
            absolute
            left-3
            top-3
            z-20
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-[var(--cream)]/90
            text-[var(--brick-dark)]
            backdrop-blur
            transition
            duration-300
            hover:bg-[var(--brick)]
            hover:text-white
            focus-visible:bg-white
          "
        >
          <Heart
            size={15}
            strokeWidth={1.6}
            fill="currentColor"
          />
        </button>

        {/* ADD TO CART */}

        {product.stock > 0 && (
          <button
            type="button"
            onClick={addProductToCart}
            aria-label={`إضافة ${product.name} إلى السلة`}
            className="
              absolute
              bottom-3
              left-3
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-[var(--ink)]
              text-white
              opacity-100
              transition
              duration-300
              hover:bg-[var(--brick-dark)]
              sm:opacity-0
              sm:group-hover:opacity-100
              focus:opacity-100
            "
          >
            <ShoppingBag
              size={15}
              strokeWidth={1.7}
            />
          </button>
        )}
      </div>

      {/* PRODUCT INFO */}

      <div className="pt-3">
        <p
          className="
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-[var(--olive-dark)]/55
          "
        >
          {product.category.name}
        </p>

        <div
          className="
            mt-1
            flex
            items-start
            justify-between
            gap-2
          "
        >
          <Link
            href={`/shop/products/${product.id}`}
            className="min-w-0"
          >
            <h2
              className="
                line-clamp-2
                text-sm
                font-medium
                leading-6
                text-[var(--ink)]
                transition
                group-hover:text-[var(--brick-dark)]
              "
            >
              {product.name}
            </h2>
          </Link>

          <ArrowUpLeft
            size={14}
            strokeWidth={1.5}
            className="
              mt-1
              shrink-0
              text-[var(--olive-dark)]/25
              transition
              group-hover:-translate-x-1
              group-hover:-translate-y-1
              group-hover:text-[var(--brick)]
            "
          />
        </div>

        <p
          className="
            mt-2
            text-sm
            font-semibold
            text-[var(--brick-dark)]
          "
          dir="ltr"
        >
          ${product.price.toFixed(2)}
        </p>
      </div>
    </article>
  );
}

function WishlistSkeleton() {
  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[var(--background)]
        px-4
        py-20
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          animate-pulse
        "
      >
        <div className="h-3 w-20 rounded-full bg-black/5" />

        <div
          className="
            mt-5
            h-10
            w-48
            rounded-xl
            bg-black/5
          "
        />

        <div
          className="
            mt-12
            grid
            grid-cols-2
            gap-x-4
            gap-y-8
            sm:grid-cols-3
            lg:grid-cols-4
          "
        >
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div key={index}>
                <div
                  className="
                    aspect-[4/5]
                    rounded-[28px]
                    bg-black/5
                  "
                />

                <div
                  className="
                    mt-4
                    h-3
                    w-16
                    rounded-full
                    bg-black/5
                  "
                />

                <div
                  className="
                    mt-2
                    h-5
                    w-32
                    rounded-full
                    bg-black/5
                  "
                />
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}

function WishlistEmptyState() {
  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[var(--background)]
        px-4
        py-16
        sm:px-6
        sm:py-24
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="max-w-xl">
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.32em]
              text-[var(--brick)]
            "
          >
            YOUR EDIT
          </p>

          <h1
            className="
              mt-4
              text-4xl
              font-medium
              tracking-[-0.045em]
              text-[var(--ink)]
              sm:text-5xl
            "
          >
            المفضلة.
          </h1>

          <p
            className="
              mt-4
              max-w-md
              text-sm
              leading-7
              text-[var(--olive-dark)]/65
            "
          >
            المنتجات التي لفتت انتباهك
            تستحق مكاناً خاصاً.
          </p>
        </div>

        {/* EMPTY STATE */}

        <div
          className="
            mt-14
            flex
            min-h-[420px]
            flex-col
            items-center
            justify-center
            rounded-[36px]
            bg-[var(--sand)]/35
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
              bg-[var(--olive)]/10
              text-[var(--olive-dark)]
            "
          >
            <Heart
              size={24}
              strokeWidth={1.3}
            />
          </div>

          <h2
            className="
              mt-6
              text-xl
              font-medium
              text-[var(--ink)]
            "
          >
            لا توجد منتجات في المفضلة
          </h2>

          <p
            className="
              mt-2
              max-w-sm
              text-sm
              leading-7
              text-black/45
            "
          >
            اكتشفي منتجات Kometik وأضيفي
            ما يعجبك إلى قائمتك الخاصة.
          </p>

          <Link
            href="/shop"
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[var(--ink)]
              px-6
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[var(--brick-dark)]
            "
          >
            اكتشفي المنتجات

            <ArrowUpLeft
              size={15}
              strokeWidth={1.6}
            />
          </Link>
        </div>
      </div>
    </main>
  );
}

function WishlistErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[var(--background)]
        px-4
        py-16
        sm:px-6
        sm:py-24
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            flex
            min-h-[420px]
            flex-col
            items-center
            justify-center
            rounded-[36px]
            bg-[var(--sand)]/35
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
              bg-[var(--brick)]/10
              text-[var(--brick-dark)]
            "
          >
            <Heart
              size={24}
              strokeWidth={1.3}
            />
          </div>

          <h1
            className="
              mt-6
              text-xl
              font-medium
              text-[var(--ink)]
            "
          >
            تعذر تحميل المفضلة
          </h1>

          <p
            className="
              mt-2
              max-w-md
              text-sm
              leading-7
              text-black/45
            "
          >
            {message}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="
              mt-7
              rounded-full
              bg-[var(--ink)]
              px-6
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[var(--brick-dark)]
            "
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    </main>
  );
}

export default function WishlistPage() {
  const items = useWishlist(
    (state) => state.items
  );

  const isLoading = useWishlist(
    (state) => state.isLoading
  );

  const isInitialized = useWishlist(
    (state) => state.isInitialized
  );

  const error = useWishlist(
    (state) => state.error
  );

  const loadWishlist = useWishlist(
    (state) => state.loadWishlist
  );

  /*
   * تحميل المفضلة عند دخول الصفحة.
   *
   * الـ store نفسه يمنع تكرار الطلب
   * إذا كانت القائمة initialized أو قيد التحميل.
   */
  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  if (isLoading && !isInitialized) {
    return <WishlistSkeleton />;
  }

  if (error && !isInitialized) {
    return (
      <WishlistErrorState
        message={error}
      />
    );
  }

  if (items.length === 0) {
    return <WishlistEmptyState />;
  }

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[var(--background)]
        px-4
        py-16
        sm:px-6
        sm:py-20
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div
          className="
            flex
            items-end
            justify-between
            gap-6
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.32em]
                text-[var(--brick)]
              "
            >
              YOUR EDIT
            </p>

            <h1
              className="
                mt-4
                text-4xl
                font-medium
                tracking-[-0.045em]
                text-[var(--ink)]
                sm:text-5xl
              "
            >
              المفضلة.
            </h1>

            <p
              className="
                mt-3
                text-sm
                text-[var(--olive-dark)]/60
              "
            >
              {items.length}{" "}
              {items.length === 1
                ? "منتج"
                : "منتجات"}{" "}
              محفوظة لديك.
            </p>
          </div>

          <Link
            href="/shop"
            className="
              hidden
              items-center
              gap-2
              text-sm
              font-medium
              text-[var(--olive-dark)]
              transition
              hover:text-[var(--brick-dark)]
              sm:inline-flex
            "
          >
            متابعة التسوق

            <ArrowUpLeft
              size={15}
              strokeWidth={1.6}
            />
          </Link>
        </div>

        {/* PRODUCTS */}

        <div
          className="
            mt-12
            grid
            grid-cols-2
            gap-x-4
            gap-y-10
            sm:grid-cols-3
            sm:gap-x-6
            sm:gap-y-12
            lg:grid-cols-4
          "
        >
          {items.map((item) => (
            <WishlistProductCard
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {/* MOBILE CONTINUE SHOPPING */}

        <div className="mt-12 text-center sm:hidden">
          <Link
            href="/shop"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-[var(--olive-dark)]
            "
          >
            متابعة التسوق

            <ArrowUpLeft
              size={15}
              strokeWidth={1.6}
            />
          </Link>
        </div>
      </div>
    </main>
  );
}