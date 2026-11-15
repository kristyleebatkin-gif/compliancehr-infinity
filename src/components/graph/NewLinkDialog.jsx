import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NODE_TYPES, RELATIONSHIPS } from '@/lib/knowledgeGraph';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus } from 'lucide-react';

const empty = { from_type: 'control', from_id: '', to_type: 'policy', to_id: '', relationship: 'REFERENCES', reason: '' };

export default function NewLinkDialog({ open, onOpenChange, recordsByType, tenantId, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const recordsFor = (typeKey) => (recordsByType[typeKey] || []).slice(0, 200);
  const label = (typeKey, id) => {
    const type = NODE_TYPES.find((entry) => entry.key === typeKey);
    const record = (recordsByType[typeKey] || []).find((row) => row.id === id);
    if (!type || !record) return '';
    return type.title(record).slice(0, 120);
  };

  const save = async () => {
    if (!form.from_id || !form.to_id) {
      setError('Choose both records before saving the link.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await base44.entities.KnowledgeLink.create({
        tenant_id: tenantId,
        ...form,
        from_label: label(form.from_type, form.from_id),
        to_label: label(form.to_type, form.to_id),
        source: 'Recorded by hand',
        confidence: 100,
        status: 'Active',
      });
      setForm(empty);
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err?.message || 'The link could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const recordSelect = (typeKey, value, onChange, placeholder) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {recordsFor(typeKey).map((record) => {
          const type = NODE_TYPES.find((entry) => entry.key === typeKey);
          return <SelectItem key={record.id} value={record.id}>{type ? type.title(record) : record.id}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-extrabold text-[#0A2B6D]">Record a typed link</DialogTitle>
        </DialogHeader>
        <p className="text-[11px] font-semibold text-[#0A2B6D]/75">
          Use this where no reference field connects two records — for example a policy to the standard it implements.
          The link is stored, appears in the graph immediately, and counts towards chain completeness.
        </p>

        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">From type</p>
              <Select value={form.from_type} onValueChange={(value) => set({ from_type: value, from_id: '' })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map((type) => <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {recordSelect(form.from_type, form.from_id, (value) => set({ from_id: value }), 'Choose the record')}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">To type</p>
              <Select value={form.to_type} onValueChange={(value) => set({ to_type: value, to_id: '' })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map((type) => <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {recordSelect(form.to_type, form.to_id, (value) => set({ to_id: value }), 'Choose the record')}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">Relationship</p>
            <Select value={form.relationship} onValueChange={(value) => set({ relationship: value })}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">Why this link exists</p>
            <textarea
              className="min-h-[64px] w-full rounded-md border border-slate-200 p-2 text-xs font-semibold text-[#0A2B6D]"
              value={form.reason}
              onChange={(event) => set({ reason: event.target.value })}
              placeholder="e.g. Policy 4.2 is the procedure this control relies on."
            />
          </div>

          {error && <p className="text-[11px] font-bold text-[#FF2E9A]">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Save link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}