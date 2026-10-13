'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { setStock } from '@/lib/actions';

/** Mise à jour rapide du stock depuis la liste (journalisée). */
export function StockCell({ id, code, stock, editable }: { id: string; code: string; stock: number; editable: boolean }) {
  const [v, setV] = useState(stock); const [pending, start] = useTransition(); const [state, setState] = useState<'' | 'ok' | 'err'>(''); const router = useRouter();
  const cls = stock <= 0 ? 'r' : stock < 60 ? 'w' : 'g';
  if (!editable) return <span className={`sn-pill ${cls}`}>{stock} ct</span>;
  return (
    <form style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }} onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await setStock(id, code, v); setState(r.ok ? 'ok' : 'err'); if (r.ok) router.refresh(); }); }}>
      <input className="sn-in sn-num" type="number" min={0} value={v} onChange={(e) => { setV(Math.max(0, Math.floor(+e.target.value || 0))); setState(''); }} style={{ width: 90, padding: '5px 8px' }} aria-label={`Stock ${code}`} />
      {v !== stock && <button className="sn-btn sm" disabled={pending}>OK</button>}
      {state === 'ok' && <span className="sn-pill g">✓</span>}{state === 'err' && <span className="sn-pill r">Erreur</span>}
      {v === stock && state === '' && <span className={`sn-pill ${cls}`} aria-hidden="true">●</span>}
    </form>
  );
}
