'use client';

import { uploadMedia } from '@/lib/actions';
import { ActionForm } from './ui';

export function Uploader() {
  return (
    <ActionForm action={uploadMedia} okMsg="Fichiers ajoutés et convertis en WebP." resetOnOk className="sn-card sn-form">
      <h2>Ajouter des fichiers</h2>
      <p className="sn-mut" style={{ margin: 0 }}>Images JPG, PNG, WebP ou AVIF (converties automatiquement en WebP, 2000 px max) et documents PDF. 10 Mo par fichier, 10 fichiers à la fois.</p>
      <div className="sn-f2">
        <div className="sn-fld"><label htmlFor="files">Fichiers</label><input className="sn-in" id="files" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" required /></div>
        <div className="sn-fld"><label htmlFor="alt">Texte alternatif (accessibilité)</label><input className="sn-in" id="alt" name="alt" placeholder="Ex. : Camion FLS en livraison à Thiès" /></div>
      </div>
      <button className="sn-btn go" type="submit" style={{ justifySelf: 'start' }}>Téléverser</button>
    </ActionForm>
  );
}
