"use client";

import { create } from "zustand";

export type WishlistProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  stock: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
};

type WishlistState = {
  items: WishlistItem[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  loadWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  loadWishlist: async () => {
    const { isInitialized, isLoading } = get();

    if (isInitialized || isLoading) {
      return;
    }

    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await fetch("/api/wishlist", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        set({
          items: [],
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        return;
      }

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);

        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "تعذر جلب المفضلة";

        throw new Error(message);
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("استجابة غير صالحة من الخادم");
      }

      set({
        items: data as WishlistItem[],
        isInitialized: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("loadWishlist error:", error);

      set({
        isLoading: false,
        isInitialized: true,
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء جلب المفضلة",
      });
    }
  },

  addToWishlist: async (productId: string) => {
    const trimmedProductId = productId.trim();

    if (!trimmedProductId) {
      return false;
    }

    const existingItem = get().items.some(
      (item) => item.productId === trimmedProductId,
    );

    if (existingItem) {
      return true;
    }

    set({
      error: null,
    });

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: trimmedProductId,
        }),
      });

      if (response.status === 401) {
        set({
          error: "يجب تسجيل الدخول أولاً",
        });

        return false;
      }

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "تعذر إضافة المنتج للمفضلة";

        throw new Error(message);
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("id" in data) ||
        !("productId" in data) ||
        !("product" in data)
      ) {
        throw new Error("استجابة غير صالحة من الخادم");
      }

      set((state) => ({
        items: [data as WishlistItem, ...state.items],
        error: null,
      }));

      return true;
    } catch (error) {
      console.error("addToWishlist error:", error);

      set({
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إضافة المنتج للمفضلة",
      });

      return false;
    }
  },

  removeFromWishlist: async (productId: string) => {
    const trimmedProductId = productId.trim();

    if (!trimmedProductId) {
      return false;
    }

    const previousItems = get().items;

    set({
      items: previousItems.filter(
        (item) => item.productId !== trimmedProductId,
      ),
      error: null,
    });

    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: trimmedProductId,
        }),
      });

      if (response.status === 401) {
        set({
          items: previousItems,
          error: "يجب تسجيل الدخول أولاً",
        });

        return false;
      }

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "تعذر إزالة المنتج من المفضلة";

        throw new Error(message);
      }

      return true;
    } catch (error) {
      console.error("removeFromWishlist error:", error);

      set({
        items: previousItems,
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إزالة المنتج من المفضلة",
      });

      return false;
    }
  },

  toggleWishlist: async (productId: string) => {
    const isCurrentlyWishlisted = get().items.some(
      (item) => item.productId === productId,
    );

    if (isCurrentlyWishlisted) {
      return get().removeFromWishlist(productId);
    }

    return get().addToWishlist(productId);
  },

  isWishlisted: (productId: string) => {
    return get().items.some((item) => item.productId === productId);
  },

  clearWishlist: () => {
    set({
      items: [],
      isInitialized: false,
      isLoading: false,
      error: null,
    });
  },
}));
