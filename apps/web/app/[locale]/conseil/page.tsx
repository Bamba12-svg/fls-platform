import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { PageHero } from '@/components/PageHero';
import { AdviceForm, FoodCostCalculator } from '@/components/forms/AdviceForms';
import { img } from '@/lib/content';
import { alternates, tr, type Locale } from '@/lib/i18n';

export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => {
  const t = tr(params.locale);
  return { title: t('Conseil & assistance métier', 'Business advice & support'), description: t('Carte, coûts matière, stocks et merchandising : un conseiller FLS vient chez vous. Calculateur de coût matière gratuit.', 'Menu, food costs, stock and merchandising: an FLS adviser comes to you. Free food-cost calculator.'), alternates: alternates(params.locale, '/conseil') };
};

export default function Advice({ params }: { params: { locale: Locale } }) {
  const l = params.locale; const t = tr(l);
  return (
    <>
      <PageHero locale={l} img={img('u-conseil')} icon="chef" title={t('Conseil & assistance métier', 'Business advice & support')} lede={t('Un conseiller FLS vient dans votre cuisine ou votre magasin pour travailler votre carte, vos coûts matière et vos rotations de stock. Le service est inclus pour les clients pro.', 'An FLS adviser visits your kitchen or shop to work on your menu, food costs and stock rotation. Included for trade customers.')} crumbs={[[null, t('Conseil', 'Advice')]]} />
      <section className="sn-sec"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Nos services', 'Our services')}</span><h2 className="sn-h2">{t('Ce que nos conseillers font avec vous', 'What our advisers do with you')}</h2></div></div>
        <div className="sn-svc">
          <div className="sn-wide"><Icon name="chef" /><h3>{t('Création et refonte de carte', 'Menu design and overhaul')}</h3><p>{t('Nous partons de votre clientèle et de votre équipement pour construire une carte courte, rentable et facile à tenir en service. Chaque plat reçoit sa fiche technique et son coût portion.', 'We start from your customers and equipment to build a short, profitable menu that is easy to run during service. Every dish gets a recipe card and a portion cost.')}</p><a className="sn-btn sn-btn-go" href="#sn-fm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>{t('Demander une visite', 'Request a visit')}</a></div>
          <div><Icon name="coins" /><h3>{t('Optimisation des coûts matière', 'Food cost optimisation')}</h3><p>{t('Comparaison des formats et des marques pour baisser le coût par portion sans toucher à la qualité.', 'Comparing sizes and brands to lower cost per portion without touching quality.')}</p></div>
          <div><Icon name="repeat" /><h3>{t('Gestion des stocks et rotations', 'Stock and rotation management')}</h3><p>{t('Niveaux de commande, FEFO, inventaire tournant : moins de pertes, moins de ruptures.', 'Reorder levels, FEFO, cycle counts: less waste, fewer stock-outs.')}</p></div>
          <div><Icon name="store" /><h3>{t('Merchandising de supérette', 'Mini-market merchandising')}</h3><p>{t('Plan de rayon, facing et têtes de gondole adaptés à votre quartier.', 'Planograms, facings and end caps suited to your neighbourhood.')}</p></div>
          <div><Icon name="shield" /><h3>{t('Hygiène et sécurité alimentaire', 'Food hygiene and safety')}</h3><p>{t('Formation des équipes aux bonnes pratiques et à la chaîne du froid.', 'Staff training on good practice and the cold chain.')}</p></div>
        </div>
      </div></section>
      <section className="sn-sec" style={{ paddingTop: 0 }}><div className="sn-wrap"><FoodCostCalculator /></div></section>
      <section className="sn-sec sn-sec-alt"><div className="sn-wrap sn-split">
        <div><span className="sn-eye">{t('Comment ça se passe', 'How it works')}</span><h2 className="sn-h2">{t('Un accompagnement en quatre temps', 'Support in four stages')}</h2>
          <ol className="sn-steps sn-steps-lt">{[[t('Diagnostic sur place', 'On-site review'), t('Une heure dans votre établissement, aux heures de service.', 'One hour on your premises, during service.')], [t('Plan d’action chiffré', 'Costed action plan'), t('Trois à cinq actions avec le gain attendu.', 'Three to five actions with the expected gain.')], [t('Mise en place', 'Implementation'), t('Fiches techniques, nouveaux formats, paniers types.', 'Recipe cards, new sizes, saved baskets.')], [t('Point à 30 jours', '30-day check-in'), t('Mesure des résultats et ajustements.', 'Results measured and adjusted.')]].map(([b, s]) => <li key={b}><div><b>{b}</b><span>{s}</span></div></li>)}</ol></div>
        <div className="sn-box" style={{ padding: 28 }} id="sn-fm"><h3 style={{ fontSize: '1.3rem' }}>{t('Demande d’accompagnement', 'Support request')}</h3><AdviceForm /></div>
      </div></section>
    </>
  );
}
