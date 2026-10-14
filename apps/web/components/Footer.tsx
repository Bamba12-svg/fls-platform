import Link from 'next/link';
import type { UniverseDTO } from '@fls/db';
import { pick, tr, type Locale } from '@/lib/i18n';
import { Logo } from './Logo';
import { NewsletterForm } from './forms/NewsletterForm';

export function Footer({ locale, universes }: { locale: Locale; universes: UniverseDTO[] }) {
  const t = tr(locale); const L = (p: string) => `/${locale}${p}`;
  return (
    <footer className="sn-foot">
      <div className="sn-wrap">
        <div className="sn-foot-g">
          <div>
            <Logo locale={locale} light />
            <p className="sn-foot-about"><b style={{ display: 'block', color: '#fff', marginBottom: 6 }}>{t('Des produits adaptés à vos besoins.', 'Products suited to your needs.')}</b>
              {t('Fourniture Libre Service distribue l’épicerie, les boissons, le frais et le surgelé auprès des grossistes, demi-grossistes, supérettes et restaurants du Sénégal.', 'Fourniture Libre Service distributes groceries, beverages, fresh and frozen food to wholesalers, mini-markets and restaurants across Senegal.')}</p>
          </div>
          <div><h4>{t('À propos', 'About us')}</h4><ul>
            <li><Link href={L('/societe')}>{t('Mot de la Direction', 'A word from management')}</Link></li>
            <li><Link href={L('/societe/histoire')}>{t('Notre histoire', 'Our history')}</Link></li>
            <li><Link href={L('/societe/qualite')}>{t('Qualité & hygiène', 'Quality & hygiene')}</Link></li>
            <li><Link href={L('/actualites')}>{t('Actualités', 'News')}</Link></li>
            <li><Link href={L('/contact?type=candidature')}>{t('Recrutement', 'Careers')}</Link></li></ul></div>
          <div><h4>{t('Produits', 'Products')}</h4><ul>{universes.map((u) => <li key={u.slug}><Link href={L(`/univers/${u.slug}`)}>{pick(locale, u.name)}</Link></li>)}</ul></div>
          <div><h4>Services</h4><ul>
            <li><Link href={L('/catalogue')}>{t('Commande pro en ligne', 'Online pro ordering')}</Link></li>
            <li><Link href={L('/conseil')}>{t('Conseil métier', 'Business advice')}</Link></li>
            <li><Link href={L('/cles-en-main')}>{t('Supérettes clés en main', 'Turnkey mini-markets')}</Link></li>
            <li><Link href={L('/societe/grands-comptes')}>{t('Grands comptes', 'Key accounts')}</Link></li></ul></div>
          <div><h4>{t('Lettre commerciale', 'Trade newsletter')}</h4><p style={{ fontSize: '.88rem' }}>{t('Arrivages, offres du mois et nouvelles gammes, une fois par semaine.', 'New arrivals, monthly deals and new ranges, once a week.')}</p><NewsletterForm /></div>
        </div>
        <div className="sn-foot-b">
          <div className="sn-group"><span>{t('Groupe COSEMAD', 'COSEMAD Group')}</span> Carrefour Médical · CMI · SONERCO · FLS · SAINIMMO</div>
          <div>© {new Date().getFullYear()} FLS · {t('Mentions légales', 'Legal notice')} · {t('Confidentialité', 'Privacy')}</div>
        </div>
      </div>
    </footer>
  );
}
