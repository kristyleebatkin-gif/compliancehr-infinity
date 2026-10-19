import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Route } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

const fmt = (d) => (d ? String(d).slice(0, 16).replace('T', ' ') : '');

/**
 * Participant journey: every action recorded on a participant intake case —
 * consents, audit consent, acknowledgements, referee checks, documents and
 * conversion — shown in order and exportable as CSV.
 */
export default function ParticipantJourneyPanel({ activeCase, docs = [] }) {
  const [exporting, setExporting] = useState(false);

  if (!activeCase) return null;

  const journey = [];
  const push = (stage, action, detail, when) => journey.push({ stage, action, detail, when: fmt(when) });

  push('Case opened', 'Intake case created', activeCase.case_number, activeCase.created_date);
  if (activeCase.referral_date) push('Referral', 'Referral / application date recorded', activeCase.referral_source || '', activeCase.referral_date);
  if (activeCase.privacy_consent) push('Consent', 'Consent to collect and store intake information', `Recorded by ${activeCase.privacy_consent_by || 'unknown'}`, activeCase.privacy_consent_date);
  if (activeCase.information_sharing_consent && activeCase.information_sharing_consent !== 'Consent declined') {
    push('Consent', 'Consent to share information', `${activeCase.information_sharing_consent}${activeCase.consent_to_share_persons ? ' - ' + activeCase.consent_to_share_persons : ''}`, activeCase.created_date);
  } else if (activeCase.information_sharing_consent === 'Consent declined') {
    push('Consent', 'Consent to share information declined', '', '');
  }
  if (activeCase.audit_consent) push('Consent', `NDIS audit consent: ${activeCase.audit_consent}`, activeCase.audit_consent_note || (activeCase.audit_consent_by ? `By ${activeCase.audit_consent_by}` : ''), activeCase.audit_consent_date);
  (activeCase.acknowledgement_log || '').split('\n').filter(Boolean).forEach((entry, i) => push('Acknowledgement', entry.split(' - ')[0] || `Entry ${i + 1}`, entry, ''));
  (activeCase.referee_check_log || '').split('\n').filter(Boolean).forEach((entry, i) => push('Referee check', `Referee check ${i + 1}`, entry, ''));
  docs.forEach((doc) => push('Document', doc.document_type, `${doc.file_name || 'Uploaded'}${doc.status ? ` (${doc.status})` : ''}`, doc.created_date));
  if (activeCase.reviewed_date) push('Review', 'Intake reviewed', `By ${activeCase.reviewer || 'unknown'}`, activeCase.reviewed_date);
  if (activeCase.status) push('Status', `Status: ${activeCase.status}`, activeCase.decision_reason || activeCase.outstanding_actions || '', activeCase.updated_date);
  if (activeCase.status === 'Converted to Profile' && activeCase.converted_date) push('Conversion', 'Converted to participant profile', activeCase.related_profile_id || '', activeCase.converted_date);

  const ordered = journey.filter((row) => row.action);

  const exportJourney = () => {
    setExporting(true);
    try {
      downloadCsv(`Participant-Journey-${activeCase.case_number || activeCase.id}.csv`, [
        { key: 'stage', label: 'Stage' }, { key: 'action', label: 'Action' },
        { key: 'detail', label: 'Detail' }, { key: 'when', label: 'When' },
      ], ordered);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><Route className="h-4 w-4" /></span>
            <p className="text-sm font-bold">Participant journey</p>
            <Badge variant="secondary" className="tabular-nums">{ordered.length} actions</Badge>
          </div>
          <Button size="sm" variant="outline" onClick={exportJourney} disabled={exporting || ordered.length === 0}><Download className="mr-2 h-4 w-4" />Export journey</Button>
        </div>
        {ordered.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">No actions recorded yet.</p>
        ) : (
          <ol className="space-y-2">
            {ordered.map((row, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wide">{row.stage}</Badge>
                <span className="font-semibold">{row.action}</span>
                {row.detail && <span className="text-xs text-muted-foreground">{row.detail}</span>}
                {row.when && <span className="ml-auto text-xs tabular-nums text-muted-foreground">{row.when}</span>}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}