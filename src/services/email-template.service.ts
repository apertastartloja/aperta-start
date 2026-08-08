import { supabase } from "@/lib/supabase";
import { clone, delay } from "./base.service";
import { formatCurrency } from "@/utils/format";

export type EmailBlockType =
  | "header_logo"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "divider"
  | "spacer"
  | "products_table"
  | "order_summary"
  | "payment_info"
  | "shipping_info"
  | "social_links"
  | "footer";

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content?: string;
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
  buttonUrl?: string;
  imageUrl?: string;
  padding?: number;
  height?: number;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  category: "pedidos" | "pagamentos" | "logistica" | "clientes" | "marketing";
  subject: string;
  description: string;
  active: boolean;
  blocks: EmailBlock[];
  updatedAt: string;
}

// Sample Context Data for Live Compilation & Preview
export const sampleTemplateContext = {
  cliente: {
    nome: "Cristiano Alves",
    email: "cristiano@exemplo.com",
    telefone: "(11) 98765-4321",
    cidade: "São Paulo",
    uf: "SP",
  },
  pedido: {
    codigo: "APS-849201",
    data: "07/08/2026",
    subtotal: "R$ 189,80",
    frete: "Grátis",
    desconto: "R$ 9,49",
    total: "R$ 180,31",
  },
  pagamento: {
    metodo: "PIX (5% Desconto)",
    status: "Aprovado",
    pix_qrcode: "https://apertastart.com.br/assets/qrcode-pix.png",
    pix_copia_cola: "00020126580014br.gov.bcb.pix0136apertastart-pix-1803152040000",
  },
  entrega: {
    endereco: "Av. Paulista, 1000 - Apto 42, Bela Vista, São Paulo/SP",
    transportadora: "Correios (SEDEX Express)",
    codigo_rastreio: "AA987654321BR",
    link_rastreio: "https://rastreamento.correios.com.br/app/index.php",
  },
  loja: {
    nome: "Aperta Start",
    email: "contato@apertastart.com.br",
    whatsapp: "(11) 98765-4321",
    logo_url: "https://apertastart.com.br/assets/logo.png",
  },
};

// Variable Categories for 1-Click Chips Insertion
export const emailVariablesList = [
  { category: "Cliente", key: "{cliente.nome}", label: "Nome do Cliente" },
  { category: "Cliente", key: "{cliente.email}", label: "E-mail do Cliente" },
  { category: "Cliente", key: "{cliente.telefone}", label: "Telefone" },
  { category: "Cliente", key: "{cliente.cidade}", label: "Cidade" },
  { category: "Cliente", key: "{cliente.uf}", label: "Estado (UF)" },

  { category: "Pedido", key: "{pedido.codigo}", label: "Código do Pedido (#APS-123)" },
  { category: "Pedido", key: "{pedido.data}", label: "Data da Compra" },
  { category: "Pedido", key: "{pedido.subtotal}", label: "Subtotal" },
  { category: "Pedido", key: "{pedido.frete}", label: "Valor do Frete" },
  { category: "Pedido", key: "{pedido.desconto}", label: "Valor do Desconto" },
  { category: "Pedido", key: "{pedido.total}", label: "Total Final (R$)" },

  { category: "Pagamento", key: "{pagamento.metodo}", label: "Método de Pagamento" },
  { category: "Pagamento", key: "{pagamento.status}", label: "Status do Pagamento" },
  { category: "Pagamento", key: "{pagamento.pix_copia_cola}", label: "Chave PIX Copia e Cola" },

  { category: "Entrega", key: "{entrega.endereco}", label: "Endereço de Entrega" },
  { category: "Entrega", key: "{entrega.transportadora}", label: "Nome da Transportadora" },
  { category: "Entrega", key: "{entrega.codigo_rastreio}", label: "Código de Rastreamento" },
  { category: "Entrega", key: "{entrega.link_rastreio}", label: "Link de Rastreio" },

  { category: "Loja", key: "{loja.nome}", label: "Nome da Loja" },
  { category: "Loja", key: "{loja.email}", label: "E-mail de Suporte" },
  { category: "Loja", key: "{loja.whatsapp}", label: "WhatsApp da Loja" },
];

