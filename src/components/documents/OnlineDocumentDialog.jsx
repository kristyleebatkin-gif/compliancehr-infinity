import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, FileCheck2 } from 'lucide-react';
import useOnlineDocument from '@/components/documents/useOnlineDocument';
import OnlineDocumentFields from '@/components/documents/OnlineDocumentFields';
import OnlineDocumentRegister from '@/components/documents/OnlineDocumentRegister';
import OnlineDocumentReading from '@/components/documents/OnlineDocumentReading';
import OnlineDocumentHistory from '@/components/documents/OnlineDocumentHistory';
import OnlineDocumentConfirmation from '@/components/documents/OnlineDocumentConfirmation';
import OnlineDocumentActions from '@/components/documents/OnlineDocumentActions';
import DocumentAcknowledgements from '@/components/documents/DocumentAcknowledgements';
import EmployeeRecordNotice from '@/components/profile/EmployeeRecordNotice';

export default function OnlineDocumentDialog(props) {
  const editor = useOnlineDocument(props);
  const { model, setModel } = editor;
  const readOnly = editor.record && editor.record.status !== 'Draft';
  return (
    <Dialog open={props.open} onOpenChange={(open) => { if (!open) editor.close(); }}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto border-2 border-[#0A2B6D] bg-white p-0 sm:rounded-2xl shadow-xl">
        {/* Clean Solid Dark Blue & Light Blue Landing-Style Form Header (No Gradient) */}
        <div className="border-b-4 border-[#0072FF] bg-[#0A2B6D] px-6 py-4 text-white">
          <DialogHeader className="text-left">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#0072FF] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              <FileCheck2 className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Interactive Controlled Form &amp; Document Vault</span>
            </div>
            <DialogTitle className="mt-1.5 pr-6 font-editorial text-xl font-extrabold leading-snug text-white">
              Fill Out Online · {props.title}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-[#E0F2FE]">
              Complete on screen, save a draft at any stage, or file the completed record directly into the Document Vault.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-7 bg-white text-[#0A2B6D]">
          {editor.loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-[#0A2B6D]">
              <Loader2 className="h-5 w-5 animate-spin text-[#0072FF]" />
              <span className="font-semibold">Loading saved documents...</span>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); editor.save(true); }} className="space-y-6">
              {editor.error && (
                <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  {editor.error}
                </p>
              )}
              {editor.notice && (
                <p role="status" className="rounded-xl border border-sky-200 bg-[#F0F7FF] p-4 text-sm font-semibold text-[#0A2B6D]">
                  {editor.notice}
                </p>
              )}
              {(props.libraryKey?.startsWith('staff-') || props.intakeCase?.intake_type === 'Employee') && <EmployeeRecordNotice />}
              <OnlineDocumentHistory
                records={editor.records}
                selectedId={editor.record?.id}
                onSelect={editor.select}
                onNew={() => editor.select('')}
                onMore={editor.more}
                hasMore={editor.hasMore}
                disabled={editor.busy || !editor.ready}
              />
              <OnlineDocumentReading title={props.title} code={props.code} />
              <OnlineDocumentFields
                fields={props.definition.fields}
                answers={model.answers}
                onChange={(label, value) =>
                  setModel((current) => ({ ...current, answers: { ...current.answers, [label]: value } }))
                }
                disabled={editor.busy || readOnly || !editor.ready}
                requireAll={props.requireAll}
              />
              <OnlineDocumentRegister
                columns={props.definition.columns}
                rows={model.tableRows}
                onChange={(rows) => setModel((current) => ({ ...current, tableRows: rows }))}
                disabled={editor.busy || readOnly || !editor.ready}
              />
              <OnlineDocumentConfirmation model={model} onChange={setModel} disabled={editor.busy || readOnly || !editor.ready} />
              <OnlineDocumentActions editor={editor} readOnly={readOnly} />
              {readOnly && <DocumentAcknowledgements entity="FormSubmission" documentId={editor.record.id} title={props.title} />}
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}