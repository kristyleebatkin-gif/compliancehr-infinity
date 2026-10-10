export const MODULE_COLOURS = [
  '#4f46e5',
  '#2563eb',
  '#0891b2',
  '#0d9488',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#dc2626',
  '#db2777',
  '#9333ea',
];

export function moduleColour(value = '', offset = 0) {
  const hash = [...String(value)].reduce((total, character) => total + character.charCodeAt(0), 0);
  return MODULE_COLOURS[(hash + offset) % MODULE_COLOURS.length];
}