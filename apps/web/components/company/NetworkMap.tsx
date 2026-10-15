'use client';

import { useEffect, useRef, useState } from 'react';
import { CITIES } from '@/lib/content';
import { CITY_XY, GAMBIA, MAP_H, MAP_W, NEIGHBOURS, SENEGAL } from '@/lib/senegal-map';
import { Icon } from '../Icon';
import { useLocale, useT } from '../providers';

const HUB = CITY_XY.Dakar!;
const runs = (f: string) => { const m = /(\d+) tourn/.exec(f); return m ? Number(m[1]) : 0; };
const onOrder = (f: string) => /commande/.test(f);
/** Trajet courbe Dakar → ville (courbure proportionnelle à la distance). */
const route = (x: number, y: number) => {
  const [hx, hy] = HUB; const d = Math.hypot(x - hx, y - hy);
  const mx = (hx + x) / 2 + (y - hy) * 0.12, my = (hy + y) / 2 - d * 0.16;
  return { d: `M${hx} ${hy} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x} ${y}`, len: d };
};
/** Position des étiquettes : à droite par défaut ; ajustées là où les villes sont proches. */
const LABEL: Record<string, 'l' | 'b' | 't' | 'r'> = { Dakar: 'b', 'Thiès': 't', Mbour: 'b', Ziguinchor: 'l', 'Saint-Louis': 'l', Fatick: 'b' };

/**
 * Carte animée du réseau de livraison : contours réels du Sénégal, tracé progressif des routes depuis le dépôt
 * de la Médina, camions qui circulent en continu, villes qui apparaissent une à une et visite guidée automatique.
 */
