'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SLIDES } from '@/lib/content';
import { Ph } from '../Photo';
import { useLocale, useT } from '../providers';

/** Diaporama plein écran en fondu (3 s par image, comme oumougroup.com) avec parallaxe légère. */
export function HeroSlideshow({ children }: { children: ReactNode }) {
  const l = useLocale(); const t = useT(); const [i, setI] = useState(0); const [run, setRun] = useState(0);
  const slides = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 3000);
    return () => clearInterval(id);
  }, [run]);
  useEffect(() => {
    const f = () => { const el = slides.current; if (el && scrollY < 900 && !matchMedia('(prefers-reduced-motion: reduce)').matches) el.style.transform = `translate3d(0,${scrollY * 0.28}px,0)`; };
    addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f);
  }, []);
  return (
    <section className="sn-hero" aria-labelledby="sn-h1">
      <div className="sn-slides" id="sn-slides" ref={slides}>
        {SLIDES.map((s, k) => <div key={s.img} className={`sn-slide ${k === i ? 'sn-cur' : ''}`}><Ph name={s.img} locale={l} icon={s.ic} priority={k === 0} sizes="100vw" /></div>)}
      </div>
      <div className="sn-wrap sn-hero-in">
        <div>
          {children}
          <div className="sn-dots" role="group" aria-label={t('Diaporama', 'Slideshow')}>
            {SLIDES.map((s, k) => (
              <button key={`${s.img}-${k === i ? run : 'x'}`} type="button" className={`sn-dot ${k === i ? 'sn-cur' : ''} ${k < i ? 'sn-past' : ''}`} aria-pressed={k === i} aria-label={`${t('Image', 'Image')} ${k + 1} : ${s.l[l]}`} onClick={() => { setI(k); setRun((r) => r + 1); }}>
                <i><b /></i><span>{s.l[l]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
