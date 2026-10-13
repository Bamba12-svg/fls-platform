'use server';

import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getRepo, type AccountStatus, type Block, type LeadStatus, type Role } from '@fls/db';
import type { OrderStatus, Segment } from '@fls/core';
import { clear, issue, requireStaff, resetThrottle, throttle, type Area } from './auth';
import { storeMedia } from './media';
import { sanitizeHtml } from './sanitize';

export type Result = { ok: true; msg?: string; data?: unknown } | { ok: false; error: string };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof z.ZodError ? e.issues.map((i) => `${i.path.join('.')} : ${i.message}`).join(' · ') : (e as Error).message || 'Erreur inattendue' });

/** Toute modification passe par ici : contrôle du rôle, exécution, écriture au journal d'audit (immuable). */
async function guarded<T>(area: Area, action: string, entity: string, run: (repo: Awaited<ReturnType<typeof getRepo>>, staffId: string) => Promise<{ id?: string | null; details?: unknown; result?: T }>, paths: string[] = []): Promise<Result> {
  const s = await requireStaff(area, true);
  try {
    const repo = await getRepo();
    const r = await run(repo, s.id);
    await repo.audit({ actorId: s.id, actorEmail: s.email, action, entity, entityId: r.id ?? null, details: r.details ?? null });
    paths.forEach((p) => revalidatePath(p));
    return { ok: true, data: r.result };
  } catch (e) { return fail(e); }
}

/* ---------- Connexion ---------- */
export async function login(_: unknown, form: FormData): Promise<{ error?: string }> {
  const email = String(form.get('email') ?? '').trim().toLowerCase(); const password = String(form.get('password') ?? '');
  if (!throttle(email)) return { error: 'Trop de tentatives. Réessayez dans 15 minutes.' };
  const repo = await getRepo(); const u = await repo.staffAuth(email);
  if (!u?.passwordHash || !u.active || !(await bcrypt.compare(password, u.passwordHash))) return { error: 'Identifiants incorrects ou compte désactivé.' };
  resetThrottle(email); issue({ id: u.id, email: u.email, name: u.name, role: u.role });
  await repo.touchStaffLogin(u.id);
  await repo.audit({ actorId: u.id, actorEmail: u.email, action: 'login', entity: 'StaffUser', entityId: u.id });
  redirect('/');
}
export async function logout() { clear(); redirect('/login'); }

/* ---------- Catalogue ---------- */
const blockSchema = z.array(z.object({ type: z.enum(['text', 'image', 'gallery', 'video', 'nutrition', 'allergens', 'file', 'product']), data: z.record(z.unknown()) })).max(60);
const cleanBlocks = (raw: string): Block[] => blockSchema.parse(JSON.parse(raw || '[]')).map((b) => (b.type === 'text' ? { type: 'text', data: { html: sanitizeHtml(String(b.data.html ?? '')), htmlEn: sanitizeHtml(String(b.data.htmlEn ?? '')) } } : b) as Block);
const productSchema = z.object({
  id: z.string().optional(), code: z.string().trim().min(2).max(20).regex(/^[A-Z0-9-]+$/i, 'lettres, chiffres et tirets'), slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, 'minuscules, chiffres et tirets'),
  nameFr: z.string().trim().min(2).max(160), nameEn: z.string().trim().min(2).max(160), descriptionFr: z.string().max(2000).optional(), descriptionEn: z.string().max(2000).optional(),
  brand: z.string().trim().min(1).max(80), universes: z.array(z.string()).min(1, 'cochez au moins un univers'), subcategory: z.string().optional().nullable(),
  packFr: z.string().trim().min(2).max(120), packEn: z.string().trim().min(2).max(120), unitsPerCase: z.coerce.number().int().min(1).max(1000), casesPerPallet: z.coerce.number().int().min(1).max(500), minOrderMultiple: z.coerce.number().int().min(1).max(100),
  basePrice: z.coerce.number().int().min(0).max(100_000_000), stock: z.coerce.number().int().min(0).max(10_000_000), origin: z.string().max(80).optional(), halal: z.boolean(), allergens: z.array(z.string()), image: z.string().max(300).optional().nullable(),
  isNew: z.boolean(), isDeal: z.boolean(), isFeatured: z.boolean(), active: z.boolean(),
});
export async function saveProduct(form: FormData): Promise<Result> {
  return guarded('catalogue', form.get('id') ? 'product.update' : 'product.create', 'Product', async (repo) => {
    const g = (k: string) => (form.get(k) == null ? undefined : String(form.get(k)));
    const input = productSchema.parse({
      id: g('id') || undefined, code: g('code')?.toUpperCase(), slug: g('slug'), nameFr: g('nameFr'), nameEn: g('nameEn'), descriptionFr: g('descriptionFr'), descriptionEn: g('descriptionEn'), brand: g('brand'),
      universes: form.getAll('universes').map(String), subcategory: g('subcategory') || null, packFr: g('packFr'), packEn: g('packEn'), unitsPerCase: g('unitsPerCase'), casesPerPallet: g('casesPerPallet'), minOrderMultiple: g('minOrderMultiple') || 1,
      basePrice: g('basePrice'), stock: g('stock'), origin: g('origin'), halal: form.get('halal') === 'on', allergens: form.getAll('allergens').map(String), image: g('image') || null,
      isNew: form.get('isNew') === 'on', isDeal: form.get('isDeal') === 'on', isFeatured: form.get('isFeatured') === 'on', active: form.get('active') === 'on',
    });
    const p = await repo.saveProduct({ ...input, blocks: cleanBlocks(g('blocks') ?? '[]') });
    return { id: p.id, details: { code: p.code, basePrice: p.basePrice, stock: p.stock, universes: p.universes, active: p.active }, result: p.id };
  }, ['/produits']);
}
export async function setStock(id: string, code: string, stock: number): Promise<Result> {
  return guarded('catalogue', 'product.stock', 'Product', async (repo) => {
    const p = (await repo.products({ includeInactive: true, codes: [code] }))[0]; if (!p) throw new Error('Produit introuvable');
    const n = z.number().int().min(0).max(10_000_000).parse(stock);
    await repo.saveProduct({ id: p.id, code: p.code, slug: p.slug, nameFr: p.name.fr, nameEn: p.name.en, descriptionFr: p.description?.fr, descriptionEn: p.description?.en, brand: p.brand.name, universes: p.universes, subcategory: p.subcategory, packFr: p.pack.fr, packEn: p.pack.en, unitsPerCase: p.unitsPerCase, casesPerPallet: p.casesPerPallet, minOrderMultiple: p.minOrderMultiple, basePrice: p.basePrice, stock: n, origin: p.origin ?? undefined, halal: p.halal, allergens: p.allergens, image: p.image, blocks: p.blocks ?? undefined, isNew: p.isNew, isDeal: p.isDeal, isFeatured: p.isFeatured, active: p.active });
    return { id, details: { code, from: p.stock, to: n } };
  }, ['/produits']);
}

