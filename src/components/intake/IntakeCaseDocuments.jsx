import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, ExternalLink, FileWarning, Pencil, UploadCloud } from 'lucide-react';
import { IntakeReadinessPanel } from '@/components/intake/IntakeCaseForm';
import {
  ACK_KEEP_DOWNLOAD_DOC_TYPES,
  DOWNLOAD_ONLY_DOC_TYPES,
  INTAKE_FILE_ACCEPT,
  LEGISLATION_ACK_DOC_TYPES,
  TRAINING_DOC_LINKS,
  UPLOAD_ONLY_DOC_TYPES,
} from '@/lib/intakeCases';
import { TERMINAL_STATUSES } from './intakeDisplay';

export default function IntakeCaseDocuments({
  activeCase,
  intakeType,
  readiness,
  docForCheck,
  busy,
  uploadingDoc,
  downloadingTemplate,
  onView,
  onAcknowledge,
  onOnlineForm,
  onDownload,
  onUpload,
  onRemove,
  canCompleteOnline,
}) {
  const checks = readiness.documentChecks;
  const doneCount = checks.filter((c) => c.complete).length;
  const pct = checks.length ? Math.round((doneCount / checks.length) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/45">Required documents</div>
          {checks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{doneCount}/{checks.length} complete</span>
              <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                <span className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${pct}%` }} />
              </span>
            </div>
          )}
        </div>
        {readiness.documentChecks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No document requirements for this case.</p>
        ) : (
          readiness.documentChecks.map((check) => {
            const doc = docForCheck(check.label);
            return (
              <div key={check.label} className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-border/60 bg-card py-2.5 pl-4 pr-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: check.complete ? '#10b981' : '#f59e0b' }} />
                <div className="flex min-w-0 items-start gap-2">
                  {check.complete
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    : <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
                  <div className="min-w-0">
                    <div className={`text-sm ${check.complete ? 'text-foreground/70' : 'font-medium'}`}>{check.label}</div>
                    {doc && <div className="text-xs text-foreground/45">{doc.file_name}</div>}
                    {UPLOAD_ONLY_DOC_TYPES.has(check.label) && !check.complete && (
                      <p className="text-[10px] text-muted-foreground">please upload</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {doc && (
                    <Button variant="outline" size="sm" onClick={() => onView(doc)}>View</Button>
                  )}
                  {LEGISLATION_ACK_DOC_TYPES.has(check.label) && !TERMINAL_STATUSES.has(activeCase.status) && (
                    <Button variant="outline" size="sm" onClick={() => onAcknowledge(check.label)} disabled={busy}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledgement
                    </Button>
                  )}
                  {!LEGISLATION_ACK_DOC_TYPES.has(check.label) && !UPLOAD_ONLY_DOC_TYPES.has(check.label)
                    && !DOWNLOAD_ONLY_DOC_TYPES.has(check.label)
                    && canCompleteOnline?.(check.label) && !TERMINAL_STATUSES.has(activeCase.status) && (
                    <Button variant="outline" size="sm" onClick={() => onOnlineForm(check.label)} disabled={busy}>
                      <Pencil className="h-3.5 w-3.5" /> Fill out online / Drafts
                    </Button>
                  )}
                  {(!LEGISLATION_ACK_DOC_TYPES.has(check.label) || ACK_KEEP_DOWNLOAD_DOC_TYPES.has(check.label)) && !UPLOAD_ONLY_DOC_TYPES.has(check.label) && (
                    <Button variant="outline" size="sm" onClick={() => onDownload(check.label)} disabled={downloadingTemplate === check.label}>
                      {downloadingTemplate === check.label
                        ? <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        : <Download className="h-3.5 w-3.5" />}
                      Download
                    </Button>
                  )}
                  {TRAINING_DOC_LINKS[check.label] && (
                    <a
                      href={TRAINING_DOC_LINKS[check.label].url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium hover:bg-accent"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Free training
                    </a>
                  )}
                  {!LEGISLATION_ACK_DOC_TYPES.has(check.label) && !DOWNLOAD_ONLY_DOC_TYPES.has(check.label) && !TERMINAL_STATUSES.has(activeCase.status) && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept={INTAKE_FILE_ACCEPT}
                        className="hidden"
                        onChange={async (event) => {
                          await onUpload(check.label, event.target.files?.[0]);
                          event.target.value = '';
                        }}
                        disabled={uploadingDoc === check.label || busy}
                      />
                      <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium hover:bg-accent">
                        {uploadingDoc === check.label
                          ? <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          : <UploadCloud className="h-3.5 w-3.5" />}
                        Upload
                      </span>
                    </label>
                  )}
                  {doc && !TERMINAL_STATUSES.has(activeCase.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => onRemove(doc)}
                      disabled={busy}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <IntakeReadinessPanel readiness={readiness} />
    </div>
  );
}