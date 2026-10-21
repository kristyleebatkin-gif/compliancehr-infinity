import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PARTICIPANT_FILLABLE_FORMS } from '@/lib/participantFillableForms';
import { Button } from '@/components/ui/button';
import ParticipantRecordSource from '@/components/documents/ParticipantRecordSource';
import { participantModuleUrl, profileVaultUrl } from '@/lib/profileDocumentLinks';

export default function ParticipantDocumentRegister({ participant, documentType = '', includeDocuments = true, vault = false }) {
  const [params, setParams] = useSearchParams();
  const chooseType = (value) => { const next = new URLSearchParams(params); if (value) next.set('document_type', value); else next.delete('document_type'); setParams(next, { replace: true }); };
  const type = (field) => documentType ? { [field]: documentType } : {};
  const progressType = documentType === 'Progress Notes' ? 'Progress Note' : documentType === 'Progress Reports' ? 'Progress Report' : '';
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">{documentType || 'Participant forms, plans & registers'}</h2><div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" asChild><Link to={participantModuleUrl(participant, 'forms', documentType)}>Open fillable forms</Link></Button>
      {!vault && <Button size="sm" variant="outline" asChild><Link to={profileVaultUrl(participant, 'participant', documentType)}>Open in Document Vault</Link></Button>}
      {progressType && <Button size="sm" variant="outline" asChild><Link to={participantModuleUrl(participant, 'goals')}>Goal progress register</Link></Button>}
      {/Risk Assessment/.test(documentType) && <Button size="sm" variant="outline" asChild><Link to={participantModuleUrl(participant, 'risks')}>Risk register</Link></Button>}
    </div></div>
    {vault && <label className="block space-y-1 text-sm font-semibold">Form, plan or register<select aria-label="Filter participant documents by form or plan" className="block w-full rounded-md border border-input bg-background p-2 text-sm font-normal" value={documentType} onChange={(event) => chooseType(event.target.value)}><option value="">All participant documents</option>{PARTICIPANT_FILLABLE_FORMS.map((form) => <option key={form.key} value={form.key}>{form.key}</option>)}</select></label>}
    {includeDocuments && <ParticipantRecordSource entity="ParticipantDocument" query={{ participant_id: participant.id, ...type('document_type') }} title="Filed participant documents" />}
    <ParticipantRecordSource entity="FormsLibraryDocument" query={{ library: `participant-${participant.id}`, ...type('document_type') }} title="Completed forms & uploaded plans" />
    <ParticipantRecordSource entity="ParticipantFormEntry" query={{ participant_id: participant.id, ...type('form_type') }} title="Saved participant forms" />
    <ParticipantRecordSource entity="FormSubmission" query={{ participant_id: participant.id, ...type('form_title') }} title="Online documents & saved drafts" />
    <ParticipantRecordSource entity="IntakeDocument" query={{ profile_id: participant.id, ...type('document_type') }} title="Profile intake documents" />
    {(!documentType || progressType) && <ParticipantRecordSource entity="GoalProgressNote" query={{ participant_name: participant.full_name, ...(progressType ? { entry_type: progressType } : {}) }} title="Goal progress notes & reports" />}
  </div>;
}