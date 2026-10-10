import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { FlaskConical, Search, Download, ExternalLink, Phone, Siren, Plus, Loader2 } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

const CATEGORIES = ['Cleaning & Disinfectants', 'Solvents & Fuels', 'Garden & Pest Control', 'Industrial & Construction', 'Laboratory & Salts', 'Medical & First Aid', 'Gases'];

const BLANK = { name: '', cas_number: '', category: 'Cleaning & Disinfectants', hazard_class: '', first_aid: '', storage_notes: '', sds_url: '' };

const hazardTone = (h = '') => {
  const s = h.toLowerCase();
  if (s.includes('toxic')) return 'bg-danger/10 text-danger';
  if (s.includes('corrosive') || s.includes('caustic')) return 'bg-warning/10 text-warning';
  if (s.includes('flammable')) return 'bg-amber-100 text-amber-700';
  if (s.includes('sensitis')) return 'bg-orange-100 text-orange-700';
  if (s.includes('oxidis')) return 'bg-purple-100 text-purple-700';
  if (s.includes('asphyxiant')) return 'bg-slate-200 text-slate-700';
  if (!s) return 'bg-muted text-muted-foreground';
  return 'bg-success/10 text-success';
};

export const sdsLink = (c) => {
  if (c.sds_url) return c.sds_url;
  if (c.cas_number && c.cas_number !== 'Mixture') {
    return `https://www.sigmaaldrich.com/au/en/search?term=${encodeURIComponent(c.cas_number)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${c.name} safety data sheet SDS pdf`)}`;
};

const CHEMICAL_CSV_COLUMNS = [
  { key: 'name', label: 'Chemical / Product' }, { key: 'cas_number', label: 'CAS Number' },
  { key: 'category', label: 'Category' }, { key: 'hazard_class', label: 'Hazard Class' },
  { key: 'first_aid', label: 'First Aid' }, { key: 'storage_notes', label: 'Storage' },
  { key: 'sds_url', label: 'SDS Link' },
];

export default function MsdsLibrary() {
  const { toast } = useToast();
  const [chemicals, setChemicals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(BLANK);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      if (category !== 'All') query.category = category;
      const term = search.trim();
      if (term) query.$or = [{ name: { $regex: term, $options: 'i' } }, { cas_number: { $regex: term, $options: 'i' } }];
      const page = await base44.entities.Chemical.filter(query, { sort: 'name', limit: 200 });
      setChemicals(page.items);
      const count = await base44.entities.Chemical.count({});
      setTotal(count);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Chemical.create(form);
      setOpen(false);
      setForm(BLANK);
      await load();
      toast({ title: 'Chemical added to register' });
    } finally {
      setSaving(false);
    }
  };

  const exportRegister = () => {
    if (!chemicals.length) { toast({ title: 'No chemicals to export' }); return; }
    downloadCsv('Chemical-MSDS-Register.csv', CHEMICAL_CSV_COLUMNS, chemicals);
    toast({ title: 'Chemical register exported' });
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-3"><FlaskConical className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MSDS Chemical Library</h1>
              <p className="text-sm text-slate-300">Safety Data Sheets (MSDS) for the 100 most common workplace chemicals, plus your own products.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[['Chemicals', String(total)], ['Categories', String(CATEGORIES.length)]].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">{label}</p>
                <p className="text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="bg-white text-slate-900 hover:bg-slate-200" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Add chemical</Button>
          <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={exportRegister} disabled={loading || chemicals.length === 0}><Download className="mr-2 h-4 w-4" />Export chemical list</Button>
        </div>
      </div>

      {/* Emergency call prompts */}
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-danger p-2.5"><Siren className="h-6 w-6 text-white" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-danger">Chemical emergency or urgent exposure?</p>
            <p className="text-xs text-foreground/70">Call <strong>000</strong> immediately for fires, spills with injury or unconsciousness. For urgent poison or exposure advice call the <strong>Poisons Information Line 13 11 26</strong> (24/7) or <strong>13HEALTH 13 43 25 84</strong>.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:000" className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-sm font-bold text-white hover:bg-danger/90"><Phone className="h-4 w-4" />Call 000</a>
            <a href="tel:131126" className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 bg-white px-4 py-2 text-sm font-bold text-danger hover:bg-danger/10"><Phone className="h-4 w-4" />Poisons 13 11 26</a>
            <a href="tel:13432584" className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 bg-white px-4 py-2 text-sm font-bold text-danger hover:bg-danger/10"><Phone className="h-4 w-4" />13HEALTH</a>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search by chemical name or CAS number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : chemicals.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No chemicals found for this filter.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chemicals.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{c.name}</p>
                    <p className="text-xs text-muted-foreground">CAS: {c.cas_number || '—'}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{c.category}</Badge>
                </div>
                {c.hazard_class && <Badge className={`mt-2 w-fit text-[10px] ${hazardTone(c.hazard_class)}`}>{c.hazard_class}</Badge>}
                {c.first_aid && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground/70">First aid: </span>{c.first_aid}</p>}
                {c.storage_notes && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground/70">Storage: </span>{c.storage_notes}</p>}
                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                  <a href={sdsLink(c)} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1.5 rounded-md bg-teal px-3 text-xs font-semibold text-white hover:bg-teal/90">
                    <ExternalLink className="h-3 w-3" />Download SDS / MSDS
                  </a>
                  {c.cas_number && c.cas_number !== 'Mixture' && (
                    <a href={`tel:131126`} className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-semibold text-danger hover:bg-danger/5"><Phone className="h-3 w-3" />Poisons</a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Add chemical to register</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Chemical / product name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>CAS number</Label><Input value={form.cas_number} onChange={(e) => setForm({ ...form, cas_number: e.target.value })} placeholder="e.g. 67-64-1 or Mixture" /></div>
              <div className="grid gap-1.5"><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Hazard class / GHS</Label><Input value={form.hazard_class} onChange={(e) => setForm({ ...form, hazard_class: e.target.value })} placeholder="e.g. Corrosive, oxidiser" /></div>
            <div className="grid gap-1.5"><Label>First aid measures</Label><Textarea rows={3} value={form.first_aid} onChange={(e) => setForm({ ...form, first_aid: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Storage notes</Label><Input value={form.storage_notes} onChange={(e) => setForm({ ...form, storage_notes: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>SDS link (optional)</Label><Input value={form.sds_url} onChange={(e) => setForm({ ...form, sds_url: e.target.value })} placeholder="Direct link to the SDS document" /></div>
            <Button onClick={save} disabled={saving || !form.name.trim()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save chemical'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}