import { FORM_QUESTION_SPLITS } from '@/lib/formQuestionSplits';

const optionalPattern = /optional|if applicable|if relevant|if different|prefer not to say/i;
const SINGLE_LINE = /date|time|postcode|\bBSB\b|\bABN\b|\bUSI\b|number|phone|mobile|rating|frequency/i;
const SMALL_WORDS = /^(a|an|and|as|at|but|by|for|in|nor|of|on|or|per|the|to|via|with)$/i;

/** Title Format: capitalises every significant word, keeping acronyms (NDIS, ABN) intact. */
export function titleCase(text) {
  let first = true;
  return String(text || '').split(/(\s+)/).map((token) => {
    if (!token.trim()) return token;
    if (!first && SMALL_WORDS.test(token.toLowerCase())) { first = false; return token.toLowerCase(); }
    first = false;
    return token.replace(/[A-Za-z][A-Za-z'’]*/g, (word) => (
      word.length > 1 && /^[A-Z][A-Z0-9&/.-]*$/.test(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ));
  }).join('');
}
export const answerText = (value) => Array.isArray(value) ? value.join('; ') : String(value ?? '');
export function fieldAnswer(field, answers = {}) {
  return answers[field.label] || (field.legacyLabel ? answers[field.legacyLabel] : '') || field.value || '';
}
function prepare(field) {
  if (field.questionReady) return field;
  const f = { ...field, questionReady: true };
  const label = f.label;
  f.question = f.question || label;
  f.optional = f.optional || optionalPattern.test(label) || /^(religion|country of birth|aboriginal|refugee)/i.test(label);
  const match = label.match(/\(([^()]*(?:\/|Yes\s*\/\s*No)[^()]*)\)/i);
  if (!f.options && match && !/e\.g\.|if |name|number|date|phone|address|signature|reference/i.test(match[1])) {
    f.options = match[1].split(/\s*\/\s*/).filter(Boolean);
    f.question = label.replace(match[0], '').trim();
    f.type = /select all|support needs|expectations|reportable|incident type|powers granted|medication support|required services/i.test(label) ? 'multiple' : 'single';
  }
  if (!f.options && /^(acknowledgement|declaration):/i.test(label)) {
    f.options = ['Acknowledged']; f.type = 'multiple';
  }
  if (!f.options && /^(interpreter required|emergency pendant fitted)/i.test(label)) { f.options = ['Yes', 'No', 'Not applicable']; f.type = 'single'; }
  if (/^Aboriginal or Torres Strait Islander status/i.test(label)) {
    f.options = ['Aboriginal', 'Torres Strait Islander', 'Both', 'Neither', 'Prefer not to say']; f.type = 'single';
    f.question = 'Aboriginal or Torres Strait Islander status';
  }
  if (/^Refugee or asylum seeker status/i.test(label)) { f.options = ['Refugee', 'Asylum seeker', 'Neither', 'Prefer not to say']; f.type = 'single'; f.question = 'Refugee or asylum seeker status'; }
  if (f.options) { f.multiline = false; f.help = f.help || (f.type === 'multiple' ? 'Select all that apply.' : 'Select one option.'); }
  f.question = titleCase(f.question);
  f.lines = f.lines || (f.multiline ? 4 : 1);
  // Dates, numbers, phone numbers and similar short answers only ever need one ruled line.
  if (!f.options && !f.multiline && SINGLE_LINE.test(label)) { f.singleLine = true; f.lines = 1; }
  f.size = f.size || (f.options ? (f.options.length > 3 || f.question.length > 85 ? 'long' : 'medium') : f.multiline || f.fullWidth ? 'long' : SINGLE_LINE.test(label) ? 'short' : /address|email|signature/i.test(label) ? 'medium' : 'medium');
  return f;
}
export function normaliseFormFields(fields = []) {
  const expanded = fields.flatMap((field) => {
    if (field.questionReady) return [field];
    const split = FORM_QUESTION_SPLITS[field.label];
    if (split) return split.map((label, index) => prepare({ label, optional: field.optional, required: field.required, ...(index === 0 ? { legacyLabel: field.label } : {}), multiline: field.multiline && /details|strategies|procedure|plan|comments|reason|outcome/i.test(label) }));
    const combinedChoice = field.label.match(/^(.*?)\s*\((Yes\s*\/\s*No)\)\s+and\s+(.+)$/i);
    if (combinedChoice) return [prepare({ ...field, multiline: false, question: combinedChoice[1], options: ['Yes', 'No', 'Not applicable'], type: 'single' }), prepare({ label: `${combinedChoice[1]} — ${combinedChoice[3]}`, multiline: true, optional: true })];
    return [prepare(field)];
  });
  return expanded.filter((field, index) => expanded.findIndex((item) => item.label === field.label) === index);
}
export function formQuestionRows(fields = []) {
  const result = [];
  for (let i = 0; i < fields.length;) {
    const a = fields[i], b = fields[i + 1];
    if (a.size !== 'long' && b && b.size !== 'long') {
      const spans = a.size === b.size ? [6, 6] : a.size === 'short' ? [4, 8] : [8, 4];
      result.push([{ field: a, span: spans[0] }, { field: b, span: spans[1] }]); i += 2;
    } else { result.push([{ field: a, span: a.size === 'short' ? 6 : 12 }]); i++; }
  }
  return result;
}
export function legacyFormFields(fields, answers = {}) {
  const keys = new Set(fields.flatMap((f) => [f.label, f.legacyLabel].filter(Boolean)));
  return Object.keys(answers).filter((key) => !keys.has(key) && !key.startsWith('_') && answerText(answers[key]).trim()).map((key) => prepare({ label: key, question: `Earlier saved answer: ${key}`, multiline: true, value: answerText(answers[key]), optional: true }));
}
export function validFieldChoice(field, value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return field.type === 'multiple' ? values.filter((v) => field.options.includes(v)) : field.options.includes(value) ? value : '';
}