import { getCity } from './locale.js';
import { languages, localizedSite } from './site-data.js';

export const languageLocales = {
  ru: 'ru-RU',
  en: 'en-US',
  uk: 'uk-UA',
};

export const openGraphLocales = {
  ru: 'ru_RU',
  en: 'en_US',
  uk: 'uk_UA',
};

function validOrigin(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return '';
    return url.origin;
  } catch {
    return '';
  }
}

export function getSiteOrigin(requestHeaders) {
  const configuredOrigin = validOrigin(process.env.SITE_URL || '');
  if (configuredOrigin) return configuredOrigin;

  const forwardedHost = requestHeaders?.get('x-forwarded-host') || '';
  const hostHeader = (forwardedHost || requestHeaders?.get('host') || '').split(',')[0].trim();
  if (hostHeader && !/[\s/@\\]/.test(hostHeader)) {
    const forwardedProtocol = (requestHeaders?.get('x-forwarded-proto') || '').split(',')[0].trim().toLowerCase();
    const protocol = ['http', 'https'].includes(forwardedProtocol)
      ? forwardedProtocol
      : process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const origin = validOrigin(`${protocol}://${hostHeader}`);
    if (origin) return origin;
  }

  const port = process.env.PORT || '3000';
  return process.env.NODE_ENV === 'production' ? 'https://localhost' : `http://localhost:${port}`;
}

function shorten(value, limit) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  const part = text.slice(0, limit - 1);
  const wordEnd = part.lastIndexOf(' ');
  return `${part.slice(0, wordEnd > 0 ? wordEnd : part.length).trimEnd()}…`;
}

export function getLocalizedSeoContent(site, language) {
  const localized = localizedSite(site, language);
  const hasArtistName = Boolean(site.artistName?.trim());
  const fallbackNames = {
    ru: 'Портфолио художника',
    en: 'Artist portfolio',
    uk: 'Портфоліо художниці',
  };
  const fallbackTitles = {
    ru: 'Портфолио художника — живопись и графика',
    en: 'Artist portfolio — paintings and graphic art',
    uk: 'Портфоліо художниці — живопис і графіка',
  };
  const artistName = hasArtistName ? site.artistName.trim() : (fallbackNames[language] || fallbackNames.en);
  const city = getCity(site, language);
  const roles = {
    ru: 'художник · живопись и графика',
    en: 'artist · painting and graphic art',
    uk: 'художниця · живопис і графіка',
  };
  const title = shorten(
    `${hasArtistName ? `${artistName} — ${roles[language] || roles.en}` : (fallbackTitles[language] || fallbackTitles.en)}${city ? ` | ${city}` : ''}`,
    70,
  );
  const fallbackDescriptions = {
    ru: 'Портфолио художника: живопись, графика и избранные работы.',
    en: 'Artist portfolio featuring paintings, graphic art, and selected works.',
    uk: 'Портфоліо художниці: живопис, графіка та вибрані роботи.',
  };
  const introduction = localized.heroIntro || localized.aboutTextSmall || localized.aboutText || fallbackDescriptions[language] || fallbackDescriptions.en;
  const description = shorten(`${artistName}${city ? ` — ${city}` : ''}. ${introduction}`, 160);
  return { localized, artistName, hasArtistName, city, title, description };
}

export function getLanguageAlternates(site, origin) {
  const defaultLanguage = languages.find((language) => site.languageVisibility?.[language]) || 'en';
  const alternates = Object.fromEntries(languages.map((language) => [
    languageLocales[language], new URL(language === defaultLanguage ? '/' : `/${language}`, origin).toString(),
  ]));
  alternates['x-default'] = new URL('/', origin).toString();
  return alternates;
}

export function getLocalizedMetadata(site, language, pathname, requestHeaders) {
  const selectedLanguage = languages.includes(language) ? language : 'en';
  const origin = getSiteOrigin(requestHeaders);
  const defaultLanguage = languages.find((code) => site.languageVisibility?.[code]) || 'en';
  const canonicalPath = pathname === `/${defaultLanguage}` ? '/' : pathname;
  const canonicalUrl = new URL(canonicalPath, origin).toString();
  const seo = getLocalizedSeoContent(site, selectedLanguage);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguageAlternates(site, origin),
    },
    openGraph: {
      type: 'website',
      siteName: seo.artistName,
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      locale: openGraphLocales[selectedLanguage],
      alternateLocale: languages.filter((code) => code !== selectedLanguage).map((code) => openGraphLocales[code]),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}
