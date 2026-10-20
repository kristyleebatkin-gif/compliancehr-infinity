import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { useToast } from '@/components/ui/use-toast';
import { Download, Mail, MessageSquare, Phone, Trash2, UploadCloud, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { BLANK_INTAKE_FORMS, VOLUNTEER_DOC_TYPES, VOLUNTEER_TRAINING_MODULES } from '@/lib/volunteerIntake';

function Row({ label, value }) {
  if (!value) return null;
  return <div className="text-sm"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span><p>{value}</p></div>;
}

export default function VolunteerDetail({ open, onOpenChange, volunteer, onSaved }) {
  const { toast } = useToast();
  const [training, setTraining] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('Staff Information Form');
  const [trainingForm, setTrainingForm] = useState({ module_title: '', training_provider: '', completed_date: '', expiry_date: '', score: '', certificate_number: '' });
  const [addingTraining, setAddingTraining] = useState(false);
  const [uploadingIntakeForm, setUploadingIntakeForm] = useState(false);

  const loadLists = useCallback(async () => {
    if (!volunteer?.id) return;
    setLoadingLists(true);
    try {
      const [trainingPage, docPage] = await Promise.all([
        base44.entities.VolunteerTraining.filter({ volunteer_id: volunteer.id }, { sort: '-completed_date', limit: 100 }),
        base44.entities.VolunteerDocument.filter({ volunteer_id: volunteer.id }, { sort: '-created_date', limit: 100 }),
      ]);
      setTraining(trainingPage.items);
      setDocuments(docPage.items);
    } finally {
      setLoadingLists(false);
    }
  }, [volunteer?.id]);

  useEffect(() => { if (open) loadLists(); }, [open, loadLists]);

  const downloadStored = async (fileUri, fallbackName) => {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri });
    const link = document.createElement('a');
    link.href = signed_url;
    link.download = fallbackName || 'document';
    link.target = '_blank';
    link.click();
  };

  const uploadIntakeForm = async (file) => {
    if (!file) return;
    setUploadingIntakeForm(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Volunteer.update(volunteer.id, { intake_form_uri: file_uri, intake_form_name: file.name });
      onSaved();
      toast({ title: 'Staff intake form stored', description: `${file.name} is saved against this volunteer.` });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingIntakeForm(false);
    }
  };

  const uploadDocument = async (file) => {
    if (!file) return;
    setUploadingDoc(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.VolunteerDocument.create({
        title: docType, volunteer_id: volunteer.id, volunteer_name: volunteer.full_name,
        document_type: docType, file_uri, file_name: file.name, uploaded_by: 'Volunteer register',
      });
      await loadLists();
      toast({ title: `${docType} uploaded` });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingDoc(false);
    }
  };

  const addTraining = async () => {
    if (!trainingForm.module_title) return;
    setAddingTraining(true);
    try {
      await base44.entities.VolunteerTraining.create({
        volunteer_id: volunteer.id, volunteer_name: volunteer.full_name,
        module_title: trainingForm.module_title, training_provider: trainingForm.training_provider,
        completed_date: trainingForm.completed_date || undefined, expiry_date: trainingForm.expiry_date || undefined,
        score: trainingForm.score === '' ? undefined : Number(trainingForm.score),
        certificate_number: trainingForm.certificate_number,
      });
      setTrainingForm({ module_title: '', training_provider: '', completed_date: '', expiry_date: '', score: '', certificate_number: '' });
      await loadLists();
      toast({ title: 'Training recorded' });
    } finally {
      setAddingTraining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{volunteer?.full_name}<Badge className={statusTone(volunteer?.status)}>{volunteer?.status}</Badge></DialogTitle>
        </DialogHeader>
        {volunteer && (
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="intake">Staff intake form</TabsTrigger>
              <TabsTrigger value="training">Training ({training.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-2 grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Row label="Volunteer role" value={volunteer.role} />
                <Row label="Supervisor" value={volunteer.supervisor} />
                <Row label="Start date" value={volunteer.start_date ? format(new Date(volunteer.start_date), 'd MMM yyyy') : ''} />
                <Row label="Induction date" value={volunteer.induction_date ? format(new Date(volunteer.induction_date), 'd MMM yyyy') : ''} />
                <Row label="Availability" value={volunteer.availability} />
                <Row label="Weekly hours" value={volunteer.weekly_hours != null ? `${volunteer.weekly_hours} hrs` : ''} />
                <Row label="Date of birth" value={volunteer.date_of_birth ? format(new Date(volunteer.date_of_birth), 'd MMM yyyy') : ''} />
                <Row label="Address" value={volunteer.address} />
                <Row label="Emergency contact" value={[volunteer.emergency_contact, volunteer.emergency_contact_phone].filter(Boolean).join(' · ')} />
                <Row label="NDIS Worker Screening" value={volunteer.ndis_worker_screening} />
                <Row label="Blue Card" value={volunteer.blue_card_number} />
                <Row label="Police check" value={volunteer.police_check_date ? format(new Date(volunteer.police_check_date), 'd MMM yyyy') : ''} />
                <Row label="Reference checks" value={volunteer.reference_checks} />
                <Row label="Notes" value={volunteer.notes} />
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
                <Button size="sm" disabled={!volunteer.email} onClick={() => { window.location.href = `mailto:${volunteer.email}?subject=${encodeURIComponent(`${volunteer.full_name} - volunteering`)}`; }}>
                  <Mail className="mr-2 h-4 w-4" />Email
                </Button>
                <Button size="sm" variant="outline" disabled={!volunteer.phone} onClick={() => { window.location.href = `sms:${volunteer.phone}`; }}>
                  <MessageSquare className="mr-2 h-4 w-4" />Text (SMS)
                </Button>
                <Button size="sm" variant="outline" disabled={!volunteer.phone} onClick={() => { window.location.href = `tel:${volunteer.phone}`; }}>
                  <Phone className="mr-2 h-4 w-4" />Call
                </Button>
                <span className="ml-auto self-center text-xs text-muted-foreground">{volunteer.email || volunteer.phone ? 'Contact directly from here' : 'Add an email or phone to enable contact'}</span>
              </div>
            </TabsContent>

            <TabsContent value="intake" className="mt-3 grid gap-3">
              <p className="text-sm text-muted-foreground">Download the blank staff intake form, have the volunteer complete it, then upload and store the finished form here.</p>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">1. Download blank form</p>
                <div className="flex flex-wrap gap-2">
                  {BLANK_INTAKE_FORMS.map((f) => (
                    <Button key={f.name} size="sm" variant="outline" onClick={() => window.open(f.url, '_blank')}><Download className="mr-2 h-3 w-3" />{f.name}</Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">2. Upload completed form</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm shadow-sm hover:bg-accent">
                  {uploadingIntakeForm ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {volunteer.intake_form_name ? 'Replace stored intake form' : 'Upload completed intake form'}
                  <input type="file" className="hidden" onChange={(e) => uploadIntakeForm(e.target.files?.[0])} disabled={uploadingIntakeForm} />
                </label>
              </div>
              {volunteer.intake_form_uri ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm">{volunteer.intake_form_name}</p>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => downloadStored(volunteer.intake_form_uri, volunteer.intake_form_name)}><Download className="mr-2 h-3 w-3" />Download</Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No completed intake form stored yet.</p>
              )}
            </TabsContent>

            <TabsContent value="training" className="mt-3 grid gap-3">
              <div className="grid gap-2 rounded-xl border border-border/60 p-3 sm:grid-cols-3">
                <div className="grid gap-1.5 sm:col-span-3"><Label>Training module</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={trainingForm.module_title} onChange={(e) => setTrainingForm({ ...trainingForm, module_title: e.target.value })}>
                    <option value="">Select training...</option>
                    {VOLUNTEER_TRAINING_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="grid gap-1.5"><Label>Provider</Label><Input value={trainingForm.training_provider} onChange={(e) => setTrainingForm({ ...trainingForm, training_provider: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Completed</Label><Input type="date" value={trainingForm.completed_date} onChange={(e) => setTrainingForm({ ...trainingForm, completed_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Expiry</Label><Input type="date" value={trainingForm.expiry_date} onChange={(e) => setTrainingForm({ ...trainingForm, expiry_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Score (%)</Label><Input type="number" value={trainingForm.score} onChange={(e) => setTrainingForm({ ...trainingForm, score: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Certificate number</Label><Input value={trainingForm.certificate_number} onChange={(e) => setTrainingForm({ ...trainingForm, certificate_number: e.target.value })} /></div>
                <Button className="self-end" size="sm" onClick={addTraining} disabled={addingTraining || !trainingForm.module_title}><Plus className="mr-1 h-3 w-3" />Record training</Button>
              </div>
              {loadingLists ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /> : training.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No training recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {training.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.module_title}</p>
                        <p className="text-xs text-muted-foreground">{[t.completed_date ? `Completed ${format(new Date(t.completed_date), 'd MMM yyyy')}` : '', t.expiry_date ? `Expires ${format(new Date(t.expiry_date), 'd MMM yyyy')}` : '', t.training_provider, t.score != null ? `${t.score}%` : ''].filter(Boolean).join(' · ')}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={async () => { await base44.entities.VolunteerTraining.delete(t.id); await loadLists(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-3 grid gap-3">
              <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border/60 p-3">
                <div className="grid min-w-48 gap-1.5"><Label>Document type</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={docType} onChange={(e) => setDocType(e.target.value)}>
                    {VOLUNTEER_DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm shadow-sm hover:bg-accent">
                  {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Upload document
                  <input type="file" className="hidden" onChange={(e) => uploadDocument(e.target.files?.[0])} disabled={uploadingDoc} />
                </label>
              </div>
              {loadingLists ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /> : documents.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{[d.file_name, d.issue_date ? `Issued ${format(new Date(d.issue_date), 'd MMM yyyy')}` : '', d.expiry_date ? `Expires ${format(new Date(d.expiry_date), 'd MMM yyyy')}` : ''].filter(Boolean).join(' · ')}</p>
                      </div>
                      <div className="ml-auto flex">
                        {d.file_uri && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadStored(d.file_uri, d.file_name)}><Download className="h-3.5 w-3.5" /></Button>}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.VolunteerDocument.delete(d.id); await loadLists(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}