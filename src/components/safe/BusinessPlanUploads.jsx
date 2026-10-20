import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import { useToast } from '@/components/ui/use-toast';
import { Download, ExternalLink, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { routeDocument } from '@/lib/documentRouting';
import { downloadBusinessPlanPdf, downloadOperationalPlanPdf, downloadStrategicPlanPdf, downloadPlanTemplatePdf } from '@/lib/businessDocuments';

export const BUSINESS_PLANS = [
  { label: 'Business Plan', download: downloadBusinessPlanPdf },
  { label: 'Business Operational Plan', download: downloadOperationalPlanPdf },
  { label: 'Business Strategic Plan', download: downloadStrategicPlanPdf },
  { label: 'Business Continuity Plan', download: () => downloadPlanTemplatePdf('Business Continuity Plan') },
];

const PLAN_LABELS = BUSINESS_PLANS.map((p) => p.label);

export default function BusinessPlanUploads({ showTemplates = true }) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.FormsLibraryDocument.filter(
        { library: 'company-safe', document_type: { $in: PLAN_LABELS } },
        { sort: '-uploaded_date', limit: 500 }
      );
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
      } else if (safeUrl(doc.file_url)) {
        window.open(safeUrl(doc.file_url), '_blank', 'noopener,noreferrer');
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
      <div className="mb-1 flex items-center gap-2 text-sm font-bold font-editorial"><span className="h-4 w-1.5 rounded-full bg-primary" />Completed business plans</div>
      <p className="mb-4 text-xs text-muted-foreground">Upload and view the provider's current signed plans in the Document Vault.</p>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {BUSINESS_PLANS.map((plan) => {
            const uploaded = documents.filter((d) => d.document_type === plan.label);
            return (
              <div key={plan.label} className="rounded-lg border border-[#0369a1]/20 bg-[#0369a1]/[0.04] p-2.5">
                <div className="flex w-full items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0369a1]"><FileText className="h-3.5 w-3.5 text-white" /></span>
                  <span className="flex-1 truncate font-medium">{plan.label}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {showTemplates && <button onClick={plan.download} className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground/70 hover:bg-muted">
                    <Download className="h-3 w-3" />Download
                  </button>}
                  <label className={`inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-muted ${uploading === plan.label ? 'pointer-events-none opacity-50' : ''}`}>
                    {uploading === plan.label ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                    {uploaded.length ? 'Add another' : 'Upload'}
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={(e) => upload(plan.label, e.target.files?.[0])} />
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