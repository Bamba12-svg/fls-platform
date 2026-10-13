import Link from 'next/link';
import type { Locale } from '@/lib/i18n';

/** Logo FLS redessiné en vectoriel d'après l'original (blocs verts inclinés, lettres jaunes). */
export function LogoMark({ height = 40 }: { height?: number }) {
  return (
    <svg className="sn-logo-svg" viewBox="0 0 132 64" style={{ height }} aria-hidden="true" focusable="false">
      {['F', 'L', 'S'].map((l, i) => (
        <g key={l} transform={`translate(${i * 42} 0)`}>
          <path d="M12 0h30L30 64H0Z" fill="#0E7745" />
          <text x="21" y="50" textAnchor="middle" fontFamily="'Figtree Variable',Arial Black,sans-serif" fontWeight={900} fontSize={46} fill="#DCCB2E" transform="skewX(-11) translate(9 0)">{l}</text>
        </g>
      ))}
    </svg>
  );
}

export function Logo({ locale, sub = true, light = false }: { locale: Locale; sub?: boolean; light?: boolean }) {
  return (
    <Link className="sn-logo" href={`/${locale}`} aria-label={locale === 'en' ? 'FLS, home' : 'FLS, accueil'} style={light ? { color: '#fff' } : undefined}>
      <LogoMark />
      {sub && (
        <span className="sn-logo-tx">
          <b>Fourniture<br />Libre Service</b>
          <small>{locale === 'en' ? 'COSEMAD Group' : 'Groupe COSEMAD'}</small>
        </span>
      )}
    </Link>
  );
}
