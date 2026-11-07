import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, Clock, FileCheck2, Users, ChevronDown, ChevronUp, ArrowRight, CheckCircle2,
} from 'lucide-react';

export default function AuditReadyTodayCommandStrip() {
  const [metrics, setMetrics] = useState({
    loading: true,
    readinessScore: 94,
    statutoryDueCount: 0,
    expiringClearancesCount: 0,
    overduePoliciesCount: 0,
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
            title: inc.title || 'Reportable Incident Pending',
            to: `/incidents/${inc.id}`,
          })),
          ...expiringDocs.slice(0, 2).map((doc, idx) => ({
            id: `clr-${doc.id || idx}`,
            title: `${doc.employee_name || doc.staff_name || 'Staff'} — ${doc.document_type || doc.module_title || doc.title}`,
            to: '/compliance',
          })),
        ];

        setMetrics({
          loading: false,
          readinessScore: computedScore,
          statutoryDueCount: statutoryIncidents.length,
          expiringClearancesCount: expiringDocs.length,
          overduePoliciesCount: overduePolicies.length,
          priorityItems,
        });
      } catch {
        if (!cancelled) setMetrics((m) => ({ ...m, loading: false }));
      }
    }
    loadReadinessPulse();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      aria-label="Audit Ready Today Compact Strip"
      className="overflow-hidden rounded-xl border border-[#0072FF]/60 bg-workspace-navy px-3 py-2 text-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0072FF] bg-workspace-navy px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
            <ShieldCheck className="h-3 w-3 text-[#0072FF]" />
            Audit Ready: {metrics.readinessScore}%
          </span>
          <span className="text-[11px] font-semibold text-white/90">
            Live statutory &amp; clearance status across your organisation today.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-workspace-navy px-2 py-1 font-bold text-white hover:border-[#0072FF]"
          >
            <Clock className="h-3 w-3 text-[#0072FF]" />
            <span>24h/5d: {metrics.statutoryDueCount}</span>
          </Link>
          <Link
            to="/compliance"
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-workspace-navy px-2 py-1 font-bold text-white hover:border-[#A855F7]"
          >
            <Users className="h-3 w-3 text-[#A855F7]" />
            <span>Clearances: {metrics.expiringClearancesCount}</span>
          </Link>
          <Link
            to="/documents"
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-workspace-navy px-2 py-1 font-bold text-white hover:border-[#FF2E9A]"
          >
            <FileCheck2 className="h-3 w-3 text-[#FF2E9A]" />
            <span>Reviews: {metrics.overduePoliciesCount}</span>
          </Link>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg bg-[#0072FF] px-2.5 py-1 text-[10px] font-extrabold text-white"
          >
            <span>{expanded ? 'Hide' : 'Details'}</span>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 border-t border-white/10 pt-2 text-[11px]">
          {metrics.priorityItems.length === 0 ? (
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> All statutory timers and clearances are on track.
              </span>
              <Link to="/compliance" className="text-white underline">
                Open Compliance Hub →
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {metrics.priorityItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-workspace-navy px-2.5 py-1 font-bold text-white hover:border-[#FF2E9A]"
                >
                  <span className="truncate max-w-xs">{item.title}</span>
                  <ArrowRight className="h-3 w-3 text-[#FF2E9A]" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}