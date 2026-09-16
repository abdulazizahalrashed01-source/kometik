import { create } from "zustand";
import { persist } from "zustand/middleware";

// ==========================================
// TYPES
// ==========================================

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (product: CartProduct) => void;

  removeItem: (productId: string) => void;

  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  getTotalItems: () => number;

  getSubtotal: () => number;
};

// ==========================================
// STORE
// ==========================================

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // =====================================
      // ADD ITEM
      // =====================================

      addItem: (product) => {
        set((state) => {
          // ---------------------------------
          // INVALID STOCK
          // ---------------------------------

          if (
            !Number.isInteger(product.stock) ||
            product.stock <= 0
          ) {
            return state;
          }

          // ---------------------------------
          // FIND EXISTING ITEM
          // ---------------------------------

          const existingItem =
            state.items.find(
              (item) =>
                item.id === product.id
            );

          // =================================
          // EXISTING ITEM
          // =================================

          if (existingItem) {
            const currentQuantity =
              existingItem.quantity;

            // --------------------------------
            // HARD LIMIT
            // --------------------------------

            if (
              currentQuantity + 1 >
              product.stock
            ) {
              return state;
            }

            // --------------------------------
            // ADD EXACTLY ONE
            // --------------------------------

            return {
              items: state.items.map(
                (item) =>
                  item.id === product.id
                    ? {
                        ...item,
                        name: product.name,
                        price: product.price,
                        stock: product.stock,
                        imageUrl:
                          product.imageUrl,
                        imagePublicId:
                          product.imagePublicId,
                        quantity:
                          currentQuantity + 1,
                      }
                    : item
              ),
            };
          }

          // =================================
          // NEW ITEM
          // =================================

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: 1,
              },
            ],
          };
        });
      },

      // =====================================
      // REMOVE ITEM
      // =====================================

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.id !== productId
          ),
        }));
      },

      // =====================================
      // UPDATE QUANTITY
      // =====================================

      updateQuantity: (
        productId,
        quantity
      ) => {
        set((state) => {
          const item =
            state.items.find(
              (item) =>
                item.id === productId
            );

          if (!item) {
            return state;
          }

          // -------------------------------
          // REMOVE
          // -------------------------------

          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  item.id !== productId
              ),
            };
          }

          // -------------------------------
          // NEVER EXCEED STOCK
          // -------------------------------

          const safeQuantity =
            Math.min(
              Math.floor(quantity),
              item.stock
            );

          return {
            items: state.items.map(
              (item) =>
                item.id === productId
                  ? {
                      ...item,
                      quantity:
                        safeQuantity,
                    }
                  : item
            ),
          };
        });
      },

      // =====================================
      // CLEAR CART
      // =====================================

      clearCart: () => {
        set({
          items: [],
        });
      },

      // =====================================
      // TOTAL ITEMS
      // =====================================

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) =>
            total + item.quantity,
          0
        );
      },

      // =====================================
      // SUBTOTAL
      // =====================================

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) =>
            total +
            item.price *
              item.quantity,
          0
        );
      },
    }),

    {
      name: "kometik-cart",
    }
  )
);