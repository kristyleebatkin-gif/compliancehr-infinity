import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
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
  return <Dialog open={props.open} onOpenChange={(open) => { if (!open) editor.close(); }}>
    <DialogContent className="max-h-[92dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto bg-card sm:p-7">
      <DialogHeader><DialogTitle className="pr-6 leading-relaxed">Fill out online · {props.title}</DialogTitle><DialogDescription>Complete on screen, save a draft or file the finished document.</DialogDescription></DialogHeader>
      {editor.loading ? <div className="flex items-center justify-center gap-3 py-16"><Loader2 className="h-5 w-5 animate-spin" />Loading saved documents...</div> : <form onSubmit={(e) => { e.preventDefault(); editor.save(true); }} className="space-y-6">
        {editor.error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{editor.error}</p>}
        {editor.notice && <p role="status" className="rounded-lg border border-primary/30 bg-accent p-4 text-sm text-accent-foreground">{editor.notice}</p>}
        {(props.libraryKey?.startsWith('staff-') || props.intakeCase?.intake_type === 'Employee') && <EmployeeRecordNotice />}
        <OnlineDocumentHistory records={editor.records} selectedId={editor.record?.id} onSelect={editor.select} onNew={() => editor.select('')} onMore={editor.more} hasMore={editor.hasMore} disabled={editor.busy || !editor.ready} />
        <OnlineDocumentReading title={props.title} code={props.code} />
        <OnlineDocumentFields fields={props.definition.fields} answers={model.answers} onChange={(label, value) => setModel((current) => ({ ...current, answers: { ...current.answers, [label]: value } }))} disabled={editor.busy || readOnly || !editor.ready} requireAll={props.requireAll} />
        <OnlineDocumentRegister columns={props.definition.columns} rows={model.tableRows} onChange={(rows) => setModel((current) => ({ ...current, tableRows: rows }))} disabled={editor.busy || readOnly || !editor.ready} />
        <OnlineDocumentConfirmation model={model} onChange={setModel} disabled={editor.busy || readOnly || !editor.ready} />
        <OnlineDocumentActions editor={editor} readOnly={readOnly} />
        {readOnly && <DocumentAcknowledgements entity="FormSubmission" documentId={editor.record.id} title={props.title} />}
      </form>}
    </DialogContent>
  </Dialog>;
}