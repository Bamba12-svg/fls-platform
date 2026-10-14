import { redirect } from 'next/navigation';
import { currentStaff } from '@/lib/auth';
import { LoginForm } from './LoginForm';
import { FlsMark } from '@/components/FlsMark';

export const dynamic = 'force-dynamic';
export default async function Login() {
  if (await currentStaff()) redirect('/');
  return (
    <main className="sn-login"><div className="sn-card">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}><Mark /><div><b style={{ color: 'var(--sn-navy-9)' }}>Back-office FLS</b><div className="sn-mut">Fournisseur Libre Service · Groupe COSEMAD</div></div></div>
      <h1 style={{ fontSize: '1.3rem', marginBottom: 14 }}>Connexion</h1>
      <LoginForm />
      <p className="sn-mut" style={{ marginTop: 16 }}>Accès réservé au personnel FLS. Chaque action est enregistrée dans le journal d’audit.</p>
    </div></main>
  );
}
function Mark() { return <FlsMark size={44} />; }
