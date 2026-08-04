import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { OrderService } from "@/services";
import { useAuth } from "./useAuth";

export function useOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.orders(user?.id ?? "anonymous"),
    queryFn: () => OrderService.listByUser(user!.id),
    enabled: Boolean(user?.id),
  });
}

export function useOrder(code: string) {
  return useQuery({
    queryKey: ["orders", "detail", code],
    queryFn: () => OrderService.getByCode(code),
    enabled: Boolean(code),
  });
}
