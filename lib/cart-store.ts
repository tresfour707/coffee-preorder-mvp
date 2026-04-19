"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  addProductToCart,
  decrementCartItem,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart";
import type { CartLine, ProductSummary } from "@/lib/types";

type CustomerCartStore = {
  items: CartLine[];
  addProduct: (product: ProductSummary) => void;
  decrementProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCustomerCartStore = create<CustomerCartStore>()(
  persist(
    (set) => ({
      items: [],
      addProduct: (product) =>
        set((state) => ({
          items: addProductToCart(state.items, product),
        })),
      decrementProduct: (productId) =>
        set((state) => ({
          items: decrementCartItem(state.items, productId),
        })),
      removeProduct: (productId) =>
        set((state) => ({
          items: removeCartItem(state.items, productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: updateCartItemQuantity(state.items, productId, quantity),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "coffee-preorder-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
