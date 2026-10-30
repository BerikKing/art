import './styles.css';
import './admin.css';
import { headers } from 'next/headers';
import { defaultLanguage } from '../lib/locale.js';
import { getLocalizedSeoContent, getSiteOrigin } from '../lib/seo.js';
import { readSite } from '../lib/site-data.js';

export async function generateMetadata() {
  const [site, requestHeaders] = await Promise.all([readSite(), headers()]);
  const language = defaultLanguage(site);
  const seo = getLocalizedSeoContent(site, language);
  const logoExtension = site.logoImage?.split('.').pop()?.toLowerCase() || '';
  const logoMimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const iconUrl = site.logoImage ? `/${site.logoImage}` : '/icon.svg';
  const iconType = site.logoImage ? logoMimeTypes[logoExtension] : 'image/svg+xml';
  const iconDescriptor = { url: iconUrl, ...(iconType ? { type: iconType } : {}) };

  return {
    metadataBase: new URL(getSiteOrigin(requestHeaders)),
    title: seo.title,
    description: seo.description,
    applicationName: seo.artistName,
    creator: seo.artistName,
    publisher: seo.artistName,
    icons: {
      icon: [iconDescriptor],
      shortcut: [iconDescriptor],
      ...(logoExtension === 'jpg' || logoExtension === 'jpeg' || logoExtension === 'png'
        ? { apple: [iconDescriptor] }
        : {}),
    },
    referrer: 'strict-origin-when-cross-origin',
    formatDetection: { email: false, address: false, telephone: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export default async function RootLayout({ children }) {
  const site = await readSite();
  return <html lang={defaultLanguage(site)}><body>{children}</body></html>;
}
