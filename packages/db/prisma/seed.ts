/**
 * Données de démonstration FLS : univers, marques, ~56 produits, grilles tarifaires, remises,
 * équipe back-office, comptes clients de test, actualités, commandes et réglages.
 * Visuels : photos de l'ancien site fls.sn et packshots provisoires générés (apps/web/public/img/p), à remplacer par les photos FLS.
 *
 * Comptes de test (à changer avant toute mise en ligne) :
 *   Back-office  admin@fls.sn / commercial@fls.sn / editeur@fls.sn  — mot de passe : FlsAdmin2026!
 *   Clients      grossiste@demo.fls.sn / demi@demo.fls.sn / chr@demo.fls.sn / b2c@demo.fls.sn — mot de passe : Demo2026!
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import bcrypt from 'bcryptjs';
import { PrismaClient, type Segment } from '@prisma/client';

const prisma = new PrismaClient();
const here = dirname(fileURLToPath(import.meta.url));
type L = { fr: string; en: string };
const data = JSON.parse(readFileSync(join(here, 'seed-data.json'), 'utf8')) as {
  universes: { slug: string; img: string; n: L; d: L; vol: { v: string; fr: string; en: string }; brands: [string, number][]; subs: [string, L][] }[];
  products: { code: string; slug: string; nameFr: string; nameEn: string; brand: string; universe: string; sub: string; packFr: string; packEn: string; upc: number; cpp: number; base: number; stock: number; flag: string; sectors: string[]; allergens: string[]; halal: boolean; origin: string; vis: string | null }[];
  news: { slug: string; cat: string; date: string; img: string; prod?: string; t: L; x: L; real?: number }[];
  shelf: Record<string, string>;
  newsBody: Record<string, { fr: string[]; en: string[] }>;
};
const S_BODY = data.newsBody;

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const IMG_ALIAS: Record<string, string> = { 'n-portail': 'u-superette', 'n-arrivage': 'u-boissons' };
const img = (k: string) => `/img/${IMG_ALIAS[k] ?? k}.webp`;

const NUTRI: Record<string, number[]> = { boissons: [42, 0, 10.5, 10.2, 0, 0.01], epicerie: [360, 1.5, 78, 0.4, 7, 0.02], frais: [95, 3.1, 13, 12.5, 3.6, 0.12], surgeles: [155, 6.5, 21, 0.5, 2.8, 0.4], conserves: [85, 0.5, 16, 10, 4, 1.2] };

async function main() {
  console.log('Nettoyage…');
  await prisma.$transaction([
    prisma.orderLine.deleteMany(), prisma.invoice.deleteMany(), prisma.order.deleteMany(), prisma.savedBasket.deleteMany(),
    prisma.customerDocument.deleteMany(), prisma.customer.deleteMany(), prisma.postUniverse.deleteMany(), prisma.post.deleteMany(),
    prisma.volumeDiscount.deleteMany(), prisma.productUniverse.deleteMany(), prisma.product.deleteMany(), prisma.subcategory.deleteMany(),
    prisma.universe.deleteMany(), prisma.brand.deleteMany(), prisma.priceGrid.deleteMany(), prisma.lead.deleteMany(), prisma.setting.deleteMany(),
  ]);

  console.log('Réglages et grilles…');
  await prisma.setting.createMany({ data: [
    { key: 'vatRate', value: 0.18 }, { key: 'francoThreshold', value: 250000 }, { key: 'deliveryFee', value: 15000 },
    { key: 'b2cEnabled', value: true }, { key: 'b2cMargin', value: 1.25 },
  ] });
  const grids: [Segment, string, number][] = [['GROSSISTE', 'Grossiste', 0.88], ['DEMI_GROSSISTE', 'Demi-grossiste / supérette', 0.94], ['CHR', 'Restaurant / fast-food (CHR)', 1], ['B2C', 'Grand public', 1]];
  await prisma.priceGrid.createMany({ data: grids.map(([segment, label, coefficient]) => ({ segment, label, coefficient })) });
  await prisma.volumeDiscount.createMany({ data: [{ minCases: 10, percent: 4 }, { pallet: true, percent: 9 }] });

  console.log('Univers, sous-catégories, marques…');
  const uni = new Map<string, string>();
  const subs = new Map<string, string>();
  for (const [i, u] of data.universes.entries()) {
    const row = await prisma.universe.create({ data: {
      slug: u.slug, nameFr: u.n.fr, nameEn: u.n.en, descFr: u.d.fr, descEn: u.d.en,
      volumeValue: u.vol.v, volumeLabelFr: u.vol.fr, volumeLabelEn: u.vol.en, image: img(u.img), sort: i,
      subcategories: { create: u.subs.map(([slug, n], j) => ({ slug, nameFr: n.fr, nameEn: n.en, sort: j })) },
    }, include: { subcategories: true } });
    uni.set(u.slug, row.id);
    row.subcategories.forEach((s) => subs.set(`${u.slug}:${s.slug}`, s.id));
  }
  const exclusive = new Set(data.universes.flatMap((u) => u.brands.filter((b) => b[1]).map((b) => b[0])));
  const brandNames = [...new Set(data.products.map((p) => p.brand))];
  const brands = new Map<string, string>();
  for (const name of brandNames) {
    const b = await prisma.brand.create({ data: { name, slug: slugify(name), exclusive: exclusive.has(name) } });
    brands.set(name, b.id);
  }

  console.log('Produits…');
  const prodIds = new Map<string, string>();
  for (const p of data.products) {
    const n = NUTRI[p.universe] ?? NUTRI.conserves!;
    const extra = p.sectors.includes('ff') && p.universe === 'boissons' ? ['boissons'] : [];
    const row = await prisma.product.create({ data: {
      code: p.code, slug: p.slug, nameFr: p.nameFr, nameEn: p.nameEn, brandId: brands.get(p.brand)!,
      subcategoryId: subs.get(`${p.universe}:${p.sub}`) ?? null, packFr: p.packFr, packEn: p.packEn,
      unitsPerCase: p.upc, casesPerPallet: p.cpp, basePrice: p.base, stock: p.stock, origin: p.origin, halal: p.halal,
      allergens: p.allergens, sectors: p.sectors, isNew: p.flag === 'new', isDeal: p.flag === 'deal',
      isFeatured: Boolean(p.flag) || ['UL-033', 'RZ-BR50', 'HU-T20', 'SG-F09'].includes(p.code),
      image: p.vis ? `/img/p/p-${p.vis}.webp` : null,
      nutrition: { energyKcal: n[0], fat: n[1], carbs: n[2], sugars: n[3], protein: n[4], salt: n[5] },
      universes: { create: [{ universeId: uni.get(p.universe)! }, ...extra.filter((e) => e !== p.universe).map((e) => ({ universeId: uni.get(e)! }))] },
    } });
    prodIds.set(p.code, row.id);
  }

  console.log('Équipe back-office…');
  const staffHash = await bcrypt.hash('FlsAdmin2026!', 10);
  await prisma.staffUser.createMany({ skipDuplicates: true, data: [
    { email: 'admin@fls.sn', name: 'Administrateur FLS', role: 'ADMIN', passwordHash: staffHash },
    { email: 'commercial@fls.sn', name: 'Aïssatou N.', role: 'COMMERCIAL', passwordHash: staffHash },
    { email: 'editeur@fls.sn', name: 'Éditeur contenus', role: 'EDITOR', passwordHash: staffHash },
  ] });
  const admin = await prisma.staffUser.findUniqueOrThrow({ where: { email: 'admin@fls.sn' } });

  console.log('Clients de test…');
  const demoHash = await bcrypt.hash('Demo2026!', 10);
  const customers: { email: string; companyName: string; contactName: string; city: string; segment: Segment; creditLimit: number; ninea?: string; rccm?: string }[] = [
    { email: 'grossiste@demo.fls.sn', companyName: 'Établissements Diop & Frères', contactName: 'Moustapha Diop', city: 'Touba', segment: 'GROSSISTE', creditLimit: 6_000_000, ninea: '0045678 2G3', rccm: 'SN-DBL-2015-B-00421' },
    { email: 'demi@demo.fls.sn', companyName: 'Supérette Keur Yaye', contactName: 'Yaye Fatou Ndiaye', city: 'Mermoz, Dakar', segment: 'DEMI_GROSSISTE', creditLimit: 2_500_000, ninea: '0067812 2C1', rccm: 'SN-DKR-2019-B-12345' },
    { email: 'chr@demo.fls.sn', companyName: 'Le Comptoir Fast-Food', contactName: 'Ibrahima Sarr', city: 'Plateau, Dakar', segment: 'CHR', creditLimit: 1_500_000, ninea: '0071234 2B2', rccm: 'SN-DKR-2021-B-04567' },
    { email: 'b2c@demo.fls.sn', companyName: 'Client particulier', contactName: 'Awa Fall', city: 'Dakar', segment: 'B2C', creditLimit: 0 },
  ];
  const custIds: Record<string, string> = {};
  for (const c of customers) {
    const row = await prisma.customer.create({ data: { ...c, phone: '77 000 00 00', passwordHash: demoHash, status: 'APPROVED', approvedAt: new Date(), approvedById: admin.id, salesRep: 'Aïssatou N.' } });
    custIds[c.segment] = row.id;
  }
  await prisma.customer.create({ data: { email: 'nouveau@demo.fls.sn', companyName: 'Boutique Serigne Fallou', contactName: 'Cheikh Mbacké', city: 'Kaolack', phone: '77 111 22 33', segment: 'DEMI_GROSSISTE', status: 'PENDING', ninea: '0089911 2A1', rccm: 'SN-KLK-2024-A-00098' } });

  console.log('Paniers types et commandes…');
  const baskets: Record<string, { name: string; lines: { code: string; qty: number }[] }[]> = {
    CHR: [{ name: 'Hebdo fast-food', lines: [{ code: 'HU-T20', qty: 2 }, { code: 'SG-F09', qty: 8 }, { code: 'CO-MY5', qty: 2 }, { code: 'CO-KE5', qty: 2 }, { code: 'EM-B500', qty: 1 }] }, { name: 'Boissons du week-end', lines: [{ code: 'UL-033', qty: 10 }, { code: 'EA-050', qty: 6 }] }],
    DEMI_GROSSISTE: [{ name: 'Réassort du lundi', lines: [{ code: 'UL-033', qty: 10 }, { code: 'CO-TC07', qty: 6 }, { code: 'PA-SP5', qty: 5 }, { code: 'EA-150', qty: 10 }, { code: 'SU-PO50', qty: 2 }] }],
    GROSSISTE: [{ name: 'Camion mensuel', lines: [{ code: 'RZ-BR50', qty: 40 }, { code: 'SU-PO50', qty: 20 }, { code: 'HU-T05', qty: 30 }, { code: 'FA-T55', qty: 20 }] }],
  };
  const statuses = ['PREPARING', 'DELIVERED', 'DELIVERED', 'DELIVERED'] as const;
  for (const [seg, list] of Object.entries(baskets)) {
    const customerId = custIds[seg]!;
    for (const b of list) await prisma.savedBasket.create({ data: { customerId, name: b.name, lines: b.lines } });
    for (let k = 0; k < 4; k++) {
      const lines = list[k % list.length]!.lines.filter((l) => prodIds.has(l.code));
      const coef = grids.find((g) => g[0] === seg)![2];
      const priced = lines.map((l) => { const p = data.products.find((x) => x.code === l.code)!; const unit = Math.round((p.base * coef) / 5) * 5; return { ...l, p, unit }; });
      const subtotal = priced.reduce((s, l) => s + l.unit * l.qty, 0);
      const shipping = subtotal < 250000 ? 15000 : 0;
      const vat = Math.round((subtotal + shipping) * 0.18);
      const created = new Date(Date.now() - (k * 7 + 2) * 86400000);
      const ref = `BC-2026-${String(48213 - k * 517 - Object.keys(custIds).indexOf(seg) * 31)}`;
      await prisma.order.create({ data: {
        ref, customerId, status: statuses[k]!, subtotal, shipping, vat, total: subtotal + shipping + vat, createdAt: created,
        lines: { create: priced.map((l) => ({ productId: prodIds.get(l.code)!, code: l.code, name: l.p.nameFr, qty: l.qty, unitPrice: l.unit, total: l.unit * l.qty })) },
        invoice: { create: { ref: ref.replace('BC', 'FA'), amount: subtotal + shipping + vat, dueDate: new Date(created.getTime() + 30 * 86400000), paidAt: k === 0 ? null : created } },
      } });
    }
  }

  console.log('Actualités…');
  for (const n of data.news) {
    await prisma.post.create({ data: {
      slug: n.slug, category: n.cat, titleFr: n.t.fr, titleEn: n.t.en, excerptFr: n.x.fr, excerptEn: n.x.en, cover: img(n.img),
      status: 'PUBLISHED', publishedAt: new Date(`${n.date}T09:00:00Z`), showOnHome: true,
      featuredProductId: n.prod ? prodIds.get(n.prod) ?? null : null,
      blocks: [{ type: 'text', data: { html: (S_BODY[n.cat]?.fr ?? []).map((x) => `<p>${x}</p>`).join(''), htmlEn: (S_BODY[n.cat]?.en ?? []).map((x) => `<p>${x}</p>`).join('') } }],
    } });
  }

  console.log('Demandes entrantes…');
  await prisma.lead.createMany({ data: [
    { type: 'QUOTE', company: 'Hôtel Téranga Plage', name: 'Mariama Ba', phone: '77 222 33 44', city: 'Saly', message: '2 palettes d’eau minérale et 20 cartons de jus par mois.' },
    { type: 'TURNKEY', company: 'Promoteur Résidence Les Almadies', name: 'Ousmane Fall', phone: '78 333 44 55', city: 'Dakar', message: 'Supérette de 120 m² au rez-de-chaussée, ouverture prévue en mars.' },
    { type: 'ADVICE', company: 'Chez Fatou Grill', name: 'Fatou Diallo', phone: '76 444 55 66', city: 'Thiès', message: 'Revoir la carte et le coût matière des menus.' },
  ] });

  console.log('Terminé.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
