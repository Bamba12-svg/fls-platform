import Image from 'next/image';
import type { Block } from '@fls/db';
import type { Locale } from '@/lib/i18n';

const ytId = (u: string) => u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];

/** Rendu des blocs de contenu saisis dans le back-office (texte, image, galerie, vidéo, fichier). Le HTML est nettoyé à l'enregistrement. */
export function Blocks({ blocks, locale, skip = [] }: { blocks: Block[] | null; locale: Locale; skip?: Block['type'][] }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.filter((b) => !skip.includes(b.type)).map((b, i) => {
        switch (b.type) {
          case 'text': return <div key={i} className="sn-prose" dangerouslySetInnerHTML={{ __html: (locale === 'en' && b.data.htmlEn) || b.data.html }} />;
          case 'image': return <figure key={i} style={{ marginBlock: 24 }}><div className="sn-ph sn-has-img" style={{ aspectRatio: '16/9', position: 'relative' }}><Image src={b.data.url} alt={b.data.alt ?? ''} fill sizes="(max-width:900px) 100vw, 800px" /></div>{b.data.caption && <figcaption style={{ fontSize: '.85rem', color: 'var(--sn-muted)', marginTop: 8 }}>{b.data.caption}</figcaption>}</figure>;
          case 'gallery': return <div key={i} className="sn-gal">{b.data.images.map((g, k) => <div key={k} className="sn-ph sn-has-img" style={{ position: 'relative', aspectRatio: '4/3' }}><Image src={g.url} alt={g.alt ?? ''} fill sizes="300px" /></div>)}</div>;
          case 'video': { const id = ytId(b.data.url); return id ? <div key={i} className="sn-video"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={b.data.title ?? 'Vidéo'} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /></div> : <video key={i} className="sn-video" src={b.data.url} controls preload="metadata" />; }
          case 'file': return <p key={i}><a className="sn-doc" href={b.data.url} target="_blank" rel="noopener">{b.data.label}</a></p>;
          default: return null;
        }
      })}
    </>
  );
}
