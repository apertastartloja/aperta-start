import type { Cart, Order, Wishlist } from "@/types";
import { mockAddresses } from "./users.mock";

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

export const mockOrders: Order[] = [
  {
    id: "ord-1",
    code: "AS-2026-0001",
    userId: "usr-1",
    status: "delivered",
    items: [
      {
        id: "oi-1",
        productId: "prd-2",
        quantity: 1,
        unitPrice: 429.9,
        productName: "Furadeira de Impacto 850W",
        productImage: "/images/products/prd-2-1.jpg",
      },
    ],
    subtotal: 429.9,
    shipping: 0,
    discount: 0,
    total: 429.9,
    createdAt: "2026-05-02T14:20:00.000Z",
    shippingAddress: mockAddresses[0]!,
  },
  {
    id: "ord-2",
    code: "AS-2026-0002",
    userId: "usr-1",
    status: "shipped",
    items: [
      {
        id: "oi-2",
        productId: "prd-7",
        quantity: 1,
        unitPrice: 519.9,
        productName: "Trena a Laser 60m Bluetooth",
        productImage: "/images/products/prd-7-1.jpg",
      },
      {
        id: "oi-3",
        productId: "prd-11",
        quantity: 3,
        unitPrice: 39.9,
        productName: "Óculos de Proteção Antiembaçante",
        productImage: "/images/products/prd-11-1.jpg",
      },
    ],
    subtotal: 639.6,
    shipping: 0,
    discount: 50,
    total: 589.6,
    createdAt: "2026-07-21T10:05:00.000Z",
    shippingAddress: mockAddresses[1]!,
  },
];
