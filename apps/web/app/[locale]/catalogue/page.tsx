import type { Metadata } from 'next';
import { getRepo } from '@fls/db';
import { Gate } from '@/components/Buttons';
import { Crumbs } from '@/components/PageHero';
import { QuickOrderPortal } from '@/components/catalog/QuickOrderPortal';
import { toPublic } from '@/lib/catalog';
import { alternates, tr, type Locale } from '@/lib/i18n';

export const revalidate = 60;
export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => {
  const t = tr(params.locale);
  return { title: t('Portail de commande pro', 'Pro ordering portal'), description: t('Commandez par code article, au carton ou à la palette, avec votre grille tarifaire et le stock en temps réel.', 'Order by item code, by the case or pallet, with your price grid and live stock.'), alternates: alternates(params.locale, '/catalogue') };
};

export default async function Catalogue({ params }: { params: { locale: Locale } }) {
  const l = params.locale; const t = tr(l); const repo = await getRepo();
  const [products, universes] = await Promise.all([repo.products(), repo.universes()]);
  const inStock = products.filter((p) => p.stock > 0).length;
  return (
    <>
      <section className="sn-pagehero" style={{ background: 'var(--sn-navy)' }}><div className="sn-wrap sn-pagehero-in" style={{ paddingBlock: '36px 40px' }}>
        <div><Crumbs locale={l} items={[[null, t('Commande pro', 'Pro ordering')]]} /><h1 style={{ fontSize: 'clamp(1.8rem,3.4vw,2.6rem)' }}>{t('Portail de commande pro', 'Pro ordering portal')}</h1><p>{t('Saisissez un code article ou un nom, ajoutez au carton ou à la palette.', 'Type an item code or name, add by the case or pallet.')}</p></div>
        <div className="sn-volume" style={{ minWidth: 0 }}><b className="sn-num" style={{ fontSize: '1.8rem' }}>{inStock}/{products.length}</b><span>{t('références en stock', 'items in stock')}</span></div>
      </div></section>
      <section className="sn-sec sn-sec-alt" style={{ paddingTop: 28 }}><div className="sn-wrap">
        <Gate />
        <QuickOrderPortal products={products.map(toPublic)} universes={universes.map((u) => ({ slug: u.slug, name: u.name }))} />
      </div></section>
    </>
  );
}
