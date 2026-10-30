import Script from 'next/script';
import { defaultLanguage, getArtistName, getCity, siteUi } from '../lib/locale.js';
import { localizedSite } from '../lib/site-data.js';
import { languageLocales } from '../lib/seo.js';

const artworkSvgs = [
  '<svg viewBox="0 0 700 760" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="700" height="760" fill="#df7253"/><path d="M0 0h700v230c-120 55-220 47-330 7C245 197 130 200 0 260V0Z" fill="#f2c68c"/><circle cx="470" cy="170" r="84" fill="#f7e6bc"/><path d="M0 350c125-80 223-90 326-39 107 54 223 57 374-14v463H0V350Z" fill="#2f6666"/><path d="M0 510c140-88 230-91 334-30 100 58 206 54 366-20v300H0V510Z" fill="#b8c49a"/><path d="M47 610c115-45 213-41 303 8 90 48 184 47 303 0v142H47V610Z" fill="#e8b778"/><path d="M120 0c46 78 52 157 18 236-24 56-17 108 28 157" fill="none" stroke="#c75543" stroke-width="5"/></svg>',
  '<svg viewBox="0 0 620 680" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="620" height="680" fill="#315b68"/><path d="M0 0h620v160c-97 37-184 33-281 3C231 136 114 145 0 198V0Z" fill="#e6c48a"/><circle cx="390" cy="235" r="105" fill="#f1dba8"/><path d="M0 432c102-88 195-112 282-68 97 50 193 45 338-34v350H0V432Z" fill="#748d86"/><path d="M0 538c103-74 182-81 250-42 71 40 122 38 191-2 56-33 115-30 179 10v176H0V538Z" fill="#c06a4d"/><path d="M86 0c71 103 83 198 37 285-31 60-17 119 42 164" fill="none" stroke="#f1dba8" stroke-width="5"/></svg>',
  '<svg viewBox="0 0 620 680" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="620" height="680" fill="#d9c6a7"/><path d="M55 79c108-73 349-63 468 8v521H82C49 430 40 232 55 79Z" fill="#789084"/><path d="M163 590c24-126 24-235 5-338 47-68 105-102 177-102 83 0 137 50 148 133 11 82-13 202-49 307H163Z" fill="#c57d60"/><path d="M208 256c12-93 62-143 139-143 79 0 121 58 121 146-35-36-71-52-109-47-51 7-95 26-151 44Z" fill="#344f4d"/><ellipse cx="326" cy="293" rx="71" ry="87" fill="#dba57c"/><path d="M263 294h38m57 0h37m-73 57c16 10 33 10 49 0" fill="none" stroke="#65473e" stroke-width="5" stroke-linecap="round"/><g fill="#e6b86f"><circle cx="163" cy="127" r="19"/><circle cx="465" cy="146" r="18"/><circle cx="202" cy="94" r="11"/></g></svg>',
  '<svg viewBox="0 0 620 680" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="620" height="680" fill="#a7c5bd"/><circle cx="455" cy="165" r="77" fill="#f0d59e"/><path d="M0 366 150 187l115 145 119-204 236 276v276H0V366Z" fill="#557c77"/><path d="m77 284 73-97 51 65-22-9-30 17-29-12-18 36Zm227-46 80-110 92 106-42-22-31 10-25-21-29 24-26-6-19 19Z" fill="#e8e0c8"/><path d="M0 427c114-62 212-54 291 9 80 64 190 70 329 10v234H0V427Z" fill="#356b70"/><path d="M0 517c129 22 222 19 302-19 102-48 194-44 318 18v164H0V517Z" fill="#759d91"/><path d="M27 560c103-18 195-12 275 18m62-46c73-27 141-23 204 10" fill="none" stroke="#d5dfce" stroke-width="5"/></svg>',
];

const portraitSvg = '<svg viewBox="0 0 410 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="12" y="12" width="386" height="476" rx="190" fill="#d7a77e"/><ellipse cx="218" cy="279" rx="112" ry="150" fill="#edc69a"/><path d="M107 268c-15-121 32-208 122-208 102 0 145 86 117 226-9-49-33-83-70-105-41 48-93 78-169 87Z" fill="#354e49"/><path d="M104 264c-17 69-33 140-27 224h286c-3-77-22-142-63-198-52 52-115 66-196-26Z" fill="#607d6e"/><path d="M172 296c18-9 34-10 49-2m35 0c15-8 31-7 45 2M224 350c17 9 34 9 51-1" fill="none" stroke="#694e43" stroke-width="5" stroke-linecap="round"/><g fill="#e7c37f"><circle cx="97" cy="97" r="17"/><circle cx="365" cy="83" r="14"/><circle cx="126" cy="122" r="10"/></g></svg>';

