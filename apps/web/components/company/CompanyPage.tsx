import Link from 'next/link';
import { DevisButton } from '../Buttons';
import { Icon } from '../Icon';
import { PageHero } from '../PageHero';
import { Ph } from '../Photo';
import { img } from '@/lib/content';
import { tr, type Locale } from '@/lib/i18n';
import { NetworkMap } from './NetworkMap';
import { Timeline } from './Timeline';

export const SECTIONS = ['', 'implantation', 'qualite', 'grands-comptes', 'histoire'] as const;
export type Section = (typeof SECTIONS)[number];
export const sectionLabel = (l: Locale, s: Section) => {
  const t = tr(l);
  return { '': t('Mot de la Direction', 'A word from management'), implantation: t('Implantation & Groupe', 'Network & Group'), qualite: t('Qualité & hygiène', 'Quality & hygiene'), 'grands-comptes': t('Grands comptes', 'Key accounts'), histoire: t('Notre histoire', 'Our history') }[s];
};

export function CompanyPage({ locale: l, section }: { locale: Locale; section: Section }) {
  const t = tr(l); const label = sectionLabel(l, section);
  const checks = (rows: [string, string][]) => <ul className="sn-checks">{rows.map(([b, s]) => <li key={b}><Icon name="check" /><span><b>{b}</b><span>{s}</span></span></li>)}</ul>;
  return (
    <>
      <PageHero locale={l} img={img('entrepot')} icon="building" title={section === '' ? t('Qui sommes-nous', 'About us') : label}
        lede={t('Filiale du Groupe COSEMAD, FLS approvisionne depuis la Médina les professionnels de l’alimentation dans tout le Sénégal.', 'A COSEMAD Group company, FLS supplies food professionals across Senegal from its Médina base.')}
        crumbs={section === '' ? [[null, t('À propos', 'About us')]] : [['/societe', t('À propos', 'About us')], [null, label]]} />
      <div className="sn-subnav"><div className="sn-wrap"><nav className="sn-tabs" aria-label={t('Rubriques de la société', 'Company sections')}>
        {SECTIONS.map((s) => <Link key={s} className="sn-tab" href={`/${l}/societe${s ? `/${s}` : ''}`} aria-current={s === section ? 'page' : undefined} style={s === section ? { color: 'var(--sn-navy-9)', borderBottomColor: 'var(--sn-green)', textDecoration: 'none' } : { textDecoration: 'none' }}>{sectionLabel(l, s)}</Link>)}
      </nav></div></div>

      {section === '' && <section className="sn-sec"><div className="sn-wrap sn-split">
        <div><Ph name="entrepot" locale={l} icon="user" className="sn-prof-ph" />
          <div className="sn-sign"><Ph name="hero" locale={l} icon="user" /><div><b>{t('Le Directeur Général', 'The Managing Director')}</b><span>Fournisseur Libre Service</span></div></div></div>
        <div><span className="sn-note"><Icon name="warn" />{t('Proposition de texte, à valider par la Direction', 'Draft text, to be approved by management')}</span>
          <p className="sn-quote">{t('Notre métier est simple à dire et exigeant à faire : que le commerçant trouve le bon produit, au bon prix, le jour où il en a besoin.', 'Our job is simple to state and demanding to do: the shopkeeper finds the right product, at the right price, on the day it is needed.')}</p>
          <div className="sn-prose" style={{ marginTop: 24 }}><p>{t('Depuis la Médina, FLS a grandi avec ses clients : les boutiques de quartier d’abord, puis les grossistes des régions, les restaurants et les supérettes qui changent la façon dont les Sénégalais font leurs courses.', 'From the Médina, FLS has grown with its customers: neighbourhood shops first, then regional wholesalers, restaurants and the mini-markets changing how Senegalese households shop.')}</p><p>{t('Ce nouveau portail prolonge notre engagement. Il donne à chaque professionnel sa grille tarifaire, l’état réel de nos stocks et ses factures, à toute heure. Nos commerciaux et nos conseillers restent à vos côtés : la plateforme leur laisse simplement plus de temps pour vous accompagner.', 'This new portal extends that commitment. It gives every professional their price grid, our real stock levels and their invoices, at any hour. Our sales reps and advisers stay by your side: the platform simply gives them more time to support you.')}</p></div>
        </div></div></section>}

      {section === 'implantation' && <>
        <section className="sn-sec"><NetworkMap><span className="sn-eye">{t('Réseau logistique', 'Logistics network')}</span><h2 className="sn-h2">{t('Un dépôt central, 13 villes livrées', 'One central depot, 13 cities served')}</h2><p className="sn-sub">{t('Toutes les tournées partent de la Médina. Sélectionnez une ville pour voir la fréquence de livraison.', 'Every run leaves from the Médina. Select a city to see delivery frequency.')}</p></NetworkMap></section>
        <section className="sn-sec sn-sec-alt"><div className="sn-wrap">
          <div className="sn-sec-h"><div><span className="sn-eye">{t('Synergies de groupe', 'Group synergies')}</span><h2 className="sn-h2">{t('FLS au sein du Groupe COSEMAD', 'FLS within the COSEMAD Group')}</h2><p className="sn-sub">{t('Achats mutualisés, services partagés et une cellule informatique commune au siège du groupe.', 'Pooled purchasing, shared services and a common IT unit at group headquarters.')}</p></div></div>
          <div className="sn-syn">{([['CARREFOUR MÉDICAL', t('Distribution médicale', 'Medical distribution')], ['CMI', t('Filiale du groupe', 'Group company')], ['SONERCO', t('Filiale du groupe', 'Group company')], ['FLS', t('Distribution alimentaire', 'Food distribution'), true], ['SAINIMMO', t('Immobilier', 'Real estate')]] as [string, string, boolean?][]).map(([n, d, me]) => <div key={n} className={me ? 'sn-me' : ''}><b>{n}</b><span>{d}</span></div>)}</div>
        </div></section></>}

      {section === 'qualite' && <section className="sn-sec"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Service Qualité & Hygiène alimentaire', 'Food Quality & Hygiene department')}</span><h2 className="sn-h2">{t('Ce que nous contrôlons avant que le produit n’arrive chez vous', 'What we check before the product reaches you')}</h2></div></div>
        <div className="sn-q-grid">{[['box', t('Contrôle à réception', 'Inspection on receipt'), t('Dates limites, état des emballages et température vérifiés à chaque arrivage.', 'Use-by dates, packaging condition and temperature checked on every arrival.')], ['qr', t('Traçabilité par lot', 'Batch traceability'), t('Chaque carton expédié est rattaché à un lot fournisseur et à une date de réception.', 'Every case shipped is linked to a supplier batch and a receipt date.')], ['thermo', t('Chaîne du froid', 'Cold chain'), t('Enregistrement des températures en chambre froide et pendant le transport.', 'Temperatures logged in cold rooms and during transport.')], ['repeat', t('Rotation FEFO', 'FEFO rotation'), t('Le premier produit à expirer est le premier expédié.', 'The first item to expire is the first shipped.')], ['shield', t('Certificats halal', 'Halal certificates'), t('Certificats fournisseurs disponibles sur chaque fiche produit concernée.', 'Supplier certificates available on each relevant product sheet.')], ['doc', t('Retrait et rappel', 'Withdrawal and recall'), t('Procédure de rappel avec alerte des clients livrés sous 24 heures.', 'Recall procedure with alerts to delivered customers within 24 hours.')]].map(([i, h, d]) => <div key={i}><Icon name={i!} /><h3>{h}</h3><p>{d}</p></div>)}</div>
        <div className="sn-cold" aria-label={t('Températures par étape', 'Temperatures by stage')}>{[[t('Réception', 'Receipt'), '≤ 4 °C', t('frais contrôlé au quai', 'fresh checked at dock')], [t('Stockage frais', 'Chilled storage'), '0–4 °C', t('chambre froide positive', 'chilled room')], [t('Stockage surgelé', 'Frozen storage'), '−18 °C', t('chambre négative', 'freezer room')], ['Transport', '−18 / +4 °C', t('camions bi-température', 'dual-temperature trucks')]].map(([s, v, d]) => <div key={s}><small>{s}</small><b>{v}</b><span>{d}</span></div>)}</div>
      </div></section>}

      {section === 'grands-comptes' && <section className="sn-sec"><div className="sn-wrap sn-split">
        <Ph name="u-superette" locale={l} icon="building" className="sn-prof-ph" />
        <div><span className="sn-eye">{t('Grands comptes et centrales d’achat', 'Key accounts and buying groups')}</span><h2 className="sn-h2">{t('Des volumes planifiés, des prix tenus', 'Planned volumes, prices held')}</h2><p className="sn-sub">{t('Cantines scolaires et d’entreprise, hôpitaux, hôtels, chaînes de restauration et centrales d’achat : nous construisons une offre sur mesure et la tenons dans la durée.', 'School and staff canteens, hospitals, hotels, restaurant chains and buying groups: we build a tailored offer and keep to it.')}</p>
          {checks([[t('Contrat cadre', 'Framework contract'), t('prix fermes sur 6 ou 12 mois', 'fixed prices for 6 or 12 months')], [t('Calendrier de livraison', 'Delivery calendar'), t('créneaux réservés chaque semaine', 'slots reserved every week')], [t('Dossier appel d’offres', 'Tender file'), t('fiches techniques, certificats, références', 'sheets, certificates, references')], [t('Facturation consolidée', 'Consolidated invoicing'), t('multi-sites, relevé mensuel', 'multi-site, monthly statement')]])}
          <DevisButton type="gc" className="sn-btn sn-btn-nv">{t('Contacter un chargé grands comptes', 'Contact a key account manager')}</DevisButton></div>
      </div></section>}

      {section === 'histoire' && <section className="sn-sec"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Frise chronologique', 'Timeline')}</span><h2 className="sn-h2">{t('L’histoire de FLS au Sénégal', 'The story of FLS in Senegal')}</h2></div><span className="sn-note"><Icon name="warn" />{t('2022 : faits repris de fls.sn · 2023–2025 à valider', '2022: facts from fls.sn · 2023–2025 to be approved')}</span></div>
        <Timeline />
      </div></section>}
    </>
  );
}
