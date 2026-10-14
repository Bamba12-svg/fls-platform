'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { MARIA_PHOTOS, MARIA_RANGE } from '@/lib/content';
import { Icon } from '../Icon';
import { useLocale, useT } from '../providers';

/** Section Maria de l'accueil : vidéo de la marque, photos d'ambiance et toute la gamme par catégorie (brochure FLS). */
export function MariaShowcase() {
  const l = useLocale(); const t = useT();
  const [cat, setCat] = useState(MARIA_RANGE[0]!.key);
  const [muted, setMuted] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const cur = MARIA_RANGE.find((c) => c.key === cat)!;
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
          <video ref={video} src="/video/maria.mp4" poster="/img/maria/video-poster.webp" autoPlay muted loop playsInline preload="metadata" aria-label={t('Vidéo de présentation de la gamme Maria', 'Maria range presentation video')} />
          <button type="button" className="sn-mx-sound" onClick={toggleSound} aria-pressed={!muted}>{muted ? t('Activer le son', 'Turn sound on') : t('Couper le son', 'Mute')}</button>
        </div>
      </div>

      <div className="sn-mx-photos">
        {MARIA_PHOTOS.map(([src, alt]) => <figure key={src}><Image src={src} alt={alt[l]} width={800} height={1000} sizes="(max-width: 700px) 50vw, 25vw" /></figure>)}
      </div>

      <div className="sn-mx-range">
        <div className="sn-chips sn-mx-tabs" role="tablist" aria-label={t('Catégories Maria', 'Maria categories')}>
          {MARIA_RANGE.map((c) => <button key={c.key} type="button" role="tab" className="sn-chip" aria-selected={cat === c.key} onClick={() => setCat(c.key)}>{c.name[l]}<span className="sn-num">{c.items.length}</span></button>)}
        </div>
        <ul className="sn-mx-grid" role="tabpanel" aria-label={cur.name[l]} key={cur.key}>
          {cur.items.map((it) => (
            <li key={it.code}><Link href={`/${l}/categories/${it.universe}/${it.slug}`}>
              <span className="sn-mx-pk"><Image src={it.img} alt="" width={260} height={320} sizes="200px" /></span>
              <b>{it.name[l]}</b><small className="sn-num">{it.code}</small>
            </Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
