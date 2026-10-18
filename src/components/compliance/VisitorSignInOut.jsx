import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';
import { downloadBlankFormPdf } from '@/lib/formsLibraryPdf';
import { format } from 'date-fns';
import { Plus, LogOut, Download, Pencil, Trash2, Loader2, UserCheck } from 'lucide-react';
import { useRole } from '@/lib/useRole';
import { ROLES } from '@/lib/roles';

const BLANK = { visitor_name: '', organisation: '', host: '', purpose: '', date: '', time_in: '', time_out: '' };

const nowTime = () => format(new Date(), 'HH:mm');

export default function VisitorSignInOut() {
  const { toast } = useToast();
  const { role } = useRole();
  const canEdit = [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER, ROLES.SUPPORT, ROLES.VOLUNTEER].includes(role);
  const canDelete = [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER].includes(role);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.VisitorLog.filter({}, { sort: '-created_date', limit: 200 });
      setVisitors(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsubscribe = base44.entities.VisitorLog.subscribe(() => { load(); });
    return unsubscribe;
  }, [load]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const onSite = visitors.filter((v) => v.date === today && !v.time_out);

  const openNew = () => {
    setEditing(null);
    setForm({ ...BLANK, date: today, time_in: nowTime() });
    setOpen(true);
  };

  const openEdit = (visitor) => {
    setEditing(visitor);
    setForm({
      visitor_name: visitor.visitor_name || '',
      organisation: visitor.organisation || '',
      host: visitor.host || '',
      purpose: visitor.purpose || '',
      date: visitor.date || today,
      time_in: visitor.time_in || '',
      time_out: visitor.time_out || '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.visitor_name.trim() || !form.date) {
      toast({ title: 'Visitor name and date are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editing) await base44.entities.VisitorLog.update(editing.id, form);
      else await base44.entities.VisitorLog.create(form);
      setOpen(false);
      await load();
      toast({ title: editing ? 'Visitor updated' : 'Visitor signed in' });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async (visitor) => {
    await base44.entities.VisitorLog.update(visitor.id, { time_out: nowTime() });
    await load();
    toast({ title: `${visitor.visitor_name} signed out` });
  };

  const remove = async (visitor) => {
    if (!confirm('Remove this visitor record?')) return;
    await base44.entities.VisitorLog.delete(visitor.id);
    await load();
  };

  const exportCsv = () => {
    downloadCsv('visitor-sign-in-out.csv', [
      { key: 'visitor_name', label: 'Visitor Name' }, { key: 'organisation', label: 'Organisation' },
      { key: 'host', label: 'Host' }, { key: 'purpose', label: 'Purpose' }, { key: 'date', label: 'Date' },
      { key: 'time_in', label: 'Time In' }, { key: 'time_out', label: 'Time Out' }, { key: 'notes', label: 'Notes' },
    ], visitors);
    toast({ title: 'Visitor sheet exported' });
  };

  const downloadSheet = () => {
    downloadBlankFormPdf({
      title: 'Visitor Sign In and Out Sheet',
      code: 'CM-VIS-001',
      subtitle: 'Live visitor tracker | all visitors must sign in and out',
      fields: [{ label: 'Site / location' }, { label: 'Date' }, { label: 'Supervisor on duty' }],
      columns: ['Date', 'Name', 'Organisation', 'Host', 'Purpose', 'Time In', 'Time Out', 'Signature'],
      rows: 20,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-safe/10 text-safe">{onSite.length} on site now</Badge>
          <span className="text-sm text-muted-foreground">Live tracker updates as visitors sign in and out.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadSheet}><Download className="h-3.5 w-3.5" /> Blank sheet</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-3.5 w-3.5" /> Export CSV</Button>
          <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Sign in visitor</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : visitors.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No visitors recorded yet. Add one to start the live sheet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Visitor</th><th className="py-2 pr-3">Organisation</th><th className="py-2 pr-3">Host</th>
                    <th className="py-2 pr-3">Purpose</th><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">In</th>
                    <th className="py-2 pr-3">Out</th><th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => {
                    const isOnSite = visitor.date === today && !visitor.time_out;
                    return (
                      <tr key={visitor.id} className="border-b last:border-0">
                        <td className="py-2 pr-3 font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            {isOnSite && <UserCheck className="h-3.5 w-3.5 text-safe" />}
                            {visitor.visitor_name}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{visitor.organisation || '-'}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{visitor.host || '-'}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{visitor.purpose || '-'}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{visitor.date ? format(new Date(`${visitor.date}T00:00:00`), 'd MMM yyyy') : '-'}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{visitor.time_in || '-'}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{visitor.time_out || (isOnSite ? <Badge className="bg-safe/10 text-safe">On site</Badge> : '-')}</td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            {isOnSite && canEdit && (
                              <Button variant="outline" size="sm" onClick={() => signOut(visitor)}><LogOut className="h-3.5 w-3.5" /> Sign out</Button>
                            )}
                            {canEdit && <Button variant="ghost" size="sm" onClick={() => openEdit(visitor)}><Pencil className="h-3.5 w-3.5" /></Button>}
                            {canDelete && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(visitor)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit visitor' : 'Sign in visitor'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Visitor name *</Label><Input value={form.visitor_name} onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Organisation</Label><Input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Host / visiting</Label><Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Purpose of visit</Label><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Time in</Label><Input type="time" value={form.time_in} onChange={(e) => setForm({ ...form, time_in: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Time out</Label><Input type="time" value={form.time_out} onChange={(e) => setForm({ ...form, time_out: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}