/**
 * Mode démo : toutes les données en mémoire, chargées depuis prisma/seed-data.json.
 * Sert aux présentations et aux tests sans base PostgreSQL (DATA_SOURCE=demo).
 * Les modifications sont perdues au redémarrage du serveur.
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { computeCart, DEFAULT_DISCOUNTS, DEFAULT_SETTINGS, orderRef, SEGMENT_COEFFICIENTS, type PricingSettings, type Segment, type VolumeDiscount } from '@fls/core';
import seed from '../../prisma/seed-data.json';
import type { AuditDTO, CustomerDTO, GridDTO, LeadDTO, MediaDTO, OrderDTO, PostDTO, ProductDTO, Repo, Role, StaffDTO, UniverseDTO } from './types';

type Seed = {
  universes: { slug: string; img: string; n: { fr: string; en: string }; d: { fr: string; en: string }; vol: { v: string; fr: string; en: string }; brands: [string, number][]; subs: [string, { fr: string; en: string }][] }[];
  products: { code: string; slug: string; nameFr: string; nameEn: string; brand: string; universe: string; sub: string; packFr: string; packEn: string; upc: number; cpp: number; base: number; stock: number; flag: string; sectors: string[]; allergens: string[]; halal: boolean; origin: string; vis: string | null }[];
  news: { slug: string; cat: string; date: string; img: string; prod?: string; t: { fr: string; en: string }; x: { fr: string; en: string } }[];
};
const S = seed as unknown as Seed;
const S_BODY = (seed as unknown as { newsBody: Record<string, { fr: string[]; en: string[] }> }).newsBody;
const IMG_ALIAS: Record<string, string> = { 'n-portail': 'u-superette', 'n-arrivage': 'u-boissons' };
const img = (k: string) => `/img/${IMG_ALIAS[k] ?? k}.webp`;
const NUTRI: Record<string, number[]> = { boissons: [42, 0, 10.5, 10.2, 0, 0.01], epicerie: [360, 1.5, 78, 0.4, 7, 0.02], frais: [95, 3.1, 13, 12.5, 3.6, 0.12], surgeles: [155, 6.5, 21, 0.5, 2.8, 0.4], conserves: [85, 0.5, 16, 10, 4, 1.2] };
let seq = 1000;
const id = (p: string) => `${p}_${(seq++).toString(36)}`;
const now = () => new Date().toISOString();

/** À incrémenter quand seed-data.json change : un état de démo plus ancien est alors reconstruit. */
const SEED_VERSION = '2026-10-14-logo';

interface State {
  seedVersion?: string;
  settings: PricingSettings; grids: GridDTO[]; discounts: VolumeDiscount[]; universes: UniverseDTO[]; products: ProductDTO[]; posts: PostDTO[];
  staff: (StaffDTO & { passwordHash: string })[]; customers: (CustomerDTO & { passwordHash: string | null })[]; orders: OrderDTO[];
  baskets: { id: string; customerId: string; name: string; lines: { code: string; qty: number }[] }[]; leads: LeadDTO[]; media: MediaDTO[]; audit: AuditDTO[];
}

