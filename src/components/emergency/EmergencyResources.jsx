import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink, Link2, Loader2, Plus, Trash2 } from 'lucide-react';

const RESOURCE_TYPES = ['Weather & Warnings', 'Local Disaster Management', 'Emergency Contact', 'Other'];

const STATIC_CONTACTS = [
  { name: 'Emergency services (Police, Fire, Ambulance)', detail: '000' },
  { name: 'State Emergency Service (SES) storm & flood', detail: '132 500' },
  { name: 'Poisons Information Centre', detail: '13 11 26' },
  { name: 'Healthdirect (after-hours health advice)', detail: '1800 022 222' },
];

export default function EmergencyResources() {
  const { toast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', resource_type: 'Local Disaster Management', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.EmergencyResource.filter({}, { sort: 'resource_type', limit: 100 });
      setResources(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      await base44.entities.EmergencyResource.create(form);
      setForm({ name: '', url: '', resource_type: 'Local Disaster Management', description: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold"><Link2 className="h-4 w-4 text-brand" />Weather, warnings &amp; disaster links</div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3 w-3" />Add link</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add emergency resource link</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Local council disaster dashboard" /></div>
                <div className="grid gap-1.5"><Label>URL *</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5"><Label>Type</Label>
                    <Select value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{RESOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                </div>
                <Button onClick={save} disabled={saving || !form.name.trim() || !form.url.trim()}>Save link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <div className="py-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : resources.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Add your local disaster management dashboard link and weather warning sources.</p>
        ) : (
          <div className="space-y-2">
            {resources.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2.5">
                <div className="min-w-0">
                  <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 truncate font-medium text-brand hover:underline">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{r.name}</span>
                  </a>
                  {r.description && <p className="truncate text-xs text-muted-foreground">{r.description}</p>}
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40">{r.resource_type}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={async () => { await base44.entities.EmergencyResource.delete(r.id); await load(); }}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ExternalLink className="h-4 w-4 text-brand" />Key emergency contacts</div>
        <div className="space-y-2">
          {STATIC_CONTACTS.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <span>{c.name}</span>
              <span className="font-bold text-brand">{c.detail}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Keep a printed copy of these contacts with every emergency kit.</p>
      </div>
    </div>
  );
}