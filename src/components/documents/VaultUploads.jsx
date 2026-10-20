import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, FolderCheck, Loader2, Trash2 } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

/**
 * Vault uploads report: lists and exports every document uploaded anywhere in
 * the app (participant, staff, intake and company-safe libraries) plus the
 * employee document register, so the vault is the single source of truth.
 */
export default function VaultUploads() {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [extraDocs, setExtraDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Full cursor loop - exports need every record, not just the first page.
      const all = [];
      let cursor;
      do {
        const page = await base44.entities.FormsLibraryDocument.filter({}, { sort: '-uploaded_date', limit: 500, cursor });
        all.push(...(page.items || []));
        cursor = page.has_more ? page.next_cursor : undefined;
      } while (cursor);
      const extra = await base44.entities.EmployeeDocument.filter({}, { sort: '-created_date', limit: 1000 }).catch(() => ({ items: [] }));
      setDocs(all);
      setExtraDocs(extra.items || []);
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

  const exportAll = () => {
    setExporting(true);
    try {
      const rows = [
        ...docs.map((d) => ({ source: d.library || 'vault', title: d.title, document_type: d.document_type, file_name: d.file_name || d.title, uploaded_date: d.uploaded_date, uploaded_by: d.uploaded_by })),
        ...extraDocs.map((d) => ({ source: 'employee document register', title: d.title, document_type: d.document_type, file_name: d.title, uploaded_date: d.issue_date, uploaded_by: d.employee_name })),
      ];
      downloadCsv('Document Vault - Full Export.csv', [
        { key: 'source', label: 'Library / Source' },
        { key: 'title', label: 'Document Title' },
        { key: 'document_type', label: 'Document Type' },
        { key: 'file_name', label: 'File Name' },
        { key: 'uploaded_date', label: 'Date' },
        { key: 'uploaded_by', label: 'Uploaded By / Employee' },
      ], rows);
    } finally {
      setExporting(false);
    }
  };

  const counts = docs.reduce((acc, d) => { const k = d.library || 'vault'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});

  return (
    <div className="vault-uploads rounded-lg border border-border/60 bg-card p-1.5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold"><FolderCheck className="h-4 w-4 text-brand" />Vault uploads report ({docs.length + extraDocs.length})</div>
        <Button size="sm" variant="outline" disabled={exporting || loading} onClick={exportAll}>
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}Export full vault list
        </Button>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">Every file uploaded across participants, staff, intake and the company safe, all in one place, with a downloadable export of the complete vault.</p>
      <div className="vault-upload-counts mb-1 flex flex-wrap gap-1">
        {Object.entries(counts).map(([library, count]) => (
          <Badge key={library} variant="outline" className="text-[10px]">{library}: {count}</Badge>
        ))}
        {extraDocs.length > 0 && <Badge variant="outline" className="text-[10px]">employee register: {extraDocs.length}</Badge>}
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No uploads yet.</p>
      ) : (
        <div className="vault-upload-list">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Badge variant="outline" className="shrink-0 text-[10px]">{d.library}</Badge>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="text-[11px] text-muted-foreground">{d.document_type}{d.uploaded_date ? ` · ${d.uploaded_date}` : ''}{d.uploaded_by ? ` · ${d.uploaded_by}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {(d.file_uri || d.file_url) && (
                  <Button variant="ghost" size="icon" onClick={() => view(d)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.FormsLibraryDocument.delete(d.id); await load(); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}