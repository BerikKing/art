const authScreen = document.querySelector('#auth-screen');
const editorShell = document.querySelector('#editor-shell');
const form = document.querySelector('#site-form');
const saveStatus = document.querySelector('#save-status');
const previewFrame = document.querySelector('#site-preview');
const apiEndpoint = '/api';
const languages = ['ru', 'en', 'uk'];
const sessionIdleMs = 10 * 60 * 1000;
const sessionTouchIntervalMs = 60 * 1000;
const sessionActivityStorageKey = 'art-site-admin-last-activity';
const translatedFields = ['heroTitle', 'heroIntro', 'worksTitle', 'worksNote', 'aboutTitle', 'aboutText', 'aboutTextSmall', 'contactTitle', 'contactText'];
const artworkGenres = ['portrait', 'landscape', 'still-life', 'animalistic', 'marine', 'interior', 'everyday', 'historical', 'mythological', 'abstract', 'other'];
const adminLabels = {
  pageTitle: ['Редактор сайта', 'Website editor', 'Редактор сайту'], brand: ['Мастерская', 'Studio', 'Майстерня'], brandSub: ['редактор сайта', 'website editor', 'редактор сайту'],
  logout: ['Выйти', 'Log out', 'Вийти'], save: ['Сохранить', 'Save', 'Зберегти'], saveSite: ['Сохранить сайт', 'Save website', 'Зберегти сайт'],
  adminLanguage: ['Язык админки', 'Admin language', 'Мова адмінпанелі'], adminLanguageGroup: ['Язык админки', 'Admin language', 'Мова адмінпанелі'],
  changePassword: ['Сменить пароль', 'Change password', 'Змінити пароль'], changePasswordTitle: ['Сменить пароль', 'Change password', 'Змінити пароль'],
  accountSecurity: ['БЕЗОПАСНОСТЬ', 'ACCOUNT SECURITY', 'БЕЗПЕКА'], passwordIntro: ['Для смены пароля сначала введи текущий пароль.', 'Enter your current password to continue.', 'Щоб змінити пароль, спочатку введіть поточний.'],
  currentPassword: ['Текущий пароль', 'Current password', 'Поточний пароль'], newPassword: ['Новый пароль', 'New password', 'Новий пароль'], repeatNewPassword: ['Повтори новый пароль', 'Repeat new password', 'Повторіть новий пароль'],
  cancel: ['Отмена', 'Cancel', 'Скасувати'], savePassword: ['Сохранить пароль', 'Save password', 'Зберегти пароль'], closeDialog: ['Закрыть', 'Close', 'Закрити'],
  passwordSaving: ['Сохраняю новый пароль…', 'Saving new password…', 'Зберігаю новий пароль…'], passwordChanged: ['Пароль изменён', 'Password changed', 'Пароль змінено'],
  passwordMismatch: ['Пароли не совпадают.', 'The passwords do not match.', 'Паролі не збігаються.'], passwordTooShort: ['Новый пароль должен содержать не менее 12 символов.', 'The new password must be at least 12 characters.', 'Новий пароль має містити щонайменше 12 символів.'],
  wrongCurrentPassword: ['Неверный текущий пароль.', 'The current password is incorrect.', 'Поточний пароль неправильний.'], passwordSaveError: ['Не удалось сохранить новый пароль. Проверьте права на папку data.', 'Could not save the new password. Check write access to the data folder.', 'Не вдалося зберегти новий пароль. Перевірте права запису до папки data.'],
  siteLanguage: ['Язык сайта', 'Website language', 'Мова сайту'], siteLanguageGroup: ['Язык сайта', 'Website language', 'Мова сайту'],
  yourSite: ['Ваш сайт', 'Your website', 'Ваш сайт'], panelTitle: ['Настройте<br /><em>по-своему</em>', 'Make it<br /><em>your own</em>', 'Налаштуйте<br /><em>на свій смак</em>'],
  panelIntro: ['Меняйте тексты, палитру и изображения. Справа можно сразу увидеть результат.', 'Edit the text, colors, and images. See the result in the preview on the right.', 'Змінюйте тексти, палітру та зображення. Результат одразу видно праворуч.'],
  siteSettings: ['Настройки сайта', 'Website settings', 'Налаштування сайту'], mainSection: ['Главная', 'Home', 'Головна'], colorsSection: ['Цвета', 'Colors', 'Кольори'],
  gallerySection: ['Галерея', 'Gallery', 'Галерея'], aboutSection: ['О художнике', 'About the artist', 'Про художника'], contactsSection: ['Контакты', 'Contacts', 'Контакти'],
  legalSection: ['Правовая информация', 'Legal information', 'Правова інформація'], legalHint: ['Для сайта в Великобритании заполните эти данные до начала продаж. Email берётся из раздела «Контакты».', 'For a UK website, complete these details before taking orders. The email address comes from the Contacts section.', 'Для сайту у Великій Британії заповніть ці дані до початку продажів. Email береться з розділу «Контакти».'], legalName: ['Юридическое имя / название бизнеса', 'Legal name / business name', 'Юридичне ім’я / назва бізнесу'], businessAddress: ['Адрес для публикации', 'Business address for publication', 'Адреса для публікації'], companyNumber: ['Company number (если есть)', 'Company number (if applicable)', 'Company number (за наявності)'], vatNumber: ['VAT number (если есть)', 'VAT number (if applicable)', 'VAT number (за наявності)'],
  artistName: ['Имя художника', 'Artist name', 'Ім’я художника'], artistNamePlaceholder: ['Имя Фамилия', 'Name Surname', 'Ім’я Прізвище'], city: ['Город', 'City', 'Місто'], cityPlaceholder: ['Алматы', 'Almaty', 'Алмати'],
  logoPhoto: ['Логотип (фото)', 'Logo (photo)', 'Логотип (фото)'], logoHint: ['Лучше квадратное изображение. JPG, PNG или WebP до 8 МБ — фото оптимизируется при загрузке', 'A square image works best. JPG, PNG, or WebP, up to 8 MB — optimized on upload', 'Найкраще квадратне зображення. JPG, PNG або WebP до 8 МБ — фото оптимізується під час завантаження'],
  upload: ['Загрузить', 'Upload', 'Завантажити'], remove: ['Убрать', 'Remove', 'Прибрати'], headerLanguages: ['Языки в шапке сайта', 'Languages in the site header', 'Мови у шапці сайту'],
  heroTitle: ['Заголовок на первом экране', 'Main headline', 'Заголовок на першому екрані'], heroTitlePlaceholder: ['Замечать\nто, что мимо', 'Noticing\nwhat others miss', 'Помічати\nте, що повз'],
  lineBreakHint: ['Перенос строки задаёт перенос в заголовке.', 'A line break creates a new line in the headline.', 'Перенесення рядка створює новий рядок у заголовку.'], shortDescription: ['Короткое описание', 'Short introduction', 'Короткий опис'],
  heroCover: ['Обложка главной', 'Homepage cover', 'Обкладинка головної сторінки'], imageLimit: ['JPG, PNG или WebP до 8 МБ — фото оптимизируется при загрузке', 'JPG, PNG, or WebP, up to 8 MB — optimized on upload', 'JPG, PNG або WebP до 8 МБ — фото оптимізується під час завантаження'],
  backgroundColor: ['Фон сайта', 'Page background', 'Фон сайту'], primaryColor: ['Основной цвет', 'Primary color', 'Основний колір'], accentColor: ['Акцентный цвет', 'Accent color', 'Акцентний колір'],
  sectionTitle: ['Заголовок раздела', 'Section heading', 'Заголовок розділу'], headingCaption: ['Подпись под заголовком', 'Caption below the heading', 'Підпис під заголовком'],
  addWork: ['＋ Добавить работу', '＋ Add artwork', '＋ Додати роботу'], worksLimit: ['Можно добавить до 30 работ. JPG, PNG и WebP до 8 МБ — фото оптимизируется при загрузке.', 'Add up to 30 artworks. JPG, PNG, or WebP up to 8 MB — optimized on upload.', 'Можна додати до 30 робіт. JPG, PNG і WebP до 8 МБ — фото оптимізується під час завантаження.'],
  heading: ['Заголовок', 'Heading', 'Заголовок'], mainText: ['Основной текст', 'Main text', 'Основний текст'], shortCaption: ['Короткая подпись', 'Short caption', 'Короткий підпис'],
  portraitStudio: ['Портрет или фото мастерской', 'Portrait or studio photo', 'Портрет або фото майстерні'], text: ['Текст', 'Text', 'Текст'], email: ['Почта', 'Email', 'Пошта'], phone: ['Номер телефона', 'Phone number', 'Номер телефону'], phoneHint: ['Укажи номер с кодом страны.', 'Include the country code.', 'Вкажіть номер із кодом країни.'], show: ['Показывать', 'Show', 'Показувати'],
  whatsappHint: ['Укажи номер с кодом страны или ссылку wa.me.', 'Enter a number with its country code or a wa.me link.', 'Вкажіть номер із кодом країни або посилання wa.me.'],
  contactVisibilityHint: ['Сними галочку, чтобы скрыть канал на сайте. Если ссылка или номер не указаны, канал всё равно не появится.', 'Uncheck to hide a contact. A channel also stays hidden when its link or number is empty.', 'Зніміть позначку, щоб приховати контакт. Без посилання або номера канал також не з’явиться.'],
  saveHint: ['Предпросмотр обновляется сразу. Удаление фото вступит в силу после сохранения сайта.', 'The preview updates right away. Photo removal goes live after you save the website.', 'Попередній перегляд оновлюється одразу. Видалення фото набуде чинності після збереження сайту.'],
  previewSite: ['Предпросмотр сайта', 'Website preview', 'Попередній перегляд сайту'], openSeparately: ['Открыть отдельно ↗', 'Open separately ↗', 'Відкрити окремо ↗'],
  previewArtist: ['Предпросмотр сайта художника', 'Artist website preview', 'Попередній перегляд сайту художника'],
  previewHint: ['Предпросмотр интерактивный: можно прокручивать страницу и открывать работы.', 'The preview is interactive: scroll the page and open artworks.', 'Попередній перегляд інтерактивний: прокручуйте сторінку та відкривайте роботи.'],
  work: ['Работа', 'Artwork', 'Робота'], title: ['Название', 'Title', 'Назва'], category: ['Вид работы', 'Type', 'Вид роботи'], painting: ['Живопись', 'Painting', 'Живопис'], graphic: ['Графика', 'Graphic art', 'Графіка'], genre: ['Жанр', 'Genre', 'Жанр'], noGenre: ['Не указан', 'Not specified', 'Не вказано'],
  portrait: ['Портрет', 'Portrait', 'Портрет'], landscape: ['Пейзаж', 'Landscape', 'Пейзаж'], stillLife: ['Натюрморт', 'Still life', 'Натюрморт'], animalistic: ['Животные', 'Animals', 'Тварини'], marine: ['Морской пейзаж', 'Seascape', 'Морський пейзаж'], interior: ['Интерьер', 'Interior', 'Інтер’єр'], everyday: ['Сцена из жизни', 'Everyday scene', 'Побутова сцена'], historical: ['Исторический сюжет', 'Historical subject', 'Історичний сюжет'], mythological: ['Мифологический сюжет', 'Mythological subject', 'Міфологічний сюжет'], abstract: ['Абстракция', 'Abstract', 'Абстракція'], other: ['Другое', 'Other', 'Інше'],
  year: ['Год', 'Year', 'Рік'], medium: ['Материал / техника', 'Medium / technique', 'Матеріал / техніка'], dimensions: ['Размер', 'Size', 'Розмір'], description: ['Описание', 'Description', 'Опис'], image: ['Изображение', 'Image', 'Зображення'],
  up: ['Переместить вверх', 'Move up', 'Перемістити вгору'], down: ['Переместить вниз', 'Move down', 'Перемістити вниз'], delete: ['Удалить', 'Delete', 'Видалити'], workImage: ['Изображение работы', 'Artwork image', 'Зображення роботи'],
  savedAll: ['Все изменения сохранены', 'All changes are saved', 'Усі зміни збережено'], unsaved: ['Есть несохранённые изменения', 'You have unsaved changes', 'Є незбережені зміни'], saving: ['Сохраняю…', 'Saving…', 'Зберігаю…'], saved: ['Сайт сохранён', 'Website saved', 'Сайт збережено'],
  fileTooLarge: ['Файл больше 8 МБ', 'File is larger than 8 MB', 'Файл більший за 8 МБ'], uploading: ['Загружаю и оптимизирую изображение…', 'Uploading and optimizing image…', 'Завантажую й оптимізую зображення…'], imageAdded: ['Изображение оптимизировано и добавлено — сохраните сайт', 'Image optimized and added — save the website', 'Зображення оптимізовано й додано — збережіть сайт'], limitReached: ['Достигнут лимит в 30 работ', 'The 30 artwork limit has been reached', 'Досягнуто ліміту у 30 робіт'],
  authSetupTitle: ['Настроим', 'Let’s set up', 'Налаштуймо'], authLoginTitle: ['С возвращением', 'Welcome back', 'З поверненням'],
  sessionExpired: ['Сессия истекла из-за бездействия. Войдите снова.', 'Your session expired after inactivity. Please log in again.', 'Сеанс завершився через бездіяльність. Увійдіть знову.'],
  serverUnavailable: ['Не удалось связаться с сервером Next.js. Проверьте, что он запущен, и обновите страницу.', 'Could not connect to the Next.js server. Make sure it is running, then reload the page.', 'Не вдалося зв’язатися із сервером Next.js. Переконайтеся, що він запущений, і оновіть сторінку.'],
  wrongPassword: ['Неверный пароль.', 'Incorrect password.', 'Неправильний пароль.'],
  showPassword: ['Показать пароль', 'Show password', 'Показати пароль'], hidePassword: ['Скрыть пароль', 'Hide password', 'Приховати пароль'],
  authAdmin: ['вашу админку', 'your admin panel', 'вашу адмінпанель'], authArtist: ['художник', 'artist', 'художнику'],
  authSetupText: ['Придумайте пароль администратора. После настройки только вы сможете менять содержимое сайта.', 'Create an administrator password. After setup, only you can edit the website.', 'Створіть пароль адміністратора. Після налаштування лише ви зможете змінювати сайт.'],
  authLoginText: ['Введите пароль, чтобы открыть редактор сайта.', 'Enter your password to open the website editor.', 'Введіть пароль, щоб відкрити редактор сайту.'],
  password: ['Пароль', 'Password', 'Пароль'], confirmPassword: ['Повторите пароль', 'Confirm password', 'Повторіть пароль'],
  createPassword: ['Создать пароль и открыть редактор', 'Create password and open editor', 'Створити пароль і відкрити редактор'],
  login: ['Войти в редактор', 'Log in to editor', 'Увійти до редактора'], creating: ['Создаём…', 'Creating…', 'Створюю…'], loggingIn: ['Входим…', 'Signing in…', 'Входжу…'],
  passwordHint: ['Используйте не менее 12 символов и сохраните пароль в надёжном месте.', 'Use at least 12 characters and keep the password somewhere safe.', 'Використовуйте щонайменше 12 символів і збережіть пароль у надійному місці.'],
};
function getStoredAdminLanguage() {
  try { const value = localStorage.getItem('art-site-admin-language'); return languages.includes(value) ? value : 'en'; } catch { return 'en'; }
}
let adminLanguage = getStoredAdminLanguage();
let loginLanguages = [adminLanguage];
let loginLanguage = adminLanguage;
let csrfToken = "";
let savedSnapshot = "";
let activeLanguage = "ru";
let draftSite = null;
let sessionIdleTimer = 0;
let lastSessionTouch = 0;
let lastActivityPublish = 0;

