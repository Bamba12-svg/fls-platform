'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TIMELINE } from '@/lib/content';
import { Icon } from '../Icon';
import { Ph } from '../Photo';
import { useLocale, useT } from '../providers';

const STEP = 5000;

/**
 * Frise animée : la ligne se trace à l'arrivée, les étapes apparaissent une à une, puis la frise
 * avance seule (5 s par étape, barre de progression). Pause au survol ; un clic reprend la main.
 */
export function Timeline() {
  const t = useT(); const l = useLocale();
  const [i, setI] = useState(0); const [inView, setInView] = useState(false); const [hold, setHold] = useState(false);
  const [fill, setFill] = useState(0); const [cycle, setCycle] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]); const box = useRef<HTMLDivElement>(null); const track = useRef<HTMLDivElement>(null);
  const e = TIMELINE[i]!;
  const go = (n: number, focus = false) => {
    const k = (n + TIMELINE.length) % TIMELINE.length; setI(k); setCycle((c) => c + 1);
    if (focus) refs.current[k]?.focus();
    const tr = track.current, b = refs.current[k];
    if (tr && b) tr.scrollTo({ left: b.offsetLeft - tr.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([en]) => { if (en?.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, []);
  // Avance automatique
  useEffect(() => {
    if (!inView || hold || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => go(i + 1), STEP);
    return () => clearTimeout(id);
  }, [i, inView, hold, cycle]); // eslint-disable-line react-hooks/exhaustive-deps
  // Longueur de la ligne verte jusqu'au point actif
  useLayoutEffect(() => { const b = refs.current[i]; if (b) setFill(b.offsetLeft + 8); }, [i]);

  return (
    <div ref={box} className={`sn-tl sn-tl-anim ${inView ? 'sn-in' : ''} ${hold ? 'sn-hold' : ''}`} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div ref={track} className="sn-tl-track" role="tablist" aria-label={t('Années', 'Years')}>
        <span className="sn-tl-fill" style={{ width: fill }} aria-hidden="true" />
        {TIMELINE.map((x, k) => (
          <button key={k} ref={(el) => { refs.current[k] = el; }} type="button" className={`sn-tl-y ${k < i ? 'sn-past' : ''}`} style={{ ['--k' as string]: k }} role="tab" aria-selected={k === i} aria-controls="sn-tl-p" tabIndex={k === i ? 0 : -1}
            onClick={() => go(k)} onKeyDown={(ev) => { if (ev.key === 'ArrowRight') go(k + 1, true); if (ev.key === 'ArrowLeft') go(k - 1, true); }}>
            <b>{x.y[l]}</b><i /><span>{x.t[l]}</span>
          </button>
        ))}
      </div>
      <div className="sn-tl-panel" id="sn-tl-p" role="tabpanel" key={i}>
        <div className="sn-tl-media"><Ph name={e.img} locale={l} icon={e.ic} /></div>
        <div className="sn-tl-txt"><span className="sn-eye sn-num">{e.y[l]} · {i + 1}/{TIMELINE.length}</span><h3>{e.t[l]}</h3><p>{e.d[l]}</p>
          <div className="sn-tl-nav">
            <button className="sn-ico" type="button" onClick={() => go(i - 1)} aria-label={t('Étape précédente', 'Previous milestone')}><Icon name="chevL" /></button>
            <button className="sn-ico" type="button" onClick={() => go(i + 1)} aria-label={t('Étape suivante', 'Next milestone')}><Icon name="chevR" /></button>
            <span className="sn-tl-prog" key={`p-${cycle}-${i}`} aria-hidden="true"><i /></span>
          </div></div>
      </div>
    </div>
  );
}
