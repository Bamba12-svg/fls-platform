'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav({ items }: { items: { href: string; label: string; icon: string; badge?: number }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Navigation du back-office" style={{ display: 'contents' }}>
      {items.map((i) => <Link key={i.href} href={i.href} aria-current={(i.href === '/' ? path === '/' : path.startsWith(i.href)) ? 'page' : undefined}><span aria-hidden="true">{i.icon}</span>{i.label}{i.badge ? <span className="sn-badge">{i.badge}</span> : null}</Link>)}
    </nav>
  );
}
