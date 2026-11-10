import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRole } from '@/lib/useRole';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import RegisterInsights from '@/components/RegisterInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmergencyDrillDialog from '@/components/emergency/EmergencyDrillDialog';
import EmergencyDownloads from '@/components/emergency/EmergencyDownloads';
import { Plus, Trash2, Siren, Flame, ClipboardCheck, FileText, AlertTriangle, Download } from 'lucide-react';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { format, isBefore, addDays } from 'date-fns';
import SafetyChecksLog from '@/components/emergency/SafetyChecksLog';
import EmergencyDocumentsLibrary from '@/components/emergency/EmergencyDocumentsLibrary';
import VisitorLogTable from '@/components/emergency/VisitorLogTable';
import EmergencyResources from '@/components/emergency/EmergencyResources';
import LiveAlerts from '@/components/emergency/LiveAlerts';
import EmergencyQuickDial from '@/components/emergency/EmergencyQuickDial';
import OfflineFieldCapture from '@/components/safety/OfflineFieldCapture';
import WorkforcePresenceSafetyCentre from '@/components/emergency/WorkforcePresenceSafetyCentre';


export default function EmergencyResponse({ embedded = false } = {}) {
  const { user } = useRole();
  const employee = user?.role === 'Employee';
  const scope = useMemo(() => employee ? { created_by_id: user.id } : {}, [employee, user?.id]);
  const [drills, setDrills] = useState([]);
  const [checks, setChecks] = useState([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('drills');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', drill_type: 'Fire Evacuation', date: '', location: '', attendees_count: '', outcome: 'Completed', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [drillPage, checkPage, docPage] = await Promise.all([
        base44.entities.EmergencyDrill.filter(scope, { sort: '-date', limit: 100 }),
        base44.entities.SafetyCheck.filter(scope, { sort: '-date_completed', limit: 200 }),
        employee ? Promise.resolve(0) : base44.entities.EmergencyDocument.count({}),
      ]);
      setDrills(drillPage.items);
      setChecks(checkPage.items);
      setDocCount(docPage);
    } finally {
      setLoading(false);
    }
  }, [scope, employee]);

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
    const rows = await fetchAllRecords(base44.entities.SafetyCheck, scope, '-date_completed');
    downloadCsv('Safety-Check-Register.csv', [
      { key: 'name', label: 'Check Name' }, { key: 'check_type', label: 'Check Type' },
      { key: 'location', label: 'Location' }, { key: 'date_completed', label: 'Date Completed' },
      { key: 'result', label: 'Result' }, { key: 'issues_found', label: 'Issues Found' },
      { key: 'action_taken', label: 'Action Taken' }, { key: 'completed_by', label: 'Completed By' },
      { key: 'next_due_date', label: 'Next Due Date' }, { key: 'notes', label: 'Notes' },
    ], rows);
  };

  return (
    <div className="space-y-4">
      {!embedded && <ModuleShell
        icon={Siren}
        title="Emergency Response"
        moduleKey="emergency-response"
        subtitle={employee ? 'Your emergency drill and safety-check records.' : 'Fire and evacuation readiness, safety checks, emergency documents, visitors and resources.'}
        insightModule={!employee ? 'emergency' : undefined}
        actions={<>
          <Button variant="outline" className="border-border bg-white text-[#0A2B6D]" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Log drill</Button>
          {!employee && <Button variant="outline" className="border-border bg-white text-[#0A2B6D]" onClick={() => { setActiveTab('documents'); setDocumentOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add doc</Button>}
          <Button variant="outline" className="border-border bg-white text-[#0A2B6D]" onClick={exportSafetyChecks} disabled={loading || checks.length === 0}><Download className="mr-2 h-4 w-4" />Export safety check register</Button>
        </>}
        insight={!employee ? <EmergencyDownloads /> : undefined}
      />}

      {embedded && <div className="module-action-bar flex flex-wrap gap-1"><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Log drill</Button>{!employee && <Button variant="outline" onClick={() => { setActiveTab('documents'); setDocumentOpen(true); }}><Plus className="h-4 w-4" />Add doc</Button>}</div>}
      {embedded && !employee && <EmergencyDownloads />}
      <EmergencyDrillDialog open={open} onOpenChange={setOpen} form={form} onChange={setForm} saving={saving} onSave={save} />
      {embedded && !employee && <RegisterInsights module="emergency" />}

      <div className="rounded-xl border-2 border-[#b91c1c] bg-rose-50/70 p-2.5 flex flex-wrap items-center justify-between gap-2" style={{ borderTopWidth: '4px' }}>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-red-900">
            Section 17 — Emergency &amp; Business Continuity Readiness (Category 13 Audit Standard)
          </h3>
          <p className="text-[10px] font-semibold text-red-800">
            Tracks 6-monthly fire &amp; evacuation drills, smoke alarm &amp; extinguisher tests, natural disaster kits, PEEPs, and visitor sign-in/out logs.
          </p>
        </div>
        <Badge className="bg-[#b91c1c] text-white text-[10px]">
          {drills.length} Drills · {checks.length} Safety Checks
        </Badge>
      </div>

      <WorkforcePresenceSafetyCentre />
      {!employee && <EmergencyQuickDial />}

      {!employee && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
      </div>}

      {dueSoonChecks > 0 && (
        <Card><CardContent className="p-3 text-sm text-warning">{dueSoonChecks} check{dueSoonChecks === 1 ? '' : 's'} due within 30 days - see the Safety checks tab.</CardContent></Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-4 [&>button]:h-auto [&>button]:min-h-12 [&>button]:whitespace-normal [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:px-3 [&>button]:py-2 [&>button]:text-left">
          <TabsTrigger value="drills">Drills &amp; evacuations</TabsTrigger>
          <TabsTrigger value="checks">Safety checks log</TabsTrigger>
          {!employee && <TabsTrigger value="documents">Documents &amp; plans</TabsTrigger>}
          {!employee && <TabsTrigger value="visitors">Visitor log</TabsTrigger>}
          <TabsTrigger value="resources">Resources &amp; links</TabsTrigger>
          <TabsTrigger value="alerts">Live alerts &amp; warnings</TabsTrigger>
          {!employee && <TabsTrigger value="capture">Field capture</TabsTrigger>}
        </TabsList>

        <TabsContent value="drills" className="mt-4 space-y-4">
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

        <TabsContent value="checks" className="mt-4"><SafetyChecksLog scope={scope} /></TabsContent>
        {!employee && <TabsContent value="documents" className="mt-4"><EmergencyDocumentsLibrary open={documentOpen} onOpenChange={setDocumentOpen} onChanged={load} /></TabsContent>}
        {!employee && <TabsContent value="visitors" className="mt-4"><VisitorLogTable /></TabsContent>}
        <TabsContent value="resources" className="mt-4"><EmergencyResources /></TabsContent>
        <TabsContent value="alerts" className="mt-4"><LiveAlerts /></TabsContent>
        {!employee && <TabsContent value="capture" className="mt-4"><OfflineFieldCapture /></TabsContent>}
      </Tabs>
    </div>
  );
}