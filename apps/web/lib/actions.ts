'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getRepo, type LeadType } from '@fls/db';
import { NINEA_PATTERN, RCCM_PATTERN, type CartLine, type Segment } from '@fls/core';
import { getSession } from './session';
import { saveUpload } from './media';

export type ActionResult<T = undefined> = { ok: true; ref?: string; data?: T } | { ok: false; error: string; fields?: Record<string, string> };

const phone = z.string().trim().min(6, 'Numéro de téléphone incomplet.').max(30);
const leadSchema = z.object({
  type: z.enum(['QUOTE', 'TURNKEY', 'ADVICE', 'KEY_ACCOUNT', 'CONTACT', 'APPLICATION']),
  company: z.string().trim().max(160).optional(),
  name: z.string().trim().max(120).optional(),
  phone,
  email: z.string().trim().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  city: z.string().trim().max(80).optional(),
  message: z.string().trim().max(4000).optional(),
});

const fieldErrors = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]));
const ref = (p: string) => `${p}-${new Date().getFullYear()}-${String(1000 + Math.floor(Math.random() * 8999))}`;

/** Devis, accompagnement, grand compte, clés en main, contact : centralisés dans le module « Contacts & devis » du back-office. */
export async function submitLead(input: z.input<typeof leadSchema> & { payload?: Record<string, unknown> }): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Vérifiez les champs signalés.', fields: fieldErrors(parsed.error) };
  const repo = await getRepo();
  await repo.createLead({ ...parsed.data, email: parsed.data.email || undefined, type: parsed.data.type as LeadType, payload: input.payload });
  const prefix = { QUOTE: 'DV', TURNKEY: 'CM', ADVICE: 'AC', KEY_ACCOUNT: 'GC', CONTACT: 'CT', APPLICATION: 'CA' }[parsed.data.type];
  return { ok: true, ref: ref(prefix) };
}

/** Candidature avec CV (PDF). */
export async function submitApplication(form: FormData): Promise<ActionResult> {
  const file = form.get('cv');
  let cv: { url: string; filename: string } | undefined;
  try { if (file instanceof File && file.size > 0) cv = await saveUpload(file, 'cv'); } catch (e) { return { ok: false, error: (e as Error).message }; }
  return submitLead({ type: 'APPLICATION', name: String(form.get('name') ?? ''), phone: String(form.get('phone') ?? ''), message: String(form.get('position') ?? ''), payload: { cv } });
}

const accountSchema = z.object({
  companyName: z.string().trim().min(2, 'Raison sociale requise.').max(160),
  contactName: z.string().trim().min(2, 'Nom du responsable requis.').max(120),
  phone,
  email: z.string().trim().email('Adresse e-mail invalide.'),
  city: z.string().trim().min(2).max(80),
  segment: z.enum(['GROSSISTE', 'DEMI_GROSSISTE', 'CHR', 'B2C']),
  activity: z.string().max(60),
  volume: z.string().max(60),
  ninea: z.string().trim().regex(NINEA_PATTERN, 'Le NINEA compte 7 à 9 chiffres suivis du code TVA (ex. 0012345 2G3).'),
  rccm: z.string().trim().regex(RCCM_PATTERN, 'Format attendu : SN-DKR-2019-B-12345.'),
});

/** Demande d'ouverture de compte pro avec téléversement du NINEA et du RCCM (modération dans le back-office). */
export async function requestAccount(form: FormData): Promise<ActionResult> {
  const parsed = accountSchema.safeParse(Object.fromEntries(['companyName', 'contactName', 'phone', 'email', 'city', 'segment', 'activity', 'volume', 'ninea', 'rccm'].map((k) => [k, String(form.get(k) ?? '')])));
  if (!parsed.success) return { ok: false, error: 'Vérifiez les champs signalés.', fields: fieldErrors(parsed.error) };
  const files = form.getAll('documents').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { ok: false, error: 'Ajoutez au moins un justificatif (NINEA ou RCCM).' };
  try {
    const docs = [];
    for (const [i, f] of files.slice(0, 6).entries()) docs.push({ ...(await saveUpload(f)), kind: (i === 0 ? 'NINEA' : i === 1 ? 'RCCM' : 'OTHER') as 'NINEA' | 'RCCM' | 'OTHER' });
    const repo = await getRepo();
    const { activity, volume, ...data } = parsed.data;
    await repo.requestAccount({ ...data, segment: data.segment as Segment, documents: docs, payload: { activity, volume } });
    return { ok: true, ref: ref('OC') };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Impossible d’enregistrer la demande.' };
  }
}

export async function subscribeNewsletter(email: string): Promise<ActionResult> {
  const ok = z.string().email().safeParse(email.trim());
  if (!ok.success) return { ok: false, error: 'Saisissez une adresse e-mail valide.' };
  await (await getRepo()).createLead({ type: 'NEWSLETTER', email: ok.data });
  return { ok: true };
}

/** Validation de commande : prix, remises, franco et stock sont recalculés côté serveur. */
export async function placeOrder(lines: CartLine[]): Promise<ActionResult<{ total: number }>> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: 'Connectez-vous pour commander.' };
  const clean = z.array(z.object({ code: z.string().max(20), qty: z.number().int().positive().max(100000) })).max(200).safeParse(lines);
  if (!clean.success) return { ok: false, error: 'Panier invalide.' };
  try {
    const order = await (await getRepo()).placeOrder(session.user.id, clean.data);
    revalidatePath('/[locale]/compte', 'page');
    return { ok: true, ref: order.ref, data: { total: order.total } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
