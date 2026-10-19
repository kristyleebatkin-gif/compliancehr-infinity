// Only http(s) URLs are safe to render as links. Bare domains are upgraded to
// https; anything with another scheme (javascript:, data:, vbscript:...) is
// rejected so stored URLs can never execute script in the app origin.
export const safeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  if (/^[^\s]+\.[^\s]+/.test(trimmed)) return `https://${trimmed}`;
  return null;
};

export default safeUrl;