// Initial Catalog of 8 Transactional Templates
const initialTemplates: EmailTemplate[] = [
  {
    id: "tmpl-1",
    key: "order_placed",
    name: "📦 Pedido Recebido / Aguardando Pagamento",
    category: "pedidos",
    subject: "Pedido #{pedido.codigo} Recebido — {loja.nome}",
    description: "Enviado imediatamente após a conclusão da compra no checkout.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Pedido #{pedido.codigo} Confirmado!",
        fontSize: 22,
        textColor: "#ffffff",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Olá, {cliente.nome}! 🎉 Recebemos seu pedido com sucesso na {loja.nome}. Já estamos preparando tudo para o envio!",
        fontSize: 14,
        textColor: "#a1a1aa",
        align: "left",
      },
      { id: "b4", type: "products_table" },
      { id: "b5", type: "order_summary" },
      { id: "b6", type: "payment_info" },
      { id: "b7", type: "shipping_info" },
      { id: "b8", type: "social_links" },
      { id: "b9", type: "footer" },
    ],
  },
  {
    id: "tmpl-2",
    key: "payment_approved",
    name: "✅ Pagamento Aprovado",
    category: "pagamentos",
    subject: "✅ Pagamento Aprovado para o Pedido #{pedido.codigo}",
    description: "Enviado quando o Mercado Pago confirma a aprovação do PIX ou Cartão.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Pagamento Confirmado!",
        fontSize: 24,
        textColor: "#22c55e",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Olá, {cliente.nome}! Confirmamos o pagamento de {pedido.total} do seu pedido #{pedido.codigo} via {pagamento.metodo}. Seu pedido entrou na fila de embalagem!",
        fontSize: 14,
        textColor: "#f4f4f5",
        align: "left",
      },
      { id: "b4", type: "order_summary" },
      { id: "b5", type: "shipping_info" },
      { id: "b6", type: "social_links" },
      { id: "b7", type: "footer" },
    ],
  },
  {
    id: "tmpl-3",
    key: "order_shipped",
    name: "🚚 Pedido Enviado / Código de Rastreio",
    category: "logistica",
    subject: "🚚 Seu Pedido #{pedido.codigo} Foi Enviado! — {loja.nome}",
    description: "Enviado quando o administrador insere o código de rastreamento no painel.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Seu Pedido Está a Caminho!",
        fontSize: 24,
        textColor: "#ffffff",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Olá, {cliente.nome}! O seu pedido #{pedido.codigo} foi entregue para a transportadora {entrega.transportadora}.",
        fontSize: 14,
        textColor: "#a1a1aa",
        align: "center",
      },
      { id: "b4", type: "shipping_info" },
      {
        id: "b5",
        type: "button",
        content: "Rastrear Minha Encomenda Agora",
        buttonUrl: "{entrega.link_rastreio}",
        bgColor: "#eab308",
        textColor: "#000000",
        align: "center",
      },
      { id: "b6", type: "footer" },
    ],
  },
  {
    id: "tmpl-4",
    key: "order_delivered",
    name: "🎉 Pedido Entregue no Destino",
    category: "logistica",
    subject: "🎉 Pedido #{pedido.codigo} Entregue com Sucesso!",
    description: "Enviado quando a entrega é confirmada pela transportadora.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Seu Setup Ganhou Level Up!",
        fontSize: 22,
        textColor: "#eab308",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Constamos que o seu pedido #{pedido.codigo} foi entregue em {entrega.endereco}. Esperamos que você ame seus novos itens gamer!",
        fontSize: 14,
        textColor: "#f4f4f5",
        align: "center",
      },
      {
        id: "b4",
        type: "button",
        content: "Avaliar Meus Produtos",
        buttonUrl: "https://apertastart.com.br/minha-conta",
        bgColor: "#eab308",
        textColor: "#000000",
        align: "center",
      },
      { id: "b5", type: "footer" },
    ],
  },
  {
    id: "tmpl-5",
    key: "order_canceled",
    name: "❌ Pedido Cancelado",
    category: "pedidos",
    subject: "Aviso de Cancelamento — Pedido #{pedido.codigo}",
    description: "Enviado quando um pedido é cancelado ou estornado.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Pedido Cancelado",
        fontSize: 22,
        textColor: "#ef4444",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Olá, {cliente.nome}. O seu pedido #{pedido.codigo} foi cancelado. Se você efetuou algum pagamento, o valor será estornado conforme as políticas da sua operadora.",
        fontSize: 14,
        textColor: "#a1a1aa",
        align: "left",
      },
      { id: "b4", type: "footer" },
    ],
  },
  {
    id: "tmpl-6",
    key: "customer_welcome",
    name: "👋 Boas-Vindas ao Criar Conta",
    category: "clientes",
    subject: "Bem-vindo à {loja.nome}, {cliente.nome}! 🎮",
    description: "Enviado quando um novo cliente se cadastra na loja.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Seja Bem-vindo à Aperta Start!",
        fontSize: 24,
        textColor: "#ffffff",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Sua conta foi criada com sucesso com o e-mail {cliente.email}. Agora você pode acompanhar seus pedidos, salvar favoritos e receber ofertas exclusivas para elevar o nível do seu setup!",
        fontSize: 14,
        textColor: "#d4d4d8",
        align: "left",
      },
      {
        id: "b4",
        type: "button",
        content: "Explorar Coleção Gamer",
        buttonUrl: "https://apertastart.com.br/loja",
        bgColor: "#eab308",
        textColor: "#000000",
        align: "center",
      },
      { id: "b5", type: "social_links" },
      { id: "b6", type: "footer" },
    ],
  },
  {
    id: "tmpl-7",
    key: "password_reset",
    name: "🔐 Redefinição de Senha",
    category: "clientes",
    subject: "Redefinição de Senha — {loja.nome}",
    description: "Enviado quando o usuário solicita redefinição de acesso.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Redefinir Sua Senha",
        fontSize: 22,
        textColor: "#ffffff",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Recebemos um pedido para alterar a senha da conta vinculada ao e-mail {cliente.email}. Clique no botão abaixo para criar uma nova senha:",
        fontSize: 14,
        textColor: "#a1a1aa",
        align: "left",
      },
      {
        id: "b4",
        type: "button",
        content: "Redefinir Minha Senha",
        buttonUrl: "https://apertastart.com.br/redefinir-senha",
        bgColor: "#eab308",
        textColor: "#000000",
        align: "center",
      },
      { id: "b5", type: "footer" },
    ],
  },
  {
    id: "tmpl-8",
    key: "newsletter_welcome",
    name: "🎁 Cupom de Boas-Vindas Newsletter",
    category: "marketing",
    subject: "Seu Cupom de 10% OFF Chegou! 🎁 — {loja.nome}",
    description: "Enviado ao se cadastrar para receber novidades no rodapé.",
    active: true,
    updatedAt: "2026-08-07T22:00:00.000Z",
    blocks: [
      { id: "b1", type: "header_logo", align: "center", padding: 20 },
      {
        id: "b2",
        type: "heading",
        content: "Aqui Está Seu Cupom Exclusivo!",
        fontSize: 24,
        textColor: "#eab308",
        align: "center",
      },
      {
        id: "b3",
        type: "text",
        content:
          "Obrigado por se inscrever na nossa lista VIP! Use o cupom abaixo na tela de checkout para garantir 10% de desconto no seu próximo pedido:",
        fontSize: 14,
        textColor: "#f4f4f5",
        align: "center",
      },
      {
        id: "b4",
        type: "button",
        content: "Usar Cupom START10 Na Loja",
        buttonUrl: "https://apertastart.com.br/loja",
        bgColor: "#eab308",
        textColor: "#000000",
        align: "center",
      },
      { id: "b5", type: "social_links" },
      { id: "b6", type: "footer" },
    ],
  },
];

