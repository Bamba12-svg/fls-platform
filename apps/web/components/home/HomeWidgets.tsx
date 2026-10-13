'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MARIA, PILLARS } from '@/lib/content';
import type { PublicProduct } from '@/lib/catalog';
import { Icon } from '../Icon';
import { Photo } from '../Photo';
import { PackThumb } from '../ProductCard';
import { useLocale, useMoney, useT } from '../providers';

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Bandeau des engagements : un pilier mis en avant toutes les 4,8 s. */
export function PillarRail() {
  const l = useLocale(); const t = useT(); const [on, setOn] = useState(0);
  useEffect(() => { if (reduced()) return; const id = setInterval(() => setOn((x) => (x + 1) % PILLARS.length), 4800); return () => clearInterval(id); }, []);
  return (
    <div className="sn-rail"><div className="sn-wrap"><div className="sn-rail-in" role="list" aria-label={t('Nos engagements', 'Our commitments')}>
      {PILLARS.map((p, i) => <div key={p.ic} className={`sn-pil ${i === on ? 'sn-on' : ''}`} role="listitem"><span className="sn-pil-ic"><Icon name={p.ic} /></span><h3>{p.t[l]}</h3><p>{p.d[l]}</p></div>)}
    </div></div></div>
  );
}

/**
 * Démonstration animée de la commande rapide. Les montants sont des EXEMPLES fixes :
 * aucun prix réel du catalogue n'est transmis aux visiteurs non connectés.
 */
const QO_SEQ: [string, number, number][] = [['UL-033', 20, 7580], ['HU-T20', 6, 21150], ['SG-F09', 12, 9400], ['CO-MY5', 4, 13900], ['RZ-BR50', 10, 16250]];
export function QuickOrderDemo({ products }: { products: PublicProduct[] }) {
  const l = useLocale(); const t = useT(); const { money } = useMoney();
  const by = Object.fromEntries(products.map((p) => [p.code, p]));
  const [items, setItems] = useState<[string, number, number][]>(QO_SEQ.slice(0, 2)); const [typed, setTyped] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (reduced()) return;
    let i = 2; let cur = QO_SEQ.slice(0, 2);
    const step = () => {
      if (i >= QO_SEQ.length) { cur = []; i = 0; setItems([]); timer.current = setTimeout(step, 900); return; }
      const entry = QO_SEQ[i]!; let k = 0;
      const type = () => {
        setTyped(entry[0].slice(0, ++k));
        if (k < entry[0].length) timer.current = setTimeout(type, 110);
        else timer.current = setTimeout(() => { setTyped(''); cur = [...(cur.length >= 4 ? cur.slice(1) : cur), entry]; setItems(cur); i++; timer.current = setTimeout(step, 1500); }, 450);
      };
      type();
    };
    timer.current = setTimeout(step, 1800);
    return () => clearTimeout(timer.current);
  }, []);
  const tot = items.reduce((s, [, q, v]) => s + q * v, 0); const FR = 250000; const ok = tot >= FR;
  return (
    <div className="sn-qo" aria-hidden="true">
      <div className="sn-qo-h"><div><b>{t('Commande rapide', 'Quick order')}</b><small>{t('Exemple · grille demi-gros', 'Example · semi-wholesale grid')}</small></div><span className="sn-live"><i />{t('Stock réel', 'Live stock')}</span></div>
      <div className="sn-qo-in"><Icon name="search" /><span className="sn-num">{typed}</span><span className="sn-caret" /></div>
      <ul className="sn-qo-rows">
        {items.map(([c, q, v]) => { const p = by[c]; return p ? <li className="sn-qo-row" key={c}><PackThumb item={p} size={40} /><div style={{ minWidth: 0 }}><b>{p.name[l]}</b><small className="sn-num">{c} · {q} {t('cartons', 'cases')}</small></div><span className="sn-num">{money(q * v)}</span></li> : null; })}
      </ul>
      <div className="sn-qo-f">
        <div className="sn-qo-tot"><span>{t('Total HT', 'Total excl. VAT')}</span><b>{money(tot)}</b></div>
        <div className="sn-meter"><i style={{ width: `${Math.min(100, (tot / FR) * 100)}%` }} /></div>
        <p className={`sn-qo-fr ${ok ? 'sn-ok' : ''}`}>{ok ? <><Icon name="check" />{t('Franco de port atteint', 'Free delivery reached')}</> : <><Icon name="truck" />{t(`Encore ${money(FR - tot)} pour le franco`, `${money(FR - tot)} to free delivery`)}</>}</p>
      </div>
      <div className="sn-qo-tag"><Icon name="bolt" /><span><b>3 s</b>{t('par ligne saisie', 'per line entered')}</span></div>
    </div>
  );
}

