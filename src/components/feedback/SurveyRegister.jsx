import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { downloadCsv } from '@/lib/csvExport';
import { downloadSurveyDocument } from '@/lib/surveyPdf';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileDown, FileText, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';

const FLOW = ['Draft', 'Open', 'Closed'];

const blank = { title: '', type: 'Satisfaction', description: '', questions: '', open_date: '', close_date: '', status: 'Draft', responses: '', avg_rating: '' };

export default function SurveyRegister() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Survey.filter({}, { sort: '-created_date', limit: 200 });
      setItems(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, responses: Number(form.responses) || undefined, avg_rating: Number(form.avg_rating) || undefined };
      if (editingId) await base44.entities.Survey.update(editingId, payload);
      else await base44.entities.Survey.create(payload);
      setForm(blank); setEditingId(null); setOpen(false);
      await load();
      toast({ title: editingId ? 'Survey updated' : 'Survey created' });
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (survey, status) => {
    await base44.entities.Survey.update(survey.id, { status });
    await load();
  };

  const uploadForm = async (survey, file) => {
    if (!file) return;
    setUploading(survey.id);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Survey.update(survey.id, { survey_file_uri: file_uri, survey_file_name: file.name });
      toast({ title: 'Survey form uploaded' });
      await load();
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

  const downloadForm = async (survey) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: survey.survey_file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  const exportRegister = () => {
    downloadCsv('surveys-register.csv', [
      { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' },
      { key: 'open_date', label: 'Opens' }, { key: 'close_date', label: 'Closes' },
      { key: 'responses', label: 'Responses' }, { key: 'avg_rating', label: 'Avg Rating' },
      { key: 'description', label: 'Description' }, { key: 'questions', label: 'Questions' },
      { key: 'survey_file_name', label: 'Form File' },
    ], items.map((s) => ({ ...s, survey_file_name: s.survey_file_name || '' })));
    toast({ title: 'Surveys register exported' });
  };

  const edit = (s) => {
    setEditingId(s.id);
    setForm({ ...blank, ...s, responses: s.responses ?? '', avg_rating: s.avg_rating ?? '' });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Participant and staff satisfaction surveys, with downloadable survey documents and stored forms.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportRegister}><Download className="mr-2 h-4 w-4" />Export register</Button>
          <Button size="sm" onClick={() => { setEditingId(null); setForm(blank); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />New survey</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No surveys yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.type}</p>
                  </div>
                  <Select value={s.status} onValueChange={(v) => setStatus(s, v)}>
                    <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[s.open_date ? `Opens ${format(new Date(s.open_date), 'd MMM')}` : '', s.close_date ? `Closes ${format(new Date(s.close_date), 'd MMM yyyy')}` : ''].filter(Boolean).join(' · ') || 'No dates set'}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  {s.responses != null && <span><span className="font-semibold">{s.responses}</span> responses</span>}
                  {s.avg_rating != null && <span><span className="font-semibold">{s.avg_rating}</span> / 5 avg</span>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <input type="file" id={`survey-file-${s.id}`} className="hidden" onChange={(e) => uploadForm(s, e.target.files?.[0])} />
                  <Button variant="outline" size="sm" disabled={uploading === s.id} onClick={() => document.getElementById(`survey-file-${s.id}`).click()}>
                    {uploading === s.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="mr-2 h-3.5 w-3.5" />}Upload form
                  </Button>
                  {s.survey_file_uri && (
                    <Button variant="outline" size="sm" onClick={() => downloadForm(s)}><FileDown className="mr-2 h-3.5 w-3.5" />Download form</Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => downloadSurveyDocument(s)}><FileText className="mr-2 h-3.5 w-3.5" />Survey document</Button>
                  <Button variant="ghost" size="sm" onClick={() => edit(s)}>Edit</Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { if (confirm('Delete this survey?')) { await base44.entities.Survey.delete(s.id); await load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                {s.survey_file_name && <Badge variant="secondary" className="mt-2">{s.survey_file_name}</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold">{editingId ? 'Edit survey' : 'New survey'}</h3>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Satisfaction', 'Feedback', 'Census', 'Other'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Questions (one per line)</Label><Textarea rows={5} value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Opens</Label><Input type="date" value={form.open_date} onChange={(e) => setForm({ ...form, open_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Closes</Label><Input type="date" value={form.close_date} onChange={(e) => setForm({ ...form, close_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Responses</Label><Input type="number" value={form.responses} onChange={(e) => setForm({ ...form, responses: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Avg rating</Label><Input type="number" step="0.1" max="5" value={form.avg_rating} onChange={(e) => setForm({ ...form, avg_rating: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} disabled={saving || !form.title.trim()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save survey</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}