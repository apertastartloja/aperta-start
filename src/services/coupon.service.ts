import { supabase } from "@/lib/supabase";
import type { Coupon } from "@/types";
import { NotFoundError, clone, delay } from "./base.service";

const initialCoupons: Coupon[] = [
  {
    id: "coup-1",
    code: "START10",
    type: "percentage",
    value: 10,
    minOrderValue: 50,
    active: true,
    usageCount: 142,
    usageLimit: 500,
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "coup-2",
    code: "GAMER20",
    type: "percentage",
    value: 20,
    minOrderValue: 100,
    active: true,
    usageCount: 89,
    usageLimit: 200,
    createdAt: "2026-07-15T14:30:00.000Z",
  },
  {
    id: "coup-3",
    code: "BEMVINDO15",
    type: "fixed",
    value: 15,
    minOrderValue: 70,
    active: true,
    usageCount: 310,
    createdAt: "2026-05-01T09:00:00.000Z",
  },
  {
    id: "coup-4",
    code: "BLACK50",
    type: "fixed",
    value: 50,
    minOrderValue: 250,
    active: false,
    usageCount: 50,
    usageLimit: 50,
    createdAt: "2026-04-10T12:00:00.000Z",
  },
];

let localCouponsStore: Coupon[] = clone(initialCoupons);

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message?: string;
  coupon?: Coupon;
}

export const CouponService = {
  async fetchFromSupabase(): Promise<Coupon[] | null> {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const fetched: Coupon[] = data.map((item) => ({
          id: item.id,
          code: item.code,
          type: item.type,
          value: Number(item.value),
          minOrderValue: item.min_order_value ? Number(item.min_order_value) : undefined,
          maxDiscount: item.max_discount ? Number(item.max_discount) : undefined,
          expiresAt: item.expires_at ?? undefined,
          usageLimit: item.usage_limit ?? undefined,
          usageCount: item.usage_count ?? 0,
          active: Boolean(item.active),
          createdAt: item.created_at ?? new Date().toISOString(),
        }));
        
        localCouponsStore = fetched;
        return localCouponsStore;
      }
    } catch (err) {
      console.warn("Aviso ao buscar cupons do Supabase, utilizando estado local:", err);
    }
    return localCouponsStore;
  },

  async listAll(): Promise<Coupon[]> {
    await this.fetchFromSupabase();
    return delay(clone(localCouponsStore));
  },

  async getById(id: string): Promise<Coupon> {
    await this.fetchFromSupabase();
    const coupon = localCouponsStore.find((c) => c.id === id);
    if (!coupon) throw new NotFoundError("Cupom", id);
    return delay(clone(coupon));
  },

  async getByCode(code: string): Promise<Coupon | null> {
    await this.fetchFromSupabase();
    const cleanCode = code.trim().toUpperCase();
    const coupon = localCouponsStore.find((c) => c.code.toUpperCase() === cleanCode);
    return coupon ? clone(coupon) : null;
  },

  async validate(code: string, subtotal: number): Promise<CouponValidationResult> {
    const coupon = await this.getByCode(code);
    if (!coupon) {
      return { valid: false, discount: 0, message: "Cupom inválido ou inexistente." };
    }

    if (!coupon.active) {
      return { valid: false, discount: 0, message: "Este cupom foi desativado." };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discount: 0, message: "Este cupom expirou." };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: "Este cupom atingiu o limite máximo de usos." };
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Este cupom requer um valor mínimo de compra de R$ ${coupon.minOrderValue.toFixed(2)}.`,
      };
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      discount,
      message: `Cupom ${coupon.code} aplicado com sucesso!`,
      coupon,
    };
  },

  async create(input: Omit<Coupon, "id" | "createdAt" | "usageCount">): Promise<Coupon> {
    const newId = `coup-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newCoupon: Coupon = {
      ...input,
      code: input.code.trim().toUpperCase(),
      id: newId,
      usageCount: 0,
      createdAt,
    };

    // Save to Supabase
    try {
      const payload = {
        id: newCoupon.id,
        code: newCoupon.code,
        type: newCoupon.type,
        value: newCoupon.value,
        min_order_value: newCoupon.minOrderValue ?? null,
        max_discount: newCoupon.maxDiscount ?? null,
        expires_at: newCoupon.expiresAt ?? null,
        usage_limit: newCoupon.usageLimit ?? null,
        usage_count: 0,
        active: newCoupon.active,
        created_at: newCoupon.createdAt,
      };

      const { error } = await supabase.from("coupons").insert(payload);
      if (error) console.warn("Erro ao inserir cupom no Supabase:", error.message);
    } catch (err) {
      console.warn("Exceção ao salvar cupom no Supabase:", err);
    }

    localCouponsStore = [newCoupon, ...localCouponsStore];
    return delay(clone(newCoupon));
  },

  async update(id: string, patch: Partial<Coupon>): Promise<Coupon> {
    const idx = localCouponsStore.findIndex((c) => c.id === id);
    if (idx < 0) throw new NotFoundError("Cupom", id);

    const updated: Coupon = {
      ...localCouponsStore[idx]!,
      ...patch,
      code: patch.code ? patch.code.trim().toUpperCase() : localCouponsStore[idx]!.code,
    };

    try {
      const payload: Record<string, any> = {};
      if (patch.code) payload["code"] = patch.code.trim().toUpperCase();
      if (patch.type) payload["type"] = patch.type;
      if (patch.value !== undefined) payload["value"] = patch.value;
      if (patch.minOrderValue !== undefined) payload["min_order_value"] = patch.minOrderValue;
      if (patch.maxDiscount !== undefined) payload["max_discount"] = patch.maxDiscount;
      if (patch.expiresAt !== undefined) payload["expires_at"] = patch.expiresAt;
      if (patch.usageLimit !== undefined) payload["usage_limit"] = patch.usageLimit;
      if (patch.active !== undefined) payload["active"] = patch.active;

      const { error } = await supabase.from("coupons").update(payload).eq("id", id);
      if (error) console.warn("Erro ao atualizar cupom no Supabase:", error.message);
    } catch (err) {
      console.warn("Exceção ao atualizar cupom no Supabase:", err);
    }

    localCouponsStore[idx] = updated;
    return delay(clone(updated));
  },

  async toggleActive(id: string): Promise<Coupon> {
    const coupon = localCouponsStore.find((c) => c.id === id);
    if (!coupon) throw new NotFoundError("Cupom", id);
    return this.update(id, { active: !coupon.active });
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) console.warn("Erro ao excluir cupom no Supabase:", error.message);
    } catch (err) {
      console.warn("Exceção ao excluir cupom no Supabase:", err);
    }

    localCouponsStore = localCouponsStore.filter((c) => c.id !== id);
    return delay(true);
  },

  async incrementUsage(code: string): Promise<void> {
    const coupon = await this.getByCode(code);
    if (coupon) {
      await this.update(coupon.id, { usageCount: coupon.usageCount + 1 });
    }
  },
};
