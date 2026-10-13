import type { Metadata } from 'next';
import { DevisButton } from '@/components/Buttons';
import { Icon } from '@/components/Icon';
import { PageHero } from '@/components/PageHero';
import { Ph } from '@/components/Photo';
import { img } from '@/lib/content';
import { alternates, tr, type Locale } from '@/lib/i18n';

export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => {
  const t = tr(params.locale);
  return { title: t('Supérettes clés en main', 'Turnkey mini-markets'), description: t('Conception, aménagement et approvisionnement de supérettes pour promoteurs, institutions et entrepreneurs au Sénégal.', 'Design, fit-out and stocking of mini-markets for developers, institutions and entrepreneurs in Senegal.'), alternates: alternates(params.locale, '/cles-en-main') };
};

export default function Turnkey({ params }: { params: { locale: Locale } }) {
  const l = params.locale; const t = tr(l);
  const formats = [
    { n: t('Kiosque de quartier', 'Neighbourhood kiosk'), s: '15–30 m²', r: '250–400', d: t('Produits de première nécessité, boissons fraîches, rotation quotidienne.', 'Everyday essentials, cold drinks, daily rotation.'), li: [t('1 vitrine réfrigérée', '1 refrigerated display'), t('Étagères murales', 'Wall shelving'), t('Caisse mobile', 'Mobile till')] },
    { n: t('Supérette de proximité', 'Convenience mini-market'), s: '60–150 m²', r: l === 'en' ? '600–1,200' : '600–1 200', d: t('Le format le plus demandé par les promoteurs de résidences et les stations-service.', 'The format most requested by residential developers and fuel stations.'), li: [t('Froid positif et négatif', 'Chilled and frozen'), t('Gondoles et têtes de gondole', 'Gondolas and end caps'), t('Caisse et logiciel de stock', 'Till and stock software')], hl: true },
    { n: t('Libre-service', 'Self-service store'), s: '200 m²+', r: l === 'en' ? '1,500+' : '1 500+', d: t('Pour les institutions, cités universitaires et zones à forte densité.', 'For institutions, campuses and high-density areas.'), li: [t('Chambre froide', 'Cold room'), t('Réserve et quai', 'Back store and dock'), t('Formation des équipes', 'Staff training')] },
  ];
  const cases = [
    { img: 'n-armee', t: t('Supérettes de l’Armée sénégalaise', 'Senegalese Armed Forces mini-markets'), m: t('Référence FLS · 2022', 'FLS reference · 2022'), d: t('Conception, aménagement et approvisionnement de supérettes au profit de l’Armée sénégalaise.', 'Design, fit-out and stocking of mini-markets for the Senegalese Armed Forces.') },
    { img: 'u-superette', t: t('Résidence à Diamniadio', 'Residence in Diamniadio'), m: t('Supérette 110 m² · 900 références', '110 m² mini-market · 900 items'), d: t('Ouverte en même temps que la livraison des logements, réassort deux fois par semaine.', 'Opened with the handover of the homes, restocked twice a week.') },
    { img: 'entrepot', t: t('Campus universitaire', 'University campus'), m: t('Libre-service 240 m² · 1 600 références', '240 m² self-service · 1,600 items'), d: t('Horaires étendus, offre petit-déjeuner et produits à l’unité pour les étudiants.', 'Extended hours, breakfast offer and single units for students.') },
  ];
  const steps = [[t('Étude de zone et business plan', 'Site study and business plan'), t('Semaine 1–2', 'Week 1–2')], [t('Plan d’aménagement validé', 'Approved layout'), t('Semaine 2–3', 'Week 2–3')], [t('Installation du mobilier et du froid', 'Shelving and refrigeration installed'), t('Semaine 4–5', 'Week 4–5')], [t('Livraison et mise en rayon du stock initial', 'Opening stock delivered and shelved'), t('Semaine 6', 'Week 6')], [t('Ouverture et suivi des ventes', 'Opening and sales follow-up'), t('À partir du jour J', 'From opening day')]];
  return (
    <>
      <PageHero locale={l} img={img('u-superette')} icon="store" title={t('Supérettes et concepts clés en main', 'Turnkey mini-markets and concepts')} lede={t('Nous concevons, aménageons et approvisionnons des points de vente alimentaires pour le compte de promoteurs, d’institutions et d’entrepreneurs.', 'We design, fit out and stock food stores for developers, institutions and entrepreneurs.')} crumbs={[[null, t('Clés en main', 'Turnkey')]]}
        side={<div className="sn-volume"><b className="sn-cnt">120+</b><span>{t('supérettes partenaires approvisionnées', 'partner mini-markets supplied')}</span></div>} />
      <section className="sn-sec"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Trois formats', 'Three formats')}</span><h2 className="sn-h2">{t('Choisissez la taille, nous gérons le reste', 'Pick the size, we handle the rest')}</h2></div></div>
        <div className="sn-svc">{formats.map((f) => (
          <div key={f.n} className={f.hl ? 'sn-wide' : ''} style={f.hl ? { gridColumn: 'auto' } : undefined}>
            {f.hl && <span className="sn-pill sn-pill-g" style={{ alignSelf: 'flex-start' }}>{t('Le plus demandé', 'Most requested')}</span>}
            <h3>{f.n}</h3>
            <p style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}><span><b className="sn-num" style={{ fontSize: '1.5rem', color: 'inherit' }}>{f.s}</b></span><span><b className="sn-num" style={{ fontSize: '1.5rem', color: 'inherit' }}>{f.r}</b> {t('références', 'items')}</span></p>
            <p>{f.d}</p>
            <ul className="sn-checks" style={{ gridTemplateColumns: '1fr', margin: '8px 0 0' }}>{f.li.map((x) => <li key={x}><Icon name="check" /><span>{x}</span></li>)}</ul>
          </div>))}</div>
      </div></section>
      <section className="sn-turn sn-sec"><div className="sn-wrap sn-turn-in">
        <div><span className="sn-eye">{t('Déroulé d’un projet', 'How a project runs')}</span><h2 className="sn-h2">{t('Cinq étapes, un interlocuteur', 'Five steps, one contact')}</h2>
          <ol className="sn-steps">{steps.map(([b, s]) => <li key={b}><div><b>{b}</b><span>{s}</span></div></li>)}</ol>
          <DevisButton type="cles">{t('Étudier mon projet', 'Discuss my project')}</DevisButton></div>
        <div className="sn-turn-vis"><Ph name="entrepot" locale={l} icon="pallet" className="sn-turn-ph" /><div className="sn-turn-card"><b className="sn-num sn-cnt">45 {t('jours', 'days')}</b><span>{t('délai moyen jusqu’à l’ouverture', 'average time to opening')}</span></div></div>
      </div></section>
      <section className="sn-sec"><div className="sn-wrap">
        <div className="sn-sec-h"><div><span className="sn-eye">{t('Réalisations', 'Projects')}</span><h2 className="sn-h2">{t('Quelques points de vente ouverts avec FLS', 'Some stores opened with FLS')}</h2></div><span className="sn-note"><Icon name="warn" />{t('1re réalisation réelle, les autres sont des exemples', '1st project is real, the others are examples')}</span></div>
        <div className="sn-news">{cases.map((c) => <div className="sn-new" key={c.t}><Ph name={c.img} locale={l} icon="store" /><div className="sn-new-m"><span className="sn-cat">{c.m}</span></div><h3>{c.t}</h3><p>{c.d}</p></div>)}</div>
      </div></section>
    </>
  );
}
