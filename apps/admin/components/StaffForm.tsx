'use client';

import type { StaffDTO } from '@fls/db';
import { saveStaff } from '@/lib/actions';
import { ActionForm } from './ui';

export function StaffForm({ u }: { u?: StaffDTO }) {
  return (
    <ActionForm action={saveStaff} okMsg={u ? 'Utilisateur mis à jour.' : 'Utilisateur créé.'} resetOnOk={!u} className="sn-form">
      {u && <input type="hidden" name="id" value={u.id} />}
      <div className="sn-f3">
        <div className="sn-fld"><label htmlFor={`n-${u?.id ?? 'new'}`}>Nom</label><input className="sn-in" id={`n-${u?.id ?? 'new'}`} name="name" required defaultValue={u?.name} /></div>
        <div className="sn-fld"><label htmlFor={`e-${u?.id ?? 'new'}`}>E-mail</label><input className="sn-in" id={`e-${u?.id ?? 'new'}`} name="email" type="email" required defaultValue={u?.email} /></div>
        <div className="sn-fld"><label htmlFor={`r-${u?.id ?? 'new'}`}>Rôle</label><select className="sn-in" id={`r-${u?.id ?? 'new'}`} name="role" defaultValue={u?.role ?? 'COMMERCIAL'}><option value="ADMIN">Administrateur</option><option value="COMMERCIAL">Commercial</option><option value="EDITOR">Éditeur</option></select></div>
        <div className="sn-fld"><label htmlFor={`p-${u?.id ?? 'new'}`}>{u ? 'Nouveau mot de passe' : 'Mot de passe initial'}</label><input className="sn-in" id={`p-${u?.id ?? 'new'}`} name="password" type="password" autoComplete="new-password" required={!u} placeholder={u ? 'Laisser vide pour ne pas changer' : '10 car., 1 majuscule, 1 chiffre'} /></div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><label className="sn-chk"><input type="checkbox" name="active" defaultChecked={u?.active ?? true} />Compte actif</label><button className="sn-btn sm go" type="submit">{u ? 'Enregistrer' : 'Créer l’utilisateur'}</button></div>
    </ActionForm>
  );
}
