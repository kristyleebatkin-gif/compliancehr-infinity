import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Filter, FileCheck2, Users,
} from 'lucide-react';

const CORE_STANDARDS_MAP = [
  {
    id: 'ndis-1',
    code: 'NDIS Core 1 & Aged Care Std 1',
    title: 'Rights, Informed Choice & Privacy Consent',
    categories: ['Rights & Responsibilities', 'Privacy', 'Participant', 'Consent'],
    docTypes: ['Participant Handbook', 'Service Agreement', 'Consent to Share Information'],
  },
  {
    id: 'ndis-2',
    code: 'NDIS Core 2 & Aged Care Std 2',
    title: 'Provider Governance & Operational Management',
    categories: ['Governance', 'Policy', 'Quality', 'Operations', 'Compliance'],
    docTypes: ['Contract', 'Policy'],
  },
  {
    id: 'ndis-3',
    code: 'NDIS Core 3 & Aged Care Std 3',
    title: 'Provision of Supports & Care Delivery',
    categories: ['Clinical', 'Procedure', 'Human Resources', 'Training'],
    docTypes: ['Participant Support Plan', 'Qualifications', 'NDIS Plan'],
  },
  {
    id: 'ndis-4',
    code: 'NDIS Core 4 & Aged Care Std 4–5',
    title: 'Safe Environment, Worker Screening & Medication',
    categories: ['WHS', 'Risk', 'Risk Management', 'Incident Management', 'Medication', 'Mandatory'],
    docTypes: ['NDIS Worker Screening', 'Police Check', 'First Aid Certificate', 'CPR Certificate', 'Home Risk Assessment'],
  },
];

export default function StandardsEvidenceGapStrip({
  onlyGaps = false,
  onToggleOnlyGaps,
}) {
  const [coverage, setCoverage] = useState([]);
  const [ackSummary, setAckSummary] = useState({ totalAcks: 0, staffCount: 0, pct: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadCoverage() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [
          docControlsRes,
          policiesRes,
          empDocsRes,
          partDocsRes,
          acksRes,
          polAcksRes,
          staffRes,
        ] = await Promise.all([
          base44.entities.DocumentControl.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
          base44.entities.Policy.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
          base44.entities.EmployeeDocument.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
          base44.entities.ParticipantDocument.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
          base44.entities.DocumentAcknowledgement.filter({}, { limit: 200 }).catch(() => ({ items: [] })),
          base44.entities.PolicyAcknowledgement.filter({}, { limit: 200 }).catch(() => ({ items: [] })),
          base44.entities.StaffProfile.filter({ status: 'Active' }, { limit: 100 }).catch(() => ({ items: [] })),
        ]);

        if (cancelled) return;

        const docControls = docControlsRes?.items || [];
        const policies = policiesRes?.items || [];
        const empDocs = empDocsRes?.items || [];
        const partDocs = partDocsRes?.items || [];
        const totalAcks = (acksRes?.items || []).length + (polAcksRes?.items || []).length;
        const staffCount = Math.max(1, (staffRes?.items || []).length);

        const rows = CORE_STANDARDS_MAP.map((std) => {
          const matchedControls = docControls.filter((d) =>
            std.categories.includes(d.document_category)
          );
          const matchedPolicies = policies.filter((p) =>
            std.categories.includes(p.category)
          );
          const matchedEmp = empDocs.filter((e) =>
            std.docTypes.includes(e.document_type)
          );
          const matchedPart = partDocs.filter((p) =>
            std.docTypes.includes(p.document_type)
          );

          const totalItems =
            matchedControls.length +
            matchedPolicies.length +
            matchedEmp.length +
            matchedPart.length;

          const expiredOrReviewCount =
            matchedControls.filter((d) => d.status === 'Review' || (d.review_date && d.review_date < todayStr)).length +
            matchedPolicies.filter((p) => p.status === 'Expired' || (p.review_date && p.review_date < todayStr)).length +
            matchedEmp.filter((e) => e.status === 'Expired' || (e.expiry_date && e.expiry_date < todayStr)).length +
            matchedPart.filter((p) => p.status === 'Expired' || p.status === 'Missing').length;

          return {
            ...std,
            totalItems,
            expiredOrReviewCount,
            hasGap: totalItems === 0 || expiredOrReviewCount > 0,
          };
        });

        setCoverage(rows);
        setAckSummary({
          totalAcks,
          staffCount,
          pct: Math.min(100, Math.round((totalAcks / Math.max(1, staffCount * 2)) * 100)),
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCoverage();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleStandards = onlyGaps ? coverage.filter((c) => c.hasGap) : coverage;

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-sm">
      <div className="flex flex-col gap-3 bg-[#F0F7FF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-sky-200">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0A2B6D] text-white">
            <FileCheck2 className="h-4 w-4 text-[#00C6FF]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Standard-by-Standard Evidence Coverage Matrix
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-[#0A2B6D]">
                <Users className="h-3 w-3 text-[#0072FF]" />
                {ackSummary.totalAcks} Staff Read &amp; Acknowledged Sign-Offs Logged
              </span>
            </div>
            <p className="text-xs font-semibold text-[#0A2B6D]/80">
              Every NDIS Practice Standard &amp; Strengthened Aged Care Standard mapped to live vault evidence.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onToggleOnlyGaps && (
            <button
              type="button"
              onClick={onToggleOnlyGaps}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                onlyGaps
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'border border-[#0072FF] bg-white text-[#0A2B6D] hover:bg-sky-50'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{onlyGaps ? 'Showing Expired / Missing Gaps Only' : 'Show Only Missing / Expiring Evidence'}</span>
            </button>
          )}
          <Link
            to="/governance"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A2B6D] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>Controlled Governance Register</span>
          </Link>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 gap-2.5 p-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleStandards.length === 0 ? (
            <div className="col-span-full flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-extrabold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              All 4 Core NDIS &amp; Aged Care Standard Groups have verified evidence with zero overdue gaps.
            </div>
          ) : (
            visibleStandards.map((std) => (
              <div
                key={std.id}
                className={`rounded-xl border p-3 ${
                  std.hasGap
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-emerald-200 bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                    {std.code}
                  </span>
                  {std.hasGap ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      {std.expiredOrReviewCount > 0 ? `${std.expiredOrReviewCount} Review/Expired` : 'Evidence Needed'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs font-extrabold text-[#0A2B6D]">
                  {std.title}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>{std.totalItems} Linked Evidence Item(s)</span>
                  <span className="text-[#0A2B6D]">
                    {std.totalItems > 0
                      ? `${Math.max(0, Math.round(((std.totalItems - std.expiredOrReviewCount) / std.totalItems) * 100))}% Current`
                      : '0%'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}