function build(): State {
  const exclusive = new Set(S.universes.flatMap((u) => u.brands.filter((b) => b[1]).map((b) => b[0])));
  const products: ProductDTO[] = S.products.map((p) => {
    const n = NUTRI[p.universe] ?? NUTRI.conserves!;
    return {
      id: `p_${p.code}`, code: p.code, slug: p.slug, name: { fr: p.nameFr, en: p.nameEn }, description: null, brand: { name: p.brand, exclusive: exclusive.has(p.brand) },
      universe: p.universe, universes: [p.universe], subcategory: p.sub, pack: { fr: p.packFr, en: p.packEn }, unitsPerCase: p.upc, casesPerPallet: p.cpp, minOrderMultiple: 1,
      basePrice: p.base, stock: p.stock, origin: p.origin, halal: p.halal, allergens: p.allergens,
      nutrition: { energyKcal: n[0]!, fat: n[1]!, carbs: n[2]!, sugars: n[3]!, protein: n[4]!, salt: n[5]! }, image: p.vis ? `/img/p/p-${p.vis}.webp` : null, blocks: null,
      sectors: p.sectors, isNew: p.flag === 'new', isDeal: p.flag === 'deal', isFeatured: Boolean(p.flag) || ['UL-033', 'RZ-BR50', 'HU-T20', 'SG-F09'].includes(p.code), active: true,
    };
  });
  const universes: UniverseDTO[] = S.universes.map((u, i) => ({
    id: `u_${u.slug}`, slug: u.slug, name: u.n, desc: u.d, volume: { value: u.vol.v, label: { fr: u.vol.fr, en: u.vol.en } }, image: img(u.img), sort: i,
    subcategories: u.subs.map(([slug, name]) => ({ id: `s_${u.slug}_${slug}`, slug, name })),
    brands: [...new Set(products.filter((p) => p.universe === u.slug).map((p) => p.brand.name))].map((name) => ({ name, exclusive: exclusive.has(name) })).sort((a, b) => Number(b.exclusive) - Number(a.exclusive)),
  }));
  const posts: PostDTO[] = S.news.map((n) => ({
    id: `n_${n.slug}`, slug: n.slug, category: n.cat, title: n.t, excerpt: n.x, cover: img(n.img), status: 'PUBLISHED', publishedAt: `${n.date}T09:00:00.000Z`,
    featuredProductCode: n.prod ?? null, showOnHome: true, universes: [], blocks: [{ type: 'text', data: { html: (S_BODY[n.cat]?.fr ?? []).map((x) => `<p>${x}</p>`).join(''), htmlEn: (S_BODY[n.cat]?.en ?? []).map((x) => `<p>${x}</p>`).join('') } }],
  }));
  const staffHash = bcrypt.hashSync('FlsAdmin2026!', 8);
  const demoHash = bcrypt.hashSync('Demo2026!', 8);
  const staff = ([['admin@fls.sn', 'Administrateur FLS', 'ADMIN'], ['commercial@fls.sn', 'Aïssatou N.', 'COMMERCIAL'], ['editeur@fls.sn', 'Éditeur contenus', 'EDITOR']] as [string, string, Role][])
    .map(([email, name, role]) => ({ id: `st_${role}`, email, name, role, active: true, lastLoginAt: null, passwordHash: staffHash }));
  const cust = (email: string, companyName: string, contactName: string, city: string, segment: Segment, creditLimit: number, status: CustomerDTO['status'] = 'APPROVED', ninea: string | null = null, rccm: string | null = null) =>
    ({ id: `c_${segment}${status === 'PENDING' ? '_p' : ''}`, email, companyName, contactName, phone: '77 000 00 00', city, segment, status, ninea, rccm, creditLimit, salesRep: 'Aïssatou N.', createdAt: '2024-03-01T10:00:00.000Z', documents: [], passwordHash: status === 'APPROVED' ? demoHash : null });
  const customers = [
    cust('grossiste@demo.fls.sn', 'Établissements Diop & Frères', 'Moustapha Diop', 'Touba', 'GROSSISTE', 6_000_000, 'APPROVED', '0045678 2G3', 'SN-DBL-2015-B-00421'),
    cust('demi@demo.fls.sn', 'Supérette Keur Yaye', 'Yaye Fatou Ndiaye', 'Mermoz, Dakar', 'DEMI_GROSSISTE', 2_500_000, 'APPROVED', '0067812 2C1', 'SN-DKR-2019-B-12345'),
    cust('chr@demo.fls.sn', 'Le Comptoir Fast-Food', 'Ibrahima Sarr', 'Plateau, Dakar', 'CHR', 1_500_000, 'APPROVED', '0071234 2B2', 'SN-DKR-2021-B-04567'),
    cust('b2c@demo.fls.sn', 'Client particulier', 'Awa Fall', 'Dakar', 'B2C', 0),
    cust('nouveau@demo.fls.sn', 'Boutique Serigne Fallou', 'Cheikh Mbacké', 'Kaolack', 'DEMI_GROSSISTE', 0, 'PENDING', '0089911 2A1', 'SN-KLK-2024-A-00098'),
  ];
  const basketDefs: Record<string, { name: string; lines: { code: string; qty: number }[] }[]> = {
    CHR: [{ name: 'Hebdo fast-food', lines: [{ code: 'HU-T20', qty: 2 }, { code: 'SG-F09', qty: 8 }, { code: 'CO-MY5', qty: 2 }, { code: 'CO-KE5', qty: 2 }, { code: 'EM-B500', qty: 1 }] }, { name: 'Boissons du week-end', lines: [{ code: 'UL-033', qty: 10 }, { code: 'EA-050', qty: 6 }] }],
    DEMI_GROSSISTE: [{ name: 'Réassort du lundi', lines: [{ code: 'UL-033', qty: 10 }, { code: 'CO-TC07', qty: 6 }, { code: 'PA-SP5', qty: 5 }, { code: 'EA-150', qty: 10 }, { code: 'SU-PO50', qty: 2 }] }],
    GROSSISTE: [{ name: 'Camion mensuel', lines: [{ code: 'RZ-BR50', qty: 40 }, { code: 'SU-PO50', qty: 20 }, { code: 'HU-T05', qty: 30 }, { code: 'FA-T55', qty: 20 }] }],
  };
  const baskets: State['baskets'] = []; const orders: OrderDTO[] = [];
  const statuses = ['PREPARING', 'DELIVERED', 'DELIVERED', 'DELIVERED'] as const;
  Object.entries(basketDefs).forEach(([seg, list], si) => {
    const c = customers.find((x) => x.segment === seg && x.status === 'APPROVED')!;
    list.forEach((b) => baskets.push({ id: id('b'), customerId: c.id, ...b }));
    for (let k = 0; k < 4; k++) {
      const lines = list[k % list.length]!.lines.map((l) => { const p = products.find((x) => x.code === l.code)!; const unit = Math.round((p.basePrice * SEGMENT_COEFFICIENTS[seg as Segment]) / 5) * 5; return { code: l.code, name: p.name.fr, qty: l.qty, unitPrice: unit, total: unit * l.qty }; });
      const subtotal = lines.reduce((s, l) => s + l.total, 0); const shipping = subtotal < 250000 ? 15000 : 0; const vat = Math.round((subtotal + shipping) * 0.18);
      const created = new Date(Date.now() - (k * 7 + 2) * 86400000); const ref = `BC-2026-${48213 - k * 517 - si * 31}`;
      orders.push({ id: id('o'), ref, customerId: c.id, customerName: c.companyName, status: statuses[k]!, subtotal, shipping, vat, total: subtotal + shipping + vat, createdAt: created.toISOString(), lines,
        invoice: { ref: ref.replace('BC', 'FA'), amount: subtotal + shipping + vat, dueDate: new Date(created.getTime() + 30 * 86400000).toISOString(), paidAt: k === 0 ? null : created.toISOString() } });
    }
  });
  const lead = (type: LeadDTO['type'], company: string, name: string, phone: string, city: string, message: string): LeadDTO => ({ id: id('l'), type, status: 'NEW', company, name, phone, email: null, city, message, payload: null, createdAt: now() });
  return {
    seedVersion: SEED_VERSION,
    settings: { ...DEFAULT_SETTINGS, b2cEnabled: true }, discounts: [...DEFAULT_DISCOUNTS],
    grids: [{ segment: 'GROSSISTE', label: 'Grossiste', coefficient: 0.88 }, { segment: 'DEMI_GROSSISTE', label: 'Demi-grossiste / supérette', coefficient: 0.94 }, { segment: 'CHR', label: 'Restaurant / fast-food (CHR)', coefficient: 1 }, { segment: 'B2C', label: 'Grand public', coefficient: 1 }],
    universes, products, posts, staff, customers, orders, baskets, media: [], audit: [],
    leads: [lead('QUOTE', 'Hôtel Téranga Plage', 'Mariama Ba', '77 222 33 44', 'Saly', '2 palettes d’eau minérale et 20 cartons de jus par mois.'), lead('TURNKEY', 'Promoteur Résidence Les Almadies', 'Ousmane Fall', '78 333 44 55', 'Dakar', 'Supérette de 120 m² au rez-de-chaussée, ouverture prévue en mars.'), lead('ADVICE', 'Chez Fatou Grill', 'Fatou Diallo', '76 444 55 66', 'Thiès', 'Revoir la carte et le coût matière des menus.')],
  };
}

