'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SECTOR_PICKS, sectorOf } from '@/lib/content';
import type { PublicProduct } from '@/lib/catalog';
import { Icon } from '../Icon';
import { FrancoMeter, Sums, useCheckout } from '../layers/CartDrawer';
import { PackThumb, StockBadge, useAddToCart } from '../ProductCard';
import { useCart, useCartTotals, useLocale, useMoney, usePricing, useT, useUI } from '../providers';

type Basket = { id: string; name: string; lines: { code: string; qty: number }[] };
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Portail de commande rapide : saisie par code, tableau filtrable, stock rafraîchi, panier latéral, paniers types. */
export function QuickOrderPortal({ products: initial, universes }: { products: PublicProduct[]; universes: { slug: string; name: { fr: string; en: string } }[] }) {
  const t = useT(); const l = useLocale(); const ui = useUI(); const { money } = useMoney(); const { data: session } = useSession();
  const { logged, b2c, caseFor, unitTTC, ctx } = usePricing(); const { lines, set } = useCart(); const add = useAddToCart();
  const [products, setProducts] = useState(initial); const [flash, setFlash] = useState<Record<string, number>>({});
  const by = useMemo(() => Object.fromEntries(products.map((p) => [p.code, p])), [products]);

  /* Stock rafraîchi toutes les 15 s depuis /api/stock */
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden) return;
      const r = await fetch('/api/stock', { cache: 'no-store' }).then((x) => (x.ok ? x.json() : null)).catch(() => null) as Record<string, number> | null;
      if (!r) return;
      setProducts((ps) => { const changed: Record<string, number> = {}; const next = ps.map((p) => { const s = r[p.code]; if (s != null && s !== p.stock) { changed[p.code] = Date.now(); return { ...p, stock: s }; } return p; }); if (Object.keys(changed).length) setFlash(changed); return next; });
    }, 15000);
    return () => clearInterval(id);
  }, []);

  /* Saisie rapide avec autocomplétion */
  const qi = useRef<HTMLInputElement>(null); const qq = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState(''); const [picked, setPicked] = useState<string | null>(null); const [sel, setSel] = useState(0); const [acOpen, setAcOpen] = useState(false);
  const [qty, setQty] = useState(1); const [unit, setUnit] = useState<'ct' | 'pal'>('ct');
  const ac = useMemo(() => { const s = q.trim().toLowerCase(); return s && !picked ? products.filter((p) => `${p.code} ${p.name[l]} ${p.brand.name}`.toLowerCase().includes(s)).slice(0, 7) : []; }, [q, picked, products, l]);
  useEffect(() => {
    if (location.hash === '#recherche') setTimeout(() => qi.current?.focus(), 80);
    const k = (e: KeyboardEvent) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName ?? '')) { e.preventDefault(); qi.current?.focus(); } };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, []);
  const pick = (p: PublicProduct) => { setQ(`${p.code} · ${p.name[l]}`); setPicked(p.code); setAcOpen(false); setTimeout(() => qq.current?.select(), 0); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let code = picked; if (!code) { const v = q.trim().toUpperCase(); code = (by[v]?.code ?? ac[sel]?.code) || null; }
    const p = code ? by[code] : undefined;
    if (!p) { ui.toast(t('Code introuvable. Essayez UL-033 ou tapez un nom.', 'Code not found. Try UL-033 or type a name.'), 'warn'); qi.current?.focus(); return; }
    const n = Math.max(1, qty) * (unit === 'pal' && !b2c ? p.casesPerPallet : 1);
    if (add(p, n)) { setQ(''); setPicked(null); setQty(1); qi.current?.focus(); }
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (!acOpen || !ac.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => (s + (e.key === 'ArrowDown' ? 1 : -1) + ac.length) % ac.length); }
    if (e.key === 'Enter' && !picked) { e.preventDefault(); const p = ac[sel]; if (p) pick(p); }
    if (e.key === 'Escape') setAcOpen(false);
  };
  const hl = (s: string) => { const v = q.trim(); if (!v) return s; return s.split(new RegExp(`(${esc(v)})`, 'ig')).map((part, i) => (part.toLowerCase() === v.toLowerCase() ? <mark key={i}>{part}</mark> : part)); };

  /* Tableau */
  const [uf, setUf] = useState('all'); const [filter, setFilter] = useState(''); const [inStock, setInStock] = useState(false);
  const [rowQ, setRowQ] = useState<Record<string, number>>({});
  const list = products.filter((p) => (uf === 'all' || p.universe === uf) && (!inStock || p.stock > 0) && (!filter.trim() || `${p.code} ${p.name[l]} ${p.brand.name}`.toLowerCase().includes(filter.trim().toLowerCase())));
  const inCart = (code: string) => lines.find((x) => x.code === code)?.qty ?? 0;
  const rowPut = (p: PublicProduct) => {
    const n = Math.max(1, rowQ[p.code] ?? (inCart(p.code) || 1));
    if (inCart(p.code)) { set(p.code, n); ui.toast(t('Quantité mise à jour', 'Quantity updated'), 'cart'); } else add(p, n);
  };

  /* Paniers types (clients connectés) */
  const [baskets, setBaskets] = useState<Basket[]>([]);
  useEffect(() => { if (!session) { setBaskets([]); return; } fetch('/api/account/baskets').then((r) => (r.ok ? r.json() : [])).then(setBaskets).catch(() => {}); }, [session]);
  const sector = sectorOf(session?.user.segment); const picks = SECTOR_PICKS[sector];
  const tot = useCartTotals(); const co = useCheckout();
  const price = (p: PublicProduct, n = 1) => (b2c ? unitTTC(p) : caseFor(p, n));

  return (
    <div className="sn-portal"><div style={{ minWidth: 0 }}>
      <form className="sn-qbar" autoComplete="off" role="search" onSubmit={submit} id="recherche">
        <div style={{ position: 'relative' }}><label htmlFor="sn-qi">{t('Code article ou nom du produit', 'Item code or product name')} <span style={{ opacity: 0.7 }}>· {t('raccourci', 'shortcut')} /</span></label>
          <input id="sn-qi" ref={qi} value={q} placeholder={t('Ex. : UL-033, riz, frites…', 'E.g.: UL-033, rice, fries…')} role="combobox" aria-expanded={acOpen && ac.length > 0} aria-controls="sn-ac" aria-autocomplete="list" aria-activedescendant={acOpen && ac[sel] ? `sn-ac-${sel}` : undefined}
            onChange={(e) => { setQ(e.target.value); setPicked(null); setSel(0); setAcOpen(true); }} onKeyDown={onKey} onBlur={() => setTimeout(() => setAcOpen(false), 150)} /></div>
        <div><label htmlFor="sn-qq">{b2c ? t('Unités', 'Units') : t('Quantité', 'Quantity')}</label><input id="sn-qq" ref={qq} type="number" min={1} value={qty} inputMode="numeric" onChange={(e) => setQty(Math.max(1, Math.floor(+e.target.value || 1)))} /></div>
        <div><label htmlFor="sn-qu">{t('Unité de vente', 'Sales unit')}</label><select id="sn-qu" value={unit} disabled={b2c} onChange={(e) => setUnit(e.target.value as 'ct' | 'pal')}><option value="ct">{b2c ? t('Unité', 'Unit') : t('Carton', 'Case')}</option>{!b2c && <option value="pal">{t('Palette', 'Pallet')}</option>}</select></div>
        <button className="sn-btn sn-btn-go" type="submit"><Icon name="plus" />{t('Ajouter', 'Add')}</button>
        <ul className="sn-ac" id="sn-ac" role="listbox" hidden={!acOpen || !q.trim() || !!picked}>
          {ac.length ? ac.map((p, i) => <li key={p.code} role="option" id={`sn-ac-${i}`} aria-selected={i === sel} onMouseDown={(e) => { e.preventDefault(); pick(p); }}><PackThumb item={p} size={40} /><div style={{ minWidth: 0 }}><b>{hl(p.name[l])}</b><small>{hl(p.code)} · {p.pack[l]}</small></div><span className={`sn-stk sn-stk-${p.stock <= 0 ? 'no' : p.stock < 60 ? 'lo' : 'ok'}`}><i /></span></li>)
            : <li aria-disabled="true" style={{ gridTemplateColumns: '1fr', color: 'var(--sn-muted)' }}>{t('Aucun produit ne correspond.', 'No matching product.')}</li>}
        </ul>
      </form>

      <div className="sn-fbar" style={{ marginBlock: '20px 0' }}>
        <div className="sn-chips" role="group" aria-label={t('Univers', 'Ranges')}><button type="button" className="sn-chip" aria-pressed={uf === 'all'} onClick={() => setUf('all')}>{t('Tous', 'All')}</button>{universes.map((u) => <button key={u.slug} type="button" className="sn-chip" aria-pressed={uf === u.slug} onClick={() => setUf(u.slug)}>{u.name[l]}</button>)}</div>
        <span className="sn-fbar-sp" />
        <label className="sn-sr" htmlFor="sn-cf">{t('Filtrer le tableau', 'Filter the table')}</label><input className="sn-in" id="sn-cf" style={{ maxWidth: 220, borderRadius: 999, padding: '8px 14px' }} placeholder={t('Filtrer le tableau', 'Filter the table')} value={filter} onChange={(e) => setFilter(e.target.value)} />
        <label className="sn-chip" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} style={{ accentColor: 'var(--sn-green)' }} />{t('En stock', 'In stock')}</label>
      </div>

      <div className="sn-tbl-w"><table className="sn-tbl"><caption className="sn-sr">{t('Catalogue pro, prix selon votre profil', 'Trade catalogue, prices for your profile')}</caption>
        <thead><tr><th scope="col">Code</th><th scope="col">{t('Produit', 'Product')}</th><th scope="col">{t('Conditionnement', 'Packaging')}</th><th scope="col">{t('Stock temps réel', 'Live stock')}</th><th scope="col" className="sn-r">{b2c ? t('Prix unitaire TTC', 'Unit price incl. VAT') : t('Prix carton HT', 'Case price excl. VAT')}</th><th scope="col">{t('Quantité', 'Quantity')}</th><th scope="col"><span className="sn-sr">{t('Ajouter', 'Add')}</span></th></tr></thead>
        <tbody>
          {list.length ? list.map((p) => { const c = inCart(p.code); const rq = rowQ[p.code] ?? c; const pallet = ctx && !b2c && c >= p.casesPerPallet; const vol = ctx && !b2c && c >= 10;
            return (
              <tr key={p.code}>
                <td className="sn-code">{p.code}</td>
                <td><div className="sn-pn"><PackThumb item={p} size={44} /><div><button type="button" onClick={() => ui.openSheet(p.code)}>{p.name[l]}</button><small style={{ display: 'block' }}>{p.brand.name}</small></div></div></td>
                <td style={{ color: 'var(--sn-muted)', fontSize: '.85rem', minWidth: 150 }}>{p.pack[l]}</td>
                <td><span key={flash[p.code] ?? 0} className={flash[p.code] ? 'sn-flash' : undefined}><StockBadge stock={p.stock} /></span></td>
                <td className="sn-r sn-num" style={{ color: 'var(--sn-navy)', fontWeight: 600, whiteSpace: 'nowrap' }}>{logged ? <>{money(price(p, Math.max(1, c)))}{pallet ? <span className="sn-tier">−9 % {t('palette', 'pallet')}</span> : vol ? <span className="sn-tier">−4 % volume</span> : null}</> : <span style={{ color: 'var(--sn-muted)' }}>—</span>}</td>
                <td><span className="sn-step"><button type="button" onClick={() => setRowQ((r) => ({ ...r, [p.code]: Math.max(0, (rq || 0) - 1) }))} aria-label={`${t('Diminuer', 'Decrease')} ${p.name[l]}`}>−</button><input type="number" min={0} value={rq || ''} placeholder="0" aria-label={`${t('Quantité', 'Quantity')} ${p.name[l]}`} onChange={(e) => setRowQ((r) => ({ ...r, [p.code]: Math.max(0, Math.floor(+e.target.value || 0)) }))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); rowPut(p); } }} /><button type="button" onClick={() => setRowQ((r) => ({ ...r, [p.code]: (rq || 0) + 1 }))} aria-label={`${t('Augmenter', 'Increase')} ${p.name[l]}`}>+</button></span></td>
                <td>{logged ? <button type="button" className="sn-quick" onClick={() => rowPut(p)} aria-label={`${t('Ajouter au panier', 'Add to cart')} ${p.name[l]}`} disabled={p.stock <= 0} style={p.stock <= 0 ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}><Icon name="cart" /></button>
                  : <Link className="sn-quick" href={`/${l}/connexion`} aria-label={t('Se connecter pour commander', 'Sign in to order')}><Icon name="lock" /></Link>}</td>
              </tr>); })
            : <tr><td colSpan={7}><div className="sn-empty"><Icon name="search" /><b>{t('Aucun résultat', 'No results')}</b>{t('Essayez un code article (UL-033) ou un mot plus court.', 'Try an item code (UL-033) or a shorter word.')}</div></td></tr>}
        </tbody></table></div>
      <p style={{ fontSize: '.8rem', color: 'var(--sn-muted)', marginTop: 10 }}>{t('Prix dégressifs appliqués automatiquement : −4 % dès 10 cartons, −9 % à la palette. Stock mis à jour en continu.', 'Volume pricing applied automatically: −4 % from 10 cases, −9 % by the pallet. Stock updated continuously.')}</p>
    </div>

    <aside className="sn-side" aria-label={t('Récapitulatif', 'Summary')}>
      <div className="sn-box">
        {!lines.length ? <><h3>{t('Votre commande', 'Your order')}</h3><div className="sn-empty" style={{ padding: '20px 8px' }}><Icon name="cart" /><b>{t('Aucune ligne pour l’instant', 'No lines yet')}</b>{t('Tapez un code article ci-contre, par exemple UL-033.', 'Type an item code, for example UL-033.')}</div></>
          : <><h3>{t('Votre commande', 'Your order')} <span className="sn-pill sn-pill-n sn-num">{lines.length} {t('lignes', 'lines')}</span></h3>
            <ul className="sn-mini">{lines.map((ln) => { const p = by[ln.code]; const lt = tot?.lines.find((x) => x.code === ln.code); return p ? <li key={ln.code}><span>{ln.qty} × {p.name[l]}</span><span className="sn-num">{lt ? money(lt.total) : '—'}</span><button type="button" className="sn-x" onClick={() => set(ln.code, 0)} aria-label={`${t('Retirer', 'Remove')} ${p.name[l]}`}><Icon name="close" /></button></li> : null; })}</ul>
            <Sums /><FrancoMeter />
            {logged ? <button type="button" className="sn-btn sn-btn-go sn-btn-block" style={{ marginTop: 14 }} disabled={co.pending} onClick={co.run}>{co.label}</button> : <Link className="sn-btn sn-btn-nv sn-btn-block" href={`/${l}/connexion`} style={{ marginTop: 14 }}>{t('Se connecter pour commander', 'Sign in to order')}</Link>}</>}
      </div>
      {logged && !b2c && baskets.length > 0 && (
        <div className="sn-box sn-box-nv"><h3>{t('Mes paniers types', 'My saved baskets')}</h3>
          {baskets.map((b) => { const items = b.lines.map((x) => ({ p: by[x.code], q: x.qty })).filter((x): x is { p: PublicProduct; q: number } => !!x.p); return (
            <div className="sn-basket" key={b.id}><div><b>{b.name}</b><small>{b.lines.length} {t('lignes', 'lines')} · {money(items.reduce((s, x) => s + caseFor(x.p, x.q) * x.q, 0))} HT</small></div>
              <button type="button" className="sn-btn sn-btn-sm" style={{ background: '#fff', color: 'var(--sn-navy)' }} onClick={() => { let n = 0; items.forEach((x) => { if (x.p.stock > 0) { add(x.p, x.q); n++; } }); ui.toast(t(`Panier « ${b.name} » ajouté (${n} lignes)`, `Basket “${b.name}” added (${n} lines)`), 'cart'); }}>{t('Ajouter', 'Add')}</button></div>); })}
        </div>
      )}
      <div className="sn-box"><h3>{picks.t[l]}</h3>
        <div className="sn-sug">{picks.codes.map((c) => { const p = by[c]; return p ? <div className="sn-sug-i" key={c}><PackThumb item={p} size={40} /><div style={{ minWidth: 0 }}><b>{p.name[l]}</b><small>{logged ? (b2c ? `${money(unitTTC(p))} TTC` : `${money(caseFor(p))} HT`) : p.pack[l]}</small></div>
          {logged ? <button type="button" className="sn-quick" style={{ width: 32, height: 32 }} onClick={() => add(p, 1)} aria-label={`${t('Ajouter', 'Add')} ${p.name[l]}`}><Icon name="plus" /></button> : <Link className="sn-quick" style={{ width: 32, height: 32 }} href={`/${l}/connexion`} aria-label={t('Se connecter', 'Sign in')}><Icon name="lock" /></Link>}</div> : null; })}</div>
        <p style={{ fontSize: '.76rem', color: 'var(--sn-muted)', marginTop: 12 }}>{t('Suggestions calculées selon votre secteur d’activité.', 'Suggestions based on your line of business.')}</p></div>
    </aside></div>
  );
}
