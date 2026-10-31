// Cohesive indigo/violet & slate palette helpers used across tiles, headers & badges
export const FULL_COLOUR_TILES = [
  {
    name: 'indigo-soft',
    bg: '#EEF2FF',
    text: '#1E1B4B',
    subtext: '#475569',
    border: '#C7D2FE',
    symbolBg: '#4F46E5',
    symbolColor: '#4F46E5',
  },
  {
    name: 'slate-soft',
    bg: '#F8FAFC',
    text: '#0F172A',
    subtext: '#475569',
    border: '#E2E8F0',
    symbolBg: '#334155',
    symbolColor: '#4F46E5',
  },
  {
    name: 'violet-soft',
    bg: '#F5F3FF',
    text: '#2E1065',
    subtext: '#475569',
    border: '#DDD6FE',
    symbolBg: '#6D28D9',
    symbolColor: '#6D28D9',
  },
  {
    name: 'indigo-solid',
    bg: '#4F46E5',
    text: '#FFFFFF',
    subtext: '#E0E7FF',
    border: '#4338CA',
    symbolBg: '#3730A3',
    symbolColor: '#4F46E5',
  },
  {
    name: 'slate-surface',
    bg: '#F1F5F9',
    text: '#0F172A',
    subtext: '#475569',
    border: '#CBD5E1',
    symbolBg: '#1E293B',
    symbolColor: '#4F46E5',
  },
  {
    name: 'violet-solid',
    bg: '#5B21B6',
    text: '#FFFFFF',
    subtext: '#EDE9FE',
    border: '#4C1D95',
    symbolBg: '#4C1D95',
    symbolColor: '#6D28D9',
  },
  {
    name: 'navy-solid',
    bg: '#1E1B4B',
    text: '#FFFFFF',
    subtext: '#C7D2FE',
    border: '#312E81',
    symbolBg: '#312E81',
    symbolColor: '#4F46E5',
  },
  {
    name: 'indigo-deep',
    bg: '#3730A3',
    text: '#FFFFFF',
    subtext: '#E0E7FF',
    border: '#312E81',
    symbolBg: '#1E1B4B',
    symbolColor: '#6D28D9',
  },
];

export const HEADER_COLOUR_VIEWS = [
  '#4F46E5',
  '#3730A3',
  '#5B21B6',
  '#1E1B4B',
  '#4338CA',
  '#6D28D9',
  '#312E81',
  '#4F46E5',
];

export const TITLE_GRADIENT_VIEWS = [
  'linear-gradient(90deg, #0F172A 0%, #3730A3 100%)',
  'linear-gradient(90deg, #1E1B4B 0%, #4F46E5 100%)',
  'linear-gradient(90deg, #0F172A 0%, #4F46E5 100%)',
  'linear-gradient(90deg, #1E1B4B 0%, #5B21B6 100%)',
  'linear-gradient(90deg, #0F172A 0%, #4338CA 100%)',
  'linear-gradient(90deg, #1E1B4B 0%, #4F46E5 100%)',
];

export const SUBHEADER_COLOUR_VIEWS = [
  '#475569',
  '#475569',
  '#475569',
  '#475569',
  '#475569',
  '#475569',
];

export const APP_BORDER_VIEWS = [
  '#CBD5E1',
  '#C7D2FE',
  '#DDD6FE',
  '#CBD5E1',
  '#C7D2FE',
  '#DDD6FE',
  '#CBD5E1',
  '#C7D2FE',
];

export const SYMBOL_GRADIENT_VIEWS = [
  { bg: '#EEF2FF', iconColor: '#4F46E5', ring: '#C7D2FE' },
  { bg: '#F5F3FF', iconColor: '#6D28D9', ring: '#DDD6FE' },
  { bg: '#F1F5F9', iconColor: '#334155', ring: '#CBD5E1' },
  { bg: '#EEF2FF', iconColor: '#4338CA', ring: '#C7D2FE' },
  { bg: '#F5F3FF', iconColor: '#5B21B6', ring: '#DDD6FE' },
  { bg: '#EEF2FF', iconColor: '#4F46E5', ring: '#C7D2FE' },
  { bg: '#F5F3FF', iconColor: '#6D28D9', ring: '#DDD6FE' },
  { bg: '#F1F5F9', iconColor: '#1E293B', ring: '#CBD5E1' },
];

export function getTilePalette(index = 0) {
  const i = Math.abs(Number(index) || 0) % FULL_COLOUR_TILES.length;
  return FULL_COLOUR_TILES[i];
}

export function getHeaderView(index = 0) {
  const i = Math.abs(Number(index) || 0) % HEADER_COLOUR_VIEWS.length;
  return HEADER_COLOUR_VIEWS[i];
}

export function getTitleGradientView(index = 0) {
  const i = Math.abs(Number(index) || 0) % TITLE_GRADIENT_VIEWS.length;
  return TITLE_GRADIENT_VIEWS[i];
}

export function getSubheaderColourView(index = 0) {
  const i = Math.abs(Number(index) || 0) % SUBHEADER_COLOUR_VIEWS.length;
  return SUBHEADER_COLOUR_VIEWS[i];
}

export function getAppBorderView(index = 0) {
  const i = Math.abs(Number(index) || 0) % APP_BORDER_VIEWS.length;
  return APP_BORDER_VIEWS[i];
}

export function getSymbolView(index = 0) {
  const i = Math.abs(Number(index) || 0) % SYMBOL_GRADIENT_VIEWS.length;
  return SYMBOL_GRADIENT_VIEWS[i];
}