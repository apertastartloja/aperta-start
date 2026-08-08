const MP_ACCESS_TOKEN =
  import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN ||
  "APP_USR-5700161549146357-080720-efdfe843bead67a21e9b51011584947c-2998808507";

const MP_PUBLIC_KEY =
  import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ||
  "APP_USR-d77470bf-0528-4a59-9906-5cbcb9ee33e9";

const MP_WEBHOOK_SECRET =
  import.meta.env.VITE_MERCADOPAGO_WEBHOOK_SECRET ||
  "5f18edf05e1160397dbb842c3d6009e6437b03e3afea640301f52e1e208f8bf2";

export interface PixPaymentInput {
  amount: number;
  email: string;
  name: string;
  cpf: string;
  orderCode: string;
}

export interface PixPaymentResult {
  success: boolean;
  paymentId?: string | number;
  status?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  errorMessage?: string;
}

export interface CardPaymentInput {
  token: string;
  issuerId?: string;
  paymentMethodId: string;
  transactionAmount: number;
  installments: number;
  email: string;
  cpf: string;
  name: string;
}

export const MercadoPagoService = {
  getPublicKey() {
    return MP_PUBLIC_KEY;
  },

  /**
   * Generates a real Mercado Pago PIX Payment with dynamic QR Code and Copia-e-Cola key
   */
  async createPixPayment(input: PixPaymentInput): Promise<PixPaymentResult> {
    try {
      const nameParts = input.name.trim().split(" ");
      const firstName = nameParts[0] || "Cliente";
      const lastName = nameParts.slice(1).join(" ") || "Aperta Start";
      const cleanCpf = (input.cpf || "").replace(/\D/g, "") || "11122233344";

      const payload = {
        transaction_amount: Number(input.amount.toFixed(2)),
        description: `Pedido Aperta Start #${input.orderCode}`,
        payment_method_id: "pix",
        payer: {
          email: input.email || "cliente@apertastart.com.br",
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: "CPF",
            number: cleanCpf.length === 11 ? cleanCpf : "11122233344",
          },
        },
      };

      const response = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          "X-Idempotency-Key": `pix-${input.orderCode}-${Date.now()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        const transactionData = data.point_of_interaction?.transaction_data;
        return {
          success: true,
          paymentId: data.id,
          status: data.status, // "pending"
          qrCode: transactionData?.qr_code || "",
          qrCodeBase64: transactionData?.qr_code_base64
            ? `data:image/jpeg;base64,${transactionData.qr_code_base64}`
            : "",
          ticketUrl: transactionData?.ticket_url || "",
        };
      } else {
        console.warn("Retorno da API Mercado Pago:", data);
        const errorMsg =
          data.message || data.cause?.[0]?.description || "Erro ao gerar PIX com o Mercado Pago.";
        return { success: false, errorMessage: errorMsg };
      }
    } catch (err: any) {
      console.error("Exceção na integração com o Mercado Pago:", err);
      return {
        success: false,
        errorMessage: "Falha de conexão com os servidores do Mercado Pago.",
      };
    }
  },

  /**
   * Checks payment status from Mercado Pago (e.g. "approved", "pending")
   */
  async checkStatus(paymentId: string | number): Promise<string> {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.status || "pending";
      }
    } catch (err) {
      console.warn("Erro ao consultar status do pagamento:", err);
    }
    return "pending";
  },
};
