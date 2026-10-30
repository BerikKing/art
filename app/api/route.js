import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  clearSessionCookie,
  createSession,
  hashPassword,
  inspectSession,
  readAuth,
  saveAuth,
  sessionCookie,
  signSession,
  verifyPassword,
} from '../../lib/auth.js';
import {
  dataDir,
  normalizeSite,
  readSite,
  removeUnusedImages,
  uploadDir,
  writeSite,
} from '../../lib/site-data.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(payload, status = 200, setCookie = '') {
  const headers = new Headers({
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
  });
  if (setCookie) headers.set('Set-Cookie', setCookie);
  return Response.json(payload, { status, headers });
}

function requestOriginMatches(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.split(',')[0].trim().toLowerCase();
  } catch {
    return false;
  }
}

function constantTimeMatch(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readAuthWithSession(request) {
  const auth = await readAuth();
  const inspected = await inspectSession(request, auth);
  return { auth, ...inspected };
}

function refreshedCookie(session, request) {
  return signSession(session).then((token) => sessionCookie(token, request));
}

async function requireSession(request, csrfToken) {
  if (!requestOriginMatches(request)) return { response: json({ ok: false, error: 'Недопустимый источник запроса.' }, 403) };
  const { auth, session } = await readAuthWithSession(request);
  if (!auth || !session) return { response: json({ ok: false, error: 'Сессия истекла. Войдите снова.' }, 401, clearSessionCookie(request)) };
  if (!constantTimeMatch(session.csrf, csrfToken)) return { response: json({ ok: false, error: 'Сессия истекла. Обновите страницу и войдите снова.' }, 403) };
  return { auth, session };
}

async function siteDefaults() {
  const site = await readSite();
  const { readFile } = await import('node:fs/promises');
  return JSON.parse(await readFile(path.join(dataDir, 'default-site.json'), 'utf8')) || site;
}

function uploadMime(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return '';
}

async function optimizeUpload(buffer, mime) {
  const metadata = await sharp(buffer, { limitInputPixels: 60_000_000 }).metadata();
  if (!metadata.width || !metadata.height) throw new Error('Invalid image dimensions');

  const originalExtension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
  if (metadata.pages > 1) return { buffer, extension: originalExtension };

  const optimized = await sharp(buffer, { limitInputPixels: 60_000_000 })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 95, effort: 4, smartSubsample: true })
    .toBuffer();

  if (metadata.width <= 2400 && metadata.height <= 2400 && optimized.length >= buffer.length) {
    return { buffer, extension: originalExtension };
  }
  return { buffer: optimized, extension: 'webp' };
}

export async function GET(request) {
  const action = new URL(request.url).searchParams.get('action');
  if (action === 'public') {
    try {
      return json({ ok: true, site: await readSite() });
    } catch {
      return json({ ok: false, error: 'Не удалось загрузить настройки сайта.' }, 500);
    }
  }
  if (action === 'state') {
    try {
      const { auth, session, expired } = await readAuthWithSession(request);
      const cookie = session ? await refreshedCookie(session, request) : (!auth && request.headers.get('cookie') ? clearSessionCookie(request) : '');
      return json({
        ok: true,
        isSetup: Boolean(auth),
        authenticated: Boolean(session),
        sessionExpired: !session && expired,
        csrf: session?.csrf || '',
      }, 200, cookie);
    } catch {
      return json({ ok: false, error: 'Не удалось проверить сессию.' }, 500);
    }
  }
  return json({ ok: false, error: 'Неизвестное действие.' }, 404);
}

