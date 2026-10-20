import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

// Xero-style bank rule matching, shared by the invoice (money in) and expense
// (money out) reconciliation views.

const normalize = (s) => String(s || '').toLowerCase();

// Distinctive words from a bank line description, usable as a rule keyword.
export function describeKeyword(description) {
  const tokens = normalize(description).replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((t) => t.length >= 4);
  return tokens.slice(0, 3).join(' ');
}

function nameMentionedIn(description, name) {
  const words = normalize(name).split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
  if (!words.length) return false;
  const desc = normalize(description);
  const hits = words.filter((w) => desc.includes(w)).length;
  return hits >= Math.min(2, words.length);
}

// Suggest a document for a statement line the Xero way, in priority order:
// 1. a saved bank rule whose keyword appears in the description,
// 2. a unique exact-amount candidate,
// 3. a unique candidate whose name the description mentions.
// entries: [{ doc, name, amount }]
export function suggestFor(line, rules, entries) {
  const dir = line.amount >= 0 ? 'money_in' : 'money_out';
  const desc = normalize(line.description);
  const sorted = rules
    .filter((r) => r.direction === dir && r.keyword)
    .sort((a, b) => (b.use_count || 0) - (a.use_count || 0));
  for (const rule of sorted) {
    if (desc.includes(normalize(rule.keyword))) {
      const hit = entries.filter((e) => e.name === rule.target_name);
      if (hit.length === 1) return { doc: hit[0].doc, rule, basis: 'rule' };
    }
  }
  const byAmount = entries.filter((e) => Math.abs(e.amount - Math.abs(line.amount)) < 0.01);
  if (byAmount.length === 1) return { doc: byAmount[0].doc, rule: null, basis: 'amount' };
  const byName = entries.filter((e) => e.name && nameMentionedIn(line.description, e.name));
  if (byName.length === 1) return { doc: byName[0].doc, rule: null, basis: 'name' };
  return { doc: null, rule: null, basis: null };
}

// Counts a confirmed match that came from a rule, so Xero-style "most used"
// rules win when several keywords could match.
export async function recordRuleUse(rule) {
  if (!rule) return;
  await base44.entities.BankRule.update(rule.id, {
    use_count: (rule.use_count || 0) + 1,
    last_used_at: new Date().toISOString(),
  });
}

// Saves a new rule, or returns the existing one if this exact rule exists.
export async function saveRule(direction, keyword, targetName, createdByName) {
  const kw = normalize(keyword).trim();
  if (!kw) return null;
  const existing = await base44.entities.BankRule.filter({
    direction, keyword: kw, target_name: targetName,
  }, { limit: 1 });
  if (existing.items?.length) return existing.items[0];
  return base44.entities.BankRule.create({
    keyword: kw, direction, target_name: targetName, created_by: createdByName || '',
  });
}

export async function deleteRule(id) {
  await base44.entities.BankRule.delete(id);
}

// Parses pasted or uploaded bank statement CSV (one row: date,description,amount).
// makeNegative stores every line as an outflow (for the expense side).
export function parseStatementCsv(text, { makeNegative = false } = {}) {
  return String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(',').map((s) => s.trim());
      if (parts.length < 3) return null;
      const [date, description, rawAmount] = parts;
      let amount = Number(rawAmount.replace(/[$\s]/g, ''));
      if (!Number.isFinite(amount)) return null;
      if (makeNegative) amount = -Math.abs(amount);
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : (() => { const d = new Date(date); return isNaN(d.getTime()) ? null : format(d, 'yyyy-MM-dd'); })();
      if (!iso) return null;
      return { statement_date: iso, description: description || '', amount };
    })
    .filter(Boolean);
}