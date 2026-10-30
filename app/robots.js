import { headers } from 'next/headers';
import { getSiteOrigin } from '../lib/seo.js';

export const dynamic = 'force-dynamic';

export default async function robots() {
  const requestHeaders = await headers();
  const origin = getSiteOrigin(requestHeaders);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api',
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
