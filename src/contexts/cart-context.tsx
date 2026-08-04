import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { CartService } from "@/services";
import type { Cart, CartItem, CartTotals } from "@/types";

interface CartContextValue {
  cart: Cart;
  totals: CartTotals;
  isLoading: boolean;
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  applyCoupon: (code: string | null) => void;
}

const EMPTY_CART: Cart = { id: "cart-empty", items: [], couponCode: null, updatedAt: "" };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isMiniCartOpen, setMiniCartOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => CartService.get(),
  });

  const cart = data ?? EMPTY_CART;
  const sync = (next: Cart) => queryClient.setQueryData(queryKeys.cart, next);

  const addItem = useMutation({
    mutationFn: (item: Omit<CartItem, "id">) => CartService.addItem(item),
    onSuccess: (next) => {
      sync(next);
      setMiniCartOpen(true);
      toast.success("Produto adicionado ao carrinho");
    },
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      CartService.updateQuantity(itemId, quantity),
    onSuccess: sync,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => CartService.removeItem(itemId),
    onSuccess: (next) => {
      sync(next);
      toast("Produto removido do carrinho");
    },
  });

  const clear = useMutation({ mutationFn: () => CartService.clear(), onSuccess: sync });

  const applyCoupon = useMutation({
    mutationFn: (code: string | null) => CartService.applyCoupon(code),
    onSuccess: sync,
  });

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totals: CartService.totals(cart),
      isLoading,
      isMiniCartOpen,
      openMiniCart: () => setMiniCartOpen(true),
      closeMiniCart: () => setMiniCartOpen(false),
      addItem: (item) => addItem.mutate(item),
      updateQuantity: (itemId, quantity) => updateQuantity.mutate({ itemId, quantity }),
      removeItem: (itemId) => removeItem.mutate(itemId),
      clear: () => clear.mutate(),
      applyCoupon: (code) => applyCoupon.mutate(code),
    }),
    [cart, isLoading, isMiniCartOpen, addItem, updateQuantity, removeItem, clear, applyCoupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return context;
}
