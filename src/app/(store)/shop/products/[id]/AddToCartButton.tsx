"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Check,
  Minus,
  Plus,
} from "lucide-react";

import { useCart } from "@/store/useCart";

// ==========================================
// PROPS
// ==========================================

type AddToCartButtonProps = {
  id: string;
  name: string;
  price: number;
  stock: number;

  imageUrl: string | null;
  imagePublicId: string | null;

  /**
   * Product Card
   */
  compact?: boolean;

  /**
   * Product Details
   * يظهر العداد فقط عندما يكون true
   */
  showQuantitySelector?: boolean;
};

// ==========================================
// COMPONENT
// ==========================================

export default function AddToCartButton({
  id,
  name,
  price,
  stock,
  imageUrl,
  imagePublicId,
  compact = false,
  showQuantitySelector = false,
}: AddToCartButtonProps) {
  // ==========================================
  // CART
  // ==========================================

  const items = useCart(
    (state) => state.items
  );

  const addItem = useCart(
    (state) => state.addItem
  );

  // ==========================================
  // STATE
  // ==========================================

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  // ==========================================
  // CURRENT CART ITEM
  // ==========================================

  const cartItem = items.find(
    (item) => item.id === id
  );

  const cartQuantity =
    cartItem?.quantity ?? 0;

  // ==========================================
  // STOCK
  // ==========================================

  const outOfStock =
    stock <= 0;

  /**
   * الكمية المتبقية التي يمكن إضافتها
   */
  const remainingStock =
    Math.max(
      stock - cartQuantity,
      0
    );
  /**
   * لا يمكن إضافة المزيد
   */
  const quantityLimitReached =
    remainingStock <= 0;

  // ==========================================
  // KEEP QUANTITY VALID
  // ==========================================

  useEffect(() => {
    if (
      remainingStock <= 0
    ) {
      setQuantity(1);
      return;
    }
    
    setQuantity((current) =>
      Math.min(
        Math.max(current, 1),
        remainingStock
      )
    );
  }, [remainingStock]);

  // ==========================================
  // QUANTITY DOWN
  // ==========================================

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(
        current - 1,
        1
      )
    );
  }

  // ==========================================
  // QUANTITY UP
  // ==========================================

  function increaseQuantity() {
    setQuantity((current) => {
      if (
        current >=
        remainingStock
      ) {
        return current;
      }

      return current + 1;
    });
  }

  // ==========================================
  // ADD SINGLE ITEM
  // Used by Product Cards
  // ==========================================

  function handleAddSingle() {
    // ----------------------------------------
    // Product unavailable
    // ----------------------------------------

    if (outOfStock) {
      return;
    }

    // ----------------------------------------
    // Stock limit already reached
    // ----------------------------------------

    if (
      quantityLimitReached
    ) {
      return;
    }

    // ----------------------------------------
    // Add exactly ONE
    // ----------------------------------------

    addItem({
      id,
      name,
      price,
      imageUrl,
      imagePublicId,
      stock,
    });

    // ----------------------------------------
    // Success feedback
    // ----------------------------------------

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  // ==========================================
  // ADD SELECTED QUANTITY
  // Used only by Product Details
  // ==========================================

  function handleAddSelected() {
    // ----------------------------------------
    // Prevent invalid operation
    // ----------------------------------------

    if (
      outOfStock ||
      quantityLimitReached ||
      quantity <= 0
    ) {
      return;
    }

    // ----------------------------------------
    // Safety check
    // ----------------------------------------

    const safeQuantity =
      Math.min(
        quantity,
        remainingStock
      );

    // ----------------------------------------
    // Add selected quantity
    // ----------------------------------------

    for (
      let index = 0;
      index < safeQuantity;
      index++
    ) {
      addItem({
        id,
        name,
        price,
        imageUrl,
        imagePublicId,
        stock,
      });
    }

    // ----------------------------------------
    // Success feedback
    // ----------------------------------------

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  // ==========================================
  // COMPACT
  // Product Cards / Products Page
  // ==========================================

  if (compact) {
    const disabled =
      outOfStock ||
      quantityLimitReached;

    return (
      <button
        type="button"
        onClick={
          handleAddSingle
        }
        disabled={disabled}
        className={`
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-xl
          px-3.5
          py-2.5
          text-xs
          font-semibold
          transition-all
          duration-200
          active:scale-[0.98]
          sm:px-4
          sm:py-2.5
          sm:text-sm
          ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : added
                ? "bg-(--brick-100) text-(--brick-700)"
                : "bg-(--brick-600) text-white hover:bg-(--brick-700)"
          }
        `}
        aria-label={
          outOfStock
            ? "المنتج غير متوفر"
            : quantityLimitReached
              ? "نفدت الكمية"
              : added
                ? "تمت إضافة المنتج إلى السلة"
                : "إضافة المنتج إلى السلة"
        }
      >
        {outOfStock ? (
          <span>
            نفد المخزون
          </span>
        ) : quantityLimitReached ? (
          <span>
            نفدت الكمية
          </span>
        ) : added ? (
          <>
            <Check
              size={15}
              strokeWidth={2.2}
            />

            <span>
              تمت الإضافة
            </span>
          </>
        ) : (
          <>
            <ShoppingCart
              size={15}
              strokeWidth={1.9}
            />

            <span>
              أضف للسلة
            </span>
          </>
        )}
      </button>
    );
  }

  // ==========================================
  // PRODUCT DETAILS + QUANTITY SELECTOR
  // ==========================================

  if (showQuantitySelector) {
    const disabled =
      outOfStock ||
      quantityLimitReached;

    return (
      <div
        className="
          w-full
          sm:w-auto
          sm:min-w-64
        "
      >
        <div
          className="
            flex
            w-full
            items-center
            gap-3
          "
        >
          {/* =================================
              QUANTITY SELECTOR
          ================================= */}

          <div
            className="
              flex
              h-14
              shrink-0
              items-center
              overflow-hidden
              rounded-xl
              border
              border-(--olive-200)
              bg-white
              shadow-sm
            "
          >
            {/* MINUS */}

            <button
              type="button"
              onClick={
                decreaseQuantity
              }
              disabled={
                disabled ||
                quantity <= 1
              }
              className="
                flex
                h-full
                w-12
                items-center
                justify-center
                text-(--olive-700)
                transition
                hover:bg-(--olive-50)
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="إنقاص الكمية"
            >
              <Minus
                size={18}
                strokeWidth={2}
              />
            </button>

            {/* NUMBER */}

            <span
              dir="ltr"
              className="
                flex
                min-w-10
                items-center
                justify-center
                px-2
                text-base
                font-bold
                text-(--olive-900)
              "
            >
              {quantity}
            </span>

            {/* PLUS */}

            <button
              type="button"
              onClick={
                increaseQuantity
              }
              disabled={
                disabled ||
                quantity >=
                  remainingStock
              }
              className="
                flex
                h-full
                w-12
                items-center
                justify-center
                text-(--olive-700)
                transition
                hover:bg-(--olive-50)
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="زيادة الكمية"
            >
              <Plus
                size={18}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* =================================
              ADD BUTTON
          ================================= */}

          <button
            type="button"
            onClick={
              handleAddSelected
            }
            disabled={disabled}
            className={`
              inline-flex
              h-14
              min-w-0
              flex-1
              items-center
              justify-center
              gap-2.5
              rounded-xl
              px-5
              text-base
              font-semibold
              transition-all
              duration-200
              active:scale-[0.99]
              ${
                disabled
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : added
                    ? "bg-(--brick-100) text-(--brick-700)"
                    : "bg-(--brick-600) text-white hover:bg-(--brick-700)"
              }
            `}
          >
            {outOfStock ? (
              <span>
                نفد المخزون
              </span>
            ) : quantityLimitReached ? (
              <span>
                نفدت الكمية
              </span>
            ) : added ? (
              <>
                <Check
                  size={19}
                  strokeWidth={2.2}
                />

                <span>
                  تمت الإضافة
                </span>
              </>
            ) : (
              <>
                <ShoppingCart
                  size={19}
                  strokeWidth={1.9}
                />

                <span>
                  أضف إلى السلة
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // NORMAL BUTTON
  // ==========================================

  const disabled =
    outOfStock ||
    quantityLimitReached;

  return (
    <button
      type="button"
      onClick={
        handleAddSingle
      }
      disabled={disabled}
      className={`
        inline-flex
        w-full
        items-center
        justify-center
        gap-2.5
        rounded-xl
        px-6
        py-4
        text-base
        font-semibold
        transition-all
        duration-200
        active:scale-[0.99]
        sm:w-auto
        sm:min-w-64
        ${
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : added
              ? "bg-(--brick-100) text-(--brick-700)"
              : "bg-(--brick-600) text-white hover:bg-(--brick-700)"
        }
      `}
    >
      {outOfStock ? (
        <span>
          نفد المخزون
        </span>
      ) : quantityLimitReached ? (
        <span>
          نفدت الكمية
        </span>
      ) : added ? (
        <>
          <Check
            size={19}
            strokeWidth={2.2}
          />

          <span>
            تمت إضافة المنتج إلى السلة
          </span>
        </>
      ) : (
        <>
          <ShoppingCart
            size={19}
            strokeWidth={1.9}
          />

          <span>
            أضف إلى السلة
          </span>
        </>
      )}
    </button>
  );
}