function adminText(key, language = adminLanguage) {
  return adminLabels[key]?.[languages.indexOf(language)] || adminLabels[key]?.[0] || key;
}

function updatePasswordVisibilityLabel(input, button, language) {
  const visible = input.type === 'text';
  const label = adminText(visible ? 'hidePassword' : 'showPassword', language);
  button.setAttribute('aria-label', label);
  button.title = label;
  button.setAttribute('aria-pressed', String(visible));
  button.classList.toggle('is-visible', visible);
}

function addPasswordVisibility(container, getLanguage = () => adminLanguage) {
  container.querySelectorAll('input[type="password"]').forEach((input) => {
    if (input.dataset.visibilityToggle === 'attached') return;
    input.dataset.visibilityToggle = 'attached';
    const wrapper = document.createElement('span');
    wrapper.className = 'password-input-wrap';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.append(input);

    const button = document.createElement('button');
    button.className = 'password-visibility-toggle';
    button.type = 'button';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg>';
    const updateLabel = () => updatePasswordVisibilityLabel(input, button, getLanguage());
    button.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      updateLabel();
      input.focus();
    });
    wrapper.append(button);
    updateLabel();
  });
}

function useSiteLanguagesForLogin(site) {
  const visibility = site?.languageVisibility || {};
  const visibleLanguages = languages.filter((language) => visibility[language] === true);
  loginLanguages = visibleLanguages.length ? visibleLanguages : ['en'];
  loginLanguage = loginLanguages.includes(adminLanguage) ? adminLanguage : loginLanguages[0];
}

