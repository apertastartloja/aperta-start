/**
 * Contratos de domínio da Aperta Start.
 * Estes tipos são a fronteira entre UI e camada de dados (mocks hoje, Supabase depois).
 */

export type ID = string;

export type ISODate = string;

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: ID | null;
  order?: number;
  featured?: boolean;
}

export type ProductBadgeType = "new" | "sale" | "bestseller" | "exclusive" | "outOfStock";

export interface ProductVariant {
  id: ID;
  name: string;
  value: string;
  stock: number;
  priceDiff?: number;
}

export interface ProductImage {
  id: ID;
  url: string;
  alt: string;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: ID;
  collectionIds: ID[];
  images: ProductImage[];
  badges: ProductBadgeType[];
  rating: number;
  reviewsCount: number;
  stock: number;
  variants?: ProductVariant[];
  tags: string[];
  status?: "active" | "draft" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  /** IDs de produtos manuamente relacionados */
  relatedProductIds?: ID[];
  /** ID do produto para Order Bump exibido no mini-carrinho */
  orderBumpProductId?: ID | null;
  /** Mensagem personalizada do Order Bump (ex: "Adicione por apenas +R$ 29,90") */
  orderBumpMessage?: string;
  /** Especificações técnicas em pares chave→valor */
  specs?: ProductSpec[];
  /** Peso em kg para cálculo de frete */
  shippingWeight?: number;
  /** Comprimento em cm para cálculo de frete */
  shippingLength?: number;
  /** Largura em cm para cálculo de frete */
  shippingWidth?: number;
  /** Altura em cm para cálculo de frete */
  shippingHeight?: number;
  /** ID do Fornecedor vinculado ao produto */
  supplierId?: ID;
  /** Preço de custo / aquisição R$ */
  costPrice?: number;
  createdAt: ISODate;
}

export type SupplierStatus = "active" | "inactive" | "suspended";

export interface Supplier {
  id: ID;
  name: string; // Nome Fantasia
  companyName?: string; // Razão Social
  cpfCnpj?: string;
  contactName?: string; // Nome do contato comercial
  email: string;
  phone?: string;
  whatsapp?: string;
  productCategories?: string[]; // Ex: ["Impressão 3D", "Videogames", "Acessórios Gamer"]
  leadTimeDays?: number; // Prazo médio em dias
  status: SupplierStatus;
  notes?: string;
  createdAt: ISODate;
  updatedAt?: ISODate;
}

export type NotificationCategory =
  | "orders"
  | "inventory"
  | "suppliers"
  | "deliveries"
  | "financial"
  | "emails"
  | "system"
  | "marketing";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface AdminNotification {
  id: ID;
  type: string; // ex: 'order_created', 'low_stock', 'payment_confirmed', 'email_failed'
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  linkHref?: string; // ex: '/painel/admin/pedidos?id=ord-123'
  read: boolean;
  readAt?: ISODate | null;
  metadata?: Record<string, any>;
  createdAt: ISODate;
}

export interface Collection {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productIds: ID[];
}

export interface Kit {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productIds: ID[];
  price: number;
  compareAtPrice?: number | null;
}

export interface Banner {
  id: ID;
  title: string;
  highlightText?: string;
  subtitle?: string;
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
  placement: "hero" | "strip" | "category" | "sidebar";
  order: number;
  active: boolean;
}

export type CouponDiscountType = "percentage" | "fixed";

export interface Coupon {
  id: ID;
  code: string;
  type: CouponDiscountType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: ISODate;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  createdAt: ISODate;
}

export interface Testimonial {
  id: ID;
  author: string;
  role?: string;
  avatar?: string;
  rating: number;
  content: string;
  createdAt: ISODate;
}

export interface Address {
  id: ID;
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  createdAt: ISODate;
}

export interface CartItem {
  id: ID;
  productId: ID;
  variantId?: ID;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: ID;
  items: CartItem[];
  couponCode?: string | null;
  updatedAt: ISODate;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemsCount: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

export interface OrderItem extends CartItem {
  productName: string;
  productImage: string;
}

export interface Order {
  id: ID;
  code: string;
  userId: ID;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  createdAt: ISODate;
  shippingAddress: Address;
  trackingCode?: string;
  carrier?: string;
  paymentMethod?: "pix" | "card" | "boleto";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface WishlistItem {
  id: ID;
  productId: ID;
  addedAt: ISODate;
}

export interface Wishlist {
  id: ID;
  userId: ID | null;
  items: WishlistItem[];
}

/** Filtros/paginação usados por todos os services. */
export interface ProductQuery {
  search?: string;
  categorySlug?: string;
  collectionSlug?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevance" | "priceAsc" | "priceDesc" | "newest" | "rating";
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/** Conteúdo editorial da Home. */
export type IconName =
  | "package"
  | "trophy"
  | "shield"
  | "lock"
  | "truck"
  | "creditCard"
  | "pix"
  | "refresh";

export interface Benefit {
  id: ID;
  icon: IconName;
  title: string;
  description: string;
}

export interface InstitutionalItem {
  id: ID;
  icon: IconName;
  title: string;
  description: string;
}

export interface NewsletterContent {
  title: string;
  subtitle: string;
  placeholder: string;
  ctaLabel: string;
}
