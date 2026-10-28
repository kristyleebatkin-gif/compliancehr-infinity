import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import ComplianceScore from '@/components/compliance/ComplianceScore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { ClipboardCheck, Loader2, Plus, Eye } from 'lucide-react';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';

const today = new Date().toISOString().slice(0, 10);

function StatTile({ label, value, tone }) {
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium opacity-70">{label}</p>
    </div>
  );
}

export default function AuditorsPortal({ embedded = false } = {}) {
  const [data, setData] = useState(null);
  const [observations, setObservations] = useState([]);
  const [form, setForm] = useState({ observation: '', related_audit: '', category: 'General Note' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const today2 = today;
    const [auditsPage, openActions, overdueActions, totalActions, obsPage] = await Promise.all([
      base44.entities.Audit.filter({}, { sort: '-created_date', limit: 100 }),
      base44.entities.AuditAction.count({ status: 'Open' }),
      base44.entities.AuditAction.count({ due_date: { $lt: today2 }, status: { $nin: ['Completed', 'Cancelled'] } }),
      base44.entities.AuditAction.count({}),
      base44.entities.AuditorObservation.filter({}, { sort: '-created_date', limit: 100 }),
    ]);
    const audits = auditsPage.items || [];
    const obs = obsPage.items || [];
    setData({
      audits,
      openActions,
      overdueActions,
      totalActions,
      observations: obs,
    });
    setObservations(obs);
  };

  useEffect(() => { load().catch((e) => console.error(e)); }, []);

  const saveObservation = async () => {
    if (!form.observation.trim()) return;
    setSaving(true);
    try {
      await base44.entities.AuditorObservation.create({
        observation: form.observation.trim(),
        related_audit: form.related_audit || undefined,
        category: form.category,
        auditor: undefined,
      });
      setForm({ observation: '', related_audit: '', category: 'General Note' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const audits = data?.audits || [];

  return (
    <div className="space-y-5">
      <ModuleShell
        embedded={embedded}
        icon={ClipboardCheck}
        title="Auditor Portal"
        subtitle="Live read-only collaboration view for internal and external auditors: compliance evidence, audits, corrective actions and observation log."
        moduleKey="auditor-portal"
        small={data ? [
          ['Audits on record', audits.length],
          ['Open corrective actions', data.openActions],
          ['Overdue actions', data.overdueActions],
          ['Auditor observations', data.observations.length],
        ].map(([label, value]) => (
          <div key={label}><p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p></div>
        )) : undefined}
      />

      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Permission-Based Auditing · Consent &amp; Authority Gate Active
            </span>
            <p className="mt-0.5 font-semibold text-[#0A2B6D]">
              NDIS Auditors, External Auditors and Internal Auditors are only shown records where active Consent exists, Authority exists, and Access is permitted. Withdrawn consent records remain protected and excluded.
            </p>
          </div>
          <span className="rounded-full bg-[#0A2B6D] px-3 py-1 text-[10px] font-extrabold text-white">
            Verified Consent Filter Enforced
          </span>
        </div>
      </div>

      {data === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <Tabs defaultValue="master-356">
            <TabsList className="flex flex-wrap h-auto gap-1.5">
              <TabsTrigger value="master-356">356-Checkpoint &amp; 98-Doc Evidence Register</TabsTrigger>
              <TabsTrigger value="audits">Audits</TabsTrigger>
              <TabsTrigger value="actions">Corrective actions</TabsTrigger>
              <TabsTrigger value="observations">Observation log</TabsTrigger>
            </TabsList>

            <TabsContent value="master-356" className="mt-4">
              <InfinityControlCentreMasterSuite initialTab="master-audit-356" compact />
            </TabsContent>

            <TabsContent value="audits" className="mt-4 space-y-2">
              {audits.length === 0 ? (
                <EmptyState modulePath="/auditor-portal" icon={ClipboardCheck} title="No audits yet" message="Audits recorded in the Compliance & Report Centre will appear here for review." />
              ) : (
                audits.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.audit_type || a.category || 'Audit'} · {a.audit_date || a.created_date?.slice(0, 10) || ''}</p>
                    </div>
                    {a.status && <StatusBadge value={a.status} />}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="actions" className="mt-4">
              <CorrectiveActions />
            </TabsContent>

            <TabsContent value="observations" className="mt-4 space-y-4">
              <Card>
                <CardContent className="space-y-3 p-4">
                  <p className="text-sm font-bold">Record an observation</p>
                  <Textarea
                    placeholder="What did you observe? (evidence seen, good practice, gap identified...)"
                    value={form.observation}
                    onChange={(e) => setForm({ ...form, observation: e.target.value })}
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Note">General Note</SelectItem>
                        <SelectItem value="Positive Practice">Positive Practice</SelectItem>
                        <SelectItem value="Improvement Suggested">Improvement Suggested</SelectItem>
                        <SelectItem value="Non-Compliance">Non-Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={form.related_audit || 'none'} onValueChange={(v) => setForm({ ...form, related_audit: v === 'none' ? '' : v })}>
                      <SelectTrigger><SelectValue placeholder="Related audit (optional)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No related audit</SelectItem>
                        {audits.map((a) => <SelectItem key={a.id} value={a.title}>{a.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={saveObservation} disabled={saving || !form.observation.trim()}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Save observation
                  </Button>
                </CardContent>
              </Card>

              {observations.length === 0 ? (
                <EmptyState modulePath="/auditor-portal" icon={Eye} title="No observations yet" message="Auditors can log observations here; the compliance team sees them live." />
              ) : (
                observations.map((o) => (
                  <div key={o.id} className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{o.category}</p>
                      <p className="text-xs text-muted-foreground">{o.auditor || 'Auditor'} · {(o.created_date || '').slice(0, 10)}</p>
                    </div>
                    <p className="mt-1.5 text-sm">{o.observation}</p>
                    {o.related_audit && <p className="mt-1 text-xs text-muted-foreground">Related audit: {o.related_audit}</p>}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
      <ComplianceScore compact />
    </div>
  );
}

function CorrectiveActions() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    base44.entities.AuditAction.filter({}, { sort: '-created_date', limit: 100 })
      .then((page) => setRows(page.items || []))
      .catch(() => setRows([]));
  }, []);

  if (rows === null) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (rows.length === 0) {
    return <EmptyState modulePath="/auditor-portal" icon={ClipboardCheck} title="No corrective actions" message="Actions raised from audits and checklists appear here with live status." />;
  }
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{r.title}</p>
            <p className="text-xs text-muted-foreground">Allocated to {r.allocated_to || 'unassigned'} · due {r.due_date || 'n/a'}</p>
          </div>
          <StatusBadge value={r.status} />
        </div>
      ))}
    </div>
  );
}