async function refreshLoginLanguages() {
  try {
    const response = await fetch(`${apiEndpoint}?action=public`, { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error('Could not load website languages.');
    useSiteLanguagesForLogin(result.site);
  } catch {
    loginLanguages = [adminLanguage];
    loginLanguage = adminLanguage;
  }
}

function sharedLastActivity() {
  try { return Number(localStorage.getItem(sessionActivityStorageKey)) || 0; } catch { return 0; }
}

function publishAdminActivity(time = Date.now()) {
  try { localStorage.setItem(sessionActivityStorageKey, String(time)); } catch { /* Cross-tab sync is optional. */ }
}

function stopSessionIdleTimer() {
  window.clearTimeout(sessionIdleTimer);
  sessionIdleTimer = 0;
}

function armSessionIdleTimer(time = Date.now()) {
  if (editorShell.hidden) return;
  stopSessionIdleTimer();
  const lastActivity = Math.max(time, sharedLastActivity());
  const remaining = Math.max(0, sessionIdleMs - (Date.now() - lastActivity));
  sessionIdleTimer = window.setTimeout(() => expireAdminSession(), remaining);
}

function expireAdminSession(message = adminText('sessionExpired')) {
  if (editorShell.hidden) return;
  stopSessionIdleTimer();
  csrfToken = '';
  showAuth('login', message);
}

function recordAdminActivity() {
  if (editorShell.hidden) return;
  const now = Date.now();
  if (now - lastActivityPublish >= 1000) {
    publishAdminActivity(now);
    lastActivityPublish = now;
  }
  armSessionIdleTimer(now);
  if (now - lastSessionTouch < sessionTouchIntervalMs) return;
  lastSessionTouch = now;
  getState().then((state) => {
    if (!state.authenticated) {
      expireAdminSession(adminText('sessionExpired'));
      return;
    }
    if (state.csrf) csrfToken = state.csrf;
  }).catch(() => {});
}

function handlePreviewLoad() {
  updatePreview();
  try {
    const previewDocument = previewFrame.contentDocument;
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((eventName) => {
      previewDocument.addEventListener(eventName, recordAdminActivity, { passive: true, capture: true });
    });
  } catch { /* The preview may not be available yet. */ }
}

function applyAdminLanguage(language) {
  adminLanguage = languages.includes(language) ? language : 'ru';
  document.documentElement.lang = adminLanguage;
  try { localStorage.setItem('art-site-admin-language', adminLanguage); } catch { /* Storage may be disabled. */ }
  document.querySelectorAll('[data-admin-key]').forEach((element) => { element.textContent = adminText(element.dataset.adminKey); });
  document.querySelectorAll('[data-admin-html]').forEach((element) => { element.innerHTML = adminText(element.dataset.adminHtml); });
  document.querySelectorAll('[data-admin-placeholder]').forEach((element) => { element.setAttribute('placeholder', adminText(element.dataset.adminPlaceholder)); });
  document.querySelectorAll('[data-admin-aria]').forEach((element) => { element.setAttribute('aria-label', adminText(element.dataset.adminAria)); });
  document.querySelectorAll('[data-admin-title]').forEach((element) => { element.setAttribute('title', adminText(element.dataset.adminTitle)); });
  document.querySelectorAll('.password-input-wrap').forEach((wrapper) => {
    const input = wrapper.querySelector('input');
    const button = wrapper.querySelector('.password-visibility-toggle');
    if (input && button) updatePasswordVisibilityLabel(input, button, adminLanguage);
  });
  document.title = adminText('pageTitle');
  document.querySelectorAll('[data-admin-language]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.adminLanguage === adminLanguage)); });
  if (saveStatus.dataset.statusKey) saveStatus.textContent = adminText(saveStatus.dataset.statusKey);
}

function selectAdminLanguage(language) {
  if (!languages.includes(language)) return;
  if (draftSite) draftSite = collectCurrentSite();
  applyAdminLanguage(language);
  if (draftSite) renderWorkList(draftSite);
}

async function apiRequest(action, payload = {}) {
  const response = await fetch(`${apiEndpoint}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
    body: JSON.stringify({ action, ...payload }),
    credentials: 'same-origin',
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || 'Не удалось выполнить запрос.');
  return result;
}

async function getState() {
  const response = await fetch(`${apiEndpoint}?action=state`, { credentials: 'same-origin', cache: 'no-store' });
  return response.json();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function showAuth(mode, message = '') {
  editorShell.hidden = true;
  authScreen.hidden = false;
  const setup = mode === 'setup';
  const authText = (key) => adminText(key, loginLanguage);
  const authMessage = message === 'Неверный пароль.' || message === 'wrongPassword'
    ? authText('wrongPassword')
    : message === 'sessionExpired'
      ? authText('sessionExpired')
      : message;
  document.documentElement.lang = loginLanguage;
  document.title = authText('pageTitle');
  const languageButtons = loginLanguages.map((language) => `
    <button type="button" data-auth-language="${language}" aria-pressed="${loginLanguage === language}"${loginLanguages.length === 1 ? ' disabled' : ''}>${language.toUpperCase()}</button>
  `).join('');
  authScreen.innerHTML = `
    <section class="auth-card">
      <div class="auth-language-tabs" role="group" aria-label="${escapeHtml(authText('adminLanguage'))}"><span>${escapeHtml(authText('adminLanguage'))}</span>${languageButtons}</div>
      <div class="auth-mark" aria-hidden="true">✳</div>
      <h1>${escapeHtml(authText(setup ? 'authSetupTitle' : 'authLoginTitle'))},<br /><em>${escapeHtml(authText(setup ? 'authAdmin' : 'authArtist'))}</em></h1>
      <p>${escapeHtml(authText(setup ? 'authSetupText' : 'authLoginText'))}</p>
      <form id="auth-form">
        <label>${escapeHtml(authText('password'))}<input name="password" type="password" autocomplete="${setup ? 'new-password' : 'current-password'}" required ${setup ? 'minlength="12"' : ''} /></label>
        ${setup ? `<label>${escapeHtml(authText('confirmPassword'))}<input name="confirmPassword" type="password" autocomplete="new-password" required minlength="12" /></label>` : ''}
        <div class="auth-error" role="alert">${escapeHtml(authMessage)}</div>
        <button class="button button-primary" type="submit">${escapeHtml(authText(setup ? 'createPassword' : 'login'))}</button>
      </form>
      ${setup ? `<div class="auth-hint">${escapeHtml(authText('passwordHint'))}</div>` : ''}
    </section>`;

  addPasswordVisibility(authScreen, () => loginLanguage);
  authScreen.querySelectorAll('[data-auth-language]').forEach((button) => {
    button.addEventListener('click', () => {
      loginLanguage = button.dataset.authLanguage;
      applyAdminLanguage(loginLanguage);
      showAuth(mode, message);
    });
  });
  const authForm = authScreen.querySelector('form');
  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = authForm.elements.password.value;
    if (setup && password !== authForm.elements.confirmPassword.value) {
      authScreen.querySelector('.auth-error').textContent = authText('passwordMismatch');
      return;
    }
    const button = authForm.querySelector('button');
    button.disabled = true;
    button.textContent = authText(setup ? 'creating' : 'loggingIn');
    try {
      const result = await apiRequest(setup ? 'setup' : 'login', { password });
      csrfToken = result.csrf;
      const publicResponse = await fetch(`${apiEndpoint}?action=public`, { cache: 'no-store' });
      const publicData = await publicResponse.json();
      openEditor(publicData.site);
    } catch (error) {
      showAuth(mode, error.message === 'Неверный пароль.' ? 'wrongPassword' : error.message);
    }
  });
  authScreen.querySelector('input[name="password"]').focus();
}

function showImagePreview(container, path, alt = adminText('image')) {
  container.replaceChildren();
  container.classList.toggle('has-image', Boolean(path));
  if (!path) return;
  const image = document.createElement('img');
  const filename = String(path || '').split('/').pop();
  image.src = filename ? `/media/${filename}` : '';
  image.alt = alt;
  container.append(image);
}

function blankWorkTranslation(language, index) {
  const titles = { ru: 'Новая работа', en: 'New artwork', uk: 'Нова робота' };
  return { title: titles[language] || `Artwork ${index + 1}`, medium: '', description: '' };
}

function normalizeDraft(site) {
  const result = JSON.parse(JSON.stringify(site || {}));
  result.works = Array.isArray(result.works) ? result.works : [];
  result.translations = result.translations || {};
  result.logoImage = result.logoImage || '';
  result.languageVisibility = result.languageVisibility && typeof result.languageVisibility === 'object'
    ? { ru: true, en: true, uk: true, ...result.languageVisibility }
    : (result.showLanguageSwitch === false ? { ru: false, en: false, uk: false } : { ru: true, en: true, uk: true });
  result.contactVisibility = { email: true, phone: true, instagram: true, whatsapp: false, facebook: false, tiktok: false, ...(result.contactVisibility || {}) };
  languages.forEach((language) => {
    result.translations[language] = result.translations[language] || {};
    result.translations[language].works = Array.isArray(result.translations[language].works) ? result.translations[language].works : [];
    translatedFields.forEach((field) => { result.translations[language][field] = result.translations[language][field] || ''; });
    while (result.translations[language].works.length < result.works.length) {
      result.translations[language].works.push(blankWorkTranslation(language, result.translations[language].works.length));
    }
    result.translations[language].works = result.translations[language].works.slice(0, result.works.length);
  });
  return result;
}

function renderWorkList(site) {
  const list = document.querySelector('#work-list');
  const localWorks = site.translations[activeLanguage].works;
  list.innerHTML = '';
  site.works.forEach((work, index) => {
    const translated = localWorks[index] || blankWorkTranslation(activeLanguage, index);
    const card = document.createElement('article');
    card.className = 'work-editor';
    card.dataset.image = work.image || '';
    card.dataset.artworkIndex = String(Number.isInteger(work.artworkIndex) ? work.artworkIndex : index % 4);
    card.innerHTML = `
      <div class="work-editor-head"><strong>${adminText('work')} ${String(index + 1).padStart(2, '0')}</strong><div class="work-actions"><button class="move-work" type="button" data-move-work="-1" aria-label="${escapeHtml(adminText('up'))}" ${index === 0 ? 'disabled' : ''}>↑</button><button class="move-work" type="button" data-move-work="1" aria-label="${escapeHtml(adminText('down'))}" ${index === site.works.length - 1 ? 'disabled' : ''}>↓</button><button class="remove-work" type="button" data-remove-work>${adminText('delete')}</button></div></div>
      <div class="work-fields">
        <label class="wide">${adminText('title')}<input data-work-local="title" maxlength="120" value="${escapeHtml(translated.title || '')}" /></label>
        <label>${adminText('category')}<select data-work-common="category"><option value="painting" ${work.category === 'painting' ? 'selected' : ''}>${adminText('painting')}</option><option value="graphic" ${work.category === 'graphic' ? 'selected' : ''}>${adminText('graphic')}</option></select></label>
        <label>${adminText('genre')}<select data-work-common="genre"><option value="" ${!work.genre ? 'selected' : ''}>${adminText('noGenre')}</option>${artworkGenres.map((genre) => `<option value="${genre}" ${work.genre === genre ? 'selected' : ''}>${adminText(genre === 'still-life' ? 'stillLife' : genre)}</option>`).join('')}</select></label>
        <label>${adminText('year')}<input data-work-common="year" inputmode="numeric" maxlength="4" value="${escapeHtml(work.year || '')}" /></label>
        <label>${adminText('medium')}<input data-work-local="medium" maxlength="100" value="${escapeHtml(translated.medium || '')}" placeholder="${escapeHtml(adminLanguage === 'en' ? 'oil, canvas; pencil, paper' : (adminLanguage === 'uk' ? 'олія, полотно; олівець, папір' : 'масло, холст; карандаш, бумага'))}" /></label>
        <label>${adminText('dimensions')}<input data-work-common="dimensions" maxlength="60" value="${escapeHtml(work.dimensions || '')}" placeholder="${adminLanguage === 'en' ? '60 × 80 cm' : '60 × 80 см'}" /></label>
        <label class="wide">${adminText('description')}<textarea data-work-local="description" rows="2" maxlength="500">${escapeHtml(translated.description || '')}</textarea></label>
        <div class="work-upload">
          <div class="work-image-preview"></div>
          <label>${adminText('image')}<input type="file" accept="image/jpeg,image/png,image/webp" data-work-image /></label>
          <button class="clear-image" type="button" data-clear-work-image>${adminText('remove')}</button>
          <small>${adminText('imageLimit')}</small>
        </div>
      </div>`;
    showImagePreview(card.querySelector('.work-image-preview'), work.image || '', `${adminText('workImage')} ${translated.title || ''}`);
    list.append(card);
  });
}

function fillLocalizedFields(site) {
  const translation = site.translations[activeLanguage];
  form.querySelectorAll('[data-i18n-field]').forEach((field) => {
    field.value = translation[field.dataset.i18nField] || '';
  });
  document.querySelectorAll('[data-edit-language]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.editLanguage === activeLanguage));
  });
  renderWorkList(site);
}

function fillEditor(site, language = activeLanguage) {
  draftSite = normalizeDraft(site);
  activeLanguage = languages.includes(language) ? language : 'ru';
  const globalFields = ['artistName', 'city', 'legalName', 'businessAddress', 'companyNumber', 'vatNumber', 'logoImage', 'heroImage', 'aboutImage', 'email', 'phone', 'instagram', 'whatsapp', 'facebook', 'tiktok', 'paperColor', 'greenColor', 'accentColor'];
  globalFields.forEach((name) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = draftSite[name] ?? '';
  });
  Object.keys(draftSite.contactVisibility).forEach((key) => {
    const fieldName = `contactVisible${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    const checkbox = form.elements.namedItem(fieldName);
    if (checkbox) checkbox.checked = Boolean(draftSite.contactVisibility[key]);
  });
  Object.keys(draftSite.languageVisibility).forEach((language) => {
    const fieldName = `languageVisible${language.charAt(0).toUpperCase()}${language.slice(1)}`;
    const checkbox = form.elements.namedItem(fieldName);
    if (checkbox) checkbox.checked = Boolean(draftSite.languageVisibility[language]);
  });
  showImagePreview(document.querySelector('#logoImage-preview'), draftSite.logoImage || '', adminText('logoPhoto'));
  showImagePreview(document.querySelector('#heroImage-preview'), draftSite.heroImage || '', adminText('heroCover'));
  showImagePreview(document.querySelector('#aboutImage-preview'), draftSite.aboutImage || '', adminText('portraitStudio'));
  fillLocalizedFields(draftSite);
}

function collectCurrentSite() {
  const current = JSON.parse(JSON.stringify(draftSite));
  const get = (name) => String(form.elements.namedItem(name)?.value || '').trim();
  ['artistName', 'city', 'legalName', 'businessAddress', 'companyNumber', 'vatNumber', 'logoImage', 'heroImage', 'aboutImage', 'email', 'phone', 'instagram', 'whatsapp', 'facebook', 'tiktok', 'paperColor', 'greenColor', 'accentColor'].forEach((key) => { current[key] = get(key); });
  current.languageVisibility = {};
  ['ru', 'en', 'uk'].forEach((language) => {
    const fieldName = `languageVisible${language.charAt(0).toUpperCase()}${language.slice(1)}`;
    current.languageVisibility[language] = Boolean(form.elements.namedItem(fieldName)?.checked);
  });
  current.contactVisibility = {};
  ['email', 'phone', 'instagram', 'whatsapp', 'facebook', 'tiktok'].forEach((key) => {
    const fieldName = `contactVisible${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    current.contactVisibility[key] = Boolean(form.elements.namedItem(fieldName)?.checked);
  });
  const translation = current.translations[activeLanguage];
  form.querySelectorAll('[data-i18n-field]').forEach((field) => { translation[field.dataset.i18nField] = field.value.trim(); });
  current.works = [];
  translation.works = [];
  document.querySelectorAll('.work-editor').forEach((card, index) => {
    const common = (key) => card.querySelector(`[data-work-common="${key}"]`)?.value.trim() || '';
    const local = (key) => card.querySelector(`[data-work-local="${key}"]`)?.value.trim() || '';
    current.works.push({
      category: common('category') === 'graphic' ? 'graphic' : 'painting',
      genre: artworkGenres.includes(common('genre')) ? common('genre') : '',
      year: common('year'),
      dimensions: common('dimensions'),
      image: card.dataset.image || '',
      artworkIndex: Number(card.dataset.artworkIndex || index % 4),
    });
    translation.works.push({ title: local('title'), medium: local('medium'), description: local('description') });
  });
  return current;
}

function setStatus(text, dirty = false, translationKey = '') {
  if (translationKey) {
    saveStatus.dataset.statusKey = translationKey;
    saveStatus.textContent = adminText(translationKey);
  } else {
    delete saveStatus.dataset.statusKey;
    saveStatus.textContent = text;
  }
  saveStatus.classList.toggle('is-dirty', dirty);
}

function passwordErrorText(message) {
  const keys = {
    'Неверный текущий пароль.': 'wrongCurrentPassword',
    'Новый пароль должен содержать не менее 12 символов.': 'passwordTooShort',
    'Не удалось сохранить новый пароль. Проверьте права на папку data.': 'passwordSaveError',
  };
  return keys[message] ? adminText(keys[message]) : message;
}

function updatePreview() {
  if (!draftSite) return;
  draftSite = collectCurrentSite();
  const snapshot = JSON.stringify(draftSite);
  const hasChanges = snapshot !== savedSnapshot;
  setStatus('', hasChanges, hasChanges ? 'unsaved' : 'savedAll');
  if (previewFrame.contentWindow) {
    const previewLanguage = draftSite.languageVisibility?.[activeLanguage]
      ? activeLanguage
      : languages.find((language) => draftSite.languageVisibility?.[language]) || 'en';
    previewFrame.contentWindow.postMessage({ type: 'ART_SITE_PREVIEW', site: draftSite, language: previewLanguage }, location.origin);
  }
}

function openEditor(site) {
  authScreen.hidden = true;
  editorShell.hidden = false;
  applyAdminLanguage(adminLanguage);
  fillEditor(site, 'ru');
  savedSnapshot = JSON.stringify(collectCurrentSite());
  setStatus('', false, 'savedAll');
  lastSessionTouch = Date.now();
  publishAdminActivity(lastSessionTouch);
  lastActivityPublish = lastSessionTouch;
  armSessionIdleTimer(lastSessionTouch);
  updatePreview();
}

async function uploadImage(file) {
  const body = new FormData();
  body.append('action', 'upload');
  body.append('csrf', csrfToken);
  body.append('image', file);
  const response = await fetch(apiEndpoint, { method: 'POST', body, credentials: 'same-origin' });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || 'Не удалось загрузить изображение.');
  return result.path;
}

form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('input', updatePreview);
form.addEventListener('change', updatePreview);
form.addEventListener('click', (event) => {
  const clearButton = event.target.closest('[data-clear-image]');
  if (!clearButton) return;
  const key = clearButton.dataset.clearImage;
  form.elements.namedItem(key).value = '';
  showImagePreview(document.querySelector(`#${key}-preview`), '');
  updatePreview();
});
form.addEventListener('change', async (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'file' || !input.files?.[0]) return;
  const file = input.files[0];
  if (file.size > 8 * 1024 * 1024) {
    setStatus('', true, 'fileTooLarge');
    input.value = '';
    return;
  }
  const previousStatus = saveStatus.textContent;
  setStatus('', true, 'uploading');
  try {
    const path = await uploadImage(file);
    const imageKey = input.dataset.imageKey;
    if (imageKey) {
      form.elements.namedItem(imageKey).value = path;
      showImagePreview(document.querySelector(`#${imageKey}-preview`), path);
    } else {
      const card = input.closest('.work-editor');
      if (card) {
        card.dataset.image = path;
        showImagePreview(card.querySelector('.work-image-preview'), path, 'Изображение работы');
      }
    }
    updatePreview();
    setStatus('', true, 'imageAdded');
  } catch (error) {
    setStatus(error.message || previousStatus, true);
  } finally {
    input.value = '';
  }
});

document.querySelector('.language-editor-tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-edit-language]');
  if (!button || button.dataset.editLanguage === activeLanguage) return;
  draftSite = collectCurrentSite();
  activeLanguage = button.dataset.editLanguage;
  fillLocalizedFields(draftSite);
  updatePreview();
});

document.querySelector('.admin-language-tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-admin-language]');
  if (button) selectAdminLanguage(button.dataset.adminLanguage);
});

