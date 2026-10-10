import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Umbrella, ArrowRight } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

const TYPES = ['Public Liability', 'Workers Compensation', 'Professional Indemnity', 'Vehicle', 'Property', 'Cyber', 'Other'];
const tone = (s) => (s === 'Active' ? 'default' : s === 'Expired' ? 'destructive' : 'outline');

export default function InsuranceFinance() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ policy_name: '', insurer: '', policy_number: '', type: 'Other', start_date: '', expiry_date: '', premium: '', status: 'Active' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.InsurancePolicy.filter({}, { sort: '-created_date', limit: 50 });
      setPolicies(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.policy_name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.InsurancePolicy.create({ ...form, premium: Number(form.premium) || undefined });
      setForm({ policy_name: '', insurer: '', policy_number: '', type: 'Other', start_date: '', expiry_date: '', premium: '', status: 'Active' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (p) => {
    const next = p.status === 'Active' ? 'Expired' : p.status === 'Expired' ? 'Cancelled' : 'Active';
    await base44.entities.InsurancePolicy.update(p.id, { status: next });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Umbrella className="h-6 w-6" /> Insurance & Finance</h1>
          <p className="text-sm text-muted-foreground">Insurance register with expiry tracking.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New policy</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New insurance policy</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Policy name *</Label><Input value={form.policy_name} onChange={(e) => setForm({ ...form, policy_name: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Insurer</Label><Input value={form.insurer} onChange={(e) => setForm({ ...form, insurer: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Policy number</Label><Input value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Premium ($)</Label><Input type="number" step="0.01" value={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Active', 'Expired', 'Cancelled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={save} disabled={saving || !form.policy_name.trim()}>Save policy</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : policies.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No policies recorded yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {policies.map((p) => {
            const daysLeft = p.expiry_date ? differenceInCalendarDays(new Date(p.expiry_date), new Date()) : null;
            return (
              <Card key={p.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{p.policy_name}{p.policy_number ? ` · ${p.policy_number}` : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {[p.type, p.insurer, p.expiry_date ? `Expires ${format(new Date(p.expiry_date), 'd MMM yyyy')}` : '',
                        daysLeft != null && p.status === 'Active' ? (daysLeft < 0 ? 'EXPIRED' : `${daysLeft} days left`) : ''].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.premium != null && <p className="text-sm font-medium">${p.premium.toLocaleString('en-AU')}</p>}
                    <Badge variant={tone(p.status)}>{p.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => advance(p)} title="Cycle status"><ArrowRight className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.InsurancePolicy.delete(p.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}