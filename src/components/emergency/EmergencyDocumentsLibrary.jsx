import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EMERGENCY_DOC_GROUPS } from '@/lib/emergencyTemplates';
import EmergencyDocumentDialog from '@/components/emergency/EmergencyDocumentDialog';
import EmergencyDocumentTile from '@/components/emergency/EmergencyDocumentTile';

export default function EmergencyDocumentsLibrary({ open, onOpenChange, onChanged }) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('Other');
  const load = useCallback(async (cursor = null) => {
    setLoading(true);
    try { const page = await base44.entities.EmergencyDocument.filter({}, { sort: '-created_date', limit: 300, cursor }); setDocuments((current) => cursor ? [...current, ...page.items] : page.items); setNextCursor(page.next_cursor); setHasMore(page.has_more); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const upload = async (docType, file, participantName) => {
    if (!file) return false;
    setUploading(true);
    try {
      const me = await base44.auth.me();
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.EmergencyDocument.create({ title: file.name, doc_type: docType, participant_name: participantName || '', file_uri, file_name: file.name, issue_date: new Date().toISOString().slice(0, 10), uploaded_by: me?.full_name || me?.email || '' });
      await load();
      await onChanged?.();
      toast({ title: `Document added to ${docType}` });
      return true;
    } catch (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return false; }
    finally { setUploading(false); }
  };
  const openDoc = async (doc) => {
    try { const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri }); window.open(signed_url, '_blank'); }
    catch (error) { toast({ title: 'Unable to open document', description: error.message, variant: 'destructive' }); }
  };
  const remove = async (doc) => { await base44.entities.EmergencyDocument.delete(doc.id); await load(); await onChanged?.(); };
  const add = (type) => { setSelectedType(type); onOpenChange(true); };
  const knownTypes = EMERGENCY_DOC_GROUPS.flatMap((group) => group.types);
  return <div className="space-y-4">
    <p className="text-xs text-muted-foreground">Choose an existing tile when adding a document. Blank templates are grouped below the page header.</p>
    <EmergencyDocumentDialog open={open} onOpenChange={onOpenChange} initialType={selectedType} saving={uploading} onUpload={upload} />
    {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : EMERGENCY_DOC_GROUPS.map((group) => <section key={group.name}>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.name}</h2>
      <div className="grid gap-3 md:grid-cols-2">{group.types.map((type) => <EmergencyDocumentTile key={type} type={type} documents={documents.filter((doc) => doc.doc_type === type || (type === 'Other' && !knownTypes.includes(doc.doc_type)))} onAdd={add} onOpen={openDoc} onRemove={remove} />)}</div>
    </section>)}
    {hasMore && <Button type="button" variant="outline" disabled={loading} onClick={() => load(nextCursor)}>Load more documents</Button>}
  </div>;
}