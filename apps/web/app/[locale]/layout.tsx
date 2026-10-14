import '@fontsource-variable/figtree';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '../fls.css';
import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getRepo } from '@fls/db';
import { Footer } from '@/components/Footer';
import { Preloader } from '@/components/Preloader';
import { Header, MobileNav, TabBar, type NavUniverse } from '@/components/Header';
import { Motion } from '@/components/Motion';
import { AppProviders } from '@/components/providers';
import { CartDrawer, OrderDone } from '@/components/layers/CartDrawer';
import { DevisDrawer } from '@/components/layers/DevisDrawer';
import { ProductSheet } from '@/components/layers/ProductSheet';
import { UNIVERSE_ICON } from '@/lib/catalog';
import { alternates, isLocale, locales, SITE_URL, tr } from '@/lib/i18n';

export const generateStaticParams = () => locales.map((locale) => ({ locale }));
export const viewport: Viewport = { themeColor: '#0A4A2A', width: 'device-width', initialScale: 1 };

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const l = isLocale(params.locale) ? params.locale : 'fr'; const t = tr(l);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('FLS · Distribution alimentaire B2B au Sénégal', 'FLS · B2B food distribution in Senegal'), template: '%s · FLS' },
    description: t('Fourniture Libre Service (Groupe COSEMAD) : épicerie, boissons, frais et surgelés livrés aux grossistes, supérettes et restaurants du Sénégal. Commande pro en ligne 24 h/24.', 'Fourniture Libre Service (COSEMAD Group): groceries, beverages, fresh and frozen food delivered to wholesalers, mini-markets and restaurants across Senegal. 24/7 online trade ordering.'),
    alternates: alternates(l),
    openGraph: { type: 'website', siteName: 'FLS · Fourniture Libre Service', locale: l === 'en' ? 'en_GB' : 'fr_SN', images: ['/img/f-sup-rayons.webp'] },
    icons: { icon: '/favicon.svg' },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const l = params.locale; const t = tr(l);
  const universes = await (await getRepo()).universes();
  const nav: NavUniverse[] = universes.map((u) => ({ slug: u.slug, name: u.name, icon: UNIVERSE_ICON[u.slug] ?? 'box', subs: u.subcategories.map((s) => ({ slug: s.slug, name: s.name })) }));
  const org = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: 'Fourniture Libre Service (FLS)', url: SITE_URL, logo: `${SITE_URL}/favicon.svg`, parentOrganization: { '@type': 'Organization', name: 'Groupe COSEMAD' }, email: 'fls@cosemad.sn', telephone: '+221338890666' },
      { '@type': 'WholesaleStore', '@id': `${SITE_URL}/#depot`, name: 'FLS · Dépôt de la Médina', image: `${SITE_URL}/img/entrepot.webp`, telephone: '+221338890666', priceRange: 'FCFA',
        address: { '@type': 'PostalAddress', streetAddress: 'Rue 39 x 22, Médina', addressLocality: 'Dakar', addressCountry: 'SN' }, geo: { '@type': 'GeoCoordinates', latitude: 14.6835, longitude: -17.4486 },
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '07:30', closes: '19:00' }] },
    ],
  };
  return (
    <html lang={l}>
      <body>
        <Preloader />
        <AppProviders locale={l}>
          <a className="sn-skip" href="#sn-main">{t('Aller au contenu', 'Skip to content')}</a>
          <Header universes={nav} />
          <main id="sn-main" tabIndex={-1}>{children}</main>
          <Footer locale={l} universes={universes} />
          <TabBar />
          <MobileNav universes={nav} />
          <CartDrawer />
          <DevisDrawer />
          <ProductSheet />
          <OrderDone />
          <Motion />
        </AppProviders>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </body>
    </html>
  );
}
