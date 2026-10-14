import { redirect } from 'next/navigation';
import { currentStaff } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';
export default async function Login() {
  if (await currentStaff()) redirect('/');
  return (
    <main className="sn-login"><div className="sn-card">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}><Mark /><div><b style={{ color: 'var(--sn-navy-9)' }}>Back-office FLS</b><div className="sn-mut">Fourniture Libre Service · Groupe COSEMAD</div></div></div>
      <h1 style={{ fontSize: '1.3rem', marginBottom: 14 }}>Connexion</h1>
      <LoginForm />
      <p className="sn-mut" style={{ marginTop: 16 }}>Accès réservé au personnel FLS. Chaque action est enregistrée dans le journal d’audit.</p>
    </div></main>
  );
}
function Mark() { return <svg viewBox="0 0 64 64" width={40} height={40} aria-hidden="true"><rect width="64" height="64" rx="14" fill="#0A4A2A" /><path d="M24 8h26L38 56H12Z" fill="#0E7745" /><text x="31" y="47" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontWeight={900} fontSize={36} fill="#DCCB2E" transform="skewX(-11) translate(8 0)">F</text></svg>; }
