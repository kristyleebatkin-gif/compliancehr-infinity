import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SurveyRegister from '@/components/feedback/SurveyRegister';
import FeedbackDetailDialog from '@/components/feedback/FeedbackDetailDialog';
import { changeStatus } from '@/lib/statusLog';
import { downloadCsv } from '@/lib/csvExport';
import { useToast } from '@/components/ui/use-toast';
import { Download, Eye, FileDown, Loader2, Megaphone, Plus, Trash2, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Received', 'Viewed', 'Pending Further Action', 'Finalised'];
const STATUS_DATE = { Viewed: 'viewed_date', 'Pending Further Action': 'pending_date', Finalised: 'finalised_date' };
const blank = { type: 'Feedback', subject: '', message: '', submitted_by: '', contact_details: '', received_via: '', rating: '', assigned_to: '', outcome: '', status: 'Received' };

export default function Feedback({ profile } = {}) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Feedback.filter(profile ? { $or: [{ submitted_by: profile.full_name }, ...(profile.email ? [{ contact_details: profile.email }] : [])] } : {}, { sort: '-created_date', limit: 300 });
      setItems(page.items);
    } finally {
      setLoading(false);
    }
  }, [profile?.full_name, profile?.email]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (profile) setForm((current) => ({ ...current, submitted_by: profile.full_name, contact_details: profile.email || profile.phone || '' })); }, [profile?.id]);

  const save = async () => {
    if (!form.subject.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        rating: Number(form.rating) || undefined,
        received_date: new Date().toISOString(),
        status_log: `${format(new Date(), 'd MMM yyyy HH:mm')} - Recorded as Received`,
      };
      await base44.entities.Feedback.create(payload);
      setForm(blank);
      setOpen(false);
      await load();
      toast({ title: 'Entry recorded' });
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (item, status) => {
    await changeStatus({ entityType: 'Feedback', entity: 'Feedback', record: item, toStatus: status, dateField: STATUS_DATE[status] });
    await load();
  };

  const uploadForm = async (item, file) => {
    if (!file) return;
    setUploading(item.id);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Feedback.update(item.id, { form_uri: file_uri, form_name: file.name });
      toast({ title: 'Feedback form stored' });
      await load();
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

  const downloadForm = async (item) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: item.form_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  const view = async (item) => {
    if (!item.viewed_date && item.status === 'Received') await setStatus(item, 'Viewed');
    setDetail(item);
  };

  const exportRegister = () => {
    downloadCsv('feedback-register.csv', [
      { key: 'subject', label: 'Subject' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' },
      { key: 'submitted_by', label: 'Submitted By' }, { key: 'contact_details', label: 'Contact Details' },
      { key: 'received_via', label: 'Received Via' }, { key: 'rating', label: 'Rating' },
      { key: 'message', label: 'Message' }, { key: 'assigned_to', label: 'Assigned To' },
      { key: 'outcome', label: 'Outcome' },
      { key: 'received_date', label: 'Received At' }, { key: 'viewed_date', label: 'Viewed At' },
      { key: 'pending_date', label: 'Pending Further Action At' }, { key: 'finalised_date', label: 'Finalised At' },
      { key: 'form_name', label: 'Attached Form' }, { key: 'status_log', label: 'Status History' },
    ], items.map((i) => ({ ...i, form_name: i.form_name || '', rating: i.rating ?? '' })));
    toast({ title: 'Feedback register exported' });
  };

  const List = ({ type }) => {
    const filtered = items.filter((i) => i.type === type);
    if (filtered.length === 0) {
      return <Card><CardContent className="p-10 text-center text-muted-foreground">Nothing recorded yet.</CardContent></Card>;
    }
    return (
      <div className="space-y-3">
        {filtered.map((i) => (
          <Card key={i.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <button className="text-left" onClick={() => view(i)}>
                  <p className="font-medium hover:underline">{i.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {i.submitted_by ? `From ${i.submitted_by}` : 'Anonymous'}
                    {i.received_date ? ` · received ${format(new Date(i.received_date), 'd MMM yyyy')}` : ''}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  {i.rating ? <Badge variant="outline"><Eye className="mr-1 h-3 w-3" />{i.rating}/5</Badge> : null}
                  <Select value={i.status} onValueChange={(v) => setStatus(i, v)}>
                    <SelectTrigger className="h-7 w-[170px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {i.message && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{i.message}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5">Received {i.received_date ? format(new Date(i.received_date), 'd MMM yyyy') : '-'}</span>
                {i.viewed_date && <span className="rounded-full bg-muted px-2 py-0.5">Viewed {format(new Date(i.viewed_date), 'd MMM yyyy')}</span>}
                {i.pending_date && <span className="rounded-full bg-muted px-2 py-0.5">Pending from {format(new Date(i.pending_date), 'd MMM yyyy')}</span>}
                {i.finalised_date && <span className="rounded-full bg-safe/15 px-2 py-0.5 text-safe">Finalised {format(new Date(i.finalised_date), 'd MMM yyyy')}</span>}
                <span className="flex-1" />
                <input type="file" id={`fb-file-${i.id}`} className="hidden" onChange={(e) => uploadForm(i, e.target.files?.[0])} />
                <Button variant="outline" size="sm" disabled={uploading === i.id} onClick={() => document.getElementById(`fb-file-${i.id}`).click()}>
                  {uploading === i.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="mr-1.5 h-3.5 w-3.5" />}Upload form
                </Button>
                {i.form_uri && <Button variant="outline" size="sm" onClick={() => downloadForm(i)}><FileDown className="mr-1.5 h-3.5 w-3.5" />Download form</Button>}
                <Button variant="ghost" size="sm" onClick={() => view(i)}>View all</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { if (confirm('Delete this entry?')) { await base44.entities.Feedback.delete(i.id); await load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback & Surveys"
        subtitle="Feedback, complaints and satisfaction surveys, with lifecycle tracking, stored forms and exportable registers."
        showAlerts={false}
        action={
          <div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader><DialogTitle>Record feedback or complaint</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Type</Label>
                      <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Feedback', 'Complaint'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-1.5"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Submitted by</Label><Input value={form.submitted_by} onChange={(e) => setForm({ ...form, submitted_by: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Contact details</Label><Input value={form.contact_details} onChange={(e) => setForm({ ...form, contact_details: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Received via</Label><Input placeholder="Phone, email, in person, form" value={form.received_via} onChange={(e) => setForm({ ...form, received_via: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Assigned to</Label><Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={save} disabled={saving || !form.subject.trim()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Record entry</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Tabs defaultValue="Feedback">
        <TabsList>
          <TabsTrigger value="Feedback">Feedback & Complaints</TabsTrigger>
          <TabsTrigger value="Surveys">Surveys</TabsTrigger>
        </TabsList>
        <TabsContent value="Feedback" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button variant="outline" onClick={exportRegister}><Download className="mr-2 h-4 w-4" />Export register</Button>
                <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Record entry</Button>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {[['Received', items.filter((i) => i.status === 'Received').length, Megaphone], ['Viewed', items.filter((i) => i.status === 'Viewed').length, Eye], ['Pending further action', items.filter((i) => i.status === 'Pending Further Action').length, Loader2], ['Finalised', items.filter((i) => i.status === 'Finalised').length, Download]].map(([label, value, Icon]) => (
                  <Card key={label}><CardContent className="p-3">
                    <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">{label}</p></div>
                    <p className="mt-1 text-xl font-bold">{value}</p>
                  </CardContent></Card>
                ))}
              </div>
              <div className="space-y-4">
                <List type="Feedback" />
                <List type="Complaint" />
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="Surveys" className="mt-4">
          <SurveyRegister />
        </TabsContent>
      </Tabs>

      <FeedbackDetailDialog item={detail} onClose={() => setDetail(null)} />
    </div>
  );
}