function safeJson(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => ({
    '<': '\\u003c', '>': '\\u003e', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029',
  })[character]);
}

function Title({ children }) {
  const lines = String(children || '').split(/\r?\n/);
  return lines.map((line, index) => {
    const match = index === lines.length - 1 ? line.match(/^(.*?)(\S+)(\s*)$/) : null;
    return <span key={`${index}-${line}`}>{index > 0 && <br />}{match ? <>{match[1]}<em>{match[2]}</em>{match[3]}</> : line}</span>;
  });
}

function Art({ index = 0, image = '', title = '' }) {
  if (image) return <img src={mediaUrl(image)} alt={title} />;
  return <span dangerouslySetInnerHTML={{ __html: artworkSvgs[Math.max(0, Math.min(3, index))] }} />;
}

function mediaUrl(image) {
  return image ? `/media/${image.split('/').pop()}` : '';
}

function BrandMark({ image, name, className, id }) {
  const initials = String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => Array.from(word)[0]).join('').toLocaleUpperCase('ru') || 'ИФ';
  return <span className={`${className}${image ? ' has-logo-image' : ''}`} id={id}>{image ? <img src={mediaUrl(image)} alt="" /> : initials}</span>;
}

function SocialIcon({ network }) {
  if (network === 'email') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (network === 'phone') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5 10 3l1.5 4-2 1.8a15 15 0 0 0 5.7 5.7l1.8-2 4 1.5-.5 3a3 3 0 0 1-3.2 2.5A15.8 15.8 0 0 1 4.5 6.7 3 3 0 0 1 7 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (network === 'whatsapp') return <svg viewBox="0 0 512 512" aria-hidden="true"><g transform="translate(0 512) scale(.1 -.1)" fill="currentColor"><path d="M2385 4983c-22-2-95-13-163-24C1227 4795 388 3999 196 3040 93 2524 163 2023 411 1513l68-142-169-618C217 414 142 134 144 132c2-2 71 15 152 37 82 22 367 97 633 166l483 127 118-55c323-152 635-230 970-244 637-25 1265 230 1740 707 590 591 851 1414 694 2188-199 991-1075 1803-2069 1917-116 13-373 18-480 8zm391-414c444-44 837-225 1167-538 644-611 805-1523 412-2330-304-625-876-1034-1555-1112-167-19-466-7-620 26-220 46-448 133-636 242l-70 42-374-99c-206-54-376-97-378-95-2 1 42 167 97 369l101 366-44 67c-139 217-251 520-291 794-20 139-20 414 1 561 83 606 434 1122 976 1436 366 213 807 311 1214 271z"/><path d="M1632 3670c-53-24-144-118-191-194-62-103-83-178-89-309-7-174 20-290 108-467 47-94 209-330 318-463 215-263 486-487 737-607 192-92 492-188 645-205 172-20 366 50 496 179 84 83 109 139 127 279 16 125 16 125-173 219-256 127-379 180-417 181-30 1-41-5-64-33-221-273-227-280-271-280-24 0-251 107-323 152-190 120-360 288-490 483-40 61-76 120-79 132-9 29 6 56 67 123 61 67 123 161 132 199 5 22-15 80-85 251-160 391-146 374-298 378-90 2-114-1-150-18z"/></g></svg>;
  if (network === 'instagram') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.5" cy="6.7" r="1" fill="currentColor"/></svg>;
  if (network === 'facebook') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 21v-8.2H16l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7v3.2h2.8V21h3.4Z" fill="currentColor"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 3.2c.2 1.8 1.2 3.2 3.3 3.8v3.1a8.4 8.4 0 0 1-3.3-1.2v6.2a5.5 5.5 0 1 1-5.5-5.5c.4 0 .8 0 1.2.1v3.2a2.5 2.5 0 1 0 1.2 2.2V3.2h3.1Z" fill="currentColor"/></svg>;
}

