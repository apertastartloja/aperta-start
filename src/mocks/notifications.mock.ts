import type { AdminNotification } from "@/types";

export const mockNotifications: AdminNotification[] = [
  {
    id: "notif-1",
    type: "order_created",
    category: "orders",
    priority: "high",
    title: "Novo Pedido Realizado #APS-849201",
    message: "Cliente Cristiano Alves realizou um novo pedido de R$ 264,70 via PIX.",
    linkHref: "/painel/admin/pedidos",
    read: false,
    metadata: { orderId: "ord-1", customerName: "Cristiano Alves", amount: 264.7 },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 min ago
  },
  {
    id: "notif-2",
    type: "low_stock",
    category: "inventory",
    priority: "critical",
    title: "Alerta de Estoque Esgotado: Action Figure Mario 3D",
    message: "O produto 'Action Figure Mario 3D 20cm' atingiu 0 unidades no estoque.",
    linkHref: "/painel/admin/estoque",
    read: false,
    metadata: { productId: "prd-6", stock: 0 },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
  },
  {
    id: "notif-3",
    type: "payment_confirmed",
    category: "financial",
    priority: "high",
    title: "Pagamento Confirmado via Mercado Pago",
    message: "Pagamento do pedido #APS-739102 confirmado com sucesso no gateway.",
    linkHref: "/painel/admin/pedidos",
    read: false,
    metadata: { orderId: "ord-2", paymentMethod: "pix" },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: "notif-4",
    type: "supplier_lead_time",
    category: "suppliers",
    priority: "medium",
    title: "Prazo de Reabastecimento Excedido",
    message: "Fornecedor 'Hero 3D Studio' ultrapassou o prazo médio de 3 dias no lote #LT-401.",
    linkHref: "/painel/admin/fornecedores",
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    metadata: { supplierId: "sup-1" },
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
  },
  {
    id: "notif-5",
    type: "email_sent_failed",
    category: "system",
    priority: "high",
    title: "Falha no Envio de E-mail de Rastreio (Resend)",
    message: "Não foi possível enviar o e-mail de código de rastreamento para rodrigo@exemplo.com.",
    linkHref: "/painel/admin/emails",
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    metadata: { recipient: "rodrigo@exemplo.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
  },
  {
    id: "notif-6",
    type: "delivery_shipped",
    category: "deliveries",
    priority: "low",
    title: "Etiqueta SEDEX Gerada com Sucesso",
    message: "Etiqueta Melhor Envio gerada para o pedido #APS-918231.",
    linkHref: "/painel/admin/entregas",
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
  },
];
