import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { exportDocumentRecord } from '@/lib/openDocument';

export default function UniversalDocumentViewerModal() {
  const [state, setState] = useState({
    open: false,
    controlled: null,
    resolvedUrl: '',
  });

  useEffect(() => {
    const handleOpen = (event) => {
      const detail = event?.detail;
      if (!detail?.controlled) return;
      setState({
        open: true,
        controlled: detail.controlled,
        resolvedUrl: detail.resolvedUrl || '',
      });
    };
    window.addEventListener('chr:open-document', handleOpen);
    return () => window.removeEventListener('chr:open-document', handleOpen);
  }, []);

  const rec = state.controlled;
  if (!rec) return null;

  return (
    <Dialog
      open={state.open}
      onOpenChange={(isOpen) => setState((prev) => ({ ...prev, open: isOpen }))}
    >
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-4xl overflow-y-auto border-2 border-[#0A2B6D] bg-white p-0 sm:rounded-2xl">
        {/* Clean Solid Dark Blue & Light Blue Controlled Document Header (No Gradient) */}
        <div className="border-b-4 border-[#0072FF] bg-[#0A2B6D] px-5 py-4 text-white">
          <DialogHeader className="text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00C6FF]/40 bg-[#0072FF] px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00C6FF]" />
                <span>ComplianceHR Infinity · Controlled Document Viewer</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="bg-white text-[#0A2B6D] font-extrabold text-xs">
                  {rec.documentNumber} · {rec.versionNumber}
                </Badge>
                <Badge className="bg-[#E0F2FE] text-[#0A2B6D] font-extrabold text-xs">
                  {rec.status}
                </Badge>
              </div>
            </div>
            <DialogTitle className="mt-2 font-editorial text-lg sm:text-xl font-extrabold text-white leading-snug">
              {rec.documentName}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-[#E0F2FE]">
              Module: {rec.module} · Category: {rec.category} · Owner: {rec.owner} · Next Review / Expiry: {rec.nextReviewDate}
            </DialogDescription>
          </DialogHeader>

          {/* Top Action Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/20 pt-3">
            <Button
              size="sm"
              onClick={() => exportDocumentRecord(rec, 'pdf')}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-[#F0F7FF]"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-[#0072FF]" />
              <span style={{ color: '#0A2B6D' }}>Download PDF</span>
            </Button>
            <Button
              size="sm"
              onClick={() => exportDocumentRecord(rec, 'word')}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-[#F0F7FF]"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5 text-[#0072FF]" />
              <span style={{ color: '#0A2B6D' }}>Download Word (.doc)</span>
            </Button>
            <Button
              size="sm"
              onClick={() => exportDocumentRecord(rec, 'excel')}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-[#F0F7FF]"
            >
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-[#0A2B6D]" />
              <span style={{ color: '#0A2B6D' }}>Excel (.xls)</span>
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="bg-[#0072FF] text-white font-extrabold hover:bg-[#005bb5]"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 text-white" />
              <span>Print Document</span>
            </Button>
            {state.resolvedUrl && (
              <a
                href={state.resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#E0F2FE] px-3 text-xs font-extrabold text-[#0A2B6D] shadow-xs hover:bg-white"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#0072FF]" />
                <span>Open Original Uploaded File</span>
              </a>
            )}
          </div>
        </div>

        {/* Document Body */}
        <div className="space-y-4 p-4 sm:p-5 text-[#0A2B6D] bg-white">
          {/* Attached Binary Preview if a real file URL exists */}
          {state.resolvedUrl && (
            <div className="rounded-xl border-2 border-[#0072FF] bg-[#F0F7FF] p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Attached File Preview
                </span>
                <a
                  href={state.resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in New Browser Tab
                </a>
              </div>
              {/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(state.resolvedUrl) ? (
                <img
                  src={state.resolvedUrl}
                  alt={rec.documentName}
                  className="max-h-96 w-auto mx-auto rounded-lg border border-sky-200 bg-white object-contain"
                />
              ) : (
                <iframe
                  src={state.resolvedUrl}
                  title={rec.documentName}
                  className="h-80 w-full rounded-lg border border-sky-200 bg-white"
                />
              )}
            </div>
          )}

          {/* Section 1: 16-Field Document Control Metadata Grid */}
          <div className="rounded-xl border-2 border-[#0A2B6D] overflow-hidden">
            <div className="bg-[#0A2B6D] px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-white">
              1. Document Control &amp; Governance Metadata
            </div>
            <div className="grid grid-cols-2 gap-2 bg-[#F0F7FF] p-3 sm:grid-cols-4 text-xs">
              {[
                ['Document Number', rec.documentNumber],
                ['Record ID', rec.recordId],
                ['Version', rec.versionNumber],
                ['Status', rec.status],
                ['Module', rec.module],
                ['Category', rec.category],
                ['Owner', rec.owner],
                ['Approved By', rec.approvedBy],
                ['Issue / Created Date', rec.createdDate],
                ['Last Review Date', rec.lastReviewDate],
                ['Next Review / Expiry', rec.nextReviewDate],
                ['Review Frequency', rec.reviewFrequency],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-sky-200 bg-white p-2">
                  <div className="text-[11px] font-extrabold uppercase text-[#0072FF]">{label}</div>
                  <div className="mt-0.5 font-bold text-[#0A2B6D] break-words">{val || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Purpose, Scope & Related Standards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-[#F0F7FF] p-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                2. Purpose
              </div>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[#0A2B6D]">
                {rec.purpose}
              </p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-white p-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                3. Scope
              </div>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[#0A2B6D]">
                {rec.scope}
              </p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-[#F0F7FF] p-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                4. Related Standards
              </div>
              <ul className="mt-1 space-y-1 text-xs font-bold text-[#0A2B6D]">
                {(rec.relatedDocuments || []).map((std) => (
                  <li key={std} className="flex items-start gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                    <span>{std}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 3: Main Document Content & Operational Fields */}
          <div className="rounded-xl border-2 border-[#0A2B6D] overflow-hidden">
            <div className="bg-[#0072FF] px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-white">
              5. Document Content &amp; Operational Record Details
            </div>
            <div className="p-3.5 space-y-3 bg-white">
              {rec.fullBodyText && (
                <div className="rounded-xl border border-sky-200 bg-[#F0F7FF] p-3 text-xs font-semibold leading-relaxed whitespace-pre-wrap text-[#0A2B6D]">
                  {rec.fullBodyText}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {(rec.mainFields || []).map((field) => (
                  <div key={field.key || field.label} className="rounded-lg border border-sky-200 bg-white p-2.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                      {field.label}
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#0A2B6D] break-words">
                      {field.value || 'Verified on file'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Evidence, Actions & Approval Sign-Off */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-sky-200 bg-white p-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                6. Evidence &amp; Verification Trail
              </div>
              <ul className="mt-2 space-y-1.5 text-xs font-semibold text-[#0A2B6D]">
                {(rec.evidenceItems || []).map((ev) => (
                  <li key={ev} className="flex items-start gap-2 rounded-lg bg-[#F0F7FF] p-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-sky-200 bg-white p-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                7. Review, Approval &amp; Sign-Off
              </div>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="rounded-lg bg-[#F0F7FF] p-2">
                  <span className="font-extrabold text-[#0A2B6D]">Approved By: </span>
                  <span className="font-bold text-[#0A2B6D]">{rec.approvedBy}</span>
                  <span className="ml-2 text-[#0A2B6D]/70">({rec.approvalDate})</span>
                </div>
                <div className="rounded-lg bg-[#F0F7FF] p-2">
                  <span className="font-extrabold text-[#0072FF]">Review Outcome: </span>
                  <span className="font-bold text-[#0A2B6D]">{rec.reviewOutcome}</span>
                </div>
                {(rec.actionsItems || []).map((act) => (
                  <div key={act} className="flex items-start gap-2 rounded-lg bg-[#F0F7FF] p-2 font-semibold text-[#0A2B6D]">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] bg-[#F0F7FF] p-3">
            <div className="text-xs font-extrabold text-[#0A2B6D]">
              Controlled Document · {rec.documentNumber} ({rec.versionNumber}) · Filed in Document Vault &amp; Company Safe
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => exportDocumentRecord(rec, 'pdf')}
                className="bg-[#0A2B6D] text-white text-xs font-extrabold hover:bg-[#0072FF]"
              >
                <Download className="mr-1 h-3.5 w-3.5" /> Download PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setState((prev) => ({ ...prev, open: false }))}
                className="border-[#0A2B6D] bg-white text-xs font-extrabold text-[#0A2B6D]"
              >
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}