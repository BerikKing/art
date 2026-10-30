import { languages } from './site-data.js';

export const siteUi = {
  ru: { artist: 'Художник', works: 'Работы', about: 'Обо мне', contact: 'Контакты', instagram: 'Instagram', heroCta: 'Смотреть работы', studio: 'Из мастерской', all: 'Все', painting: 'Живопись', graphic: 'Графика', genres: { portrait: 'Портрет', landscape: 'Пейзаж', 'still-life': 'Натюрморт', animalistic: 'Животные', marine: 'Морской пейзаж', interior: 'Интерьер', everyday: 'Сцена из жизни', historical: 'Исторический сюжет', mythological: 'Мифологический сюжет', abstract: 'Абстракция', other: 'Другое' }, aboutEyebrow: 'Немного обо мне', stamp: 'смотреть\nмедленнее', aboutCta: 'Познакомиться ближе', contactEyebrow: 'Есть идея?', contactButton: 'Написать письмо', callPhone: 'Позвонить', ctaEmail: 'Написать на почту', ctaPhone: 'Позвонить', inquirySubject: 'Вопрос о работе', inquiryBody: 'Здравствуйте! Хочу узнать подробнее о работе', dialogLabel: 'Работа из портфолио', dialogClose: 'Закрыть', copyright: 'Все работы защищены авторским правом.', developerCredit: 'Разработал', series: 'Серия', menuOpen: 'Открыть меню', menuClose: 'Закрыть меню', navLabel: 'Главная навигация', filterLabel: 'Фильтр работ', view: 'Посмотреть', edit: 'Редактор сайта' },
  en: { artist: 'Artist', works: 'Works', about: 'About', contact: 'Contact', instagram: 'Instagram', heroCta: 'View works', studio: 'From the studio', all: 'All', painting: 'Painting', graphic: 'Graphic art', genres: { portrait: 'Portrait', landscape: 'Landscape', 'still-life': 'Still life', animalistic: 'Animals', marine: 'Seascape', interior: 'Interior', everyday: 'Everyday scene', historical: 'Historical subject', mythological: 'Mythological subject', abstract: 'Abstract', other: 'Other' }, aboutEyebrow: 'A little about me', stamp: 'look\nclosely', aboutCta: 'Get to know me', contactEyebrow: 'Have an idea?', contactButton: 'Send an email', callPhone: 'Call', ctaEmail: 'Email about this work', ctaPhone: 'Call', inquirySubject: 'Artwork inquiry', inquiryBody: 'Hello! I would like to know more about this artwork', dialogLabel: 'Work from the portfolio', dialogClose: 'Close', copyright: 'All artworks are protected by copyright.', developerCredit: 'Developed by', series: 'Series', menuOpen: 'Open menu', menuClose: 'Close menu', navLabel: 'Main navigation', filterLabel: 'Filter artworks', view: 'View', edit: 'Edit site' },
  uk: { artist: 'Художниця', works: 'Роботи', about: 'Про мене', contact: 'Контакти', instagram: 'Instagram', heroCta: 'Переглянути роботи', studio: 'З майстерні', all: 'Усі', painting: 'Живопис', graphic: 'Графіка', genres: { portrait: 'Портрет', landscape: 'Пейзаж', 'still-life': 'Натюрморт', animalistic: 'Тварини', marine: 'Морський пейзаж', interior: 'Інтер’єр', everyday: 'Побутова сцена', historical: 'Історичний сюжет', mythological: 'Міфологічний сюжет', abstract: 'Абстракція', other: 'Інше' }, aboutEyebrow: 'Трохи про мене', stamp: 'дивитися\nуважніше', aboutCta: 'Познайомитися ближче', contactEyebrow: 'Є ідея?', contactButton: 'Написати листа', callPhone: 'Зателефонувати', ctaEmail: 'Написати про роботу', ctaPhone: 'Зателефонувати', inquirySubject: 'Питання про роботу', inquiryBody: 'Вітаю! Хочу дізнатися більше про роботу', dialogLabel: 'Робота з портфоліо', dialogClose: 'Закрити', copyright: 'Усі роботи захищені авторським правом.', developerCredit: 'Розробив', series: 'Серія', menuOpen: 'Відкрити меню', menuClose: 'Закрити меню', navLabel: 'Головна навігація', filterLabel: 'Фільтр робіт', view: 'Переглянути', edit: 'Редактор сайту' },
};

export function defaultLanguage(site) {
  return languages.find((language) => site.languageVisibility?.[language]) || 'en';
}

export function getArtistName(site, language) {
  return site.artistName || ({ ru: 'Имя Фамилия', en: 'Artist Name', uk: 'Ім’я Прізвище' }[language] || 'Artist Name');
}

export function getCity(site, language) {
  if (site.city !== 'Алматы') return site.city || '';
  return { ru: 'Алматы', en: 'Almaty', uk: 'Алмати' }[language];
}
