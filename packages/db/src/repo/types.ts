import type { PricingSettings, Segment, VolumeDiscount, CartLine, OrderStatus } from '@fls/core';

export type L10n = { fr: string; en: string };
export type Role = 'ADMIN' | 'COMMERCIAL' | 'EDITOR';
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type LeadType = 'ACCOUNT' | 'QUOTE' | 'TURNKEY' | 'ADVICE' | 'KEY_ACCOUNT' | 'CONTACT' | 'APPLICATION' | 'NEWSLETTER';
export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';

export interface UniverseDTO {
  id: string; slug: string; name: L10n; desc: L10n; volume: { value: string; label: L10n }; image: string | null; sort: number;
  subcategories: { id: string; slug: string; name: L10n }[];
  brands: { name: string; exclusive: boolean }[];
}

export interface ProductDTO {
  id: string; code: string; slug: string; name: L10n; description: L10n | null; brand: { name: string; exclusive: boolean };
  universe: string; universes: string[]; subcategory: string | null; pack: L10n;
  unitsPerCase: number; casesPerPallet: number; minOrderMultiple: number; basePrice: number; stock: number;
  origin: string | null; halal: boolean; allergens: string[]; nutrition: Record<string, number> | null; image: string | null;
  blocks: Block[] | null; sectors: string[]; isNew: boolean; isDeal: boolean; isFeatured: boolean; active: boolean;
}

export type Block =
  | { type: 'text'; data: { html: string; htmlEn?: string } }
  | { type: 'image'; data: { url: string; alt?: string; caption?: string } }
  | { type: 'gallery'; data: { images: { url: string; alt?: string }[] } }
  | { type: 'video'; data: { url: string; title?: string } }
  | { type: 'nutrition'; data: { rows: { label: string; value: string }[] } }
  | { type: 'allergens'; data: { list: string[] } }
  | { type: 'file'; data: { url: string; label: string } }
  | { type: 'product'; data: { code: string } };

export interface PostDTO {
  id: string; slug: string; category: string; title: L10n; excerpt: L10n; blocks: Block[]; cover: string | null;
  status: 'DRAFT' | 'PUBLISHED'; publishedAt: string | null; featuredProductCode: string | null; showOnHome: boolean; universes: string[];
}

export interface CustomerDTO {
  id: string; email: string; companyName: string; contactName: string; phone: string; city: string; segment: Segment;
  status: AccountStatus; ninea: string | null; rccm: string | null; creditLimit: number; salesRep: string | null; createdAt: string;
  documents?: { kind: string; url: string; filename: string }[];
}

export interface OrderDTO {
  id: string; ref: string; customerId: string; customerName?: string; status: OrderStatus; subtotal: number; shipping: number; vat: number; total: number; createdAt: string;
  lines: { code: string; name: string; qty: number; unitPrice: number; total: number }[];
  invoice: { ref: string; amount: number; dueDate: string; paidAt: string | null } | null;
}

export interface LeadDTO { id: string; type: LeadType; status: LeadStatus; company: string | null; name: string | null; phone: string | null; email: string | null; city: string | null; message: string | null; payload: unknown; createdAt: string }
export interface StaffDTO { id: string; email: string; name: string; role: Role; active: boolean; lastLoginAt: string | null }
export interface MediaDTO { id: string; filename: string; url: string; mime: string; width: number | null; height: number | null; size: number; alt: string | null; createdAt: string }
export interface AuditDTO { id: string; actorEmail: string; action: string; entity: string; entityId: string | null; details: unknown; createdAt: string }
export interface GridDTO { segment: Segment; label: string; coefficient: number }

export interface ProductInput {
  id?: string; code: string; slug: string; nameFr: string; nameEn: string; descriptionFr?: string; descriptionEn?: string; brand: string;
  universes: string[]; subcategory?: string | null; packFr: string; packEn: string; unitsPerCase: number; casesPerPallet: number; minOrderMultiple: number;
  basePrice: number; stock: number; origin?: string; halal: boolean; allergens: string[]; image?: string | null; blocks?: Block[];
  isNew: boolean; isDeal: boolean; isFeatured: boolean; active: boolean;
}
export interface PostInput {
  id?: string; slug: string; category: string; titleFr: string; titleEn: string; excerptFr: string; excerptEn: string; blocks: Block[]; cover?: string | null;
  status: 'DRAFT' | 'PUBLISHED'; featuredProductCode?: string | null; showOnHome: boolean; universes: string[];
}

