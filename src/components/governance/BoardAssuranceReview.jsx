import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { enterpriseScope, readBoardAssurance, ASSURANCE_COLUMNS } from '@/lib/enterpriseReadModel';
import { downloadCsv } from '@/lib/csvExport';
import { Button } from '@/components/ui/button';

export default function BoardAssuranceReview() {
  const { user } = useAuth();
  const scope = enterpriseScope(user);
  const key = scope?.key;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(null);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  useEffect(() => {
    let cancelled = false;
    readBoardAssurance({ entities: base44.entities, user, today })
      .then(data => { if (!cancelled) setState({ key, attempt, data }); })
      .catch(() => { if (!cancelled) setState({ key, attempt, error: true }); });
    return () => { cancelled = true; };
  }, [key, attempt, today]);
  const current = state?.key === key && state?.attempt === attempt ? state : null;
  const data = current?.data;
  const rows = (data?.items || []).filter(row => !attentionOnly || row.attention !== 'No metadata gaps detected');
  return (
    <section className="space-y-3 rounded-xl border border-[#C084FC] bg-white p-4 text-[#0A2B6D]">
      <h2 className="text-lg font-extrabold">Board assurance review</h2>
      <p className="text-sm">Review governance owners, review dates and recorded evidence references. References have not been checked for validity, approval or exact document version. This review does not certify assurance.</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={attentionOnly} onChange={event => setAttentionOnly(event.target.checked)} />Show records needing attention</label>
        <Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Refresh</Button>
        <Button disabled={!data || !rows.length} onClick={() => downloadCsv('board-assurance-review.csv', ASSURANCE_COLUMNS, rows)}>Export displayed records (CSV)</Button>
        <Link to="/governance?tab=objects" className="text-sm font-bold underline">Manage governance records</Link>
      </div>
      {!current && <p role="status">Loading authorised governance records…</p>}
      {current?.error && <p role="alert">Governance records are unavailable. Check your access or try Refresh.</p>}
      {data && <p className="text-xs">{data.limited ? 'Limited to the first 200 accessible records. This is not a complete board pack.' : 'Accessible non-archived governance records.'} {rows.length} displayed. Review date: {today} (Brisbane).</p>}
      {data && !rows.length && <p>No records match this review.</p>}
      {rows.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">Governance assurance metadata review</caption>
        <thead><tr>{['Record', 'Owner', 'Review due', 'Evidence references', 'Attention'].map(label => <th key={label} scope="col" className="border-b p-2">{label}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}><td className="border-b p-2">{row.object_code} {row.title}<p className="text-xs">{row.status}</p></td><td className="border-b p-2">{row.business_owner || 'Unassigned'}</td><td className="border-b p-2">{row.review_date || 'Not recorded'}</td><td className="border-b p-2">{row.evidence_count} (unverified)</td><td className="border-b p-2">{row.attention}</td></tr>)}</tbody>
      </table></div>}
    </section>
  );
}
