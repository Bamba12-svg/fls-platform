'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Icon } from '../Icon';
import { useLocale, useT } from '../providers';

const DEMO = [
  ['grossiste@demo.fls.sn', 'Établissements Diop & Frères', 'Grossiste · Touba'],
  ['demi@demo.fls.sn', 'Supérette Keur Yaye', 'Demi-grossiste · Dakar'],
  ['chr@demo.fls.sn', 'Le Comptoir Fast-Food', 'Restauration · Dakar'],
  ['b2c@demo.fls.sn', 'Particulier', 'Prix unitaires TTC'],
] as const;

export function LoginForm({ demo }: { demo: boolean }) {
  const t = useT(); const l = useLocale(); const router = useRouter(); const sp = useSearchParams();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  const go = async (e?: React.FormEvent, creds?: { email: string; password: string }) => {
    e?.preventDefault(); setPending(true); setError('');
    const r = await signIn('credentials', { redirect: false, email: creds?.email ?? email, password: creds?.password ?? password });
    setPending(false);
    if (!r || r.error) { setError(t('E-mail ou mot de passe incorrect, ou compte pas encore validé par un commercial.', 'Wrong email or password, or account not yet approved by a sales rep.')); return; }
    const next = sp.get('next'); router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : `/${l}/compte`); router.refresh();
  };
  const initials = (s: string) => s.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="sn-login-g">
      <div className="sn-login-side">
        <h2 style={{ color: '#fff', fontSize: '1.6rem' }}>{t('Mon Compte FLS', 'My FLS Account')}</h2>
        <p style={{ color: '#C9D6E4', marginTop: 10 }}>{t('Vos prix négociés, vos factures et la recommande en un clic.', 'Your negotiated prices, invoices and one-click reorders.')}</p>
        <ul className="sn-checks" style={{ gridTemplateColumns: '1fr', margin: '24px 0 0' }}>{[t('Grille tarifaire selon votre profil', 'Price grid for your profile'), t('Suivi des livraisons', 'Delivery tracking'), t('Factures PDF et encours', 'PDF invoices and balance')].map((x) => <li key={x} style={{ color: '#fff' }}><Icon name="check" /><span style={{ color: '#fff' }}>{x}</span></li>)}</ul>
      </div>
      <div style={{ padding: 'clamp(20px,3vw,32px)' }}>
        <form className="sn-form" onSubmit={go} noValidate>
          <h1 style={{ fontSize: '1.4rem' }}>{t('Se connecter', 'Sign in')}</h1>
          {error && <p className="sn-errm" role="alert" style={{ fontSize: '.9rem' }}>{error}</p>}
          <div className="sn-fld"><label htmlFor="sn-l-mail">E-mail</label><input className="sn-in" id="sn-l-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="sn-fld"><label htmlFor="sn-l-pw">{t('Mot de passe', 'Password')}</label><input className="sn-in" id="sn-l-pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="sn-btn sn-btn-nv sn-btn-block" disabled={pending}>{pending ? t('Connexion…', 'Signing in…') : t('Se connecter', 'Sign in')}</button>
          <p style={{ fontSize: '.85rem', color: 'var(--sn-muted)' }}>{t('Pas encore client ?', 'Not a client yet?')} <Link href={`/${l}/contact`}>{t('Ouvrir un compte pro', 'Open a pro account')}</Link></p>
        </form>
        {demo && (
          <div style={{ marginTop: 24, borderTop: '1px solid var(--sn-line)', paddingTop: 18 }}>
            <h2 className="sn-h4">{t('Comptes de démonstration', 'Demo accounts')}</h2>
            <p style={{ fontSize: '.8rem', color: 'var(--sn-muted)', margin: '4px 0 10px' }}>{t('Mot de passe : Demo2026! · chaque profil voit sa propre grille.', 'Password: Demo2026! · each profile sees its own grid.')}</p>
            <div style={{ display: 'grid', gap: 6 }}>{DEMO.map(([m, co, d]) => <button key={m} type="button" className="sn-demo-o" style={{ borderColor: 'var(--sn-line)' }} disabled={pending} onClick={() => go(undefined, { email: m, password: 'Demo2026!' })}><span className="sn-av" style={{ width: 32, height: 32 }}>{initials(co)}</span><span><b>{co}</b><small>{d}</small></span></button>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
