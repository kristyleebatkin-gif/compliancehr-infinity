import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { collectAuditTrackers } from '@/lib/auditCentreExport';
import ReviewSchedule from '@/components/audit/ReviewSchedule';
import { ListChecks } from 'lucide-react';

const toneForCounts = (overdue, soon) => {
  if (overdue > 0) return statusTone('Overdue');
  if (soon > 0) return statusTone('In Progress');
  return statusTone('Complete');
};

const statusForCounts = (overdue, soon) => {
  if (overdue > 0) return `${overdue} overdue - attention`;
  if (soon > 0) return `${soon} due soon`;
  return 'In date';
};

/**
 * Platform-wide status for the Master Checklist: every active audit
 * requirement linked to its review cycle, plus the live status of every
 * compliance check tracked across the platform.
 */
export default function PlatformComplianceStatus() {
  const [audits, setAudits] = useState([]);
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [auditPage, counts] = await Promise.all([
          base44.entities.Audit.filter({}, { sort: '-date', limit: 300 }),
          collectAuditTrackers(),
        ]);
        if (!cancelled) { setAudits(auditPage.items || []); setTrackers(counts); }
      } catch (e) { console.error('Platform compliance status failed', e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const overdueTotal = trackers.reduce((s, t) => s + (t.overdue || 0), 0);
  const soonTotal = trackers.reduce((s, t) => s + (t.soon || 0), 0);
  const inDate = trackers.filter((t) => !(t.overdue > 0) && !(t.soon > 0)).length;

  return (
    <div className="space-y-4">
      <ReviewSchedule audits={audits} />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-brand" />
            <p className="font-semibold">Compliance check status (platform-wide)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge className={statusTone('Overdue')}>{overdueTotal} overdue</Badge>
            <Badge className={statusTone('In Progress')}>{soonTotal} due soon</Badge>
            <Badge className={statusTone('Complete')}>{inDate} checks fully in date</Badge>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : trackers.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No compliance checks are being tracked yet.</p>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Compliance check</th>
                  <th className="py-2 pr-3 text-right">Overdue</th>
                  <th className="py-2 pr-3 text-right">Due soon</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {trackers.map((t) => (
                  <tr key={`${t.entity}-${t.label}`} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{t.label}</td>
                    <td className={`py-2 pr-3 text-right ${t.overdue > 0 ? 'font-semibold text-red-600' : 'text-muted-foreground'}`}>{t.overdue}</td>
                    <td className={`py-2 pr-3 text-right ${t.soon > 0 ? 'font-semibold text-amber-600' : 'text-muted-foreground'}`}>{t.soon === null ? '-' : t.soon}</td>
                    <td className="py-2 text-right"><Badge className={toneForCounts(t.overdue, t.soon)}>{statusForCounts(t.overdue, t.soon)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}