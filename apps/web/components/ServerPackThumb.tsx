import Image from 'next/image';
import { SHELF } from '@/lib/catalog';
import { Icon } from './Icon';

const hashN = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Variante serveur de PackThumb (sans JavaScript côté client). */
export function ServerPackThumb({ p, large = false }: { p: { code: string; universe: string; image: string | null; name: { fr: string } }; large?: boolean }) {
  const sizes = large ? '(max-width:900px) 100vw, 560px' : '120px';
  if (p.image) return <div className="sn-pk sn-pk-ph" data-c={p.universe}><Image src={p.image} alt={large ? p.name.fr : ''} fill sizes={sizes} style={{ objectFit: 'contain' }} priority={large} /></div>;
  const shelf = SHELF[p.universe]; const h = hashN(p.code);
  if (shelf) return <div className="sn-pk sn-pk-ph sn-pk-shelf" data-c={p.universe}><Image src={shelf} alt="" fill sizes={sizes} style={{ objectFit: 'cover', transformOrigin: `${10 + (h % 80)}% ${35 + ((h >> 7) % 40)}%` }} /></div>;
  return <div className="sn-pk" data-c={p.universe}><Icon name="box" /></div>;
}
