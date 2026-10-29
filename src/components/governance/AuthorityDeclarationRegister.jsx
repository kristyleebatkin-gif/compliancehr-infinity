import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DECLARATION_TYPES } from '@/lib/governanceFramework';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

const EMPTY = {
  declaration_type: 'Delegation of Authority', person_name: '', role_title: '', person_type: 'Key Personnel',
  authority: '', financial_limit: '', governance_limit: '', effective_date: '', review_date: '',
  conflict_details: '', management_plan: '', related_register: '', status: 'Declared', notes: '',
};

const PERSON_TYPES = ['Director', 'Key Personnel', 'Employee', 'Contractor'];
const STATUSES = ['Declared', 'Under Review', 'Managed', 'Closed', 'Expired'];

function DeclarationDialog({ open, onOpenChange, record, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({ ...EMPTY, ...(record || {}) });
  }, [open, record]);

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.person_name.trim()) { setError('A person name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        financial_limit: form.financial_limit === '' ? undefined : Number(form.financial_limit),
        effective_date: form.effective_date || undefined,
        review_date: form.review_date || undefined,
      };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;
      if (record?.id) await base44.entities.AuthorityDeclaration.update(record.id, payload);
      else await base44.entities.AuthorityDeclaration.create(payload);
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'The declaration could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!record?.id) return;
    setSaving(true);
    try {
      await base44.entities.AuthorityDeclaration.delete(record.id);
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'The declaration could not be deleted.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text') => (
    <div className="space-y-1">
      <Label className="text-xs font-bold">{label}</Label>
      <Input type={type} value={form[key] || ''} onChange={(event) => set(key)(event.target.value)} />
    </div>
  );

  const choice = (label, key, options) => (
    <div className="space-y-1">
      <Label className="text-xs font-bold">{label}</Label>
      <Select value={form[key]} onValueChange={set(key)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{record?.id ? 'Edit declaration' : 'New declaration'}</DialogTitle></DialogHeader>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {choice('Register Type', 'declaration_type', DECLARATION_TYPES)}
          {field('Person Name', 'person_name')}
          {field('Role', 'role_title')}
          {choice('Person Type', 'person_type', PERSON_TYPES)}
          {field('Authority Delegated', 'authority')}
          {field('Financial Limit ($)', 'financial_limit', 'number')}
          {field('Governance Limit', 'governance_limit')}
          {field('Effective Date', 'effective_date', 'date')}
          {field('Review Date', 'review_date', 'date')}
          {field('Related Register', 'related_register')}
          {choice('Status', 'status', STATUSES)}
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-bold">Declaration / Conflict Details</Label>
            <Textarea rows={2} value={form.conflict_details} onChange={(event) => set('conflict_details')(event.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-bold">Management Plan</Label>
            <Textarea rows={2} value={form.management_plan} onChange={(event) => set('management_plan')(event.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-bold">Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(event) => set('notes')(event.target.value)} />
          </div>
        </div>
        {error && <p className="mt-2 text-sm font-semibold text-[#FF2E9A]">{error}</p>}
        <DialogFooter className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {record?.id
            ? <Button variant="outline" onClick={remove} disabled={saving}><Trash2 className="h-4 w-4" />Delete</Button>
            : <span />}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {record?.id ? 'Save declaration' : 'Record declaration'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AuthorityDeclarationRegister() {
  const [items, setItems] = useState(null);
  const [type, setType] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const query = type === 'all' ? {} : { declaration_type: type };
    const page = await base44.entities.AuthorityDeclaration.filter(query, { sort: '-updated_date', limit: 100 });
    setItems(page.items || []);
  };

  useEffect(() => {
    setItems(null);
    load().catch(() => setItems([]));
  }, [type]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Delegations &amp; Declarations Register</p>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-[220px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All register types</SelectItem>
              {DECLARATION_TYPES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />New declaration</Button>
      </div>

      {items === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#C084FC] bg-[#F5F0FF] p-8 text-center">
          <p className="text-sm font-bold text-[#0A2B6D]">No delegations or declarations recorded yet</p>
          <p className="mx-auto mt-1 max-w-xl text-xs font-medium text-[#0A2B6D]">
            Record who may approve policies, incidents, complaints and contracts, sign participant plans, close audits
            and accept risks — with financial and governance limits — plus every conflict of interest declaration.
          </p>
          <Button size="sm" className="mt-3" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Record the first one</Button>
        </div>
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">{item.declaration_type}</p>
                  <p className="text-sm font-extrabold text-[#0A2B6D]">{item.person_name}</p>
                  <p className="text-[11px] font-semibold text-[#0A2B6D]">
                    {[item.role_title, item.person_type, item.status].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setEditing(item); setOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5" />Edit
                </Button>
              </div>
              <div className="mt-1.5 space-y-0.5 text-[11px] font-medium text-[#0A2B6D]">
                {item.authority && <p>Authority: {item.authority}</p>}
                <p>
                  Limits: {item.financial_limit ? `$${Number(item.financial_limit).toLocaleString()}` : 'no financial limit set'}
                  {item.governance_limit ? ` · ${item.governance_limit}` : ''}
                </p>
                <p>Effective: {item.effective_date || 'not set'} · Review: {item.review_date || 'not scheduled'}</p>
                {item.conflict_details && <p>Declaration: {item.conflict_details}</p>}
                {item.management_plan && <p>Management plan: {item.management_plan}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeclarationDialog open={open} onOpenChange={setOpen} record={editing} onSaved={() => load().catch(() => setItems([]))} />
    </div>
  );
}