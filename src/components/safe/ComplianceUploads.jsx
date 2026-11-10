import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Download, ExternalLink, FileText, Loader2, Trash2, UploadCloud, ChevronDown, ChevronRight } from 'lucide-react';
import { routeDocument } from '@/lib/documentRouting';
import { COMPLIANCE_DOC_TYPES, downloadComplianceTemplatePdf } from '@/lib/complianceDocTemplates';

export default function ComplianceUploads({ defaultOpen = true, docTypes = COMPLIANCE_DOC_TYPES, title = 'Compliance & business documents', description = 'Upload the provider\'s certificates, insurances and statutory records, or download a professional record template for each one. Files are stored in the company safe.' }) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(defaultOpen);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.FormsLibraryDocument.filter({ library: 'company-safe' }, { sort: '-uploaded_date', limit: 500 });
      setDocuments(page.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const view = async (doc) => {
    try {
      const { openDocumentInViewer } = await import('@/lib/openDocument');
      await openDocumentInViewer(doc);
    } catch (error) {
      toast({ title: 'Unable to open document', description: error.message, variant: 'destructive' });
    }
  };

  const upload = async (docType, file) => {
    if (!file) return;
    setUploading(docType);
    try {
      const user = await base44.auth.me();
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const record = await base44.entities.FormsLibraryDocument.create({
        library: 'company-safe',
        document_type: docType,
        title: file.name,
        file_name: file.name,
        file_uri,
        uploaded_date: new Date().toISOString().slice(0, 10),
        uploaded_by: user?.full_name || user?.email || '',
      });
      routeDocument(record);
      toast({ title: `${docType} uploaded`, description: 'Filed on the Document Register.' });
      await load();
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl border-2 bg-card shadow-panel"
      style={{
        borderColor: '#db277766',
        background: 'linear-gradient(155deg, rgba(219,39,119,0.08) 0%, #ffffff 70%)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="comm-panel-bar flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-xs sm:text-sm font-extrabold text-white"
        style={{ background: 'linear-gradient(120deg, #2563eb 0%, #2563eb 40%, #7c3aed 50%, #ec4899 60%, #ec4899 100%)' }}
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{title} ({docTypes.length} subjects)</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
          {open ? <>Minimise <ChevronDown className="h-3.5 w-3.5" /></> : <>Open <ChevronRight className="h-3.5 w-3.5" /></>}
        </span>
      </button>
      {open && <div className="p-5">
      <p className="mb-4 text-xs font-bold text-foreground/80">{description}</p>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {docTypes.map((docType) => {
            const uploaded = documents.filter((d) => d.document_type === docType);
            return (
              <div key={docType} className="rounded-lg border border-brand/20 bg-brand/[0.03] p-2.5">
                <div className="flex w-full items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md gradient-brand"><FileText className="h-3.5 w-3.5 text-white" /></span>
                  <span className="flex-1 truncate font-medium">{docType}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <button onClick={() => downloadComplianceTemplatePdf(docType)} className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground/70 hover:bg-muted">
                    <Download className="h-3 w-3" />Download
                  </button>
                  <label className={`inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-muted ${uploading === docType ? 'pointer-events-none opacity-50' : ''}`}>
                    {uploading === docType ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                    {uploaded.length ? 'Add another' : 'Upload'}
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={(e) => upload(docType, e.target.files?.[0])} />
                  </label>
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {uploaded.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center gap-1 text-[11px]">
                      <button onClick={() => view(d)} className="flex min-w-0 flex-1 items-center gap-1 truncate text-teal hover:underline">
                        <ExternalLink className="h-3 w-3 shrink-0" />{d.title}
                      </button>
                      <button onClick={async () => { await base44.entities.FormsLibraryDocument.delete(d.id); await load(); }} aria-label={`Delete ${d.title}`}>
                        <Trash2 className="h-3 w-3 text-destructive/60 hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>}
    </div>
  );
}