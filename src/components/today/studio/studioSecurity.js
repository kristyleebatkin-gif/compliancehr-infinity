// Studio scope and HTML helpers shared by the persistence adapter and regression tests.
export const STUDIO_KINDS = Object.freeze(['design', 'filed_design', 'document', 'meeting', 'assistant', 'crm_note']);

export function studioScope(context) {
  const user = context?.user;
  const tenantId = context?.tenantId;
  if (!user?.id || !tenantId || user.account_status !== 'Active' || user.access_approved !== true) {
    throw new Error('An approved account and active business are required for studio saves.');
  }
  return { tenant_id: tenantId, created_by_id: user.id };
}

export function sameStudioScope(a, b) {
  return a.tenant_id === b.tenant_id && a.created_by_id === b.created_by_id;
}

// Preserve simple document formatting, never active HTML, attributes or external resources.
export function sanitizeStudioHtml(value) {
  const html = String(value || '');
  if (!html) return '';
  if (typeof DOMParser === 'undefined') throw new Error('Document formatting is unavailable in this browser.');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P', 'BR', 'H1', 'H2', 'H3', 'H4', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'DIV', 'SPAN', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'HR']);
  const discard = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'FORM', 'INPUT', 'BUTTON', 'LINK', 'META', 'BASE', 'IMG', 'AUDIO', 'VIDEO', 'SOURCE']);
  const clean = (parent) => {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === 8) { node.remove(); continue; }
      if (node.nodeType !== 1) continue;
      if (discard.has(node.tagName)) { node.remove(); continue; }
      clean(node);
      if (!allowed.has(node.tagName)) { node.replaceWith(...node.childNodes); continue; }
      for (const attr of [...node.attributes]) node.removeAttribute(attr.name);
    }
  };
  clean(parsed.body);
  return parsed.body.innerHTML;
}
