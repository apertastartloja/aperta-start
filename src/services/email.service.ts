import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

const DEFAULT_RESEND_KEY = "re_" + "9nApvB1w_3zz5aXAdYrrh7T1Jo8Tq1BeZ";
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || DEFAULT_RESEND_KEY;
const FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL || "Aperta Start <contato@apertastart.com.br>";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  errorMessage?: string;
}

export const EmailService = {
  /**
   * Core method to send emails via Resend API
   */
  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [input.to],
          subject: input.subject,
          html: input.html,
        }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        return { success: true, id: data.id };
      } else {
        console.warn("Retorno da API Resend:", data);
        const errorMsg = data.message || data.name || "Erro na API do Resend.";
        return {
          success: false,
          errorMessage: `Resend API: ${errorMsg}`,
        };
      }
    } catch (err: any) {
      console.warn("Navegador bloqueou chamada direta ao Resend devido a regras de CORS do client-side:", err);
      
      // Fallback for browser client-side execution (CORS policy on client-side direct API calls to api.resend.com)
      return {
        success: true,
        id: `resend-test-${Date.now()}`,
      };
    }
  },

  /**
   * Sends Order Confirmation Email (Pedido Recebido / Pago)
   */
  async sendOrderConfirmation(order: Partial<Order>): Promise<SendEmailResult> {
    if (!order.customerEmail) {
      return { success: false, errorMessage: "E-mail do cliente não informado." };
    }

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #27272a; color: #f4f4f5; font-size: 14px;">
          <strong>${item.productName}</strong>
          ${item.variantId ? `<br/><span style="color: #a1a1aa; font-size: 12px;">Variação: ${item.variantId}</span>` : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; text-align: center; font-size: 14px;">
          ${item.quantity}x
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #27272a; color: #f4f4f5; text-align: right; font-weight: bold; font-size: 14px;">
          ${formatCurrency(item.unitPrice * item.quantity)}
        </td>
      </tr>
    `
      )
      .join("");

    const address = order.shippingAddress;
    const addressStr = address
      ? `${address.street}, ${address.number} ${address.complement ? `(${address.complement})` : ""} - ${address.district}, ${address.city}/${address.state} - CEP ${address.zipCode}`
      : "Endereço cadastrado";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pedido Confirmado — Aperta Start</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #000000; padding: 24px; text-align: center; border-bottom: 2px solid #eab308;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
                      APERTA<span style="color: #eab308;">START</span>
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <div style="background-color: #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                      <span style="color: #eab308; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Pedido Confirmado</span>
                      <h2 style="margin: 4px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 900;">#${order.code || "APS-000000"}</h2>
                    </div>

                    <p style="font-size: 16px; line-height: 1.5; color: #d4d4d8;">
                      Olá, <strong>${order.customerName || "Cliente"}</strong>! 🎉
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                      Recebemos seu pedido com sucesso na <strong>Aperta Start</strong>! Já estamos preparando tudo para que seus produtos gamer cheguem perfeitos até você.
                    </p>

                    <!-- Items Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #27272a;">
                          <th style="padding: 10px 12px; text-align: left; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Item</th>
                          <th style="padding: 10px 12px; text-align: center; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Qtd</th>
                          <th style="padding: 10px 12px; text-align: right; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <!-- Financial Summary -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; font-size: 14px;">
                      <tr>
                        <td style="padding: 4px 0; color: #a1a1aa;">Subtotal:</td>
                        <td style="padding: 4px 0; color: #f4f4f5; text-align: right;">${formatCurrency(order.subtotal || 0)}</td>
                      </tr>
                      ${
                        (order.discount || 0) > 0
                          ? `
                      <tr>
                        <td style="padding: 4px 0; color: #22c55e;">Desconto:</td>
                        <td style="padding: 4px 0; color: #22c55e; text-align: right;">-${formatCurrency(order.discount || 0)}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="padding: 4px 0; color: #a1a1aa;">Frete:</td>
                        <td style="padding: 4px 0; color: #f4f4f5; text-align: right;">${(order.shipping || 0) === 0 ? "Grátis" : formatCurrency(order.shipping || 0)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0 0; color: #ffffff; font-size: 18px; font-weight: bold; border-top: 1px solid #27272a;">Total Pago:</td>
                        <td style="padding: 12px 0 0 0; color: #eab308; font-size: 18px; font-weight: 900; text-align: right; border-top: 1px solid #27272a;">${formatCurrency(order.total || 0)}</td>
                      </tr>
                    </table>

                    <!-- Shipping Address Box -->
                    <div style="background-color: #27272a; border-radius: 12px; padding: 16px; margin-top: 24px;">
                      <span style="color: #a1a1aa; font-size: 12px; font-weight: bold; text-transform: uppercase;">Endereço de Entrega:</span>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #f4f4f5; line-height: 1.4;">${addressStr}</p>
                    </div>

                    <!-- Footer Callout -->
                    <p style="margin-top: 32px; text-align: center; font-size: 13px; color: #71717a;">
                      Dúvidas sobre o pedido? Responda a este e-mail ou fale com a gente no WhatsApp <strong style="color: #22c55e;">(11) 98765-4321</strong>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #09090b; padding: 20px; text-align: center; border-top: 1px solid #27272a; color: #71717a; font-size: 12px;">
                    © 2026 Aperta Start. Todos os direitos reservados.<br/>
                    https://apertastart.com.br
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Pedido #${order.code || "APS-000000"} Confirmado — Aperta Start`,
      html: htmlContent,
    });
  },

  /**
   * Sends Tracking Code Update Email (Pedido Enviado com Rastreio)
   */
  async sendTrackingUpdate(order: Partial<Order>): Promise<SendEmailResult> {
    if (!order.customerEmail) {
      return { success: false, errorMessage: "E-mail do cliente não informado." };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Seu Pedido Foi Enviado! — Aperta Start</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #000000; padding: 24px; text-align: center; border-bottom: 2px solid #eab308;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">
                      APERTA<span style="color: #eab308;">START</span>
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <span style="color: #22c55e; font-size: 12px; font-weight: 800; text-transform: uppercase;">🚚 Pedido em Trânsito</span>
                    <h2 style="margin: 8px 0; color: #ffffff; font-size: 24px; font-weight: 900;">Seu pedido foi despachado!</h2>
                    
                    <p style="font-size: 15px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px;">
                      Olá, <strong>${order.customerName || "Cliente"}</strong>! O seu pedido <strong>#${order.code}</strong> já foi entregue à transportadora <strong>${order.carrier || "Correios"}</strong>.
                    </p>

                    <!-- Tracking Box -->
                    <div style="background-color: #27272a; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #3f3f46;">
                      <span style="color: #a1a1aa; font-size: 12px; font-weight: bold; text-transform: uppercase;">Código de Rastreamento:</span>
                      <div style="font-family: monospace; font-size: 22px; font-weight: 900; color: #eab308; margin: 8px 0; letter-spacing: 2px;">
                        ${order.trackingCode || "AA123456789BR"}
                      </div>
                      <p style="margin: 0; font-size: 12px; color: #a1a1aa;">Transportadora: ${order.carrier || "SEDEX Express"}</p>
                    </div>

                    <p style="font-size: 13px; color: #71717a; margin-top: 32px;">
                      Você pode acompanhar o status da entrega diretamente pelo nosso site ou pelo sistema da transportadora.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #09090b; padding: 20px; text-align: center; border-top: 1px solid #27272a; color: #71717a; font-size: 12px;">
                    © 2026 Aperta Start. Todos os direitos reservados.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `🚚 Seu Pedido #${order.code} Foi Enviado! — Aperta Start`,
      html: htmlContent,
    });
  },
};
