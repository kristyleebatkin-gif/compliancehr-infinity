import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import profileRecordExport from '@/lib/profileRecordExport';

export default function IntakeReadinessExport({ activeCase, readiness, stats, loadError }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const exportReport = async () => {
    setBusy(true); setError('');
    try {
      const rows = [{ field: 'Generated', value: new Date().toLocaleString() }];
      if (activeCase && readiness) {
        rows.push(
          { field: 'Case', value: activeCase.case_number || activeCase.id },
          { field: 'Intake stream', value: activeCase.intake_type },
          { field: 'Case status', value: activeCase.status },
          { field: 'Readiness', value: `${readiness.score}% | ${readiness.checks.length - readiness.missing.length} of ${readiness.checks.length} complete | ${readiness.missing.length} outstanding` },
        );
        for (const [heading, checks] of [['Required information', readiness.informationChecks], ['Required documents', readiness.documentChecks]]) {
          rows.push({ field: heading, value: checks.length ? checks.map(check => `${check.complete ? 'Complete' : 'Outstanding'}: ${check.label}`).join('\n') : 'No requirements' });
        }
        rows.push({ field: 'Outstanding actions', value: activeCase.outstanding_actions || 'None recorded' });
      } else {
        for (const [key, label] of [['p', 'Participant Intake'], ['e', 'Employee Intake']]) {
          const statuses = stats[key];
          const total = Object.values(statuses).reduce((sum, count) => sum + count, 0);
          const ready = statuses['Ready for Review'] || 0;
          const inProgress = ['Draft', 'Information Required', 'Ready for Review'].reduce((sum, status) => sum + (statuses[status] || 0), 0);
          const reviewShare = total ? `${Math.round(ready / total * 100)}%` : 'not applicable (no cases)';
          rows.push({ field: label, value: `Total cases: ${total}\nDraft / information required / review: ${inProgress}\nCurrently in Ready for Review: ${ready} of ${total} (${reviewShare})\n${Object.entries(statuses).map(([status, count]) => `${status}: ${count}`).join('\n')}` });
        }
      }
      rows.push({ field: 'Important note', value: 'Readiness supports NDIS onboarding controls and conditional safeguards. It does not replace provider-specific legal advice or an external certification audit.' });
      await profileRecordExport('Intake readiness report', { full_name: activeCase?.applicant_name || 'Intake Centre' }, rows, 'pdf');
    } catch (err) { setError(err.message || 'Unable to export the report. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="space-y-1">
    <Button type="button" variant="outline" size="sm" disabled={busy || (!activeCase && !stats) || Boolean(loadError)} onClick={exportReport}><Download className="h-4 w-4" />{busy ? 'Exporting…' : 'Export Readiness PDF'}</Button>
    {(error || loadError) && <p role="alert" className="text-xs text-destructive">{error || loadError}</p>}
  </div>;
}