import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { Photo } from './Photo';

export function Crumbs({ locale, items, dark = false }: { locale: Locale; items: [string | null, string][]; dark?: boolean }) {
  const t = (fr: string, en: string) => (locale === 'en' ? en : fr);
  const linkStyle = dark ? { color: 'var(--sn-navy)' } : undefined;
  return (
    <nav aria-label={t('Fil d’Ariane', 'Breadcrumb')}>
      <ol className="sn-crumbs" style={dark ? { color: 'var(--sn-muted)' } : undefined}>
        <li><Link href={`/${locale}`} style={linkStyle}>{t('Accueil', 'Home')}</Link></li>
        {items.map(([h, l], i) => <li key={i} aria-current={h ? undefined : 'page'}>{h ? <Link href={`/${locale}${h}`} style={linkStyle}>{l}</Link> : l}</li>)}
      </ol>
    </nav>
  );
}

export function PageHero({ locale, img, icon = 'box', title, lede, crumbs, side, compact = false }: { locale: Locale; img?: string | null; icon?: string; title: ReactNode; lede?: ReactNode; crumbs: [string | null, string][]; side?: ReactNode; compact?: boolean }) {
  return (
    <section className="sn-pagehero" style={img ? undefined : { background: 'var(--sn-navy)' }}>
      {img ? <Photo src={img} icon={icon} priority sizes="100vw" /> : null}
      <div className="sn-wrap sn-pagehero-in" style={compact ? { paddingBlock: '36px 40px' } : undefined}>
        <div><Crumbs locale={locale} items={crumbs} /><h1 style={compact ? { fontSize: 'clamp(1.8rem,3.4vw,2.6rem)' } : undefined}>{title}</h1>{lede ? <p>{lede}</p> : null}</div>
        {side}
      </div>
    </section>
  );
}
