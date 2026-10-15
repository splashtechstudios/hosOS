import { NextResponse } from 'next/server';
import { clearAuthCookieResponse } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  return clearAuthCookieResponse(response);
}
