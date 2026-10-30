import Link from 'next/link';
import { getSiteOrigin } from '../lib/seo.js';

function ContactDetails({ site }) {
  const name = site.legalName || site.artistName || 'The artist';
  const email = site.email;
  return <address>
    <strong>{name}</strong>
    {site.businessAddress && <span>{site.businessAddress}</span>}
    {email && <a href={`mailto:${email}`}>{email}</a>}
    {site.companyNumber && <span>Company number: {site.companyNumber}</span>}
    {site.vatNumber && <span>VAT number: {site.vatNumber}</span>}
  </address>;
}

export function LegalLayout({ site, title, children, language = 'en' }) {
  const name = site.artistName || site.legalName || 'Artist portfolio';
  const prefix = language === 'en' ? '' : `/${language}`;
  const labels = language === 'ru'
    ? { privacy: 'Конфиденциальность', cookies: 'Cookie', terms: 'Условия продажи' }
    : language === 'uk'
      ? { privacy: 'Конфіденційність', cookies: 'Cookie', terms: 'Умови продажу' }
      : { privacy: 'Privacy Notice', cookies: 'Cookie Notice', terms: 'Terms of Sale' };
  return <main className="legal-page">
    <header className="legal-header"><Link href={prefix || '/'} className="legal-brand">{name}</Link><Link href={prefix || '/'} className="legal-back">← {language === 'ru' ? 'К портфолио' : language === 'uk' ? 'До портфоліо' : 'Back to portfolio'}</Link></header>
    <article className="legal-content">
      <p className="legal-kicker">LEGAL INFORMATION</p>
      <h1>{title}</h1>
      {children}
      <section><h2>Contact</h2><ContactDetails site={site} /></section>
    </article>
    <footer className="legal-footer"><Link href={`${prefix}/privacy`}>{labels.privacy}</Link><Link href={`${prefix}/cookies`}>{labels.cookies}</Link><Link href={`${prefix}/terms`}>{labels.terms}</Link><span>© {new Date().getFullYear()} {name}</span></footer>
  </main>;
}

export function legalMetadata(site, title, description, pathname) {
  const origin = getSiteOrigin();
  return {
    title,
    description,
    alternates: { canonical: new URL(pathname || (title === 'Privacy Notice' ? '/privacy' : title === 'Cookie Notice' ? '/cookies' : '/terms'), origin).toString() },
    robots: { index: false, follow: true },
  };
}
