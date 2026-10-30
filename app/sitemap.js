import { stat } from 'node:fs/promises';
import { headers } from 'next/headers';
import { defaultLanguage } from '../lib/locale.js';
import { getLanguageAlternates, getSiteOrigin } from '../lib/seo.js';
import { languages, readSite, siteFile } from '../lib/site-data.js';

export const dynamic = 'force-dynamic';


export default async function sitemap() {
  const [site, requestHeaders, siteStats] = await Promise.all([
    readSite(),
    headers(),
    stat(siteFile).catch(() => null),
  ]);
  const origin = getSiteOrigin(requestHeaders);
  const defaultSiteLanguage = defaultLanguage(site);
  const paths = ['/', ...languages.filter((language) => language !== defaultSiteLanguage).map((language) => `/${language}`)];
  const alternates = getLanguageAlternates(site, origin);
  const lastModified = siteStats?.mtime;

  return paths.map((pathname) => ({
    url: new URL(pathname, origin).toString(),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: 'monthly',
    priority: pathname === '/' ? 1 : 0.8,
    alternates: { languages: alternates },
  }));
}
