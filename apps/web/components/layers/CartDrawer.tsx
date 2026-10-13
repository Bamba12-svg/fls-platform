'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { placeOrder } from '@/lib/actions';
import { Icon } from '../Icon';
import { Stepper } from '../Stepper';
import { useCart, useCartTotals, useLocale, useMoney, usePricing, useT, useUI } from '../providers';
import { Layer } from './Layer';
import { PackThumb } from '../ProductCard';

export function Sums({ compact = false }: { compact?: boolean }) {
  const t = useT(); const { money } = useMoney(); const tot = useCartTotals(); const { b2c } = usePricing();
  if (!tot) return null;
  return (
    <div className="sn-sum" style={compact ? { fontSize: '.85rem' } : undefined}>
      {b2c ? <div><span>{t('Total HT', 'Total excl. VAT')}</span><span className="sn-num">{money(tot.totalHT)}</span></div>
        : <><div><span>{t('Sous-total HT', 'Subtotal excl. VAT')}</span><span className="sn-num">{money(tot.subtotal)}</span></div>
          <div><span>{t('Livraison', 'Delivery')}</span><span className="sn-num">{tot.shipping ? money(tot.shipping) : t('Offerte', 'Free')}</span></div></>}
      <div><span>{t('TVA 18 %', 'VAT 18 %')}</span><span className="sn-num">{money(tot.vat)}</span></div>
      <div className="sn-sum-t"><b>{t('Total TTC', 'Total incl. VAT')}</b><span className="sn-num">{money(tot.totalTTC)}</span></div>
    </div>
  );
}

export function FrancoMeter() {
  const t = useT(); const { money } = useMoney(); const tot = useCartTotals(); const { b2c, ctx } = usePricing();
  if (!tot || b2c || !ctx) return null;
  const pct = Math.min(100, (tot.subtotal / ctx.settings.francoThreshold) * 100);
  return (
    <>
      <div className="sn-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={t('Progression vers le franco de port', 'Progress to free delivery')}><i style={{ width: `${pct}%` }} /></div>
      <p className={`sn-qo-fr ${tot.francoReached ? 'sn-ok' : ''}`}>{tot.francoReached ? <><Icon name="check" />{t('Franco de port atteint : livraison offerte', 'Free delivery threshold reached')}</> : <><Icon name="truck" />{t(`Encore ${money(tot.francoRemaining)} HT pour le franco de port`, `${money(tot.francoRemaining)} excl. VAT to free delivery`)}</>}</p>
    </>
  );
}

export function useCheckout() {
  const ui = useUI(); const t = useT(); const { lines, clear } = useCart(); const [pending, start] = useTransition();
  const run = () => start(async () => {
    const r = await placeOrder(lines);
    if (!r.ok) { ui.toast(r.error, 'warn'); return; }
    clear(); ui.setLastOrder({ ref: r.ref ?? '', total: r.data?.total ?? 0 }); ui.open('order');
  });
  return { run, pending, label: pending ? t('Validation…', 'Placing…') : t('Valider la commande', 'Place order') };
}

export function CartDrawer() {
  const t = useT(); const l = useLocale(); const ui = useUI(); const { lines, items, set } = useCart(); const { money } = useMoney();
  const { data: session } = useSession(); const tot = useCartTotals(); const { b2c } = usePricing(); const co = useCheckout();
  const open = ui.layer === 'cart';
  return (
    <Layer open={open} onClose={ui.close} kind="drawer" labelledBy="sn-cart-t">
      <div className="sn-drawer-h"><div><h2 id="sn-cart-t">{t('Panier', 'Cart')}</h2><p>{session ? session.user.company : t('Connectez-vous pour commander', 'Sign in to order')}</p></div><button className="sn-close" type="button" onClick={ui.close} aria-label={t('Fermer', 'Close')}><Icon name="close" /></button></div>
      <div className="sn-drawer-b">
        {!lines.length ? (
          <div className="sn-empty"><Icon name="cart" /><b>{t('Votre panier est vide', 'Your cart is empty')}</b><p>{t('Ajoutez des produits depuis le catalogue ou la commande rapide.', 'Add products from the catalogue or quick order.')}</p><Link className="sn-btn sn-btn-nv" href={`/${l}/catalogue`} onClick={ui.close} style={{ marginTop: 16 }}>{t('Ouvrir la commande rapide', 'Open quick order')}</Link></div>
        ) : (
          <ul className="sn-mini" style={{ maxHeight: 'none', gap: 14 }}>
            {lines.map((ln) => { const p = items[ln.code]; if (!p) return null; const line = tot?.lines.find((x) => x.code === ln.code); return (
              <li key={ln.code} style={{ gridTemplateColumns: '44px minmax(0,1fr) auto', alignItems: 'start' }}>
                <PackThumb item={p} size={44} />
                <div style={{ minWidth: 0 }}><b style={{ display: 'block', fontSize: '.88rem', color: 'var(--sn-navy-9)', lineHeight: 1.3 }}>{l === 'en' ? p.name.en : p.name.fr}</b><small style={{ color: 'var(--sn-muted)' }}>{l === 'en' ? p.pack.en : p.pack.fr}</small>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 8 }}><Stepper id={`sn-cq-${p.code}`} label={p.name.fr} value={ln.qty} onChange={(q) => set(p.code, q)} /><span className="sn-num" style={{ fontWeight: 600 }}>{line ? money(line.total) : '—'}</span></div></div>
                <button className="sn-x" type="button" onClick={() => set(p.code, 0)} aria-label={`${t('Retirer', 'Remove')} ${p.name.fr}`}><Icon name="close" /></button>
              </li>); })}
          </ul>
        )}
      </div>
      {lines.length > 0 && (
        <div className="sn-drawer-f">
          {session ? <><Sums /><FrancoMeter /><button className="sn-btn sn-btn-go sn-btn-block" type="button" style={{ marginTop: 12 }} disabled={co.pending} onClick={co.run}>{co.label}</button></>
            : <Link className="sn-btn sn-btn-nv sn-btn-block" href={`/${l}/connexion`} onClick={ui.close}>{t('Se connecter pour commander', 'Sign in to order')}</Link>}
          {b2c ? null : null}
        </div>
      )}
    </Layer>
  );
}

export function OrderDone() {
  const t = useT(); const l = useLocale(); const ui = useUI(); const { money } = useMoney(); const o = ui.lastOrder;
  const d = new Date(); d.setDate(d.getDate() + (d.getDay() === 6 ? 2 : 1));
  return (
    <Layer open={ui.layer === 'order'} onClose={ui.close} kind="modal" label={t('Commande enregistrée', 'Order placed')}>
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="sn-close" type="button" onClick={ui.close} aria-label={t('Fermer', 'Close')}><Icon name="close" /></button></div>
        <div className="sn-ok-panel"><div className="sn-ok-ic"><Icon name="check" /></div><h3>{t('Commande enregistrée', 'Order placed')}</h3>
          <p>{t(`Livraison prévue le ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}. Vous recevrez un SMS au départ du camion.`, `Delivery planned for ${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. You will get a text when the truck leaves.`)}</p>
          {o && <span className="sn-ref">{o.ref} · {money(o.total)} TTC</span>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}><Link className="sn-btn sn-btn-nv" href={`/${l}/compte`} onClick={ui.close}>{t('Suivre dans Mon compte', 'Track in My account')}</Link><button className="sn-btn sn-btn-line" type="button" onClick={ui.close}>{t('Continuer mes achats', 'Keep shopping')}</button></div>
        </div>
      </div>
    </Layer>
  );
}
