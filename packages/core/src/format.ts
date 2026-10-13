import type { Locale, Xof } from './types';

export const XOF_PER_EUR = 655.957; // parité fixe FCFA / euro
export type Currency = 'XOF' | 'EUR';

export function formatMoney(xof: Xof, locale: Locale = 'fr', currency: Currency = 'XOF'): string {
  const loc = locale === 'en' ? 'en-GB' : 'fr-FR';
  if (currency === 'EUR') return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' }).format(xof / XOF_PER_EUR);
  return `${new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(Math.round(xof))} F CFA`;
}

export function formatNumber(n: number, locale: Locale = 'fr', digits = 0): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}

/** Validation NINEA : 7 à 9 chiffres suivis du code TVA (ex. « 0012345 2G3 »). */
export const NINEA_PATTERN = /^[0-9]{7,9}\s?[0-9A-Za-z]{0,3}$/;
/** Registre du commerce (RCCM), ex. « SN-DKR-2019-B-12345 ». */
export const RCCM_PATTERN = /^SN-[A-Z]{3}-\d{4}-[A-Z]-\d{1,6}$/i;

export function orderRef(prefix = 'BC', d = new Date()): string {
  return `${prefix}-${d.getFullYear()}-${String(Math.floor(10000 + Math.random() * 89999))}`;
}