document.querySelector('#work-list').addEventListener('click', (event) => {
  const card = event.target.closest('.work-editor');
  if (!card) return;
  const index = [...document.querySelectorAll('.work-editor')].indexOf(card);
  const site = collectCurrentSite();
  const moveButton = event.target.closest('[data-move-work]');
  if (moveButton) {
    const destination = index + Number(moveButton.dataset.moveWork);
    if (destination >= 0 && destination < site.works.length) {
      [site.works[index], site.works[destination]] = [site.works[destination], site.works[index]];
      languages.forEach((language) => {
        const translatedWorks = site.translations[language].works;
        [translatedWorks[index], translatedWorks[destination]] = [translatedWorks[destination], translatedWorks[index]];
      });
      fillEditor(site);
      updatePreview();
    }
    return;
  }
  if (event.target.closest('[data-clear-work-image]')) {
    site.works[index].image = '';
    draftSite = site;
    fillLocalizedFields(draftSite);
    updatePreview();
    return;
  }
  const clearImageButton = event.target.closest('[data-clear-image]');
  if (clearImageButton) {
    form.elements.namedItem(clearImageButton.dataset.clearImage).value = '';
    showImagePreview(document.querySelector(`#${clearImageButton.dataset.clearImage}-preview`), '');
    updatePreview();
    return;
  }
  if (event.target.closest('[data-remove-work]')) {
    site.works.splice(index, 1);
    languages.forEach((language) => site.translations[language].works.splice(index, 1));
    fillEditor(site);
    updatePreview();
  }
});

