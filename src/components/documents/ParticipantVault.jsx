import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FolderOpen, Download, Pencil, Trash2, Plus } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ParticipantDocumentDialog from '@/components/documents/ParticipantDocumentDialog';
import DocumentAcknowledgements from '@/components/documents/DocumentAcknowledgements';
import { format } from 'date-fns';
import { openDocumentInViewer, exportDocumentRecord, resolveDocumentUrl } from '@/lib/openDocument';
import { logUserAction } from '@/lib/actionLog';

export default function ParticipantVault({ docs, loading, viewDoc, me, profile, onDone }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleOpen = async (doc) => {
    if (viewDoc) return viewDoc(doc);
    return openDocumentInViewer(doc);
  };

  const downloadDoc = async (doc) => {
    try {
      const href = await resolveDocumentUrl(doc);
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.download = doc.title || doc.document_type || 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      exportDocumentRecord(doc, 'pdf');
    } catch {
      exportDocumentRecord(doc, 'pdf');
    }
  };

  const removeDoc = async (doc) => {
    if (!confirm('Delete this document?')) return;
    await logUserAction('Document Deleted', 'Participant Document', { record_id: doc.id, record_title: doc.title || doc.document_type || 'Document', person: { profile_type: 'participant', profile_id: doc.participant_id, profile_name: doc.participant_name } });
    await base44.entities.ParticipantDocument.delete(doc.id);
    onDone?.();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Your documents: view, download, upload and edit your own records.</p>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />Upload document</Button>
      </div>
      {docs.length === 0 ? (
        <EmptyState icon={FolderOpen} modulePath="/documents" title="No documents yet" message="Documents your support team files, or ones you upload yourself, will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((d) => (
            <Card key={d.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handleOpen(d)}
                      className="truncate text-left font-semibold text-[#0A2B6D] hover:text-[#0072FF] hover:underline"
                    >
                      {d.title || d.document_type}
                    </button>
                    <p className="text-sm text-muted-foreground">{d.document_type}</p>
                  </div>
                  <Badge variant="outline">{d.review_outcome || d.status || 'Received'}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.uploaded_date ? `Added ${format(new Date(d.uploaded_date), 'd MMM yyyy')}` : ''}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" title="Open document" onClick={() => handleOpen(d)}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> Open
                    </Button>
                    <Button variant="ghost" size="icon" title="Download PDF" onClick={() => downloadDoc(d)}><Download className="h-4 w-4 text-foreground/60" /></Button>
                    <Button variant="ghost" size="icon" title="Edit document" onClick={() => { setEditing(d); setOpen(true); }}><Pencil className="h-4 w-4 text-foreground/60" /></Button>
                    <Button variant="ghost" size="icon" title="Delete document" onClick={() => removeDoc(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="mt-2"><DocumentAcknowledgements entity="ParticipantDocument" documentId={d.id} title={d.title || d.document_type} /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ParticipantDocumentDialog
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}
        me={me}
        profile={profile}
        initial={editing}
        onDone={onDone}
      />
    </div>
  );
}