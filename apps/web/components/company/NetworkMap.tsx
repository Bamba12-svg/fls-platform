'use client';

import { useState } from 'react';
import { CITIES } from '@/lib/content';
import { Icon } from '../Icon';
import { useLocale, useT } from '../providers';

const proj = (c: { lat: number; lon: number }) => [(c.lon + 17.75) * 100 + 20, (16.75 - c.lat) * 100 + 20] as const;

/** Carte schématique (coordonnées réelles) des villes livrées depuis le dépôt de la Médina. */
export function NetworkMap({ children }: { children?: React.ReactNode }) {
  const t = useT(); const l = useLocale(); const [i, setI] = useState(0); const c = CITIES[i]!;
  const [hx, hy] = proj(CITIES[0]!);
  const dots: [number, number][] = []; for (let x = 30; x < 660; x += 22) for (let y = 30; y < 480; y += 22) dots.push([x, y]);
  return (
    <div className="sn-wrap sn-split">
      <div>
        {children}
        <div className="sn-box" style={{ marginTop: 24 }} aria-live="polite">
          <h3 style={{ margin: '0 0 6px' }}>{c.n}{c.hub && <> <span className="sn-pill sn-pill-g">{t('Dépôt central', 'Central depot')}</span></>}</h3>
          <p style={{ color: 'var(--sn-muted)', display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="truck" size={18} />{c.f[l]}</p>
        </div>
        <span className="sn-note" style={{ marginTop: 16 }}><Icon name="warn" />{t('Fréquences indicatives, à confirmer par la logistique', 'Indicative frequencies, to be confirmed by logistics')}</span>
      </div>
      <div className="sn-map">
        <svg viewBox="0 0 680 500" role="img" aria-label={t('Carte schématique des villes livrées depuis Dakar', 'Schematic map of cities served from Dakar')}>
          <g>{dots.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="#C9D3CC" />)}</g>
          <text x={30} y={485} fontSize={11} fill="#5B655F" fontFamily="Figtree Variable,sans-serif">{t('Océan Atlantique', 'Atlantic Ocean')}</text>
          {CITIES.slice(1).map((ct) => { const [x, y] = proj(ct); const mx = (hx + x) / 2, my = (hy + y) / 2 - Math.hypot(x - hx, y - hy) * 0.18; return <path key={ct.n} d={`M${hx} ${hy} Q${mx} ${my} ${x} ${y}`} fill="none" stroke="#0A4A2A" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="4 5" className="sn-route" />; })}
          {CITIES.map((ct, k) => { const [x, y] = proj(ct); const ond = /commande/.test(ct.f.fr); return (
            <g key={ct.n} className="sn-city" tabIndex={0} role="button" aria-label={ct.n} aria-pressed={k === i} onClick={() => setI(k)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setI(k); } }}>
              <circle cx={x} cy={y} r={ct.hub ? 11 : 7} fill={ct.hub ? '#006633' : ond ? '#fff' : '#0A4A2A'} stroke={ct.hub ? '#E7F1EB' : '#0A4A2A'} strokeWidth={ct.hub ? 5 : 2} strokeDasharray={ond ? '3 2' : undefined} />
              {ct.hub && <circle cx={x} cy={y} r={20} fill="none" stroke="#006633" strokeOpacity={0.3}><animate attributeName="r" values="12;26;12" dur="3s" repeatCount="indefinite" /><animate attributeName="stroke-opacity" values=".5;0;.5" dur="3s" repeatCount="indefinite" /></circle>}
              <text x={x + (ct.hub ? -16 : 11)} y={y + (ct.hub ? 28 : 4)} fontSize={ct.hub ? 14 : 12} fontWeight={ct.hub ? 800 : 600} fill="#10241A" fontFamily="Figtree Variable,sans-serif">{ct.n}</text>
            </g>); })}
        </svg>
        <div className="sn-map-leg"><span><i style={{ background: 'var(--sn-green)' }} />{t('Dépôt central', 'Central depot')}</span><span><i style={{ background: 'var(--sn-navy)' }} />{t('Ville livrée', 'City served')}</span><span><i style={{ background: '#fff', border: '2px dashed var(--sn-navy)' }} />{t('Sur commande', 'On order')}</span></div>
      </div>
    </div>
  );
}
