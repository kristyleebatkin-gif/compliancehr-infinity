import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act as legacyAct } from 'react-dom/test-utils';
import { JSDOM } from 'jsdom';
import * as contract from '../src/lib/workspaceLayout.js';

const require = createRequire(import.meta.url);
const act = React.act || legacyAct;
function sourceModule(path, mocks) {
  const text = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(text, {
    fileName: path,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  Function('require', 'module', 'exports', compiled)((name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === 'react') return React;
    return require(name);
  }, module, module.exports);
  return module.exports.default;
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup(t) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
  const before = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(document.getElementById('root'));
  t.after(async () => {
    await act(async () => root.unmount());
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
    dom.window.close();
  });
  return { root, container: document.getElementById('root') };
}
const actor = { id: 'a', tenant_id: 'business-a', role: 'Administration', account_status: 'Active', access_approved: true };
const result = (version, viewState = 'Dashboard') => ({ data: { success: true, data: {
  layout: contract.defaultWorkspaceLayout(viewState), version, saved_by: 'Actor A', stored: true,
} } });

function layoutHarness(t) {
  const ui = setup(t);
  let identity = actor;
  let latest;
  const calls = [];
  const useLayout = sourceModule('src/components/workspace/useWorkspaceLayout.js', {
    '@/lib/useRole': { useRole: () => ({ user: identity, can: () => Boolean(identity) }) },
    '@/api/base44Client': { base44: { functions: { invoke: (_name, body) => {
      const pending = deferred(); calls.push({ body, ...pending }); return pending.promise;
    } } } },
    '@/lib/workspaceLayout': contract,
  });
  function Probe({ workspaceKey }) { latest = useLayout(workspaceKey); return React.createElement('span', null, latest.savedBy || latest.status); }
  return {
    ...ui, calls, get latest() { return latest; },
    render: async (workspaceKey = 'compliance', user = identity) => {
      identity = user;
      await act(async () => ui.root.render(React.createElement(Probe, { workspaceKey })));
    },
  };
}

test('changing workspaces hides the old layout and discards its delayed response', async (t) => {
  const h = layoutHarness(t);
  await h.render('compliance');
  const old = h.calls[0];
  await h.render('risks');
  assert.equal(h.latest.layout, null);
  await act(async () => h.calls[1].resolve(result(2, 'Selection')));
  await act(async () => old.resolve(result(99, 'History')));
  assert.equal(h.latest.version, 2);
  assert.equal(h.latest.layout.viewState, 'Selection');
});

test('an old load cannot overwrite a newer save, and duplicate local writes are refused', async (t) => {
  const h = layoutHarness(t);
  await h.render();
  let saving;
  await act(async () => { saving = h.latest.save(contract.defaultWorkspaceLayout('History'), 0); });
  const duplicate = await h.latest.reset(0);
  assert.equal(duplicate.code, 'SAVE_IN_PROGRESS');
  assert.equal(h.calls.length, 2);
  await act(async () => { h.calls[1].resolve(result(1, 'History')); await saving; });
  await act(async () => h.calls[0].resolve(result(0)));
  assert.equal(h.latest.version, 1);
  assert.equal(h.latest.layout.viewState, 'History');
});

test('identity changes discard successful and failed old requests, including return to the same account', async (t) => {
  const h = layoutHarness(t);
  await h.render();
  await act(async () => h.calls[0].resolve(result(1)));
  let history;
  await act(async () => { history = h.latest.history(); });
  const old = h.calls[1];
  await h.render('compliance', { ...actor, id: 'b', tenant_id: 'business-b' });
  assert.equal(h.latest.savedBy, null);
  await h.render('compliance', actor);
  await act(async () => old.reject(new Error('old identity details')));
  assert.equal((await history).code, 'CONTEXT_CHANGED');
  assert.equal(h.latest.error, null);
  assert.equal(h.latest.layout, null);
});

test('closing access immediately hides loaded personal layout metadata', async (t) => {
  const h = layoutHarness(t);
  await h.render();
  await act(async () => h.calls[0].resolve(result(4)));
  assert.equal(h.latest.savedBy, 'Actor A');
  await h.render('compliance', null);
  assert.equal(h.latest.savedBy, null);
  assert.equal(h.latest.permitted, false);
  assert.equal(h.latest.layout, null);
});

function historyHarness(t, history) {
  const ui = setup(t);
  const Dialog = ({ open, children }) => open ? React.createElement('div', null, children) : null;
  const Block = ({ children }) => React.createElement('div', null, children);
  const Icon = () => null;
  const History = sourceModule('src/components/workspace/WorkspaceVersionHistory.jsx', {
    '@/components/ui/dialog': { Dialog, DialogContent: Block, DialogTitle: Block, DialogDescription: Block },
    'lucide-react': { Loader2: Icon, GitCompare: Icon, RotateCcw: Icon },
    '@/lib/workspaceLayout': contract,
  });
  return {
    ...ui,
    render: async (open = true) => act(async () => ui.root.render(React.createElement(History, {
      open, onOpenChange: () => {}, workspace: { history, scope: 'workspace-a', version: 12, restore: async () => ({ ok: false }) },
    }))),
  };
}
const version = (n) => ({ id: 'v-' + n, version: n, layout: contract.defaultWorkspaceLayout() });

test('history loads once across parent rerenders and pages when total count is unavailable', async (t) => {
  const requests = [];
  const history = async (page) => { requests.push(page); return { ok: true, data: { items: [version(page ? 2 : 12)], totalPages: null, hasMore: page === 0 } }; };
  const h = historyHarness(t, history);
  await h.render();
  await h.render();
  assert.deepEqual(requests, [0]);
  const older = [...h.container.querySelectorAll('button')].find((node) => node.textContent === 'Older');
  assert.equal(older.disabled, false);
  await act(async () => older.click());
  assert.deepEqual(requests, [0, 1]);
  assert.match(h.container.textContent, /Page 2/);
});

test('closed history ignores delayed pages and unreadable snapshots cannot compare as equal', async (t) => {
  const pending = deferred();
  let count = 0;
  const h = historyHarness(t, async () => ++count === 1 ? pending.promise : { ok: true, data: {
    items: [version(2), { ...version(1), layout: null }], hasMore: false,
  } });
  await h.render(true);
  await h.render(false);
  await act(async () => pending.resolve({ ok: true, data: { items: [version(99)], hasMore: true } }));
  assert.equal(h.container.textContent, '');
  await h.render(true);
  const options = [...h.container.querySelectorAll('option[value="1"]')];
  assert.equal(options.length, 2);
  assert.ok(options.every((node) => node.disabled));
  assert.doesNotMatch(h.container.textContent, /These two versions describe the same layout/);
});
