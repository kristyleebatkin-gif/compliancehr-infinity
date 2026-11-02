import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { currentUserName } from '@/lib/statusLog';
import { openDocumentInViewer } from '@/lib/openDocument';
import { format } from 'date-fns';
import { Upload, FileDown, Loader2, Trash2, Paperclip } from 'lucide-react';

// Audit evidence filed against one NDIS practice standard (principal):
// choose the control, upload the file, and download it any time for audits.
export default function StandardEvidence({ standard, controls, colour }) {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [control, setControl] = useState(controls[0] || '');
  const [activated, setActivated] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await base44.entities.AuditEvidenceFile.filter({ standard }, { sort: '-created_date', limit: 100 });
      setFiles(page.items);
    } catch {
      setFiles([]);
    }
  }, [standard]);

  useEffect(() => { if (activated) load(); }, [activated, load]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.AuditEvidenceFile.create({
        title: file.name,
        standard,
        control: control || controls[0] || '',
        file_name: file.name,
        file_uri,
        uploaded_by: await currentUserName(),
        uploaded_date: format(new Date(), 'yyyy-MM-dd'),
      });
      await load();
      toast({ title: 'Evidence filed to the standard (stored privately)' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const download = async (doc) => {
    try {
      await openDocumentInViewer(doc);
    } catch (error) {
      toast({ title: 'Could not open file', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <details
      onToggle={(e) => { if (e.target === e.currentTarget && e.currentTarget.open) setActivated(true); }}
      className="rounded-lg border border-border/60 bg-card"
    >
      <summary className="cursor-pointer px-3 py-1.5 text-xs font-bold" style={{ color: colour }}>
        <Paperclip className="mr-1.5 inline h-3.5 w-3.5" />
        Audit evidence{files.length > 0 ? ` (${files.length} filed)` : ' - upload proof to this standard'}
      </summary>
      {activated && (
        <div className="border-t border-border/60 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={control} onValueChange={setControl}>
              <SelectTrigger className="h-8 min-w-0 flex-1 basis-48 text-xs"><SelectValue placeholder="Which control?" /></SelectTrigger>
              <SelectContent>{controls.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
              <Button asChild variant="outline" size="sm" style={{ borderColor: colour, color: colour }}>
                <span>{uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}{uploading ? 'Filing…' : 'Upload evidence'}</span>
              </Button>
            </label>
          </div>
          {files.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No evidence filed for this standard yet. Upload a file so auditors can see proof against this principal.</p>
          ) : (
            <div className="mt-2 space-y-1">
              {files.map((doc) => (
                <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{doc.file_name || doc.title}</p>
                    <p className="truncate text-muted-foreground">{[doc.control, doc.uploaded_by, doc.uploaded_date].filter(Boolean).join(' · ')}</p>
                  </div>
                  <Button variant="outline" size="sm" style={{ borderColor: colour, color: colour }} onClick={() => download(doc)}><FileDown className="mr-1 h-3.5 w-3.5" />Download</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { await base44.entities.AuditEvidenceFile.delete(doc.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </details>
  );
}