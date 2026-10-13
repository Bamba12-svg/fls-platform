'use client';

import type { PublicProduct } from '@/lib/catalog';
import { AddPanel, AllergenList, NutritionTable, PriceTiers, ProductDocs } from '../layers/ProductSheet';
import { StockBadge } from '../ProductCard';
import { useLocale, useT } from '../providers';

/** Partie interactive de la page produit (prix selon session, ajout au panier). */
export function ProductDetail({ p }: { p: PublicProduct }) {
  const t = useT(); const l = useLocale();
  return (
    <div className="sn-sheet-b" style={{ padding: 0 }}>
      <dl className="sn-kv"><dt>{t('Code article', 'Item code')}</dt><dd className="sn-num">{p.code}</dd><dt>{t('Conditionnement', 'Packaging')}</dt><dd>{p.pack[l]}</dd><dt>{t('Palette', 'Pallet')}</dt><dd>{p.casesPerPallet} {t('cartons', 'cases')}</dd>{p.origin && <><dt>{t('Origine', 'Origin')}</dt><dd>{p.origin}</dd></>}<dt>{t('Disponibilité', 'Availability')}</dt><dd><StockBadge stock={p.stock} /></dd></dl>
      <PriceTiers p={p} />
      <AddPanel p={p} />
      <AllergenList list={p.allergens} />
      <div><p className="sn-h4">{t('Valeurs nutritionnelles (pour 100 g/ml)', 'Nutrition facts (per 100 g/ml)')}</p><NutritionTable n={p.nutrition} /></div>
      <div><p className="sn-h4">{t('Documents', 'Documents')}</p><ProductDocs p={p} /></div>
    </div>
  );
}
