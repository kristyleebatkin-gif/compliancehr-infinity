import React from 'react';
import OnlineDocumentDialog from '@/components/documents/OnlineDocumentDialog';

export default function IntakeOnlineFormDialog({ open, onOpenChange, onlineForm, onSubmit, activeCase, intakeType, code }) {
  if (!onlineForm || !activeCase) return null;
  return <OnlineDocumentDialog key={`${activeCase.id}:${onlineForm.docType}`} open={open} onOpenChange={onOpenChange}
    title={onlineForm.docType} code={code} definition={onlineForm.definition}
    libraryKey={intakeType} intakeCase={activeCase} initialAnswers={onlineForm.answers}
    requireAll onFinalize={onSubmit} />;
}