import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { WishlistService } from "@/services";
import type { Wishlist } from "@/types";

interface WishlistContextValue {
  wishlist: Wishlist;
  isLoading: boolean;
  count: number;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  clear: () => void;
}

const EMPTY: Wishlist = { id: "wl-empty", userId: null, items: [] };

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => WishlistService.get(),
  });

  const wishlist = data ?? EMPTY;
  const sync = (next: Wishlist) => queryClient.setQueryData(queryKeys.wishlist, next);

  const toggle = useMutation({
    mutationFn: (productId: string) => WishlistService.toggle(productId),
    onSuccess: (next, productId) => {
      sync(next);
      const added = next.items.some((i) => i.productId === productId);
      toast(added ? "Adicionado aos favoritos" : "Removido dos favoritos");
    },
  });

  const clear = useMutation({ mutationFn: () => WishlistService.clear(), onSuccess: sync });

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlist,
      isLoading,
      count: wishlist.items.length,
      has: (productId) => wishlist.items.some((i) => i.productId === productId),
      toggle: (productId) => toggle.mutate(productId),
      clear: () => clear.mutate(),
    }),
    [wishlist, isLoading, toggle, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist deve ser usado dentro de <WishlistProvider>");
  return context;
}
