import React from 'react';

export const STATUS_TONE = {
  present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-800 border-amber-200',
  planned: 'bg-slate-50 text-slate-700 border-slate-200',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  unverified: 'bg-blue-50 text-blue-700 border-blue-200',
};

const FACTORY_LABEL = {
  reused: 'Reused in the app',
  'generated-reference': 'Generated, reference only',
  'not-generated': 'Not generated',
};

const FACTORY_TONE = {
  reused: 'bg-blue-50 text-blue-700 border-blue-200',
  'generated-reference': 'bg-purple-50 text-purple-700 border-purple-200',
  'not-generated': 'bg-slate-50 text-slate-600 border-slate-200',
};

/** @param {any} props */
export function StatusPill({ status = '' } = {}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[status] || STATUS_TONE.planned}`}>
      {status || 'unknown'}
    </span>
  );
}

/** @param {any} props */
export function FactoryPill({ state = '' } = {}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${FACTORY_TONE[state] || FACTORY_TONE['not-generated']}`}>
      {FACTORY_LABEL[state] || state || 'Unknown'}
    </span>
  );
}

/** @param {any} props */
export function PmmEmpty({ title = 'Nothing to show', body = '' } = {}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm font-bold text-[#0A2B6D]">{title}</p>
      {body ? <p className="mx-auto mt-1 max-w-xl text-xs text-[#0A2B6D]/70">{body}</p> : null}
    </div>
  );
}

/** @param {any} props */
export function CodeBlock({ text = '', language = '', height = 'max-h-80' } = {}) {
  return (
    <div className="min-w-0">
      {language ? <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">{language}</p> : null}
      <pre className={`${height} overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 text-[#0A2B6D]`}>
        <code>{text}</code>
      </pre>
    </div>
  );
}

/** @param {any} props */
export function PanelNote({ children = null } = {}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
      {children}
    </div>
  );
}