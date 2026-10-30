import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { dataDir } from './site-data.js';

export const authFile = path.join(dataDir, 'admin-auth.json');
export const sessionCookieName = 'artist_admin_session';
export const sessionIdleSeconds = 10 * 60;

async function ensureDataDirectory() {
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
}

export async function readAuth() {
  try {
    const auth = JSON.parse(await readFile(authFile, 'utf8'));
    return typeof auth.passwordHash === 'string' ? auth : null;
  } catch {
    return null;
  }
}

function encodePassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function hashPassword(password) {
  return encodePassword(password);
}

export function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return false;
  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/i.test(hash || '')) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export async function saveAuth(auth, { createOnly = false } = {}) {
  await ensureDataDirectory();
  const temporaryFile = `${authFile}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(auth, null, 2)}\n`, { mode: 0o600 });
  if (createOnly) {
    try {
      await writeFile(authFile, `${JSON.stringify(auth, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    } finally {
      const { unlink } = await import('node:fs/promises');
      await unlink(temporaryFile).catch(() => {});
    }
    return;
  }
  await rename(temporaryFile, authFile);
}

async function getSessionSecret() {
  await ensureDataDirectory();
  const secretFile = path.join(dataDir, 'session-secret');
  try {
    return await readFile(secretFile);
  } catch {
    const secret = randomBytes(48);
    try {
      await writeFile(secretFile, secret, { flag: 'wx', mode: 0o600 });
      return secret;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      return readFile(secretFile);
    }
  }
}

function signature(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export async function createSession(authHash) {
  const secret = await getSessionSecret();
  const session = {
    authHash,
    csrf: randomBytes(32).toString('hex'),
    lastActivity: Math.floor(Date.now() / 1000),
  };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return { ...session, token: `${payload}.${signature(payload, secret)}` };
}

function cookieValue(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const prefix = `${sessionCookieName}=`;
  const item = cookieHeader.split(';').map((value) => value.trim()).find((value) => value.startsWith(prefix));
  if (!item) return '';
  try { return decodeURIComponent(item.slice(prefix.length)); } catch { return ''; }
}

export async function inspectSession(request, auth) {
  const token = cookieValue(request);
  if (!token || !auth?.passwordHash) return { session: null, expired: false };
  const [payload, suppliedSignature] = token.split('.');
  if (!payload || !suppliedSignature) return { session: null, expired: false };
  let session;
  try {
    const secret = await getSessionSecret();
    const expected = Buffer.from(signature(payload, secret));
    const supplied = Buffer.from(suppliedSignature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return { session: null, expired: false };
    session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return { session: null, expired: false };
  }
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(session.lastActivity) || session.lastActivity > now || now - session.lastActivity >= sessionIdleSeconds) {
    return { session: null, expired: true };
  }
  if (session.authHash !== auth.passwordHash || typeof session.csrf !== 'string') return { session: null, expired: false };
  return { session: { ...session, lastActivity: now }, expired: false };
}

export function sessionCookie(token, request) {
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
  const secure = (forwardedProtocol || new URL(request.url).protocol.replace(':', '')) === 'https';
  return `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionIdleSeconds}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie(request) {
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
  const secure = (forwardedProtocol || new URL(request.url).protocol.replace(':', '')) === 'https';
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

export function signSession(session) {
  return getSessionSecret().then((secret) => {
    const payload = Buffer.from(JSON.stringify({
      authHash: session.authHash,
      csrf: session.csrf,
      lastActivity: session.lastActivity,
    })).toString('base64url');
    return `${payload}.${signature(payload, secret)}`;
  });
}
