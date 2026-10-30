import { createPortfolioImage } from '../../lib/og-image.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Localized artist portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }) {
  const { lang } = await params;
  return createPortfolioImage(lang);
}
