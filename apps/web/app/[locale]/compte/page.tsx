import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getRepo, type OrderDTO } from '@fls/db';
import { formatMoney } from '@fls/core';
import { ContactRepButton, ReorderButton, RestockPanel, SignOutButton } from '@/components/account/AccountActions';
import { Icon } from '@/components/Icon';
import { Crumbs } from '@/components/PageHero';
import { toPublic } from '@/lib/catalog';
import { SECTOR_PICKS, sectorOf, SEGMENT_LABEL } from '@/lib/content';
import { fdate, pick, tr, type Locale } from '@/lib/i18n';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => ({ title: tr(params.locale)('Mon compte', 'My account'), robots: { index: false } });

const STEP: Record<OrderDTO['status'], number> = { RECEIVED: 0, PREPARING: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 };

export default async function Account({ params }: { params: { locale: Locale } }) {
  const l = params.locale; const t = tr(l);
  const session = await getSession();
  if (!session?.user?.id) redirect(`/${l}/connexion?next=/${l}/compte`);
  const repo = await getRepo();
  const [me, orders, products] = await Promise.all([repo.customer(session.user.id), repo.orders(session.user.id), repo.products()]);
  if (!me) redirect(`/${l}/connexion`);
  const money = (x: number) => formatMoney(x, l);
  const pub = Object.fromEntries(products.map((p) => [p.code, toPublic(p)]));
  const unpaid = orders.filter((o) => o.invoice && !o.invoice.paidAt);
  const used = unpaid.reduce((s, o) => s + (o.invoice?.amount ?? 0), 0);
  const next = [...unpaid].sort((a, b) => (a.invoice!.dueDate < b.invoice!.dueDate ? -1 : 1))[0];
  const now = new Date(); const thisMonth = orders.filter((o) => { const d = new Date(o.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString(l === 'en' ? 'en-GB' : 'fr-FR', { month: 'short' }) }; });
  const vals = months.map((m) => orders.filter((o) => { const d = new Date(o.createdAt); return `${d.getFullYear()}-${d.getMonth()}` === m.key && o.status !== 'CANCELLED'; }).reduce((s, o) => s + o.total, 0) / 1e6);
  const max = Math.max(0.1, ...vals);
  const steps = [t('Reçue', 'Received'), t('En préparation', 'Preparing'), t('Expédiée', 'Shipped'), t('Livrée', 'Delivered')];
  const rep = SECTOR_PICKS[sectorOf(me.segment)].codes.slice(0, 4).map((c, i) => ({ p: pub[c]!, q: [8, 4, 2, 6][i]!, due: i < 2 })).filter((x) => x.p);
  const nf1 = (v: number) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(v);
  return (
    <>
      <section className="sn-pagehero" style={{ background: 'var(--sn-navy)' }}><div className="sn-wrap sn-pagehero-in" style={{ paddingBlock: '36px 40px' }}>
        <div><Crumbs locale={l} items={[[null, t('Mon compte', 'My account')]]} /><h1 style={{ fontSize: 'clamp(1.8rem,3.4vw,2.6rem)' }}>{me.companyName}</h1><p>{me.city} · {pick(l, SEGMENT_LABEL[me.segment])} · {t('client depuis', 'client since')} {new Date(me.createdAt).getFullYear()}</p></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="sn-btn sn-btn-go" href={`/${l}/catalogue`}><Icon name="bolt" />{t('Nouvelle commande', 'New order')}</Link><SignOutButton /></div>
      </div></section>
      <section className="sn-sec sn-sec-alt" style={{ paddingTop: 28 }}><div className="sn-wrap"><div className="sn-dash">
        {me.creditLimit > 0
          ? <div className="sn-kpi sn-kpi-nv"><span>{t('Encours utilisé', 'Credit used')}</span><b className="sn-num">{money(used)}</b><div className="sn-meter"><i style={{ width: `${Math.min(100, (used / me.creditLimit) * 100)}%` }} /></div><small>{t('sur un plafond de', 'of a limit of')} {money(me.creditLimit)}</small></div>
          : <div className="sn-kpi sn-kpi-nv"><span>{t('Paiement', 'Payment')}</span><b>Wave · Orange Money</b><small>{t('ou carte bancaire', 'or bank card')}</small></div>}
        <div className="sn-kpi"><span>{t('Commandes ce mois', 'Orders this month')}</span><b className="sn-num sn-cnt">{thisMonth.length}</b><small>{orders.filter((o) => o.status === 'SHIPPED').length} {t('en cours de livraison', 'out for delivery')}</small></div>
        <div className="sn-kpi"><span>{t('Commandes au total', 'Total orders')}</span><b className="sn-num sn-cnt">{orders.length}</b><small>{t('depuis l’ouverture du compte', 'since the account opened')}</small></div>
        <div className="sn-kpi"><span>{t('Prochaine échéance', 'Next due date')}</span><b className="sn-num">{next ? new Date(next.invoice!.dueDate).toLocaleDateString(l === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit' }) : '—'}</b><small>{next ? `${t('Facture', 'Invoice')} ${next.invoice!.ref}` : t('Aucune facture à régler', 'No invoice due')}</small></div>

        <div className="sn-panel sn-c8"><h3>{t('Commandes et livraisons', 'Orders and deliveries')}<Link className="sn-link" href={`/${l}/catalogue`} style={{ fontSize: '.85rem' }}>{t('Commander', 'Order')}<Icon name="arrow" /></Link></h3>
          {orders.length ? <div className="sn-ord">{orders.slice(0, 6).map((o) => { const s = STEP[o.status]; return (
            <div className="sn-ord-i" key={o.id}><div><b>{o.ref}</b><small>{fdate(l, o.createdAt)} · {o.lines.length} {t('lignes', 'lines')}</small></div>
              <div>{s < 0 ? <span className="sn-pill sn-pill-w">{t('Annulée', 'Cancelled')}</span> : <><div className="sn-track" aria-label={steps[s]}>{steps.slice(1).map((x, i) => <span key={x} className={i < s ? 'sn-done' : ''} />)}</div><div className="sn-track-l">{steps.map((x, i) => (i === s ? <b key={x}>{x}</b> : <span key={x}>{x}</span>))}</div></>}</div>
              <span className="sn-num" style={{ fontWeight: 600, color: 'var(--sn-navy-9)', whiteSpace: 'nowrap' }}>{money(o.total)}</span>
              <ReorderButton orderRef={o.ref} lines={o.lines.map((x) => ({ code: x.code, qty: x.qty }))} products={pub} /></div>); })}</div>
            : <div className="sn-empty"><Icon name="cart" /><b>{t('Aucune commande pour l’instant', 'No orders yet')}</b></div>}
        </div>

        <div className="sn-panel sn-c4"><h3>{t('Réassort suggéré', 'Suggested restock')}</h3><p style={{ fontSize: '.82rem', color: 'var(--sn-muted)', margin: '-6px 0 8px' }}>{t('Calculé sur votre rythme d’achat habituel.', 'Based on your usual buying pattern.')}</p><RestockPanel items={rep} /></div>

        <div className="sn-panel sn-c6"><h3>{t('Factures', 'Invoices')}</h3>
          {orders.filter((o) => o.invoice).slice(0, 5).map((o) => (
            <div className="sn-inv" key={o.invoice!.ref}><div><b>{o.invoice!.ref}</b><br /><small style={{ color: 'var(--sn-muted)' }}>{fdate(l, o.createdAt)}</small></div><span className="sn-num" style={{ fontWeight: 600 }}>{money(o.invoice!.amount)}</span>
              <span className={`sn-pill sn-pill-${o.invoice!.paidAt ? 'g' : 'w'}`}>{o.invoice!.paidAt ? t('Réglée', 'Paid') : t('À régler', 'Due')}</span>
              <a className="sn-doc" href={`/api/invoices/${o.invoice!.ref}?lang=${l}`} target="_blank" rel="noopener" aria-label={`${t('Télécharger la facture', 'Download invoice')} ${o.invoice!.ref}`}><Icon name="pdf" />PDF</a></div>))}
          {!orders.some((o) => o.invoice) && <p style={{ color: 'var(--sn-muted)' }}>{t('Aucune facture.', 'No invoices.')}</p>}
        </div>

        <div className="sn-panel sn-c6"><h3>{t('Achats des six derniers mois', 'Purchases, last six months')}<span className="sn-pill sn-pill-m">{t('en millions F CFA TTC', 'millions F CFA incl. VAT')}</span></h3>
          <div className="sn-bars" role="img" aria-label={t('Histogramme des achats mensuels', 'Monthly purchases bar chart')}>{vals.map((v, i) => <div key={months[i]!.key}><em>{nf1(v)}</em><i style={{ height: `${Math.max(2, Math.round((v / max) * 100))}%` }} /><span>{months[i]!.label}</span></div>)}</div>
          <p style={{ fontSize: '.78rem', color: 'var(--sn-muted)', marginTop: 10 }}>{t('Dernier mois : mois en cours.', 'Last month: current month.')}</p></div>

        {me.salesRep && <div className="sn-panel sn-c12" style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}><span className="sn-av" style={{ width: 52, height: 52, fontSize: '1rem', background: 'var(--sn-green)' }}>{me.salesRep.split(/\s+/).map((w) => w[0]).join('').slice(0, 2)}</span>
          <div style={{ flex: 1, minWidth: 200 }}><b style={{ color: 'var(--sn-navy-9)' }}>{t('Votre commercial(e)', 'Your sales rep')} : {me.salesRep}</b><p style={{ color: 'var(--sn-muted)', fontSize: '.9rem' }}>{t('Joignable du lundi au samedi de 8 h à 18 h.', 'Available Monday to Saturday, 8am–6pm.')}</p></div>
          <ContactRepButton label={t('Lui écrire', 'Send a message')} /></div>}
      </div></div></section>
    </>
  );
}
