import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function NotFound() {
  return (
    <section className="sn-sec"><div className="sn-wrap sn-empty"><Icon name="search" /><b>Cette page n’existe pas · Page not found</b><p>Le lien est peut-être ancien. · The link may be outdated.</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}><Link className="sn-btn sn-btn-nv" href="/fr">Accueil</Link><Link className="sn-btn sn-btn-line" href="/en">Home</Link></div></div></section>
  );
}
