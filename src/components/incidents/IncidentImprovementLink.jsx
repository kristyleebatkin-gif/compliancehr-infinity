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
  const [escalating, setEscalating] = useState(false);
  const [linkedRisks, setLinkedRisks] = useState([]);
  const [myName, setMyName] = useState('');

  useEffect(() => {
    base44.auth.me().then((m) => setMyName(m?.full_name || '')).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [page, riskPage] = await Promise.all([
        base44.entities.ImprovementAction.filter({ linked_entity_type: 'Incident', linked_entity_id: incident.id }, { sort: '-created_date', limit: 50 }),
        base44.entities.Risk.filter({ source_entity_type: 'Incident', source_entity_id: incident.id }, { sort: '-created_date', limit: 20 }).catch(() => ({ items: [] })),
      ]);
      setItems(page.items || []);
      setLinkedRisks(riskPage.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleOneClickEscalate = async () => {
    setEscalating(true);
    const targetDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const priority = incident.severity === 'Critical' || incident.severity === 'High' ? 'High' : 'Medium';
    const riskRating = incident.severity === 'Critical' ? 'Critical' : incident.severity === 'High' ? 'High' : 'Medium';
    try {
      await Promise.all([
        base44.entities.ImprovementAction.create({
          title: `CAPA: ${incident.title}`,
          improvement_id: `IMP-${Date.now().toString().slice(-6)}`,
          description: incident.immediate_actions || incident.description || 'Corrective and preventive action escalated from incident.',
          owner: incident.responsible_manager || myName || 'Compliance Manager',
          priority,
          target_date: targetDate,
          source: 'Incident Reviews',
          date_identified: new Date().toISOString().slice(0, 10),
          identified_by: myName || 'System Escalation',
          status: 'Identified',
          linked_entity_type: 'Incident',
          linked_entity_id: incident.id,
        }),
        base44.entities.QualityItem.create({
          title: `CAPA: ${incident.title}`,
          type: 'Corrective Action',
          source_type: 'Incident',
          source_record_id: incident.id,
          description: incident.description || '',
          raised_by: myName || incident.reported_by || 'Compliance Manager',
          raised_date: new Date().toISOString().slice(0, 10),
          owner: incident.responsible_manager || myName || 'Compliance Manager',
          priority,
          status: 'In Progress',
          target_date: targetDate,
        }).catch(() => null),
        base44.entities.Risk.create({
          title: `Incident Risk: ${incident.title}`,
          report_type: 'Risk',
          category: incident.category === 'Medical' || incident.category === 'Medication Error' ? 'Clinical' : 'Operational',
          rating: riskRating,
          status: 'Treating',
          owner: incident.responsible_manager || myName || 'Compliance Manager',
          participant_name: incident.participant_name || '',
          hazards_identified: incident.hazards_identified || incident.description || '',
          control_measures: incident.control_measures || incident.immediate_actions || '',
          source_entity_type: 'Incident',
          source_entity_id: incident.id,
          identified_date: new Date().toISOString().slice(0, 10),
        }),
      ]);
      toast({ title: '1-Click CAPA & Risk Escalation Complete', description: 'Linked Improvement Action, Quality Item, and Risk Register entry created.' });
      load();
    } catch (err) {
      toast({ title: 'Escalation failed', description: err.message, variant: 'destructive' });
    } finally {
      setEscalating(false);
    }
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={escalating}
            className="h-8 text-xs font-extrabold"
            onClick={handleOneClickEscalate}
          >
            <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
            {escalating ? 'Escalating…' : '1-Click CAPA & Risk Escalation'}
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => setForm({ title: '', owner: '', priority: 'Medium', target_date: '', description: '' })}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Raise action
          </Button>
        </div>
      )}
    >
      {loading ? (
        <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /></div>
      ) : items.length === 0 && linkedRisks.length === 0 && !form ? (
        <EmptyState icon={Lightbulb} title="No linked CAPA or risk entries yet" subtitle="Use 1-Click CAPA & Risk Escalation to automatically create linked Quality Improvement and Risk Register records." />
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 p-3">
              <Lightbulb className="h-4 w-4 shrink-0 text-brand" />
              <span className="text-sm font-medium">{it.title}</span>
              <Badge className="border-transparent bg-brand/10 text-brand">CAPA · {it.status}</Badge>
              {it.owner && <span className="text-xs text-foreground/60">Owner: {it.owner}</span>}
              {it.target_date && <span className="text-xs text-foreground/60">Target {it.target_date}</span>}
            </div>
          ))}
          {linkedRisks.map((rk) => (
            <div key={rk.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/40 p-3">
              <Lightbulb className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="text-sm font-semibold text-[#0A2B6D]">{rk.title}</span>
              <Badge variant="destructive">Risk · {rk.rating} ({rk.status})</Badge>
              {rk.owner && <span className="text-xs text-foreground/60">Owner: {rk.owner}</span>}
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