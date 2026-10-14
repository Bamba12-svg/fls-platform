'use client';

import { useEffect, useState } from 'react';
import { LogoMark } from './Logo';

declare global { interface Window { __flsLoaded?: boolean } }

/**
 * Écran de chargement : bandeau de logos FLS qui défile.
 * Affiché une seule fois par chargement complet ; jamais lors d'une navigation interne (changement de langue, de page).
 * React garde la maîtrise du nœud : on le masque par classe, on ne le retire pas du DOM.
 * Sécurité CSS : il s'efface seul au bout de 6 s, même si le JavaScript échoue.
 */
export function Preloader() {
  const [done, setDone] = useState(() => typeof window !== 'undefined' && !!window.__flsLoaded);

  useEffect(() => {
    if (window.__flsLoaded) { setDone(true); return; }
    const t0 = performance.now();
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      timer = setTimeout(() => { window.__flsLoaded = true; setDone(true); }, Math.max(0, 1200 - (performance.now() - t0)));
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    return () => { clearTimeout(timer); window.removeEventListener('load', finish); };
  }, []);

  return (
    <div id="sn-loader" className={done ? 'sn-ld-done' : undefined} aria-hidden="true">
      <div className="sn-ld-track"><div className="sn-ld-row">{Array.from({ length: 8 }, (_, i) => <LogoMark key={i} height={58} />)}</div></div>
      <div className="sn-ld-bar"><i /></div>
      <span className="sn-ld-tx">Fourniture Libre Service</span>
    </div>
  );
}
