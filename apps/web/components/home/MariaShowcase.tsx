'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MARIA_PHOTOS, MARIA_RANGE } from '@/lib/content';
import { Icon } from '../Icon';
import { useLocale, useT } from '../providers';

/** Section Maria de l'accueil : vidéo de la marque, photos d'ambiance et toute la gamme par catégorie (brochure FLS). */
export function MariaShowcase() {
  const l = useLocale(); const t = useT();
  const [muted, setMuted] = useState(true);
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

      <div className="sn-mx-cats" aria-label={t('La gamme Maria par catégorie', 'The Maria range by category')}>
        <div className="sn-mx-track">
          {[0, 1].map((copy) => MARIA_RANGE.map((c) => (
            <section key={`${copy}-${c.key}`} className={`sn-mx-cat sn-mx-cat-${c.key}`} aria-label={c.name[l]} aria-hidden={copy === 1 || undefined}>
              <div className="sn-mx-cat-vis">
                <div className="sn-mx-cat-row">{c.items.map((it) => <Image key={it.code} src={it.img} alt="" width={200} height={260} sizes="160px" loading="eager" />)}</div>
                <h3>{c.name[l]}</h3>
              </div>
              <ul className="sn-mx-cat-list">
                {c.items.map((it) => <li key={it.code}><Link href={`/${l}/categories/${it.universe}/${it.slug}`} tabIndex={copy === 1 ? -1 : undefined}><span>{it.name[l]}</span><small className="sn-num">{it.code}</small></Link></li>)}
              </ul>
            </section>
          )))}
        </div>
      </div>

      <div className="sn-mx-photos">
        {MARIA_PHOTOS.map(([src, alt]) => <figure key={src}><Image src={src} alt={alt[l]} width={800} height={1000} sizes="(max-width: 700px) 50vw, 25vw" /></figure>)}
      </div>
    </div>
  );
}
