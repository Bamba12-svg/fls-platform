import Image from 'next/image';
import { Icon } from './Icon';
import { alt, img } from '@/lib/content';

/** Photo avec traitement colorimétrique unificateur (classe sn-ph) et chargement différé AVIF/WebP via next/image. */
export function Photo({ src, alt = '', className = '', icon = 'box', priority = false, sizes = '(max-width: 768px) 100vw, 50vw' }: { src?: string | null; alt?: string; className?: string; icon?: string; priority?: boolean; sizes?: string }) {
  return (
    <div className={`sn-ph ${src ? 'sn-has-img' : ''} ${className}`}>
      {src ? <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={78} /> : null}
      <span className="sn-ph-ic"><Icon name={icon} /></span>
    </div>
  );
}

/** Photo de l'ancien site FLS par son nom (dossier public/img), avec son texte alternatif bilingue. */
export function Ph({ name, locale, icon, className, priority, sizes }: { name: string; locale: 'fr' | 'en'; icon?: string; className?: string; priority?: boolean; sizes?: string }) {
  return <Photo src={img(name)} alt={alt(locale, name)} icon={icon} className={className} priority={priority} sizes={sizes} />;
}
