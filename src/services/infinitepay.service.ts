import { StoreSettingsService } from "./store-settings.service";

export interface InfinitePayItem {
  description: string;
  quantity: number;
  price: number; // in cents
}

export interface InfinitePayCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CreateInfinitePayLinkInput {
  orderCode: string;
  items: InfinitePayItem[];
  customer: InfinitePayCustomer;
  redirectUrl?: string;
  webhookUrl?: string;
}

export interface InfinitePayLinkResult {
  success: boolean;
  url?: string;
  errorMessage?: string;
  raw?: any;
}

const API_ENDPOINT = "https://api.checkout.infinitepay.io/links";

export const InfinitePayService = {
  /**
   * Obtém o handle da InfinitePay (sem cifrão $)
   */
  async getHandle(): Promise<string> {
    try {
      const settings = await StoreSettingsService.getSettings();
      if (settings?.infinitePayHandle?.trim()) {
        return settings.infinitePayHandle.trim().replace(/^\$/, "");
      }
    } catch (e) {
      console.warn("Erro ao obter handle da InfinitePay via settings:", e);
    }

    const envHandle = (import.meta.env.VITE_INFINITEPAY_HANDLE as string) || "Aperta-Start-Site";
    return envHandle.replace(/^\$/, "").trim();
  },

  /**
   * Cria o link de pagamento do Checkout Integrado da InfinitePay
   */
  async createCheckoutLink(input: CreateInfinitePayLinkInput): Promise<InfinitePayLinkResult> {
    try {
      const handle = await this.getHandle();

      if (!handle) {
        return {
          success: false,
          errorMessage: "InfiniteTag (handle) não configurada na loja.",
        };
      }

      // Limpeza de telefone (somente números com DDD)
      const cleanPhone = input.customer.phone.replace(/\D/g, "");

      const origin = typeof window !== "undefined" ? window.location.origin : "https://apertastart.com.br";
      const redirectUrl =
        input.redirectUrl || `${origin}/obrigado?pedido=${encodeURIComponent(input.orderCode)}`;

      const payload = {
        handle,
        order_nsu: input.orderCode,
        items: input.items,
        customer: {
          name: input.customer.name.trim(),
          email: input.customer.email.trim(),
          phone: cleanPhone || "11999999999",
        },
        redirect_url: redirectUrl,
        ...(input.webhookUrl ? { webhook_url: input.webhookUrl } : {}),
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        if (data?.error === "external_checkout_not_enabled") {
          return {
            success: false,
            errorMessage:
              "O Checkout Integrado da InfinitePay ainda não está ativo na sua conta. Acesse o App InfinitePay em Vendas > Checkout > Configurações para habilitar.",
            raw: data,
          };
        }
        return {
          success: false,
          errorMessage: data?.message || `Erro da API InfinitePay (Status ${response.status})`,
          raw: data,
        };
      }

      // InfinitePay API retorna { url: "..." } ou { redirect_url: "..." }
      const checkoutUrl = data.url || data.redirect_url || data.link || data.checkout_url;

      if (!checkoutUrl) {
        if (data?.error === "external_checkout_not_enabled") {
          return {
            success: false,
            errorMessage:
              "O Checkout Integrado não está habilitado no seu app InfinitePay. Acesse Vendas > Checkout > Configurações no App.",
            raw: data,
          };
        }
        return {
          success: false,
          errorMessage: data?.message || "URL de checkout não retornada pela InfinitePay.",
          raw: data,
        };
      }

      return {
        success: true,
        url: checkoutUrl,
        raw: data,
      };
    } catch (err: any) {
      console.error("Falha ao criar link de checkout InfinitePay:", err);
      return {
        success: false,
        errorMessage: err?.message || "Falha de conexão com a InfinitePay.",
      };
    }
  },

  /**
   * Testa a conexão com a API da InfinitePay usando o handle informado
   */
  async testConnection(customHandle?: string): Promise<{
    success: boolean;
    status: "active" | "not_enabled" | "error";
    message: string;
    details?: any;
  }> {
    try {
      const handle = customHandle?.trim().replace(/^\$/, "") || (await this.getHandle());

      if (!handle) {
        return {
          success: false,
          status: "error",
          message: "Informe uma InfiniteTag antes de testar.",
        };
      }

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle,
          items: [
            {
              description: "Teste de Conexão Aperta Start",
              quantity: 1,
              price: 100, // R$ 1,00
            },
          ],
          order_nsu: `TEST-${Date.now()}`,
          redirect_url: "https://apertastart.com.br/obrigado",
        }),
      });

      const data = await response.json().catch(() => null);

      if (data?.error === "external_checkout_not_enabled") {
        return {
          success: false,
          status: "not_enabled",
          message:
            "Handle encontrado na InfinitePay! Porém, você precisa habilitar o 'Checkout Integrado' no App InfinitePay em Vendas → Checkout → Configurações.",
          details: data,
        };
      }

      const checkoutUrl = data?.url || data?.redirect_url;
      if (response.ok && checkoutUrl) {
        return {
          success: true,
          status: "active",
          message: "Conexão validada com sucesso! O Checkout Integrado está ativo e operando normalmente.",
          details: data,
        };
      }

      return {
        success: false,
        status: "error",
        message: data?.message || `A API respondeu com erro (Status ${response.status}).`,
        details: data,
      };
    } catch (error: any) {
      return {
        success: false,
        status: "error",
        message: error?.message || "Falha ao comunicar com os servidores da InfinitePay.",
      };
    }
  },
};
