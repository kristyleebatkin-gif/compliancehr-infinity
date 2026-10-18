import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronDown, Download, ExternalLink, FileText, Loader2, Pencil, Search, UploadCloud } from 'lucide-react';
import OnlineDocumentDialog from '@/components/documents/OnlineDocumentDialog';
import { downloadOriginalDocument } from '@/lib/documentDownloads';
import { routeDocument } from '@/lib/documentRouting';
import { downloadBlankFormPdf } from '@/lib/formsLibraryPdf';
import { downloadBrandedTemplatePdf, getTemplateMeta } from '@/lib/officialFormTemplates';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function AttachedFormsLibrary({
  title,
  subtitle,
  libraryKey,
  sections,
  formFiles,
  formCodes = {},
  definitions = {},
  defaultOpen = false,
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(defaultOpen);
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState('');
  const [downloading, setDownloading] = useState('');
  const [onlineType, setOnlineType] = useState('');

  const load = async () => {
    try {
      const page = await base44.entities.FormsLibraryDocument.filter({ library: libraryKey }, { sort: '-uploaded_date', limit: 500 });
      setDocuments(page.items || []);
    } catch (error) { console.error(error); }
  };
  useEffect(() => { load(); }, [libraryKey]);

  const download = async (docType) => {
    setDownloading(docType);
    try {
      const definition = definitions[docType] || {};
      const meta = getTemplateMeta(docType);
      if (definition.fields?.length || definition.columns?.length || meta) {
        await downloadBrandedTemplatePdf({
          title: docType,
          code: formCodes[docType],
          subtitle: definition.label || 'ComplianceHR Form',
          ...meta,
          fields: definition.fields || [],
          columns: definition.columns,
          rows: definition.rows,
        });
      } else if (formFiles[docType]) {
        await downloadOriginalDocument(formFiles[docType], `${docType} - Official Template`);
      } else {
        downloadBlankFormPdf({
          title: docType,
          code: formCodes[docType],
          subtitle: definition.label || 'ComplianceHR Form',
          fields: definition.fields || [],
          columns: definition.columns,
          rows: definition.rows,
        });
      }
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    } finally {
      setDownloading('');
    }
  };

  const upload = async (docType, file) => {
    if (!file) return;
    setUploading(docType);
    try {
      const user = await base44.auth.me();
      // Completed forms stay private in the app's own storage.
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const record = await base44.entities.FormsLibraryDocument.create({
        library: libraryKey,
        document_type: docType,
        title: file.name,
        file_name: file.name,
        file_uri,
        uploaded_date: new Date().toISOString().slice(0, 10),
        uploaded_by: user?.full_name || user?.email || '',
      });
      routeDocument(record);
      toast({ title: `${docType} uploaded`, description: 'Copy linked to this record and filed on the Document Register.' });
      load();
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

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

  return (
    <div className="rounded-2xl border border-brand/25 bg-card">
      <div className="h-1 w-full rounded-t-2xl gradient-brand" />
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-3.5">
        <div className="text-left">
          <div className="text-sm font-bold font-editorial">{title}</div>
          <div className="text-xs text-foreground/50">{subtitle}</div>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-brand transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-5 border-t border-border/60 p-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder={`Search ${libraryKey.toLowerCase()} forms...`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {sections.map((section) => {
            const Icon = section.icon;
            const term = search.trim().toLowerCase();
            const matched = term
              ? section.docs.filter((docType) => `${formCodes[docType] || ''} ${docType}`.toLowerCase().includes(term))
              : section.docs;
            if (term && matched.length === 0) return null;
            return (
              <div key={section.name}>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  <Icon className="h-3.5 w-3.5" />{section.name}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {matched.map((docType) => {
                    const code = formCodes[docType];
                    const label = code ? `${code} - ${docType}` : docType;
                    const uploaded = documents.filter((d) => d.document_type === docType);
                    return (
                      <div key={docType} className="rounded-lg border border-border/60 p-2.5">
                        <div className="flex w-full items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 shrink-0 text-brand" />
                          <span className="flex-1 truncate font-medium">{label}</span>
                          {formFiles[docType] && <span className="rounded-full bg-safe/10 px-1.5 py-0.5 text-[9px] font-bold text-safe">Official</span>}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <button onClick={() => download(docType)} disabled={downloading === docType} className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground/70 hover:bg-muted disabled:opacity-50">
                            {downloading === docType ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}Download
                          </button>
                          <label className={`inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-muted ${uploading === docType ? 'pointer-events-none opacity-50' : ''}`}>
                            {uploading === docType ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                            {uploaded.length ? 'Replace' : 'Upload'}
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={(event) => upload(docType, event.target.files?.[0])} />
                          </label>
                        </div>
                        {!!(definitions[docType]?.fields?.length || definitions[docType]?.columns?.length) && (
                          <button onClick={() => setOnlineType(docType)} className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-primary/40 bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/80">
                            <Pencil className="h-3.5 w-3.5" />Fill out online / Saved drafts
                          </button>
                        )}
                        {uploaded.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {uploaded.slice(0, 3).map((d) => (
                              <button key={d.id} onClick={() => view(d)} className="flex w-full items-center gap-1 truncate text-[11px] text-teal hover:underline">
                                <ExternalLink className="h-3 w-3 shrink-0" />{d.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {onlineType && <OnlineDocumentDialog key={`${libraryKey}:${onlineType}`} open={true} title={onlineType} code={formCodes[onlineType]} definition={definitions[onlineType]} libraryKey={libraryKey}
        onOpenChange={(isOpen) => { if (!isOpen) setOnlineType(''); }}
        onSaved={async () => { await load(); toast({ title: `${onlineType} completed and filed` }); }} />}
    </div>
  );
}