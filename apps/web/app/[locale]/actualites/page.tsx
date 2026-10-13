import type { Metadata } from 'next';
import { getRepo } from '@fls/db';
import { NewsCard } from '@/components/NewsCard';
import { NewsList } from '@/components/NewsList';
import { PageHero } from '@/components/PageHero';
import { img } from '@/lib/content';
import { alternates, tr, type Locale } from '@/lib/i18n';

export const revalidate = 300;
export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => {
  const t = tr(params.locale);
  return { title: t('Actualités', 'News'), description: t('Nouvelles gammes, arrivages, salons professionnels et vie de FLS.', 'New ranges, arrivals, trade fairs and life at FLS.'), alternates: alternates(params.locale, '/actualites') };
};

export default async function News({ params }: { params: { locale: Locale } }) {
  const l = params.locale; const t = tr(l);
  const posts = await (await getRepo()).posts();
  return (
    <>
      <PageHero locale={l} img={img('n-fidak')} icon="doc" title={t('Actualités, arrivages et événements', 'News, arrivals and events')} lede={t('Nouvelles gammes, salons professionnels et vie de l’entreprise.', 'New ranges, trade fairs and company news.')} crumbs={[[null, t('Actualités', 'News')]]} />
      <section className="sn-sec" style={{ paddingTop: 36 }}><div className="sn-wrap">
        <NewsList items={posts.map((n) => ({ cat: n.category, node: <NewsCard n={n} locale={l} /> }))} />
      </div></section>
    </>
  );
}
