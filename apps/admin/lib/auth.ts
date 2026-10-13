import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getRepo, type Role } from '@fls/db';

/** Session du back-office : jeton signé HMAC-SHA256 dans un cookie HttpOnly limité à /admin-fls (8 h). */
export interface StaffSession { id: string; email: string; name: string; role: Role; exp: number }
const COOKIE = 'fls_admin';
const TTL = 8 * 3600 * 1000;
const secret = () => process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || 'dev-admin-secret-a-remplacer';
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('base64url');

export function issue(s: Omit<StaffSession, 'exp'>) {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + TTL })).toString('base64url');
  cookies().set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/admin-fls', maxAge: TTL / 1000 });
}
export function clear() { cookies().set(COOKIE, '', { path: '/admin-fls', maxAge: 0 }); }

export async function currentStaff(): Promise<StaffSession | null> {
  const raw = cookies().get(COOKIE)?.value; if (!raw) return null;
  const [payload, sig] = raw.split('.'); if (!payload || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString()) as StaffSession;
    if (s.exp < Date.now()) return null;
    // Un compte désactivé perd l'accès immédiatement.
    const live = await (await getRepo()).staffAuth(s.email);
    if (!live?.active || live.role !== s.role) return null;
    return s;
  } catch { return null; }
}

/* Droits par rôle (cahier des charges : Administrateur, Commercial, Éditeur) */
export type Area = 'dashboard' | 'catalogue' | 'pricing' | 'accounts' | 'orders' | 'leads' | 'news' | 'media' | 'staff' | 'audit' | 'settings';
const RIGHTS: Record<Role, Area[]> = {
  ADMIN: ['dashboard', 'catalogue', 'pricing', 'accounts', 'orders', 'leads', 'news', 'media', 'staff', 'audit', 'settings'],
  COMMERCIAL: ['dashboard', 'accounts', 'orders', 'leads', 'catalogue'],
  EDITOR: ['dashboard', 'catalogue', 'news', 'media'],
};
export const can = (role: Role, area: Area) => RIGHTS[role].includes(area);
/** Le commercial consulte le catalogue (stock, fiches) sans le modifier. */
export const canEdit = (role: Role, area: Area) => can(role, area) && !(role === 'COMMERCIAL' && area === 'catalogue');

export async function requireStaff(area: Area = 'dashboard', edit = false): Promise<StaffSession> {
  const s = await currentStaff();
  if (!s) redirect('/login');
  if (!(edit ? canEdit(s.role, area) : can(s.role, area))) redirect('/?refus=1');
  return s;
}

/** Limitation des tentatives de connexion (mémoire du processus) : 5 essais / 15 min par e-mail. */
const attempts = new Map<string, { n: number; until: number }>();
export function throttle(email: string) {
  const now = Date.now(); const a = attempts.get(email);
  if (a && a.until > now && a.n >= 5) return false;
  attempts.set(email, a && a.until > now ? { n: a.n + 1, until: a.until } : { n: 1, until: now + 15 * 60 * 1000 });
  return true;
}
export const resetThrottle = (email: string) => attempts.delete(email);
