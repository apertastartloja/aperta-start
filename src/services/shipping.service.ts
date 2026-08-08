import { supabase } from "@/lib/supabase";
import { NotFoundError, clone, delay } from "./base.service";

export interface ShippingRule {
  id: string;
  region: string;
  states: string[];
  fixedPrice: number;
  freeShippingMinAmount?: number | null;
  minDays: number;
  maxDays: number;
  active: boolean;
}

export interface CarrierConfig {
  id: string;
  name: string;
  code: string;
  active: boolean;
  description: string;
}

const initialShippingRules: ShippingRule[] = [
  {
    id: "rule-1",
    region: "Sudeste",
    states: ["SP", "RJ", "MG", "ES"],
    fixedPrice: 14.9,
    freeShippingMinAmount: 199.0,
    minDays: 1,
    maxDays: 3,
    active: true,
  },
  {
    id: "rule-2",
    region: "Sul",
    states: ["PR", "SC", "RS"],
    fixedPrice: 18.9,
    freeShippingMinAmount: 249.0,
    minDays: 2,
    maxDays: 4,
    active: true,
  },
  {
    id: "rule-3",
    region: "Centro-Oeste",
    states: ["DF", "GO", "MT", "MS"],
    fixedPrice: 22.9,
    freeShippingMinAmount: 299.0,
    minDays: 3,
    maxDays: 5,
    active: true,
  },
  {
    id: "rule-4",
    region: "Nordeste",
    states: ["BA", "PE", "CE", "MA", "PB", "RN", "AL", "SE", "PI"],
    fixedPrice: 29.9,
    freeShippingMinAmount: 349.0,
    minDays: 4,
    maxDays: 7,
    active: true,
  },
  {
    id: "rule-5",
    region: "Norte",
    states: ["AM", "PA", "AP", "TO", "RO", "RR", "AC"],
    fixedPrice: 34.9,
    freeShippingMinAmount: 399.0,
    minDays: 5,
    maxDays: 9,
    active: true,
  },
];

const initialCarriers: CarrierConfig[] = [
  {
    id: "carr-1",
    name: "Correios (SEDEX / PAC)",
    code: "CORREIOS",
    active: true,
    description: "Cobertura nacional em todos os CEPs do Brasil.",
  },
  {
    id: "carr-2",
    name: "Jadlog Package",
    code: "JADLOG",
    active: true,
    description: "Transportadora expressa para grandes centros.",
  },
  {
    id: "carr-3",
    name: "Loggi Express",
    code: "LOGGI",
    active: true,
    description: "Entregas no mesmo dia em capitais selecionadas.",
  },
  {
    id: "carr-4",
    name: "Azul Cargo Express",
    code: "AZUL",
    active: false,
    description: "Transporte aéreo para encomendas rápidas.",
  },
  {
    id: "carr-5",
    name: "Retirada Aperta Start",
    code: "LOCAL_PICKUP",
    active: true,
    description: "Retirada presencial gratuita pelo cliente.",
  },
];

let localRulesStore: ShippingRule[] = clone(initialShippingRules);
let localCarriersStore: CarrierConfig[] = clone(initialCarriers);

export const ShippingService = {
  async listRules(): Promise<ShippingRule[]> {
    try {
      const { data, error } = await supabase.from("shipping_rules").select("*");
      if (!error && data) {
        const fetched: ShippingRule[] = data.map((item) => ({
          id: item.id,
          region: item.region,
          states: item.states || [],
          fixedPrice: Number(item.fixed_price),
          freeShippingMinAmount: item.free_shipping_min_amount ? Number(item.free_shipping_min_amount) : null,
          minDays: item.min_days || 1,
          maxDays: item.max_days || 5,
          active: Boolean(item.active),
        }));
        localRulesStore = fetched;
        return localRulesStore;
      }
    } catch (err) {
      console.warn("Aviso ao buscar regras de frete do Supabase:", err);
    }
    return delay(clone(localRulesStore));
  },

  async listCarriers(): Promise<CarrierConfig[]> {
    try {
      const { data, error } = await supabase.from("carriers").select("*");
      if (!error && data) {
        const fetched: CarrierConfig[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          active: Boolean(item.active),
          description: item.description || "",
        }));
        localCarriersStore = fetched;
        return localCarriersStore;
      }
    } catch (err) {
      console.warn("Aviso ao buscar transportadoras do Supabase:", err);
    }
    return delay(clone(localCarriersStore));
  },

  async updateRule(id: string, patch: Partial<ShippingRule>): Promise<ShippingRule> {
    const idx = localRulesStore.findIndex((r) => r.id === id);
    if (idx < 0) throw new NotFoundError("Regra de frete", id);

    const updated = { ...localRulesStore[idx]!, ...patch };
    localRulesStore[idx] = updated;

    try {
      await supabase.from("shipping_rules").upsert({
        id,
        region: updated.region,
        states: updated.states,
        fixed_price: updated.fixedPrice,
        free_shipping_min_amount: updated.freeShippingMinAmount,
        min_days: updated.minDays,
        max_days: updated.maxDays,
        active: updated.active,
      });
    } catch {
      // Fallback
    }

    return delay(clone(updated));
  },

  async createRule(input: Omit<ShippingRule, "id">): Promise<ShippingRule> {
    const newId = `rule-${Date.now()}`;
    const newRule = { ...input, id: newId };

    try {
      await supabase.from("shipping_rules").insert({
        id: newRule.id,
        region: newRule.region,
        states: newRule.states,
        fixed_price: newRule.fixedPrice,
        free_shipping_min_amount: newRule.freeShippingMinAmount,
        min_days: newRule.minDays,
        max_days: newRule.maxDays,
        active: newRule.active,
      });
    } catch {
      // Fallback
    }

    localRulesStore.push(newRule);
    return delay(clone(newRule));
  },

  async deleteRule(id: string): Promise<boolean> {
    try {
      await supabase.from("shipping_rules").delete().eq("id", id);
    } catch {
      // Fallback
    }
    localRulesStore = localRulesStore.filter((r) => r.id !== id);
    return delay(true);
  },

  async toggleCarrier(id: string): Promise<CarrierConfig> {
    const idx = localCarriersStore.findIndex((c) => c.id === id);
    if (idx < 0) throw new NotFoundError("Transportadora", id);

    const updated = { ...localCarriersStore[idx]!, active: !localCarriersStore[idx]!.active };
    localCarriersStore[idx] = updated;

    try {
      await supabase.from("carriers").upsert({
        id: updated.id,
        name: updated.name,
        code: updated.code,
        active: updated.active,
        description: updated.description,
      });
    } catch {
      // Fallback
    }

    return delay(clone(updated));
  },
};