export function NetworkMap({ children }: { children?: React.ReactNode }) {
  const t = useT(); const l = useLocale();
  const [sel, setSel] = useState(0); const [inView, setInView] = useState(false);
  const box = useRef<HTMLDivElement>(null); const paused = useRef(false);
  const c = CITIES[sel]!;

  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);
  // Visite guidée : une ville mise en avant toutes les 3 s, en pause quand l'utilisateur survole ou choisit une ville.
  useEffect(() => {
    if (!inView || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => { if (!paused.current) setSel((x) => (x % (CITIES.length - 1)) + 1); }, 3000);
    return () => clearInterval(id);
  }, [inView]);
  const pick = (k: number) => { paused.current = true; setSel(k); };

  const cities = CITIES.map((ct, k) => ({ ...ct, k, xy: CITY_XY[ct.n] ?? HUB, r: runs(ct.f.fr), ond: onOrder(ct.f.fr) }));
  return (
    <div className="sn-wrap sn-split">
      <div>
        {children}
        <div className="sn-box sn-net-card" style={{ marginTop: 24 }} aria-live="polite">
          <span className="sn-net-k">{c.hub ? t('Dépôt central', 'Central depot') : t('Ville livrée', 'City served')}</span>
          <h3>{c.n}</h3>
          <p><Icon name="truck" size={18} />{c.f[l]}</p>
        </div>
        <div className="sn-net-stats">
          <div><b className="sn-num">13</b><span>{t('villes livrées', 'cities served')}</span></div>
          <div><b className="sn-num">{cities.reduce((s, x) => s + x.r, 0)}</b><span>{t('tournées / semaine', 'runs / week')}</span></div>
          <div><b className="sn-num">24–72 h</b><span>{t('délai de livraison', 'delivery time')}</span></div>
        </div>
        <span className="sn-note" style={{ marginTop: 16 }}><Icon name="warn" />{t('Fréquences indicatives, à confirmer par la logistique', 'Indicative frequencies, to be confirmed by logistics')}</span>
      </div>

      <div ref={box} className={`sn-net ${inView ? 'sn-in' : ''}`} onMouseLeave={() => { paused.current = false; }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={t('Carte du Sénégal : villes livrées par FLS depuis Dakar', 'Map of Senegal: cities FLS delivers to from Dakar')}>
          <defs>
            <linearGradient id="sn-net-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0d7a49" /><stop offset="1" stopColor="#075a35" /></linearGradient>
            <radialGradient id="sn-net-glow"><stop offset="0" stopColor="#d5cb30" stopOpacity=".55" /><stop offset="1" stopColor="#d5cb30" stopOpacity="0" /></radialGradient>
            <pattern id="sn-net-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#fff" fillOpacity=".06" /></pattern>
            <filter id="sn-net-shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity=".45" /></filter>
          </defs>
          <rect width={MAP_W} height={MAP_H} fill="url(#sn-net-dots)" />
          {Object.entries(NEIGHBOURS).map(([k, d]) => <path key={k} d={d} className="sn-net-nb" />)}
          <text x={30} y={MAP_H - 30} className="sn-net-sea">{t('Océan Atlantique', 'Atlantic Ocean')}</text>
          <text x={430} y={58} className="sn-net-cty">{t('MAURITANIE', 'MAURITANIA')}</text>
          <text x={640} y={300} className="sn-net-cty">MALI</text>
          <text x={420} y={MAP_H - 18} className="sn-net-cty">{t('GUINÉE', 'GUINEA')}</text>

          <path d={SENEGAL} className="sn-net-land" fill="url(#sn-net-land)" filter="url(#sn-net-shadow)" />
          <path d={SENEGAL} className="sn-net-edge" pathLength={1} />
          <path d={GAMBIA} className="sn-net-gm" />
          <text x={250} y={402} className="sn-net-cty sn-net-cty-gm">{t('GAMBIE', 'GAMBIA')}</text>

          {cities.slice(1).map((ct, i) => {
            const r = route(ct.xy[0], ct.xy[1]); const on = sel === ct.k; const dur = Math.max(2.4, r.len / 70);
            return (
              <g key={ct.n} className={`sn-net-rt ${on ? 'sn-on' : ''} ${ct.ond ? 'sn-ond' : ''}`} style={{ ['--i' as string]: i }}>
                <path d={r.d} className="sn-net-line" pathLength={1} />
                <path d={r.d} className="sn-net-flow" />
                {inView && Array.from({ length: ct.ond ? 1 : Math.min(2, Math.max(1, Math.round(ct.r / 3))) }, (_, n) => (
                  <circle key={n} r={on ? 4.5 : 3} className="sn-net-truck">
                    <animateMotion dur={`${dur}s`} begin={`${1.6 + i * 0.12 + n * (dur / 2)}s`} repeatCount="indefinite" path={r.d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                  </circle>
                ))}
              </g>
            );
          })}

          {cities.map((ct, i) => {
            const [x, y] = ct.xy; const on = sel === ct.k; const pos = LABEL[ct.n] ?? 'r';
            const size = ct.hub ? 10 : ct.ond ? 5.5 : 4.5 + Math.min(ct.r, 6) * 0.45;
            return (
              <g key={ct.n} className={`sn-net-city ${ct.hub ? 'sn-hub' : ''} ${on ? 'sn-on' : ''} ${ct.ond ? 'sn-ond' : ''}`} style={{ ['--i' as string]: i }}
                tabIndex={0} role="button" aria-label={`${ct.n} : ${ct.f[l]}`} aria-pressed={on}
                onMouseEnter={() => pick(ct.k)} onFocus={() => pick(ct.k)} onClick={() => pick(ct.k)}>
                <g className="sn-net-pop" style={{ transformOrigin: `${x}px ${y}px` }}>
                  <circle cx={x} cy={y} r={size * 3.2} fill="url(#sn-net-glow)" className="sn-net-halo" />
                  <circle cx={x} cy={y} r={size} className="sn-net-ring" style={{ transformOrigin: `${x}px ${y}px` }} />
                  <circle cx={x} cy={y} r={size} className="sn-net-dot" />
                  {ct.hub && <circle cx={x} cy={y} r={3.5} fill="#fff" />}
                  <circle cx={x} cy={y} r={18} fill="transparent" />
                  <text x={pos === 'l' ? x - size - 7 : pos === 'r' ? x + size + 7 : x} y={pos === 'b' ? y + size + 17 : pos === 't' ? y - size - 8 : y + 5} textAnchor={pos === 'l' ? 'end' : pos === 'r' ? 'start' : 'middle'} className="sn-net-lbl">{ct.n}</text>
                </g>
              </g>
            );
          })}

        </svg>
        <div className="sn-net-tip" key={`tip-${sel}`} aria-hidden="true">
          <b>{c.n}{c.hub ? ` · ${t('dépôt central', 'central depot')}` : ''}</b>
          <span><Icon name="truck" size={15} />{c.f[l]}</span>
        </div>
        <div className="sn-net-leg">
          <span><i className="sn-l-hub" />{t('Dépôt central (Médina)', 'Central depot (Médina)')}</span>
          <span><i className="sn-l-city" />{t('Tournées régulières', 'Regular runs')}</span>
          <span><i className="sn-l-ond" />{t('Sur commande', 'On order')}</span>
          <span><i className="sn-l-truck" />{t('Camion en route', 'Truck on the road')}</span>
        </div>
      </div>
    </div>
  );
}
