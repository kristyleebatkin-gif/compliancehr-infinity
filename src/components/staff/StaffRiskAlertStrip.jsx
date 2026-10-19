import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import useStaffRisk from '@/hooks/useStaffRisk';

const RISK_ALERT_THRESHOLD = 40; // matches the automated risk alert trigger

// High-visibility strip shown directly under the staff profile header, above
// the tabs: flags overdue documents and high-risk compliance items in red.
export default function StaffRiskAlertStrip({ staff }) {
  const data = useStaffRisk(staff);
  if (!data) return null;

  const riskPoints = 100 - data.score;
  const overdueCount = data.overdueTasks.length + data.expiredDocs.length + data.expiredCerts.length;
  const upcomingCount = data.dueTasks.length + data.soonDocs.length + data.soonCerts.length;
  const flagged = overdueCount > 0 || riskPoints > RISK_ALERT_THRESHOLD;

  if (!flagged) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300">
        Compliance risk {data.score}/100 — all clear, no overdue or high-risk compliance items.
      </div>
    );
  }

  return (
    <Link
      to="#risk"
      onClick={(e) => { e.preventDefault(); document.getElementById('risk-tab')?.click(); }}
      className="block rounded-xl border border-red-300 bg-red-50 px-4 py-3 shadow-md shadow-red-500/10 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:hover:bg-red-950/60"
    >
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-red-800 dark:text-red-200">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        Compliance risk {data.score}/100 — immediate attention required
        {riskPoints > RISK_ALERT_THRESHOLD && <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">Above {RISK_ALERT_THRESHOLD}-point alert threshold</span>}
        <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
        {data.overdueTasks.length > 0 && <span className="rounded-md bg-red-600 px-2 py-0.5 text-white">{data.overdueTasks.length} overdue task{data.overdueTasks.length === 1 ? '' : 's'}</span>}
        {data.expiredDocs.length > 0 && <span className="rounded-md bg-red-600 px-2 py-0.5 text-white">{data.expiredDocs.length} expired document{data.expiredDocs.length === 1 ? '' : 's'}</span>}
        {data.expiredCerts.length > 0 && <span className="rounded-md bg-red-600 px-2 py-0.5 text-white">{data.expiredCerts.length} expired certificate{data.expiredCerts.length === 1 ? '' : 's'}</span>}
        {upcomingCount > 0 && <span className="rounded-md bg-amber-500 px-2 py-0.5 text-white">{upcomingCount} due within 30 days</span>}
      </div>
    </Link>
  );
}