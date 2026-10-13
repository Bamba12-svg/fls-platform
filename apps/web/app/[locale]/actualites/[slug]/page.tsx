import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRepo } from '@fls/db';
import { Blocks } from '@/components/Blocks';
import { SheetButton } from '@/components/Buttons';
import { NewsCard } from '@/components/NewsCard';
import { Crumbs } from '@/components/PageHero';
import { Photo } from '@/components/Photo';
import { ServerPackThumb } from '@/components/ServerPackThumb';
import { NEWS_CATS } from '@/lib/content';
import { alternates, fdate, pick, SITE_URL, tr, type Locale } from '@/lib/i18n';

export const revalidate = 300;
type P = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const n = await (await getRepo()).post(params.slug); if (!n) return {};
  return { title: pick(params.locale, n.title), description: pick(params.locale, n.excerpt), alternates: alternates(params.locale, `/actualites/${n.slug}`), openGraph: { type: 'article', images: n.cover ? [n.cover] : [], publishedTime: n.publishedAt ?? undefined } };
}

export default async function Article({ params }: P) {
  const l = params.locale; const t = tr(l); const repo = await getRepo();
  const n = await repo.post(params.slug); if (!n || n.status !== 'PUBLISHED') notFound();
  const [all, prod] = await Promise.all([repo.posts(), n.featuredProductCode ? repo.product(n.featuredProductCode) : null]);
  const related = all.filter((x) => x.slug !== n.slug).slice(0, 3);
  const url = `${SITE_URL}/${l}/actualites/${n.slug}`;
  const ld = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: pick(l, n.title), description: pick(l, n.excerpt), image: n.cover ? [`${SITE_URL}${n.cover}`] : undefined, datePublished: n.publishedAt, publisher: { '@id': `${SITE_URL}/#org` }, mainEntityOfPage: url, inLanguage: l };
  return (
    <section className="sn-sec" style={{ paddingTop: 36 }}><div className="sn-wrap">
      <article className="sn-art">
        <Crumbs locale={l} dark items={[['/actualites', t('Actualités', 'News')], [null, pick(l, n.title)]]} />
        <div className="sn-new-m" style={{ marginBottom: 12 }}><span className="sn-cat">{pick(l, NEWS_CATS[n.category])}</span>{n.publishedAt && <time dateTime={n.publishedAt.slice(0, 10)}>{fdate(l, n.publishedAt)}</time>}</div>
        <h1 style={{ fontSize: 'clamp(1.9rem,4vw,2.9rem)', fontWeight: 800 }}>{pick(l, n.title)}</h1>
        <p className="sn-sub" style={{ fontSize: '1.2rem', color: 'var(--sn-ink)' }}>{pick(l, n.excerpt)}</p>
        <figure style={{ marginBlock: 28 }}><Photo src={n.cover} icon="doc" priority sizes="(max-width:900px) 100vw, 820px" alt={pick(l, n.title)} /></figure>
        <Blocks blocks={n.blocks} locale={l} />
        {prod && <div style={{ marginTop: 28 }}><p className="sn-h4">{t('Produit lié à cette actualité', 'Product linked to this story')}</p>
          <div className="sn-blk-prod"><ServerPackThumb p={prod} /><div style={{ minWidth: 0 }}><b>{pick(l, prod.name)}</b><small>{prod.code} · {pick(l, prod.pack)}</small></div><SheetButton code={prod.code} className="sn-btn sn-btn-nv sn-btn-sm">{t('Voir la fiche', 'View sheet')}</SheetButton></div></div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', alignItems: 'center' }}><span style={{ fontSize: '.88rem', color: 'var(--sn-muted)' }}>{t('Partager', 'Share')}</span>
          <a className="sn-btn sn-btn-line sn-btn-sm" href={`https://wa.me/?text=${encodeURIComponent(`${pick(l, n.title)} ${url}`)}`} target="_blank" rel="noopener">WhatsApp</a>
          <a className="sn-btn sn-btn-line sn-btn-sm" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener">LinkedIn</a></div>
      </article>
      <div style={{ marginTop: 64, borderTop: '1px solid var(--sn-line)', paddingTop: 40 }}><h2 className="sn-h2" style={{ fontSize: '1.6rem', marginBottom: 24 }}>{t('À lire aussi', 'Read next')}</h2><div className="sn-news">{related.map((r) => <NewsCard key={r.slug} n={r} locale={l} />)}</div></div>
      <p style={{ marginTop: 24 }}><Link className="sn-link" href={`/${l}/actualites`}>{t('Toutes les actualités', 'All news')}</Link></p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div></section>
  );
}
