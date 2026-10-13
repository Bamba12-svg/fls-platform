'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { PublicProduct } from '@/lib/catalog';
import { Icon } from '../Icon';
import { ProductCard } from '../ProductCard';
import { useLocale, usePricing, useT } from '../providers';

/** Grille produits d'un univers : filtres par famille (dans l'URL : ?famille=), stock et tri. */
export function UniverseCatalog({ products, subs }: { products: PublicProduct[]; subs: { slug: string; name: { fr: string; en: string } }[] }) {
  const t = useT(); const l = useLocale(); const sp = useSearchParams(); const router = useRouter(); const { unitTTC, logged } = usePricing();
  const sub = sp.get('famille') ?? 'all';
  const [stock, setStock] = useState(false); const [sort, setSort] = useState<'rel' | 'price' | 'new'>('rel');
  const setSub = (s: string) => { const q = new URLSearchParams(sp.toString()); if (s === 'all') q.delete('famille'); else q.set('famille', s); router.replace(`?${q.toString()}`, { scroll: false }); };
  const counts = useMemo(() => Object.fromEntries(subs.map((s) => [s.slug, products.filter((p) => p.subcategory === s.slug).length])), [products, subs]);
  let list = products.filter((p) => (sub === 'all' || p.subcategory === sub) && (!stock || p.stock > 0));
  if (sort === 'price' && logged) list = [...list].sort((a, b) => unitTTC(a) - unitTTC(b));
  if (sort === 'new') list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  return (
    <>
      <div className="sn-fbar">
        <div className="sn-chips" role="group" aria-label={t('Filtrer par famille', 'Filter by family')}>
          <button className="sn-chip" type="button" aria-pressed={sub === 'all'} onClick={() => setSub('all')}>{t('Tout', 'All')}<span className="sn-num">{products.length}</span></button>
          {subs.map((s) => <button key={s.slug} className="sn-chip" type="button" aria-pressed={sub === s.slug} onClick={() => setSub(s.slug)}>{s.name[l]}<span className="sn-num">{counts[s.slug]}</span></button>)}
        </div>
        <span className="sn-fbar-sp" />
        <label className="sn-chip" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} style={{ accentColor: 'var(--sn-green)' }} />{t('En stock uniquement', 'In stock only')}</label>
        <label className="sn-sr" htmlFor="sn-u-sort">{t('Trier', 'Sort')}</label>
        <select className="sn-sel" id="sn-u-sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="rel">{t('Pertinence', 'Relevance')}</option>
          {logged && <option value="price">{t('Prix unitaire croissant', 'Unit price, low to high')}</option>}
          <option value="new">{t('Nouveautés d’abord', 'Newest first')}</option>
        </select>
      </div>
      <p className="sn-sr" aria-live="polite">{list.length} {t('produits', 'products')}</p>
      {list.length ? <div className="sn-grid-p">{list.map((p) => <ProductCard key={p.code} p={p} />)}</div>
        : <div className="sn-empty"><Icon name="filter" /><b>{t('Aucun produit pour ces filtres', 'No products match these filters')}</b>{t('Retirez le filtre « En stock » ou choisissez une autre famille.', 'Clear the “In stock” filter or pick another family.')}</div>}
    </>
  );
}
