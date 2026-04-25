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

const GUEST_CART_KEY = "guest";
const EMPTY_CART_LINES: CartLine[] = [];

type CustomerCartStore = {
  cartsByOwner: Record<string, CartLine[]>;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addProduct: (ownerKey: string, product: ProductSummary) => void;
  decrementProduct: (ownerKey: string, productId: string) => void;
  removeProduct: (ownerKey: string, productId: string) => void;
  updateQuantity: (ownerKey: string, productId: string, quantity: number) => void;
  clear: (ownerKey: string) => void;
};

function getOwnerCart(
  cartsByOwner: Record<string, CartLine[]>,
  ownerKey: string,
) {
  return cartsByOwner[ownerKey] ?? EMPTY_CART_LINES;
}

export function getCartOwnerKey(ownerId?: string | null) {
  return ownerId ?? GUEST_CART_KEY;
}

export function selectCartByOwner(ownerKey: string) {
  return (state: CustomerCartStore) =>
    state.cartsByOwner[ownerKey] ?? EMPTY_CART_LINES;
}

export const useCustomerCartStore = create<CustomerCartStore>()(
  persist(
    (set) => ({
      cartsByOwner: {},
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addProduct: (ownerKey, product) =>
        set((state) => ({
          cartsByOwner: {
            ...state.cartsByOwner,
            [ownerKey]: addProductToCart(getOwnerCart(state.cartsByOwner, ownerKey), product),
          },
        })),
      decrementProduct: (ownerKey, productId) =>
        set((state) => ({
          cartsByOwner: {
            ...state.cartsByOwner,
            [ownerKey]: decrementCartItem(
              getOwnerCart(state.cartsByOwner, ownerKey),
              productId,
            ),
          },
        })),
      removeProduct: (ownerKey, productId) =>
        set((state) => ({
          cartsByOwner: {
            ...state.cartsByOwner,
            [ownerKey]: removeCartItem(getOwnerCart(state.cartsByOwner, ownerKey), productId),
          },
        })),
      updateQuantity: (ownerKey, productId, quantity) =>
        set((state) => ({
          cartsByOwner: {
            ...state.cartsByOwner,
            [ownerKey]: updateCartItemQuantity(
              getOwnerCart(state.cartsByOwner, ownerKey),
              productId,
              quantity,
            ),
          },
        })),
      clear: (ownerKey) =>
        set((state) => ({
          cartsByOwner: {
            ...state.cartsByOwner,
            [ownerKey]: [],
          },
        })),
    }),
    {
      name: "coffee-preorder-cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
