import React from 'react';
import AttachedFormsLibrary from '@/components/documents/AttachedFormsLibrary';
import { Button } from '@/components/ui/button';
import { Download, FolderCheck } from 'lucide-react';
import { PARTICIPANT_FORM_DEFINITIONS, PARTICIPANT_FORM_FILES, participantFormInfo } from '@/lib/participantDocuments';
import { downloadBlankFormPdf } from '@/lib/formsLibraryPdf';

const KEY_DOCUMENTS = ['NDIS Plan', 'Service Agreement', 'Participant Support Plan', 'Personal Emergency Form', 'Medication Consent'];

const RISK_ASSESSMENTS = ['Individual Risk Assessment', 'Home Risk Assessment'];

export default function ParticipantDocumentsTab({ participant }) {
  const formCodes = Object.fromEntries(KEY_DOCUMENTS.map((key) => [key, participantFormInfo(key).code]));

  const downloadRiskAssessment = (docType) => {
    const definition = PARTICIPANT_FORM_DEFINITIONS[docType] || {};
    downloadBlankFormPdf({
      title: docType,
      code: definition.code,
      subtitle: definition.label || 'ComplianceHR Form',
      fields: definition.fields || [],
      columns: definition.columns,
      rows: definition.rows,
    });
  };

  return (
    <div className="space-y-6">
      <AttachedFormsLibrary
        title="Completed participant documents"
        subtitle="Download official templates or upload the completed copies held on this participant's record"
        libraryKey={`participant-${participant.id}`}
        sections={[{ name: 'Service documents', icon: FolderCheck, docs: KEY_DOCUMENTS }]}
        formFiles={PARTICIPANT_FORM_FILES}
        formCodes={formCodes}
        definitions={PARTICIPANT_FORM_DEFINITIONS}
        defaultOpen
      />

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-3 text-sm font-semibold">Risk assessments</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {RISK_ASSESSMENTS.map((docType) => (
            <div key={docType} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
              <span className="text-sm font-medium">{docType}</span>
              <Button size="sm" variant="outline" onClick={() => downloadRiskAssessment(docType)}>
                <Download className="h-3.5 w-3.5" />Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}