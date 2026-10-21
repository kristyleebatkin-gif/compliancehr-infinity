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
import { safeUrl } from '@/lib/safeUrl';
import { logUserAction } from '@/lib/actionLog';

export default function ParticipantVault({ docs, loading, viewDoc, me, profile, onDone }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const downloadDoc = async (doc) => {
    try {
      let href = null;
      if (doc.file_uri) href = (await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri })).signed_url;
      else href = safeUrl(doc.file_url);
      if (!href) return;
      const a = document.createElement('a');
      a.href = href;
      a.download = doc.title || doc.document_type || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
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
                    <p className="truncate font-semibold">{d.title || d.document_type}</p>
                    <p className="text-sm text-muted-foreground">{d.document_type}</p>
                  </div>
                  <Badge variant="outline">{d.review_outcome || d.status || 'Received'}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.uploaded_date ? `Added ${format(new Date(d.uploaded_date), 'd MMM yyyy')}` : ''}</span>
                  <div className="flex items-center gap-1">
                    {d.file_uri && (
                      <Button variant="ghost" size="icon" title="View document" onClick={() => viewDoc(d)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
                    )}
                    {(d.file_uri || d.file_url) && (
                      <Button variant="ghost" size="icon" title="Download" onClick={() => downloadDoc(d)}><Download className="h-4 w-4 text-foreground/60" /></Button>
                    )}
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