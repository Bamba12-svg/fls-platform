import Link from 'next/link';
import { getRepo } from '@fls/db';
import { StockCell } from '@/components/StockCell';
import { asset } from '@/lib/assets';
import { canEdit, requireStaff } from '@/lib/auth';
import { money } from '@/lib/format';

export const metadata = { title: 'Catalogue' };

export default async function Products({ searchParams }: { searchParams: { u?: string; q?: string; stock?: string } }) {
  const s = await requireStaff('catalogue'); const edit = canEdit(s.role, 'catalogue'); const repo = await getRepo();
  const [all, universes] = await Promise.all([repo.products({ includeInactive: true }), repo.universes()]);
  const q = (searchParams.q ?? '').toLowerCase();
  const list = all.filter((p) => (!searchParams.u || p.universes.includes(searchParams.u)) && (!q || `${p.code} ${p.name.fr} ${p.brand.name}`.toLowerCase().includes(q)) && (searchParams.stock !== 'bas' || p.stock < 60));
  const qs = (o: Record<string, string | undefined>) => { const p = new URLSearchParams(Object.entries({ ...searchParams, ...o }).filter(([, v]) => v) as [string, string][]); return `?${p}`; };
  return (
    <>
      <div className="sn-head"><div><h1>Catalogue</h1><p>{all.length} références · {all.filter((p) => !p.active).length} masquées · prix de base = grille CHR, carton HT</p></div>{edit && <Link className="sn-btn go" href="/produits/nouveau">+ Nouveau produit</Link>}</div>
      <div className="sn-filters">
        <Link href={qs({ u: undefined })} aria-current={!searchParams.u ? 'page' : undefined}>Tous</Link>
        {universes.map((u) => <Link key={u.slug} href={qs({ u: u.slug })} aria-current={searchParams.u === u.slug ? 'page' : undefined}>{u.name.fr}</Link>)}
        <Link href={qs({ stock: searchParams.stock === 'bas' ? undefined : 'bas' })} aria-current={searchParams.stock === 'bas' ? 'page' : undefined}>Stock bas</Link>
        <form style={{ marginLeft: 'auto' }}><input type="hidden" name="u" value={searchParams.u ?? ''} /><input className="sn-in" name="q" defaultValue={searchParams.q} placeholder="Code, nom, marque…" aria-label="Rechercher" style={{ width: 240 }} /></form>
      </div>
      <div className="sn-tw"><table className="sn-tbl">
        <thead><tr><th></th><th>Code</th><th>Produit</th><th>Univers</th><th className="sn-r">Prix base HT</th><th>Stock (cartons)</th><th>Statut</th><th></th></tr></thead>
        <tbody>{list.map((p) => (
          <tr key={p.id}>
            <td>{p.image ? <img src={asset(p.image)} alt="" className="sn-thumb" /> : <span className="sn-thumb" style={{ display: 'inline-block' }} />}</td>
            <td className="sn-num"><b>{p.code}</b></td>
            <td><b>{p.name.fr}</b><div className="sn-mut">{p.brand.name} · {p.pack.fr}</div></td>
            <td className="sn-mut">{p.universes.join(', ')}</td>
            <td className="sn-r sn-num">{money(p.basePrice)}</td>
            <td><StockCell id={p.id} code={p.code} stock={p.stock} editable={edit} /></td>
            <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{!p.active && <span className="sn-pill">Masqué</span>}{p.isNew && <span className="sn-pill n">Nouveau</span>}{p.isDeal && <span className="sn-pill w">Offre</span>}{p.isFeatured && <span className="sn-pill g">Accueil</span>}</div></td>
            <td><Link className="sn-btn line sm" href={`/produits/${p.id}`}>{edit ? 'Modifier' : 'Voir'}</Link></td>
          </tr>))}</tbody>
      </table></div>
    </>
  );
}
