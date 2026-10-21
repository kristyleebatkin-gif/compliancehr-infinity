import React from 'react';
import ParticipantDocumentRegister from '@/components/documents/ParticipantDocumentRegister';

export default function ParticipantAssessmentRecords({ participant }) {
  return <details className="rounded-xl border border-border bg-card p-3">
    <summary className="cursor-pointer text-sm font-semibold">Individual & home risk assessment forms and evidence</summary>
    <div className="mt-3 space-y-4">
      <ParticipantDocumentRegister participant={participant} documentType="Individual Risk Assessment" />
      <ParticipantDocumentRegister participant={participant} documentType="Home Risk Assessment" />
    </div>
  </details>;
}