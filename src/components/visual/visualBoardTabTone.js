import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

// Each Visual Boards tab takes a different one of the 45 module colours.
const TAB_MODULES = {
  clock: 'incident-analytics',
  routine: 'goals',
  communication: 'our-staff',
  weather: 'invoicing',
  daydate: 'documents',
  speech: 'our-participants',
  signs: 'training',
  translator: 'ndis-provider',
};

function hexToHslChannels(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return `${Math.round((h * 60 + 360) % 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function visualBoardTabTone(tab) {
  return { '--dashboard-tone': hexToHslChannels(moduleKeyColour(TAB_MODULES[tab])) };
}