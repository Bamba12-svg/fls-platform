'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PRODUCT_MENU } from '@/lib/content';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { Photo } from './Photo';
import { useCart, useLocale, useMoney, useT, useUI } from './providers';

export interface NavUniverse { slug: string; name: { fr: string; en: string }; icon: string; subs: { slug: string; name: { fr: string; en: string } }[] }

const swapLocale = (path: string, to: string) => path.replace(/^\/(fr|en)(?=\/|$)/, `/${to}`) || `/${to}`;

type L10 = { fr: string; en: string };
const tx = (fr: string, en: string): L10 => ({ fr, en });
/** Contenu du méga-menu Services (même présentation que Produits). */
const SERVICES: { href: string; icon: string; title: L10; desc: L10; links: { href: string; label: L10 }[] }[] = [
  { href: '/catalogue', icon: 'bolt', title: tx('Commande pro en ligne', 'Online pro ordering'), desc: tx('Votre grille tarifaire et le stock réel, 24 h/24.', 'Your price grid and live stock, 24/7.'),
    links: [{ href: '/catalogue', label: tx('Commande rapide par code', 'Quick order by code') }, { href: '/compte', label: tx('Suivi des livraisons et factures', 'Deliveries and invoices') }, { href: '/contact', label: tx('Ouvrir un compte pro', 'Open a pro account') }] },
  { href: '/conseil', icon: 'chef', title: tx('Conseil & assistance métier', 'Business advice & support'), desc: tx('Un conseiller dédié pour les CHR et supérettes.', 'A dedicated adviser for food service and shops.'),
    links: [{ href: '/conseil', label: tx('Création et refonte de carte', 'Menu design') }, { href: '/conseil', label: tx('Calculateur de coût matière', 'Food cost calculator') }, { href: '/conseil', label: tx('Gestion des stocks et merchandising', 'Stock and merchandising') }] },
  { href: '/cles-en-main', icon: 'store', title: tx('Supérettes clés en main', 'Turnkey mini-markets'), desc: tx('De l’étude de zone au premier client en caisse.', 'From site study to the first customer.'),
    links: [{ href: '/cles-en-main', label: tx('Formats et aménagement', 'Formats and fit-out') }, { href: '/cles-en-main', label: tx('Approvisionnement initial', 'Opening stock') }, { href: '/cles-en-main', label: tx('Nos réalisations', 'Our projects') }] },
  { href: '/societe/grands-comptes', icon: 'building', title: tx('Grands comptes', 'Key accounts'), desc: tx('Cantines, hôtels, centrales d’achat.', 'Canteens, hotels, buying groups.'),
    links: [{ href: '/societe/grands-comptes', label: tx('Contrats cadre à prix fermes', 'Fixed-price framework contracts') }, { href: '/societe/grands-comptes', label: tx('Dossiers d’appel d’offres', 'Tender files') }, { href: '/societe/qualite', label: tx('Qualité, hygiène et traçabilité', 'Quality and traceability') }] },
];

