import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRepo } from '@fls/db';
import { Blocks } from '@/components/Blocks';
import { Crumbs } from '@/components/PageHero';
import { ProductCard } from '@/components/ProductCard';
import { ServerPackThumb } from '@/components/ServerPackThumb';
import { ProductDetail } from '@/components/catalog/ProductDetail';
import { toPublic } from '@/lib/catalog';
import { alternates, pick, SITE_URL, tr, type Locale } from '@/lib/i18n';

export const revalidate = 300;
type P = { params: { locale: Locale; universe: string; product: string } };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await (await getRepo()).product(params.product);
  if (!p) return {};
  const name = pick(params.locale, p.name);
  return { title: `${name} · ${p.code}`, description: `${p.brand.name} · ${pick(params.locale, p.pack)}. ${pick(params.locale, p.description) || ''}`.trim(), alternates: alternates(params.locale, `/categories/${p.universe}/${p.slug}`), openGraph: { images: p.image ? [p.image] : [] } };
}

export default async function ProductPage({ params }: P) {
  const l = params.locale; const t = tr(l); const repo = await getRepo();
  const p = await repo.product(params.product);
  if (!p || p.universe !== params.universe) notFound();
  const [u, siblings] = await Promise.all([repo.universe(p.universe), repo.products({ universe: p.universe })]);
  const related = siblings.filter((x) => x.code !== p.code && (x.subcategory === p.subcategory || x.brand.name === p.brand.name)).slice(0, 4).map(toPublic);
  // Données structurées : pas de prix public (tarifs réservés aux pros), offre « sur devis ».
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: pick(l, p.name), sku: p.code, brand: { '@type': 'Brand', name: p.brand.name },
    image: p.image ? `${SITE_URL}${p.image}` : undefined, description: pick(l, p.description) || pick(l, p.pack), countryOfOrigin: p.origin ?? undefined, category: u ? pick(l, u.name) : undefined,
    offers: { '@type': 'Offer', availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', seller: { '@id': `${SITE_URL}/#org` }, businessFunction: 'http://purl.org/goodrelations/v1#Sell', eligibleCustomerType: 'http://purl.org/goodrelations/v1#Business', url: `${SITE_URL}/${l}/categories/${p.universe}/${p.slug}` },
  };
  return (
    <section className="sn-sec" style={{ paddingTop: 36 }}><div className="sn-wrap">
      <Crumbs locale={l} dark items={[['/catalogue', t('Produits', 'Products')], [`/univers/${p.universe}`, u ? pick(l, u.name) : p.universe], [null, pick(l, p.name)]]} />
      <div className="sn-pdp">
        <div className="sn-pdp-v"><ServerPackThumb p={p} large />{p.isNew && <span className="sn-flag sn-flag-new">{t('Nouveau', 'New')}</span>}</div>
        <div>
          <span className="sn-brand">{p.brand.name}{p.brand.exclusive && ` · ${t('exclusivité FLS', 'FLS exclusive')}`}</span>
          <h1 className="sn-h2" style={{ marginTop: 6 }}>{pick(l, p.name)}</h1>
          {p.description && <p className="sn-sub">{pick(l, p.description)}</p>}
          <div style={{ marginTop: 20 }}><ProductDetail p={toPublic(p)} /></div>
        </div>
      </div>
      <div className="sn-art" style={{ maxWidth: 820, marginTop: 40 }}><Blocks blocks={p.blocks} locale={l} skip={['nutrition', 'allergens', 'product']} /></div>
      {related.length > 0 && <div style={{ marginTop: 56 }}><h2 className="sn-h2" style={{ fontSize: '1.5rem', marginBottom: 20 }}>{t('Dans la même famille', 'In the same family')}</h2><div className="sn-grid-p">{related.map((r) => <ProductCard key={r.code} p={r} />)}</div></div>}
      <p style={{ marginTop: 32 }}><Link className="sn-link" href={`/${l}/univers/${p.universe}`}>{t('Retour au rayon', 'Back to the range')}</Link></p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div></section>
  );
}
