import { YOUTUBE_URL_PATTERNS } from '../core/constants.js';

export function isValidYouTubeUrl(url: string): boolean {
  const t = url.trim();
  return t.length > 0 && YOUTUBE_URL_PATTERNS.some((p) => p.test(t));
}