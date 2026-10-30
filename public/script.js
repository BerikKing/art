let activeSite = window.initialSite || {};

function mediaUrl(path) {
  const filename = String(path || '').split('/').pop();
  return filename ? `/media/${filename}` : '';
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || '';
}

function setTitle(element, value) {
  if (!element) return;
  const lines = String(value || '').split(/\r?\n/);
  element.replaceChildren();
  lines.forEach((line, index) => {
    if (index) element.append(document.createElement('br'));
    if (index === lines.length - 1) {
      const match = line.match(/^(.*?)(\S+)(\s*)$/);
      if (match) {
        element.append(document.createTextNode(match[1]));
        const accent = document.createElement('em');
        accent.textContent = match[2];
        element.append(accent, document.createTextNode(match[3]));
      } else {
        element.append(document.createTextNode(line));
      }
    } else {
      element.append(document.createTextNode(line));
    }
  });
}

function setEyebrow(id, label) {
  const element = document.getElementById(id);
  if (!element) return;
  const line = element.querySelector('.eyebrow-line');
  element.replaceChildren(line, document.createTextNode(` ${label || ''}`));
}

function setLinkLabel(element, label) {
  if (!element) return;
  const icon = element.querySelector('span[aria-hidden="true"]');
  element.replaceChildren(document.createTextNode(`${label || ''} `));
  if (icon) element.append(icon);
}

function setIconLinkLabel(element, label) {
  if (!element) return;
  element.setAttribute('aria-label', label || 'Open link');
  element.setAttribute('title', label || 'Open link');
}

function setBrandMark(element, imagePath, name) {
  if (!element) return;
  if (imagePath) {
    const image = document.createElement('img');
    image.src = mediaUrl(imagePath);
    image.alt = '';
    element.classList.add('has-logo-image');
    element.replaceChildren(image);
  } else {
    element.classList.remove('has-logo-image');
    element.textContent = artistInitials(name);
  }
}

function artistInitials(name) {
  return String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join('').toLocaleUpperCase('ru') || 'ИФ';
}

function setArtImage(container, source, fallback, alt) {
  if (!container) return;
  if (source) {
    const image = document.createElement('img');
    image.src = mediaUrl(source);
    image.alt = alt || '';
    container.replaceChildren(image);
  } else if (fallback) {
    container.replaceChildren(fallback.cloneNode(true));
  }
}

function whatsappLink(value) {
  const raw = String(value || '').trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!/^[+0-9\s().-]+$/.test(raw)) return '';
  const number = raw.replace(/\D/g, '');
  return number.length >= 7 && number.length <= 15 ? `https://wa.me/${number}` : '';
}

function phoneLink(value) {
  const raw = String(value || '').trim();
  if (!/^[+0-9\s().-]+$/.test(raw)) return '';
  const number = raw.replace(/\D/g, '');
  return number.length >= 7 && number.length <= 15 ? `tel:+${number}` : '';
}

