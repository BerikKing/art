import Portfolio from './portfolio.js';
import { defaultLanguage } from '../lib/locale.js';
import { readSite } from '../lib/site-data.js';
import { headers } from 'next/headers';
import { getLocalizedMetadata, getSiteOrigin } from '../lib/seo.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const [site, requestHeaders] = await Promise.all([readSite(), headers()]);
  return getLocalizedMetadata(site, defaultLanguage(site), '/', requestHeaders);
}

export default async function HomePage({ searchParams }) {
  const query = searchParams ? await searchParams : {};
  const [site, requestHeaders] = await Promise.all([readSite(), headers()]);
  const language = defaultLanguage(site);
  return <Portfolio
    site={site}
    language={language}
    siteOrigin={getSiteOrigin(requestHeaders)}
    isPreview={query.preview === '1'}
  />;
}
