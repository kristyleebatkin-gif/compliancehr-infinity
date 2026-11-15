import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { enterpriseScope } from '@/lib/enterpriseReadModel';
import { readTraceabilityReview, TRACE_COLUMNS } from '@/lib/evidenceTraceabilityReview';
import { downloadCsv } from '@/lib/csvExport';
import { Button } from '@/components/ui/button';

const STATES = {
  missing: 'Not recorded', resolved: 'Resolved in this review',
  unresolved: 'Not resolved in this review', ambiguous: 'Duplicate reference — review required',
  'self-reference': 'Self reference — review required', 'stage-mismatch': 'Different lifecycle stage — review required',
};

export default function EvidenceTraceabilityReview() {
  const { user } = useAuth();
  const key = enterpriseScope(user)?.key;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(null);
  const [search, setSearch] = useState('');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [selection, setSelection] = useState(null);
  useEffect(() => {
    let cancelled = false;
    readTraceabilityReview({ entities: base44.entities, user })
      .then(data => { if (!cancelled) setState({ key, attempt, data }); })
      .catch(() => { if (!cancelled) setState({ key, attempt, error: true }); });
    return () => { cancelled = true; };
  }, [key, attempt]);
  const current = state?.key === key && state?.attempt === attempt ? state : null;
  const data = current?.data;
  const query = search.trim().toLowerCase();
  const rows = (data?.items || []).filter(row =>
    (!attentionOnly || row.attention !== 'No metadata gaps detected') &&
    (!query || [row.reference, row.title, row.stage, row.owner].some(value => value.toLowerCase().includes(query))),
  );
  const selected = rows.find(row => selection?.key === key && row.id === selection.id) || rows[0];
  return (
    <section className="space-y-4 rounded-xl border border-[#9333EA]/30 bg-white p-4 text-[#0A2B6D]">
      <div>
        <h2 className="text-lg font-extrabold">Evidence traceability review</h2>
        <p className="mt-1 max-w-4xl text-sm">Inspect the explicit policy, procedure, plan, form, register, audit, corrective action and evidence references recorded on governance records. Only exact record IDs and unique document codes within this review resolve.</p>
        <p className="mt-2 text-sm">A resolved reference confirms a record match. Approval, exact evidence versions, file access and a complete assurance chain still require verification. Standard, requirement, obligation, control, report and board-decision relationships are outside this review.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-col gap-1 text-sm font-semibold">Search reviewed records
          <input className="rounded-lg border border-slate-300 px-3 py-2 font-normal" value={search} onChange={event => setSearch(event.target.value)} placeholder="Reference, title, stage or owner" />
        </label>
        <label className="flex items-center gap-2 py-2 text-sm"><input type="checkbox" checked={attentionOnly} onChange={event => setAttentionOnly(event.target.checked)} />Needs attention</label>
        <Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Refresh</Button>
        <Button disabled={!data || !rows.length} onClick={() => downloadCsv('evidence-traceability-review.csv', TRACE_COLUMNS, rows)}>Export displayed records (CSV)</Button>
        <Link className="py-2 text-sm font-bold underline" to="/governance?tab=objects">Manage governance records</Link>
      </div>
      {!current && <p role="status">Loading authorised governance records…</p>}
      {current?.error && <p role="alert">Traceability records are unavailable. Check your access or select Refresh to retry.</p>}
      {data && <p className="text-sm" role="status">{rows.length} records displayed. {data.limited ? 'Review limited to the first 200 accessible records. References outside this sample may remain unresolved.' : 'Accessible non-archived governance records. References to other registers remain unresolved.'}</p>}
      {data && !rows.length && <p>No records match this review.</p>}
      {rows.length > 0 && <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Governance evidence references and metadata gaps</caption>
          <thead className="bg-[#4F46E5]/5"><tr>{['Record', 'Stage / version', 'Owner', 'Reference matches', 'Attention'].map(label => <th className="border-b p-3" scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.id} className={selected?.id === row.id ? 'bg-[#9333EA]/5' : ''}>
            <td className="border-b p-3"><button type="button" className="text-left font-semibold underline" aria-pressed={selected?.id === row.id} onClick={() => setSelection({ key, id: row.id })}>{row.reference || 'No code'} · {row.title || 'Untitled record'}</button></td>
            <td className="border-b p-3">{row.stage || 'Not recorded'}<p className="text-xs">{row.version || 'Version not recorded'}</p></td>
            <td className="border-b p-3">{row.owner || 'Unassigned'}</td>
            <td className="border-b p-3">{row.resolved} of {row.recorded} recorded references resolved</td>
            <td className="border-b p-3">{row.attention}</td>
          </tr>)}</tbody>
        </table>
      </div>}
      {selected && <div className="space-y-2 rounded-xl border border-[#EC4899]/30 p-4">
        <h3 className="font-bold">Recorded relationships · {selected.reference || selected.title || 'Selected record'}</h3>
        <ul className="grid gap-2 md:grid-cols-2">{selected.links.map((link, index) => <li key={link.field + index} className="rounded-lg border border-slate-200 p-3 text-sm">
          <p className="font-semibold">{link.label}</p><p>{STATES[link.state]}</p>
          {link.state === 'resolved' && <p className="mt-1">Linked record: {link.targetTitle || 'Untitled'} · {link.targetStage || 'Stage missing'} · {link.targetVersion || 'Version missing'}</p>}
        </li>)}</ul>
        <p className="text-xs">Missing fields may be inapplicable to an individual record. External file locations are omitted from this review and its export. Version labels describe records; they do not prove a version-pinned relationship.</p>
      </div>}
    </section>
  );
}
