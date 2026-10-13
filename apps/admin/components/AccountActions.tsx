'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { AccountStatus } from '@fls/db';
import type { Segment } from '@fls/core';
import { moderateAccount, resetCustomerPassword } from '@/lib/actions';
import { SEGMENTS } from '@/lib/format';

/** Validation d'un compte pro : segment tarifaire, plafond d'encours, mot de passe provisoire à transmettre au client. */
export function AccountActions({ id, status, segment, creditLimit }: { id: string; status: AccountStatus; segment: Segment; creditLimit: number }) {
  const [seg, setSeg] = useState(segment); const [credit, setCredit] = useState(creditLimit); const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null); const [temp, setTemp] = useState(''); const router = useRouter();
  const run = (st: AccountStatus) => start(async () => {
    const r = await moderateAccount(id, st, seg, credit);
    if (!r.ok) { setMsg({ ok: false, text: r.error }); return; }
    // Le mot de passe provisoire n'est affiché qu'une fois : on garde la carte à l'écran jusqu'à ce que l'utilisateur actualise.
    if (typeof r.data === 'string') { setTemp(r.data); setMsg({ ok: true, text: `Compte validé. Mot de passe provisoire à transmettre au client (SMS ou e-mail) : ${r.data}` }); }
    else { setMsg({ ok: true, text: 'Statut mis à jour.' }); router.refresh(); }
  });
  return (
    <div className="sn-form" style={{ gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="sn-in" style={{ width: 'auto' }} value={seg} onChange={(e) => setSeg(e.target.value as Segment)} aria-label="Grille tarifaire">{Object.entries(SEGMENTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <input className="sn-in sn-num" type="number" min={0} step={100000} value={credit} onChange={(e) => setCredit(Math.max(0, +e.target.value || 0))} style={{ width: 140 }} aria-label="Plafond d’encours (F CFA)" title="Plafond d’encours (F CFA)" />
        {status !== 'APPROVED' && <button type="button" className="sn-btn go sm" disabled={pending} onClick={() => run('APPROVED')}>Valider</button>}
        {status === 'APPROVED' && <button type="button" className="sn-btn sm" disabled={pending} onClick={() => run('APPROVED')}>Mettre à jour</button>}
        {status === 'PENDING' && <button type="button" className="sn-btn red sm" disabled={pending} onClick={() => run('REJECTED')}>Refuser</button>}
        {status === 'APPROVED' && <button type="button" className="sn-btn red sm" disabled={pending} onClick={() => run('SUSPENDED')}>Suspendre</button>}
        {status === 'APPROVED' && <button type="button" className="sn-btn line sm" disabled={pending} onClick={() => start(async () => { const r = await resetCustomerPassword(id); setMsg(r.ok ? { ok: true, text: `Nouveau mot de passe provisoire : ${String(r.data)}` } : { ok: false, text: r.error }); })}>Réinitialiser le mot de passe</button>}
      </div>
      {msg && <p className={`sn-msg ${msg.ok ? 'ok' : 'err'}`} role="status" style={{ margin: 0 }}>{msg.text}{temp && <> <button type="button" className="sn-btn line sm" onClick={() => navigator.clipboard?.writeText(temp)}>Copier</button> <button type="button" className="sn-btn sm" onClick={() => { setTemp(''); setMsg(null); router.refresh(); }}>Terminé</button></>}</p>}
    </div>
  );
}
