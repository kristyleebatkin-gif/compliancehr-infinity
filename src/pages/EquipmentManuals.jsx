import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Download, History, Loader2, Plus, Search, Trash2, UploadCloud, FileText, Pencil, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { exportModuleAccessLog } from '@/lib/accessLogExport';
import { downloadManualRecordPdf, manualCsvColumns } from '@/lib/equipmentManualPdf';

const CATEGORIES = ['Office Equipment', 'Electrical Equipment', 'Garden Equipment', 'Kitchen & Appliances', 'Safety Equipment', 'Vehicle', 'Other'];
const EMPTY_FORM = {
  title: '', equipment_name: '', category: 'Office Equipment', manufacturer: '', model: '', version: '',
  manual_url: '', operating_instructions: '', maintenance_schedule: '', safety_notes: '', review_date: '', notes: '',
};

export default function EquipmentManuals() {
  const { toast } = useToast();
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      if (category !== 'All') query.category = category;
      const term = search.trim();
      if (term) {
        query.$or = ['title', 'equipment_name', 'manufacturer', 'model'].map((f) => ({ [f]: { $regex: term, $options: 'i' } }));
      }
      const page = await base44.entities.EquipmentManual.filter(query, { sort: 'title', limit: 300 });
      setManuals(page.items);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({
      title: m.title || '', equipment_name: m.equipment_name || '', category: m.category || 'Office Equipment',
      manufacturer: m.manufacturer || '', model: m.model || '', version: m.version || '', manual_url: m.manual_url || '',
      operating_instructions: m.operating_instructions || '', maintenance_schedule: m.maintenance_schedule || '',
      safety_notes: m.safety_notes || '', review_date: m.review_date || '', notes: m.notes || '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) await base44.entities.EquipmentManual.update(editingId, form);
      else await base44.entities.EquipmentManual.create(form);
      setOpen(false);
      await load();
      toast({ title: editingId ? 'Manual updated' : 'Manual added' });
    } finally {
      setSaving(false);
    }
  };

  const uploadManualFile = async (manual, file) => {
    if (!file) return;
    setUploadingId(manual.id);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.EquipmentManual.update(manual.id, { manual_file_uri: file_uri, manual_file_name: file.name });
      await load();
      toast({ title: 'Manual file stored' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingId(null);
    }
  };

  const openManualFile = async (m) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: m.manual_file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Unable to open manual', description: error.message, variant: 'destructive' });
    }
  };

  const exportRegister = () => {
    downloadCsv('Equipment-Manual-Register.csv', manualCsvColumns(), manuals);
    toast({ title: 'Manual register exported' });
  };

  const exportAccess = async () => {
    try {
      const count = await exportModuleAccessLog('/equipment-manuals', 'Equipment-Manuals-Access-Log.csv');
      toast({ title: 'Access log exported', description: `${count} access records for Equipment Manuals.` });
    } catch (error) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    }
  };

  const visible = manuals.filter((m) =>
    (category === 'All' || m.category === category) &&
    (!search.trim() || [m.title, m.equipment_name, m.manufacturer, m.model].some((v) => (v || '').toLowerCase().includes(search.trim().toLowerCase()))),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Add manual</Button>
        <Button variant="outline" onClick={exportRegister} disabled={loading || manuals.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
        <Button variant="outline" onClick={exportAccess}><History className="mr-2 h-4 w-4" />Access log</Button>
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search equipment, manufacturer or model..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : visible.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No manuals found for this filter.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2"><BookOpen className="h-5 w-5 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {[m.equipment_name, m.manufacturer, m.model, m.version ? `v${m.version}` : ''].filter(Boolean).join(' · ')}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {m.category && <Badge variant="secondary">{m.category}</Badge>}
                      {m.review_date && <span className="text-xs text-muted-foreground">Review {format(new Date(m.review_date), 'd MMM yyyy')}</span>}
                    </div>
                  </div>
                </div>
                {m.operating_instructions && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{m.operating_instructions}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setViewing(m)}><Eye className="h-3 w-3" />View manual</Button>
                  {m.manual_file_uri && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openManualFile(m)}>
                      <FileText className="h-3 w-3" />Download manual
                    </Button>
                  )}
                  <label className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-input bg-transparent px-2.5 text-xs font-semibold shadow-sm hover:bg-accent ${uploadingId === m.id ? 'pointer-events-none opacity-50' : ''}`}>
                    {uploadingId === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}{m.manual_file_uri ? 'Replace file' : 'Upload file'}
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => uploadManualFile(m, e.target.files?.[0])} />
                  </label>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadManualRecordPdf(m)}>
                    <Download className="h-3 w-3" />Record PDF
                  </Button>
                  {m.manual_url && <a href={m.manual_url} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold text-primary underline">Online manual</a>}
                  <div className="ml-auto flex">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.EquipmentManual.delete(m.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(viewing)} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{viewing?.title}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {viewing.category && <Badge variant="secondary">{viewing.category}</Badge>}
                {viewing.manufacturer && <Badge variant="outline">{viewing.manufacturer}</Badge>}
                {viewing.model && <Badge variant="outline">{viewing.model}</Badge>}
                {viewing.version && <Badge variant="outline">v{viewing.version}</Badge>}
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Operating instructions</p>
                <p className="mt-2 whitespace-pre-line">{viewing.operating_instructions || 'No operating instructions recorded yet. Add them via Edit.'}</p>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-warning">Safety notes</p>
                <p className="mt-2 whitespace-pre-line">{viewing.safety_notes || 'No safety notes recorded yet.'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Maintenance schedule</p>
                  <p className="mt-1.5">{viewing.maintenance_schedule || 'Not set'}</p>
                </div>
                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Next review</p>
                  <p className="mt-1.5">{viewing.review_date ? format(new Date(viewing.review_date), 'd MMM yyyy') : 'Not set'}</p>
                </div>
              </div>
              {viewing.notes && <p className="text-xs text-muted-foreground">{viewing.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit equipment manual' : 'Add equipment manual'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Manual title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Equipment</Label><Input value={form.equipment_name} onChange={(e) => setForm({ ...form, equipment_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Model</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Next review</Label><Input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Manual link (online)</Label><Input value={form.manual_url} onChange={(e) => setForm({ ...form, manual_url: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Operating instructions</Label><Textarea rows={3} value={form.operating_instructions} onChange={(e) => setForm({ ...form, operating_instructions: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Maintenance schedule</Label><Input value={form.maintenance_schedule} onChange={(e) => setForm({ ...form, maintenance_schedule: e.target.value })} placeholder="e.g. Service every 6 months" /></div>
            <div className="grid gap-1.5"><Label>Safety notes</Label><Textarea rows={2} value={form.safety_notes} onChange={(e) => setForm({ ...form, safety_notes: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.title.trim()}>Save manual</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}