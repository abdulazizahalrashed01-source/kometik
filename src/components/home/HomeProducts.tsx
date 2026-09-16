"use client";

import Link from "next/link";

import {
  ArrowUpLeft,
  Heart,
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import CloudinaryProductImage from "@/components/CloudinaryProductImage";
import ProductRail from "@/components/home/ProductRail";
import { useCart } from "@/store/useCart";
import { useWishlist } from "@/store/useWishlist";
import ScrollReveal from "./ScrollReveal";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  category: {
    name: string;
  };
};

type HomeProductsProps = {
  products: Product[];
};

type OpenAccountEventDetail = {
  wishlistProductId: string;
};

export default function HomeProducts({
  products,
}: HomeProductsProps) {
  const addItem = useCart(
    (state) => state.addItem
  );

  const wishlistItems = useWishlist(
    (state) => state.items
  );

  const loadWishlist = useWishlist(
    (state) => state.loadWishlist
  );

  const toggleWishlist = useWishlist(
    (state) => state.toggleWishlist
  );

  const [
    hoveredCartProductId,
    setHoveredCartProductId,
  ] = useState<string | null>(null);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  function requestAccountForWishlist(
    productId: string
  ) {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent<OpenAccountEventDetail>(
        "kometik:open-account",
        {
          detail: {
            wishlistProductId: productId,
          },
        }
      )
    );
  }

  async function handleWishlistToggle(
    productId: string
  ) {
    const success =
      await toggleWishlist(productId);

    if (success) {
      return;
    }

    const wishlistError =
      useWishlist.getState().error;

    if (
      wishlistError ===
      "يجب تسجيل الدخول أولاً"
    ) {
      requestAccountForWishlist(productId);
    }
  }

  function addProduct(product: Product) {
    if (product.stock <= 0) {
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      imagePublicId:
        product.imagePublicId,
    });
  }

  return (
    <section
      id="products"
      dir="rtl"
      className="
        mx-auto
        max-w-7xl
        px-4
        py-12
        sm:px-6
        sm:py-14
        lg:px-8
        lg:py-16
      "
    >
      <ScrollReveal>
        <div
          className="
            mb-7
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
              THE SELECTION
            </p>

            <h2
              className="
                mt-3
                text-3xl
                font-medium
                tracking-[-0.04em]
                text-[var(--ink)]
                sm:text-4xl
              "
            >
              مختاراتنا.
            </h2>
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
            كل المنتجات

            <ArrowUpLeft
              size={15}
              strokeWidth={1.6}
            />
          </Link>
        </div>
      </ScrollReveal>

      {products.length === 0 ? (
        <div
          className="
            rounded-[30px]
            bg-[var(--sand)]/45
            px-6
            py-16
            text-center
          "
        >
          <p
            className="
              text-sm
              text-[var(--olive-dark)]
            "
          >
            لا توجد منتجات متاحة
            حالياً.
          </p>
        </div>
      ) : (
        <ProductRail>
          {products.map(
            (product, index) => {
              const favorite =
                wishlistItems.some(
                  (item) =>
                    item.productId ===
                    product.id
                );

              const cartIsHovered =
                hoveredCartProductId ===
                product.id;

              return (
                <div
                  key={product.id}
                  className="
                    w-[calc(50%-8px)]
                    shrink-0
                    snap-start
                    sm:w-[calc(33.333%-13px)]
                    lg:w-[calc(28%-14px)]
                    xl:w-[calc(27%-15px)]
                  "
                >
                  <ScrollReveal
                    delay={
                      (index % 4) * 70
                    }
                  >
                    <article
                      className="
                        group
                        relative
                        isolate
                      "
                    >
                      <div
                        className="
                          relative
                          aspect-[4/5]
                          overflow-hidden
                          rounded-[28px]
                          bg-white
                        "
                      >
                        <Link
                          href={`/shop/products/${product.id}`}
                          aria-label={`عرض ${product.name}`}
                          className="
                            absolute
                            inset-0
                            z-0
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
                                (max-width: 640px) 50vw,
                                (max-width: 1024px) 33vw,
                                (max-width: 1280px) 28vw,
                                27vw
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
                        </Link>

                        <span
                          className="
                            pointer-events-none
                            absolute
                            right-3
                            top-3
                            z-20
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

                        <button
                          type="button"
                          onClick={() => {
                            void handleWishlistToggle(
                              product.id
                            );
                          }}
                          aria-label={
                            favorite
                              ? `إزالة ${product.name} من المفضلة`
                              : `إضافة ${product.name} إلى المفضلة`
                          }
                          aria-pressed={
                            favorite
                          }
                          className={`
                            absolute
                            left-3
                            top-3
                            z-[200]

                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center

                            rounded-full

                            bg-[var(--cream)]/90
                            backdrop-blur-md

                            shadow-[0_6px_20px_rgba(0,0,0,0.08)]

                            transition-all
                            duration-300

                            hover:scale-105
                            active:scale-95

                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[var(--brick)]
                            focus-visible:ring-offset-2

                            ${
                              favorite
                                ? "text-[var(--brick)]"
                                : "text-[var(--olive-dark)]"
                            }
                          `}
                        >
                          <Heart
                            size={15}
                            strokeWidth={1.6}
                            fill={
                              favorite
                                ? "currentColor"
                                : "none"
                            }
                            className="
                              shrink-0
                              transition-transform
                              duration-300
                            "
                          />
                        </button>

                        {product.stock > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              addProduct(
                                product
                              )
                            }
                            onMouseEnter={() =>
                              setHoveredCartProductId(
                                product.id
                              )
                            }
                            onMouseLeave={() =>
                              setHoveredCartProductId(
                                null
                              )
                            }
                            onFocus={() =>
                              setHoveredCartProductId(
                                product.id
                              )
                            }
                            onBlur={() =>
                              setHoveredCartProductId(
                                null
                              )
                            }
                            aria-label={`إضافة ${product.name} إلى السلة`}
                            className="
                               absolute
  bottom-3
  left-3
  z-[200]

  flex
  h-10
  w-10
  shrink-0
  items-center
  justify-center

  rounded-full

  !text-white

  shadow-[0_8px_25px_rgba(0,0,0,0.18)]

  transition-all
  duration-300
  ease-[var(--ease-editorial)]

  hover:-translate-y-1
  hover:scale-105

  active:scale-95

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-[var(--brick)]
  focus-visible:ring-offset-2

                              
                            "
                           style={{
  backgroundColor:
    cartIsHovered
      ? "#8B4A3C"
      : "#2F3028",

  color: "#FFFFFF",
}}
                          >
                            <ShoppingBag
                              size={17}
                              strokeWidth={1.8}
                              className="
                                pointer-events-none
                                shrink-0
                                !text-white
                                transition-transform
                                duration-300
                              "
                            />
                          </button>
                        )}
                      </div>

                      <div className="pt-3">
                        <p
                          className="
                            text-[8px]
                            uppercase
                            tracking-[0.2em]
                            text-[var(--olive-dark)]/55
                          "
                        >
                          {
                            product.category
                              .name
                          }
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
                            <h3
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
                              {
                                product.name
                              }
                            </h3>
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
                          $
                          {product.price.toFixed(
                            2
                          )}
                        </p>
                      </div>
                    </article>
                  </ScrollReveal>
                </div>
              );
            }
          )}
        </ProductRail>
      )}
    </section>
  );
}
