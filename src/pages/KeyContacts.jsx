import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Pencil, Contact as ContactIcon, Mail, MessageSquare, Phone, Clock, MapPin, Download } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';

const CATEGORIES = ['Medical', 'Emergency', 'Government', 'Business', 'Supplier', 'Family', 'Other'];

const BLANK = { name: '', organisation: '', role: '', phone: '', mobile: '', after_hours_phone: '', email: '', hours_available: '', address: '', category: 'Other', notes: '' };

export default function KeyContacts({ readOnly = false } = {}) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [query, setQuery] = useState('');
  const shown = contacts.filter((c) => !query.trim() || [c.name, c.organisation, c.role, c.email].some((v) => (v || '').toLowerCase().includes(query.trim().toLowerCase())));

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const rows = await fetchAllRecords(base44.entities.Contact, {}, '-created_date');
      setContacts(rows);
    } catch (error) {
      setContacts([]);
      setLoadError(error?.message || 'Unable to load key contacts. Retry to try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(BLANK); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...BLANK, ...c }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) await base44.entities.Contact.update(editing.id, form);
      else await base44.entities.Contact.create(form);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const exportContacts = async () => {
    const rows = await fetchAllRecords(base44.entities.Contact, {}, 'name');
    downloadCsv('Key-Contacts-Register.csv', [
      { key: 'name', label: 'Name' }, { key: 'organisation', label: 'Organisation' },
      { key: 'role', label: 'Role' }, { key: 'phone', label: 'Phone' },
      { key: 'mobile', label: 'Mobile' }, { key: 'after_hours_phone', label: 'After Hours Phone' },
      { key: 'email', label: 'Email' }, { key: 'hours_available', label: 'Hours Available' },
      { key: 'address', label: 'Address' }, { key: 'category', label: 'Category' },
      { key: 'notes', label: 'Notes' },
    ], rows);
  };

  const ContactButtons = ({ c }) => (
    <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
      {c.email && <Button size="sm" className="h-7 text-xs" onClick={() => { window.location.href = `mailto:${c.email}`; }}><Mail className="h-3 w-3" />Email</Button>}
      {c.mobile && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { window.location.href = `sms:${c.mobile}`; }}><MessageSquare className="h-3 w-3" />Text</Button>}
      {c.phone && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { window.location.href = `tel:${c.phone}`; }}><Phone className="h-3 w-3" />Call</Button>}
      {c.after_hours_phone && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { window.location.href = `tel:${c.after_hours_phone}`; }}><Phone className="h-3 w-3" />After hours</Button>}
      {!readOnly && <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" />Edit</Button>}
      {!readOnly && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.Contact.delete(c.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
    </div>
  );

  return (
    <div className="space-y-4">
      <ModuleShell
        icon={ContactIcon}
        title="Key Personnel Contacts"
        subtitle="Key people, their roles, hours and contact details, with direct email, text and phone access."
        moduleKey="key-contacts"
        insightModule="contacts"
        search={<ModuleSearchBar value={query} onChange={setQuery} placeholder="Search contacts…" />}
        actions={<>
          {!readOnly && <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Add key personnel contact</Button>}
          <Button variant="outline" onClick={exportContacts} disabled={loading || Boolean(loadError) || contacts.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
          {readOnly && <p className="text-xs text-muted-foreground">View only — key personnel contacts are managed in Staff and Participant profiles.</p>}
        </>}
        small={[
          ['Contacts', contacts.length],
          ['Emergency', contacts.filter((c) => c.category === 'Emergency').length],
          ['Medical', contacts.filter((c) => c.category === 'Medical').length],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{loading ? '…' : loadError ? '—' : value}</p>
          </div>
        ))}
      >
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : loadError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{loadError} <button type="button" className="ml-2 underline" onClick={load}>Retry</button></div>
      ) : contacts.length === 0 ? (
        <EmptyState icon={ContactIcon} modulePath="/key-contacts" title="No key personnel contacts yet" message="Add your first contact to build the register." />
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{[c.role, c.organisation].filter(Boolean).join(' · ') || 'No role recorded'}</p>
                  </div>
                  <Badge className={statusTone(c.category)}>{c.category}</Badge>
                </div>
                <div className="mt-1.5 space-y-0.5 text-xs leading-4 text-muted-foreground">
                  {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{c.phone}</p>}
                  {c.mobile && <p className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 shrink-0" />Mobile: {c.mobile}</p>}
                  {c.email && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0" />{c.email}</p>}
                  {c.hours_available && <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />Hours: {c.hours_available}</p>}
                  {c.after_hours_phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />After hours: {c.after_hours_phone}</p>}
                  {c.address && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" />{c.address}</p>}
                  {c.notes && <p className="pt-1 text-xs italic">{c.notes}</p>}
                </div>
                <div className="module-action-bar mt-1.5"><ContactButtons c={c} /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </ModuleShell>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit contact' : 'New key personnel contact'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((ct) => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Organisation</Label><Input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Role / Position</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Mobile</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>After hours phone</Label><Input value={form.after_hours_phone} onChange={(e) => setForm({ ...form, after_hours_phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Hours available</Label><Input placeholder="Mon-Fri 9am-5pm" value={form.hours_available} onChange={(e) => setForm({ ...form, hours_available: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.name.trim()}>{editing ? 'Save changes' : 'Save contact'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}