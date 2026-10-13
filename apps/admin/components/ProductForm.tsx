'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ProductDTO, UniverseDTO } from '@fls/db';
import { saveProduct } from '@/lib/actions';
import { ALLERGENS } from '@/lib/format';
import { BlockEditor } from './BlockEditor';
import { MediaPicker } from './MediaPicker';
import { ActionForm } from './ui';

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function ProductForm({ p, universes, library, readOnly }: { p: ProductDTO | null; universes: UniverseDTO[]; library: string[]; readOnly: boolean }) {
  const router = useRouter(); const [name, setName] = useState(p?.name.fr ?? ''); const [slug, setSlug] = useState(p?.slug ?? ''); const [slugTouched, setSlugTouched] = useState(!!p);
  const [unis, setUnis] = useState<string[]>(p?.universes ?? []);
  const subs = universes.filter((u) => unis.includes(u.slug)).flatMap((u) => u.subcategories.map((s) => ({ ...s, u: u.name.fr })));
  return (
    <ActionForm action={saveProduct} okMsg="Produit enregistré. Le site est mis à jour." onOk={(r) => { if (!p && r.ok && typeof r.data === 'string') router.replace(`/produits/${r.data}`); }}>
      <fieldset disabled={readOnly} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 16 }}>
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="sn-card sn-form"><h2>Identification</h2>
          <div className="sn-f3">
            <div className="sn-fld"><label htmlFor="code">Code article</label><input className="sn-in sn-num" id="code" name="code" required defaultValue={p?.code} placeholder="UL-033" /></div>
            <div className="sn-fld"><label htmlFor="brand">Marque</label><input className="sn-in" id="brand" name="brand" required defaultValue={p?.brand.name} /></div>
            <div className="sn-fld"><label htmlFor="origin">Origine</label><input className="sn-in" id="origin" name="origin" defaultValue={p?.origin ?? ''} /></div>
          </div>
          <div className="sn-f2">
            <div className="sn-fld"><label htmlFor="nameFr">Nom (FR)</label><input className="sn-in" id="nameFr" name="nameFr" required value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} /></div>
            <div className="sn-fld"><label htmlFor="nameEn">Nom (EN)</label><input className="sn-in" id="nameEn" name="nameEn" required defaultValue={p?.name.en} /></div>
          </div>
          <div className="sn-fld"><label htmlFor="slug">Adresse de la page (slug)</label><input className="sn-in" id="slug" name="slug" required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} /><span className="sn-mut">fls.sn/fr/categories/{unis[0] ?? '…'}/{slug || '…'}</span></div>
          <div className="sn-f2">
            <div className="sn-fld"><label htmlFor="dFr">Description (FR)</label><textarea className="sn-in" id="dFr" name="descriptionFr" defaultValue={p?.description?.fr} /></div>
            <div className="sn-fld"><label htmlFor="dEn">Description (EN)</label><textarea className="sn-in" id="dEn" name="descriptionEn" defaultValue={p?.description?.en} /></div>
          </div>
        </div>

        <div className="sn-card sn-form"><h2>Univers associés</h2><p className="sn-mut" style={{ margin: 0 }}>Un produit peut apparaître dans plusieurs univers. Le premier coché est l’univers principal (adresse de la page).</p>
          <div className="sn-checks">{universes.map((u) => <label className="sn-chk" key={u.slug}><input type="checkbox" name="universes" value={u.slug} checked={unis.includes(u.slug)} onChange={(e) => setUnis((x) => (e.target.checked ? [...x, u.slug] : x.filter((y) => y !== u.slug)))} />{u.name.fr}</label>)}</div>
          <div className="sn-fld" style={{ maxWidth: 420 }}><label htmlFor="sub">Famille</label><select className="sn-in" id="sub" name="subcategory" defaultValue={p?.subcategory ?? ''}><option value="">—</option>{subs.map((s) => <option key={s.id} value={s.slug}>{s.u} › {s.name.fr}</option>)}</select></div>
        </div>

        <div className="sn-card sn-form"><h2>Conditionnement, prix et stock</h2>
          <div className="sn-f2">
            <div className="sn-fld"><label htmlFor="packFr">Conditionnement (FR)</label><input className="sn-in" id="packFr" name="packFr" required defaultValue={p?.pack.fr} placeholder="Carton 24 × 33 cl canette" /></div>
            <div className="sn-fld"><label htmlFor="packEn">Conditionnement (EN)</label><input className="sn-in" id="packEn" name="packEn" required defaultValue={p?.pack.en} /></div>
          </div>
          <div className="sn-f3">
            <div className="sn-fld"><label htmlFor="upc">Unités / carton</label><input className="sn-in" id="upc" name="unitsPerCase" type="number" min={1} required defaultValue={p?.unitsPerCase ?? 12} /></div>
            <div className="sn-fld"><label htmlFor="cpp">Cartons / palette</label><input className="sn-in" id="cpp" name="casesPerPallet" type="number" min={1} required defaultValue={p?.casesPerPallet ?? 60} /></div>
            <div className="sn-fld"><label htmlFor="mom">Multiple de vente</label><input className="sn-in" id="mom" name="minOrderMultiple" type="number" min={1} defaultValue={p?.minOrderMultiple ?? 1} /></div>
            <div className="sn-fld"><label htmlFor="price">Prix de base carton HT (F CFA)</label><input className="sn-in sn-num" id="price" name="basePrice" type="number" min={0} required defaultValue={p?.basePrice} /></div>
            <div className="sn-fld"><label htmlFor="stock">Stock (cartons)</label><input className="sn-in sn-num" id="stock" name="stock" type="number" min={0} required defaultValue={p?.stock ?? 0} /></div>
          </div>
        </div>

        <div className="sn-card sn-form"><h2>Visuel, allergènes et mise en avant</h2>
          <MediaPicker name="image" value={p?.image ?? null} library={library} label="Packshot (fond blanc de préférence)" />
          <div className="sn-fld"><span className="sn-lbl">Allergènes déclarés</span><div className="sn-checks">{Object.entries(ALLERGENS).map(([k, l]) => <label className="sn-chk" key={k}><input type="checkbox" name="allergens" value={k} defaultChecked={p?.allergens.includes(k)} />{l}</label>)}</div></div>
          <div className="sn-checks">
            <label className="sn-chk"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} />Visible sur le site</label>
            <label className="sn-chk"><input type="checkbox" name="halal" defaultChecked={p?.halal} />Halal (certificat fournisseur)</label>
            <label className="sn-chk"><input type="checkbox" name="isNew" defaultChecked={p?.isNew} />Nouveau</label>
            <label className="sn-chk"><input type="checkbox" name="isDeal" defaultChecked={p?.isDeal} />Offre du mois</label>
            <label className="sn-chk"><input type="checkbox" name="isFeatured" defaultChecked={p?.isFeatured} />Mis en avant à l’accueil</label>
          </div>
        </div>

        <div className="sn-card sn-form"><h2>Contenu de la fiche (blocs)</h2><p className="sn-mut" style={{ margin: 0 }}>Texte bilingue, images, galerie, vidéo, documents PDF. Affiché sous la fiche produit.</p>
          <BlockEditor initial={p?.blocks ?? []} library={library} allowed={['text', 'image', 'gallery', 'video', 'file']} />
        </div>
      </fieldset>
      {!readOnly && <div className="sn-sticky"><a className="sn-btn line" href="/admin-fls/produits">Annuler</a><button className="sn-btn go" type="submit">Enregistrer le produit</button></div>}
    </ActionForm>
  );
}
