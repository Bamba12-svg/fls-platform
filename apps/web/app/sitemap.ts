import type { MetadataRoute } from 'next';
import { getRepo } from '@fls/db';
import { SITE_URL } from '@/lib/i18n';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getRepo();
  const [universes, products, posts] = await Promise.all([repo.universes(), repo.products(), repo.posts()]);
  const paths = ['', '/catalogue', '/cles-en-main', '/conseil', '/societe', '/societe/implantation', '/societe/qualite', '/societe/grands-comptes', '/societe/histoire', '/actualites', '/contact',
    ...universes.map((u) => `/univers/${u.slug}`), ...products.map((p) => `/categories/${p.universe}/${p.slug}`), ...posts.map((n) => `/actualites/${n.slug}`)];
  return paths.map((p) => ({
    url: `${SITE_URL}/fr${p}`, changeFrequency: p.startsWith('/categories') || p === '/catalogue' ? 'daily' : 'weekly', priority: p === '' ? 1 : p.split('/').length > 2 ? 0.6 : 0.8,
    alternates: { languages: { fr: `${SITE_URL}/fr${p}`, en: `${SITE_URL}/en${p}` } },
  }));
}
