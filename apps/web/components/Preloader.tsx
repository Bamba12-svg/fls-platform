import { LogoMark } from './Logo';

/** Écran de chargement : bandeau de logos FLS qui défile, retiré dès que la page est chargée (6 s maximum, même sans JavaScript). */
export function Preloader() {
  const logos = Array.from({ length: 8 }, (_, i) => <LogoMark key={i} height={58} />);
  return (
    <>
      <div id="sn-loader" aria-hidden="true">
        <div className="sn-ld-track"><div className="sn-ld-row">{logos}</div></div>
        <div className="sn-ld-bar"><i /></div>
        <span className="sn-ld-tx">Fourniture Libre Service</span>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t0=Date.now(),el=document.getElementById('sn-loader');function done(){setTimeout(function(){el&&el.classList.add('sn-ld-done');setTimeout(function(){el&&el.remove()},600)},Math.max(0,1200-(Date.now()-t0)))}if(document.readyState==='complete')done();else window.addEventListener('load',done)})();`,
        }}
      />
    </>
  );
}
