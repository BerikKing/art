import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const languages = ['ru', 'en', 'uk'];
export const artworkGenres = ['portrait', 'landscape', 'still-life', 'animalistic', 'marine', 'interior', 'everyday', 'historical', 'mythological', 'abstract', 'other'];
export const dataDir = path.join(process.cwd(), 'data');
export const siteFile = path.join(dataDir, 'site.json');
export const uploadDir = path.join(process.cwd(), 'public', 'uploads');

const textLimits = {
  artistName: 80,
  city: 80,
  legalName: 160,
  businessAddress: 300,
  companyNumber: 60,
  vatNumber: 60,
  heroTitle: 180,
  heroIntro: 500,
  worksTitle: 100,
  worksNote: 300,
  aboutTitle: 140,
  aboutText: 1200,
  aboutTextSmall: 500,
  contactTitle: 140,
  contactText: 500,
};

export function cleanText(value, limit, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return Array.from(value.replaceAll('\0', '').trim()).slice(0, limit).join('');
}

export function validImagePath(value) {
  return typeof value === 'string' && /^uploads\/[A-Za-z0-9._-]+$/.test(value) ? value : '';
}

function validWebUrl(value) {
  if (typeof value !== 'string' || value.length > 300) return false;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function normalizedWhatsApp(value) {
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  if (/^[+0-9\s().-]+$/.test(raw)) {
    const number = raw.replace(/\D/g, '');
    return number.length >= 7 && number.length <= 15 ? `https://wa.me/${number}` : '';
  }
  return validWebUrl(raw) ? raw : '';
}

function normalizedPhone(value) {
  const raw = cleanText(value, 40);
  if (!raw) return '';
  if (!/^[+0-9\s().-]+$/.test(raw)) return '';
  const number = raw.replace(/\D/g, '');
  return number.length >= 7 && number.length <= 15 ? `+${number}` : '';
}

async function readDefaultSite() {
  const filename = path.join(dataDir, 'default-site.json');
  return JSON.parse(await readFile(filename, 'utf8'));
}

export function normalizeSite(raw, defaults) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const site = structuredClone(defaults);

  for (const key of ['artistName', 'city', 'legalName', 'businessAddress', 'companyNumber', 'vatNumber']) {
    site[key] = cleanText(source[key], textLimits[key], site[key]);
  }
  for (const key of ['logoImage', 'heroImage', 'aboutImage']) {
    site[key] = validImagePath(source[key]);
  }

  const languageVisibility = source.languageVisibility && typeof source.languageVisibility === 'object'
    ? source.languageVisibility
    : {};
  for (const language of languages) {
    site.languageVisibility[language] = Object.hasOwn(languageVisibility, language)
      ? Boolean(languageVisibility[language])
      : !Object.hasOwn(source, 'languageVisibility');
  }

  for (const key of ['paperColor', 'greenColor', 'accentColor']) {
    site[key] = /^#[\da-f]{6}$/i.test(source[key] || '') ? source[key].toLowerCase() : defaults[key];
  }

  const email = cleanText(source.email, 160);
  site.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
  site.phone = normalizedPhone(source.phone);
  for (const key of ['instagram', 'facebook', 'tiktok']) {
    const value = cleanText(source[key], 300);
    site[key] = value === '' || validWebUrl(value) ? value : '';
  }
  site.whatsapp = normalizedWhatsApp(source.whatsapp);

  const contactVisibility = source.contactVisibility && typeof source.contactVisibility === 'object'
    ? source.contactVisibility
    : {};
  for (const key of ['email', 'phone', 'instagram', 'whatsapp', 'facebook', 'tiktok']) {
    site.contactVisibility[key] = Object.hasOwn(contactVisibility, key)
      ? Boolean(contactVisibility[key])
      : Boolean(defaults.contactVisibility[key]);
  }

  const works = Array.isArray(source.works) ? source.works.slice(0, 30) : [];
  site.works = works.filter((work) => work && typeof work === 'object' && !Array.isArray(work)).map((work, index) => ({
    category: work.category === 'graphic' || work.category === 'pencil' ? 'graphic' : 'painting',
    genre: artworkGenres.includes(work.genre) ? work.genre : work.category === 'still-life' ? 'still-life' : '',
    year: cleanText(work.year, 4),
    dimensions: cleanText(work.dimensions, 60),
    image: validImagePath(work.image),
    artworkIndex: Math.max(0, Math.min(3, Number.parseInt(work.artworkIndex ?? index, 10) || 0)),
  }));

  const sourceTranslations = source.translations && typeof source.translations === 'object' ? source.translations : {};
  for (const language of languages) {
    const sourceTranslation = sourceTranslations[language] && typeof sourceTranslations[language] === 'object'
      ? sourceTranslations[language]
      : {};
    for (const key of ['heroTitle', 'heroIntro', 'worksTitle', 'worksNote', 'aboutTitle', 'aboutText', 'aboutTextSmall', 'contactTitle', 'contactText']) {
      site.translations[language][key] = cleanText(
        sourceTranslation[key],
        textLimits[key],
        defaults.translations[language][key],
      );
    }
    const localWorks = Array.isArray(sourceTranslation.works) ? sourceTranslation.works : [];
    const newTitle = { ru: 'Новая работа', en: 'New artwork', uk: 'Нова робота' }[language];
    site.translations[language].works = site.works.map((_, index) => {
      const local = localWorks[index] && typeof localWorks[index] === 'object' ? localWorks[index] : {};
      const defaultWork = defaults.translations[language].works[index] || {};
      return {
        title: cleanText(local.title, 120, defaultWork.title || newTitle),
        medium: cleanText(local.medium, 100, defaultWork.medium || ''),
        description: cleanText(local.description, 500, defaultWork.description || ''),
      };
    });
  }
  return site;
}

export async function readSite() {
  const defaults = await readDefaultSite();
  try {
    return normalizeSite(JSON.parse(await readFile(siteFile, 'utf8')), defaults);
  } catch {
    await mkdir(dataDir, { recursive: true });
    await writeFile(siteFile, `${JSON.stringify(defaults, null, 2)}\n`, { mode: 0o600 });
    return defaults;
  }
}

export function siteImagePaths(site) {
  return [site.logoImage, site.heroImage, site.aboutImage, ...(site.works || []).map((work) => work.image)]
    .map(validImagePath)
    .filter(Boolean);
}

export async function writeSite(site) {
  await mkdir(dataDir, { recursive: true });
  const temporaryFile = `${siteFile}.${process.pid}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(site, null, 2)}\n`, { mode: 0o600 });
  await rename(temporaryFile, siteFile);
}

export async function removeUnusedImages(previousSite, nextSite) {
  const { unlink } = await import('node:fs/promises');
  const remaining = new Set(siteImagePaths(nextSite));
  const oldImages = new Set(siteImagePaths(previousSite));
  for (const imagePath of oldImages) {
    if (remaining.has(imagePath)) continue;
    const filename = path.basename(imagePath);
    if (!/^[a-f0-9]{32}\.(?:jpg|png|webp)$/i.test(filename)) continue;
    try {
      await unlink(path.join(uploadDir, filename));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

export function localizedSite(site, language) {
  const selectedLanguage = languages.includes(language) ? language : 'ru';
  const translation = site.translations[selectedLanguage] || site.translations.ru;
  const works = site.works.map((work, index) => ({
    ...work,
    ...(translation.works[index] || site.translations.ru.works[index] || {}),
  }));
  return { ...site, ...translation, works, language: selectedLanguage };
}
