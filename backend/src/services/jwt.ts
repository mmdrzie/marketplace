import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { authConfig } from '../config/auth.js';

export interface TokenPayload extends JWTPayload {
  id: string;
  email: string;
  role: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}

function parseTtl(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 900;
  }
}

export async function signAccessToken(payload: Omit<TokenPayload, keyof JWTPayload>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(now + parseTtl(authConfig.accessTtl))
    .sign(authConfig.secret);
}

export async function signRefreshToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(now + parseTtl(authConfig.refreshTtl))
    .sign(authConfig.secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, authConfig.secret);
  return payload as unknown as TokenPayload;
}
