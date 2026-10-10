import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FolderCheck, Loader2, Trash2 } from 'lucide-react';

/**
 * Lists every document uploaded anywhere in the app (participant, staff,
 * intake and company-safe libraries) so the vault is the single source of truth.
 */
export default function VaultUploads() {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.FormsLibraryDocument.filter({}, { sort: '-uploaded_date', limit: 100 });
      setDocs(page.items || []);
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

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><FolderCheck className="h-4 w-4 text-brand" />Vault uploads ({docs.length})</div>
      <p className="mb-4 text-xs text-muted-foreground">Every file uploaded across participants, staff, intake and the company safe, all in one place.</p>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No uploads yet.</p>
      ) : (
        <div className="space-y-1.5">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Badge variant="outline" className="shrink-0 text-[10px]">{d.library}</Badge>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="text-[11px] text-muted-foreground">{d.document_type}{d.uploaded_by ? ` · ${d.uploaded_by}` : ''}</p>
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