'use client';

import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import { useT } from '../providers';

/** Champ de formulaire accessible : libellé, message d'erreur relié par aria-describedby. */
export function Field({ id, label, error, children }: { id: string; label: ReactNode; error?: string; children: ReactNode }) {
  return <div className="sn-fld"><label htmlFor={id}>{label}</label>{children}{error && <span className="sn-errm" id={`${id}-err`}>{error}</span>}</div>;
}
export const errProps = (id: string, error?: string) => (error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-err` } : {});

/** Contrôle côté navigateur des champs requis (le serveur revalide tout avec zod). */
export function useRequired() {
  const t = useT();
  return (form: HTMLFormElement, names: string[], extra?: (f: FormData) => Record<string, string>) => {
    const f = new FormData(form); const e: Record<string, string> = {};
    names.forEach((n) => { if (!String(f.get(n) ?? '').trim()) e[n] = t('Ce champ est obligatoire.', 'This field is required.'); });
    Object.assign(e, extra?.(f) ?? {});
    if (Object.keys(e).length) setTimeout(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
    return e;
  };
}

export function Success({ title, text, refCode, children }: { title: string; text: string; refCode?: string; children?: ReactNode }) {
  return <div className="sn-ok-panel" role="status"><div className="sn-ok-ic"><Icon name="check" /></div><h3>{title}</h3><p>{text}</p>{refCode && <span className="sn-ref">{refCode}</span>}{children}</div>;
}

export function FileDrop({ id, name, accept, multiple, label, hint, files, onFiles }: { id: string; name: string; accept: string; multiple?: boolean; label: string; hint: string; files: File[]; onFiles: (f: File[]) => void }) {
  const add = (list: FileList | null) => { if (list) onFiles(multiple ? [...files, ...list] : [...list].slice(0, 1)); };
  return (
    <>
      <label className="sn-drop" htmlFor={id} onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('sn-over'); }} onDragLeave={(e) => e.currentTarget.classList.remove('sn-over')} onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('sn-over'); add(e.dataTransfer.files); }}>
        <Icon name="upload" /><b>{label}</b><br />{hint}
      </label>
      <input type="file" id={id} name={name} className="sn-sr" multiple={multiple} accept={accept} onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      <ul className="sn-files">{files.map((f, i) => <li key={`${f.name}-${i}`}><Icon name="doc" /><span>{f.name}</span><button type="button" className="sn-x" onClick={() => onFiles(files.filter((_, k) => k !== i))} aria-label={`Retirer ${f.name}`}><Icon name="close" /></button></li>)}</ul>
    </>
  );
}
