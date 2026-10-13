'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useLocale } from './providers';

/** Apparition au défilement et compteurs animés (mêmes réglages que oumougroup.com : comptage 2 s, décalage 90 ms). */
const RV = '.sn-sec-h, .sn-uni, .sn-acc-i, .sn-card, .sn-new, .sn-prof > div, .sn-turn-in > div:first-child, .sn-turn-card, .sn-cta, .sn-svc > div, .sn-q-grid > div, .sn-syn > div, .sn-tl-panel, .sn-kpi, .sn-panel, .sn-arr, .sn-calc, .sn-split > div, .sn-cold > div, .sn-steps li, .sn-brands, .sn-map, .sn-contact > div, .sn-pil, .sn-cta-steps li, .sn-grid-p > *, .sn-blk-prod, .sn-art > *';
const WIPE = '.sn-prof-ph, .sn-turn-ph, .sn-new > .sn-ph, .sn-tl-panel > .sn-ph, figure > .sn-ph';

type Cnt = HTMLElement & { _cnt?: { val: number; dec: number; rest: string; final: string } };

export function Motion() {
  const path = usePathname(); const l = useLocale();
  useEffect(() => {
    const main = document.getElementById('sn-main');
    if (!main || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const nf = (n: number, d: number) => new Intl.NumberFormat(l === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
    const prep = (el: Cnt) => {
      const txt = (el.textContent || '').trim(); const m = txt.match(/^([\d\s  .,]*\d)(.*)$/);
      if (!m || /\d/.test(m[2]!) || /–/.test(txt)) return null;
      const raw = m[1]!.replace(/[\s  ]/g, ''); const ds = l === 'en' ? '.' : ',', ts = l === 'en' ? ',' : '.';
      const dec = raw.includes(ds) ? raw.split(ds)[1]!.length : 0; const val = parseFloat(raw.split(ts).join('').replace(ds, '.'));
      if (!isFinite(val) || val === 0) return null;
      el._cnt = { val, dec, rest: m[2]!, final: txt }; el.textContent = nf(0, dec) + m[2]; return el;
    };
    const run = (el: Cnt) => {
      const c = el._cnt; if (!c) return; let t0: number | null = null;
      const tick = (now: number) => { if (t0 === null) t0 = now; const k = Math.min(1, (now - t0) / 2000); const e = 0.5 - Math.cos(k * Math.PI) / 2; el.textContent = k < 1 ? nf(c.val * e, c.dec) + c.rest : c.final; if (k < 1) requestAnimationFrame(tick); };
      setTimeout(() => requestAnimationFrame(tick), 200);
    };
    const els: HTMLElement[] = [];
    main.querySelectorAll<HTMLElement>(WIPE).forEach((e) => { e.classList.add('sn-wipe'); els.push(e); });
    main.querySelectorAll<HTMLElement>(RV).forEach((e) => {
      if (e.closest('.sn-row-scroll') && !e.matches('.sn-card')) return;
      e.classList.add(e.matches('.sn-steps li, .sn-cta-steps li') ? 'sn-rv-l' : 'sn-rv');
      const sib = e.parentElement ? [...e.parentElement.children].filter((x) => x.matches(RV)) : [];
      e.style.transitionDelay = `${Math.min(Math.max(0, sib.indexOf(e)), 6) * 90}ms`;
      els.push(e);
    });
    const cnts = [...main.querySelectorAll<Cnt>('.sn-cnt')].map(prep).filter((x): x is Cnt => !!x);
    const mo = new IntersectionObserver((en) => en.forEach((x) => {
      if (!x.isIntersecting) return; const t = x.target as HTMLElement; mo.unobserve(t); t.classList.add('sn-vis');
      setTimeout(() => { t.style.transitionDelay = ''; }, 1600);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => mo.observe(e));
    const co = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { co.unobserve(x.target); run(x.target as Cnt); } }), { threshold: 0.6 });
    cnts.forEach((e) => co.observe(e));
    return () => { mo.disconnect(); co.disconnect(); cnts.forEach((c) => { if (c._cnt) c.textContent = c._cnt.final; }); };
  }, [path, l]);
  return null;
}
