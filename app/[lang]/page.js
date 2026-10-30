import { notFound } from 'next/navigation';
import Portfolio from '../portfolio.js';
import { languages, readSite } from '../../lib/site-data.js';
import { headers } from 'next/headers';
import { getLocalizedMetadata, getSiteOrigin } from '../../lib/seo.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!languages.includes(lang)) return {};
  const [site, requestHeaders] = await Promise.all([readSite(), headers()]);
  return getLocalizedMetadata(site, lang, `/${lang}`, requestHeaders);
}

export default async function LanguageHomePage({ params }) {
  const { lang } = await params;
  if (!languages.includes(lang)) notFound();
  const [site, requestHeaders] = await Promise.all([readSite(), headers()]);
  return <Portfolio site={site} language={lang} siteOrigin={getSiteOrigin(requestHeaders)} />;
}
