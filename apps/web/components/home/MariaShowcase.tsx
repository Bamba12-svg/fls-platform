'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MARIA_RANGE } from '@/lib/content';
import { Icon } from '../Icon';
import { useLocale, useT } from '../providers';

/** Section Maria de l'accueil : vidéo de la marque, photos d'ambiance et toute la gamme par catégorie (brochure FLS). */
export function MariaShowcase() {
  const l = useLocale(); const t = useT();
  const [muted, setMuted] = useState(true);
  const [pos, setPos] = useState({ a: 0, s: 0 }); const act = pos.a; const slide = pos.s;
  const hover = useRef(false); const manual = useRef(0);
  const open = (i: number) => setPos((p) => (p.a === i ? p : { a: i, s: 0 }));
  /*
   * Dans le panneau ouvert, la photo puis chaque produit de la catégorie défilent (1,8 s chacun).
   * Une fois la catégorie parcourue, on passe à la suivante, sauf si la souris est sur les panneaux
   * ou sur téléphone : la catégorie choisie continue alors de tourner en boucle.
   */
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (Date.now() - manual.current < 3000) return; // un produit choisi à la main reste affiché un peu plus longtemps
      const next = !hover.current && !matchMedia('(max-width: 720px)').matches;
      setPos((p) => (p.s + 1 < MARIA_RANGE[p.a]!.items.length + 1 ? { a: p.a, s: p.s + 1 } : { a: next ? (p.a + 1) % MARIA_RANGE.length : p.a, s: 0 }));
    }, 1800);
    return () => clearInterval(id);
  }, []);
  const video = useRef<HTMLVideoElement>(null);
  // React n'écrit pas l'attribut « muted » dans le HTML : sans lui, Chrome bloque la lecture automatique.
  useEffect(() => { const v = video.current; if (!v) return; v.muted = true; v.play().catch(() => {}); }, []);
  const toggleSound = () => { const v = video.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); if (!v.muted) v.play().catch(() => {}); };

  return (
    <div className="sn-mx">
      <div className="sn-mx-top">
        <div className="sn-mx-intro">
          <Image src="/img/maria/logo.webp" alt="Maria" width={220} height={88} className="sn-mx-logo" priority />
          <span className="sn-eye">{t('Notre marque', 'Our brand')}</span>
          <h2 className="sn-h2" id="sn-maria-h">{t('Maria, toute la gamme', 'Maria, the full range')}</h2>
          <p className="sn-mx-slogan">« Togg lu neex, lekk lu sell »</p>
          <p className="sn-sub">{t('Conserves de légumes et de fruits, sauces, condiments et jus : la marque distribuée par FLS aux grossistes, supérettes et restaurants du Sénégal.', 'Canned vegetables and fruit, sauces, condiments and juices: the brand FLS distributes to wholesalers, mini-markets and restaurants across Senegal.')}</p>
          <div className="sn-mx-cta">
            <Link className="sn-btn sn-btn-go" href={`/${l}/univers/conserves`}>{t('Voir la gamme au catalogue', 'See the range in the catalogue')}<Icon name="arrow" /></Link>
          </div>
        </div>
        <div className="sn-mx-video">
          <video ref={video} poster="/img/maria/video-poster.webp" autoPlay muted loop playsInline controls preload="auto" aria-label={t('Vidéo de présentation de la gamme Maria', 'Maria range presentation video')}>
            <source src="/video/maria.webm" type="video/webm" />
            <source src="/video/maria.mp4" type="video/mp4" />
          </video>
          <button type="button" className="sn-mx-sound" onClick={toggleSound} aria-pressed={!muted}>{muted ? t('Activer le son', 'Turn sound on') : t('Couper le son', 'Mute')}</button>
        </div>
      </div>

      <div className="sn-acc sn-mx-acc" onMouseEnter={() => { hover.current = true; }} onMouseLeave={() => { hover.current = false; }}>
        {MARIA_RANGE.map((c, i) => {
          const on = i === act; const cur = on ? slide : 0;
          return (
            <div key={c.key} className={`sn-acc-i ${on ? 'sn-act' : ''}`} role="group" aria-label={c.name[l]} tabIndex={0}
              onMouseEnter={() => { if (!matchMedia('(hover: none)').matches) open(i); }} onFocus={() => open(i)} onClick={() => open(i)}>
              <div className="sn-mx-sl">
                <div className={`sn-mx-s sn-mx-s-photo ${cur === 0 ? 'sn-on' : ''}`}><Image src={c.photo} alt="" fill sizes="(max-width:720px) 100vw, 50vw" /></div>
                {c.items.map((it, k) => <div key={it.code} className={`sn-mx-s sn-mx-s-pk ${cur === k + 1 ? 'sn-on' : ''}`} aria-hidden={cur !== k + 1}><Image src={it.img} alt={it.name[l]} width={300} height={380} sizes="300px" loading="eager" /></div>)}
              </div>
              <div className="sn-acc-c"><h3>{c.name[l]}</h3>
                <div className="sn-acc-more"><div>
                  <ul className="sn-mx-names">{c.items.map((it, k) => <li key={it.code}><button type="button" tabIndex={on ? 0 : -1} aria-pressed={on && slide === k + 1} onClick={(e) => { e.stopPropagation(); manual.current = Date.now(); setPos({ a: i, s: k + 1 }); }}>{it.name[l]}</button></li>)}</ul>
                  <div className="sn-acc-f"><span><b className="sn-num">{c.items.length}</b> {t('produits Maria', 'Maria products')}</span><Link className="sn-acc-go" href={`/${l}/${c.href}`} tabIndex={on ? 0 : -1} onClick={(e) => e.stopPropagation()}>{t('Découvrir', 'Explore')}<Icon name="arrow" /></Link></div>
                </div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
