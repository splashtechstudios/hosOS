/**
 * HosOS Enterprise API Configuration
 * Supports production deployed backend at https://hosos.onrender.com
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_APP_URL || 
  'https://hosos.onrender.com';

/**
 * Resolves full API endpoint path.
 * When in browser, relative paths (e.g. /api/rooms) can be used,
 * or full absolute URL can be resolved when calling cross-origin or SSR.
 */
export function getApiUrl(path: string, absolute = false): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!absolute && typeof window !== 'undefined') {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}
