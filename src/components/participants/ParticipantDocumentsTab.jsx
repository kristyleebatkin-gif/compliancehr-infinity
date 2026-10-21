import React from 'react';
import AttachedFormsLibrary from '@/components/documents/AttachedFormsLibrary';
import '@/components/profile/profileSectionLayout.css';
import { FolderCheck } from 'lucide-react';
import { PARTICIPANT_FILE_SECTIONS, PARTICIPANT_FORM_DEFINITIONS, PARTICIPANT_FORM_FILES, participantFormInfo } from '@/lib/participantDocuments';
import { PARTICIPANT_FILLABLE_DEFINITIONS } from '@/lib/participantFillableForms';
import ParticipantDocumentRegister from '@/components/documents/ParticipantDocumentRegister';

export default function ParticipantDocumentsTab({ participant }) {
  const definitions = { ...PARTICIPANT_FORM_DEFINITIONS, ...PARTICIPANT_FILLABLE_DEFINITIONS };
  const formCodes = Object.fromEntries(Object.keys(definitions).map((key) => [key, definitions[key].code || participantFormInfo(key).code]));
  const sections = [...PARTICIPANT_FILE_SECTIONS, { name: 'Additional consent forms', icon: FolderCheck, docs: ['Participant Consent Form'] }];

  return (
    <div className="participant-documents-compact space-y-6 sm:max-lg:space-y-1.5">
      <AttachedFormsLibrary
        title="Complete participant forms & file checklist"
        subtitle="All participant forms, progress notes, reports, assessments, plans and provider declarations"
        libraryKey={`participant-${participant.id}`}
        sections={sections}
        formFiles={PARTICIPANT_FORM_FILES}
        formCodes={formCodes}
        definitions={definitions}
        defaultOpen
      />

      <ParticipantDocumentRegister participant={participant} />
    </div>
  );
}