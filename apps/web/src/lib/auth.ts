import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'hosos_enterprise_jwt_super_secret_key_2026';
const TOKEN_NAME = 'hosos_session_token';

export interface AuthTokenPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hashedOrPlain: string): Promise<boolean> {
  if (!plainText || !hashedOrPlain) return false;
  // If it's already bcrypt hashed (starts with $2a$ or $2b$)
  if (hashedOrPlain.startsWith('$2a$') || hashedOrPlain.startsWith('$2b$')) {
    return bcrypt.compare(plainText, hashedOrPlain);
  }
  // Fallback comparison for demo accounts before re-hashing
  return plainText === hashedOrPlain;
}

export function signJwt(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest | Request): AuthTokenPayload | null {
  try {
    // 1. Try reading cookie header
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|; )${TOKEN_NAME}=([^;]*)`));
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      const session = verifyJwt(decoded);
      if (session) return session;
    }

    // 2. Try Authorization Bearer header
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const session = verifyJwt(token);
      if (session) return session;
    }
  } catch (err) {
    console.error('Error reading session from request:', err);
  }
  return null;
}

export function setAuthCookieResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}

export function clearAuthCookieResponse(response: NextResponse): NextResponse {
  response.cookies.set({
    name: TOKEN_NAME,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
