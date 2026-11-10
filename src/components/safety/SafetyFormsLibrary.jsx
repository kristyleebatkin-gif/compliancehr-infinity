import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SectionCard from '@/components/SectionCard';
import { Download, ExternalLink, Loader2, UploadCloud } from 'lucide-react';
import { SAFETY_DOCUMENTS, downloadSafetyDocument, openSafetyFile } from '@/lib/safetyDocuments';
import { recordSafetyEvent } from '@/lib/safetyEvent';

export default function SafetyFormsLibrary({ types = SAFETY_DOCUMENTS.map((document) => document.type) }) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState('');
  const forms = SAFETY_DOCUMENTS.filter((document) => types.includes(document.type));

  const load = async () => {
    try {
      const page = await base44.entities.SafetyDocument.filter({}, { sort: '-uploaded_date', limit: 500 });
      setDocuments(page.items || []);
    }
    catch (error) { console.error(error); }
  };
  useEffect(() => { load(); }, []);

  const upload = async (documentType, file) => {
    if (!file) return;
    setUploading(documentType);
    try {
      const user = await base44.auth.me();
      // Completed safety records stay private in the app's own storage.
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const record = await base44.entities.SafetyDocument.create({
        document_type: documentType,
        title: file.name,
        file_url: file_uri,
        uploaded_date: new Date().toISOString().slice(0, 10),
        uploaded_by: user?.full_name || user?.email || '',
        status: 'Received',
      });
      const result = await recordSafetyEvent('SafetyDocument', record.id);
      toast({
        title: `${documentType} uploaded and registered`,
        description: result.email_failures?.length ? `${result.email_failures.length} administrator email(s) failed.` : 'Administrative users were notified and emailed.',
        variant: result.email_failures?.length ? 'destructive' : undefined,
      });
      load();
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

  return (
    <SectionCard collapsible title="Safety Forms, Uploads & Downloads" description="Download fillable templates or upload completed records. Uploaded records are logged immediately in the appropriate register.">
      <div className="grid gap-3 md:grid-cols-2">
        {forms.map((form) => {
          const completed = documents.filter((document) => document.document_type === form.type);
          return (
            <div key={form.type} className="rounded-xl border border-border/60 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0"><div className="text-sm font-semibold">{form.type}</div><div className="text-xs font-medium text-brand">{form.code}</div></div>
                <button onClick={() => downloadSafetyDocument(form)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"><Download className="h-3.5 w-3.5" />Fillable form</button>
              </div>
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand/10 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/15">
                {uploading === form.type ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                Upload completed form
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg" disabled={uploading === form.type} onChange={(event) => upload(form.type, event.target.files?.[0])} />
              </label>
              {completed.length > 0 && <div className="mt-2 space-y-1">
                {completed.slice(0, 4).map((document) => <button key={document.id} onClick={() => openSafetyFile(document.file_url)} className="flex items-center gap-1 truncate text-xs text-teal hover:underline"><ExternalLink className="h-3 w-3 shrink-0" />{document.title}</button>)}
              </div>}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}