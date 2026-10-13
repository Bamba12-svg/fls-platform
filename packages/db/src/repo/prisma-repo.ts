import { computeCart, DEFAULT_SETTINGS, orderRef, SEGMENT_COEFFICIENTS, type PricingContext, type PricingSettings, type Segment, type VolumeDiscount } from '@fls/core';
import { Prisma, type PrismaClient } from '@prisma/client';
import type { Block, CustomerDTO, LeadDTO, OrderDTO, PostDTO, ProductDTO, Repo, UniverseDTO } from './types';

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

const productInclude = { brand: true, subcategory: true, universes: { include: { universe: true } } } satisfies Prisma.ProductInclude;
type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;
const toProduct = (p: ProductRow): ProductDTO => {
  const unis = p.universes.map((u) => u.universe).sort((a, b) => a.sort - b.sort);
  return {
    id: p.id, code: p.code, slug: p.slug, name: { fr: p.nameFr, en: p.nameEn },
    description: p.descriptionFr ? { fr: p.descriptionFr, en: p.descriptionEn ?? p.descriptionFr } : null,
    brand: { name: p.brand.name, exclusive: p.brand.exclusive }, universe: unis[0]?.slug ?? '', universes: unis.map((u) => u.slug),
    subcategory: p.subcategory?.slug ?? null, pack: { fr: p.packFr, en: p.packEn }, unitsPerCase: p.unitsPerCase, casesPerPallet: p.casesPerPallet,
    minOrderMultiple: p.minOrderMultiple, basePrice: p.basePrice, stock: p.stock, origin: p.origin, halal: p.halal, allergens: p.allergens,
    nutrition: (p.nutrition as Record<string, number> | null) ?? null, image: p.image, blocks: (p.blocks as Block[] | null) ?? null, sectors: p.sectors,
    isNew: p.isNew, isDeal: p.isDeal, isFeatured: p.isFeatured, active: p.active,
  };
};

const postInclude = { featuredProduct: true, universes: { include: { universe: true } } } satisfies Prisma.PostInclude;
type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;
const toPost = (p: PostRow): PostDTO => ({
  id: p.id, slug: p.slug, category: p.category, title: { fr: p.titleFr, en: p.titleEn }, excerpt: { fr: p.excerptFr, en: p.excerptEn },
  blocks: (p.blocks as Block[]) ?? [], cover: p.cover, status: p.status, publishedAt: iso(p.publishedAt),
  featuredProductCode: p.featuredProduct?.code ?? null, showOnHome: p.showOnHome, universes: p.universes.map((u) => u.universe.slug),
});

type OrderRow = Prisma.OrderGetPayload<{ include: { lines: true; invoice: true; customer: true } }>;
const toOrder = (o: OrderRow): OrderDTO => ({
  id: o.id, ref: o.ref, customerId: o.customerId, customerName: o.customer.companyName, status: o.status, subtotal: o.subtotal, shipping: o.shipping,
  vat: o.vat, total: o.total, createdAt: o.createdAt.toISOString(),
  lines: o.lines.map((l) => ({ code: l.code, name: l.name, qty: l.qty, unitPrice: l.unitPrice, total: l.total })),
  invoice: o.invoice ? { ref: o.invoice.ref, amount: o.invoice.amount, dueDate: o.invoice.dueDate.toISOString(), paidAt: iso(o.invoice.paidAt) } : null,
});

type CustomerRow = Prisma.CustomerGetPayload<{ include: { documents: { include: { media: true } } } }>;
const toCustomer = (c: CustomerRow): CustomerDTO => ({
  id: c.id, email: c.email, companyName: c.companyName, contactName: c.contactName, phone: c.phone, city: c.city, segment: c.segment, status: c.status,
  ninea: c.ninea, rccm: c.rccm, creditLimit: c.creditLimit, salesRep: c.salesRep, createdAt: c.createdAt.toISOString(),
  documents: c.documents.map((d) => ({ kind: d.kind, url: d.media.url, filename: d.media.filename })),
});

