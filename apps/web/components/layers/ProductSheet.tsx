'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { priceTiers } from '@fls/core';
import { ALLERGENS } from '@/lib/content';
import { productPath, type PublicProduct } from '@/lib/catalog';
import { Icon } from '../Icon';
import { PackThumb, StockBadge, useAddToCart } from '../ProductCard';
import { useCart, useLocale, useMoney, usePricing, useT, useUI } from '../providers';
import { Layer } from './Layer';

export function NutritionTable({ n }: { n: Record<string, number> | null }) {
  const t = useT(); const l = useLocale(); if (!n) return null;
  const nf = (v: number, d: number) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const rows: [string, string, number | undefined, boolean][] = [[t('Énergie', 'Energy'), 'kcal', n.energyKcal, true], [t('Matières grasses', 'Fat'), 'g', n.fat, false], [t('Glucides', 'Carbohydrates'), 'g', n.carbs, false], [t('dont sucres', 'of which sugars'), 'g', n.sugars, false], [t('Protéines', 'Protein'), 'g', n.protein, false], [t('Sel', 'Salt'), 'g', n.salt, false]];
  return <table className="sn-nutri"><caption className="sn-sr">{t('Valeurs nutritionnelles pour 100 g ou 100 ml', 'Nutrition per 100 g or 100 ml')}</caption><tbody>{rows.map(([k, u, v, int]) => v == null ? null : <tr key={k}><td>{k}</td><td>{nf(v, int ? 0 : 1)} {u}</td></tr>)}</tbody></table>;
}

export function AllergenList({ list }: { list: string[] }) {
  const t = useT(); const l = useLocale();
  return (
    <div><p className="sn-h4">{t('Allergènes', 'Allergens')}</p>
      <div className="sn-alg">{['gluten', 'lait', 'oeuf', 'poisson', 'crustaces', 'moutarde', 'celeri'].map((a) => <span key={a} className={list.includes(a) ? 'sn-hit' : ''}>{list.includes(a) && <Icon name="warn" />}{ALLERGENS[a]?.[l]}</span>)}</div>
      {!list.length && <p style={{ fontSize: '.82rem', color: 'var(--sn-muted)', marginTop: 6 }}>{t('Aucun des 14 allergènes réglementaires déclaré.', 'None of the 14 regulated allergens declared.')}</p>}
    </div>
  );
}

/** Grille dégressive du client connecté (ou prix TTC pour un particulier, ou encart de connexion). */
export function PriceTiers({ p }: { p: PublicProduct }) {
  const t = useT(); const l = useLocale(); const { money } = useMoney(); const { ctx, logged, b2c, priced, unitTTC } = usePricing(); const { lines } = useCart();
  const pp = priced(p); const q = lines.find((x) => x.code === p.code)?.qty ?? 0;
  if (!logged || !ctx || !pp) return (
    <div className="sn-gate" style={{ margin: 0 }}><span className="sn-gate-ic"><Icon name="lock" /></span><div><b>{t('Prix réservés aux professionnels', 'Prices for trade customers')}</b><span>{t('Connectez-vous pour voir votre grille.', 'Sign in to see your price grid.')}</span></div><Link className="sn-btn sn-btn-nv sn-btn-sm" href={`/${l}/connexion`}>{t('Se connecter', 'Sign in')}</Link></div>
  );
  if (b2c) return <div className="sn-price sn-num" style={{ fontSize: '1.6rem' }}>{money(unitTTC(p))}<small>{t('l’unité, TTC', 'per unit, incl. VAT')}</small></div>;
  const tiers = priceTiers(pp, ctx);
  return (
    <div><p className="sn-h4">{t('Grille dégressive', 'Volume pricing')}</p>
      <table className="sn-tiers"><thead><tr><th>{t('Quantité', 'Quantity')}</th><th>{t('Prix carton HT', 'Case price excl. VAT')}</th><th>{t('Prix unitaire HT', 'Unit price excl. VAT')}</th></tr></thead>
        <tbody>{tiers.map((x) => {
          const label = x.isPallet ? t(`Palette (${x.minCases} cartons et +)`, `Pallet (${x.minCases}+ cases)`) : x.maxCases ? t(`${x.minCases} à ${x.maxCases} cartons`, `${x.minCases} to ${x.maxCases} cases`) : t(`${x.minCases} cartons et +`, `${x.minCases}+ cases`);
          const cur = q >= x.minCases && (x.maxCases == null || q <= x.maxCases) || (q === 0 && x.minCases === 1);
          return <tr key={x.minCases} className={cur ? 'sn-cur' : ''}><td>{label}{x.percent > 0 && <> <span className="sn-pill sn-pill-g">−{x.percent} %</span></>}</td><td className="sn-num">{money(x.casePrice)}</td><td className="sn-num">{money(x.unitPrice)}</td></tr>;
        })}</tbody></table></div>
  );
}

