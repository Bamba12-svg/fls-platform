'use client';

import { useRef, useState } from 'react';
import type { Block } from '@fls/db';
import { asset } from '@/lib/assets';
import { MediaPickerControlled } from './MediaPicker';

type B = { type: Block['type']; data: Record<string, any> };
const LABEL: Record<Block['type'], string> = { text: 'Texte', image: 'Image', gallery: 'Galerie', video: 'Vidéo', file: 'Fichier PDF', product: 'Produit lié', nutrition: 'Nutrition', allergens: 'Allergènes' };
const EMPTY: Record<string, B['data']> = { text: { html: '', htmlEn: '' }, image: { url: '', alt: '', caption: '' }, gallery: { images: [] }, video: { url: '', title: '' }, file: { url: '', label: '' }, product: { code: '' } };

function Html({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (a: string, b: string) => { const el = ref.current; if (!el) return; const s = el.selectionStart, e = el.selectionEnd; const v = el.value; const n = v.slice(0, s) + a + v.slice(s, e) + b + v.slice(e); onChange(n); setTimeout(() => { el.focus(); el.setSelectionRange(s + a.length, e + a.length); }, 0); };
  return (
    <div className="sn-fld"><span className="sn-lbl">{label}</span>
      <div className="sn-tools" role="toolbar" aria-label={`Mise en forme ${label}`}>
        <button type="button" onClick={() => wrap('<p>', '</p>')}>¶ Paragraphe</button><button type="button" onClick={() => wrap('<strong>', '</strong>')}><b>G</b></button><button type="button" onClick={() => wrap('<em>', '</em>')}><i>I</i></button>
        <button type="button" onClick={() => wrap('<h2>', '</h2>')}>Titre</button><button type="button" onClick={() => wrap('<ul>\n<li>', '</li>\n</ul>')}>• Liste</button>
        <button type="button" onClick={() => { const u = prompt('Adresse du lien (https://… ou /fr/…)'); if (u) wrap(`<a href="${u.replace(/"/g, '')}">`, '</a>'); }}>Lien</button>
      </div>
      <textarea ref={ref} className="sn-in" style={{ fontFamily: 'ui-monospace,monospace', fontSize: '.85rem', minHeight: 120 }} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** Éditeur de blocs (texte FR/EN, image, galerie, vidéo, fichier, produit lié). Le HTML est nettoyé côté serveur. */
export function BlockEditor({ initial, library, name = 'blocks', allowed = ['text', 'image', 'gallery', 'video', 'file', 'product'] }: { initial: Block[] | null; library: string[]; name?: string; allowed?: Block['type'][] }) {
  const [blocks, setBlocks] = useState<B[]>((initial ?? []) as B[]);
  const upd = (i: number, data: B['data']) => setBlocks((bs) => bs.map((b, k) => (k === i ? { ...b, data: { ...b.data, ...data } } : b)));
  const move = (i: number, d: number) => setBlocks((bs) => { const n = [...bs]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j]!, n[i]!]; return n; });
  return (
    <div className="sn-form">
      <input type="hidden" name={name} value={JSON.stringify(blocks)} />
      {blocks.map((b, i) => (
        <div className="sn-blk" key={i}>
          <div className="sn-blk-h"><b>{LABEL[b.type]}</b><button type="button" className="sn-btn line sm" onClick={() => move(i, -1)} aria-label="Monter">↑</button><button type="button" className="sn-btn line sm" onClick={() => move(i, 1)} aria-label="Descendre">↓</button><button type="button" className="sn-btn red sm" onClick={() => setBlocks((bs) => bs.filter((_, k) => k !== i))}>Supprimer</button></div>
          {b.type === 'text' && <div className="sn-f2"><Html label="Français" value={b.data.html ?? ''} onChange={(v) => upd(i, { html: v })} /><Html label="English" value={b.data.htmlEn ?? ''} onChange={(v) => upd(i, { htmlEn: v })} /></div>}
          {b.type === 'image' && <><ImageField value={b.data.url} library={library} onChange={(url) => upd(i, { url })} /><div className="sn-f2"><input className="sn-in" placeholder="Texte alternatif (accessibilité)" value={b.data.alt ?? ''} onChange={(e) => upd(i, { alt: e.target.value })} /><input className="sn-in" placeholder="Légende" value={b.data.caption ?? ''} onChange={(e) => upd(i, { caption: e.target.value })} /></div></>}
          {b.type === 'gallery' && <>
            <div className="sn-media">{(b.data.images as { url: string }[]).map((g, k) => <figure key={k}><img src={asset(g.url)} alt="" /><figcaption><button type="button" className="sn-btn red sm" onClick={() => upd(i, { images: (b.data.images as unknown[]).filter((_, x) => x !== k) })}>Retirer</button></figcaption></figure>)}</div>
            <GalleryAdd library={library} onAdd={(url) => upd(i, { images: [...(b.data.images as unknown[]), { url, alt: '' }] })} /></>}
          {b.type === 'video' && <div className="sn-f2"><input className="sn-in" placeholder="Lien YouTube ou fichier MP4" value={b.data.url ?? ''} onChange={(e) => upd(i, { url: e.target.value })} /><input className="sn-in" placeholder="Titre" value={b.data.title ?? ''} onChange={(e) => upd(i, { title: e.target.value })} /></div>}
          {b.type === 'file' && <div className="sn-f2"><input className="sn-in" placeholder="/uploads/media/fiche.pdf" value={b.data.url ?? ''} onChange={(e) => upd(i, { url: e.target.value })} /><input className="sn-in" placeholder="Libellé du lien" value={b.data.label ?? ''} onChange={(e) => upd(i, { label: e.target.value })} /></div>}
          {b.type === 'product' && <input className="sn-in" placeholder="Code article, ex. UL-033" value={b.data.code ?? ''} onChange={(e) => upd(i, { code: e.target.value.toUpperCase() })} />}
        </div>
      ))}
      <div className="sn-tools" aria-label="Ajouter un bloc">{allowed.map((t) => <button key={t} type="button" onClick={() => setBlocks((bs) => [...bs, { type: t, data: structuredClone(EMPTY[t] ?? {}) }])}>+ {LABEL[t]}</button>)}</div>
    </div>
  );
}

function ImageField({ value, library, onChange, label = 'Image' }: { value: string; library: string[]; onChange: (v: string) => void; label?: string }) {
  return <MediaPickerControlled value={value} library={library} label={label} onChange={onChange} />;
}

function GalleryAdd({ library, onAdd }: { library: string[]; onAdd: (url: string) => void }) {
  const [v, setV] = useState('');
  return <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}><div style={{ flex: 1 }}><MediaPickerControlled value={v} onChange={setV} library={library} label="Ajouter une image" /></div><button type="button" className="sn-btn sm" disabled={!v} onClick={() => { onAdd(v); setV(''); }}>Ajouter</button></div>;
}
