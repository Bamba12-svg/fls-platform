import '@fontsource-variable/figtree';
import './admin.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: { default: 'Back-office FLS', template: '%s · Back-office FLS' }, robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
