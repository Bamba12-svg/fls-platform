import { getRepo } from '@fls/db';
import { Uploader } from '@/components/Uploader';
import { asset } from '@/lib/assets';
import { requireStaff } from '@/lib/auth';
import { dt } from '@/lib/format';
import { imageLibrary } from '@/lib/library';

export const metadata = { title: 'Médiathèque' };

export default async function Media() {
  await requireStaff('media');
  const [media, lib] = await Promise.all([(await getRepo()).media(), imageLibrary()]);
  const existing = lib.filter((u) => u.startsWith('/img'));
  return (
    <>
      <div className="sn-head"><div><h1>Médiathèque</h1><p>{media.length} fichiers téléversés · {existing.length} visuels repris de l’ancien site</p></div></div>
      <Uploader />
      <h2 style={{ margin: '24px 0 12px' }}>Téléversés</h2>
      {media.length ? <div className="sn-media">{media.map((m) => <figure key={m.id}>{m.mime.startsWith('image/') ? <img src={asset(m.url)} alt={m.alt ?? ''} loading="lazy" /> : <div style={{ aspectRatio: '4/3', display: 'grid', placeItems: 'center', background: '#EEF1EF', fontWeight: 800 }}>PDF</div>}<figcaption><b>{m.filename}</b><br />{m.width ? `${m.width}×${m.height} · ` : ''}{Math.round(m.size / 1024)} Ko · {dt(m.createdAt)}<br /><code>{m.url}</code></figcaption></figure>)}</div> : <p className="sn-mut">Aucun fichier pour l’instant.</p>}
      <h2 style={{ margin: '24px 0 12px' }}>Visuels du site</h2>
      <div className="sn-media">{existing.map((u) => <figure key={u}><img src={asset(u)} alt="" loading="lazy" /><figcaption><code>{u}</code></figcaption></figure>)}</div>
    </>
  );
}
