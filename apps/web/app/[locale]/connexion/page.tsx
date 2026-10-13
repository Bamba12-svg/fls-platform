import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getRepo } from '@fls/db';
import { PageHero } from '@/components/PageHero';
import { LoginForm } from '@/components/account/LoginForm';
import { alternates, tr, type Locale } from '@/lib/i18n';

export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => ({ title: tr(params.locale)('Connexion', 'Sign in'), alternates: alternates(params.locale, '/connexion'), robots: { index: false } });

export default async function Login({ params }: { params: { locale: Locale } }) {
  const l = params.locale; const t = tr(l);
  const demo = (await getRepo()).kind === 'demo' || process.env.SHOW_DEMO_ACCOUNTS === 'true';
  return (
    <>
      <PageHero locale={l} title={t('Espace client', 'Client area')} lede={t('Historique des commandes, suivi des livraisons, factures PDF et recommande en un clic.', 'Order history, delivery tracking, PDF invoices and one-click reorder.')} crumbs={[[null, t('Connexion', 'Sign in')]]} compact />
      <section className="sn-sec sn-sec-alt" style={{ paddingTop: 36 }}><div className="sn-wrap" style={{ maxWidth: 920 }}><div className="sn-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <Suspense><LoginForm demo={demo} /></Suspense>
      </div></div></section>
    </>
  );
}