const toLead = (l: Prisma.LeadGetPayload<object>): LeadDTO => ({ ...l, createdAt: l.createdAt.toISOString() });

export function createPrismaRepo(prisma: PrismaClient): Repo {
  const settings = async (): Promise<PricingSettings> => {
    const rows = await prisma.setting.findMany();
    const m = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<PricingSettings>;
    return { ...DEFAULT_SETTINGS, ...m };
  };
  const discounts = async (): Promise<VolumeDiscount[]> =>
    (await prisma.volumeDiscount.findMany({ where: { productId: null, universeId: null } })).map((d) => ({ minCases: d.minCases, pallet: d.pallet, percent: d.percent }));
  const coefficient = async (segment: Segment) => (await prisma.priceGrid.findUnique({ where: { segment } }))?.coefficient ?? SEGMENT_COEFFICIENTS[segment];

  const repo: Repo = {
    kind: 'prisma',
    settings,
    discounts,
    grids: async () => (await prisma.priceGrid.findMany({ orderBy: { coefficient: 'asc' } })).map((g) => ({ segment: g.segment, label: g.label, coefficient: g.coefficient })),
    universes: async () => {
      const rows = await prisma.universe.findMany({ orderBy: { sort: 'asc' }, include: { subcategories: { orderBy: { sort: 'asc' } }, products: { include: { product: { include: { brand: true } } } } } });
      return rows.map((u): UniverseDTO => {
        const brands = new Map<string, boolean>();
        u.products.forEach((pu) => { if (pu.product.active) brands.set(pu.product.brand.name, pu.product.brand.exclusive); });
        return {
          id: u.id, slug: u.slug, name: { fr: u.nameFr, en: u.nameEn }, desc: { fr: u.descFr, en: u.descEn },
          volume: { value: u.volumeValue, label: { fr: u.volumeLabelFr, en: u.volumeLabelEn } }, image: u.image, sort: u.sort,
          subcategories: u.subcategories.map((s) => ({ id: s.id, slug: s.slug, name: { fr: s.nameFr, en: s.nameEn } })),
          brands: [...brands].map(([name, exclusive]) => ({ name, exclusive })).sort((a, b) => Number(b.exclusive) - Number(a.exclusive)),
        };
      });
    },
    universe: async (slug) => (await repo.universes()).find((u) => u.slug === slug) ?? null,
    products: async (f = {}) => {
      const where: Prisma.ProductWhereInput = {};
      if (!f.includeInactive) where.active = true;
      if (f.universe) where.universes = { some: { universe: { slug: f.universe } } };
      if (f.inStock) where.stock = { gt: 0 };
      if (f.featured) where.isFeatured = true;
      if (f.codes) where.code = { in: f.codes };
      if (f.q) where.OR = [{ code: { contains: f.q, mode: 'insensitive' } }, { nameFr: { contains: f.q, mode: 'insensitive' } }, { nameEn: { contains: f.q, mode: 'insensitive' } }, { brand: { name: { contains: f.q, mode: 'insensitive' } } }];
      const rows = await prisma.product.findMany({ where, include: productInclude, orderBy: [{ code: 'asc' }] });
      return rows.map(toProduct);
    },
    product: async (key) => {
      const row = await prisma.product.findFirst({ where: { OR: [{ slug: key }, { code: key }] }, include: productInclude });
      return row ? toProduct(row) : null;
    },
    posts: async (f = {}) => {
      const rows = await prisma.post.findMany({
        where: { ...(f.includeDrafts ? {} : { status: 'PUBLISHED' }), ...(f.category ? { category: f.category } : {}), ...(f.home ? { showOnHome: true } : {}) },
        include: postInclude, orderBy: { publishedAt: 'desc' },
      });
      return rows.map(toPost);
    },
    post: async (slug) => { const r = await prisma.post.findUnique({ where: { slug }, include: postInclude }); return r ? toPost(r) : null; },

    customerAuth: async (email) => {
      const c = await prisma.customer.findUnique({ where: { email: email.toLowerCase() } });
      return c ? { id: c.id, email: c.email, name: c.contactName, passwordHash: c.passwordHash, segment: c.segment, status: c.status, companyName: c.companyName } : null;
    },
    customer: async (id) => { const c = await prisma.customer.findUnique({ where: { id }, include: { documents: { include: { media: true } } } }); return c ? toCustomer(c) : null; },
    orders: async (customerId) => (await prisma.order.findMany({ where: customerId ? { customerId } : {}, include: { lines: true, invoice: true, customer: true }, orderBy: { createdAt: 'desc' } })).map(toOrder),
    baskets: async (customerId) => (await prisma.savedBasket.findMany({ where: { customerId } })).map((b) => ({ id: b.id, name: b.name, lines: b.lines as { code: string; qty: number }[] })),
    placeOrder: async (customerId, lines) => {
      const customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });
      if (customer.status !== 'APPROVED') throw new Error('Compte non validé');
      const prods = await prisma.product.findMany({ where: { code: { in: lines.map((l) => l.code) }, active: true } });
      const ctx: PricingContext = { segment: customer.segment, coefficient: await coefficient(customer.segment), discounts: await discounts(), settings: await settings() };
      const totals = computeCart(lines, new Map(prods.map((p) => [p.code, p])), ctx);
      if (!totals.lines.length) throw new Error('Panier vide');
      for (const l of totals.lines) { const p = prods.find((x) => x.code === l.code)!; if (p.stock < (customer.segment === 'B2C' ? Math.ceil(l.qty / p.unitsPerCase) : l.qty)) throw new Error(`Stock insuffisant : ${p.code}`); }
      const ref = orderRef();
      const order = await prisma.$transaction(async (tx) => {
        for (const l of totals.lines) {
          const p = prods.find((x) => x.code === l.code)!;
          await tx.product.update({ where: { id: p.id }, data: { stock: { decrement: customer.segment === 'B2C' ? Math.ceil(l.qty / p.unitsPerCase) : l.qty } } });
        }
        return tx.order.create({
          data: {
            ref, customerId, subtotal: totals.subtotal, shipping: totals.shipping, vat: totals.vat, total: totals.totalTTC,
            lines: { create: totals.lines.map((l) => { const p = prods.find((x) => x.code === l.code)!; return { productId: p.id, code: p.code, name: p.nameFr, qty: l.qty, unitPrice: l.unitPrice, total: l.total }; }) },
            invoice: { create: { ref: ref.replace('BC', 'FA'), amount: totals.totalTTC, dueDate: new Date(Date.now() + 30 * 86400000) } },
          },
          include: { lines: true, invoice: true, customer: true },
        });
      });
      return toOrder(order);
    },
    createLead: async (input) => toLead(await prisma.lead.create({ data: { ...input, payload: (input.payload ?? undefined) as never } })),
    requestAccount: async (input) => {
      const c = await prisma.customer.create({
        data: {
          email: input.email.toLowerCase(), companyName: input.companyName, contactName: input.contactName, phone: input.phone, city: input.city,
          segment: input.segment, status: 'PENDING', ninea: input.ninea, rccm: input.rccm,
          documents: { create: input.documents.map((d) => ({ kind: d.kind, media: { create: { filename: d.filename, url: d.url, mime: d.mime, size: d.size } } })) },
        },
        include: { documents: { include: { media: true } } },
      });
      await prisma.lead.create({ data: { type: 'ACCOUNT', company: input.companyName, name: input.contactName, phone: input.phone, email: input.email, city: input.city, payload: (input.payload ?? undefined) as never } });
      return toCustomer(c);
    },

    staffAuth: async (email) => { const s = await prisma.staffUser.findUnique({ where: { email: email.toLowerCase() } }); return s ? { id: s.id, email: s.email, name: s.name, passwordHash: s.passwordHash, role: s.role, active: s.active } : null; },
    staff: async () => (await prisma.staffUser.findMany({ orderBy: { createdAt: 'asc' } })).map((s) => ({ id: s.id, email: s.email, name: s.name, role: s.role, active: s.active, lastLoginAt: iso(s.lastLoginAt) })),
    saveStaff: async ({ id, passwordHash, ...rest }) => {
      const data = { ...rest, email: rest.email.toLowerCase(), ...(passwordHash ? { passwordHash } : {}) };
      const s = id ? await prisma.staffUser.update({ where: { id }, data }) : await prisma.staffUser.create({ data: { ...data, passwordHash: passwordHash ?? '' } });
      return { id: s.id, email: s.email, name: s.name, role: s.role, active: s.active, lastLoginAt: iso(s.lastLoginAt) };
    },
    touchStaffLogin: async (id) => { await prisma.staffUser.update({ where: { id }, data: { lastLoginAt: new Date() } }); },
    customers: async (f = {}) => (await prisma.customer.findMany({ where: f.status ? { status: f.status } : {}, include: { documents: { include: { media: true } } }, orderBy: { createdAt: 'desc' } })).map(toCustomer),
    setCustomerStatus: async (id, status, staffId, segment, creditLimit) => toCustomer(await prisma.customer.update({
      where: { id }, data: { status, ...(segment ? { segment } : {}), ...(creditLimit != null ? { creditLimit } : {}), ...(status === 'APPROVED' ? { approvedAt: new Date(), approvedById: staffId } : {}) },
      include: { documents: { include: { media: true } } },
    })),
    setCustomerPassword: async (id, passwordHash) => { await prisma.customer.update({ where: { id }, data: { passwordHash } }); },
    setOrderStatus: async (id, status) => toOrder(await prisma.order.update({ where: { id }, data: { status }, include: { lines: true, invoice: true, customer: true } })),
    leads: async (f = {}) => (await prisma.lead.findMany({ where: { ...(f.type ? { type: f.type } : {}), ...(f.status ? { status: f.status } : {}) }, orderBy: { createdAt: 'desc' } })).map(toLead),
    setLeadStatus: async (id, status) => toLead(await prisma.lead.update({ where: { id }, data: { status } })),
    saveProduct: async (input) => {
      const brand = await prisma.brand.upsert({ where: { name: input.brand }, update: {}, create: { name: input.brand, slug: input.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-') } });
      const unis = await prisma.universe.findMany({ where: { slug: { in: input.universes } } });
      const sub = input.subcategory && unis[0] ? await prisma.subcategory.findFirst({ where: { slug: input.subcategory, universeId: { in: unis.map((u) => u.id) } } }) : null;
      const data = {
        code: input.code, slug: input.slug, nameFr: input.nameFr, nameEn: input.nameEn, descriptionFr: input.descriptionFr || null, descriptionEn: input.descriptionEn || null,
        brandId: brand.id, subcategoryId: sub?.id ?? null, packFr: input.packFr, packEn: input.packEn, unitsPerCase: input.unitsPerCase, casesPerPallet: input.casesPerPallet,
        minOrderMultiple: input.minOrderMultiple, basePrice: input.basePrice, stock: input.stock, origin: input.origin || null, halal: input.halal, allergens: input.allergens,
        image: input.image ?? null, blocks: (input.blocks ?? Prisma.JsonNull) as never, isNew: input.isNew, isDeal: input.isDeal, isFeatured: input.isFeatured, active: input.active,
      };
      const saved = await prisma.$transaction(async (tx) => {
        const p = input.id ? await tx.product.update({ where: { id: input.id }, data }) : await tx.product.create({ data: { ...data, sectors: [] } });
        await tx.productUniverse.deleteMany({ where: { productId: p.id } });
        await tx.productUniverse.createMany({ data: unis.map((u) => ({ productId: p.id, universeId: u.id })) });
        return tx.product.findUniqueOrThrow({ where: { id: p.id }, include: productInclude });
      });
      return toProduct(saved);
    },
    saveGrids: async (grids) => { await prisma.$transaction(grids.map((g) => prisma.priceGrid.upsert({ where: { segment: g.segment }, update: { coefficient: g.coefficient, label: g.label }, create: g }))); },
    saveDiscounts: async (list) => {
      await prisma.$transaction([prisma.volumeDiscount.deleteMany({ where: { productId: null, universeId: null } }), prisma.volumeDiscount.createMany({ data: list.map((d) => ({ minCases: d.minCases ?? null, pallet: Boolean(d.pallet), percent: d.percent })) })]);
    },
    savePost: async (input) => {
      const prod = input.featuredProductCode ? await prisma.product.findUnique({ where: { code: input.featuredProductCode } }) : null;
      const unis = await prisma.universe.findMany({ where: { slug: { in: input.universes } } });
      const existing = input.id ? await prisma.post.findUnique({ where: { id: input.id } }) : null;
      const data = {
        slug: input.slug, category: input.category, titleFr: input.titleFr, titleEn: input.titleEn, excerptFr: input.excerptFr, excerptEn: input.excerptEn,
        blocks: input.blocks as never, cover: input.cover ?? null, status: input.status, showOnHome: input.showOnHome, featuredProductId: prod?.id ?? null,
        publishedAt: input.status === 'PUBLISHED' ? existing?.publishedAt ?? new Date() : null,
      };
      const saved = await prisma.$transaction(async (tx) => {
        const p = input.id ? await tx.post.update({ where: { id: input.id }, data }) : await tx.post.create({ data });
        await tx.postUniverse.deleteMany({ where: { postId: p.id } });
        await tx.postUniverse.createMany({ data: unis.map((u) => ({ postId: p.id, universeId: u.id })) });
        return tx.post.findUniqueOrThrow({ where: { id: p.id }, include: postInclude });
      });
      return toPost(saved);
    },
    media: async () => (await prisma.media.findMany({ orderBy: { createdAt: 'desc' } })).map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    addMedia: async (input) => { const m = await prisma.media.create({ data: input }); return { ...m, createdAt: m.createdAt.toISOString() }; },
    auditLog: async (limit = 200) => (await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit })).map((a) => ({ id: a.id, actorEmail: a.actorEmail, action: a.action, entity: a.entity, entityId: a.entityId, details: a.details, createdAt: a.createdAt.toISOString() })),
    audit: async (e) => { await prisma.auditLog.create({ data: { actorId: e.actorId ?? null, actorEmail: e.actorEmail, action: e.action, entity: e.entity, entityId: e.entityId ?? null, details: (e.details ?? undefined) as never } }); },
    saveSettings: async (s) => {
      await prisma.$transaction(Object.entries(s).map(([key, value]) => prisma.setting.upsert({ where: { key }, update: { value: value as never }, create: { key, value: value as never } })));
      return settings();
    },
    stats: async () => {
      const since = new Date(Date.now() - 30 * 86400000);
      const [pendingAccounts, newLeads, openOrders, products, lowStock, rev] = await Promise.all([
        prisma.customer.count({ where: { status: 'PENDING' } }), prisma.lead.count({ where: { status: 'NEW' } }),
        prisma.order.count({ where: { status: { in: ['RECEIVED', 'PREPARING', 'SHIPPED'] } } }), prisma.product.count({ where: { active: true } }),
        prisma.product.count({ where: { active: true, stock: { lt: 60 } } }), prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: since } } }),
      ]);
      return { pendingAccounts, newLeads, openOrders, products, lowStock, revenue30d: rev._sum.total ?? 0 };
    },
  };
  return repo;
}
