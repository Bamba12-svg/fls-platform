import type { Metadata } from 'next';
import { CompanyPage } from '@/components/company/CompanyPage';
import { alternates, tr, type Locale } from '@/lib/i18n';

export const generateMetadata = ({ params }: { params: { locale: Locale } }): Metadata => ({ title: tr(params.locale)('La société', 'Company'), alternates: alternates(params.locale, '/societe') });
export default function Page({ params }: { params: { locale: Locale } }) { return <CompanyPage locale={params.locale} section="" />; }
