export const TEMPLATES = [
  { id: 'social', label: 'Social post', note: '1080 × 1080', w: 1080, h: 1080, headline: 78, subhead: 30, body: 26 },
  { id: 'story', label: 'Story / reel', note: '1080 × 1920', w: 1080, h: 1920, headline: 86, subhead: 32, body: 28 },
  { id: 'flyer', label: 'A4 flyer', note: 'Print', w: 1240, h: 1754, headline: 72, subhead: 28, body: 24 },
  { id: 'letter', label: 'Letterhead', note: 'Print', w: 1240, h: 1754, headline: 54, subhead: 24, body: 22 },
  { id: 'certificate', label: 'Certificate', note: 'Landscape', w: 1600, h: 1131, headline: 72, subhead: 28, body: 24 }
];

export const PALETTES = [
  {
    id: 'midnight',
    label: 'Midnight',
    bg: 'linear-gradient(150deg,#0A2B6D 0%,#1B2F70 52%,#5A00D6 100%)',
    ink: '#ffffff',
    soft: 'rgba(255,255,255,0.78)',
    accent: '#39E6FF',
    onAccent: '#06213f'
  },
  {
    id: 'sunrise',
    label: 'Sunrise',
    bg: 'linear-gradient(150deg,#FF6FB5 0%,#FF9E6D 56%,#FFD46D 100%)',
    ink: '#3B0A2A',
    soft: 'rgba(59,10,42,0.72)',
    accent: '#7A1FA2',
    onAccent: '#ffffff'
  },
  {
    id: 'mint',
    label: 'Mint',
    bg: 'linear-gradient(150deg,#0B7A5B 0%,#12A57A 56%,#8CE0C0 100%)',
    ink: '#04281E',
    soft: 'rgba(4,40,30,0.75)',
    accent: '#FFE066',
    onAccent: '#04281e'
  },
  {
    id: 'cloud',
    label: 'Cloud',
    bg: 'linear-gradient(150deg,#F8FBFF 0%,#E6EEFB 56%,#DCE7FF 100%)',
    ink: '#0A2B6D',
    soft: 'rgba(10,43,109,0.72)',
    accent: '#0072FF',
    onAccent: '#ffffff'
  },
  {
    id: 'plum',
    label: 'Plum',
    bg: 'linear-gradient(150deg,#2B0A45 0%,#5A00D6 58%,#B026FF 100%)',
    ink: '#ffffff',
    soft: 'rgba(255,255,255,0.8)',
    accent: '#39E6FF',
    onAccent: '#06213f'
  }
];

export const LAYOUTS = [
  { id: 'left', label: 'Left aligned' },
  { id: 'centre', label: 'Centred' },
  { id: 'band', label: 'Headline band' }
];