import { getRepo } from '@fls/db';
import { StaffForm } from '@/components/StaffForm';
import { requireStaff } from '@/lib/auth';
import { dt } from '@/lib/format';

export const metadata = { title: 'Utilisateurs' };

export default async function Staff() {
  await requireStaff('staff');
  const staff = await (await getRepo()).staff();
  return (
    <>
      <div className="sn-head"><div><h1>Utilisateurs du back-office</h1><p>Administrateur : tous les droits · Commercial : comptes, commandes, demandes, consultation du catalogue · Éditeur : catalogue, actualités, médias.</p></div></div>
      <div className="sn-card" style={{ marginBottom: 16 }}><h2 style={{ marginBottom: 12 }}>Ajouter un utilisateur</h2><StaffForm /></div>
      <div className="sn-grid">{staff.map((u) => (
        <div className="sn-card" key={u.id}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><h2>{u.name} {!u.active && <span className="sn-pill r">Désactivé</span>}</h2><span className="sn-mut">Dernière connexion : {dt(u.lastLoginAt, true)}</span></div><StaffForm u={u} /></div>))}</div>
    </>
  );
}
