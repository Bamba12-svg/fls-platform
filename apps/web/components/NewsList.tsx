'use client';

import { useState, type ReactNode } from 'react';
import { NEWS_CATS } from '@/lib/content';
import { Icon } from './Icon';
import { useLocale, useT } from './providers';

/** Liste filtrable des actualités, chargement progressif par trois. Les cartes sont rendues côté serveur. */
export function NewsList({ items }: { items: { cat: string; node: ReactNode }[] }) {
  const t = useT(); const l = useLocale(); const [cat, setCat] = useState('all'); const [n, setN] = useState(6); const [loading, setLoading] = useState(false);
  const list = items.filter((x) => cat === 'all' || x.cat === cat); const shown = list.slice(0, n);
  return (
    <>
      <div className="sn-fbar" style={{ marginTop: 0 }}><div className="sn-chips" role="group" aria-label={t('Filtrer par rubrique', 'Filter by section')}>
        <button type="button" className="sn-chip" aria-pressed={cat === 'all'} onClick={() => { setCat('all'); setN(6); }}>{t('Tout', 'All')}</button>
        {Object.entries(NEWS_CATS).map(([k, v]) => <button key={k} type="button" className="sn-chip" aria-pressed={cat === k} onClick={() => { setCat(k); setN(6); }}>{v[l]}</button>)}
      </div></div>
      <div className="sn-nlist">{shown.length ? shown.map((x, i) => <div key={i} style={{ display: 'contents' }}>{x.node}</div>) : <div className="sn-empty" style={{ gridColumn: '1/-1' }}><Icon name="doc" /><b>{t('Aucune actualité dans cette rubrique', 'No news in this section')}</b></div>}</div>
      {list.length > shown.length && <div className="sn-more"><button type="button" className="sn-btn sn-btn-line" disabled={loading} onClick={() => { setLoading(true); setTimeout(() => { setN((x) => x + 3); setLoading(false); }, 400); }}>{loading ? <><span className="sn-spin" />{t('Chargement…', 'Loading…')}</> : <>{t('Voir plus', 'Show more')} <span className="sn-num" style={{ color: 'var(--sn-muted)' }}>({list.length - shown.length})</span></>}</button></div>}
    </>
  );
}