let localTemplatesStore: EmailTemplate[] = clone(initialTemplates);

export const EmailTemplateService = {
  /**
   * Fetches all templates from Supabase or local state
   */
  async listAll(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase.from("email_templates").select("*");
      if (!error && data && data.length > 0) {
        const fetched = data.map((t) => ({
          id: t.id,
          key: t.key,
          name: t.name,
          category: t.category,
          subject: t.subject,
          description: t.description,
          active: t.active ?? true,
          blocks: t.blocks || [],
          updatedAt: t.updated_at || new Date().toISOString(),
        }));
        return fetched;
      }
    } catch {
      // Fallback
    }
    return delay(clone(localTemplatesStore));
  },

  /**
   * Save / Update Template blocks & subject
   */
  async updateTemplate(
    id: string,
    patch: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    const idx = localTemplatesStore.findIndex((t) => t.id === id);
    if (idx >= 0) {
      localTemplatesStore[idx] = {
        ...localTemplatesStore[idx]!,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      await supabase.from("email_templates").upsert({
        id,
        key: patch.key || localTemplatesStore[idx]?.key,
        name: patch.name || localTemplatesStore[idx]?.name,
        category: patch.category || localTemplatesStore[idx]?.category,
        subject: patch.subject || localTemplatesStore[idx]?.subject,
        description: patch.description || localTemplatesStore[idx]?.description,
        active: patch.active ?? localTemplatesStore[idx]?.active ?? true,
        blocks: patch.blocks || localTemplatesStore[idx]?.blocks,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Fallback
    }

    return delay(clone(localTemplatesStore[idx]!));
  },

  /**
   * Compiles JSON blocks into bulletproof responsive HTML email markup
   */
  compileBlocksToHtml(blocks: EmailBlock[], contextData: any = sampleTemplateContext): string {
    const replaceVars = (str: string = "") => {
      let result = str;
      result = result.replace(/\{cliente\.nome\}/g, contextData.cliente.nome);
      result = result.replace(/\{cliente\.email\}/g, contextData.cliente.email);
      result = result.replace(/\{cliente\.telefone\}/g, contextData.cliente.telefone);
      result = result.replace(/\{cliente\.cidade\}/g, contextData.cliente.cidade);
      result = result.replace(/\{cliente\.uf\}/g, contextData.cliente.uf);

      result = result.replace(/\{pedido\.codigo\}/g, contextData.pedido.codigo);
      result = result.replace(/\{pedido\.data\}/g, contextData.pedido.data);
      result = result.replace(/\{pedido\.subtotal\}/g, contextData.pedido.subtotal);
      result = result.replace(/\{pedido\.frete\}/g, contextData.pedido.frete);
      result = result.replace(/\{pedido\.desconto\}/g, contextData.pedido.desconto);
      result = result.replace(/\{pedido\.total\}/g, contextData.pedido.total);

      result = result.replace(/\{pagamento\.metodo\}/g, contextData.pagamento.metodo);
      result = result.replace(/\{pagamento\.status\}/g, contextData.pagamento.status);
      result = result.replace(/\{pagamento\.pix_copia_cola\}/g, contextData.pagamento.pix_copia_cola);

      result = result.replace(/\{entrega\.endereco\}/g, contextData.entrega.endereco);
      result = result.replace(/\{entrega\.transportadora\}/g, contextData.entrega.transportadora);
      result = result.replace(/\{entrega\.codigo_rastreio\}/g, contextData.entrega.codigo_rastreio);
      result = result.replace(/\{entrega\.link_rastreio\}/g, contextData.entrega.link_rastreio);

      result = result.replace(/\{loja\.nome\}/g, contextData.loja.nome);
      result = result.replace(/\{loja\.email\}/g, contextData.loja.email);
      result = result.replace(/\{loja\.whatsapp\}/g, contextData.loja.whatsapp);
      return result;
    };

    const blocksHtml = blocks
      .map((block) => {
        const align = block.align || "left";
        const textColor = block.textColor || "#f4f4f5";
        const fontSize = block.fontSize || 14;

        switch (block.type) {
          case "header_logo":
            return `
              <tr>
                <td style="background-color: #000000; padding: 24px; text-align: center; border-bottom: 2px solid #eab308;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px;">
                    APERTA<span style="color: #eab308;">START</span>
                  </h1>
                </td>
              </tr>
            `;

          case "heading":
            return `
              <tr>
                <td style="padding: 16px 24px; text-align: ${align};">
                  <h2 style="margin: 0; color: ${textColor}; font-size: ${fontSize}px; font-weight: 900; line-height: 1.3;">
                    ${replaceVars(block.content)}
                  </h2>
                </td>
              </tr>
            `;

          case "text":
            return `
              <tr>
                <td style="padding: 8px 24px; text-align: ${align}; color: ${textColor}; font-size: ${fontSize}px; line-height: 1.6;">
                  ${replaceVars(block.content)}
                </td>
              </tr>
            `;

          case "button":
            return `
              <tr>
                <td style="padding: 20px 24px; text-align: ${align};">
                  <a href="${replaceVars(block.buttonUrl || "#")}" target="_blank" style="display: inline-block; background-color: ${block.bgColor || "#eab308"}; color: ${textColor}; font-size: ${fontSize}px; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(234, 179, 8, 0.2);">
                    ${replaceVars(block.content || "Clique Aqui")}
                  </a>
                </td>
              </tr>
            `;

          case "image":
            return `
              <tr>
                <td style="padding: 16px 24px; text-align: ${align};">
                  <img src="${block.imageUrl || "https://apertastart.com.br/assets/products/suporte-duplo.jpg"}" alt="Imagem" style="max-width: 100%; height: auto; border-radius: 12px;" />
                </td>
              </tr>
            `;

          case "divider":
            return `
              <tr>
                <td style="padding: 16px 24px;">
                  <hr style="border: 0; border-top: 1px solid #27272a; margin: 0;" />
                </td>
              </tr>
            `;

          case "spacer":
            return `
              <tr>
                <td style="height: ${block.height || 24}px; line-height: ${block.height || 24}px; font-size: 1px;">&nbsp;</td>
              </tr>
            `;

          case "products_table":
            return `
              <tr>
                <td style="padding: 16px 24px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #27272a; border-radius: 12px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #3f3f46;">
                        <th style="padding: 10px 12px; text-align: left; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Item do Pedido</th>
                        <th style="padding: 10px 12px; text-align: center; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Qtd</th>
                        <th style="padding: 10px 12px; text-align: right; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #3f3f46; color: #f4f4f5; font-size: 14px;">
                          <strong>Suporte Duplo para Controles PS5 / Xbox</strong>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #3f3f46; color: #a1a1aa; text-align: center; font-size: 14px;">1x</td>
                        <td style="padding: 12px; border-bottom: 1px solid #3f3f46; color: #f4f4f5; text-align: right; font-weight: bold; font-size: 14px;">R$ 129,90</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px; color: #f4f4f5; font-size: 14px;">
                          <strong>Luminária Decorativa Bloco Interrogação</strong>
                        </td>
                        <td style="padding: 12px; color: #a1a1aa; text-align: center; font-size: 14px;">1x</td>
                        <td style="padding: 12px; color: #f4f4f5; text-align: right; font-weight: bold; font-size: 14px;">R$ 59,90</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            `;

          case "order_summary":
            return `
              <tr>
                <td style="padding: 16px 24px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                    <tr>
                      <td style="padding: 4px 0; color: #a1a1aa;">Subtotal:</td>
                      <td style="padding: 4px 0; color: #f4f4f5; text-align: right;">${replaceVars("{pedido.subtotal}")}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #22c55e;">Desconto:</td>
                      <td style="padding: 4px 0; color: #22c55e; text-align: right;">-${replaceVars("{pedido.desconto}")}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #a1a1aa;">Frete:</td>
                      <td style="padding: 4px 0; color: #f4f4f5; text-align: right;">${replaceVars("{pedido.frete}")}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0 0 0; color: #ffffff; font-size: 18px; font-weight: bold; border-top: 1px solid #27272a;">Total Final:</td>
                      <td style="padding: 12px 0 0 0; color: #eab308; font-size: 18px; font-weight: 900; text-align: right; border-top: 1px solid #27272a;">${replaceVars("{pedido.total}")}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            `;

          case "payment_info":
            return `
              <tr>
                <td style="padding: 16px 24px;">
                  <div style="background-color: #27272a; border-radius: 12px; padding: 16px; border: 1px solid #3f3f46;">
                    <span style="color: #22c55e; font-size: 12px; font-weight: bold; text-transform: uppercase;">Pagamento em ${replaceVars("{pagamento.metodo}")}</span>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #a1a1aa;">Status: <strong style="color: #ffffff;">${replaceVars("{pagamento.status}")}</strong></p>
                  </div>
                </td>
              </tr>
            `;

          case "shipping_info":
            return `
              <tr>
                <td style="padding: 16px 24px;">
                  <div style="background-color: #27272a; border-radius: 12px; padding: 16px; border: 1px solid #3f3f46;">
                    <span style="color: #a1a1aa; font-size: 12px; font-weight: bold; text-transform: uppercase;">Transportadora & Endereço:</span>
                    <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #ffffff;">${replaceVars("{entrega.transportadora}")}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #a1a1aa;">Rastreio: <strong style="color: #eab308; font-family: monospace;">${replaceVars("{entrega.codigo_rastreio}")}</strong></p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #a1a1aa;">Destino: ${replaceVars("{entrega.endereco}")}</p>
                  </div>
                </td>
              </tr>
            `;

          case "social_links":
            return `
              <tr>
                <td style="padding: 24px; text-align: center;">
                  <p style="margin: 0 0 12px 0; font-size: 13px; color: #a1a1aa;">Siga a Aperta Start nas redes sociais:</p>
                  <a href="https://instagram.com/apertastart.oficial" target="_blank" style="display: inline-block; margin: 0 8px; color: #eab308; font-weight: bold; text-decoration: none; font-size: 13px;">Instagram</a>
                  <a href="https://tiktok.com/@apertastart" target="_blank" style="display: inline-block; margin: 0 8px; color: #eab308; font-weight: bold; text-decoration: none; font-size: 13px;">TikTok</a>
                  <a href="https://wa.me/5511987654321" target="_blank" style="display: inline-block; margin: 0 8px; color: #22c55e; font-weight: bold; text-decoration: none; font-size: 13px;">WhatsApp</a>
                </td>
              </tr>
            `;

          case "footer":
            return `
              <tr>
                <td style="background-color: #09090b; padding: 24px; text-align: center; border-top: 1px solid #27272a; color: #71717a; font-size: 12px; line-height: 1.5;">
                  © 2026 ${replaceVars("{loja.nome}")}. Todos os direitos reservados.<br/>
                  Suporte: ${replaceVars("{loja.email}")} | ${replaceVars("{loja.whatsapp}")}
                </td>
              </tr>
            `;

          default:
            return "";
        }
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; max-width: 600px; width: 100%;">
                ${blocksHtml}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  },
};
