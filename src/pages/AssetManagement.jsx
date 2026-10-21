import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Boxes, Wrench, Download } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { format } from 'date-fns';

const CATEGORIES = ['Vehicle', 'Equipment', 'IT', 'Furniture', 'Safety', 'Other'];
const condTone = (c) => (c === 'Excellent' || c === 'Good' ? 'outline' : c === 'Fair' ? 'secondary' : 'destructive');

export default function AssetManagement() {
  const [query, setQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Other', serial_number: '', purchase_date: '', condition: 'Good', next_service_date: '', status: 'In Use', location: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Asset.filter({ status: { $ne: 'Retired' } }, { sort: '-created_date', limit: 50 });
      setAssets(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Asset.create(form);
      setForm({ name: '', category: 'Other', serial_number: '', purchase_date: '', condition: 'Good', next_service_date: '', status: 'In Use', location: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const exportAssets = async () => {
    const rows = await fetchAllRecords(base44.entities.Asset, {}, 'name');
    downloadCsv('Asset-Register.csv', [
      { key: 'name', label: 'Asset Name' }, { key: 'category', label: 'Category' },
      { key: 'serial_number', label: 'Serial Number' }, { key: 'purchase_date', label: 'Purchase Date' },
      { key: 'condition', label: 'Condition' }, { key: 'next_service_date', label: 'Next Service Date' },
      { key: 'status', label: 'Status' }, { key: 'location', label: 'Location' },
    ], rows);
  };

  return (
    <div className="compact-module space-y-3">
      <ModuleShell
        icon={Boxes}
        title="Asset Management"
        subtitle="Vehicles, equipment and their service schedules."
        moduleKey="assets"
        insightModule="assets"
        search={<ModuleSearchBar value={query} onChange={setQuery} placeholder="Search assets…" />}
        actions={<>
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Add asset</Button>
          <Button variant="outline" onClick={exportAssets}><Download className="mr-2 h-4 w-4" />Export register</Button>
        </>}
        small={[['Assets', assets.length], ['In use', assets.filter((a) => a.status === 'In Use').length], ['In maintenance', assets.filter((a) => a.status === 'In Maintenance').length]].map(([label, value]) => (
          <div key={label}><p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{loading ? '…' : value}</p></div>
        ))}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>New asset</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Serial number</Label><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5"><Label>Purchase date</Label><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Condition</Label>
                  <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Excellent', 'Good', 'Fair', 'Poor'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['In Use', 'In Maintenance', 'Retired'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Next service date</Label><Input type="date" value={form.next_service_date} onChange={(e) => setForm({ ...form, next_service_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.name.trim()}>Save asset</Button>
            </div>
          </DialogContent>
        </Dialog>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : assets.length === 0 ? (
        <EmptyState icon={Boxes} modulePath="/assets" title="No assets recorded yet" message="Add your first asset to start the register." />
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {assets.filter((a) => !query.trim() || [a.name, a.category, a.serial_number, a.location, a.status].some((f) => (f || '').toLowerCase().includes(query.trim().toLowerCase()))).map((a) => (
            <Card key={a.id}>
              <CardContent className="p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2"><Wrench className="h-5 w-5 text-muted-foreground" /></div>
                    <div>
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.category}{a.serial_number ? ` · ${a.serial_number}` : ''}</p>
                    </div>
                  </div>
                  <Badge className={statusTone(a.status)}>{a.status}</Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Badge variant={condTone(a.condition)}>{a.condition}</Badge>
                  {a.next_service_date && <span>Service due {format(new Date(a.next_service_date), 'd MMM yyyy')}</span>}
                  {a.location && <span>· {a.location}</span>}
                </div>
                <div className="module-action-bar mt-1 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.Asset.delete(a.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </ModuleShell>
    </div>
  );
}