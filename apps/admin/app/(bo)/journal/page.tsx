import { getRepo } from '@fls/db';
import { requireStaff } from '@/lib/auth';
import { dt } from '@/lib/format';

export const metadata = { title: 'Journal d’audit' };

export default async function Audit() {
  await requireStaff('audit');
  const log = await (await getRepo()).auditLog(300);
  return (
    <>
      <div className="sn-head"><div><h1>Journal d’audit</h1><p>Enregistrement immuable de chaque action du back-office (connexions, prix, stocks, comptes, contenus). Les lignes ne peuvent être ni modifiées ni supprimées : la base de données le refuse.</p></div></div>
      <div className="sn-tw"><table className="sn-tbl">
        <thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Objet</th><th>Détails</th></tr></thead>
        <tbody>{log.map((a) => <tr key={a.id}><td className="sn-mut" style={{ whiteSpace: 'nowrap' }}>{dt(a.createdAt, true)}</td><td>{a.actorEmail}</td><td><b>{a.action}</b></td><td className="sn-mut">{a.entity}{a.entityId ? ` · ${a.entityId}` : ''}</td><td><code style={{ fontSize: '.75rem', wordBreak: 'break-all' }}>{a.details ? JSON.stringify(a.details).slice(0, 220) : ''}</code></td></tr>)}</tbody>
      </table>{!log.length && <p className="sn-mut" style={{ padding: 16 }}>Aucune entrée.</p>}</div>
    </>
  );
}
