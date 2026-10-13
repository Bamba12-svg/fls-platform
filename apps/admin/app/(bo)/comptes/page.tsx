import Link from 'next/link';
import { getRepo, type AccountStatus } from '@fls/db';
import { AccountActions } from '@/components/AccountActions';
import { requireStaff } from '@/lib/auth';
import { ACCOUNT_STATUS, dt, money, SEGMENTS } from '@/lib/format';

export const metadata = { title: 'Comptes pro' };

export default async function Accounts({ searchParams }: { searchParams: { statut?: string } }) {
  await requireStaff('accounts');
  const statut = (Object.keys(ACCOUNT_STATUS).includes(searchParams.statut ?? '') ? searchParams.statut : undefined) as AccountStatus | undefined;
  const list = await (await getRepo()).customers(statut ? { status: statut } : {});
  return (
    <>
      <div className="sn-head"><div><h1>Comptes professionnels</h1><p>Vérifiez le NINEA et le RCCM, attribuez la grille tarifaire et le plafond d’encours.</p></div></div>
      <div className="sn-filters"><Link href="/comptes" aria-current={!statut ? 'page' : undefined}>Tous</Link>{Object.entries(ACCOUNT_STATUS).map(([k, l]) => <Link key={k} href={`/comptes?statut=${k}`} aria-current={statut === k ? 'page' : undefined}>{l}</Link>)}</div>
      <div className="sn-grid">{list.map((c) => (
        <div className="sn-card" key={c.id} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div><h2>{c.companyName} <span className={`sn-pill ${c.status === 'APPROVED' ? 'g' : c.status === 'PENDING' ? 'w' : 'r'}`}>{ACCOUNT_STATUS[c.status]}</span></h2>
              <div className="sn-mut">{c.contactName} · <a href={`mailto:${c.email}`}>{c.email}</a> · {c.phone} · {c.city} · demande du {dt(c.createdAt)}</div></div>
            <div className="sn-mut" style={{ textAlign: 'right' }}>{SEGMENTS[c.segment]}<br />Encours max : {money(c.creditLimit)}</div>
          </div>
          <div className="sn-f3">
            <div><span className="sn-lbl">NINEA</span><div className="sn-num">{c.ninea ?? '—'}</div></div>
            <div><span className="sn-lbl">RCCM</span><div className="sn-num">{c.rccm ?? '—'}</div></div>
            <div><span className="sn-lbl">Commercial</span><div>{c.salesRep ?? '—'}</div></div>
          </div>
          {c.documents && c.documents.length > 0 && <details className="sn-docs" open={c.status === 'PENDING'}><summary>Justificatifs ({c.documents.length})</summary>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>{c.documents.map((d, i) => <li key={i}><b>{d.kind}</b> · <a href={`/admin-fls/api/files?f=${encodeURIComponent(d.url)}`} target="_blank" rel="noopener">{d.filename}</a></li>)}</ul></details>}
          <AccountActions id={c.id} status={c.status} segment={c.segment} creditLimit={c.creditLimit} />
        </div>))}
        {!list.length && <p className="sn-mut">Aucun compte dans cette catégorie.</p>}
      </div>
    </>
  );
}