export async function POST(request) {
  let action = new URL(request.url).searchParams.get('action') || '';
  let input = {};
  let file = null;
  const isMultipart = (request.headers.get('content-type') || '').includes('multipart/form-data');
  try {
    if (isMultipart) {
      const form = await request.formData();
      action = String(form.get('action') || action);
      input = { action, csrf: String(form.get('csrf') || '') };
      file = form.get('image');
    } else {
      input = await request.json();
      action = String(input.action || action);
    }
  } catch {
    return json({ ok: false, error: 'Некорректные данные запроса.' }, 400);
  }

  if (!requestOriginMatches(request)) return json({ ok: false, error: 'Недопустимый источник запроса.' }, 403);

  if (action === 'setup') {
    if (await readAuth()) return json({ ok: false, error: 'Админка уже настроена. Войдите с паролем.' }, 409);
    const password = input.password;
    if (typeof password !== 'string' || Array.from(password).length < 12) {
      return json({ ok: false, error: 'Пароль должен содержать не менее 12 символов.' }, 422);
    }
    const passwordHash = hashPassword(password);
    try {
      await saveAuth({ passwordHash }, { createOnly: true });
    } catch (error) {
      if (error.code === 'EEXIST') return json({ ok: false, error: 'Админка уже настроена. Войдите с паролем.' }, 409);
      return json({ ok: false, error: 'Не удалось сохранить пароль. Проверьте права на папку data.' }, 500);
    }
    const session = await createSession(passwordHash);
    const token = await signSession(session);
    return json({ ok: true, csrf: session.csrf }, 200, sessionCookie(token, request));
  }

  if (action === 'login') {
    const auth = await readAuth();
    if (!auth) return json({ ok: false, error: 'Сначала создайте пароль администратора.' }, 409);
    if (!verifyPassword(input.password, auth.passwordHash)) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return json({ ok: false, error: 'Неверный пароль.' }, 401);
    }
    const session = await createSession(auth.passwordHash);
    const token = await signSession(session);
    return json({ ok: true, csrf: session.csrf }, 200, sessionCookie(token, request));
  }

  if (action === 'logout') {
    const protectedRequest = await requireSession(request, input.csrf || request.headers.get('x-csrf-token'));
    if (protectedRequest.response) return protectedRequest.response;
    return json({ ok: true }, 200, clearSessionCookie(request));
  }

  const protectedRequest = await requireSession(request, input.csrf || request.headers.get('x-csrf-token'));
  if (protectedRequest.response) return protectedRequest.response;
  const { auth, session } = protectedRequest;

  if (action === 'change-password') {
    if (!verifyPassword(input.currentPassword, auth.passwordHash)) {
      return json({ ok: false, error: 'Неверный текущий пароль.' }, 401, await refreshedCookie(session, request));
    }
    if (typeof input.newPassword !== 'string' || Array.from(input.newPassword).length < 12) {
      return json({ ok: false, error: 'Новый пароль должен содержать не менее 12 символов.' }, 422, await refreshedCookie(session, request));
    }
    const passwordHash = hashPassword(input.newPassword);
    try {
      await saveAuth({ ...auth, passwordHash });
    } catch {
      return json({ ok: false, error: 'Не удалось сохранить новый пароль. Проверьте права на папку data.' }, 500, await refreshedCookie(session, request));
    }
    const nextSession = await createSession(passwordHash);
    return json({ ok: true, csrf: nextSession.csrf }, 200, sessionCookie(await signSession(nextSession), request));
  }

  if (action === 'save') {
    try {
      const previousSite = await readSite();
      const site = normalizeSite(input.site, await siteDefaults());
      await writeSite(site);
      await removeUnusedImages(previousSite, site).catch(() => {});
      return json({ ok: true, site }, 200, await refreshedCookie(session, request));
    } catch {
      return json({ ok: false, error: 'Не удалось сохранить настройки сайта. Проверьте права на папку data.' }, 500, await refreshedCookie(session, request));
    }
  }

  if (action === 'upload') {
    if (!file || typeof file.arrayBuffer !== 'function' || file.size <= 0) {
      return json({ ok: false, error: 'Выберите изображение для загрузки.' }, 422, await refreshedCookie(session, request));
    }
    if (file.size > 8 * 1024 * 1024) {
      return json({ ok: false, error: 'Размер файла должен быть не больше 8 МБ.' }, 422, await refreshedCookie(session, request));
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mime = uploadMime(buffer);
      if (!mime) return json({ ok: false, error: 'Поддерживаются изображения JPG, PNG и WebP.' }, 422, await refreshedCookie(session, request));
      let optimized;
      try {
        optimized = await optimizeUpload(buffer, mime);
      } catch {
        return json({ ok: false, error: 'Не удалось обработать изображение. Проверьте файл и попробуйте другое.' }, 422, await refreshedCookie(session, request));
      }
      await mkdir(uploadDir, { recursive: true });
      const filename = `${randomBytes(16).toString('hex')}.${optimized.extension}`;
      await writeFile(path.join(/*turbopackIgnore: true*/ uploadDir, filename), optimized.buffer, { flag: 'wx', mode: 0o644 });
      return json({ ok: true, path: `uploads/${filename}` }, 200, await refreshedCookie(session, request));
    } catch {
      return json({ ok: false, error: 'Не удалось сохранить изображение.' }, 500, await refreshedCookie(session, request));
    }
  }

  return json({ ok: false, error: 'Неизвестное действие.' }, 404, await refreshedCookie(session, request));
}
