import Link from 'next/link';
import type { Metadata } from 'next';
import { getRepo } from '@fls/db';
import { DevisButton } from '@/components/Buttons';
import { Icon } from '@/components/Icon';
import { NewsCard } from '@/components/NewsCard';
import { Ph } from '@/components/Photo';
import { ProductCard } from '@/components/ProductCard';
import { HeroSlideshow } from '@/components/home/Hero';
import { PillarRail, ProfileTabs, QuickOrderDemo, type Profile } from '@/components/home/HomeWidgets';
import { MariaShowcase } from '@/components/home/MariaShowcase';
import { toPublic, UNIVERSE_ICON } from '@/lib/catalog';
import { img } from '@/lib/content';
import { alternates, pick, tr, type Locale } from '@/lib/i18n';

export const revalidate = 300;
export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => ({ alternates: alternates(params.locale) });

export default async function Home({ params }: { params: { locale: Locale } }) {
  const l = params.locale; const t = tr(l); const L = (p: string) => `/${l}${p}`;
  const repo = await getRepo();
  const [universes, all, posts] = await Promise.all([repo.universes(), repo.products(), repo.posts({ home: true })]);
  const flagged = all.filter((p) => p.isNew || p.isDeal);
  const featured = [...flagged, ...all.filter((p) => ['UL-033', 'RZ-BR50', 'HU-T20', 'SG-F09'].includes(p.code))].slice(0, 10).map(toPublic);
  const demo = all.filter((p) => ['UL-033', 'HU-T20', 'SG-F09', 'CO-MY5', 'RZ-BR50'].includes(p.code)).map(toPublic);
  const profiles: Profile[] = [
    { k: 'gr', img: img('entrepot'), icon: 'pallet', title: t('Grossistes, demi-grossistes et supérettes', 'Wholesalers, semi-wholesalers and mini-markets'),
      desc: t('Achetez à la palette ou au carton avec une grille dégressive qui suit vos volumes. Votre commercial voit vos encours et anticipe vos ruptures.', 'Buy by the pallet or case with volume pricing that follows your quantities. Your sales rep sees your balance and anticipates stock-outs.'),
      items: [[t('Prix palette', 'Pallet pricing'), t('jusqu’à −9 % au-delà d’une palette', 'up to −9 % beyond one pallet')], [t('Commande par code', 'Order by code'), t('une ligne en trois secondes', 'one line in three seconds')], [t('Encours visible', 'Visible balance'), t('plafond, échéances, factures PDF', 'limit, due dates, PDF invoices')], [t('Livraison groupée', 'Grouped delivery'), t('franco dès 250 000 F HT', 'free above 250,000 F excl. VAT')]], cta: [L('/catalogue'), t('Voir la grille pro', 'See trade pricing')] },
    { k: 'ff', img: img('u-conseil'), icon: 'chef', title: t('Restaurants, fast-foods et cafés', 'Restaurants, quick service and cafés'),
      desc: t('Des formats cuisine (bidons 20 L, seaux 5 L, cartons de 2,5 kg) et des fiches techniques complètes pour vos allergènes et votre traçabilité.', 'Kitchen sizes (20 L drums, 5 L tubs, 2.5 kg packs) and full technical sheets for allergens and traceability.'),
      items: [[t('Fiches allergènes', 'Allergen sheets'), t('14 allergènes, origine, lot', '14 allergens, origin, batch')], [t('Suggestions métier', 'Trade suggestions'), t('huiles, frites, sauces, emballages', 'oils, fries, sauces, packaging')], [t('Coût matière', 'Food cost'), t('calculateur et conseiller dédié', 'calculator and dedicated adviser')], ['Halal', t('certificats téléchargeables', 'downloadable certificates')]], cta: [L('/conseil'), t('Découvrir l’accompagnement', 'Explore our support')] },
    { k: 'gc', img: img('u-superette'), icon: 'building', title: t('Institutionnels et grands comptes', 'Institutions and key accounts'),
      desc: t('Cantines, centrales d’achat et promoteurs : contrats annuels, prix fermes, livraisons planifiées et supérettes livrées prêtes à ouvrir.', 'Canteens, buying groups and developers: annual contracts, fixed prices, scheduled deliveries and mini-markets delivered ready to open.'),
      items: [[t('Contrats cadre', 'Framework contracts'), t('prix fermes sur 6 ou 12 mois', 'fixed prices over 6 or 12 months')], [t('Appels d’offres', 'Tenders'), t('dossiers techniques fournis', 'technical files provided')], [t('Clés en main', 'Turnkey'), t('de l’étude à l’ouverture', 'from study to opening')], [t('Interlocuteur unique', 'Single contact'), t('un chargé grands comptes', 'a key account manager')]], cta: [L('/societe/grands-comptes'), t('Parler à un chargé grands comptes', 'Talk to a key account manager')] },
  ];
  const checks = (rows: [string, string][]) => rows.map(([b, s]) => <li key={b}><Icon name="check" /><span><b>{b}</b><span>{s}</span></span></li>);

  return (
    <>
      <HeroSlideshow>
        <p className="sn-kicker"><i />{t('Portail de commande pro ouvert 24 h/24', 'Pro ordering portal open 24/7')}</p>
        <h1 id="sn-h1">{t('Toute l’alimentation de votre commerce, au prix pro.', 'Everything your food business stocks, at trade prices.')}</h1>
        <p className="sn-hero-lede">{t('Épicerie, boissons, frais et surgelés livrés depuis Dakar aux grossistes, supérettes et restaurants du Sénégal. Votre grille tarifaire, le stock réel et vos factures au même endroit.', 'Groceries, beverages, fresh and frozen food delivered from Dakar to wholesalers, mini-markets and restaurants across Senegal. Your price grid, live stock and invoices in one place.')}</p>
        <div className="sn-hero-cta"><Link className="sn-btn sn-btn-go" href={L('/contact')}>{t('Ouvrir un compte pro', 'Open a pro account')}</Link><Link className="sn-btn sn-btn-glass" href={L('/catalogue')}>{t('Voir le catalogue', 'See the catalogue')}</Link></div>
        <p className="sn-hero-proof"><span><Icon name="truck" />{t('24 à 48 h à Dakar et Thiès', '24 to 48 h in Dakar and Thiès')}</span><span><Icon name="thermo" />{t('Froid 0–4 °C et −18 °C', 'Chilled 0–4 °C and −18 °C')}</span><span><Icon name="shield" />{t('Certificats halal fournis', 'Halal certificates provided')}</span></p>
      </HeroSlideshow>
      <PillarRail />

      <section className="sn-sec" style={{ paddingBottom: 0 }}><div className="sn-wrap"><div className="sn-stats">
        <div className="sn-stat"><b><span className="sn-cnt">{l === 'en' ? '2,500' : '2 500'}</span><small>t</small></b><span>{t('de produits alimentaires distribués chaque année', 'of food products distributed each year')}</span></div>
        <div className="sn-stat"><b><span className="sn-cnt">120</span><small>+</small></b><span>{t('supérettes partenaires approvisionnées', 'partner mini-markets supplied')}</span></div>
        <div className="sn-stat"><b><span className="sn-cnt">{l === 'en' ? '1,800' : '1 800'}</span></b><span>{t('références disponibles au catalogue pro', 'items in the trade catalogue')}</span></div>
        <div className="sn-stat"><b><span className="sn-cnt">13</span></b><span>{t('villes livrées depuis le dépôt de la Médina', 'cities served from the Médina depot')}</span></div>
      </div></div></section>

      <section className="sn-sec sn-qo-sec" aria-labelledby="sn-qo-h"><div className="sn-wrap sn-qo-grid">
        <div><span className="sn-eye">{t('Portail de commande pro', 'Pro ordering portal')}</span><h2 className="sn-h2" id="sn-qo-h">{t('Une ligne de commande en trois secondes', 'One order line in three seconds')}</h2>
          <p className="sn-sub">{t('Tapez un code article, la quantité, et c’est ajouté. Votre grille tarifaire s’applique toute seule, le stock est vérifié en direct et la barre du franco vous dit quand la livraison devient offerte.', 'Type an item code and a quantity, and it’s added. Your price grid applies automatically, stock is checked live and the free-delivery bar tells you when delivery becomes free.')}</p>
          <ul className="sn-checks" style={{ gridTemplateColumns: '1fr' }}>{checks([[t('Prix selon votre profil', 'Prices for your profile'), t('grossiste, demi-gros ou restaurateur', 'wholesaler, semi-wholesale or restaurant')], [t('Remises au volume automatiques', 'Automatic volume discounts'), t('−4 % dès 10 cartons, −9 % à la palette', '−4 % from 10 cases, −9 % by the pallet')], [t('Paniers types et recommande', 'Saved baskets and reorder'), t('votre commande habituelle en un clic', 'your usual order in one click')]])}</ul>
          <Link className="sn-btn sn-btn-nv" href={L('/catalogue')}><Icon name="bolt" />{t('Essayer la commande rapide', 'Try quick order')}</Link></div>
        <QuickOrderDemo products={demo} />
      </div></section>

      <section className="sn-sec sn-mx-sec" aria-labelledby="sn-maria-h"><div className="sn-wrap">
        <MariaShowcase />
      </div></section>

      <section className="sn-sec sn-sec-alt" aria-labelledby="sn-prof-h"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Pour chaque métier', 'For every trade')}</span><h2 className="sn-h2" id="sn-prof-h">{t('Le site s’adapte à votre façon d’acheter', 'The site adapts to the way you buy')}</h2></div></div>
        <ProfileTabs profiles={profiles} />
      </div></section>


      <section className="sn-sec sn-sec-alt" aria-labelledby="sn-feat-h"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Arrivages et offres du mois', 'New arrivals and monthly deals')}</span><h2 className="sn-h2" id="sn-feat-h">{t('Ce qui part vite cette semaine', 'Moving fast this week')}</h2></div><Link className="sn-link" href={L('/catalogue')}>{t('Commander par code article', 'Order by item code')}<Icon name="arrow" /></Link></div>
        <div className="sn-row-scroll">{featured.map((p) => <ProductCard key={p.code} p={p} />)}</div>
      </div></section>

      <section className="sn-turn sn-sec" aria-labelledby="sn-turn-h"><div className="sn-wrap sn-turn-in">
        <div><span className="sn-eye">{t('Supérettes clés en main', 'Turnkey mini-markets')}</span><h2 className="sn-h2" id="sn-turn-h">{t('De l’étude de zone au premier client en caisse', 'From site study to the first customer at the till')}</h2>
          <p className="sn-sub">{t('Pour les promoteurs immobiliers, les institutions et les entrepreneurs qui veulent ouvrir un point de vente alimentaire sans gérer dix fournisseurs.', 'For property developers, institutions and entrepreneurs who want to open a food store without juggling ten suppliers.')}</p>
          <ol className="sn-steps">{[[t('Étude de zone', 'Site study'), t('Population, concurrence, panier moyen attendu.', 'Population, competition, expected basket.')], [t('Plan et aménagement', 'Layout and fit-out'), t('Mobilier, froid, caisse et signalétique.', 'Shelving, refrigeration, till and signage.')], [t('Assortiment et premier stock', 'Range and opening stock'), t('600 à 1 200 références livrées et mises en rayon.', '600 to 1,200 items delivered and shelved.')], [t('Suivi après ouverture', 'Post-opening follow-up'), t('Réassort automatique et revue mensuelle des ventes.', 'Automatic restocking and a monthly sales review.')]].map(([b, s]) => <li key={b}><div><b>{b}</b><span>{s}</span></div></li>)}</ol>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><DevisButton type="cles">{t('Étudier mon projet', 'Discuss my project')}</DevisButton><Link className="sn-btn sn-btn-glass" href={L('/cles-en-main')}>{t('Voir les formats', 'See the formats')}</Link></div>
        </div>
        <div className="sn-turn-vis"><Ph name="u-superette" locale={l} icon="store" className="sn-turn-ph" /><div className="sn-turn-card"><b className="sn-num sn-cnt">45 {t('jours', 'days')}</b><span>{t('délai moyen entre la signature et l’ouverture', 'average from signature to opening')}</span></div></div>
      </div></section>

      <section className="sn-sec" aria-labelledby="sn-news-h"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Actualités', 'News')}</span><h2 className="sn-h2" id="sn-news-h">{t('Arrivages, salons et vie de FLS', 'Arrivals, fairs and life at FLS')}</h2></div><Link className="sn-link" href={L('/actualites')}>{t('Toutes les actualités', 'All news')}<Icon name="arrow" /></Link></div>
        <div className="sn-news">{posts.slice(0, 3).map((n) => <NewsCard key={n.slug} n={n} locale={l} />)}</div>
      </div></section>

      <section className="sn-sec" style={{ paddingTop: 0 }}><div className="sn-wrap"><div className="sn-cta">
        <div><h2>{t('Ouvrez votre compte pro en 48 heures', 'Open your pro account within 48 hours')}</h2><p>{t('Envoyez votre NINEA et votre registre du commerce. Un commercial valide votre profil et vous attribue votre grille tarifaire.', 'Send your NINEA and trade register number. A sales rep validates your profile and assigns your price grid.')}</p><Link className="sn-btn" href={L('/contact')} style={{ background: '#fff', color: 'var(--sn-green)', marginTop: 24 }}>{t('Commencer la demande', 'Start the application')}</Link></div>
        <ol className="sn-cta-steps">{[t('Vos informations et votre activité', 'Your details and business'), t('Téléversement NINEA et RC', 'Upload NINEA and trade register'), t('Validation et attribution de votre grille', 'Approval and price grid assignment')].map((s, i) => <li key={s}><b>{i + 1}</b>{s}</li>)}</ol>
      </div></div></section>
    </>
  );
}