export function Header({ universes }: { universes: NavUniverse[] }) {
  const l = useLocale(); const t = useT(); const path = usePathname() || `/${l}`;
  const { cur, setCur } = useMoney(); const ui = useUI(); const { lines } = useCart(); const { data: session } = useSession();
  const [menu, setMenu] = useState<null | 'prod' | 'svc'>(null); const [stuck, setStuck] = useState(false);
  const megaTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => { const f = () => setStuck(scrollY > 8); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  useEffect(() => { setMenu(null); }, [path]);
  useEffect(() => { if (!menu) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [menu]);
  const L = (p: string) => `/${l}${p}`;
  const active = (p: string) => (path.startsWith(L(p)) ? 'page' : undefined);
  /** Méga-menus (Produits, Services) : ouverture au survol avec un léger délai, maintien tant que le curseur est dans le panneau. */
  const hoverMenu = (m: null | 'prod' | 'svc') => { if (matchMedia('(hover: none)').matches) return; clearTimeout(megaTimer.current); megaTimer.current = setTimeout(() => setMenu(m), m ? 120 : 200); };
  const toggle = (m: 'prod' | 'svc') => { clearTimeout(megaTimer.current); setMenu((x) => (x === m ? null : m)); };

  return (
    <header className={`sn-top ${stuck ? 'sn-is-stuck' : ''}`} onMouseLeave={() => hoverMenu(null)}>
      <div className="sn-util"><div className="sn-wrap">
        <span className="sn-util-i"><Icon name="phone" /><span>+221 33 889 06 66</span></span>
        <span className="sn-util-i sn-util-hide"><Icon name="pin" /><span>{t('Siège : Sénégal, Dakar, Médina, Rue 39 x 22', 'Head office: Senegal, Dakar, Médina, Rue 39 x 22')}</span></span>
        <span className="sn-util-i sn-util-hide sn-util-hours"><Icon name="clock" /><span>{t('Dépôt ouvert du lundi au samedi, de 7 h 30 à 19 h', 'Depot open Monday to Saturday, 7:30am to 7pm')}</span></span>
        <span className="sn-util-sp" />
        <span className="sn-util-i sn-util-hide sn-util-grp">{t('Groupe COSEMAD', 'COSEMAD Group')}</span>
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
            <li onMouseEnter={() => hoverMenu(null)}><Link href={L('')} aria-current={path === L('') ? 'page' : undefined}>{t('Accueil', 'Home')}</Link></li>
            <li onMouseEnter={() => hoverMenu(null)}><Link href={L('/societe')} aria-current={active('/societe')}>{t('À propos', 'About us')}</Link></li>
            <li><button type="button" aria-expanded={menu === 'prod'} aria-controls="sn-mega" onClick={() => toggle('prod')} onMouseEnter={() => hoverMenu('prod')}>{t('Produits', 'Products')}<Icon name="chev" /></button></li>
            <li><button type="button" aria-expanded={menu === 'svc'} aria-controls="sn-mega-svc" onClick={() => toggle('svc')} onMouseEnter={() => hoverMenu('svc')}>{t('Services', 'Services')}<Icon name="chev" /></button></li>
            <li onMouseEnter={() => hoverMenu(null)}><Link href={L('/catalogue')} aria-current={active('/catalogue')}>{t('Commande pro', 'Pro ordering')}</Link></li>
            <li onMouseEnter={() => hoverMenu(null)}><Link href={L('/actualites')} aria-current={active('/actualites')}>{t('Actualités', 'News')}</Link></li>
            <li onMouseEnter={() => hoverMenu(null)}><Link href={L('/contact')} aria-current={active('/contact')}>Contact</Link></li>
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
      <div className={`sn-mega ${menu === 'prod' ? 'sn-open' : ''}`} id="sn-mega" role="region" aria-label={t('Univers produits', 'Product ranges')} onMouseEnter={() => hoverMenu('prod')}>
        <div className="sn-wrap sn-mega-in">
          {PRODUCT_MENU.map((g) => (
            <div className="sn-mega-col" key={g.key}>
              <h3><span className="sn-mega-dot sn-mega-thumb"><Image src={g.thumb} alt="" width={40} height={40} /></span><Link href={L(`/${g.href}`)}>{g.name[l]}</Link></h3>
              <ul>{g.items.map((it) => <li key={it.href}><Link href={L(`/${it.href}`)}>{it.name[l]}</Link></li>)}</ul>
            </div>
          ))}
          <Link className="sn-mega-feat" href={L('/univers/boissons')} style={{ gridColumn: 4, gridRow: '1 / span 2' }}>
            <Photo src="/img/f-maria-jus.webp" icon="can" sizes="300px" />
            <span className="sn-flag sn-flag-new" style={{ alignSelf: 'flex-start' }}>{t('Arrivage', 'New arrival')}</span>
            <h4>{t('Jus Maria en canette', 'Maria canned juices')}</h4><p>{t('Mangue, goyave, cocktail… avec de vrais morceaux de fruits.', 'Mango, guava, cocktail… with real fruit pieces.')}</p>
          </Link>
        </div>
      </div>
          <div className={`sn-mega ${menu === 'svc' ? 'sn-open' : ''}`} id="sn-mega-svc" role="region" aria-label={t('Nos services', 'Our services')} onMouseEnter={() => hoverMenu('svc')}>
        <div className="sn-wrap sn-mega-in">
          {SERVICES.map((g) => (
            <div className="sn-mega-col" key={g.href}>
              <h3><span className="sn-mega-dot"><Icon name={g.icon} /></span><Link href={L(g.href)}>{g.title[l]}</Link></h3>
              <p className="sn-mega-desc">{g.desc[l]}</p>
              <ul>{g.links.map((x) => <li key={x.href + x.label.fr}><Link href={L(x.href)}>{x.label[l]}</Link></li>)}</ul>
            </div>
          ))}
          <div className="sn-mega-feat sn-mega-feat-svc" style={{ gridColumn: 4, gridRow: '1 / span 2' }}>
            <Photo src="/img/u-conseil.webp" icon="chef" sizes="300px" />
            <span className="sn-flag sn-flag-new" style={{ alignSelf: 'flex-start' }}>{t('Inclus pour les pros', 'Included for trade')}</span>
            <h4>{t('Un conseiller FLS dans votre cuisine', 'An FLS adviser in your kitchen')}</h4>
            <p>{t('Carte, coût matière et stocks : un diagnostic sur place, puis un plan d’action chiffré.', 'Menu, food cost and stock: an on-site review, then a costed action plan.')}</p>
            <button type="button" className="sn-btn sn-btn-go sn-btn-sm" style={{ alignSelf: 'flex-start', marginTop: 6 }} onClick={() => { setMenu(null); ui.openDevis('conseil'); }}>{t('Demander une visite', 'Request a visit')}</button>
          </div>
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
        <Link className="sn-mnav-l" href={L('')}>{t('Accueil', 'Home')}</Link>
        <details><summary>{t('À propos', 'About us')}<Icon name="chev" /></summary><ul>
          <li><Link href={L('/societe')}>{t('Mot de la Direction', 'A word from management')}</Link></li>
          <li><Link href={L('/societe/implantation')}>{t('Implantation & Groupe', 'Network & Group')}</Link></li>
          <li><Link href={L('/societe/qualite')}>{t('Qualité & hygiène', 'Quality & hygiene')}</Link></li>
          <li><Link href={L('/societe/histoire')}>{t('Notre histoire', 'Our history')}</Link></li></ul></details>
        <details open><summary>{t('Produits', 'Products')}<Icon name="chev" /></summary><ul>
          {PRODUCT_MENU.map((g) => <li key={g.key}><Link href={L(`/${g.href}`)}>{g.name[l]}</Link></li>)}
          <li><Link href={L('/cles-en-main')}>{t('Supérettes clés en main', 'Turnkey mini-markets')}</Link></li></ul></details>
        <details><summary>Services<Icon name="chev" /></summary><ul>
          <li><Link href={L('/conseil')}>{t('Conseil & assistance métier', 'Business advice & support')}</Link></li>
          <li><Link href={L('/societe/grands-comptes')}>{t('Grands comptes', 'Key accounts')}</Link></li></ul></details>
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
      <Link href={L('/univers/conserves')} aria-current={cur('/univers')}><Icon name="grid" /><span>{t('Produits', 'Products')}</span></Link>
      <Link href={L('/catalogue#recherche')} className="sn-tb-main"><i><Icon name="bolt" /></i><span>{t('Commande', 'Order')}</span></Link>
      <Link href={L('/compte')} aria-current={cur('/compte')}><Icon name="user" /><span>{t('Compte', 'Account')}</span></Link>
      <button type="button" onClick={() => ui.open('cart')}><Icon name="cart" /><span>{t('Panier', 'Cart')}</span>{lines.length > 0 && <span className="sn-count">{lines.length}</span>}</button>
    </nav>
  );
}
