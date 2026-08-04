import { mockOrders } from "@/mocks";
import type { Order, OrderStatus } from "@/types";
import { NotFoundError, clone, delay } from "./base.service";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento aprovado",
  processing: "Em separação",
  shipped: "Enviado",
  delivered: "Entregue",
  canceled: "Cancelado",
};

export const OrderService = {
  async listByUser(userId: string): Promise<Order[]> {
    const items = clone(mockOrders)
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return delay(items);
  },

  async getByCode(code: string): Promise<Order> {
    const order = mockOrders.find((o) => o.code === code);
    if (!order) throw new NotFoundError("Pedido", code);
    return delay(clone(order));
  },
};
