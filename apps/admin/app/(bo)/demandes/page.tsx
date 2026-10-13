import Link from 'next/link';
import { getRepo, type LeadType } from '@fls/db';
import { LeadStatusSelect } from '@/components/Statuses';
import { requireStaff } from '@/lib/auth';
import { dt, LEAD_STATUS, LEAD_TYPES } from '@/lib/format';

export const metadata = { title: 'Contacts & devis' };

export default async function Leads({ searchParams }: { searchParams: { type?: string; statut?: string } }) {
  await requireStaff('leads');
  const type = (Object.keys(LEAD_TYPES).includes(searchParams.type ?? '') ? searchParams.type : undefined) as LeadType | undefined;
  const all = await (await getRepo()).leads(type ? { type } : {});
  const list = searchParams.statut ? all.filter((l) => l.status === searchParams.statut) : all.filter((l) => l.status !== 'ARCHIVED');
  const cv = (p: unknown) => (p && typeof p === 'object' && 'cv' in p ? (p as { cv?: { url: string; filename: string } }).cv : undefined);
  return (
    <>
      <div className="sn-head"><div><h1>Contacts & devis</h1><p>Toutes les demandes du site : devis, clés en main, accompagnement, grands comptes, candidatures, lettre commerciale.</p></div></div>
      <div className="sn-filters"><Link href="/demandes" aria-current={!type ? 'page' : undefined}>Toutes</Link>{Object.entries(LEAD_TYPES).map(([k, l]) => <Link key={k} href={`/demandes?type=${k}`} aria-current={type === k ? 'page' : undefined}>{l}</Link>)}<Link href={`/demandes?statut=ARCHIVED${type ? `&type=${type}` : ''}`} aria-current={searchParams.statut === 'ARCHIVED' ? 'page' : undefined}>Archivées</Link></div>
      <div className="sn-tw"><table className="sn-tbl">
        <thead><tr><th>Date</th><th>Type</th><th>Contact</th><th>Message</th><th>Statut</th></tr></thead>
        <tbody>{list.map((l) => { const f = cv(l.payload); return (
          <tr key={l.id}>
            <td className="sn-mut" style={{ whiteSpace: 'nowrap' }}>{dt(l.createdAt, true)}</td>
            <td><span className="sn-pill n">{LEAD_TYPES[l.type]}</span></td>
            <td><b>{l.company || l.name || '—'}</b><div className="sn-mut">{[l.name !== l.company ? l.name : null, l.phone && <a key="t" href={`tel:${l.phone}`}>{l.phone}</a>, l.email && <a key="m" href={`mailto:${l.email}`}>{l.email}</a>, l.city].filter(Boolean).map((x, i) => <span key={i}>{i ? ' · ' : ''}{x}</span>)}</div></td>
            <td style={{ maxWidth: 420 }}>{l.message}{f && <div><a href={`/admin-fls/api/files?f=${encodeURIComponent(f.url)}`} target="_blank" rel="noopener">CV : {f.filename}</a></div>}</td>
            <td><LeadStatusSelect id={l.id} value={l.status} /></td>
          </tr>); })}</tbody>
      </table>{!list.length && <p className="sn-mut" style={{ padding: 16 }}>Aucune demande.</p>}</div>
      <p className="sn-mut" style={{ marginTop: 10 }}>Statuts : {Object.values(LEAD_STATUS).join(' → ')}</p>
    </>
  );
}