/* ---------- Tarifs ---------- */
export async function savePricing(form: FormData): Promise<Result> {
  return guarded('pricing', 'pricing.update', 'PriceGrid', async (repo) => {
    const segs: Segment[] = ['GROSSISTE', 'DEMI_GROSSISTE', 'CHR', 'B2C'];
    const grids = segs.map((s) => ({ segment: s, label: String(form.get(`label_${s}`) ?? s), coefficient: z.coerce.number().min(0.5).max(1.5).parse(form.get(`coef_${s}`)) }));
    const discounts = [
      { minCases: z.coerce.number().int().min(2).max(500).parse(form.get('d1_min')), percent: z.coerce.number().min(0).max(50).parse(form.get('d1_pct')) },
      { pallet: true, percent: z.coerce.number().min(0).max(50).parse(form.get('d2_pct')) },
    ];
    const settings = {
      vatRate: z.coerce.number().min(0).max(0.3).parse(Number(form.get('vat')) / 100), francoThreshold: z.coerce.number().int().min(0).parse(form.get('franco')),
      deliveryFee: z.coerce.number().int().min(0).parse(form.get('delivery')), b2cEnabled: form.get('b2cEnabled') === 'on', b2cMargin: z.coerce.number().min(1).max(3).parse(form.get('b2cMargin')),
    };
    await repo.saveGrids(grids); await repo.saveDiscounts(discounts); await repo.saveSettings(settings);
    return { details: { grids: grids.map((g) => [g.segment, g.coefficient]), discounts, settings } };
  }, ['/tarifs']);
}

/* ---------- Comptes pro ---------- */
export async function moderateAccount(id: string, status: AccountStatus, segment?: Segment, creditLimit?: number): Promise<Result> {
  return guarded('accounts', `account.${status.toLowerCase()}`, 'Customer', async (repo, staffId) => {
    const before = await repo.customer(id); if (!before) throw new Error('Client introuvable');
    const c = await repo.setCustomerStatus(id, status, staffId, segment, creditLimit);
    let temp: string | undefined;
    if (status === 'APPROVED' && before.status !== 'APPROVED' && !(await repo.customerAuth(c.email))?.passwordHash) {
      temp = `FLS-${randomBytes(4).toString('hex')}`; await repo.setCustomerPassword(id, await bcrypt.hash(temp, 10));
    }
    return { id, details: { email: c.email, from: before.status, to: status, segment: c.segment, creditLimit: c.creditLimit, tempPasswordIssued: !!temp }, result: temp };
  }); // pas de revalidation : le mot de passe provisoire doit rester affiché
}
export async function resetCustomerPassword(id: string): Promise<Result> {
  return guarded('accounts', 'account.password_reset', 'Customer', async (repo) => {
    const temp = `FLS-${randomBytes(4).toString('hex')}`; await repo.setCustomerPassword(id, await bcrypt.hash(temp, 10));
    return { id, result: temp };
  });
}

