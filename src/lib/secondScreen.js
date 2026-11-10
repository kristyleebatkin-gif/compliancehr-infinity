export const SECOND_SCREEN_VIEWS = [
  { key: 'roster', label: 'Rostering', navKey: 'rostering' },
  { key: 'invoicing', label: 'Invoicing', navKey: 'invoicing' },
  { key: 'quotes', label: 'Quoting', navKey: 'quotes' }
];

export const secondScreenPath = (key) => `/second-screen?module=${key}`;

export function openSecondScreen(key) {
  if (typeof window === 'undefined') return;
  const availWidth = window.screen?.availWidth || 1440;
  const availHeight = window.screen?.availHeight || 900;
  const width = Math.max(720, Math.round(availWidth / 2));
  window.open(
    secondScreenPath(key),
    `cs-second-screen-${key}`,
    `popup=yes,width=${width},height=${availHeight},left=${Math.round(availWidth / 2)},top=0`
  );
}