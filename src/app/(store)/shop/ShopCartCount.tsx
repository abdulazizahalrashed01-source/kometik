"use client";

import { useCart } from "@/store/useCart";

export default function ShopCartCount() {

  const items = useCart(
    (state) => state.items
  );

  const count = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  if (count === 0) {
    return null;
  }

  return (
    <span
      className="
        flex
        h-5
        min-w-5
        items-center
        justify-center
        rounded-full
        bg-black
        px-1.5
        text-xs
        font-semibold
        text-white
      "
    >
      {count}
    </span>
  );
}