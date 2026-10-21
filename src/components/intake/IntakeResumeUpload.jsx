import React from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INTAKE_FILE_ACCEPT } from '@/lib/intakeCases';
import { TERMINAL_STATUSES } from '@/components/intake/intakeDisplay';

export default function IntakeResumeUpload({ activeCase, document, uploadingDoc, busy, onUpload, onView, allowUpload = false }) {
  if (activeCase?.intake_type !== 'Employee') return null;
  const uploading = uploadingDoc === 'Resume';
  return <section className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
    <h3 className="text-sm font-semibold">Employee résumé</h3>
    <p className="break-words text-xs text-muted-foreground">{document?.file_name || 'No résumé uploaded.'} (stored privately)</p>
    <div className="flex flex-wrap items-center gap-2">
      {document && <Button type="button" variant="outline" size="sm" onClick={() => onView(document)}>View résumé</Button>}
      {onUpload && (allowUpload || !TERMINAL_STATUSES.has(activeCase.status)) && <label className="relative inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus-within:ring-2 focus-within:ring-ring">
        <UploadCloud className="h-4 w-4" />{uploading ? 'Uploading…' : document ? 'Replace résumé' : 'Upload résumé'}
        <input aria-label={document ? 'Replace employee résumé' : 'Upload employee résumé'} type="file" accept={INTAKE_FILE_ACCEPT} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" disabled={Boolean(uploadingDoc) || busy} onChange={async event => { const input = event.target; await onUpload('Resume', input.files?.[0]); input.value = ''; }} />
      </label>}
    </div>
  </section>;
}