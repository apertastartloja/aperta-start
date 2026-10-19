import type { Cart, Order, Wishlist } from "@/types";

export const mockCart: Cart = {
  id: "cart-1",
  items: [
    { id: "ci-1", productId: "prd-4", quantity: 1, unitPrice: 189.9 },
    { id: "ci-2", productId: "prd-12", quantity: 2, unitPrice: 74.9 },
  ],
  couponCode: null,
  updatedAt: "2026-07-30T09:00:00.000Z",
};

export const mockWishlist: Wishlist = {
  id: "wl-1",
  userId: "usr-1",
  items: [
    { id: "wi-1", productId: "prd-1", addedAt: "2026-07-01T09:00:00.000Z" },
    { id: "wi-2", productId: "prd-6", addedAt: "2026-07-12T09:00:00.000Z" },
  ],
};

export const mockOrders: Order[] = [];