/* ---------- Commandes & demandes ---------- */
export async function setOrderStatus(id: string, status: OrderStatus): Promise<Result> {
  return guarded('orders', 'order.status', 'Order', async (repo) => { const o = await repo.setOrderStatus(id, status); return { id, details: { ref: o.ref, status } }; }, ['/commandes']);
}
export async function setLeadStatus(id: string, status: LeadStatus): Promise<Result> {
  return guarded('leads', 'lead.status', 'Lead', async (repo) => { await repo.setLeadStatus(id, status); return { id, details: { status } }; }, ['/demandes']);
}

/* ---------- Actualités ---------- */
const postSchema = z.object({
  id: z.string().optional(), slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9-]+$/, 'minuscules, chiffres et tirets'), category: z.enum(['gammes', 'salons', 'arrivages', 'societe', 'conseil']),
  titleFr: z.string().trim().min(3).max(200), titleEn: z.string().trim().min(3).max(200), excerptFr: z.string().trim().max(400), excerptEn: z.string().trim().max(400),
  cover: z.string().max(300).optional().nullable(), status: z.enum(['DRAFT', 'PUBLISHED']), featuredProductCode: z.string().max(20).optional().nullable(), showOnHome: z.boolean(), universes: z.array(z.string()),
});
export async function savePost(form: FormData): Promise<Result> {
  return guarded('news', form.get('id') ? 'post.update' : 'post.create', 'Post', async (repo) => {
    const g = (k: string) => (form.get(k) == null ? undefined : String(form.get(k)));
    const input = postSchema.parse({ id: g('id') || undefined, slug: g('slug'), category: g('category'), titleFr: g('titleFr'), titleEn: g('titleEn'), excerptFr: g('excerptFr') ?? '', excerptEn: g('excerptEn') ?? '', cover: g('cover') || null, status: g('status'), featuredProductCode: g('featuredProductCode') || null, showOnHome: form.get('showOnHome') === 'on', universes: form.getAll('universes').map(String) });
    const p = await repo.savePost({ ...input, blocks: cleanBlocks(g('blocks') ?? '[]') });
    return { id: p.id, details: { slug: p.slug, status: p.status, showOnHome: p.showOnHome }, result: p.id };
  }, ['/actualites']);
}

/* ---------- Médias ---------- */
export async function uploadMedia(form: FormData): Promise<Result> {
  return guarded('media', 'media.upload', 'Media', async (repo) => {
    const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0).slice(0, 10);
    if (!files.length) throw new Error('Choisissez au moins un fichier.');
    const out = [];
    for (const f of files) { const m = await storeMedia(f); out.push(await repo.addMedia({ ...m, alt: String(form.get('alt') ?? '') || null })); }
    return { details: { files: out.map((m) => m.url) }, result: out };
  }, ['/medias']);
}

/* ---------- Utilisateurs du back-office ---------- */
const staffSchema = z.object({ id: z.string().optional(), email: z.string().trim().toLowerCase().email(), name: z.string().trim().min(2).max(80), role: z.enum(['ADMIN', 'COMMERCIAL', 'EDITOR']), active: z.boolean(), password: z.string().optional() });
export async function saveStaff(form: FormData): Promise<Result> {
  const me = await requireStaff('staff', true);
  return guarded('staff', form.get('id') ? 'staff.update' : 'staff.create', 'StaffUser', async (repo) => {
    const s = staffSchema.parse({ id: String(form.get('id') ?? '') || undefined, email: form.get('email'), name: form.get('name'), role: form.get('role'), active: form.get('active') === 'on', password: String(form.get('password') ?? '') || undefined });
    if (s.id === me.id && (!s.active || s.role !== 'ADMIN')) throw new Error('Vous ne pouvez pas retirer vos propres droits d’administrateur.');
    if (!s.id && (!s.password || s.password.length < 10)) throw new Error('Mot de passe initial : 10 caractères minimum.');
    if (s.password && (s.password.length < 10 || !/[A-Z]/.test(s.password) || !/\d/.test(s.password))) throw new Error('Mot de passe : 10 caractères minimum, avec une majuscule et un chiffre.');
    const u = await repo.saveStaff({ id: s.id, email: s.email, name: s.name, role: s.role as Role, active: s.active, passwordHash: s.password ? await bcrypt.hash(s.password, 12) : undefined });
    return { id: u.id, details: { email: u.email, role: u.role, active: u.active, passwordChanged: !!s.password } };
  }, ['/utilisateurs']);
}
