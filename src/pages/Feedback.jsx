import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { CheckCircle2, Download, Eye, FileDown, Loader2, Megaphone, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { format } from 'date-fns';

const STATUSES = ['Received', 'Viewed', 'Pending Further Action', 'Finalised'];
const STATUS_DATE = { Viewed: 'viewed_date', 'Pending Further Action': 'pending_date', Finalised: 'finalised_date' };
const blank = { type: 'Feedback', subject: '', message: '', submitted_by: '', contact_details: '', received_via: '', rating: '', assigned_to: '', assigned_email: '', outcome: '', status: 'Received' };

export default function Feedback({ profile, embedded = false } = {}) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [form, setForm] = useState(blank);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('Feedback');

  useEffect(() => {
    base44.entities.User.list().then((u) => setUsers(u)).catch(() => setUsers([]));
  }, []);

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
        ...(profile ? { submitted_by: profile.full_name } : {}),
        rating: Number(form.rating) || undefined,
        received_date: new Date().toISOString(),
        status_log: `${format(new Date(), 'd MMM yyyy HH:mm')} - Recorded as Received`,
      };
      const saved = await base44.entities.Feedback.create(payload);
      // Copy into the person's communication diary so it shows in their profile.
      await base44.entities.CommunicationEntry.create({
        entry_kind: form.type,
        person_type: 'General',
        subject: `${form.type}: ${form.subject}`,
        body: form.message,
        entry_date: new Date().toISOString().slice(0, 10),
        sender_name: form.submitted_by || 'Anonymous',
        module: 'Feedback & Surveys',
      }).catch(() => {});
      // Alert management so they can review and follow up.
      await base44.entities.Notification.create({
        type: form.type === 'Complaint' ? 'Complaint Received' : 'Feedback Received',
        recipient: 'Management',
        message: `${form.type} from ${form.submitted_by || 'Anonymous'}: ${form.subject}`,
        read: false,
        linked_entity_type: 'Feedback',
        linked_entity_id: saved?.id,
      }).catch(() => {});
      // Follow-up task when someone is allocated, so it lands in the task register.
      if (form.assigned_to) {
        await base44.entities.TodoTask.create({
          title: `Follow up ${form.type.toLowerCase()}: ${form.subject}`,
          task_type: form.type === 'Complaint' ? 'Complaint Follow-up' : 'Feedback Follow-up',
          module: 'Feedback & Surveys',
          assigned_to: form.assigned_to,
          assigned_email: form.assigned_email || '',
          linked_entity_type: 'Feedback',
          linked_entity_id: saved?.id,
          status: 'Open',
          priority: form.type === 'Complaint' ? 'High' : 'Medium',
        }).catch(() => {});
      }
      setForm(blank);
      setOpen(false);
      await load();
      toast({ title: 'Entry recorded', description: 'Copied to the communication diary, management alerted and follow-up task created if allocated.' });
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

  const chartData = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = format(d, 'yyyy-MM');
      out.push({
        m: format(d, 'MMM'),
        Feedback: items.filter((x) => (x.received_date || '').slice(0, 7) === key && x.type === 'Feedback').length,
        Complaint: items.filter((x) => (x.received_date || '').slice(0, 7) === key && x.type === 'Complaint').length,
      });
    }
    return out;
  }, [items]);

  const List = ({ type }) => {
    const filtered = items.filter((i) => i.type === type);
    if (filtered.length === 0) {
      return <Card><CardContent className="p-3 text-center text-xs text-muted-foreground">Nothing recorded yet.</CardContent></Card>;
    }
    return (
      <div className="space-y-2">
        {filtered.map((i) => (
          <Card key={i.id}>
            <CardContent className="p-2.5 [&_button]:h-6 [&_button]:px-2 [&_button]:text-[10px]">
              <div className="flex items-start justify-between gap-2">
                <button className="min-w-0 flex-1 text-left !h-auto !px-0" onClick={() => view(i)}>
                  <p className="text-xs font-medium hover:underline">
                    <span className={`mr-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide ${i.type === 'Complaint' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300'}`}>{i.type}</span>
                    {i.subject}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {i.submitted_by ? `From ${i.submitted_by}` : 'Anonymous'}
                    {i.received_date ? ` · received ${format(new Date(i.received_date), 'd MMM yyyy')}` : ''}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  {i.rating ? <Badge variant="outline"><Eye className="mr-1 h-3 w-3" />{i.rating}/5</Badge> : null}
                  <Select value={i.status} onValueChange={(v) => setStatus(i, v)}>
                    <SelectTrigger className="h-7 w-[170px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {i.message && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.message}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
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
    <Tabs value={tab} onValueChange={setTab} className="space-y-3">
      {!embedded && <PageHeader
        title="Feedback & Surveys"
        subtitle="Feedback, complaints and satisfaction surveys, with lifecycle tracking, stored forms and exportable registers."
        showAlerts={false}
        beforeAudit={<TabsList className="h-7 p-0.5"><TabsTrigger value="Feedback" className="px-2 py-0.5 text-[11px]">Feedback & Complaints</TabsTrigger><TabsTrigger value="Surveys" className="px-2 py-0.5 text-[11px]">Surveys</TabsTrigger></TabsList>}
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
                    <div className="grid gap-1.5"><Label>Assigned to</Label>
                      {users.length ? (
                        <Select value={form.assigned_to || undefined} onValueChange={(v) => setForm({ ...form, assigned_to: v, assigned_email: users.find((u) => u.full_name === v)?.email || '' })}>
                          <SelectTrigger><SelectValue placeholder="Select a person" /></SelectTrigger>
                          <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.full_name}>{u.full_name}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
                      )}
                    </div>
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
      />}

        <div className="flex flex-wrap items-center gap-1.5">
          {tab === 'Feedback' && <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Record entry</Button>}
          {embedded && <TabsList className="h-7 p-0.5"><TabsTrigger value="Feedback" className="px-2 py-0.5 text-[11px]">Feedback & Complaints</TabsTrigger><TabsTrigger value="Surveys" className="px-2 py-0.5 text-[11px]">Surveys</TabsTrigger></TabsList>}
          {tab === 'Feedback' && <Button size="sm" variant="outline" className="ml-auto" onClick={exportRegister}><Download className="h-4 w-4" />Export register</Button>}
        </div>
        <TabsContent value="Feedback" className="mt-2">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : (
            <div className="space-y-4">
              <Card><CardContent className="p-2">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/60">Live view - feedback &amp; complaints received, last 6 months</p>
                <ResponsiveContainer width="100%" height={72}>
                  <BarChart data={chartData} barCategoryGap="20%">
                    <XAxis dataKey="m" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Feedback" stackId="a" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Complaint" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent></Card>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['Received', items.filter((i) => i.status === 'Received').length, Megaphone, 'from-sky-500 to-cyan-400'],
                  ['Viewed', items.filter((i) => i.status === 'Viewed').length, Eye, 'from-amber-500 to-orange-400'],
                  ['Pending further action', items.filter((i) => i.status === 'Pending Further Action').length, Loader2, 'from-fuchsia-500 to-pink-400'],
                  ['Finalised', items.filter((i) => i.status === 'Finalised').length, CheckCircle2, 'from-emerald-500 to-teal-400'],
                ].map(([label, value, Icon, tone]) => (
                  <div key={label} className={`min-w-0 rounded-lg bg-gradient-to-br ${tone} p-2 text-white shadow-sm`}>
                    <div className="flex items-start gap-1"><Icon className="h-3 w-3 shrink-0 opacity-90" /><p className="text-[9px] font-bold uppercase leading-tight tracking-wide opacity-85">{label}</p></div>
                    <p className="mt-1 text-lg font-extrabold leading-none">{value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <List type="Feedback" />
                <List type="Complaint" />
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="Surveys" className="mt-2">
          <SurveyRegister />
        </TabsContent>
      <FeedbackDetailDialog item={detail} onClose={() => setDetail(null)} />
    </Tabs>
  );
}