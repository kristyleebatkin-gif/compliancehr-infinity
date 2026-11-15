import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Link2, ShieldQuestion } from 'lucide-react';
import { PRIORITY_TONES, confidenceBand } from '@/lib/aiIntelligence';

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

function ChipList({ items, empty }) {
  const list = asList(items);
  if (!list.length) return <p className="text-xs font-medium text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((item, index) => (
        <span key={`${item}-${index}`} className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AiResponseReport({ review, registers }) {
  if (!review) return null;
  const band = confidenceBand(review.confidence_score);
  const priorityTone = PRIORITY_TONES[review.overall_priority] || PRIORITY_TONES.Medium;
  const findings = asList(review.key_findings);
  const recommendations = asList(review.recommendations);
  const traceability = asList(review.traceability);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${band.chip}`}>
          {band.label} · {review.confidence_score == null ? 'Uncalibrated' : `${review.confidence_score}% (unvalidated)`}
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${priorityTone}`}>
          {review.overall_priority} priority
        </span>
        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground">
          {review.agent} · {review.module}
        </span>
        {registers ? (
          <span className="text-[11px] font-semibold text-muted-foreground">
            Read {registers.controls} controls, {registers.evidence} evidence items, {registers.findings} findings, {registers.standards} standards
          </span>
        ) : null}
      </div>

      <section className="rounded-xl border border-border bg-white p-3"><h3 className="font-bold">Scope and confidence</h3><p className="text-sm">{review.confidence_method}</p>{asList(review.limitations).map((text,i)=><p key={i} className="mt-1 text-xs">{text}</p>)}<p className="mt-2 break-all text-xs">Snapshot SHA-256: {review.source_snapshot_hash || 'Not recorded'}</p></section>
      <section className="rounded-xl border border-brand/30 bg-brand/5 p-3">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-brand">Executive summary</h3>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">{review.executive_summary}</p>
      </section>

      <section>
        <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
          <ShieldQuestion className="h-3.5 w-3.5" /> Key findings
        </h3>
        {findings.length ? (
          <ul className="mt-2 space-y-1.5">
            {findings.map((finding, index) => (
              <li key={index} className="rounded-lg border border-border px-3 py-2">
                <div className="text-xs font-bold text-foreground">{finding.finding}</div>
                {finding.evidence ? (
                  <div className="mt-0.5 text-[11px] font-medium leading-snug text-muted-foreground">
                    Evidence: {finding.evidence}
                  </div>
                ) : null}
                {Array.isArray(finding.source_ids) && <p className="mt-1 break-all text-xs">Source record IDs: {finding.source_ids.join(', ')}</p>}
                {finding.confidence != null ? (
                  <div className="mt-0.5 text-[10px] font-bold text-muted-foreground">Confidence {finding.confidence}%</div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs font-medium text-muted-foreground">No findings were returned.</p>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section>
          <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Standards impacted</h3>
          <div className="mt-2"><ChipList items={review.standards_impacted} empty="None identified." /></div>
        </section>
        <section>
          <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Controls impacted</h3>
          <div className="mt-2"><ChipList items={review.controls_impacted} empty="None identified." /></div>
        </section>
      </div>

      <section>
        <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Associated risks</h3>
        <div className="mt-2"><ChipList items={review.associated_risks} empty="No risk exposure identified from these records." /></div>
      </section>

      <section>
        <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
          <BadgeCheck className="h-3.5 w-3.5" /> Recommendations
        </h3>
        {recommendations.length ? (
          <ul className="mt-2 space-y-2">
            {recommendations.map((item, index) => (
              <li key={index} className="rounded-lg border border-border px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${PRIORITY_TONES[item.priority] || PRIORITY_TONES.Medium}`}>
                    {item.priority || 'Medium'}
                  </span>
                  <span className="min-w-0 flex-1 text-xs font-bold text-foreground">{item.action}</span>
                  {item.confidence != null ? (
                    <span className="text-[10px] font-bold text-muted-foreground">{item.confidence}%</span>
                  ) : null}
                </div>
                {item.reasoning ? (
                  <p className="mt-1 text-[11px] font-medium leading-snug text-muted-foreground">{item.reasoning}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs font-medium text-muted-foreground">No recommendations were returned.</p>
        )}
      </section>

      <section>
        <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" /> Traceability map
        </h3>
        {traceability.length ? (
          <ul className="mt-2 space-y-1">
            {traceability.map((link, index) => (
              <li key={index} className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5">{link.from}</span>
                <span className="text-muted-foreground">{link.relationship}</span>
                <span className="rounded bg-muted px-1.5 py-0.5">{link.to}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs font-medium text-muted-foreground">No traceability links were returned.</p>
        )}
      </section>

      <section className="rounded-xl border border-border p-3"><h3 className="font-bold">Supporting source records</h3>{asList(review.supporting_evidence).map(source=><p className="break-all text-xs" key={source.entity+source.id}>{source.entity} · {source.id} · updated {source.updated_date || 'Unknown'}</p>)}<Link className="text-sm underline" to="/compliance">Open authorised assurance registers to verify source records</Link><h3 className="mt-3 font-bold">Associated audits</h3><p className="text-xs">{asList(review.associated_audits).join(', ') || 'No audit-source records supplied; not evaluated.'}</p></section>
      <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] font-semibold text-foreground">
        Every recommendation is recorded in the recommendation queue awaiting human verification, and this review is written to the AI audit log.
      </p>
    </div>
  );
}