const g = globalThis as unknown as { __flsDemo?: State; __flsDemoAt?: number };
/**
 * Le site et le back-office tournent dans deux processus : en mode démo, l'état est partagé
 * via un fichier JSON (DEMO_STATE_FILE, par défaut storage/demo-state.json à la racine du dépôt).
 */
const FILE = process.env.DEMO_STATE_FILE || resolve(process.cwd(), '..', '..', 'storage', 'demo-state.json');
function sync() {
  try {
    const m = statSync(FILE).mtimeMs;
    if (!g.__flsDemo || (g.__flsDemoAt ?? 0) < m) {
      const saved = JSON.parse(readFileSync(FILE, 'utf8')) as State;
      if (saved.seedVersion !== SEED_VERSION) { g.__flsDemo = build(); persist(); return; } // catalogue mis à jour : on repart des nouvelles données
      g.__flsDemo = saved; g.__flsDemoAt = m;
    }
  } catch { /* pas encore de fichier : état initial */ }
}
function persist() {
  try { mkdirSync(dirname(FILE), { recursive: true }); writeFileSync(FILE, JSON.stringify(g.__flsDemo)); g.__flsDemoAt = statSync(FILE).mtimeMs; } catch { /* lecture seule : état en mémoire uniquement */ }
}
const st = (): State => { if (!g.__flsDemo) { g.__flsDemo = build(); persist(); } return g.__flsDemo; };
const MUTATING = new Set(['placeOrder', 'createLead', 'requestAccount', 'saveStaff', 'touchStaffLogin', 'setCustomerStatus', 'setCustomerPassword', 'setOrderStatus', 'setLeadStatus', 'saveProduct', 'saveGrids', 'saveDiscounts', 'savePost', 'addMedia', 'audit', 'saveSettings']);
const clone = <T>(v: T): T => structuredClone(v);
const strip = <T extends { passwordHash?: unknown }>(o: T) => { const { passwordHash: _p, ...rest } = o; return rest; };

