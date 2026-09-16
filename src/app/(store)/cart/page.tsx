"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";

import { useCart } from "@/store/useCart";
import CloudinaryProductImage from "@/components/CloudinaryProductImage";

// ==========================================
// CART PAGE
// ==========================================

export default function CartPage() {
  // ==========================================
  // CART STORE
  // ==========================================

  const items = useCart(
    (state) => state.items
  );

  const removeItem = useCart(
    (state) => state.removeItem
  );

  const updateQuantity = useCart(
    (state) => state.updateQuantity
  );

  const clearCart = useCart(
    (state) => state.clearCart
  );

  const getSubtotal = useCart(
    (state) => state.getSubtotal
  );

  // ==========================================
  // TOTALS
  // ==========================================

  const subtotal = getSubtotal();

  const shipping =
    subtotal >= 50
      ? 0
      : 5.99;

  const total =
    subtotal + shipping;

  const remainingForFreeShipping =
    Math.max(0, 50 - subtotal);

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-(--background)
          text-(--foreground)
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[72vh]
            max-w-2xl
            flex-col
            items-center
            justify-center
            px-4
            py-16
            text-center
            sm:px-6
          "
        >
          {/* ICON */}

          <div
            className="
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-(--olive-100)
              text-(--brick-600)
            "
          >
            <ShoppingCart
              size={38}
              strokeWidth={1.5}
            />
          </div>

          {/* TITLE */}

          <p
            className="
              mt-7
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-(--brick-500)
            "
          >
            Kometik
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
            سلة المشتريات فارغة
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mt-4
              max-w-md
              leading-7
              text-(--olive-600)
            "
          >
            لم تتم إضافة أي منتجات إلى سلة
            المشتريات حتى الآن.
          </p>

          {/* CTA */}

          <Link
            href="/shop"
            className="
              mt-8
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-(--brick-600)
              px-7
              py-3.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-(--brick-700)
            "
          >
            ابدأ التسوق

            <ArrowLeft
              size={17}
              strokeWidth={2}
            />
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // CART
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
        {/* ========================================
            HEADER
        ======================================== */}

        <div
          className="
            mb-10
            flex
            flex-col
            gap-4
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
                tracking-[0.25em]
                text-(--brick-500)
              "
            >
              Kometik
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
              سلة المشتريات
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-(--olive-600)
              "
            >
              راجع منتجاتك قبل إتمام الطلب.
            </p>
          </div>

          {/* CLEAR CART */}

          <button
            type="button"
            onClick={clearCart}
            className="
              inline-flex
              items-center
              gap-2
              self-start
              rounded-full
              border
              border-(--brick-200)
              bg-(--brick-50)
              px-4
              py-2
              text-sm
              font-medium
              text-(--brick-700)
              transition
              hover:bg-(--brick-100)
              sm:self-auto
            "
          >
            <Trash2
              size={16}
              strokeWidth={1.8}
            />

            إفراغ السلة
          </button>
        </div>

        {/* ========================================
            LAYOUT
        ======================================== */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[1fr_380px]
          "
        >
          {/* ======================================
              PRODUCTS
          ====================================== */}

          <section
            className="
              overflow-hidden
              rounded-[1.75rem]
              border
              border-(--olive-200)
              bg-white
              shadow-[var(--shadow-soft)]
            "
          >
            {/* DESKTOP HEADER */}

            <div
              className="
                hidden
                border-b
                border-(--olive-200)
                px-6
                py-4
                text-xs
                font-semibold
                text-(--olive-600)
                sm:grid
                sm:grid-cols-[1fr_150px_120px]
                sm:gap-6
              "
            >
              <span>
                المنتج
              </span>

              <span className="text-center">
                الكمية
              </span>

              <span className="text-left">
                الإجمالي
              </span>
            </div>

            {/* ITEMS */}

            <div className="kometik-divide-y kometik-separator-gray">
              {items.map((item) => {
                // ==================================
                // STOCK LIMIT
                // ==================================

                const reachedLimit =
                  item.quantity >=
                  item.stock;

                const stockUnavailable =
                  item.stock <= 0;

                return (
                  <div
                    key={item.id}
                    className="
                      p-5
                      sm:p-6
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-5
                        sm:grid
                        sm:grid-cols-[1fr_150px_120px]
                        sm:items-center
                        sm:gap-6
                      "
                    >
                      {/* ==================================
                          PRODUCT
                      ================================== */}

                      <div
                        className="
                          flex
                          min-w-0
                          gap-4
                        "
                      >
                        {/* IMAGE */}

                        <Link
                          href={`/shop/products/${item.id}`}
                          className="
                            relative
                            h-24
                            w-24
                            shrink-0
                            overflow-hidden
                            rounded-2xl
                            bg-(--olive-100)
                            ring-1
                            ring-(--olive-200)
                          "
                        >
                          {item.imagePublicId ||
                          item.imageUrl ? (
                            <CloudinaryProductImage
                              imagePublicId={
                                item.imagePublicId
                              }
                              imageUrl={
                                item.imageUrl
                              }
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="
                                object-contain
                                p-2
                                transition-transform
                                duration-300
                                hover:scale-105
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
                        </Link>

                        {/* INFO */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <Link
                            href={`/shop/products/${item.id}`}
                            className="
                              text-base
                              font-semibold
                              leading-6
                              text-(--olive-900)
                              transition
                              hover:text-(--brick-600)
                            "
                          >
                            {item.name}
                          </Link>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-(--olive-600)
                            "
                            dir="ltr"
                          >
                            ${item.price.toFixed(2)}
                          </p>

                          {/* STOCK MESSAGE */}

                          {stockUnavailable ? (
                            <p
                              className="
                                mt-2
                                text-xs
                                font-semibold
                                text-red-600
                              "
                            >
                              المنتج غير متوفر
                            </p>
                          ) : reachedLimit ? (
                            <p
                              className="
                                mt-2
                                text-xs
                                font-semibold
                                text-(--brick-600)
                              "
                            >
                              نفدت الكمية المتاحة
                            </p>
                          ) : null}

                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className="
                              mt-3
                              inline-flex
                              items-center
                              gap-1.5
                              text-sm
                              font-medium
                              text-(--brick-600)
                              transition
                              hover:text-(--brick-700)
                            "
                          >
                            <Trash2
                              size={14}
                              strokeWidth={1.8}
                            />

                            إزالة
                          </button>
                        </div>
                      </div>

                      {/* ==================================
                          QUANTITY
                      ================================== */}

                      <div
                        className="
                          flex
                          flex-col
                          items-center
                          gap-2
                        "
                      >
                        <div
                          className="
                            flex
                            w-full
                            items-center
                            justify-between
                            sm:justify-center
                          "
                        >
                          <span
                            className="
                              text-sm
                              text-(--olive-600)
                              sm:hidden
                            "
                          >
                            الكمية
                          </span>

                          <div
                            className="
                              inline-flex
                              items-center
                              overflow-hidden
                              rounded-xl
                              border
                              border-(--olive-200)
                              bg-(--olive-50)
                            "
                          >
                            {/* MINUS */}

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <=
                                1
                              }
                              className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                text-(--olive-700)
                                transition
                                hover:bg-(--olive-200)
                                hover:text-(--brick-600)
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                              aria-label="إنقاص الكمية"
                            >
                              <Minus
                                size={15}
                                strokeWidth={2}
                              />
                            </button>

                            {/* VALUE */}

                            <span
                              className="
                                flex
                                h-10
                                min-w-10
                                items-center
                                justify-center
                                border-x
                                border-(--olive-200)
                                bg-white
                                px-2
                                text-sm
                                font-semibold
                                text-(--olive-900)
                              "
                            >
                              {item.quantity}
                            </span>

                            {/* PLUS */}

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  item.quantity >=
                                  item.stock
                                ) {
                                  return;
                                }

                                updateQuantity(
                                  item.id,
                                  item.quantity + 1
                                );
                              }}
                              disabled={
                                stockUnavailable ||
                                reachedLimit
                              }
                              className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                text-(--olive-700)
                                transition
                                hover:bg-(--olive-200)
                                hover:text-(--brick-600)
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                              aria-label={
                                reachedLimit
                                  ? "نفدت الكمية"
                                  : "زيادة الكمية"
                              }
                              title={
                                reachedLimit
                                  ? "نفدت الكمية المتاحة"
                                  : undefined
                              }
                            >
                              <Plus
                                size={15}
                                strokeWidth={2}
                              />
                            </button>
                          </div>
                        </div>

                        {/* LIMIT MESSAGE */}

                        {reachedLimit &&
                        !stockUnavailable ? (
                          <span
                            className="
                              text-[11px]
                              font-semibold
                              text-(--brick-600)
                            "
                          >
                            نفدت الكمية
                          </span>
                        ) : null}
                      </div>

                      {/* ==================================
                          ITEM TOTAL
                      ================================== */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          sm:block
                          sm:text-left
                        "
                      >
                        <span
                          className="
                            text-sm
                            text-(--olive-600)
                            sm:hidden
                          "
                        >
                          إجمالي المنتج
                        </span>

                        <p
                          className="
                            font-bold
                            text-(--olive-900)
                          "
                          dir="ltr"
                        >
                          $
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ======================================
              SUMMARY
          ====================================== */}

          <aside
            className="
              h-fit
              rounded-[1.75rem]
              border
              border-(--olive-200)
              bg-white
              p-6
              shadow-[var(--shadow-soft)]
              lg:sticky
              lg:top-24
            "
          >
            {/* TITLE */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <h2
                className="
                  text-xl
                  font-bold
                  text-(--olive-900)
                "
              >
                ملخص الطلب
              </h2>

              <span
                className="
                  rounded-full
                  bg-(--brick-50)
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-(--brick-700)
                "
              >
                {items.length}{" "}
                {items.length === 1
                  ? "منتج"
                  : "منتجات"}
              </span>
            </div>

            {/* SUBTOTAL */}

            <div
              className="
                mt-7
                flex
                items-center
                justify-between
                text-sm
              "
            >
              <span className="text-(--olive-600)">
                المجموع الفرعي
              </span>

              <span
                className="
                  font-semibold
                  text-(--olive-900)
                "
                dir="ltr"
              >
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* SHIPPING */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-between
                text-sm
              "
            >
              <span className="text-(--olive-600)">
                الشحن
              </span>

              <span
                className={`
                  font-semibold
                  ${
                    shipping === 0
                      ? "text-(--brick-600)"
                      : "text-(--olive-900)"
                  }
                `}
                dir="ltr"
              >
                {shipping === 0
                  ? "مجاني"
                  : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            {/* FREE SHIPPING */}

            {shipping > 0 && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-(--brick-200)
                  bg-(--brick-50)
                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    leading-6
                    text-(--brick-800)
                  "
                >
                  أضف{" "}
                  <span
                    dir="ltr"
                    className="font-bold"
                  >
                    $
                    {remainingForFreeShipping.toFixed(
                      2
                    )}
                  </span>{" "}
                  للحصول على شحن مجاني.
                </p>

                {/* PROGRESS */}

                <div
                  className="
                    mt-3
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-(--brick-200)
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-(--brick-600)
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${Math.min(
                        100,
                        (subtotal / 50) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {shipping === 0 && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-(--olive-200)
                  bg-(--olive-50)
                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    font-medium
                    text-(--brick-700)
                  "
                >
                  ✓ حصلت على الشحن المجاني
                </p>
              </div>
            )}

            {/* DIVIDER */}

            <div
              className="
                my-6
                border-t
                border-(--olive-200)
              "
            />

            {/* TOTAL */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-lg
                  font-bold
                  text-(--olive-900)
                "
              >
                الإجمالي
              </span>

              <span
                className="
                  text-2xl
                  font-bold
                  text-(--brick-600)
                "
                dir="ltr"
              >
                ${total.toFixed(2)}
              </span>
            </div>

            {/* CHECKOUT */}

            <Link
              href="/checkout"
              className="
                mt-7
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-6
                py-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
                active:scale-[0.99]
              "
            >
              إتمام الطلب

              <ArrowLeft
                size={17}
                strokeWidth={2}
              />
            </Link>

            {/* SHOPPING */}

            <Link
              href="/shop"
              className="
                mt-3
                block
                w-full
                rounded-xl
                border
                border-(--olive-300)
                bg-white
                px-6
                py-4
                text-center
                text-sm
                font-semibold
                text-(--olive-900)
                transition
                hover:border-(--brick-200)
                hover:bg-(--olive-50)
                hover:text-(--brick-700)
              "
            >
              متابعة التسوق
            </Link>

            {/* SECURITY */}

            <div
              className="
                mt-6
                rounded-2xl
                bg-(--olive-50)
                p-4
                text-center
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-(--olive-900)
                "
              >
                🔒 تسوق آمن
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-(--olive-600)
                "
              >
                يتم التعامل مع معلوماتك
                بأمان وسرية.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}