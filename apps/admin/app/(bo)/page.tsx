import Link from 'next/link';
import { getRepo } from '@fls/db';
import { can, requireStaff } from '@/lib/auth';
import { dt, LEAD_TYPES, money, ORDER_STATUS } from '@/lib/format';

export default async function Dashboard({ searchParams }: { searchParams: { refus?: string } }) {
  const s = await requireStaff(); const repo = await getRepo();
  const [st, orders, leads, products, audit] = await Promise.all([repo.stats(), repo.orders(), repo.leads({ status: 'NEW' }), repo.products(), can(s.role, 'audit') ? repo.auditLog(8) : Promise.resolve([])]);
  const low = products.filter((p) => p.stock < 60).sort((a, b) => a.stock - b.stock).slice(0, 8);
  return (
    <>
      <div className="sn-head"><div><h1>Bonjour {s.name.split(' ')[0]}</h1><p>Vue d’ensemble de l’activité · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>{repo.kind === 'demo' && <span className="sn-pill w">Mode démonstration : données en mémoire</span>}</div>
      {searchParams.refus && <p className="sn-msg err" role="alert" style={{ marginBottom: 16 }}>Votre rôle ne donne pas accès à cette rubrique.</p>}
      <div className="sn-grid sn-g4" style={{ marginBottom: 16 }}>
        <div className="sn-card sn-kpi"><span>Chiffre d’affaires 30 jours (TTC)</span><b className="sn-num" style={{ fontSize: '1.35rem' }}>{money(st.revenue30d)}</b></div>
        {can(s.role, 'accounts') && <div className="sn-card sn-kpi"><span>Comptes pro à valider</span><b>{st.pendingAccounts}</b><Link href="/comptes?statut=PENDING">Modérer →</Link></div>}
        {can(s.role, 'orders') && <div className="sn-card sn-kpi"><span>Commandes à traiter</span><b>{st.openOrders}</b><Link href="/commandes">Voir →</Link></div>}
        {can(s.role, 'leads') && <div className="sn-card sn-kpi"><span>Nouvelles demandes</span><b>{st.newLeads}</b><Link href="/demandes">Traiter →</Link></div>}
        <div className="sn-card sn-kpi"><span>Références actives · stock bas</span><b>{st.products} · <span style={{ color: 'var(--sn-warn)' }}>{st.lowStock}</span></b><Link href="/produits?stock=bas">Catalogue →</Link></div>
      </div>
      <div className="sn-grid sn-g2">
        {can(s.role, 'orders') && <div className="sn-card"><h2 style={{ marginBottom: 10 }}>Dernières commandes</h2><table className="sn-tbl"><tbody>{orders.slice(0, 6).map((o) => <tr key={o.id}><td><b style={{ whiteSpace: 'nowrap' }}>{o.ref}</b><div className="sn-mut">{o.customerName} · {dt(o.createdAt)}</div></td><td><span className={`sn-pill ${o.status === 'DELIVERED' ? 'g' : o.status === 'CANCELLED' ? 'r' : 'n'}`}>{ORDER_STATUS[o.status]}</span></td><td className="sn-r sn-num">{money(o.total)}</td></tr>)}</tbody></table></div>}
        {can(s.role, 'leads') && <div className="sn-card"><h2 style={{ marginBottom: 10 }}>Demandes non traitées</h2>{leads.length ? <table className="sn-tbl"><tbody>{leads.slice(0, 6).map((l) => <tr key={l.id}><td><b>{l.company || l.name || l.email}</b><div className="sn-mut">{LEAD_TYPES[l.type]} · {dt(l.createdAt, true)}</div></td><td className="sn-mut">{l.phone}</td></tr>)}</tbody></table> : <p className="sn-mut">Aucune demande en attente.</p>}</div>}
        <div className="sn-card"><h2 style={{ marginBottom: 10 }}>Stock bas (moins de 60 cartons)</h2><table className="sn-tbl"><tbody>{low.map((p) => <tr key={p.id}><td><b>{p.code}</b> · {p.name.fr}</td><td className="sn-r"><span className={`sn-pill ${p.stock <= 0 ? 'r' : 'w'}`}>{p.stock <= 0 ? 'Rupture' : `${p.stock} ct`}</span></td></tr>)}</tbody></table></div>
        {audit.length > 0 && <div className="sn-card"><h2 style={{ marginBottom: 10 }}>Activité récente</h2><table className="sn-tbl"><tbody>{audit.map((a) => <tr key={a.id}><td><b>{a.action}</b><div className="sn-mut">{a.actorEmail} · {dt(a.createdAt, true)}</div></td><td className="sn-mut">{a.entity}</td></tr>)}</tbody></table><Link href="/journal" className="sn-mut">Journal complet →</Link></div>}
      </div>
    </>
  );
}
