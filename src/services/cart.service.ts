import { SHIPPING } from "@/constants";
import { mockCart } from "@/mocks";
import type { Cart, CartItem, CartTotals } from "@/types";
import { clone, delay } from "./base.service";

const uid = () => `ci-${Math.random().toString(36).slice(2, 10)}`;

let cart: Cart = clone(mockCart);

export const CartService = {
  async get(): Promise<Cart> {
    return delay(clone(cart));
  },

  async addItem(item: Omit<CartItem, "id">): Promise<Cart> {
    const existing = cart.items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.items.push({ ...item, id: uid() });
    }
    cart.updatedAt = new Date().toISOString();
    return delay(clone(cart));
  },

  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    cart.items = cart.items
      .map((i) => (i.id === itemId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    cart.updatedAt = new Date().toISOString();
    return delay(clone(cart));
  },

  async removeItem(itemId: string): Promise<Cart> {
    cart.items = cart.items.filter((i) => i.id !== itemId);
    cart.updatedAt = new Date().toISOString();
    return delay(clone(cart));
  },

  async clear(): Promise<Cart> {
    cart = { ...cart, items: [], couponCode: null, updatedAt: new Date().toISOString() };
    return delay(clone(cart));
  },

  async applyCoupon(code: string | null): Promise<Cart> {
    cart.couponCode = code;
    return delay(clone(cart));
  },

  /** Regras de total centralizadas — nunca calcular preço na UI. */
  totals(current: Cart): CartTotals {
    const subtotal = current.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const discount = current.couponCode ? subtotal * 0.1 : 0;
    const shipping =
      subtotal === 0 || subtotal - discount >= SHIPPING.freeAbove ? 0 : SHIPPING.flatRate;
    const itemsCount = current.items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, discount, shipping, total: subtotal - discount + shipping, itemsCount };
  },
};
