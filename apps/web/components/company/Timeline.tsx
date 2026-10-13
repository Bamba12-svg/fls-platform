'use client';

import { useRef, useState } from 'react';
import { TIMELINE } from '@/lib/content';
import { Icon } from '../Icon';
import { Ph } from '../Photo';
import { useLocale, useT } from '../providers';

export function Timeline() {
  const t = useT(); const l = useLocale(); const [i, setI] = useState(TIMELINE.length - 1); const e = TIMELINE[i]!;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (n: number, focus = false) => { const k = Math.max(0, Math.min(TIMELINE.length - 1, n)); setI(k); if (focus) refs.current[k]?.focus(); refs.current[k]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); };
  return (
    <div className="sn-tl">
      <div className="sn-tl-track" role="tablist" aria-label={t('Années', 'Years')}>
        {TIMELINE.map((x, k) => <button key={k} ref={(el) => { refs.current[k] = el; }} type="button" className="sn-tl-y" role="tab" aria-selected={k === i} aria-controls="sn-tl-p" tabIndex={k === i ? 0 : -1} onClick={() => go(k)} onKeyDown={(ev) => { if (ev.key === 'ArrowRight') go(k + 1, true); if (ev.key === 'ArrowLeft') go(k - 1, true); }}><b>{x.y[l]}</b><i /><span>{x.t[l]}</span></button>)}
      </div>
      <div className="sn-tl-panel" id="sn-tl-p" role="tabpanel" key={i}>
        <Ph name={e.img} locale={l} icon={e.ic} />
        <div><span className="sn-eye sn-num">{e.y[l]}</span><h3>{e.t[l]}</h3><p>{e.d[l]}</p>
          <div className="sn-tl-nav">
            <button className="sn-ico" type="button" onClick={() => go(i - 1)} aria-label={t('Étape précédente', 'Previous milestone')} disabled={i === 0} style={i === 0 ? { opacity: 0.4 } : undefined}><Icon name="chevL" /></button>
            <button className="sn-ico" type="button" onClick={() => go(i + 1)} aria-label={t('Étape suivante', 'Next milestone')} disabled={i === TIMELINE.length - 1} style={i === TIMELINE.length - 1 ? { opacity: 0.4 } : undefined}><Icon name="chevR" /></button>
          </div></div>
      </div>
    </div>
  );
}