document.querySelector('#add-work').addEventListener('click', () => {
  const site = collectCurrentSite();
  if (site.works.length >= 30) {
    setStatus('', true, 'limitReached');
    return;
  }
  const index = site.works.length;
  site.works.push({ category: 'painting', genre: '', year: String(new Date().getFullYear()), dimensions: '', image: '', artworkIndex: index % 4 });
  languages.forEach((language) => site.translations[language].works.push(blankWorkTranslation(language, index)));
  fillEditor(site);
  updatePreview();
});

async function saveSite() {
  const buttons = [document.querySelector('#save-button'), document.querySelector('#save-button-bottom')];
  buttons.forEach((button) => { button.disabled = true; });
  setStatus('', false, 'saving');
  try {
    const result = await apiRequest('save', { site: collectCurrentSite() });
    fillEditor(result.site);
    savedSnapshot = JSON.stringify(collectCurrentSite());
    setStatus('', false, 'saved');
    updatePreview();
  } catch (error) {
    setStatus(error.message || 'Не удалось сохранить сайт', true);
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
  }
}

document.querySelector('#save-button').addEventListener('click', saveSite);
document.querySelector('#save-button-bottom').addEventListener('click', saveSite);
const passwordDialog = document.querySelector('#password-dialog');
const passwordForm = document.querySelector('#password-form');
const passwordMessage = document.querySelector('#password-message');
const passwordSubmit = document.querySelector('#password-submit');
document.querySelector('#change-password-button').addEventListener('click', () => {
  passwordForm.reset();
  passwordMessage.textContent = '';
  passwordDialog.showModal();
  passwordForm.elements.currentPassword.focus();
});
document.querySelector('#password-dialog-close').addEventListener('click', () => passwordDialog.close());
document.querySelector('#password-cancel').addEventListener('click', () => passwordDialog.close());
passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const currentPassword = passwordForm.elements.currentPassword.value;
  const newPassword = passwordForm.elements.newPassword.value;
  const confirmPassword = passwordForm.elements.confirmPassword.value;
  passwordMessage.textContent = '';
  if (newPassword !== confirmPassword) {
    passwordMessage.textContent = adminText('passwordMismatch');
    passwordForm.elements.confirmPassword.focus();
    return;
  }
  if (Array.from(newPassword).length < 12) {
    passwordMessage.textContent = adminText('passwordTooShort');
    passwordForm.elements.newPassword.focus();
    return;
  }
  passwordSubmit.disabled = true;
  passwordMessage.classList.add('is-loading');
  passwordMessage.textContent = adminText('passwordSaving');
  try {
    const result = await apiRequest('change-password', { currentPassword, newPassword });
    csrfToken = result.csrf;
    lastSessionTouch = Date.now();
    publishAdminActivity(lastSessionTouch);
    lastActivityPublish = lastSessionTouch;
    armSessionIdleTimer(lastSessionTouch);
    passwordDialog.close();
    passwordForm.reset();
    setStatus('', false, 'passwordChanged');
  } catch (error) {
    passwordMessage.textContent = passwordErrorText(error.message || 'Не удалось изменить пароль.');
  } finally {
    passwordSubmit.disabled = false;
    passwordMessage.classList.remove('is-loading');
  }
});
document.querySelector('#logout-button').addEventListener('click', async () => {
  try {
    await apiRequest('logout');
    stopSessionIdleTimer();
    csrfToken = '';
    await refreshLoginLanguages();
    showAuth('login');
  } catch (error) {
    setStatus(error.message, true);
  }
});
['pointerdown', 'keydown', 'input', 'change', 'scroll', 'touchstart'].forEach((eventName) => {
  editorShell.addEventListener(eventName, recordAdminActivity, { capture: true, passive: true });
});
window.addEventListener('storage', (event) => {
  if (event.key === sessionActivityStorageKey && !editorShell.hidden) armSessionIdleTimer(Number(event.newValue) || Date.now());
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !editorShell.hidden) recordAdminActivity();
});
previewFrame.addEventListener('load', handlePreviewLoad);
addPasswordVisibility(passwordForm);
applyAdminLanguage(adminLanguage);

getState().then(async (state) => {
  if (state.authenticated) {
    csrfToken = state.csrf;
    const response = await fetch(`${apiEndpoint}?action=public`, { cache: 'no-store' });
    const result = await response.json();
    openEditor(result.site);
  } else {
    await refreshLoginLanguages();
    showAuth(state.isSetup ? 'login' : 'setup', state.sessionExpired ? 'sessionExpired' : '');
  }
}).catch(async () => {
  await refreshLoginLanguages();
  showAuth('login', adminText('serverUnavailable', loginLanguage));
});
