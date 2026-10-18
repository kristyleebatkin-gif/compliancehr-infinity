import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Download, ExternalLink, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { routeDocument } from '@/lib/documentRouting';
import { COMPLIANCE_DOC_TYPES, downloadComplianceTemplatePdf } from '@/lib/complianceDocTemplates';

const DOC_TYPES = COMPLIANCE_DOC_TYPES;

export default function ComplianceUploads() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState('');
  const [loading, setLoading] = useState(true);

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
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        window.open(signed_url, '_blank');
      } else if (doc.file_url) {
        window.open(doc.file_url, '_blank');
      }
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
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold font-editorial"><span className="gradient-brand h-4 w-1.5 rounded-full" />Compliance & business documents</div>
      <p className="mb-4 text-xs text-muted-foreground">Upload the provider's certificates, insurances and statutory records, or download a professional record template for each one. Files are stored in the company safe.</p>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DOC_TYPES.map((docType) => {
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
    </div>
  );
}