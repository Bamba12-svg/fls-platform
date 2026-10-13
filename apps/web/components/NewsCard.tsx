import Link from 'next/link';
import type { PostDTO } from '@fls/db';
import { NEWS_CATS } from '@/lib/content';
import { fdate, pick, type Locale } from '@/lib/i18n';
import { Photo } from './Photo';

export function NewsCard({ n, locale }: { n: PostDTO; locale: Locale }) {
  return (
    <Link className="sn-new" href={`/${locale}/actualites/${n.slug}`}>
      <Photo src={n.cover} icon="doc" sizes="(max-width:720px) 100vw, 400px" />
      <div className="sn-new-m"><span className="sn-cat">{pick(locale, NEWS_CATS[n.category])}</span>{n.publishedAt && <time dateTime={n.publishedAt.slice(0, 10)}>{fdate(locale, n.publishedAt)}</time>}</div>
      <h3>{pick(locale, n.title)}</h3><p>{pick(locale, n.excerpt)}</p>
    </Link>
  );
}
