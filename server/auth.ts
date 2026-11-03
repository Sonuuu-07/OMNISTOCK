import crypto from 'crypto';

export type UserRole = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'STARTUP_MERCHANT' | 'OPERATIONS_AUDITOR';

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  startupId?: string;
  assignedWarehouseCode?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' ? undefined : 'omnistock-development-only-secret'
);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured when NODE_ENV is production');
}

const USER_ROLES: UserRole[] = ['ADMIN', 'WAREHOUSE_MANAGER', 'STARTUP_MERCHANT', 'OPERATIONS_AUDITOR'];

/**
 * Password Hashing simulation using PBKDF2 with Cryptographic Salt
 */
export function hashPassword(password: string, salt?: string): { passwordHash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha256').toString('hex');
  return { passwordHash: hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  const computedBuffer = Buffer.from(computed, 'hex');
  const hashBuffer = Buffer.from(hash, 'hex');
  return computedBuffer.length === hashBuffer.length && crypto.timingSafeEqual(computedBuffer, hashBuffer);
}

/**
 * Standard JWT Token Generator (Base64Url Encoded Header.Payload.Signature)
 */
export function signJwt(payload: UserPayload, expiresInSeconds: number = 86400): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const iat = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, exp, iat, iss: 'omnistock-auth-service' };

  const encodeBase64Url = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const headerB64 = encodeBase64Url(header);
  const payloadB64 = encodeBase64Url(fullPayload);
  const dataToSign = `${headerB64}.${payloadB64}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${dataToSign}.${signature}`;
}

/**
 * Verify JWT Token and return decoded UserPayload
 */
export function verifyJwt(token: string): { valid: boolean; payload?: UserPayload; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [headerB64, payloadB64, signature] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(dataToSign)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSig);
    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      return { valid: false, error: 'Invalid HMAC signature' };
    }

    const decodedHeader = JSON.parse(Buffer.from(headerB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'));
    if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') {
      return { valid: false, error: 'Unsupported token header' };
    }

    const decodedPayloadStr = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    const payload = JSON.parse(decodedPayloadStr) as Partial<UserPayload> & { exp?: unknown; iss?: unknown };

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      !USER_ROLES.includes(payload.role as UserRole) ||
      payload.iss !== 'omnistock-auth-service' ||
      typeof payload.exp !== 'number'
    ) {
      return { valid: false, error: 'Invalid token payload' };
    }

    if (Date.now() / 1000 >= payload.exp) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload: payload as UserPayload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return { valid: false, error: message };
  }
}

// Pre-seeded demo user credentials
export const DEMO_USERS: Array<UserPayload & { salt: string; passwordHash: string }> = [
  {
    userId: 'usr-admin-1',
    email: 'admin@omnistock.in',
    name: 'Vikramaditya Deshmukh (Head of Pan-India Logistics)',
    role: 'ADMIN',
    ...hashPassword('AdminPass2026!', 'salt-admin-fixed'),
  },
  {
    userId: 'usr-wh-manager',
    email: 'pooja.i@omnistock.logistics',
    name: 'Pooja Iyer (Bengaluru Tech Hub Lead)',
    role: 'WAREHOUSE_MANAGER',
    assignedWarehouseCode: 'BLR-01',
    ...hashPassword('Warehouse2026!', 'salt-wh-fixed'),
  },
  {
    userId: 'usr-startup-vayutech',
    email: 'founder@vayutech.in',
    name: 'Aarav Sharma (VayuTech Innovations Founder)',
    role: 'STARTUP_MERCHANT',
    startupId: 'st-01',
    ...hashPassword('Startup2026!', 'salt-st-fixed'),
  },
  {
    userId: 'usr-auditor',
    email: 'ananya.sen@fssai-audit.in',
    name: 'Dr. Ananya Sen (FSSAI & Hazmat Regulatory Lead)',
    role: 'OPERATIONS_AUDITOR',
    ...hashPassword('Audit2026!', 'salt-aud-fixed'),
  },
];
