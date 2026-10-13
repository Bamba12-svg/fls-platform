'use client';

import { signOut } from 'next-auth/react';
import type { PublicProduct } from '@/lib/catalog';
import { Icon } from '../Icon';
import { PackThumb, useAddToCart } from '../ProductCard';
import { useCart, useLocale, usePricing, useT, useUI } from '../providers';

export function SignOutButton() {
  const t = useT(); const l = useLocale(); const { clear } = useCart();
  return <button type="button" className="sn-btn sn-btn-glass" onClick={() => { clear(); signOut({ callbackUrl: `/${l}` }); }}>{t('Se déconnecter', 'Sign out')}</button>;
}

/** Recommande : remet les lignes d'une commande passée dans le panier (produits en stock uniquement). */
export function ReorderButton({ orderRef, lines, products }: { orderRef: string; lines: { code: string; qty: number }[]; products: Record<string, PublicProduct> }) {
  const t = useT(); const ui = useUI(); const { add } = useCart();
  return <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={() => { lines.forEach((x) => { const p = products[x.code]; if (p && p.stock > 0) add(p, x.qty); }); ui.toast(t(`Commande ${orderRef} reprise dans le panier`, `Order ${orderRef} copied to your cart`), 'repeat'); ui.open('cart'); }}><Icon name="repeat" />{t('Recommander', 'Reorder')}</button>;
}

export function RestockPanel({ items }: { items: { p: PublicProduct; q: number; due: boolean }[] }) {
  const t = useT(); const l = useLocale(); const ui = useUI(); const add = useAddToCart(); const { add: put } = useCart(); const { b2c } = usePricing();
  return (
    <>
      {items.map(({ p, q, due }) => (
        <div key={p.code} className={`sn-rep ${due ? '' : 'sn-rep-ok'}`}><PackThumb item={p} size={40} /><div style={{ minWidth: 0 }}><b>{p.name[l]}</b><small>{due ? t('À recommander maintenant', 'Reorder now') : t('Dans 4 jours', 'In 4 days')} · {q} {b2c ? t('u.', 'u.') : t('ct', 'cs')}</small></div>
          <button type="button" className="sn-quick" style={{ width: 32, height: 32 }} onClick={() => add(p, q)} aria-label={`${t('Ajouter', 'Add')} ${p.name[l]}`}><Icon name="plus" /></button></div>
      ))}
      <button type="button" className="sn-btn sn-btn-go sn-btn-block" style={{ marginTop: 12 }} onClick={() => { const d = items.filter((x) => x.due && x.p.stock > 0); d.forEach((x) => put(x.p, x.q)); ui.toast(t(`${d.length} produits ajoutés au panier`, `${d.length} products added to cart`), 'cart'); ui.open('cart'); }}><Icon name="bolt" />{t('Réapprovisionner en un clic', 'Restock in one click')}</button>
    </>
  );
}

export function ContactRepButton({ label }: { label: string }) {
  const ui = useUI();
  return <button type="button" className="sn-btn sn-btn-line" onClick={() => ui.openDevis('appro')}>{label}</button>;
}
