import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_auth';

export function getCookieName(): string {
  return COOKIE_NAME;
}

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('Missing ADMIN_JWT_SECRET');
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: { username: string }, expiresInSeconds = 60 * 60 * 12): Promise<string> {
  const secret = getSecret();
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secret);
  return jwt;
}

export async function verifySessionToken(token: string): Promise<{ username: string } | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return { username: String(payload.username) };
  } catch {
    return null;
  }
}

export function buildAuthCookie(token: string): string {
  // HttpOnly, Secure in prod, SameSite=Lax
  const isProd = process.env.NODE_ENV === 'production';
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isProd ? 'Secure' : '',
  ].filter(Boolean);
  return attrs.join('; ');
}

export function buildLogoutCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const attrs = [
    `${COOKIE_NAME}=; Path=/; Max-Age=0`,
    'HttpOnly',
    'SameSite=Lax',
    isProd ? 'Secure' : '',
  ].filter(Boolean);
  return attrs.join('; ');
}


