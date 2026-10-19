import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FileSignature, Download, Pencil, Undo2 } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';

const STATUSES = ['Active', 'Withdrawn', 'Expired'];

const blank = {
  participant_id: '', participant_name: '', recipient_name: '', organisation: '', relationship: '',
  phone: '', email: '', information_authorised: '', information_excluded: '', sharing_purpose: '',
  sharing_method: '', consent_start_date: '', consent_end_date: '', status: 'Active',
  participant_signatory_name: '', participant_signed_date: '', participant_signature: '', notes: '',
};

const CSV_COLUMNS = [
  { key: 'participant_name', label: 'Participant' }, { key: 'recipient_name', label: 'Authorised Person' },
  { key: 'organisation', label: 'Organisation' }, { key: 'relationship', label: 'Relationship' },
  { key: 'information_authorised', label: 'Information Authorised' }, { key: 'information_excluded', label: 'Information Excluded' },
  { key: 'sharing_purpose', label: 'Purpose' }, { key: 'consent_start_date', label: 'Start' },
  { key: 'consent_end_date', label: 'End' }, { key: 'status', label: 'Status' },
  { key: 'participant_signatory_name', label: 'Signed By' }, { key: 'participant_signed_date', label: 'Signed On' },
  { key: 'withdrawal_date', label: 'Withdrawn On' },
];

export default function ConsentRegister() {
  const [consents, setConsents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rc, rp] = await Promise.all([
        base44.entities.InformationSharingConsent.filter({}, { sort: '-created_date', limit: 200 }),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name'] }),
      ]);
      setConsents(rc.items || []);
      setParticipants(rp.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickParticipant = (id) => {
    const p = participants.find((x) => x.id === id);
    setForm((f) => ({ ...f, participant_id: id, participant_name: p?.full_name || f.participant_name }));
  };

  const openNew = () => { setEditingId(null); setForm(blank); setOpen(true); };
  const openEdit = (c) => { setEditingId(c.id); setForm({ ...blank, ...c }); setOpen(true); };

  const save = async () => {
    if (!form.participant_id || !form.recipient_name.trim()) return;
    setSaving(true);
    try {
      if (editingId) await base44.entities.InformationSharingConsent.update(editingId, form);
      else await base44.entities.InformationSharingConsent.create(form);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async (c) => {
    if (!window.confirm(`Withdraw consent for ${c.participant_name} → ${c.recipient_name}?`)) return;
    await base44.entities.InformationSharingConsent.update(c.id, { status: 'Withdrawn', withdrawal_date: new Date().toISOString().slice(0, 10) });
    await load();
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete consent record for ${c.participant_name}?`)) return;
    await base44.entities.InformationSharingConsent.delete(c.id);
    await load();
  };

  const exportCsv = async () => {
    const rows = await fetchAllRecords(base44.entities.InformationSharingConsent, {}, '-created_date');
    downloadCsv('information-sharing-consent-register.csv', CSV_COLUMNS, rows);
  };

  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const displayStatus = (c) => {
    if (c.status === 'Withdrawn') return 'Withdrawn';
    if (c.consent_end_date && c.consent_end_date < today) return 'Expired';
    return c.status;
  };
  const expiringSoon = (c) => displayStatus(c) === 'Active' && c.consent_end_date && c.consent_end_date <= in30;
  const activeCount = consents.filter((c) => displayStatus(c) === 'Active').length;
  const expiringCount = consents.filter(expiringSoon).length;
  const withdrawnCount = consents.filter((c) => displayStatus(c) === 'Withdrawn').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums">{consents.length}</div><div className="text-xs text-muted-foreground">Consent records</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-safe">{activeCount}</div><div className="text-xs text-muted-foreground">Active</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-warning">{expiringCount}</div><div className="text-xs text-muted-foreground">Expiring in 30 days</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular-nums text-danger">{withdrawnCount}</div><div className="text-xs text-muted-foreground">Withdrawn</div></CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add consent</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>{editingId ? 'Edit consent record' : 'New information sharing consent'}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Participant *</Label>
                  <Select value={form.participant_id} onValueChange={pickParticipant}>
                    <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                    <SelectContent>{participants.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Authorised person *</Label><Input value={form.recipient_name} onChange={(e) => set('recipient_name', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Organisation</Label><Input value={form.organisation} onChange={(e) => set('organisation', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Relationship</Label><Input value={form.relationship} onChange={(e) => set('relationship', e.target.value)} placeholder="Support coordinator, family..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Information authorised to share</Label><Textarea rows={2} value={form.information_authorised} onChange={(e) => set('information_authorised', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Information excluded</Label><Textarea rows={2} value={form.information_excluded} onChange={(e) => set('information_excluded', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Purpose of sharing</Label><Input value={form.sharing_purpose} onChange={(e) => set('sharing_purpose', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Approved sharing method</Label><Input value={form.sharing_method} onChange={(e) => set('sharing_method', e.target.value)} placeholder="Email, phone, in person..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Consent start date</Label><Input type="date" value={form.consent_start_date} onChange={(e) => set('consent_start_date', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Consent end date</Label><Input type="date" value={form.consent_end_date} onChange={(e) => set('consent_end_date', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Signed by</Label><Input value={form.participant_signatory_name} onChange={(e) => set('participant_signatory_name', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Date signed</Label><Input type="date" value={form.participant_signed_date} onChange={(e) => set('participant_signed_date', e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Signature</Label><Input value={form.participant_signature} onChange={(e) => set('participant_signature', e.target.value)} placeholder="Typed signature" /></div>
              </div>
              <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
              <Button onClick={save} disabled={saving || !form.participant_id || !form.recipient_name.trim()}>{editingId ? 'Save changes' : 'Save consent'}</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export (CSV)</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : consents.length === 0 ? (
        <EmptyState icon={FileSignature} modulePath="/compliance" title="No consent records yet" message="Record participant consent for sharing information — a mandatory NDIS Practice Standard." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Participant</th>
                    <th className="px-3 py-2 font-medium">Authorised Person</th>
                    <th className="px-3 py-2 font-medium">Purpose</th>
                    <th className="px-3 py-2 font-medium">Start</th>
                    <th className="px-3 py-2 font-medium">End</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map((c) => (
                    <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">{c.participant_name || '—'}</td>
                      <td className="px-3 py-2.5"><div>{c.recipient_name}</div>{c.organisation && <div className="text-xs text-muted-foreground">{c.organisation}</div>}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs max-w-xs"><div className="line-clamp-2">{c.sharing_purpose || c.information_authorised || '—'}</div></td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs tabular-nums">{c.consent_start_date || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs tabular-nums">{c.consent_end_date || '—'}</td>
                      <td className="px-3 py-2.5">
                        <Badge className={statusTone(displayStatus(c))}>{displayStatus(c)}</Badge>
                        {expiringSoon(c) && <Badge className="ml-1 bg-warning/15 text-warning">Expiring</Badge>}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          {displayStatus(c) === 'Active' && (
                            <Button variant="ghost" size="icon" title="Withdraw consent" onClick={() => withdraw(c)}><Undo2 className="h-4 w-4 text-warning" /></Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}