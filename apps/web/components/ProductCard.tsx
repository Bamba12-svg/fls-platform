'use client';

import Image from 'next/image';
import Link from 'next/link';
import { productPath, SHELF, type PublicProduct } from '@/lib/catalog';
import { Icon } from './Icon';
import { useCart, useLocale, useMoney, usePricing, useT, useUI, type CatalogItem } from './providers';

const hashN = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Visuel produit : packshot FLS, sinon photo des rayons FLS recadrée. */
export function PackThumb({ item, size, ratio }: { item: CatalogItem; size?: number; ratio?: boolean }) {
  const style = size ? { width: size, height: size, borderRadius: size > 50 ? 10 : 8, flex: 'none' as const } : undefined;
  if (item.image) return <div className="sn-pk sn-pk-ph" data-c={item.universe} style={style}><Image src={item.image} alt="" width={size ? size * 2 : 640} height={size ? size * 2 : 480} sizes={size ? `${size}px` : '(max-width:720px) 50vw, 280px'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>;
  const shelf = SHELF[item.universe]; const h = hashN(item.code);
  if (shelf) return <div className="sn-pk sn-pk-ph sn-pk-shelf" data-c={item.universe} style={style}><Image src={shelf} alt="" width={size ? size * 2 : 640} height={size ? size * 2 : 480} sizes={size ? `${size}px` : '280px'} style={{ width: '100%', height: '100%', objectFit: 'cover', transformOrigin: `${10 + (h % 80)}% ${35 + ((h >> 7) % 40)}%` }} /></div>;
  return <div className="sn-pk" data-c={item.universe} style={style}><Icon name="box" /></div>;
}

export function StockBadge({ stock }: { stock: number }) {
  const t = useT(); const l = useLocale(); const n = new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'fr-FR').format(stock);
  const [c, txt] = stock <= 0 ? ['no', t('Rupture · réassort sous 7 j', 'Out of stock · restock within 7 days')] : stock < 60 ? ['lo', t(`Stock limité · ${n} ct`, `Low stock · ${n} cs`)] : ['ok', t(`En stock · ${n} ct`, `In stock · ${n} cs`)];
  return <span className={`sn-stk sn-stk-${c}`}><i />{txt}</span>;
}

export function PriceBlock({ item }: { item: CatalogItem }) {
  const t = useT(); const l = useLocale(); const { logged, b2c, caseFor, unitTTC } = usePricing(); const { money } = useMoney();
  if (!logged) return <Link className="sn-price-lock sn-link" href={`/${l}/connexion`} style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--sn-muted)' }}><Icon name="lock" />{t('Prix pro après connexion', 'Trade price after sign-in')}</Link>;
  if (b2c) return <div className="sn-price sn-num">{money(unitTTC(item))}<small>{t('l’unité, TTC', 'per unit, incl. VAT')}</small></div>;
  return <div className="sn-price sn-num">{money(caseFor(item))}<small>{t('le carton, HT', 'per case, excl. VAT')}</small></div>;
}

export function useAddToCart() {
  const t = useT(); const l = useLocale(); const ui = useUI(); const { add } = useCart(); const { logged, b2c } = usePricing();
  return (item: CatalogItem, qty = 1) => {
    if (!logged) { ui.toast(t('Connectez-vous pour commander à vos prix pro.', 'Sign in to order at your trade prices.'), 'lock'); return false; }
    if (item.stock <= 0) { ui.toast(t('Ce produit est en rupture. Demandez un devis pour une date de réassort.', 'This item is out of stock. Request a quote for a restock date.'), 'warn'); return false; }
    add(item, qty);
    ui.toast(`${l === 'en' ? item.name.en : item.name.fr} · ${qty} ${b2c ? t('unité(s)', 'unit(s)') : t('carton(s)', 'case(s)')} ${t('ajouté(s)', 'added')}`, 'cart');
    return true;
  };
}

export function ProductCard({ p }: { p: PublicProduct }) {
  const t = useT(); const l = useLocale(); const ui = useUI(); const addToCart = useAddToCart(); const { logged } = usePricing();
  return (
    <article className="sn-card">
      <div style={{ position: 'relative' }}>
        <Link href={productPath(l, p)} tabIndex={-1} aria-hidden="true"><PackThumb item={p} /></Link>
        <div className="sn-flags">
          {p.isNew && <span className="sn-flag sn-flag-new">{t('Nouveau', 'New')}</span>}
          {p.isDeal && <span className="sn-flag sn-flag-deal">{t('Offre du mois', 'Deal of the month')}</span>}
          {p.halal && !['boissons', 'epicerie'].includes(p.universe) && <span className="sn-flag">Halal</span>}
        </div>
      </div>
      <div className="sn-card-b">
        <span className="sn-brand">{p.brand.name}</span>
        <h3><button type="button" onClick={() => ui.openSheet(p.code)}>{l === 'en' ? p.name.en : p.name.fr}</button></h3>
        <span className="sn-pack">{l === 'en' ? p.pack.en : p.pack.fr}</span>
        <StockBadge stock={p.stock} />
        <div className="sn-card-f">
          <PriceBlock item={p} />
          <button className="sn-quick" type="button" onClick={() => (logged ? addToCart(p) : location.assign(`/${l}/connexion`))} aria-label={`${t('Ajouter au panier', 'Add to cart')} : ${l === 'en' ? p.name.en : p.name.fr}`} disabled={logged && p.stock <= 0} style={logged && p.stock <= 0 ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}><Icon name="plus" /></button>
        </div>
      </div>
    </article>
  );
}
