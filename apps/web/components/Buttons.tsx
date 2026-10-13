'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { useLocale, usePricing, useT, useUI } from './providers';

/** Boutons utilisables depuis les pages serveur pour ouvrir les tiroirs globaux. */
export function DevisButton({ type = 'appro', note = '', className = 'sn-btn sn-btn-go', children }: { type?: string; note?: string; className?: string; children: ReactNode }) {
  const ui = useUI();
  return <button type="button" className={className} onClick={() => ui.openDevis(type, note)}>{children}</button>;
}
export function SheetButton({ code, className, children }: { code: string; className?: string; children: ReactNode }) {
  const ui = useUI();
  return <button type="button" className={className} onClick={() => ui.openSheet(code)}>{children}</button>;
}

/** Encart « prix après connexion », masqué pour les clients connectés. */
export function Gate() {
  const t = useT(); const l = useLocale(); const { logged } = usePricing();
  if (logged) return null;
  return (
    <div className="sn-gate"><span className="sn-gate-ic"><Icon name="lock" /></span>
      <div><b>{t('Vos prix pro s’affichent après connexion', 'Your trade prices appear after sign-in')}</b><span>{t('Chaque profil voit sa grille : grossiste, demi-grossiste ou restaurateur.', 'Each profile sees its own grid: wholesaler, semi-wholesaler or restaurant.')}</span></div>
      <Link className="sn-btn sn-btn-nv sn-btn-sm" href={`/${l}/connexion`}>{t('Se connecter', 'Sign in')}</Link>
    </div>
  );
}
