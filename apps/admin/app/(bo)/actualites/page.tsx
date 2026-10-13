import Link from 'next/link';
import { getRepo } from '@fls/db';
import { asset } from '@/lib/assets';
import { requireStaff } from '@/lib/auth';
import { dt, NEWS_CATS } from '@/lib/format';

export const metadata = { title: 'Actualités' };

export default async function Posts() {
  await requireStaff('news');
  const posts = await (await getRepo()).posts({ includeDrafts: true });
  return (
    <>
      <div className="sn-head"><div><h1>Actualités</h1><p>Arrivages, salons, nouvelles gammes. Les articles cochés « accueil » remontent automatiquement sur la page d’accueil.</p></div><Link className="sn-btn go" href="/actualites/nouveau">+ Nouvel article</Link></div>
      <div className="sn-tw"><table className="sn-tbl">
        <thead><tr><th></th><th>Titre</th><th>Rubrique</th><th>Publication</th><th>Statut</th><th></th></tr></thead>
        <tbody>{posts.map((p) => (
          <tr key={p.id}><td>{p.cover && <img src={asset(p.cover)} alt="" className="sn-thumb" style={{ objectFit: 'cover' }} />}</td><td><b>{p.title.fr}</b><div className="sn-mut">/{p.slug}</div></td><td>{NEWS_CATS[p.category as keyof typeof NEWS_CATS] ?? p.category}</td><td className="sn-mut">{dt(p.publishedAt)}</td>
            <td><span className={`sn-pill ${p.status === 'PUBLISHED' ? 'g' : ''}`}>{p.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}</span> {p.showOnHome && <span className="sn-pill n">Accueil</span>}</td>
            <td><Link className="sn-btn line sm" href={`/actualites/${p.id}`}>Modifier</Link></td></tr>))}</tbody>
      </table></div>
    </>
  );
}
