'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PostDTO, UniverseDTO } from '@fls/db';
import { savePost } from '@/lib/actions';
import { NEWS_CATS } from '@/lib/format';
import { BlockEditor } from './BlockEditor';
import { MediaPicker } from './MediaPicker';
import { ActionForm } from './ui';

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120);

export function PostForm({ post, universes, library, products }: { post: PostDTO | null; universes: UniverseDTO[]; library: string[]; products: { code: string; name: string }[] }) {
  const router = useRouter(); const [title, setTitle] = useState(post?.title.fr ?? ''); const [slug, setSlug] = useState(post?.slug ?? ''); const [touched, setTouched] = useState(!!post);
  return (
    <ActionForm action={savePost} okMsg="Actualité enregistrée." onOk={(r) => { if (!post && r.ok && typeof r.data === 'string') router.replace(`/actualites/${r.data}`); }}>
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="sn-card sn-form">
        <div className="sn-f2">
          <div className="sn-fld"><label htmlFor="tFr">Titre (FR)</label><input className="sn-in" id="tFr" name="titleFr" required value={title} onChange={(e) => { setTitle(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} /></div>
          <div className="sn-fld"><label htmlFor="tEn">Titre (EN)</label><input className="sn-in" id="tEn" name="titleEn" required defaultValue={post?.title.en} /></div>
          <div className="sn-fld"><label htmlFor="eFr">Chapô (FR)</label><textarea className="sn-in" id="eFr" name="excerptFr" defaultValue={post?.excerpt.fr} /></div>
          <div className="sn-fld"><label htmlFor="eEn">Chapô (EN)</label><textarea className="sn-in" id="eEn" name="excerptEn" defaultValue={post?.excerpt.en} /></div>
        </div>
        <div className="sn-f3">
          <div className="sn-fld"><label htmlFor="slug">Adresse (slug)</label><input className="sn-in" id="slug" name="slug" required value={slug} onChange={(e) => { setSlug(e.target.value); setTouched(true); }} /></div>
          <div className="sn-fld"><label htmlFor="cat">Rubrique</label><select className="sn-in" id="cat" name="category" defaultValue={post?.category ?? 'arrivages'}>{Object.entries(NEWS_CATS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div className="sn-fld"><label htmlFor="st">Statut</label><select className="sn-in" id="st" name="status" defaultValue={post?.status ?? 'DRAFT'}><option value="DRAFT">Brouillon</option><option value="PUBLISHED">Publié</option></select></div>
          <div className="sn-fld"><label htmlFor="fp">Produit mis en avant</label><select className="sn-in" id="fp" name="featuredProductCode" defaultValue={post?.featuredProductCode ?? ''}><option value="">—</option>{products.map((p) => <option key={p.code} value={p.code}>{p.code} · {p.name}</option>)}</select></div>
        </div>
        <MediaPicker name="cover" value={post?.cover ?? null} library={library} label="Image de couverture" />
        <div className="sn-checks"><label className="sn-chk"><input type="checkbox" name="showOnHome" defaultChecked={post?.showOnHome ?? true} />Afficher sur l’accueil</label>{universes.map((u) => <label className="sn-chk" key={u.slug}><input type="checkbox" name="universes" value={u.slug} defaultChecked={post?.universes.includes(u.slug)} />{u.name.fr}</label>)}</div>
      </div>
      <div className="sn-card sn-form"><h2>Contenu</h2><BlockEditor initial={post?.blocks ?? [{ type: 'text', data: { html: '', htmlEn: '' } }]} library={library} /></div>
      <div className="sn-sticky"><a className="sn-btn line" href="/admin-fls/actualites">Annuler</a><button className="sn-btn go" type="submit">Enregistrer</button></div>
    </ActionForm>
  );
}
