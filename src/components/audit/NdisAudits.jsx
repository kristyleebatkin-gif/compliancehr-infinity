import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { statusTone } from '@/lib/statusStyles';
import { format, isBefore, startOfDay } from 'date-fns';
import { ShieldCheck, CalendarClock } from 'lucide-react';

export default function NdisAudits({ audits }) {
  const ndis = audits.filter((a) => (a.audit_type || '').startsWith('NDIS') || (a.audit_area || '').toLowerCase().includes('ndis'));
  const upcoming = ndis.filter((a) => a.status === 'Scheduled' || a.status === 'In Progress');
  const passed = ndis.filter((a) => a.status === 'Complete' || a.status === 'Follow-up Required');

  const AuditRow = ({ a }) => (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{a.title}</p>
        <p className="text-xs text-muted-foreground">
          {[[a.audit_type], [a.date ? format(new Date(a.date), 'd MMM yyyy') : ''], [a.auditor ? `Auditor: ${a.auditor}` : ''],
            [a.score != null ? `Score: ${a.score}%` : ''], [a.checklist_file_name ? `Checklist: ${a.checklist_file_name}` : '']]
            .map((p) => p[0]).filter(Boolean).join(' · ') || 'Details pending'}
        </p>
        {a.findings && <p className="mt-1 text-xs text-muted-foreground">Findings: {a.findings}</p>}
        {a.actions && <p className="mt-1 text-xs text-muted-foreground">Actions: {a.actions}</p>}
      </div>
      <div className="flex items-center gap-2">
        {a.status === 'Complete' && (a.score == null || a.score >= 80) && <Badge className={statusTone('Complete')}>Passed</Badge>}
        <Badge className={statusTone(a.status)}>{a.status}</Badge>
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-brand" />
            <p className="font-semibold">Upcoming NDIS audits</p>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming NDIS audits scheduled. Add one with the audit type "NDIS Verification" or "NDIS Certification".</p>
          ) : (
            <div className="space-y-2">{upcoming.map((a) => <AuditRow key={a.id} a={a} />)}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <p className="font-semibold">Passed NDIS audits</p>
          </div>
          {passed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed NDIS audits recorded yet.</p>
          ) : (
            <div className="space-y-2">{passed.map((a) => <AuditRow key={a.id} a={a} />)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}