import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRepo } from '@fls/db';
import { ProductForm } from '@/components/ProductForm';
import { canEdit, requireStaff } from '@/lib/auth';
import { imageLibrary } from '@/lib/library';

export const metadata = { title: 'Fiche produit' };

export default async function EditProduct({ params }: { params: { id: string } }) {
  const s = await requireStaff('catalogue'); const repo = await getRepo();
  const isNew = params.id === 'nouveau';
  if (isNew && !canEdit(s.role, 'catalogue')) notFound();
  const [all, universes, library] = await Promise.all([repo.products({ includeInactive: true }), repo.universes(), imageLibrary()]);
  const p = isNew ? null : all.find((x) => x.id === params.id) ?? null;
  if (!isNew && !p) notFound();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return (
    <>
      <div className="sn-head"><div><p><Link href="/produits">← Catalogue</Link></p><h1>{p ? `${p.code} · ${p.name.fr}` : 'Nouveau produit'}</h1></div>{p && <a className="sn-btn line" href={`${site}/fr/categories/${p.universe}/${p.slug}`} target="_blank" rel="noopener">Voir sur le site ↗</a>}</div>
      <ProductForm p={p} universes={universes} library={library} readOnly={!canEdit(s.role, 'catalogue')} />
    </>
  );
}
