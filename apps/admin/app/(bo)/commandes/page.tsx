import Link from 'next/link';
import { getRepo } from '@fls/db';
import { OrderStatusSelect } from '@/components/Statuses';
import { requireStaff } from '@/lib/auth';
import { dt, money, ORDER_STATUS } from '@/lib/format';

export const metadata = { title: 'Commandes' };

export default async function Orders({ searchParams }: { searchParams: { statut?: string } }) {
  await requireStaff('orders');
  const all = await (await getRepo()).orders();
  const list = searchParams.statut ? all.filter((o) => o.status === searchParams.statut) : all;
  return (
    <>
      <div className="sn-head"><div><h1>Commandes</h1><p>{all.length} commandes · le client suit l’avancement dans son espace et reçoit un SMS au départ du camion.</p></div></div>
      <div className="sn-filters"><Link href="/commandes" aria-current={!searchParams.statut ? 'page' : undefined}>Toutes</Link>{Object.entries(ORDER_STATUS).map(([k, l]) => <Link key={k} href={`/commandes?statut=${k}`} aria-current={searchParams.statut === k ? 'page' : undefined}>{l} ({all.filter((o) => o.status === k).length})</Link>)}</div>
      <div className="sn-tw"><table className="sn-tbl">
        <thead><tr><th>Référence</th><th>Client</th><th>Date</th><th>Lignes</th><th className="sn-r">HT</th><th className="sn-r">TTC</th><th>Facture</th><th>Statut</th></tr></thead>
        <tbody>{list.map((o) => (
          <tr key={o.id}>
            <td><b className="sn-num">{o.ref}</b></td><td>{o.customerName}</td><td className="sn-mut">{dt(o.createdAt, true)}</td>
            <td><details><summary className="sn-mut" style={{ cursor: 'pointer' }}>{o.lines.length} lignes</summary><ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: '.85rem' }}>{o.lines.map((l) => <li key={l.code}>{l.qty} × {l.code} {l.name} · {money(l.total)}</li>)}</ul></details></td>
            <td className="sn-r sn-num">{money(o.subtotal + o.shipping)}</td><td className="sn-r sn-num"><b>{money(o.total)}</b></td>
            <td>{o.invoice ? <span className={`sn-pill ${o.invoice.paidAt ? 'g' : 'w'}`}>{o.invoice.ref} · {o.invoice.paidAt ? 'réglée' : `échéance ${dt(o.invoice.dueDate)}`}</span> : '—'}</td>
            <td><OrderStatusSelect id={o.id} value={o.status} /></td>
          </tr>))}</tbody>
      </table></div>
    </>
  );
}