export interface PanelItem { href: string; img: string | null; icon: string; title: string; desc: string; value: string; valueLabel: string }
/** Panneaux extensibles des univers : ouverture au survol, au focus clavier ou au premier toucher. */
export function UniversePanels({ items }: { items: PanelItem[] }) {
  const t = useT(); const [act, setAct] = useState(0);
  return (
    <div className="sn-acc">
      {items.map((x, i) => (
        <Link key={x.href} href={x.href} className={`sn-acc-i ${i === act ? 'sn-act' : ''}`}
          onMouseEnter={() => { if (!matchMedia('(hover: none)').matches) setAct(i); }} onFocus={() => setAct(i)}
          onClick={(e) => { if (matchMedia('(hover: none)').matches && i !== act) { e.preventDefault(); setAct(i); } }}>
          <Photo src={x.img} icon={x.icon} sizes="(max-width:720px) 100vw, 50vw" />
          <div className="sn-acc-c"><h3>{x.title}</h3>
            <div className="sn-acc-more"><div><p>{x.desc}</p><div className="sn-acc-f"><span><b className="sn-num">{x.value}</b> {x.valueLabel.replace(/^(de |of )/, '')}</span><span className="sn-acc-go">{t('Découvrir', 'Explore')}<Icon name="arrow" /></span></div></div></div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export interface Profile { k: string; img: string; icon: string; title: string; desc: string; items: [string, string][]; cta: [string, string] }
export function ProfileTabs({ profiles }: { profiles: Profile[] }) {
  const t = useT(); const [cur, setCur] = useState(profiles[0]!.k); const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const key = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + profiles.length) % profiles.length; setCur(profiles[n]!.k); refs.current[n]?.focus();
  };
  return (
    <>
      <div className="sn-tabs" role="tablist" aria-label={t('Profils clients', 'Customer profiles')}>
        {profiles.map((p, i) => <button key={p.k} ref={(el) => { refs.current[i] = el; }} className="sn-tab" role="tab" type="button" id={`sn-pt-${p.k}`} aria-selected={cur === p.k} aria-controls={`sn-pp-${p.k}`} tabIndex={cur === p.k ? 0 : -1} onClick={() => setCur(p.k)} onKeyDown={(e) => key(e, i)}>{p.title.split(',')[0]}</button>)}
      </div>
      {profiles.map((p) => (
        <div key={p.k} className="sn-prof" role="tabpanel" id={`sn-pp-${p.k}`} aria-labelledby={`sn-pt-${p.k}`} hidden={cur !== p.k}>
          <Photo src={p.img} icon={p.icon} className="sn-prof-ph" />
          <div><h3>{p.title}</h3><p>{p.desc}</p>
            <ul className="sn-checks">{p.items.map(([b, s]) => <li key={b}><Icon name="check" /><span><b>{b}</b><span>{s}</span></span></li>)}</ul>
            <Link className="sn-btn sn-btn-nv" href={p.cta[0]}>{p.cta[1]}</Link></div>
        </div>
      ))}
    </>
  );
}

/** Carrousel de la marque exclusive Maria (visuels de l'ancien site), défilement toutes les 4,5 s. */
export function MariaCarousel() {
  const l = useLocale(); const t = useT(); const [i, setI] = useState(0); const [auto, setAuto] = useState(true);
  useEffect(() => { if (!auto || reduced()) return; const id = setInterval(() => setI((x) => (x + 1) % MARIA.length), 4500); return () => clearInterval(id); }, [auto]);
  const go = (n: number) => { setI((n + MARIA.length) % MARIA.length); setAuto(false); };
  return (
    <>
      <div className="sn-maria" aria-roledescription={t('carrousel', 'carousel')} aria-label={t('Gamme Maria', 'Maria range')}>
        {MARIA.map(([f, lab], k) => <div key={f} className={`sn-maria-s ${k === i ? 'sn-cur' : ''}`} aria-hidden={k !== i}><Image src={`/img/${f}.webp`} alt={`Maria : ${lab[l]}`} fill loading="eager" sizes="(max-width:720px) 100vw, 1200px" style={{ objectFit: 'cover' }} /></div>)}
        <div className="sn-maria-arw"><button className="sn-ico" type="button" onClick={() => go(i - 1)} aria-label={t('Produit précédent', 'Previous product')}><Icon name="chevL" /></button><button className="sn-ico" type="button" onClick={() => go(i + 1)} aria-label={t('Produit suivant', 'Next product')}><Icon name="chevR" /></button></div>
      </div>
      <div className="sn-chips sn-maria-c" role="group" aria-label={t('Produits Maria', 'Maria products')}>
        {MARIA.map(([f, lab], k) => <button key={f} className="sn-chip" type="button" aria-pressed={k === i} onClick={() => go(k)}>{lab[l]}</button>)}
      </div>
    </>
  );
}
