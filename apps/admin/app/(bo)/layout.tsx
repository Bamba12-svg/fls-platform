import { FlsMark } from '@/components/FlsMark';
import type { ReactNode } from 'react';
import { getRepo } from '@fls/db';
import { Nav } from '@/components/Nav';
import { logout } from '@/lib/actions';
import { can, requireStaff, type Area } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const ROLE = { ADMIN: 'Administrateur', COMMERCIAL: 'Commercial', EDITOR: 'Éditeur' } as const;

export default async function BoLayout({ children }: { children: ReactNode }) {
  const s = await requireStaff();
  const st = await (await getRepo()).stats();
  const all: { href: string; label: string; icon: string; area: Area; badge?: number }[] = [
    { href: '/', label: 'Tableau de bord', icon: '◧', area: 'dashboard' },
    { href: '/produits', label: 'Catalogue', icon: '▦', area: 'catalogue', badge: st.lowStock },
    { href: '/tarifs', label: 'Tarifs & paramètres', icon: '％', area: 'pricing' },
    { href: '/comptes', label: 'Comptes pro', icon: '◉', area: 'accounts', badge: st.pendingAccounts },
    { href: '/commandes', label: 'Commandes', icon: '⇄', area: 'orders', badge: st.openOrders },
    { href: '/demandes', label: 'Contacts & devis', icon: '✉', area: 'leads', badge: st.newLeads },
    { href: '/actualites', label: 'Actualités', icon: '✎', area: 'news' },
    { href: '/medias', label: 'Médiathèque', icon: '▣', area: 'media' },
    { href: '/utilisateurs', label: 'Utilisateurs', icon: '☰', area: 'staff' },
    { href: '/journal', label: 'Journal d’audit', icon: '⌚', area: 'audit' },
  ];
  return (
    <div className="sn-shell">
      <aside className="sn-side">
        <div className="sn-brand"><FlsMark size={34} /><div>Back-office FLS<small>fls.sn/admin-fls</small></div></div>
        <Nav items={all.filter((i) => can(s.role, i.area)).map(({ area: _a, ...i }) => i)} />
        <div className="sn-me"><b>{s.name}</b>{ROLE[s.role]} · {s.email}
          <form action={logout} style={{ marginTop: 10 }}><button className="sn-btn line sm" type="submit">Se déconnecter</button></form>
          <a href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'} style={{ padding: '8px 0', fontSize: '.82rem' }}>↗ Voir le site</a></div>
      </aside>
      <main className="sn-main" id="contenu">{children}</main>
    </div>
  );
}
