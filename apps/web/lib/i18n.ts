export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';
export const isLocale = (s: string | undefined | null): s is Locale => !!s && (locales as readonly string[]).includes(s);

/** Traduction en ligne : chaque texte est écrit dans les deux langues au même endroit (parité FR/EN contrôlable). */
export const tr = (l: Locale) => (fr: string, en: string) => (l === 'en' ? en : fr);
export const pick = (l: Locale, o: { fr: string; en: string } | null | undefined) => (o ? o[l] || o.fr : '');
export const href = (l: Locale, path = '') => `/${l}${path}`;
export const dateLocale = (l: Locale) => (l === 'en' ? 'en-GB' : 'fr-FR');
export const fdate = (l: Locale, iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(dateLocale(l), { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/** Métadonnées d'alternance hreflang pour un chemin donné (sans préfixe de langue). */
export function alternates(l: Locale, path = '') {
  return {
    canonical: `${SITE_URL}/${l}${path}`,
    languages: { fr: `${SITE_URL}/fr${path}`, en: `${SITE_URL}/en${path}`, 'x-default': `${SITE_URL}/fr${path}` },
  };
}
