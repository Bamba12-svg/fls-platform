import Link from 'next/link';
import type { Metadata } from 'next';
import { getRepo } from '@fls/db';
import { Icon } from '@/components/Icon';
import { PageHero } from '@/components/PageHero';
import { AccountWizard, ApplicationForm, QuoteForm } from '@/components/forms/ContactForms';
import { img } from '@/lib/content';
import { alternates, pick, tr, type Locale } from '@/lib/i18n';

export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => {
  const t = tr(params.locale);
  return { title: t('Contact et ouverture de compte', 'Contact and account opening'), description: t('Ouvrez votre compte pro FLS (NINEA, RCCM), demandez un devis d’approvisionnement ou envoyez votre candidature.', 'Open your FLS trade account (NINEA, RCCM), request a supply quote or send a job application.'), alternates: alternates(params.locale, '/contact') };
};

function StreetMap({ label }: { label: string }) {
  const X = 30 + 3 * 62, Y = 30 + 2 * 55;
  return (
    <svg viewBox="0 0 420 220" role="img" aria-label={label}>
      {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={30 + i * 62} y1={10} x2={30 + i * 62} y2={210} stroke={i === 3 ? '#0A4A2A' : '#D5DDD7'} strokeWidth={i === 3 ? 6 : 10} strokeLinecap="round" />)}
      {Array.from({ length: 4 }, (_, j) => <line key={`h${j}`} x1={10} y1={30 + j * 55} x2={410} y2={30 + j * 55} stroke={j === 2 ? '#0A4A2A' : '#D5DDD7'} strokeWidth={j === 2 ? 6 : 10} strokeLinecap="round" />)}
      <text x={X + 8} y={22} fontSize={11} fontWeight={700} fill="#0A4A2A" fontFamily="Figtree Variable,sans-serif">Rue 39</text>
      <text x={16} y={Y - 9} fontSize={11} fontWeight={700} fill="#0A4A2A" fontFamily="Figtree Variable,sans-serif">Rue 22</text>
      <g transform={`translate(${X} ${Y})`}><circle r={22} fill="#006633" fillOpacity={0.15} /><path d="M0 -4 C0 -18 -12 -18 -12 -28 a12 12 0 0 1 24 0 c0 10 -12 10 -12 24Z" fill="#006633" transform="translate(0 4)" /><circle cy={-24} r={4.5} fill="#fff" /></g>
      <rect x={X + 14} y={Y + 10} width={58} height={22} rx={6} fill="#10241A" /><text x={X + 43} y={Y + 25} fontSize={11} fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="Figtree Variable,sans-serif">FLS</text>
    </svg>
  );
}

export default async function Contact({ params, searchParams }: { params: { locale: Locale }; searchParams: { type?: string } }) {
  const l = params.locale; const t = tr(l);
  const tab = searchParams.type === 'devis' || searchParams.type === 'candidature' ? searchParams.type : 'compte';
  const universes = (await (await getRepo()).universes()).map((u) => pick(l, u.name));
  const tabs: [string, string, string][] = [['compte', '', t('Ouvrir un compte pro', 'Open a pro account')], ['devis', '?type=devis', t('Devis d’approvisionnement', 'Supply quote')], ['candidature', '?type=candidature', t('Candidature', 'Job application')]];
  const mapQ = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Rue 39 x Rue 22, Médina, Dakar')}`;
  return (
    <>
      <PageHero locale={l} img={img('dakar')} icon="mail" title={t('Contact et ouverture de compte', 'Contact and account opening')} lede={t('Un commercial vous répond sous 24 heures ouvrées. Pour une ouverture de compte, préparez votre NINEA et votre RCCM.', 'A sales rep replies within one business day. To open an account, have your NINEA and RCCM ready.')} crumbs={[[null, 'Contact']]} />
      <section className="sn-sec" style={{ paddingTop: 36 }}><div className="sn-wrap sn-contact">
        <div className="sn-panel" style={{ padding: 'clamp(20px,3vw,32px)' }}>
          <nav className="sn-tabs" aria-label={t('Type de demande', 'Request type')} style={{ marginBottom: 24 }}>
            {tabs.map(([k, q, lab]) => <Link key={k} className="sn-tab" href={`/${l}/contact${q}`} scroll={false} aria-current={k === tab ? 'page' : undefined} style={k === tab ? { color: 'var(--sn-navy-9)', borderBottomColor: 'var(--sn-green)', textDecoration: 'none' } : { textDecoration: 'none' }}>{lab}</Link>)}
          </nav>
          {tab === 'compte' && <AccountWizard />}
          {tab === 'devis' && <QuoteForm universes={universes} />}
          {tab === 'candidature' && <ApplicationForm />}
        </div>
        <div>
          <div className="sn-card-c"><h3>{t('Siège et dépôt', 'Head office and depot')}</h3>
            <div className="sn-ci"><i><Icon name="pin" /></i><div><b>{t('Sénégal, Dakar, Médina', 'Senegal, Dakar, Médina')}</b><span>{t('Rue 39 x 22, en face du Collège Jean de la Fontaine', 'Rue 39 x 22, opposite Collège Jean de la Fontaine')}</span></div></div>
            <div className="sn-ci"><i><Icon name="phone" /></i><div><b>{t('Service commercial', 'Sales')}</b><span><a href="tel:+221338890666">+221 33 889 06 66</a><br /><a href="tel:+221786301010">+221 78 630 10 10</a></span></div></div>
            <div className="sn-ci"><i><Icon name="mail" /></i><div><b>E-mail</b><span><a href="mailto:fls@cosemad.sn">fls@cosemad.sn</a></span></div></div>
            <div className="sn-ci"><i><Icon name="clock" /></i><div><b>{t('Horaires du dépôt', 'Depot hours')}</b><span>{t('Du lundi au samedi, de 7 h 30 à 19 h', 'Monday to Saturday, 7:30am to 7pm')}</span></div></div>
            <a className="sn-btn sn-btn-glass" href={mapQ} target="_blank" rel="noopener"><Icon name="pin" />{t('Itinéraire Google Maps', 'Google Maps directions')}</a>
          </div>
          <div className="sn-street"><StreetMap label={t('Plan : intersection rue 39 et rue 22, Médina', 'Map: corner of Rue 39 and Rue 22, Médina')} /></div>
        </div>
      </div></section>
    </>
  );
}
