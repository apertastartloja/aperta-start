import { PAGINATION } from "@/constants";
import { supabase } from "@/lib/supabase";
import { mockOrders } from "@/mocks";
import type { Order, OrderStatus, Paginated } from "@/types";
import { NotFoundError, clone, delay, paginate } from "./base.service";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento aprovado",
  processing: "Em separação",
  shipped: "Enviado",
  delivered: "Entregue",
  canceled: "Cancelado",
};

let localOrdersStore: Order[] = clone(mockOrders);

export const OrderService = {
  async fetchFromSupabase(): Promise<Order[] | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const fetched: Order[] = data.map((item) => ({
          id: item.id,
          code: item.code,
          userId: item.user_id ?? "guest",
          items: item.items ?? [],
          status: (item.status as OrderStatus) ?? "pending",
          subtotal: Number(item.subtotal),
          shipping: Number(item.shipping ?? 0),
          discount: Number(item.discount ?? 0),
          total: Number(item.total),
          shippingAddress: item.shipping_address ?? {},
          createdAt: item.created_at ?? new Date().toISOString(),
          trackingCode: item.tracking_code ?? undefined,
          carrier: item.carrier ?? undefined,
          paymentMethod: item.payment_method ?? undefined,
          customerName: item.customer_name ?? undefined,
          customerEmail: item.customer_email ?? undefined,
          customerPhone: item.customer_phone ?? undefined,
        }));
        
        const existingIds = new Set(fetched.map((o) => o.id));
        const missingLocal = localOrdersStore.filter((o) => !existingIds.has(o.id));
        localOrdersStore = [...fetched, ...missingLocal];
        return localOrdersStore;
      }
    } catch (err) {
      console.warn("Aviso ao buscar pedidos do Supabase, utilizando estado local:", err);
    }
    return localOrdersStore;
  },

  async listAll(
    query: {
      status?: OrderStatus | "all";
      search?: string;
      page?: number;
      perPage?: number;
    } = {}
  ): Promise<Paginated<Order>> {
    await this.fetchFromSupabase();
    let items = clone(localOrdersStore);

    if (query.status && query.status !== "all") {
      items = items.filter((o) => o.status === query.status);
    }

    if (query.search?.trim()) {
      const term = query.search.toLowerCase().trim();
      items = items.filter(
        (o) =>
          o.code.toLowerCase().includes(term) ||
          (o.customerName && o.customerName.toLowerCase().includes(term)) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(term)) ||
          (o.trackingCode && o.trackingCode.toLowerCase().includes(term))
      );
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return delay(paginate(items, query.page ?? 1, query.perPage ?? PAGINATION.perPage));
  },

  async listByUser(userId: string): Promise<Order[]> {
    await this.fetchFromSupabase();
    const items = clone(localOrdersStore)
      .filter((o) => o.userId === userId || o.customerEmail?.toLowerCase() === userId.toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return delay(items);
  },

  async getById(id: string): Promise<Order> {
    await this.fetchFromSupabase();
    const order = localOrdersStore.find((o) => o.id === id);
    if (!order) throw new NotFoundError("Pedido", id);
    return delay(clone(order));
  },

  async getByCode(code: string): Promise<Order> {
    await this.fetchFromSupabase();
    const order = localOrdersStore.find((o) => o.code === code || `#${o.code}` === code);
    if (!order) throw new NotFoundError("Pedido", code);
    return delay(clone(order));
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const existingIndex = localOrdersStore.findIndex((o) => o.id === id);
    if (existingIndex < 0) throw new NotFoundError("Pedido", id);

    const updated: Order = {
      ...localOrdersStore[existingIndex]!,
      status,
    };

    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) {
        console.warn("Erro ao atualizar status do pedido no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Exceção ao atualizar status no Supabase:", err);
    }

    localOrdersStore[existingIndex] = updated;
    return delay(clone(updated));
  },

  async updateTrackingInfo(id: string, trackingCode: string, carrier: string): Promise<Order> {
    const existingIndex = localOrdersStore.findIndex((o) => o.id === id);
    if (existingIndex < 0) throw new NotFoundError("Pedido", id);

    const updated: Order = {
      ...localOrdersStore[existingIndex]!,
      trackingCode,
      carrier,
      status: "shipped",
    };

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          tracking_code: trackingCode,
          carrier,
          status: "shipped",
        })
        .eq("id", id);
      if (error) {
        console.warn("Erro ao salvar código de rastreio no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Exceção ao atualizar rastreio no Supabase:", err);
    }

    localOrdersStore[existingIndex] = updated;
    return delay(clone(updated));
  },

  async create(input: Omit<Order, "id" | "createdAt"> & { id?: string }): Promise<Order> {
    const newId = input.id || `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const createdAt = new Date().toISOString();

    const newOrder: Order = {
      ...input,
      id: newId,
      createdAt,
    };

    try {
      const payload = {
        id: newOrder.id,
        code: newOrder.code,
        user_id: newOrder.userId !== "guest" ? newOrder.userId : null,
        items: newOrder.items,
        status: newOrder.status,
        subtotal: newOrder.subtotal,
        shipping: newOrder.shipping,
        discount: newOrder.discount,
        total: newOrder.total,
        shipping_address: newOrder.shippingAddress,
        tracking_code: newOrder.trackingCode ?? null,
        carrier: newOrder.carrier ?? null,
        payment_method: newOrder.paymentMethod ?? null,
        customer_name: newOrder.customerName ?? null,
        customer_email: newOrder.customerEmail ?? null,
        customer_phone: newOrder.customerPhone ?? null,
        created_at: newOrder.createdAt,
      };

      const { error } = await supabase.from("orders").insert(payload);
      if (error) {
        console.warn("Aviso ao inserir pedido no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Exceção ao salvar pedido no Supabase:", err);
    }

    localOrdersStore = [newOrder, ...localOrdersStore];
    return delay(clone(newOrder));
  },
};
