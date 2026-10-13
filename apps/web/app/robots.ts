import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/i18n';

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin-fls', '/fr/compte', '/en/compte', '/fr/connexion', '/en/connexion'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
