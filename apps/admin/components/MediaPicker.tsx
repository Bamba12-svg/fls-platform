'use client';

import { useState } from 'react';
import { asset } from '@/lib/assets';

/** Sélecteur d'image contrôlé : champ URL + fenêtre de médiathèque filtrable. */
export function MediaPickerControlled({ value, library, label = 'Image', onChange, name }: { value: string; library: string[]; label?: string; onChange: (v: string) => void; name?: string }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState('');
  return (
    <div className="sn-fld">
      <span className="sn-lbl">{label}</span>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {value ? <img src={asset(value)} alt="" className="sn-thumb" style={{ width: 64, height: 64 }} /> : <span className="sn-thumb" style={{ width: 64, height: 64, display: 'grid', placeItems: 'center' }} aria-hidden="true">—</span>}
        <input className="sn-in" name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/img/p/… ou /uploads/media/…" aria-label={`${label} (adresse)`} />
        <button type="button" className="sn-btn line sm" onClick={() => setOpen(true)}>Choisir</button>
        {value && <button type="button" className="sn-btn red sm" onClick={() => onChange('')}>Retirer</button>}
      </div>
      {open && (
        <div className="sn-picker" role="dialog" aria-modal="true" aria-label="Choisir une image" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}><h2 style={{ marginRight: 'auto' }}>Médiathèque</h2><input className="sn-in" style={{ maxWidth: 260 }} autoFocus placeholder="Filtrer…" value={q} onChange={(e) => setQ(e.target.value)} /><button type="button" className="sn-btn line sm" onClick={() => setOpen(false)}>Fermer</button></div>
            <div className="sn-media">{library.filter((u) => u.toLowerCase().includes(q.toLowerCase())).map((u) => <button type="button" key={u} className="sn-pk" onClick={() => { onChange(u); setOpen(false); }}><figure><img src={asset(u)} alt="" loading="lazy" /><figcaption>{u.split('/').pop()}</figcaption></figure></button>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaPicker({ name, value, library, label }: { name: string; value: string | null; library: string[]; label?: string }) {
  const [v, setV] = useState(value ?? '');
  return <MediaPickerControlled name={name} value={v} onChange={setV} library={library} label={label} />;
}
