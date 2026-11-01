// 8 full-colour tile & pill styles mixed so the same or similar colour is never adjacent
export const FULL_COLOUR_TILES = [
  {
    name: 'light-blue',
    bg: '#38BDF8',
    text: '#0A2B6D',
    subtext: '#0A2B6D',
    border: '#0072FF',
    symbolBg: 'linear-gradient(135deg, #FF2E9A 0%, #A100FF 55%, #5A00D6 100%)',
    symbolColor: '#5A00D6',
  },
  {
    name: 'medium-pink',
    bg: '#FF2E9A',
    text: '#FFFFFF',
    subtext: '#FFFFFF',
    border: '#5A00D6',
    symbolBg: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 55%, #5A00D6 100%)',
    symbolColor: '#0072FF',
  },
  {
    name: 'light-purple',
    bg: '#C084FC',
    text: '#0A2B6D',
    subtext: '#0A2B6D',
    border: '#5A00D6',
    symbolBg: 'linear-gradient(135deg, #0072FF 0%, #0A2B6D 50%, #FF2E9A 100%)',
    symbolColor: '#FF2E9A',
  },
  {
    name: 'medium-blue',
    bg: '#0072FF',
    text: '#FFFFFF',
    subtext: '#FFFFFF',
    border: '#0A2B6D',
    symbolBg: 'linear-gradient(135deg, #FF6EDB 0%, #FF2E9A 50%, #A100FF 100%)',
    symbolColor: '#A100FF',
  },
  {
    name: 'light-pink',
    bg: '#FF85E0',
    text: '#0A2B6D',
    subtext: '#0A2B6D',
    border: '#A100FF',
    symbolBg: 'linear-gradient(135deg, #5A00D6 0%, #0072FF 55%, #00C6FF 100%)',
    symbolColor: '#5A00D6',
  },
  {
    name: 'violet',
    bg: '#5A00D6',
    text: '#FFFFFF',
    subtext: '#FFFFFF',
    border: '#00C6FF',
    symbolBg: 'linear-gradient(135deg, #00C6FF 0%, #38BDF8 50%, #FF2E9A 100%)',
    symbolColor: '#00C6FF',
  },
  {
    name: 'dark-pink',
    bg: '#C80064',
    text: '#FFFFFF',
    subtext: '#FFFFFF',
    border: '#0A2B6D',
    symbolBg: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 50%, #A100FF 100%)',
    symbolColor: '#0072FF',
  },
  {
    name: 'medium-purple',
    bg: '#9333EA',
    text: '#FFFFFF',
    subtext: '#FFFFFF',
    border: '#0072FF',
    symbolBg: 'linear-gradient(135deg, #00C6FF 0%, #FF2E9A 55%, #FF6EDB 100%)',
    symbolColor: '#FF2E9A',
  },
];

// Different views of the app design colours for subject headers & section header pills
export const HEADER_COLOUR_VIEWS = [
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 48%, #FF2E9A 100%)',
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 46%, #0072FF 100%)',
  'linear-gradient(120deg, #5A00D6 0%, #0072FF 48%, #00C6FF 100%)',
  'linear-gradient(120deg, #A100FF 0%, #5A00D6 50%, #0072FF 100%)',
  'linear-gradient(120deg, #00C6FF 0%, #5A00D6 50%, #FF2E9A 100%)',
  'linear-gradient(120deg, #9333EA 0%, #0072FF 50%, #FF2E9A 100%)',
  'linear-gradient(120deg, #0A2B6D 0%, #5A00D6 48%, #FF2E9A 100%)',
  'linear-gradient(120deg, #0072FF 0%, #A100FF 50%, #FF6EDB 100%)',
];

// Different views of the app design colours for titles & sub-headers
export const TITLE_GRADIENT_VIEWS = [
  'linear-gradient(90deg, #0072FF 0%, #5A00D6 48%, #FF2E9A 100%)',
  'linear-gradient(90deg, #5A00D6 0%, #A100FF 48%, #0072FF 100%)',
  'linear-gradient(90deg, #0A2B6D 0%, #5A00D6 48%, #FF2E9A 100%)',
  'linear-gradient(90deg, #0072FF 0%, #A100FF 48%, #FF2E9A 100%)',
  'linear-gradient(90deg, #A100FF 0%, #FF2E9A 50%, #0072FF 100%)',
  'linear-gradient(90deg, #0072FF 0%, #5A00D6 50%, #9333EA 100%)',
];

export const SUBHEADER_COLOUR_VIEWS = [
  '#5A00D6',
  '#0072FF',
  '#0A2B6D',
  '#0072FF',
  '#0A2B6D',
  '#5A00D6',
];

// Different views of the app colours for borders on tiles, screens & reports
export const APP_BORDER_VIEWS = [
  '#0072FF',
  '#FF2E9A',
  '#5A00D6',
  '#00C6FF',
  '#A100FF',
  '#0A2B6D',
  '#9333EA',
  '#FF6EDB',
];

// Different views of the app colours for symbols outside titles/headers
export const SYMBOL_GRADIENT_VIEWS = [
  { bg: '#FFFFFF', iconColor: '#0072FF', ring: '#0072FF' },
  { bg: '#FFFFFF', iconColor: '#FF2E9A', ring: '#FF2E9A' },
  { bg: '#FFFFFF', iconColor: '#5A00D6', ring: '#5A00D6' },
  { bg: '#FFFFFF', iconColor: '#A100FF', ring: '#A100FF' },
  { bg: '#FFFFFF', iconColor: '#C80064', ring: '#C80064' },
  { bg: '#FFFFFF', iconColor: '#00C6FF', ring: '#00C6FF' },
  { bg: '#FFFFFF', iconColor: '#9333EA', ring: '#9333EA' },
  { bg: '#FFFFFF', iconColor: '#0A2B6D', ring: '#0A2B6D' },
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