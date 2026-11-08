const KEY = 'cs-team-handover';

export const readHandover = (day) => localStorage.getItem(`${KEY}:${day}`) || '';

export const writeHandover = (day, text) => {
  localStorage.setItem(`${KEY}:${day}`, text);
  window.dispatchEvent(new Event('cs-handover-change'));
};

export const appendHandover = (day, text) => {
  const current = readHandover(day);
  writeHandover(day, [current, text].filter(Boolean).join('\n'));
};