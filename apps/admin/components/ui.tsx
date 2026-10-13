'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import type { Result } from '@/lib/actions';

/** Formulaire relié à une action serveur : message de résultat, état d'envoi, rafraîchissement. */
export function ActionForm({ action, children, className = 'sn-form', okMsg = 'Modifications enregistrées.', onOk, resetOnOk }: { action: (fd: FormData) => Promise<Result>; children: ReactNode; className?: string; okMsg?: string; onOk?: (r: Result) => void; resetOnOk?: boolean }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null); const [pending, start] = useTransition(); const router = useRouter();
  return (
    <form className={className} onSubmit={(e) => {
      e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form);
      start(async () => { const r = await action(fd); setMsg(r.ok ? { ok: true, text: r.msg ?? okMsg } : { ok: false, text: r.error }); if (r.ok) { onOk?.(r); if (resetOnOk) form.reset(); router.refresh(); } });
    }} aria-busy={pending}>
      {children}
      {msg && <p className={`sn-msg ${msg.ok ? 'ok' : 'err'}`} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
      <fieldset disabled={pending} style={{ display: 'none' }} />
    </form>
  );
}

export function Submit({ children = 'Enregistrer', className = 'sn-btn go' }: { children?: ReactNode; className?: string }) {
  return <button className={className} type="submit">{children}</button>;
}

/** Sélecteur de statut qui enregistre immédiatement. */
export function StatusSelect({ value, options, onSave, label }: { value: string; options: [string, string][]; onSave: (v: string) => Promise<Result>; label: string }) {
  const [v, setV] = useState(value); const [pending, start] = useTransition(); const [err, setErr] = useState(''); const router = useRouter();
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <select className="sn-in" style={{ width: 'auto', padding: '5px 8px' }} aria-label={label} value={v} disabled={pending} onChange={(e) => { const n = e.target.value; const prev = v; setV(n); start(async () => { const r = await onSave(n); if (!r.ok) { setV(prev); setErr(r.error); } else { setErr(''); router.refresh(); } }); }}>
        {options.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      {err && <span className="sn-pill r" role="alert">{err}</span>}
    </span>
  );
}
