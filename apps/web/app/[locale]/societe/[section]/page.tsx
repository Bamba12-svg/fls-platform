import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompanyPage, SECTIONS, sectionLabel, type Section } from '@/components/company/CompanyPage';
import { alternates, locales, type Locale } from '@/lib/i18n';

const ok = (s: string): s is Exclude<Section, ''> => s !== '' && (SECTIONS as readonly string[]).includes(s);
export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap((locale) => SECTIONS.filter(Boolean).map((section) => ({ locale, section })));
export const generateMetadata = ({ params }: { params: { locale: Locale; section: string } }): Metadata => (ok(params.section) ? { title: sectionLabel(params.locale, params.section), alternates: alternates(params.locale, `/societe/${params.section}`) } : {});
export default function Page({ params }: { params: { locale: Locale; section: string } }) {
  if (!ok(params.section)) notFound();
  return <CompanyPage locale={params.locale} section={params.section} />;
}
