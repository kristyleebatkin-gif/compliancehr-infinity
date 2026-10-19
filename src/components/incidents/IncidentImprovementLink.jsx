import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Plus, X } from 'lucide-react';

// Links an incident to the continuous improvement register: lists and raises ImprovementActions sourced from this incident.
export default function IncidentImprovementLink({ incident, canEdit }) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [myName, setMyName] = useState('');

  useEffect(() => {
    base44.auth.me().then((m) => setMyName(m?.full_name || '')).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.ImprovementAction.filter({ linked_entity_type: 'Incident', linked_entity_id: incident.id }, { sort: '-created_date', limit: 50 });
      setItems(page.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [incident.id]);

  const raise = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.ImprovementAction.create({
        title: form.title,
        improvement_id: `IMP-${Date.now().toString().slice(-6)}`,
        description: form.description || '',
        owner: form.owner || '',
        priority: form.priority || 'Medium',
        target_date: form.target_date || '',
        source: 'Incident Reviews',
        date_identified: new Date().toISOString().slice(0, 10),
        identified_by: myName,
        status: 'Identified',
        linked_entity_type: 'Incident',
        linked_entity_id: incident.id,
      });
      toast({ title: 'Improvement action raised' });
      setForm(null);
      load();
    } catch (err) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <SectionCard
      title="Improvement actions"
      description="Corrective and preventive actions raised from this incident, visible in the quality improvement register"
      action={canEdit && !form && (
        <Button size="sm" className="h-8 text-xs" onClick={() => setForm({ title: '', owner: '', priority: 'Medium', target_date: '', description: '' })}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />Raise action
        </Button>
      )}
    >
      {loading ? (
        <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /></div>
      ) : items.length === 0 && !form ? (
        <EmptyState icon={Lightbulb} title="No improvement actions" subtitle="Raise one to feed lessons from this incident into the improvement register." />
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 p-3">
              <Lightbulb className="h-4 w-4 shrink-0 text-brand" />
              <span className="text-sm font-medium">{it.title}</span>
              <Badge className="border-transparent bg-brand/10 text-brand">{it.status}</Badge>
              {it.owner && <span className="text-xs text-foreground/60">Owner: {it.owner}</span>}
              {it.target_date && <span className="text-xs text-foreground/60">Target {it.target_date}</span>}
            </div>
          ))}
        </div>
      )}
      {form && (
        <form onSubmit={raise} className="mt-3 space-y-3 rounded-lg border border-brand/30 bg-brand/5 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Retrain staff on medication policy" /></div>
            <div className="grid gap-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Person responsible" /></div>
            <div className="grid gap-1.5"><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Low', 'Medium', 'High', 'Urgent'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Target date</Label><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
          </div>
          <div className="grid gap-1.5"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What needs to change" /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setForm(null)}><X className="mr-1.5 h-3.5 w-3.5" />Cancel</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Raise improvement action'}</Button>
          </div>
        </form>
      )}
    </SectionCard>
  );
}