export interface AuthUser { id: string; email: string; name: string; passwordHash: string | null }

/** Accès aux données : implémenté pour PostgreSQL (Prisma) et pour le mode démo (mémoire). */
export interface Repo {
  kind: 'prisma' | 'demo';
  // Lecture publique
  settings(): Promise<PricingSettings>;
  grids(): Promise<GridDTO[]>;
  discounts(): Promise<VolumeDiscount[]>;
  universes(): Promise<UniverseDTO[]>;
  universe(slug: string): Promise<UniverseDTO | null>;
  products(f?: { universe?: string; q?: string; inStock?: boolean; featured?: boolean; codes?: string[]; includeInactive?: boolean }): Promise<ProductDTO[]>;
  product(slugOrCode: string): Promise<ProductDTO | null>;
  posts(f?: { category?: string; home?: boolean; includeDrafts?: boolean }): Promise<PostDTO[]>;
  post(slug: string): Promise<PostDTO | null>;
  // Clients
  customerAuth(email: string): Promise<(AuthUser & { segment: Segment; status: AccountStatus; companyName: string }) | null>;
  customer(id: string): Promise<CustomerDTO | null>;
  orders(customerId?: string): Promise<OrderDTO[]>;
  baskets(customerId: string): Promise<{ id: string; name: string; lines: CartLine[] }[]>;
  placeOrder(customerId: string, lines: CartLine[]): Promise<OrderDTO>;
  createLead(input: { type: LeadType; company?: string; name?: string; phone?: string; email?: string; city?: string; message?: string; payload?: unknown }): Promise<LeadDTO>;
  requestAccount(input: { email: string; companyName: string; contactName: string; phone: string; city: string; segment: Segment; ninea: string; rccm: string; documents: { kind: 'NINEA' | 'RCCM' | 'OTHER'; filename: string; url: string; mime: string; size: number }[]; payload?: unknown }): Promise<CustomerDTO>;
  // Back-office
  staffAuth(email: string): Promise<(AuthUser & { role: Role; active: boolean }) | null>;
  staff(): Promise<StaffDTO[]>;
  saveStaff(input: { id?: string; email: string; name: string; role: Role; active: boolean; passwordHash?: string }): Promise<StaffDTO>;
  touchStaffLogin(id: string): Promise<void>;
  customers(f?: { status?: AccountStatus }): Promise<CustomerDTO[]>;
  setCustomerStatus(id: string, status: AccountStatus, staffId: string, segment?: Segment, creditLimit?: number): Promise<CustomerDTO>;
  setCustomerPassword(id: string, passwordHash: string): Promise<void>;
  setOrderStatus(id: string, status: OrderStatus): Promise<OrderDTO>;
  leads(f?: { type?: LeadType; status?: LeadStatus }): Promise<LeadDTO[]>;
  setLeadStatus(id: string, status: LeadStatus): Promise<LeadDTO>;
  saveProduct(input: ProductInput): Promise<ProductDTO>;
  saveGrids(grids: GridDTO[]): Promise<void>;
  saveDiscounts(discounts: VolumeDiscount[]): Promise<void>;
  savePost(input: PostInput): Promise<PostDTO>;
  media(): Promise<MediaDTO[]>;
  addMedia(input: Omit<MediaDTO, 'id' | 'createdAt'>): Promise<MediaDTO>;
  auditLog(limit?: number): Promise<AuditDTO[]>;
  audit(entry: { actorId?: string | null; actorEmail: string; action: string; entity: string; entityId?: string | null; details?: unknown }): Promise<void>;
  saveSettings(s: Partial<PricingSettings>): Promise<PricingSettings>;
  stats(): Promise<{ pendingAccounts: number; newLeads: number; openOrders: number; products: number; lowStock: number; revenue30d: number }>;
}
