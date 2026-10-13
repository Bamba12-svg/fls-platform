import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRepo } from '@fls/db';
import { PostForm } from '@/components/PostForm';
import { requireStaff } from '@/lib/auth';
import { imageLibrary } from '@/lib/library';

export const metadata = { title: 'Article' };

export default async function EditPost({ params }: { params: { id: string } }) {
  await requireStaff('news', true); const repo = await getRepo();
  const [posts, universes, library, products] = await Promise.all([repo.posts({ includeDrafts: true }), repo.universes(), imageLibrary(), repo.products()]);
  const post = params.id === 'nouveau' ? null : posts.find((p) => p.id === params.id) ?? null;
  if (params.id !== 'nouveau' && !post) notFound();
  return (
    <>
      <div className="sn-head"><div><p><Link href="/actualites">← Actualités</Link></p><h1>{post ? post.title.fr : 'Nouvel article'}</h1></div>{post?.status === 'PUBLISHED' && <a className="sn-btn line" href={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/fr/actualites/${post.slug}`} target="_blank" rel="noopener">Voir sur le site ↗</a>}</div>
      <PostForm post={post} universes={universes} library={library} products={products.map((p) => ({ code: p.code, name: p.name.fr }))} />
    </>
  );
}
