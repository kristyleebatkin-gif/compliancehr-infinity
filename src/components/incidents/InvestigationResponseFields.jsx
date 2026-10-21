import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const fields = [['incident_summary', 'Incident summary'], ['evidence_reviewed', 'Evidence reviewed'], ['persons_interviewed', 'Persons interviewed'], ['hazards_identified', 'Risks / hazards identified'], ['risk_assessment', 'Risk assessment'], ['control_measures', 'Control measures'], ['root_cause', 'Root cause'], ['findings', 'Findings'], ['recommendations', 'Recommendations'], ['corrective_actions', 'Corrective actions']];
export default function InvestigationResponseFields({ investigation, onUpdate }) {
  return <div className="mt-3 space-y-2"><p className="text-xs text-muted-foreground">Edit any response below. Changes save when leaving the field.</p><div className="grid gap-3 sm:grid-cols-2">{fields.map(([field, label]) => <div key={`${investigation.id}-${field}`} className="space-y-1"><Label htmlFor={`${investigation.id}-${field}`} className="text-xs">{label}</Label><Textarea id={`${investigation.id}-${field}`} defaultValue={investigation[field] || ''} rows={3} onBlur={(e) => { if (e.target.value !== (investigation[field] || '')) onUpdate(investigation, field, e.target.value); }} /></div>)}</div></div>;
}