export function AddPanel({ p, onDone }: { p: PublicProduct; onDone?: () => void }) {
  const t = useT(); const l = useLocale(); const ui = useUI(); const { logged, b2c } = usePricing(); const add = useAddToCart();
  const [q, setQ] = useState(b2c ? 1 : 10);
  useEffect(() => setQ(b2c ? 1 : 10), [b2c]);
  if (!logged) return null;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <span className="sn-step"><button type="button" onClick={() => setQ((x) => Math.max(1, x - 1))} aria-label={t('Diminuer', 'Decrease')}>−</button><input type="number" min={1} value={q} onChange={(e) => setQ(Math.max(1, Math.floor(Number(e.target.value) || 1)))} aria-label={t('Quantité', 'Quantity')} /><button type="button" onClick={() => setQ((x) => x + 1)} aria-label={t('Augmenter', 'Increase')}>+</button></span>
      <button className="sn-btn sn-btn-nv" type="button" disabled={p.stock <= 0} style={p.stock <= 0 ? { opacity: 0.4 } : undefined} onClick={() => { if (add(p, q)) onDone?.(); }}><Icon name="cart" />{t('Ajouter au panier', 'Add to cart')}</button>
      <button className="sn-btn sn-btn-line" type="button" onClick={() => ui.openDevis('appro', `${p.name[l]} (${p.code}) : `)}>{t('Devis volume', 'Volume quote')}</button>
    </div>
  );
}

export function ProductDocs({ p }: { p: PublicProduct }) {
  const t = useT();
  return (
    <div className="sn-docs" style={{ flexDirection: 'column' }}>
      <a className="sn-doc" href={`/api/products/${p.code}/fiche`} target="_blank" rel="noopener"><Icon name="pdf" />{t('Fiche technique', 'Technical sheet')}</a>
      {p.halal && <a className="sn-doc" href={`/api/products/${p.code}/fiche?doc=halal`} target="_blank" rel="noopener"><Icon name="pdf" />{t('Certificat halal', 'Halal certificate')}</a>}
    </div>
  );
}

/** Fiche produit rapide (fenêtre modale) : données publiques chargées à la demande. */
export function ProductSheet() {
  const t = useT(); const l = useLocale(); const ui = useUI(); const open = ui.layer === 'sheet';
  const [p, setP] = useState<PublicProduct | null>(null);
  useEffect(() => {
    if (!open || !ui.sheetCode) return; let alive = true; setP(null);
    fetch(`/api/products/${encodeURIComponent(ui.sheetCode)}`).then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive) setP(j); });
    return () => { alive = false; };
  }, [open, ui.sheetCode]);
  return (
    <Layer open={open} onClose={ui.close} kind="modal" labelledBy="sn-sheet-t">
      {!p ? <div style={{ padding: 48, textAlign: 'center' }}><span className="sn-spin" /> {t('Chargement…', 'Loading…')}</div> : (
        <div className="sn-sheet" role="document">
          <div className="sn-sheet-v"><PackThumb item={p} /><ProductDocs p={p} /></div>
          <div className="sn-sheet-b">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}><div><span className="sn-brand">{p.brand.name}</span><h2 id="sn-sheet-t">{p.name[l]}</h2></div><button className="sn-close" type="button" onClick={ui.close} aria-label={t('Fermer', 'Close')}><Icon name="close" /></button></div>
            <dl className="sn-kv"><dt>{t('Code article', 'Item code')}</dt><dd className="sn-num">{p.code}</dd><dt>{t('Conditionnement', 'Packaging')}</dt><dd>{p.pack[l]}</dd><dt>{t('Palette', 'Pallet')}</dt><dd>{p.casesPerPallet} {t('cartons', 'cases')}</dd>{p.origin && <><dt>{t('Origine', 'Origin')}</dt><dd>{p.origin}</dd></>}<dt>{t('Disponibilité', 'Availability')}</dt><dd><StockBadge stock={p.stock} /></dd></dl>
            <AllergenList list={p.allergens} />
            <PriceTiers p={p} />
            <details><summary className="sn-h4" style={{ cursor: 'pointer' }}>{t('Valeurs nutritionnelles (pour 100 g/ml)', 'Nutrition facts (per 100 g/ml)')}</summary><NutritionTable n={p.nutrition} /></details>
            <AddPanel p={p} onDone={ui.close} />
            <Link className="sn-link" href={productPath(l, p)} onClick={ui.close}>{t('Voir la fiche complète', 'See full product page')}<Icon name="arrow" /></Link>
          </div>
        </div>
      )}
    </Layer>
  );
}