function renderWorks(site, language, ui) {
  const artGrid = document.querySelector('.art-grid');
  if (!artGrid) return;
  const artTemplates = [...document.querySelectorAll('#art-template-artworks > svg')];
  const commonWorks = Array.isArray(site.works) ? site.works : [];
  const translatedWorks = site.translations?.[language]?.works || [];
  const cards = commonWorks.map((work, index) => {
    const local = translatedWorks[index] || {};
    const title = local.title || '';
    const category = work.category === 'graphic' ? 'graphic' : 'painting';
    const categoryLabel = ui[category];
    const genreLabel = ui.genres?.[work.genre] || '';
    const metadata = [work.year, local.medium, work.dimensions].filter(Boolean).join(' · ');
    const cardLabel = [categoryLabel, genreLabel, work.year].filter(Boolean).join(' · ');
    const card = document.createElement('article');
    card.className = `art-card${index === 0 ? ' art-card-large' : ''}${index === 1 ? ' art-card-offset' : ''}${index === 3 ? ' art-card-offset-small' : ''}`;
    card.dataset.category = category;

    const button = document.createElement('button');
    button.className = 'artwork-button';
    button.type = 'button';
    button.dataset.language = language;
    button.setAttribute('aria-label', `${ui.view} «${title}»`);
    button.dataset.title = title;
    button.dataset.meta = metadata;
    button.dataset.description = local.description || '';

    const artwork = document.createElement('div');
    artwork.className = 'artwork';
    artwork.setAttribute('role', 'img');
    artwork.setAttribute('aria-label', title);
    const artworkIndex = Math.max(0, Math.min(3, Number(work.artworkIndex) || 0));
    setArtImage(artwork, work.image, artTemplates[artworkIndex], title);
    const open = document.createElement('span');
    open.className = 'card-open';
    open.setAttribute('aria-hidden', 'true');
    open.textContent = '↗';
    button.append(artwork, open);

    const caption = document.createElement('div');
    caption.className = 'art-card-caption';
    const info = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = title;
    const subheading = document.createElement('p');
    subheading.textContent = cardLabel;
    info.append(heading, subheading);
    const number = document.createElement('span');
    number.className = 'card-number';
    number.textContent = String(index + 1).padStart(2, '0');
    caption.append(info, number);
    card.append(button, caption);
    return card;
  });
  artGrid.replaceChildren(...cards);
  const count = document.querySelector('#filter-all span');
  if (count) count.textContent = String(cards.length).padStart(2, '0');
  filterWorks('all');
}

function filterWorks(filter) {
  document.querySelectorAll('.filter-button').forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.art-card').forEach((card) => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
  });
}

