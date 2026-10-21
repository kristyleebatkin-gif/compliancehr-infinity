import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadChecklistPdf } from '@/lib/checklistsPdf';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Download, Upload, FileText, Trash2, ClipboardList } from 'lucide-react';

export default function AuditChecklistLibrary() {
  const { toast } = useToast();
  const [checklists, setChecklists] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [checklistPage, copyPage] = await Promise.all([
        base44.entities.Checklist.filter({}, { sort: 'title', limit: 200 }),
        base44.entities.AuditChecklistFile.filter({}, { sort: '-created_date', limit: 200 }),
      ]);
      setChecklists(checklistPage.items);
      setCopies(copyPage.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const downloadMaster = (checklist) => {
    downloadChecklistPdf({
      title: checklist.title,
      code: 'AUD-CHK',
      subtitle: `Audit checklist copy - ${checklist.category || 'General'}${checklist.due_date ? ` (due ${format(new Date(checklist.due_date), 'd MMM yyyy')})` : ''}`,
      items: (checklist.items || []).map((i) => i.text),
    });
    toast({ title: 'Checklist copy downloaded' });
  };

  const uploadCopy = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.AuditChecklistFile.create({
        title: file.name,
        checklist_title: source || 'General',
        file_uri,
        file_name: file.name,
        notes,
      });
      setFile(null);
      setSource('');
      setNotes('');
      await load();
      toast({ title: 'Completed checklist stored securely' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const downloadCopy = async (copy) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: copy.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Could not open file', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#6d28d9]" />
            <p className="font-semibold">Master audit checklists</p>
            <span className="text-xs text-muted-foreground">download a printable copy of any checklist</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : checklists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No checklists in the library yet.</p>
          ) : (
            <div className="space-y-2">
              {checklists.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[[c.category], [`${(c.items || []).length} items`], [c.due_date ? `Due ${format(new Date(c.due_date), 'd MMM yyyy')}` : '']]
                        .map((p) => p[0]).filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadMaster(c)}><Download className="mr-2 h-4 w-4" />Download copy</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#6d28d9]" />
            <p className="font-semibold">Stored completed checklists</p>
            <span className="text-xs text-muted-foreground">upload and store completed audit checklists</span>
          </div>
          <div className="mb-4 grid gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 sm:grid-cols-4">
            <div className="grid gap-1.5"><Label>Completed checklist file</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
            <div className="grid gap-1.5"><Label>Source checklist</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{checklists.map((c) => <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={uploadCopy} disabled={!file || uploading}>
              {uploading ? <Upload className="mr-2 h-4 w-4 animate-pulse" /> : <Upload className="mr-2 h-4 w-4" />}{uploading ? 'Storing...' : 'Upload & store'}
            </Button></div>
          </div>
          {copies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed checklists stored yet.</p>
          ) : (
            <div className="space-y-2">
              {copies.map((copy) => (
                <div key={copy.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm">
                  <div>
                    <p className="font-medium">{copy.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[[copy.checklist_title ? `Checklist: ${copy.checklist_title}` : ''], [`Stored ${format(new Date(copy.created_date), 'd MMM yyyy')}`],
                        [copy.uploaded_by ? `By ${copy.uploaded_by}` : ''], [copy.notes]]
                        .map((p) => p[0]).filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => downloadCopy(copy)}><Download className="mr-2 h-4 w-4" />Download</Button>
                    <Button variant="ghost" size="icon" onClick={async () => { if (confirm('Delete this stored copy?')) { await base44.entities.AuditChecklistFile.delete(copy.id); await load(); } }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}