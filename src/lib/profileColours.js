import { MODULE_COLOURS } from '@/lib/moduleColours';

/**
 * Stable per-person palette: every staff member and participant gets their own
 * bright, consistent colour pair for their profile header and name tag.
 */
export function profilePalette(name = '') {
  const text = String(name || '').toLowerCase();
  const hash = [...text].reduce((total, character) => total + character.charCodeAt(0), 0);
  const primary = MODULE_COLOURS[hash % MODULE_COLOURS.length];
  const accent = MODULE_COLOURS[(hash + 3) % MODULE_COLOURS.length];
  return { primary, accent };
}

export function hexToRgb(hex, fallback = [79, 70, 229]) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim());
  if (!match) return fallback;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}