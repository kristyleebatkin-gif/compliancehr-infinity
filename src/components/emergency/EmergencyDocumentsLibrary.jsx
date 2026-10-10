import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Download, ExternalLink, FileDown, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { downloadChecklistPdf } from '@/lib/checklistsPdf';
import { EMERGENCY_TEMPLATES, EMERGENCY_DOC_GROUPS } from '@/lib/emergencyTemplates';
import { format } from 'date-fns';

export default function EmergencyDocumentsLibrary() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState('');
  const [downloading, setDownloading] = useState('');
  const [participantNames, setParticipantNames] = useState({});
  const [downloadingAll, setDownloadingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.EmergencyDocument.filter({}, { sort: '-created_date', limit: 300 });
      setDocuments(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const downloadTemplate = (docType) => {
    setDownloading(docType);
    try {
      const template = EMERGENCY_TEMPLATES[docType] || { code: 'EMG-000', subtitle: 'Emergency response document', fields: [{ label: 'Notes' }] };
      downloadChecklistPdf({
        title: docType,
        code: template.code,
        subtitle: template.subtitle,
        fields: template.fields,
        items: template.items,
        columns: template.columns,
        rows: template.rows,
        signoffFields: ['Prepared / completed by', 'Date', 'Approved by'],
      });
      toast({ title: `${docType} template downloaded`, description: 'Fill it in, then upload the completed copy here.' });
    } catch (error) {
      toast({ title: 'Template download failed', description: error.message, variant: 'destructive' });
    } finally {
      setDownloading('');
    }
  };

  const upload = async (docType, file) => {
    if (!file) return;
    setUploading(docType);
    try {
      const me = await base44.auth.me().catch(() => null);
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.EmergencyDocument.create({
        title: file.name,
        doc_type: docType,
        participant_name: participantNames[docType] || '',
        file_uri,
        file_name: file.name,
        issue_date: new Date().toISOString().slice(0, 10),
        uploaded_by: me?.full_name || me?.email || '',
      });
      setParticipantNames((prev) => ({ ...prev, [docType]: '' }));
      toast({ title: `${docType} stored` });
      await load();
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

  const openDoc = async (doc) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Unable to open document', description: error.message, variant: 'destructive' });
    }
  };

  const remove = async (doc) => {
    await base44.entities.EmergencyDocument.delete(doc.id);
    await load();
  };

  const stored = (docType) => documents.filter((d) => d.doc_type === docType);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Download a blank template for each document, fill it in, then upload the completed copy for storage and download. Everything is kept in the app's private vault.
      </p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        EMERGENCY_DOC_GROUPS.map((group) => (
          <div key={group.name}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">{group.name}</div>
            <div className="grid gap-3 md:grid-cols-2">
              {group.types.map((docType) => {
                const items = stored(docType);
                const isParticipantPlan = docType === 'Participant Personal Emergency Plan';
                return (
                  <div key={docType} className="rounded-xl border border-border/60 bg-card p-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-brand" />
                      <span className="flex-1 font-medium">{docType}</span>
                      {items.length > 0 && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">{items.length}</span>}
                    </div>
                    {isParticipantPlan && (
                      <Input
                        placeholder="Participant name (for personal plans)"
                        value={participantNames[docType] || ''}
                        onChange={(e) => setParticipantNames((prev) => ({ ...prev, [docType]: e.target.value }))}
                        className="mt-2 h-8 text-sm"
                      />
                    )}
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs" disabled={downloading === docType} onClick={() => downloadTemplate(docType)}>
                        {downloading === docType ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}Download blank
                      </Button>
                      <label className={`inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground ${uploading === docType ? 'pointer-events-none opacity-50' : ''}`}>
                        {uploading === docType ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}Upload completed
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={(e) => upload(docType, e.target.files?.[0])} />
                      </label>
                    </div>
                    {items.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {items.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-1.5 text-xs">
                            <button onClick={() => openDoc(doc)} className="flex min-w-0 flex-1 items-center gap-1 truncate text-teal hover:underline">
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              <span className="truncate">{doc.participant_name ? `${doc.participant_name} - ` : ''}{doc.file_name || doc.title}</span>
                            </button>
                            {doc.issue_date && <span className="shrink-0 text-[10px] text-muted-foreground">{format(new Date(doc.issue_date), 'd MMM yyyy')}</span>}
                            <button onClick={() => remove(doc)} className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={downloadingAll || !EMERGENCY_TEMPLATES}
        onClick={() => {
          setDownloadingAll(true);
          try {
            Object.keys(EMERGENCY_TEMPLATES).forEach((docType, index) => {
              setTimeout(() => {
                const template = EMERGENCY_TEMPLATES[docType];
                downloadChecklistPdf({
                  title: docType,
                  code: template.code,
                  subtitle: template.subtitle,
                  fields: template.fields,
                  items: template.items,
                  columns: template.columns,
                  rows: template.rows,
                  signoffFields: ['Prepared / completed by', 'Date', 'Approved by'],
                });
                if (index === Object.keys(EMERGENCY_TEMPLATES).length - 1) setDownloadingAll(false);
              }, index * 500);
            });
          } catch (error) {
            setDownloadingAll(false);
            toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
          }
        }}
      >
        {downloadingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}Download all blank emergency templates
      </Button>
    </div>
  );
}