function setWorkInquiryLinks(site, title, ui) {
  const contactVisibility = site.contactVisibility || {};
  const inquiry = `${ui.inquiryBody || 'Hello! I would like to know more about this artwork'}: «${title}»`;
  const subject = `${ui.inquirySubject || 'Artwork inquiry'}: «${title}»`;
  const whatsapp = whatsappLink(site.whatsapp);
  const phone = phoneLink(site.phone);
  const whatsappUrl = whatsapp ? new URL(whatsapp) : null;
  if (whatsappUrl) whatsappUrl.searchParams.set('text', inquiry);
  const options = [
    { id: 'dialog-email', key: 'email', label: ui.ctaEmail || 'Email', href: site.email ? `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiry)}` : '', external: false },
    { id: 'dialog-whatsapp', key: 'whatsapp', label: 'WhatsApp', href: whatsappUrl?.toString() || '', external: true },
    { id: 'dialog-phone', key: 'phone', label: ui.ctaPhone || 'Call', href: phone, external: false },
  ];
  options.forEach(({ id, key, label, href, external }) => {
    const link = document.querySelector(`#${id}`);
    if (!link) return;
    link.textContent = label;
    link.hidden = !href || contactVisibility[key] === false;
    link.href = href || '#contact';
    if (external && href) {
      link.target = '_blank';
      link.rel = 'noreferrer';
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
  });
  const group = document.querySelector('.dialog-contact-options');
  if (group) group.hidden = !options.some(({ id }) => {
    const link = document.querySelector(`#${id}`);
    return link && !link.hidden;
  });
}

function applySite(site, language = 'ru') {
  if (!site || typeof site !== 'object') return;
  activeSite = site;
  const lang = ['ru', 'en', 'uk'].includes(language) ? language : 'ru';
  const portfolioPage = document.querySelector('.portfolio-page');
  if (portfolioPage) {
    portfolioPage.lang = lang;
    portfolioPage.dataset.language = lang;
  }
  const text = site.translations?.[lang] || site.translations?.ru || {};
  const ui = window.siteUi?.[lang] || window.siteUi?.ru || {};
  applyCookieNoticeLanguage(lang);
  const menuToggle = document.querySelector('.menu-toggle');
  const name = site.artistName || (lang === 'en' ? 'Artist Name' : (lang === 'uk' ? 'Ім’я Прізвище' : 'Имя Фамилия'));
  let city = site.city || '';
  if (city === 'Алматы') city = { en: 'Almaty', uk: 'Алмати' }[lang] || city;

  document.documentElement.style.setProperty('--paper', site.paperColor || '#f4f1e8');
  document.documentElement.style.setProperty('--green', site.greenColor || '#355e52');
  document.documentElement.style.setProperty('--coral', site.accentColor || '#d66e56');
  document.body.style.setProperty('--paper', site.paperColor || '#f4f1e8');
  document.body.style.setProperty('--green', site.greenColor || '#355e52');
  document.body.style.setProperty('--coral', site.accentColor || '#d66e56');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', site.paperColor || '#f4f1e8');
  document.querySelector('meta[name="description"]')?.setAttribute('content', text.aboutText || '');
  document.title = `${name} — ${ui.artist || ''}`;
  const defaultLanguage = ['ru', 'en', 'uk'].find((code) => site.languageVisibility?.[code]) || 'en';
  const canonicalPath = lang === defaultLanguage ? '/' : `/${lang}`;
  const canonicalUrl = new URL(canonicalPath, window.location.origin).toString();
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', text.aboutText || '');
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', { ru: 'ru_RU', en: 'en_US', uk: 'uk_UA' }[lang]);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', text.aboutText || '');

  setText('artist-name', name.toLocaleLowerCase('ru'));
  setText('artist-city', `${ui.artist || ''}${city ? ` · ${city}` : ''}`);
  setText('artist-role', `${ui.artist || ''}${city ? ` · ${city}` : ''}`);
  setBrandMark(document.querySelector('#artist-monogram'), site.logoImage || '', name);
  setBrandMark(document.querySelector('#footer-monogram'), site.logoImage || '', name);
  setText('footer-artist-name', name);
  setText('footer-copyright', ui.copyright || '');
  const developerLabel = ui.developerCredit || 'Developed by';
  setText('developer-credit-label', developerLabel);
  document.querySelector('#developer-credit')?.setAttribute('aria-label', `${developerLabel} Beka Dev`);
  setText('admin-link', `${ui.edit || ''} ↗`);
  setText('nav-works', ui.works);
  setText('nav-about', ui.about);
  setText('nav-contact', ui.contact);
  const instagramLink = document.querySelector('#instagram-link');
  if (instagramLink) {
    instagramLink.hidden = !site.instagram || site.contactVisibility?.instagram === false;
    if (site.instagram) {
      instagramLink.href = site.instagram;
      setIconLinkLabel(instagramLink, ui.instagram);
    }
  }
  setLinkLabel(document.querySelector('#hero-cta'), ui.heroCta);
  setEyebrow('works-eyebrow', ui.studio);
  setEyebrow('about-eyebrow', ui.aboutEyebrow);
  setEyebrow('contact-eyebrow', ui.contactEyebrow);
  setText('about-stamp', ui.stamp);
  setLinkLabel(document.querySelector('#about-cta'), ui.aboutCta);
  setText('dialog-eyebrow', ui.dialogLabel);
  document.querySelector('.dialog-close')?.setAttribute('aria-label', ui.dialogClose || 'Close');
  document.querySelector('.main-nav')?.setAttribute('aria-label', ui.navLabel || 'Navigation');
  document.querySelector('.filters')?.setAttribute('aria-label', ui.filterLabel || 'Filter artworks');
  menuToggle?.setAttribute('aria-label', menuToggle.getAttribute('aria-expanded') === 'true' ? ui.menuClose : ui.menuOpen);

  setTitle(document.querySelector('#hero-title'), text.heroTitle);
  setText('hero-intro', text.heroIntro);
  setTitle(document.querySelector('#works-title'), text.worksTitle);
  setText('works-note', text.worksNote);
  setTitle(document.querySelector('#about-title'), text.aboutTitle);
  setText('about-text', text.aboutText);
  setText('about-text-small', text.aboutTextSmall);
  setTitle(document.querySelector('#contact-title'), text.contactTitle);
  setText('contact-note', text.contactText);

  document.querySelector('#filter-all').firstChild.textContent = `${ui.all} `;
  document.querySelector('#filter-painting').textContent = ui.painting;
  document.querySelector('#filter-graphic').textContent = ui.graphic;
  const languageVisibility = { ru: true, en: true, uk: true, ...(site.languageVisibility || {}) };
  document.querySelectorAll('.language-switch a').forEach((link) => {
    link.hidden = languageVisibility[link.lang] === false;
    if (link.lang === lang && !link.hidden) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const languageSwitch = document.querySelector('#language-switch');
  if (languageSwitch) languageSwitch.hidden = !Object.values(languageVisibility).some(Boolean);

  const artTemplates = [...document.querySelectorAll('#art-template-artworks > svg')];
  const portraitTemplate = document.querySelector('#portrait-template svg');
  const heroArt = document.querySelector('.hero-art');
  setArtImage(heroArt, site.heroImage, artTemplates[0], name);
  const aboutArt = document.querySelector('#about-visual');
  if (site.aboutImage) {
    setArtImage(aboutArt, site.aboutImage, null, name);
    aboutArt.removeAttribute('aria-hidden');
  } else if (portraitTemplate) {
    aboutArt.replaceChildren(portraitTemplate.cloneNode(true));
    aboutArt.setAttribute('aria-hidden', 'true');
  }
  const firstTitle = text.works?.[0]?.title || ui.studio;
  const firstWork = site.works?.[0] || {};
  const firstMedium = text.works?.[0]?.medium || '';
  setText('hero-series', `${ui.series} «${firstTitle}»`);
  setText('hero-art-title', `«${firstTitle}»`);
  setText('hero-art-meta', [firstWork.year, firstMedium].filter(Boolean).join(' · '));
  const methods = [
    ['email', site.email ? `mailto:${site.email}` : '', ui.contactButton, false],
    ['phone', phoneLink(site.phone), ui.callPhone, false],
    ['whatsapp', whatsappLink(site.whatsapp), 'WhatsApp', true],
    ['instagram', site.instagram || '', 'Instagram', true],
    ['facebook', site.facebook || '', 'Facebook', true],
    ['tiktok', site.tiktok || '', 'TikTok', true],
  ];
  methods.forEach(([key, href, label, external]) => {
    const link = document.querySelector(`#contact-link-${key}`);
    if (!link) return;
    link.hidden = !href || site.contactVisibility?.[key] === false;
    if (href) link.href = href;
    if (external) {
      link.target = '_blank';
      link.rel = 'noreferrer';
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
    setIconLinkLabel(link, label);
  });

  renderWorks(site, lang, ui);
  window.currentLanguage = lang;
}

function applyCookieNoticeLanguage(language) {
  const labels = {
    ru: { text: 'Мы используем только необходимые cookie для защиты редактора сайта. Аналитические и рекламные cookie не используются.', link: 'Подробнее о cookie', button: 'Понятно', href: '/ru/cookies' },
    en: { text: 'We use essential cookies only to keep website administration secure. This portfolio does not use analytics or advertising cookies.', link: 'Cookie Notice', button: 'OK', href: '/cookies' },
    uk: { text: 'Ми використовуємо лише необхідні cookie для захисту редактора сайту. Аналітичні та рекламні cookie не використовуються.', link: 'Детальніше про cookie', button: 'Зрозуміло', href: '/uk/cookies' },
  }[language] || {};
  const text = document.querySelector('#cookie-notice-text');
  const link = document.querySelector('#cookie-notice-link');
  const button = document.querySelector('#cookie-notice-dismiss');
  if (text) text.textContent = labels.text || '';
  if (link) { link.textContent = labels.link || 'Cookie Notice'; link.href = labels.href || '/cookies'; }
  if (button) button.textContent = labels.button || 'OK';
}

function currentPageUi() {
  const language = document.querySelector('.portfolio-page')?.dataset.language || document.documentElement.lang || 'ru';
  return window.siteUi?.[language] || window.siteUi?.ru || {};
}

document.addEventListener('click', (event) => {
  const languageLink = event.target.closest('[data-language-link]');
  if (languageLink && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    const language = languageLink.dataset.languageLink;
    if (['ru', 'en', 'uk'].includes(language)) {
      event.preventDefault();
      const target = new URL(languageLink.href, window.location.href);
      if (target.origin === window.location.origin && target.pathname !== window.location.pathname) {
        window.history.pushState({ language }, '', `${target.pathname}${target.search}${target.hash}`);
      }
      applySite(activeSite, language);
    }
    return;
  }

  const closeButton = event.target.closest('.dialog-close');
  if (closeButton) {
    document.querySelector('.art-dialog')?.close();
    return;
  }
  const dialogCta = event.target.closest('.dialog-cta');
  if (dialogCta) {
    document.querySelector('.art-dialog')?.close();
    return;
  }
  const activeDialog = document.querySelector('.art-dialog');
  if (activeDialog && event.target === activeDialog) {
    activeDialog.close();
    return;
  }

  const filterButton = event.target.closest('.filter-button');
  if (filterButton && filterButton.closest('.filters')) {
    filterWorks(filterButton.dataset.filter);
    return;
  }

  const artworkButton = event.target.closest('.artwork-button');
  if (artworkButton && artworkButton.closest('.art-grid')) {
    const title = artworkButton.dataset.title || '';
    const pageLanguage = ['ru', 'en', 'uk'].includes(artworkButton.dataset.language)
      ? artworkButton.dataset.language
      : document.querySelector('.portfolio-page')?.dataset.language || document.documentElement.lang || 'ru';
    const ui = window.siteUi?.[pageLanguage] || window.siteUi?.ru || {};
    document.querySelector('#dialog-title').textContent = title;
    document.querySelector('.dialog-meta').textContent = artworkButton.dataset.meta;
    const description = document.querySelector('.dialog-description');
    description.textContent = artworkButton.dataset.description;
    description.hidden = !description.textContent;
    const artwork = artworkButton.querySelector('.artwork');
    const image = artwork?.querySelector('img, svg');
    document.querySelector('.dialog-art').replaceChildren(image ? image.cloneNode(true) : document.createTextNode(''));
    setWorkInquiryLinks(activeSite, title, ui);
    document.querySelector('.art-dialog')?.showModal();
    return;
  }

  const menuToggle = event.target.closest('.menu-toggle');
  if (menuToggle) {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    const mainNav = document.querySelector('.main-nav');
    const ui = currentPageUi();
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? ui.menuClose : ui.menuOpen);
    mainNav?.classList.toggle('is-open', open);
    return;
  }

  if (event.target.closest('.main-nav a')) {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const ui = currentPageUi();
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', ui.menuOpen || 'Open menu');
    mainNav?.classList.remove('is-open');
  }
});

window.addEventListener('popstate', () => {
  const pathLanguage = window.location.pathname.split('/').filter(Boolean)[0];
  const language = ['ru', 'en', 'uk'].includes(pathLanguage)
    ? pathLanguage
    : ['ru', 'en', 'uk'].find((code) => activeSite.languageVisibility?.[code]) || 'en';
  applySite(activeSite, language);
});

document.addEventListener('keydown', (event) => {
  const activeDialog = document.querySelector('.art-dialog');
  if (event.key === 'Escape' && activeDialog?.open) activeDialog.close();
});

function syncPageLanguage() {
  const language = document.querySelector('.portfolio-page')?.dataset.language;
  if (!['ru', 'en', 'uk'].includes(language)) return;
  window.currentLanguage = language;
}

function initializeCookieNotice() {
  const notice = document.querySelector('[data-cookie-notice]');
  if (!notice) return;
  const storageKey = 'art-site-cookie-notice';
  try {
    if (localStorage.getItem(storageKey) === 'acknowledged') return;
  } catch { /* The notice remains visible if browser storage is unavailable. */ }
  notice.hidden = false;
  notice.querySelector('[data-cookie-dismiss]')?.addEventListener('click', () => {
    try { localStorage.setItem(storageKey, 'acknowledged'); } catch { /* Dismiss for this page view. */ }
    notice.hidden = true;
  });
}

syncPageLanguage();
initializeCookieNotice();
new MutationObserver(syncPageLanguage).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['data-language'],
});

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'ART_SITE_PREVIEW') return;
  applySite(event.data.site, event.data.language || 'ru');
});