export function createDemoRepo(): Repo {
  const repo: Repo = {
    kind: 'demo',
    settings: async () => clone(st().settings),
    grids: async () => clone(st().grids),
    discounts: async () => clone(st().discounts),
    universes: async () => clone(st().universes),
    universe: async (slug) => clone(st().universes.find((u) => u.slug === slug) ?? null),
    products: async (f = {}) => {
      const q = f.q?.toLowerCase();
      return clone(st().products.filter((p) => (f.includeInactive || p.active) && (!f.universe || p.universes.includes(f.universe)) && (!f.inStock || p.stock > 0) && (!f.featured || p.isFeatured) && (!f.codes || f.codes.includes(p.code)) && (!q || `${p.code} ${p.name.fr} ${p.name.en} ${p.brand.name}`.toLowerCase().includes(q))));
    },
    product: async (key) => clone(st().products.find((p) => p.slug === key || p.code === key) ?? null),
    posts: async (f = {}) => clone(st().posts.filter((p) => (f.includeDrafts || p.status === 'PUBLISHED') && (!f.category || p.category === f.category) && (!f.home || p.showOnHome)).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))),
    post: async (slug) => clone(st().posts.find((p) => p.slug === slug) ?? null),
    customerAuth: async (email) => { const c = st().customers.find((x) => x.email === email.toLowerCase()); return c ? { id: c.id, email: c.email, name: c.contactName, passwordHash: c.passwordHash, segment: c.segment, status: c.status, companyName: c.companyName } : null; },
    customer: async (cid) => { const c = st().customers.find((x) => x.id === cid); return c ? clone(strip(c)) : null; },
    orders: async (cid) => clone(st().orders.filter((o) => !cid || o.customerId === cid).sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    baskets: async (cid) => clone(st().baskets.filter((b) => b.customerId === cid)),
    placeOrder: async (cid, lines) => {
      const s = st(); const c = s.customers.find((x) => x.id === cid);
      if (!c || c.status !== 'APPROVED') throw new Error('Compte non validé');
      const coef = s.grids.find((x) => x.segment === c.segment)?.coefficient ?? 1;
      const totals = computeCart(lines, new Map(s.products.map((p) => [p.code, p])), { segment: c.segment, coefficient: coef, discounts: s.discounts, settings: s.settings });
      if (!totals.lines.length) throw new Error('Panier vide');
      for (const l of totals.lines) { const p = s.products.find((x) => x.code === l.code)!; const need = c.segment === 'B2C' ? Math.ceil(l.qty / p.unitsPerCase) : l.qty; if (p.stock < need) throw new Error(`Stock insuffisant : ${p.code}`); p.stock -= need; }
      const ref = orderRef();
      const o: OrderDTO = { id: id('o'), ref, customerId: cid, customerName: c.companyName, status: 'RECEIVED', subtotal: totals.subtotal, shipping: totals.shipping, vat: totals.vat, total: totals.totalTTC, createdAt: now(),
        lines: totals.lines.map((l) => ({ code: l.code, name: s.products.find((p) => p.code === l.code)!.name.fr, qty: l.qty, unitPrice: l.unitPrice, total: l.total })),
        invoice: { ref: ref.replace('BC', 'FA'), amount: totals.totalTTC, dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), paidAt: null } };
      s.orders.unshift(o); return clone(o);
    },
    createLead: async (input) => { const l: LeadDTO = { id: id('l'), type: input.type, status: 'NEW', company: input.company ?? null, name: input.name ?? null, phone: input.phone ?? null, email: input.email ?? null, city: input.city ?? null, message: input.message ?? null, payload: input.payload ?? null, createdAt: now() }; st().leads.unshift(l); return clone(l); },
    requestAccount: async (input) => {
      const s = st(); if (s.customers.some((c) => c.email === input.email.toLowerCase())) throw new Error('Un compte existe déjà avec cet e-mail');
      const c = { id: id('c'), email: input.email.toLowerCase(), companyName: input.companyName, contactName: input.contactName, phone: input.phone, city: input.city, segment: input.segment, status: 'PENDING' as const, ninea: input.ninea, rccm: input.rccm, creditLimit: 0, salesRep: null, createdAt: now(), documents: input.documents.map((d) => ({ kind: d.kind, url: d.url, filename: d.filename })), passwordHash: null };
      s.customers.unshift(c); await repo.createLead({ type: 'ACCOUNT', company: input.companyName, name: input.contactName, phone: input.phone, email: input.email, city: input.city, payload: input.payload });
      return clone(strip(c));
    },
    staffAuth: async (email) => { const s = st().staff.find((x) => x.email === email.toLowerCase()); return s ? { id: s.id, email: s.email, name: s.name, passwordHash: s.passwordHash, role: s.role, active: s.active } : null; },
    staff: async () => st().staff.map((s) => clone(strip(s))),
    saveStaff: async ({ id: sid, passwordHash, ...rest }) => {
      const s = st(); let row = sid ? s.staff.find((x) => x.id === sid) : undefined;
      if (row) Object.assign(row, rest, passwordHash ? { passwordHash } : {}); else { row = { id: id('st'), lastLoginAt: null, passwordHash: passwordHash ?? '', ...rest, email: rest.email.toLowerCase() }; s.staff.push(row); }
      return clone(strip(row));
    },
    touchStaffLogin: async (sid) => { const r = st().staff.find((x) => x.id === sid); if (r) r.lastLoginAt = now(); },
    customers: async (f = {}) => st().customers.filter((c) => !f.status || c.status === f.status).map((c) => clone(strip(c))),
    setCustomerStatus: async (cid, status, _staff, segment, creditLimit) => {
      const c = st().customers.find((x) => x.id === cid); if (!c) throw new Error('Client introuvable');
      c.status = status; if (segment) c.segment = segment; if (creditLimit != null) c.creditLimit = creditLimit;
      return clone(strip(c));
    },
    setCustomerPassword: async (cid, hash) => { const c = st().customers.find((x) => x.id === cid); if (!c) throw new Error('Client introuvable'); c.passwordHash = hash; },
    setOrderStatus: async (oid, status) => { const o = st().orders.find((x) => x.id === oid); if (!o) throw new Error('Commande introuvable'); o.status = status; return clone(o); },
    leads: async (f = {}) => clone(st().leads.filter((l) => (!f.type || l.type === f.type) && (!f.status || l.status === f.status))),
    setLeadStatus: async (lid, status) => { const l = st().leads.find((x) => x.id === lid); if (!l) throw new Error('Demande introuvable'); l.status = status; return clone(l); },
    saveProduct: async (input) => {
      const s = st(); const existing = input.id ? s.products.find((p) => p.id === input.id) : undefined;
      const exclusive = s.universes.some((u) => u.brands.some((b) => b.name === input.brand && b.exclusive));
      const p: ProductDTO = {
        id: existing?.id ?? id('p'), code: input.code, slug: input.slug, name: { fr: input.nameFr, en: input.nameEn },
        description: input.descriptionFr ? { fr: input.descriptionFr, en: input.descriptionEn || input.descriptionFr } : null, brand: { name: input.brand, exclusive },
        universe: input.universes[0] ?? '', universes: input.universes, subcategory: input.subcategory ?? null, pack: { fr: input.packFr, en: input.packEn },
        unitsPerCase: input.unitsPerCase, casesPerPallet: input.casesPerPallet, minOrderMultiple: input.minOrderMultiple, basePrice: input.basePrice, stock: input.stock,
        origin: input.origin ?? null, halal: input.halal, allergens: input.allergens, nutrition: existing?.nutrition ?? null, image: input.image ?? null, blocks: input.blocks ?? null,
        sectors: existing?.sectors ?? [], isNew: input.isNew, isDeal: input.isDeal, isFeatured: input.isFeatured, active: input.active,
      };
      if (existing) Object.assign(existing, p); else s.products.push(p);
      return clone(p);
    },
    saveGrids: async (grids) => { st().grids = clone(grids); },
    saveDiscounts: async (d) => { st().discounts = clone(d); },
    savePost: async (input) => {
      const s = st(); const existing = input.id ? s.posts.find((p) => p.id === input.id) : undefined;
      const p: PostDTO = { id: existing?.id ?? id('n'), slug: input.slug, category: input.category, title: { fr: input.titleFr, en: input.titleEn }, excerpt: { fr: input.excerptFr, en: input.excerptEn },
        blocks: input.blocks, cover: input.cover ?? null, status: input.status, publishedAt: input.status === 'PUBLISHED' ? existing?.publishedAt ?? now() : null,
        featuredProductCode: input.featuredProductCode ?? null, showOnHome: input.showOnHome, universes: input.universes };
      if (existing) Object.assign(existing, p); else s.posts.unshift(p);
      return clone(p);
    },
    media: async () => clone(st().media),
    addMedia: async (m) => { const row: MediaDTO = { ...m, id: id('m'), createdAt: now() }; st().media.unshift(row); return clone(row); },
    auditLog: async (limit = 200) => clone(st().audit.slice(0, limit)),
    audit: async (e) => { st().audit.unshift({ id: id('a'), actorEmail: e.actorEmail, action: e.action, entity: e.entity, entityId: e.entityId ?? null, details: e.details ?? null, createdAt: now() }); },
    saveSettings: async (patch) => { const s = st(); s.settings = { ...s.settings, ...patch }; return clone(s.settings); },
    stats: async () => {
      const s = st(); const since = Date.now() - 30 * 86400000;
      return { pendingAccounts: s.customers.filter((c) => c.status === 'PENDING').length, newLeads: s.leads.filter((l) => l.status === 'NEW').length,
        openOrders: s.orders.filter((o) => ['RECEIVED', 'PREPARING', 'SHIPPED'].includes(o.status)).length, products: s.products.filter((p) => p.active).length,
        lowStock: s.products.filter((p) => p.active && p.stock < 60).length, revenue30d: s.orders.filter((o) => Date.parse(o.createdAt) >= since).reduce((t, o) => t + o.total, 0) };
    },
  };
  // Synchronisation avec le fichier partagé avant chaque lecture, écriture après chaque modification.
  const wrapped = {} as Record<string, unknown>;
  for (const [k, v] of Object.entries(repo)) {
    wrapped[k] = typeof v !== 'function' ? v : async (...args: unknown[]) => { sync(); const r = await (v as (...a: unknown[]) => Promise<unknown>)(...args); if (MUTATING.has(k)) persist(); return r; };
  }
  return wrapped as unknown as Repo;
}
