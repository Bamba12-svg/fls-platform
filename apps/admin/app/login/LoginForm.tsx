'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/lib/actions';

function Submit() { const { pending } = useFormStatus(); return <button type="submit" className="sn-btn go" disabled={pending} style={{ width: '100%' }}>{pending ? 'Connexion…' : 'Se connecter'}</button>; }

export function LoginForm() {
  const [state, action] = useFormState(login, {});
  return (
    <form action={action} className="sn-form">
      {state?.error && <p className="sn-msg err" role="alert">{state.error}</p>}
      <div className="sn-fld"><label htmlFor="email">E-mail</label><input className="sn-in" id="email" name="email" type="email" autoComplete="username" required /></div>
      <div className="sn-fld"><label htmlFor="password">Mot de passe</label><input className="sn-in" id="password" name="password" type="password" autoComplete="current-password" required /></div>
      <Submit />
    </form>
  );
}
