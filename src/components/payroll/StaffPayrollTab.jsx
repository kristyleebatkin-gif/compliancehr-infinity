import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, Pencil, ShieldCheck } from 'lucide-react';
import { money } from '@/components/payroll/payrollShared';

const EDIT_FIELDS = ['bsb', 'account_number', 'account_name', 'super_fund_name', 'super_member_number', 'tfn_number', 'hourly_rate', 'pay_cycle', 'super_rate', 'salary_sacrifice', 'allowances_per_pay', 'notes'];

export default function StaffPayrollTab() {
  const { toast } = useToast();
  const [details, setDetails] = useState([]);
  const [staff, setStaff] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [d, s, l] = await Promise.all([
      base44.entities.StaffPayrollDetail.filter({}, { sort: 'employee_name', limit: 300 }),
      base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 300, fields: ['full_name', 'email', 'employee_number', 'hourly_rate', 'position'] }),
      base44.entities.PayrollChangeLog.filter({}, { sort: '-changed_at', limit: 30 }),
    ]);
    setDetails(d.items || []);
    setStaff(s.items || []);
    setLogs(l.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const runImport = async () => {
    setImporting(true);
    try {
      const res = await base44.functions.invoke('importPayrollFromIntake', {});
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: 'Payroll details imported', description: `${res.data?.created || 0} created, ${res.data?.updated || 0} updated from employee intake.` });
      await load();
    } catch (error) {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const addManual = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const staffProfile = staff.find((s) => s.id === f.get('staff_profile_id'));
    setSaving(true);
    await base44.entities.StaffPayrollDetail.create({
      staff_profile_id: staffProfile?.id || '',
      employee_name: staffProfile?.full_name || f.get('staff_profile_id'),
      employee_email: staffProfile?.email || '',
      employee_id: staffProfile?.employee_number || '',
      hourly_rate: Number(f.get('hourly_rate') || 0),
      pay_cycle: f.get('pay_cycle') || 'Fortnightly',
      super_rate: 11.5,
      extracted_from_intake: false,
    });
    setSaving(false);
    setShowAdd(false);
    load();
  };

  const openEdit = (d) => {
    const form = {};
    for (const f of EDIT_FIELDS) form[f] = d[f] ?? '';
    setEditForm(form);
    setEditing(d);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const changes = {};
      for (const f of EDIT_FIELDS) {
        if (String(editForm[f] ?? '') !== String(editing[f] ?? '')) changes[f] = editForm[f];
      }
      if (Object.keys(changes).length) {
        const res = await base44.functions.invoke('updatePayrollDetail', { id: editing.id, changes, note: 'Updated from payroll register' });
        if (res.data?.error) throw new Error(res.data.error);
      }
      toast({ title: 'Payroll details saved', description: 'Every change was logged with the date, time and your name.' });
      setEditing(null);
      await load();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const maskTfn = (tfn) => (tfn ? `*** *** ${String(tfn).slice(-3)}` : 'Not recorded');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={runImport} disabled={importing}>
          {importing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Upload className="h-4 w-4" />}Import payroll details from intake
        </Button>
        <Button variant="outline" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" />Add manually</Button>
      </div>
      {showAdd && (
        <Card><CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-3" onSubmit={addManual}>
            <div className="grid gap-1.5"><Label>Employee *</Label>
              <select name="staff_profile_id" required className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="">Select employee...</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5"><Label>Hourly rate ($)</Label><Input name="hourly_rate" type="number" step="0.01" /></div>
            <div className="grid gap-1.5"><Label>Pay cycle</Label>
              <select name="pay_cycle" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                {['Weekly', 'Fortnightly', 'Monthly'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2 md:col-span-3">
              <Button size="sm" type="submit" disabled={saving}>Add payroll record</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading payroll details...</CardContent></Card>
      ) : details.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No payroll details yet. Import from employee intake to pull banking, super and TFN details automatically.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {details.map((d) => (
            <Card key={d.id}><CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{d.employee_name}</p>
                  <p className="text-xs text-muted-foreground">{d.employee_email || 'no email'} · {d.pay_cycle || 'Fortnightly'} pay</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {d.verified && <Badge className="bg-safe/15 text-safe border-transparent"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge>}
                  <span className="text-sm font-bold">{money(d.hourly_rate)}/hr</span>
                </div>
              </div>
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <p>BSB: {d.bsb || 'missing'} · Acc: {d.account_number || 'missing'}</p>
                <p>Super: {d.super_fund_name || 'missing'}{d.super_rate ? ` (${d.super_rate}%)` : ''}</p>
                <p>TFN: {maskTfn(d.tfn_number)}</p>
                <p>{d.extracted_from_intake ? 'From intake' : 'Manually added'}</p>
              </div>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(d)}><Pencil className="mr-1 h-3.5 w-3.5" />Edit details</Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <Card><CardContent className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Recent payroll change log</p>
          <div className="space-y-1.5 text-xs">
            {logs.map((l) => (
              <div key={l.id} className="rounded-md bg-muted/40 px-2.5 py-1.5">
                <span className="font-semibold">{l.employee_name}</span> · <span className="font-mono">{l.field}</span>: {l.old_value || '(empty)'} → {l.new_value} · by {l.changed_by}
                {l.changed_at ? ` · ${String(l.changed_at).replace('T', ' ').slice(0, 16)}` : ''}
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}

      <Dialog open={!!editing} onOpenChange={(next) => { if (!next) setEditing(null); }}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Edit payroll details - {editing?.employee_name}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['bsb', 'BSB'], ['account_number', 'Account number'], ['account_name', 'Account name'],
              ['super_fund_name', 'Super fund name'], ['super_member_number', 'Super member number'],
              ['tfn_number', 'Tax file number'], ['hourly_rate', 'Hourly rate ($)'],
              ['salary_sacrifice', 'Salary sacrifice ($ per pay)'], ['allowances_per_pay', 'Other allowances ($ per pay)'],
              ['notes', 'Notes'],
            ].map(([field, label]) => (
              <div className="grid gap-1.5" key={field}>
                <Label>{label}</Label>
                <Input value={editForm[field] ?? ''} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} />
              </div>
            ))}
            <div className="grid gap-1.5">
              <Label>Pay cycle</Label>
              <Select value={editForm.pay_cycle || 'Fortnightly'} onValueChange={(v) => setEditForm({ ...editForm, pay_cycle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Weekly', 'Fortnightly', 'Monthly'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Super rate (%)</Label>
              <Input type="number" step="0.1" value={editForm.super_rate ?? ''} onChange={(e) => setEditForm({ ...editForm, super_rate: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">All changes are logged with the date, time and your name, and administrators are alerted.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}