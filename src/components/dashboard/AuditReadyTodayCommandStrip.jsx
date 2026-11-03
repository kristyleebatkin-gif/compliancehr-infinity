import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, AlertTriangle, Clock, FileCheck2, Users, ChevronDown, ChevronUp, ArrowRight, CheckCircle2,
} from 'lucide-react';

export default function AuditReadyTodayCommandStrip() {
  const [metrics, setMetrics] = useState({
    loading: true,
    readinessScore: 94,
    statutoryDueCount: 0,
    expiringClearancesCount: 0,
    overduePoliciesCount: 0,
    unmetEvidenceCount: 0,
    priorityItems: [],
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadReadinessPulse() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const in30DaysStr = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

        const [
          snapshotsRes,
          incidentsRes,
          empDocsRes,
          certsRes,
          policiesRes,
          docControlsRes,
        ] = await Promise.all([
          base44.entities.ExecutiveScoreSnapshot.list({ sort: '-snapshot_date', limit: 1 }).catch(() => ({ items: [] })),
          base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { sort: '-created_date', limit: 30 }).catch(() => ({ items: [] })),
          base44.entities.EmployeeDocument.filter({}, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
          base44.entities.Certificate.filter({}, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
          base44.entities.Policy.filter({}, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
          base44.entities.DocumentControl.filter({}, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
        ]);

        if (cancelled) return;

        const latestSnap = (snapshotsRes?.items || [])[0];
        const incidents = incidentsRes?.items || [];
        const empDocs = empDocsRes?.items || [];
        const certs = certsRes?.items || [];
        const policies = policiesRes?.items || [];
        const docControls = docControlsRes?.items || [];

        const statutoryIncidents = incidents.filter(
          (i) =>
            (i.requires_ndis_report && !i.initial_notified_at) ||
            (i.sirs_reportable && !i.sirs_notified_at) ||
            (i.five_day_follow_up_due && !i.five_day_follow_up_submitted)
        );

        const expiringDocs = [
          ...empDocs.filter(
            (d) =>
              d.status === 'Expired' ||
              d.status === 'Expiring Soon' ||
              (d.expiry_date && d.expiry_date <= in30DaysStr)
          ),
          ...certs.filter(
            (c) =>
              c.status === 'Expired' ||
              c.status === 'Expiring Soon' ||
              (c.expiry_date && c.expiry_date <= in30DaysStr)
          ),
        ];

        const overduePolicies = [
          ...policies.filter((p) => p.status === 'Expired' || (p.review_date && p.review_date < todayStr)),
          ...docControls.filter((d) => d.status === 'Review' || (d.review_date && d.review_date < todayStr)),
        ];

        const draftEvidence = docControls.filter((d) => d.status === 'Draft');

        const computedScore = latestSnap?.compliance_score
          ? Math.round(latestSnap.compliance_score)
          : Math.max(
              68,
              100 -
                statutoryIncidents.length * 8 -
                Math.min(12, expiringDocs.length * 2) -
                Math.min(10, overduePolicies.length * 2)
            );

        const priorityItems = [
          ...statutoryIncidents.slice(0, 2).map((inc) => ({
            id: `inc-${inc.id}`,
            badge: inc.sirs_reportable ? 'SIRS Statutory Watch' : 'NDIS 24h / 5d Watch',
            tone: 'danger',
            title: inc.title || 'Reportable Incident Notification Pending',
            meta: `${inc.category || 'Incident'} · ${inc.status || 'Open'}`,
            to: `/incidents/${inc.id}`,
            cta: 'Complete Statutory Step',
          })),
          ...expiringDocs.slice(0, 2).map((doc, idx) => ({
            id: `clr-${doc.id || idx}`,
            badge: doc.status === 'Expired' ? 'Clearance Expired' : 'Expiring < 30d',
            tone: doc.status === 'Expired' ? 'danger' : 'warning',
            title: `${doc.employee_name || doc.staff_name || 'Staff Member'} — ${doc.document_type || doc.module_title || doc.title}`,
            meta: doc.expiry_date ? `Expiry: ${doc.expiry_date}` : 'Verification required',
            to: '/compliance',
            cta: 'Verify Clearance',
          })),
          ...overduePolicies.slice(0, 2).map((pol, idx) => ({
            id: `pol-${pol.id || idx}`,
            badge: 'Policy Review Due',
            tone: 'warning',
            title: pol.document_name || pol.title || 'Controlled Governance Policy',
            meta: pol.review_date ? `Review due: ${pol.review_date}` : 'Scheduled review',
            to: '/documents',
            cta: 'Review & Approve',
          })),
        ];

        setMetrics({
          loading: false,
          readinessScore: computedScore,
          statutoryDueCount: statutoryIncidents.length,
          expiringClearancesCount: expiringDocs.length,
          overduePoliciesCount: overduePolicies.length,
          unmetEvidenceCount: draftEvidence.length,
          priorityItems,
        });
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setMetrics((m) => ({ ...m, loading: false }));
        }
      }
    }
    loadReadinessPulse();
    return () => {
      cancelled = true;
    };
  }, []);

  const isCritical = metrics.statutoryDueCount > 0;
  const isWarning = !isCritical && (metrics.expiringClearancesCount > 0 || metrics.overduePoliciesCount > 0);

  const statusConfig = isCritical
    ? {
        label: 'STATUTORY ACTION DUE TODAY',
        pillBg: 'bg-rose-500/20 border-rose-400/50 text-rose-200',
        dot: 'bg-rose-400',
      }
    : isWarning
    ? {
        label: 'AUDIT READY · ATTENTION ITEMS DUE',
        pillBg: 'bg-amber-500/20 border-amber-300/50 text-amber-200',
        dot: 'bg-amber-400',
      }
    : {
        label: 'AUDIT READY TODAY',
        pillBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
        dot: 'bg-emerald-400',
      };

  return (
    <section
      aria-label="Am I Audit Ready Today Command Strip"
      className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md"
    >
      <div
        className="px-4 py-3.5 sm:px-6 text-white"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Am I Okay Today? Status + Headline */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${statusConfig.pillBg}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-[#00C6FF]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Readiness Score: {metrics.readinessScore}%
              </span>
            </div>
            <h2 className="text-base font-extrabold tracking-tight text-white sm:text-lg">
              Here is exactly where your organisation stands today — and what needs your attention.
            </h2>
          </div>

          {/* Right: 3-Question Live Telemetry Pills + Expand Button */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/incidents"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/20"
            >
              <Clock className="h-4 w-4 text-[#00C6FF]" />
              <span>
                24h/5d Statutory Watch:{' '}
                <strong className={metrics.statutoryDueCount > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                  {metrics.statutoryDueCount} Pending
                </strong>
              </span>
            </Link>

            <Link
              to="/compliance"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/20"
            >
              <Users className="h-4 w-4 text-[#00C6FF]" />
              <span>
                Worker Clearances:{' '}
                <strong className={metrics.expiringClearancesCount > 0 ? 'text-amber-300' : 'text-emerald-300'}>
                  {metrics.expiringClearancesCount} Due / Expiring
                </strong>
              </span>
            </Link>

            <Link
              to="/documents"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/20"
            >
              <FileCheck2 className="h-4 w-4 text-[#00C6FF]" />
              <span>
                Evidence &amp; Reviews:{' '}
                <strong className={metrics.overduePoliciesCount > 0 ? 'text-amber-300' : 'text-emerald-300'}>
                  {metrics.overduePoliciesCount} Review Due
                </strong>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0072FF] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#00C6FF] hover:text-[#0A2B6D]"
            >
              <span>{expanded ? 'Hide Attention Queue' : 'View Today’s Priorities'}</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Priority Action Drawer */}
      {expanded && (
        <div className="border-t border-sky-100 bg-[#F8FAFC] p-4 sm:px-6">
          {metrics.priorityItems.length === 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-bold text-emerald-900">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                You’re all caught up. Every statutory timer, worker clearance, and policy review is on track today.
              </span>
              <Link
                to="/compliance"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0A2B6D] hover:underline"
              >
                Open Compliance Hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Today’s Prioritised Statutory &amp; Audit Readiness Actions
                </span>
                <Link
                  to="/compliance"
                  className="text-xs font-extrabold text-[#0072FF] hover:underline"
                >
                  Open Full Compliance &amp; Evidence Matrix →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                {metrics.priorityItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-sky-200 bg-white p-3.5 shadow-2xs"
                  >
                    <div className="space-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                          item.tone === 'danger'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {item.badge}
                      </span>
                      <div className="text-sm font-extrabold text-[#0A2B6D] line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-xs font-semibold text-slate-600">{item.meta}</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                      <Link
                        to={item.to}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
                      >
                        <span>{item.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}