export default function Portfolio({ site, language, siteOrigin = 'http://localhost:3000', isPreview = false }) {
  const page = localizedSite(site, language);
  const ui = siteUi[language];
  const name = getArtistName(site, language);
  const city = getCity(site, language);
  const websiteName = site.artistName?.trim() || ({ ru: 'Портфолио художника', en: 'Artist portfolio', uk: 'Портфоліо художниці' }[language] || 'Artist portfolio');
  const defaultSiteLanguage = defaultLanguage(site);
  const legalUrl = (pathname) => language === 'en' ? pathname : `/${language}${pathname}`;
  const canonicalUrl = `${siteOrigin}${language === defaultSiteLanguage ? '/' : `/${language}`}`;
  const sameAs = ['instagram', 'facebook', 'tiktok']
    .filter((network) => site.contactVisibility?.[network] !== false && site[network])
    .map((network) => site[network]);
  const profileImage = site.aboutImage || site.heroImage;
  const personId = `${siteOrigin}/#artist`;
  const websiteId = `${siteOrigin}/#website`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [{
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteOrigin}/`,
        name: websiteName,
        inLanguage: languageLocales[language] || language,
        ...(site.artistName?.trim() ? { publisher: { '@id': personId } } : {}),
      }, ...(site.artistName?.trim() ? [{
        '@type': 'Person',
        '@id': personId,
        name: site.artistName.trim(),
        jobTitle: ui.artist,
        description: page.aboutTextSmall || page.heroIntro,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        ...(city ? { address: { '@type': 'PostalAddress', addressLocality: city } } : {}),
        ...(site.phone && site.contactVisibility?.phone !== false ? { telephone: site.phone } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(profileImage ? { image: `${siteOrigin}/${profileImage}` } : {}),
      }] : [])],
  };
  const firstWork = page.works[0] || {};
  const firstTitle = firstWork.title || ui.studio;
  const firstMeta = [firstWork.year, firstWork.medium].filter(Boolean).join(' · ');
  const languageNames = { ru: 'РУС', en: 'ENG', uk: 'УКР' };
  const cookieNotice = {
    ru: { text: 'Мы используем только необходимые cookie для защиты редактора сайта. Аналитические и рекламные cookie не используются.', link: 'Подробнее о cookie', button: 'Понятно' },
    en: { text: 'We use essential cookies only to keep website administration secure. This portfolio does not use analytics or advertising cookies.', link: 'Cookie Notice', button: 'OK' },
    uk: { text: 'Ми використовуємо лише необхідні cookie для захисту редактора сайту. Аналітичні та рекламні cookie не використовуються.', link: 'Детальніше про cookie', button: 'Зрозуміло' },
  }[language] || { text: '', link: 'Cookie Notice', button: 'OK' };
  const contacts = [
    { key: 'email', label: ui.contactButton, href: site.email ? `mailto:${site.email}` : '', external: false },
    { key: 'phone', label: ui.callPhone, href: site.phone ? `tel:${site.phone}` : '', external: false },
    { key: 'whatsapp', label: 'WhatsApp', href: site.whatsapp, external: true },
    { key: 'instagram', label: 'Instagram', href: site.instagram, external: true },
    { key: 'facebook', label: 'Facebook', href: site.facebook, external: true },
    { key: 'tiktok', label: 'TikTok', href: site.tiktok, external: true },
  ];
  const currentSiteJson = safeJson(site);
  const currentUiJson = safeJson(siteUi);

  return <>
    <style>{`body{--paper:${site.paperColor};--green:${site.greenColor};--coral:${site.accentColor};}`}</style>
    <script dangerouslySetInnerHTML={{ __html: `window.initialSite=${currentSiteJson};window.currentLanguage=${safeJson(language)};window.siteUi=${currentUiJson};` }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(structuredData) }} />
    <div className="portfolio-page" lang={language} data-language={language} style={{ '--paper': site.paperColor, '--green': site.greenColor, '--coral': site.accentColor }}>
      <header className="site-header" id="top">
        <a className="wordmark" href={`/${language}`} aria-label={name}>
          <BrandMark className="wordmark-mark" id="artist-monogram" image={site.logoImage} name={name} />
          <span className="wordmark-text"><span id="artist-name">{name.toLocaleLowerCase('ru')}</span><small id="artist-city">{ui.artist}{city ? ` · ${city}` : ''}</small></span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label={ui.menuOpen}><span></span><span></span></button>
        <nav className="main-nav" id="main-nav" aria-label={ui.navLabel}>
          <a id="nav-works" href="#works">{ui.works}</a><a id="nav-about" href="#about">{ui.about}</a><a id="nav-contact" href="#contact">{ui.contact}</a>
          <a className="nav-instagram" id="instagram-link" href={site.instagram || '#'} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" hidden={!site.instagram || site.contactVisibility.instagram === false}><SocialIcon network="instagram" /></a>
        </nav>
        <nav className="language-switch" aria-label="Language" id="language-switch" hidden={!Object.values(site.languageVisibility).some(Boolean)}>
          {['ru', 'en', 'uk'].map((code) => <a key={code} href={`/${code}`} data-language-link={code} lang={code} hidden={!site.languageVisibility[code]} aria-current={language === code && site.languageVisibility[code] ? 'page' : undefined}>{languageNames[code]}</a>)}
        </nav>
      </header>

      <main>
        <section className="hero section-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow" id="artist-role"><span className="eyebrow-line"></span> {ui.artist}{city ? ` · ${city}` : ''}</p>
            <h1 id="hero-title"><Title>{page.heroTitle}</Title></h1>
            <p className="hero-intro" id="hero-intro">{page.heroIntro}</p>
            <a className="text-link" id="hero-cta" href="#works">{ui.heroCta} <span aria-hidden="true">↓</span></a>
            <span className="hero-index" aria-hidden="true">01 — {String(Math.max(1, page.works.length)).padStart(2, '0')}</span>
          </div>
          <div className="hero-art-wrap">
            <div className="hero-art-label label-top" id="hero-series">{ui.series} «{firstTitle}»</div>
            <div className="hero-art" role="img" aria-label={name}><Art image={site.heroImage} index={0} title={firstTitle} /></div>
            <div className="hero-art-label label-bottom"><span id="hero-art-title">«{firstTitle}»</span><span id="hero-art-meta">{firstMeta}</span></div>
            <span className="hero-sparkle" aria-hidden="true">✳</span>
          </div>
        </section>

        <section className="works section-shell" id="works" aria-labelledby="works-title">
          <div className="section-heading"><div><p className="eyebrow" id="works-eyebrow"><span className="eyebrow-line"></span> {ui.studio}</p><h2 id="works-title"><Title>{page.worksTitle}</Title></h2></div><p className="section-note" id="works-note">{page.worksNote}</p></div>
          <div className="filters" role="group" aria-label={ui.filterLabel}>
            <button className="filter-button is-active" id="filter-all" type="button" data-filter="all" aria-pressed="true">{ui.all} <span>{String(page.works.length).padStart(2, '0')}</span></button>
            <button className="filter-button" id="filter-painting" type="button" data-filter="painting" aria-pressed="false">{ui.painting}</button>
            <button className="filter-button" id="filter-graphic" type="button" data-filter="graphic" aria-pressed="false">{ui.graphic}</button>
          </div>
          <div className="art-grid">
            {page.works.map((work, index) => {
              const category = work.category === 'graphic' ? 'graphic' : 'painting';
              const categoryLabel = ui[category];
              const genreLabel = ui.genres?.[work.genre] || '';
              const metadata = [categoryLabel, genreLabel, work.year, work.medium, work.dimensions].filter(Boolean).join(' · ');
              const cardLabel = [categoryLabel, genreLabel, work.year].filter(Boolean).join(' · ');
              return <article key={`${work.year}-${index}`} className={`art-card${index === 0 ? ' art-card-large' : ''}${index === 1 ? ' art-card-offset' : ''}${index === 3 ? ' art-card-offset-small' : ''}`} data-category={category}>
                <button className="artwork-button" type="button" aria-label={`${ui.view} «${work.title}»`} data-language={language} data-title={work.title} data-meta={metadata} data-description={work.description}>
                  <div className="artwork" role="img" aria-label={work.title}><Art image={work.image} index={work.artworkIndex} title={work.title} /></div><span className="card-open" aria-hidden="true">↗</span>
                </button>
                <div className="art-card-caption"><div><h3>{work.title}</h3><p>{cardLabel}</p></div><span className="card-number">{String(index + 1).padStart(2, '0')}</span></div>
              </article>;
            })}
          </div>
        </section>

        <section className="about" id="about">
          <div className="about-inner section-shell">
            <div className="about-stamp" aria-hidden="true"><span id="about-stamp">{ui.stamp}</span><b>✳</b></div>
            <div className="about-copy"><p className="eyebrow" id="about-eyebrow"><span className="eyebrow-line"></span> {ui.aboutEyebrow}</p><h2 id="about-title"><Title>{page.aboutTitle}</Title></h2><p className="about-text" id="about-text">{page.aboutText}</p><p className="about-text about-text-small" id="about-text-small">{page.aboutTextSmall}</p><a className="text-link" id="about-cta" href="#contact">{ui.aboutCta} <span aria-hidden="true">↗</span></a></div>
            <div className="about-visual" id="about-visual" aria-hidden={!site.aboutImage}>{site.aboutImage ? <img src={mediaUrl(site.aboutImage)} alt={name} /> : <span dangerouslySetInnerHTML={{ __html: portraitSvg }} />}</div>
          </div>
        </section>

        <section className="contact section-shell" id="contact" aria-labelledby="contact-title">
          <div className="contact-orbit" aria-hidden="true">✳</div><p className="eyebrow" id="contact-eyebrow"><span className="eyebrow-line"></span> {ui.contactEyebrow}</p>
          <h2 id="contact-title"><Title>{page.contactTitle}</Title></h2><p className="contact-note" id="contact-note">{page.contactText}</p>
          <div className="contact-methods" id="contact-methods">
            {contacts.map((method) => <a key={method.key} className="contact-button contact-method contact-method-icon" id={`contact-link-${method.key}`} data-contact-key={method.key} href={method.href || '#'} aria-label={method.label} title={method.label} target={method.external ? '_blank' : undefined} rel={method.external ? 'noreferrer' : undefined} hidden={!method.href || site.contactVisibility[method.key] === false}><SocialIcon network={method.key} /></a>)}
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <div className="footer-info"><a className={`footer-mark${site.logoImage ? ' has-logo-image' : ''}`} href="#top" id="footer-monogram">{site.logoImage ? <img src={mediaUrl(site.logoImage)} alt="" /> : name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => Array.from(word)[0]).join('').toLocaleUpperCase('ru') || 'ИФ'}</a><p>© {new Date().getFullYear()} <span id="footer-artist-name">{name}</span>. <span id="footer-copyright">{ui.copyright}</span></p></div>
        <nav className="legal-links" aria-label="Legal information"><a href={legalUrl('/privacy')}>Privacy</a><a href={legalUrl('/cookies')}>Cookies</a><a href={legalUrl('/terms')}>Terms of Sale</a></nav>
        <a className="developer-credit" id="developer-credit" href="https://beka-dev.com" aria-label={`${ui.developerCredit} Beka Dev`} target="_blank" rel="noreferrer"><span id="developer-credit-label">{ui.developerCredit}</span><span className="developer-logo" aria-hidden="true"></span></a>
        {!isPreview && <a href="/admin" className="back-top" id="admin-link">{ui.edit} ↗</a>}
      </footer>

      <dialog className="art-dialog" aria-labelledby="dialog-title"><button className="dialog-close" type="button" aria-label={ui.dialogClose}>×</button><div className="dialog-art"></div><div className="dialog-copy"><p className="eyebrow" id="dialog-eyebrow">{ui.dialogLabel}</p><h2 id="dialog-title"></h2><p className="dialog-meta"></p><p className="dialog-description"></p><div className="dialog-contact-options" hidden><a className="contact-button dialog-cta" id="dialog-email" href="#contact" hidden>{ui.ctaEmail}</a><a className="contact-button dialog-cta" id="dialog-whatsapp" href="#contact" hidden>WhatsApp</a><a className="contact-button dialog-cta" id="dialog-phone" href="#contact" hidden>{ui.ctaPhone}</a></div></div></dialog>
      <div id="art-templates" hidden><span id="art-template-artworks" dangerouslySetInnerHTML={{ __html: artworkSvgs.join('') }} /><div id="portrait-template"><span dangerouslySetInnerHTML={{ __html: portraitSvg }} /></div></div>
      {!isPreview && <aside className="cookie-notice" data-cookie-notice aria-label="Cookie notice" hidden><p><span id="cookie-notice-text">{cookieNotice.text}</span> <a id="cookie-notice-link" href={legalUrl('/cookies')}>{cookieNotice.link}</a></p><button id="cookie-notice-dismiss" type="button" data-cookie-dismiss>{cookieNotice.button}</button></aside>}
    </div>
    <Script src="/script.js" strategy="afterInteractive" />
  </>;
}
