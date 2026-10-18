import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Siren, Flame, ClipboardCheck, FileText, Users, AlertTriangle, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { format, addMonths, isBefore, addDays } from 'date-fns';
import SafetyChecksLog from '@/components/emergency/SafetyChecksLog';
import EmergencyDocumentsLibrary from '@/components/emergency/EmergencyDocumentsLibrary';
import VisitorLogTable from '@/components/emergency/VisitorLogTable';
import EmergencyResources from '@/components/emergency/EmergencyResources';
import LiveAlerts from '@/components/emergency/LiveAlerts';
import EmergencyQuickDial from '@/components/emergency/EmergencyQuickDial';

const TYPES = ['Fire Evacuation', 'Fire Drill', 'Lockdown', 'Medical Emergency', 'Natural Disaster', 'Other'];

export default function EmergencyResponse() {
  const [drills, setDrills] = useState([]);
  const [checks, setChecks] = useState([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', drill_type: 'Fire Evacuation', date: '', location: '', attendees_count: '', outcome: 'Completed', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [drillPage, checkPage, docPage] = await Promise.all([
        base44.entities.EmergencyDrill.filter({}, { sort: '-date', limit: 100 }),
        base44.entities.SafetyCheck.filter({}, { sort: '-date_completed', limit: 200 }),
        base44.entities.EmergencyDocument.count({}),
      ]);
      setDrills(drillPage.items);
      setChecks(checkPage.items);
      setDocCount(docPage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.EmergencyDrill.create({ ...form, attendees_count: Number(form.attendees_count) || undefined });
      setForm({ title: '', drill_type: 'Fire Evacuation', date: '', location: '', attendees_count: '', outcome: 'Completed', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const overdueChecks = useMemo(
    () => checks.filter((c) => c.next_due_date && isBefore(new Date(c.next_due_date), new Date())).length,
    [checks],
  );
  const dueSoonChecks = useMemo(
    () => checks.filter((c) => c.next_due_date && !isBefore(new Date(c.next_due_date), new Date()) && isBefore(new Date(c.next_due_date), addDays(new Date(), 30))).length,
    [checks],
  );

  const exportSafetyChecks = async () => {
    const page = await base44.entities.SafetyCheck.filter({}, { sort: '-date_completed', limit: 1000 });
    downloadCsv('Safety-Check-Register.csv', [
      { key: 'name', label: 'Check Name' }, { key: 'check_type', label: 'Check Type' },
      { key: 'location', label: 'Location' }, { key: 'date_completed', label: 'Date Completed' },
      { key: 'result', label: 'Result' }, { key: 'issues_found', label: 'Issues Found' },
      { key: 'action_taken', label: 'Action Taken' }, { key: 'completed_by', label: 'Completed By' },
      { key: 'next_due_date', label: 'Next Due Date' }, { key: 'notes', label: 'Notes' },
    ], page.items);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Siren}
        title="Emergency Response"
        subtitle="Fire and evacuation readiness, safety checks, emergency documents, visitors and resources."
        action={<Button variant="outline" onClick={exportSafetyChecks} disabled={loading || checks.length === 0}><Download className="mr-2 h-4 w-4" />Export safety check register</Button>}
      />

      <EmergencyQuickDial />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Drills & evacuations logged', value: drills.length, icon: Siren },
          { label: 'Checks logged', value: checks.length, icon: ClipboardCheck },
          { label: 'Checks overdue', value: overdueChecks, icon: AlertTriangle, alert: overdueChecks > 0 },
          { label: 'Emergency documents stored', value: docCount, icon: FileText },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${s.alert ? 'bg-danger/10 text-danger' : 'bg-brand/10 text-brand'}`}><Icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {dueSoonChecks > 0 && (
        <Card><CardContent className="p-3 text-sm text-warning">{dueSoonChecks} check{dueSoonChecks === 1 ? '' : 's'} due within 30 days - see the Safety checks tab.</CardContent></Card>
      )}

      <Tabs defaultValue="drills">
        <TabsList className="flex-wrap">
          <TabsTrigger value="drills">Drills &amp; evacuations</TabsTrigger>
          <TabsTrigger value="checks">Safety checks log</TabsTrigger>
          <TabsTrigger value="documents">Documents &amp; plans</TabsTrigger>
          <TabsTrigger value="visitors">Visitor log</TabsTrigger>
          <TabsTrigger value="resources">Resources &amp; links</TabsTrigger>
          <TabsTrigger value="alerts">Live alerts &amp; warnings</TabsTrigger>
        </TabsList>

        <TabsContent value="drills" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Log drill</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New emergency drill</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Drill type</Label>
                      <Select value={form.drill_type} onValueChange={(v) => setForm({ ...form, drill_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Participants</Label><Input type="number" value={form.attendees_count} onChange={(e) => setForm({ ...form, attendees_count: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Outcome</Label>
                      <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Completed', 'Partial', 'Issues Found'].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                  <Button onClick={save} disabled={saving || !form.title.trim()}>Log drill</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : drills.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No drills logged yet. Every fire drill and evacuation should be recorded here.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {drills.map((d) => (
                <Card key={d.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2"><Flame className="h-5 w-5 text-muted-foreground" /></div>
                      <div>
                        <p className="font-medium">{d.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {[d.drill_type, d.date ? format(new Date(d.date), 'd MMM yyyy') : '', d.location, d.attendees_count ? `${d.attendees_count} participants` : ''].filter(Boolean).join(' · ')}
                        </p>
                        {d.notes && <p className="mt-1 text-xs text-muted-foreground">{d.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusTone(d.outcome)}>{d.outcome}</Badge>
                      <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.EmergencyDrill.delete(d.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="checks" className="mt-4"><SafetyChecksLog /></TabsContent>
        <TabsContent value="documents" className="mt-4"><EmergencyDocumentsLibrary /></TabsContent>
        <TabsContent value="visitors" className="mt-4"><VisitorLogTable /></TabsContent>
        <TabsContent value="resources" className="mt-4"><EmergencyResources /></TabsContent>
        <TabsContent value="alerts" className="mt-4"><LiveAlerts /></TabsContent>
      </Tabs>
    </div>
  );
}