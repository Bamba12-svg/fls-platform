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
  const [act, setAct] = useState(0); const [hover, setHover] = useState(false);
  // Les panneaux s'ouvrent l'un après l'autre (pause au survol, désactivé si l'utilisateur limite les animations).
  useEffect(() => {
    if (hover || matchMedia('(prefers-reduced-motion: reduce), (max-width: 720px)').matches) return;
    const id = setInterval(() => setAct((x) => (x + 1) % MARIA_RANGE.length), 4000);
    return () => clearInterval(id);
  }, [hover]);
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

      <div className="sn-acc sn-mx-acc" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {MARIA_RANGE.map((c, i) => (
          <Link key={c.key} href={`/${l}/${c.href}`} className={`sn-acc-i ${i === act ? 'sn-act' : ''}`}
            onMouseEnter={() => { if (!matchMedia('(hover: none)').matches) setAct(i); }} onFocus={() => setAct(i)}
            onClick={(e) => { if (matchMedia('(hover: none)').matches && i !== act) { e.preventDefault(); setAct(i); } }}>
            <div className="sn-ph sn-has-img"><Image src={c.photo} alt="" fill sizes="(max-width:720px) 100vw, 50vw" /></div>
            <div className="sn-acc-c"><h3>{c.name[l]}</h3>
              <div className="sn-acc-more"><div>
                <ul className="sn-mx-names">{c.items.map((it) => <li key={it.code}>{it.name[l]}</li>)}</ul>
                <div className="sn-acc-f"><span><b className="sn-num">{c.items.length}</b> {t('produits Maria', 'Maria products')}</span><span className="sn-acc-go">{t('Découvrir', 'Explore')}<Icon name="arrow" /></span></div>
              </div></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
