import { SHIPPING } from "@/constants";
import type { Cart, CartItem, CartTotals, Coupon } from "@/types";
import { clone, delay } from "./base.service";

const uid = () => `ci-${Math.random().toString(36).slice(2, 10)}`;
const CART_STORAGE_KEY = "apertastart_cart";

function loadCart(): Cart {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return { id: "cart-user", items: [], couponCode: null, updatedAt: new Date().toISOString() };
}

function saveCart(data: Cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // fallback
  }
}

let cart: Cart = loadCart();

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
    saveCart(cart);
    return delay(clone(cart));
  },

  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    cart.items = cart.items
      .map((i) => (i.id === itemId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    cart.updatedAt = new Date().toISOString();
    saveCart(cart);
    return delay(clone(cart));
  },

  async removeItem(itemId: string): Promise<Cart> {
    cart.items = cart.items.filter((i) => i.id !== itemId);
    cart.updatedAt = new Date().toISOString();
    saveCart(cart);
    return delay(clone(cart));
  },

  async clear(): Promise<Cart> {
    cart = { ...cart, items: [], couponCode: null, updatedAt: new Date().toISOString() };
    saveCart(cart);
    return delay(clone(cart));
  },

  async applyCoupon(code: string | null): Promise<Cart> {
    cart.couponCode = code ? code.trim().toUpperCase() : null;
    cart.updatedAt = new Date().toISOString();
    saveCart(cart);
    return delay(clone(cart));
  },

  /** Regras de total centralizadas com suporte a cupom real (porcentagem ou valor fixo) */
  totals(current: Cart, couponDetails?: Coupon | null): CartTotals {
    const subtotal = current.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    let discount = 0;
    if (current.couponCode && couponDetails && couponDetails.active) {
      if (couponDetails.type === "percentage") {
        discount = (subtotal * couponDetails.value) / 100;
        if (couponDetails.maxDiscount && discount > couponDetails.maxDiscount) {
          discount = couponDetails.maxDiscount;
        }
      } else if (couponDetails.type === "fixed") {
        discount = couponDetails.value;
      }
      discount = Math.min(discount, subtotal);
    } else if (current.couponCode && !couponDetails) {
      // Valor padrão enquanto o cupom é carregado
      discount = subtotal * 0.1;
    }

    const shipping =
      subtotal === 0 || subtotal - discount >= SHIPPING.freeAbove ? 0 : SHIPPING.flatRate;
    const itemsCount = current.items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, discount, shipping, total: Math.max(0, subtotal - discount + shipping), itemsCount };
  },
};
