import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getRepo } from '@fls/db';
import { DevisButton, Gate, SheetButton } from '@/components/Buttons';
import { Icon } from '@/components/Icon';
import { PageHero } from '@/components/PageHero';
import { UniverseCatalog } from '@/components/catalog/UniverseCatalog';
import { MariaCarousel } from '@/components/home/HomeWidgets';
import { ServerPackThumb } from '@/components/ServerPackThumb';
import { toPublic, UNIVERSE_ICON } from '@/lib/catalog';
import { alternates, pick, tr, type Locale } from '@/lib/i18n';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { locale: Locale; slug: string } }): Promise<Metadata> {
  const u = await (await getRepo()).universe(params.slug);
  if (!u) return {};
  return { title: pick(params.locale, u.name), description: pick(params.locale, u.desc), alternates: alternates(params.locale, `/univers/${u.slug}`), openGraph: { images: u.image ? [u.image] : [] } };
}

export default async function UniversePage({ params }: { params: { locale: Locale; slug: string } }) {
  const l = params.locale; const t = tr(l); const repo = await getRepo();
  const u = await repo.universe(params.slug); if (!u) notFound();
  const products = (await repo.products({ universe: u.slug })).map(toPublic);
  const arr = products.filter((p) => p.isNew || p.isDeal);
  const vol = l === 'en' ? u.volume.value.replace(',', '.').replace(/(\d) (\d)/, '$1,$2') : u.volume.value;
  return (
    <>
      <PageHero locale={l} img={u.image} icon={UNIVERSE_ICON[u.slug]} title={pick(l, u.name)} lede={pick(l, u.desc)} crumbs={[['/catalogue', t('Produits', 'Products')], [null, pick(l, u.name)]]}
        side={<div className="sn-volume"><b className="sn-cnt">{vol}</b><span>{pick(l, u.volume.label)}</span></div>} />
      <section className="sn-sec" style={{ paddingTop: 36 }}><div className="sn-wrap">
        <div className="sn-brands"><span>{t('Marques représentées', 'Brands carried')}</span>{u.brands.map((b) => <span key={b.name} className={`sn-bmark ${b.exclusive ? 'sn-bx' : ''}`}>{b.name}{b.exclusive && <small>{t('exclusivité', 'exclusive')}</small>}</span>)}</div>
        {u.slug === 'conserves' && <div style={{ marginTop: 28 }}><MariaCarousel /></div>}
        <Gate />
        <Suspense><UniverseCatalog products={products} subs={u.subcategories} /></Suspense>
        {arr.length > 0 && (
          <div className="sn-arr"><div><span className="sn-eye">{t('Remontée automatique', 'Updated automatically')}</span><h3>{t('Arrivages et offres du rayon', 'Arrivals and deals in this range')}</h3><p>{t('Les produits marqués « nouveau » ou « offre du mois » dans le back-office apparaissent ici sans intervention.', 'Products flagged “new” or “deal of the month” in the back office appear here automatically.')}</p></div>
            <div className="sn-arr-l">{arr.map((p) => <div className="sn-arr-i" key={p.code}><ServerPackThumb p={p} /><div style={{ minWidth: 0 }}><b>{p.name[l]}</b><small>{p.isNew ? t('Nouveau', 'New') : t('Offre du mois', 'Deal of the month')} · {p.pack[l]}</small></div><SheetButton code={p.code} className="sn-btn sn-btn-line sn-btn-sm">{t('Voir la fiche', 'View sheet')}</SheetButton></div>)}</div></div>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 40, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--sn-line)', paddingTop: 28 }}>
          <p style={{ color: 'var(--sn-muted)', maxWidth: '40em' }}>{t('Vous connaissez vos codes articles ? La commande rapide est plus efficace que la navigation par rayon.', 'Know your item codes? Quick order is faster than browsing by aisle.')}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="sn-btn sn-btn-nv" href={`/${l}/catalogue`}><Icon name="bolt" />{t('Commande rapide', 'Quick order')}</Link><DevisButton type="appro" note={`${pick(l, u.name)} : `} className="sn-btn sn-btn-line">{t('Devis volume', 'Volume quote')}</DevisButton></div>
        </div>
      </div></section>
    </>
  );
}
