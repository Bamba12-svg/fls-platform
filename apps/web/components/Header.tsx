'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { Photo } from './Photo';
import { useCart, useLocale, useMoney, useT, useUI } from './providers';

export interface NavUniverse { slug: string; name: { fr: string; en: string }; icon: string; subs: { slug: string; name: { fr: string; en: string } }[] }

const swapLocale = (path: string, to: string) => path.replace(/^\/(fr|en)(?=\/|$)/, `/${to}`) || `/${to}`;

export function Header({ universes }: { universes: NavUniverse[] }) {
  const l = useLocale(); const t = useT(); const path = usePathname() || `/${l}`;
  const { cur, setCur } = useMoney(); const ui = useUI(); const { lines } = useCart(); const { data: session } = useSession();
  const [mega, setMega] = useState(false); const [dd, setDd] = useState(false); const [stuck, setStuck] = useState(false);
  const megaTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => { const f = () => setStuck(scrollY > 8); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  useEffect(() => { setMega(false); setDd(false); }, [path]);
  const L = (p: string) => `/${l}${p}`;
  const active = (p: string) => (path.startsWith(L(p)) ? 'page' : undefined);
  const hoverMega = (open: boolean) => { if (matchMedia('(hover: none)').matches) return; clearTimeout(megaTimer.current); megaTimer.current = setTimeout(() => setMega(open), open ? 120 : 200); };

  return (
    <header className={`sn-top ${stuck ? 'sn-is-stuck' : ''}`} onMouseLeave={() => hoverMega(false)}>
      <div className="sn-util"><div className="sn-wrap">
        <span className="sn-util-i"><Icon name="phone" /><span>+221 33 889 06 66</span></span>
        <span className="sn-util-i sn-util-hide"><Icon name="pin" /><span>{t('Siège : Médina, Rue 39 x 22, Dakar', 'Head office: Médina, Rue 39 x 22, Dakar')}</span></span>
        <span className="sn-util-i sn-util-hide"><Icon name="clock" /><span>{t('Dépôt ouvert lun.–sam. 7 h 30–19 h', 'Depot open Mon–Sat 7:30am–7pm')}</span></span>
        <span className="sn-util-sp" />
        <span className="sn-util-i sn-util-hide">{t('Groupe COSEMAD', 'COSEMAD Group')}</span>
        <span className="sn-seg" role="group" aria-label={t('Devise', 'Currency')}>
          <button type="button" aria-pressed={cur === 'XOF'} onClick={() => setCur('XOF')}>FCFA</button>
          <button type="button" aria-pressed={cur === 'EUR'} onClick={() => setCur('EUR')}>EUR</button>
        </span>
        <span className="sn-seg" role="group" aria-label={t('Langue', 'Language')}>
          <Link href={swapLocale(path, 'fr')} aria-current={l === 'fr' ? 'true' : undefined} hrefLang="fr" lang="fr" className="sn-seg-a" data-on={l === 'fr'}>FR</Link>
          <Link href={swapLocale(path, 'en')} aria-current={l === 'en' ? 'true' : undefined} hrefLang="en" lang="en" className="sn-seg-a" data-on={l === 'en'}>EN</Link>
        </span>
      </div></div>
      <div className="sn-wrap sn-nav">
        <button className="sn-ico sn-burger" type="button" onClick={() => ui.open('mnav')} aria-label={t('Ouvrir le menu', 'Open menu')}><Icon name="menu" /></button>
        <Logo locale={l} />
        <nav aria-label={t('Navigation principale', 'Main navigation')}>
          <ul className="sn-menu">
            <li><button type="button" aria-expanded={mega} aria-controls="sn-mega" onClick={() => setMega((m) => !m)} onMouseEnter={() => hoverMega(true)}>{t('Produits', 'Products')}<Icon name="chev" /></button></li>
            <li style={{ position: 'relative' }}>
              <button type="button" aria-expanded={dd} aria-controls="sn-dd-svc" onClick={() => setDd((d) => !d)}>{t('Services', 'Services')}<Icon name="chev" /></button>
              <div id="sn-dd-svc" className="sn-box sn-dd" hidden={!dd}>
                <Link href={L('/conseil')}>{t('Conseil & assistance métier', 'Business advice & support')}</Link>
                <Link href={L('/cles-en-main')}>{t('Supérettes clés en main', 'Turnkey mini-markets')}</Link>
                <Link href={L('/societe/grands-comptes')}>{t('Grands comptes', 'Key accounts')}</Link>
              </div>
            </li>
            <li><Link href={L('/catalogue')} aria-current={active('/catalogue')}>{t('Commande pro', 'Pro ordering')}</Link></li>
            <li><Link href={L('/societe')} aria-current={active('/societe')}>{t('La société', 'Company')}</Link></li>
            <li><Link href={L('/actualites')} aria-current={active('/actualites')}>{t('Actualités', 'News')}</Link></li>
            <li><Link href={L('/contact')} aria-current={active('/contact')}>Contact</Link></li>
          </ul>
        </nav>
        <span className="sn-nav-sp" />
        <div className="sn-tools">
          <Link className="sn-ico sn-hide-m" href={L('/catalogue#recherche')} aria-label={t('Rechercher un produit', 'Search a product')}><Icon name="search" /></Link>
          <button className="sn-btn sn-btn-go sn-btn-sm sn-hide-m" type="button" onClick={() => ui.openDevis()}>{t('Demander un devis', 'Request a quote')}</button>
          {session ? (
            <Link className="sn-acct" href={L('/compte')}><span className="sn-av">{session.user.company.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span><span className="sn-acct-t">{t('Mon compte', 'My account')}</span></Link>
          ) : (
            <Link className="sn-acct" href={L('/connexion')}><span className="sn-av" style={{ background: 'var(--sn-bg2)', color: 'var(--sn-navy)' }}><Icon name="user" size={16} /></span><span className="sn-acct-t">{t('Espace client', 'Client area')}</span></Link>
          )}
          <button className="sn-ico" type="button" onClick={() => ui.open('cart')} aria-label={t('Panier', 'Cart')}><Icon name="cart" />{lines.length > 0 && <span className="sn-count">{lines.length}</span>}</button>
        </div>
      </div>
      <div className={`sn-mega ${mega ? 'sn-open' : ''}`} id="sn-mega" role="region" aria-label={t('Univers produits', 'Product ranges')} onMouseEnter={() => hoverMega(true)}>
        <div className="sn-wrap sn-mega-in">
          {universes.map((u) => (
            <div className="sn-mega-col" key={u.slug}>
              <h3><span className="sn-mega-dot"><Icon name={u.icon} /></span><Link href={L(`/univers/${u.slug}`)}>{l === 'en' ? u.name.en : u.name.fr}</Link></h3>
              <ul>{u.subs.map((s) => <li key={s.slug}><Link href={L(`/univers/${u.slug}?famille=${s.slug}`)}>{l === 'en' ? s.name.en : s.name.fr}</Link></li>)}</ul>
            </div>
          ))}
          <div className="sn-mega-col"><h3><span className="sn-mega-dot"><Icon name="store" /></span><Link href={L('/cles-en-main')}>{t('Supérettes clés en main', 'Turnkey mini-markets')}</Link></h3>
            <ul><li><Link href={L('/cles-en-main')}>{t('Formats et aménagement', 'Formats and fit-out')}</Link></li><li><Link href={L('/cles-en-main')}>{t('Approvisionnement initial', 'Opening stock')}</Link></li></ul></div>
          <Link className="sn-mega-feat" href={L('/univers/boissons')} style={{ gridColumn: 4, gridRow: '1 / span 2' }}>
            <Photo src="/img/f-serene.webp" icon="can" sizes="300px" />
            <span className="sn-flag sn-flag-new" style={{ alignSelf: 'flex-start' }}>{t('Arrivage', 'New arrival')}</span>
            <h4>{t('Boissons Serene en canette', 'Serene canned drinks')}</h4><p>{t('Ananas, tropical : disponibles par carton de 24.', 'Pineapple, tropical: available in cases of 24.')}</p>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileNav({ universes }: { universes: NavUniverse[] }) {
  const l = useLocale(); const t = useT(); const ui = useUI(); const path = usePathname() || '';
  const { cur, setCur } = useMoney(); const L = (p: string) => `/${l}${p}`;
  useEffect(() => { if (ui.layer === 'mnav') ui.close(); /* fermeture à la navigation */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  const open = ui.layer === 'mnav';
  return (
    <div className={`sn-mnav ${open ? 'sn-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} {...(open ? {} : ({ inert: '' } as unknown as { inert: boolean }))}>
      <div className="sn-mnav-h"><Logo locale={l} sub={false} /><button className="sn-close" type="button" onClick={ui.close} aria-label={t('Fermer le menu', 'Close menu')}><Icon name="close" /></button></div>
      <div className="sn-mnav-b">
        <details open><summary>{t('Produits', 'Products')}<Icon name="chev" /></summary><ul>
          {universes.map((u) => <li key={u.slug}><Link href={L(`/univers/${u.slug}`)}>{l === 'en' ? u.name.en : u.name.fr}</Link></li>)}
          <li><Link href={L('/cles-en-main')}>{t('Supérettes clés en main', 'Turnkey mini-markets')}</Link></li></ul></details>
        <details><summary>Services<Icon name="chev" /></summary><ul>
          <li><Link href={L('/conseil')}>{t('Conseil & assistance métier', 'Business advice & support')}</Link></li>
          <li><Link href={L('/societe/grands-comptes')}>{t('Grands comptes', 'Key accounts')}</Link></li></ul></details>
        <details><summary>{t('La société', 'Company')}<Icon name="chev" /></summary><ul>
          <li><Link href={L('/societe')}>{t('Mot de la Direction', 'A word from management')}</Link></li>
          <li><Link href={L('/societe/implantation')}>{t('Implantation & Groupe', 'Network & Group')}</Link></li>
          <li><Link href={L('/societe/qualite')}>{t('Qualité & hygiène', 'Quality & hygiene')}</Link></li>
          <li><Link href={L('/societe/histoire')}>{t('Notre histoire', 'Our history')}</Link></li></ul></details>
        <Link className="sn-mnav-l" href={L('/catalogue')}>{t('Commande pro', 'Pro ordering')}</Link>
        <Link className="sn-mnav-l" href={L('/actualites')}>{t('Actualités', 'News')}</Link>
        <Link className="sn-mnav-l" href={L('/contact')}>Contact</Link>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <span className="sn-seg sn-seg-lt"><Link href={swapLocale(path, 'fr')} className="sn-seg-a" data-on={l === 'fr'}>FR</Link><Link href={swapLocale(path, 'en')} className="sn-seg-a" data-on={l === 'en'}>EN</Link></span>
          <span className="sn-seg sn-seg-lt"><button type="button" aria-pressed={cur === 'XOF'} onClick={() => setCur('XOF')}>FCFA</button><button type="button" aria-pressed={cur === 'EUR'} onClick={() => setCur('EUR')}>EUR</button></span>
        </div>
        <button className="sn-btn sn-btn-go sn-btn-block" type="button" style={{ marginTop: 20 }} onClick={() => ui.openDevis()}>{t('Demander un devis', 'Request a quote')}</button>
      </div>
    </div>
  );
}

export function TabBar() {
  const l = useLocale(); const t = useT(); const ui = useUI(); const { lines } = useCart(); const path = usePathname() || '';
  const L = (p: string) => `/${l}${p}`; const cur = (p: string, exact = false) => ((exact ? path === L(p) || path === L('') : path.startsWith(L(p))) ? 'page' : undefined);
  return (
    <nav className="sn-tabbar" aria-label={t('Navigation mobile', 'Mobile navigation')}>
      <Link href={L('')} aria-current={cur('', true)}><Icon name="home" /><span>{t('Accueil', 'Home')}</span></Link>
      <Link href={L('/univers/epicerie')} aria-current={cur('/univers')}><Icon name="grid" /><span>{t('Produits', 'Products')}</span></Link>
      <Link href={L('/catalogue#recherche')} className="sn-tb-main"><i><Icon name="bolt" /></i><span>{t('Commande', 'Order')}</span></Link>
      <Link href={L('/compte')} aria-current={cur('/compte')}><Icon name="user" /><span>{t('Compte', 'Account')}</span></Link>
      <button type="button" onClick={() => ui.open('cart')}><Icon name="cart" /><span>{t('Panier', 'Cart')}</span>{lines.length > 0 && <span className="sn-count">{lines.length}</span>}</button>
    </nav>
  );
}
