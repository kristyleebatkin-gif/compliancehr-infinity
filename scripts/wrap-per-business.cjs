// Release 2: wraps backend functions with perBusiness() so every data access is limited to one
// business. Uses the TypeScript parser (not text search) to find the default export.
//
//   node scripts/wrap-per-business.cjs          -> dry run, lists what would change
//   node scripts/wrap-per-business.cjs --apply  -> rewrites base44/functions/*/entry.ts
//
// Skipped on purpose (see SKIP): the owner-only tagging tool, functions already scoped another
// way, and the two public functions handled by hand. Everything else is wrapped.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..', 'base44', 'functions');
const APPLY = process.argv.includes('--apply');

const SKIP = new Map([
  ['tenantMigration', 'owner-only tool that tags across businesses'],
  ['liveModuleOverview', 'already scoped with tenantContext'],
  ['updateCompanyBranding', 'already scoped with tenantContext'],
  ['workspacePin', 'per-user PIN, keyed to the signed-in account'],
  ['publicSubmissions', 'public form: business set by hand'],
  ['rosterIcsFeed', 'private calendar link: business set from the link by hand'],
]);

const SDK_IMPORT = /^import \{ createClientFromRequest \} from 'npm:@base44\/sdk@[0-9.]+';\s*$/m;
const NEW_IMPORT = "import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';";

const results = [];
for (const name of fs.readdirSync(ROOT).sort()) {
  const file = path.join(ROOT, name, 'entry.ts');
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  if (SKIP.has(name)) { results.push([name, 'skip', SKIP.get(name)]); continue; }
  if (src.includes('perBusiness(')) { results.push([name, 'skip', 'already wrapped']); continue; }
  // Every signed-in function is wrapped, including ones that reach data only through shared
  // helpers (AI usage logging, compliance scores, register stats), so nothing is missed.
  if (!SDK_IMPORT.test(src)) { results.push([name, 'MANUAL', 'unexpected SDK import']); continue; }
  const calls = (src.match(/\bcreateClientFromRequest\(/g) || []).length;
  if (calls !== 1) { results.push([name, 'MANUAL', `createClientFromRequest called ${calls} times`]); continue; }

  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const fn = sf.statements.find((s) =>
    ts.isFunctionDeclaration(s)
    && s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    && s.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword));
  if (!fn || !fn.body) { results.push([name, 'MANUAL', 'no default-export function declaration']); continue; }

  const start = fn.getStart(sf);            // at "export"
  const end = fn.getEnd();                  // just after the closing brace
  const header = src.slice(start, fn.body.getStart(sf));
  const m = header.match(/^export\s+default\s+(async\s+)?function\b/);
  if (!m) { results.push([name, 'MANUAL', 'unexpected export header']); continue; }
  const isAsync = Boolean(m[1]);

  const fnText = src.slice(start, end).replace(/^export\s+default\s+/, '');
  const wrappedFn = isAsync ? fnText : fnText.replace(/^function\b/, 'async function');
  let out = src.slice(0, start) + `export default perBusiness(${wrappedFn});` + src.slice(end);
  out = out.replace(SDK_IMPORT, NEW_IMPORT + '\n').replace(/\bcreateClientFromRequest\(/, 'createScopedClientFromRequest(');

  // Re-parse to be sure the result is still valid TypeScript.
  const check = ts.createSourceFile(file, out, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const diags = check.parseDiagnostics || [];
  if (diags.length) { results.push([name, 'MANUAL', `parse error after wrap: ${diags[0].messageText}`]); continue; }
  if (APPLY) fs.writeFileSync(file, out);
  results.push([name, APPLY ? 'wrapped' : 'would wrap', '']);
}

const by = (k) => results.filter((r) => r[1] === k);
for (const r of results) console.log(r.join('  '));
console.log(`\n${APPLY ? 'wrapped' : 'would wrap'}: ${by(APPLY ? 'wrapped' : 'would wrap').length}, skipped: ${by('skip').length}, manual: ${by('MANUAL').length}`);
