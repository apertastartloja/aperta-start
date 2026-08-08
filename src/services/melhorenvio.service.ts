import { ShippingService } from "./shipping.service";

const CLIENT_ID = import.meta.env.VITE_MELHORENVIO_CLIENT_ID || "28067";
const CLIENT_SECRET =
  import.meta.env.VITE_MELHORENVIO_CLIENT_SECRET || "8kvHqbkDP8ZLO6kf2vPq8zvYoA6o9nL2w0YVNf53";
const ORIGIN_CEP = import.meta.env.VITE_MELHORENVIO_ORIGIN_CEP || "01310100";
const TOKEN = import.meta.env.VITE_MELHORENVIO_TOKEN || "";

export interface CalculateShippingItem {
  id: string;
  width?: number; // cm
  height?: number; // cm
  length?: number; // cm
  weight?: number; // kg
  price: number;
  quantity: number;
}

export interface ShippingOptionResult {
  id: string | number;
  name: string;
  price: number;
  discountPrice?: number;
  deliveryTime: number; // business days
  company: string;
  companyLogo?: string;
  error?: string;
}

export const MelhorEnvioService = {
  getClientId() {
    return CLIENT_ID;
  },

  /**
   * Calculates shipping options via Melhor Envio API with smart regional fallback
   */
  async calculateShipping(
    destinationCep: string,
    items: CalculateShippingItem[] = []
  ): Promise<ShippingOptionResult[]> {
    const cleanDestination = destinationCep.replace(/\D/g, "");
    if (cleanDestination.length !== 8) {
      return [];
    }

    // Prepare items payload for API
    const productsPayload = items.map((item) => ({
      id: item.id || "1",
      width: Math.max(11, item.width || 15),
      height: Math.max(2, item.height || 10),
      length: Math.max(16, item.length || 20),
      weight: Math.max(0.1, item.weight || 0.3),
      insurance_value: Math.max(10, item.price || 50),
      quantity: Math.max(1, item.quantity || 1),
    }));

    // If no items provided, use standard package defaults
    const finalProducts =
      productsPayload.length > 0
        ? productsPayload
        : [
            {
              id: "pkg-1",
              width: 15,
              height: 10,
              length: 20,
              weight: 0.5,
              insurance_value: 99.0,
              quantity: 1,
            },
          ];

    // Try API request to Melhor Envio if token is set
    if (TOKEN) {
      try {
        const response = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/calculate", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
            "User-Agent": "ApertaStart (apertastart.loja@gmail.com)",
          },
          body: JSON.stringify({
            from: { postal_code: ORIGIN_CEP },
            to: { postal_code: cleanDestination },
            products: finalProducts,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const validOptions: ShippingOptionResult[] = data
              .filter((opt: any) => !opt.error && opt.price)
              .map((opt: any) => ({
                id: opt.id,
                name: opt.name || "Envio Expresso",
                price: parseFloat(opt.price),
                discountPrice: opt.discount ? parseFloat(opt.discount) : undefined,
                deliveryTime: opt.delivery_time || 3,
                company: opt.company?.name || "Transportadora",
                companyLogo: opt.company?.picture || undefined,
              }));

            if (validOptions.length > 0) {
              return validOptions;
            }
          }
        }
      } catch (err) {
        console.warn("API do Melhor Envio offline ou pendente de token, aplicando tabela regional:", err);
      }
    }

    // High performance regional calculation fallback
    const rules = await ShippingService.listRules();
    const uf = getUfFromCep(cleanDestination);
    const matchedRule =
      rules.find((r) => r.active && r.states.includes(uf)) || rules[0]!;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const isFree =
      matchedRule.freeShippingMinAmount && subtotal >= matchedRule.freeShippingMinAmount;

    return [
      {
        id: "sedex-correios",
        name: "SEDEX Expresso (Correios)",
        price: isFree ? 0 : matchedRule.fixedPrice + 5.0,
        deliveryTime: Math.max(1, matchedRule.minDays),
        company: "Correios",
      },
      {
        id: "pac-correios",
        name: "PAC Econômico (Correios)",
        price: isFree ? 0 : matchedRule.fixedPrice,
        deliveryTime: matchedRule.maxDays,
        company: "Correios",
      },
      {
        id: "jadlog-package",
        name: "Jadlog Package (.Package)",
        price: isFree ? 0 : Math.max(9.9, matchedRule.fixedPrice - 2.0),
        deliveryTime: Math.max(2, matchedRule.minDays + 1),
        company: "Jadlog",
      },
    ];
  },
};

// Helper: Map first digits of CEP to Brazilian UF
function getUfFromCep(cep: string): string {
  const prefix = parseInt(cep.substring(0, 2), 10);
  if (isNaN(prefix)) return "SP";

  if (prefix >= 1 && prefix <= 19) return "SP";
  if (prefix >= 20 && prefix <= 28) return "RJ";
  if (prefix >= 29 && prefix <= 29) return "ES";
  if (prefix >= 30 && prefix <= 39) return "MG";
  if (prefix >= 40 && prefix <= 48) return "BA";
  if (prefix >= 49 && prefix <= 49) return "SE";
  if (prefix >= 50 && prefix <= 56) return "PE";
  if (prefix >= 57 && prefix <= 57) return "AL";
  if (prefix >= 58 && prefix <= 58) return "PB";
  if (prefix >= 59 && prefix <= 59) return "RN";
  if (prefix >= 60 && prefix <= 63) return "CE";
  if (prefix >= 64 && prefix <= 64) return "PI";
  if (prefix >= 65 && prefix <= 65) return "MA";
  if (prefix >= 66 && prefix <= 68) return "PA";
  if (prefix >= 69 && prefix <= 69) return "AM";
  if (prefix >= 70 && prefix <= 73) return "DF";
  if (prefix >= 74 && prefix <= 76) return "GO";
  if (prefix >= 77 && prefix <= 77) return "TO";
  if (prefix >= 78 && prefix <= 78) return "MT";
  if (prefix >= 79 && prefix <= 79) return "MS";
  if (prefix >= 80 && prefix <= 87) return "PR";
  if (prefix >= 88 && prefix <= 89) return "SC";
  if (prefix >= 90 && prefix <= 99) return "RS";

  return "SP";
}
