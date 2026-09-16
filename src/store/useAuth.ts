"use client";

import { create } from "zustand";

type AuthState = {
  isLoggedIn: boolean;
  authChecking: boolean;
  pendingWishlistProductId: string | null;

  setAuth: (isLoggedIn: boolean) => void;
  setAuthChecking: (value: boolean) => void;
  setPendingWishlistProductId: (productId: string | null) => void;
  clearPendingWishlistProductId: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  isLoggedIn: false,
  authChecking: true,
  pendingWishlistProductId: null,

  setAuth: (isLoggedIn) => {
    set({
      isLoggedIn,
      authChecking: false,
    });
  },

  setAuthChecking: (value) => {
    set({
      authChecking: value,
    });
  },

  setPendingWishlistProductId: (productId) => {
    set({
      pendingWishlistProductId: productId,
    });
  },

  clearPendingWishlistProductId: () => {
    set({
      pendingWishlistProductId: null,
    });
  },
}));
