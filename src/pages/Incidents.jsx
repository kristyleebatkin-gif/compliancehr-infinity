import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { Field, TextInput, TextArea, Select, DateInput } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { Plus, Search, AlertTriangle, FileSearch, UserPlus, X, Download, LayoutGrid, KanbanSquare } from 'lucide-react';
import HealthMedicationResponse from '@/components/incidents/HealthMedicationResponse';
import { downloadIncidentReport } from '@/lib/compliancePdf';
import IncidentKanban from '@/components/incidents/IncidentKanban';
import TemplatePicker from '@/components/TemplatePicker';
import { INVESTIGATION_TEMPLATES, mergeTemplateField } from '@/lib/incidentRiskTemplates';
import { recordSafetyEvent } from '@/lib/safetyEvent';
import { logCommunicationRegister } from '@/lib/commRouting';
import { recordStatusLog, currentUserName } from '@/lib/statusLog';
import SafetyFormsLibrary from '@/components/safety/SafetyFormsLibrary';
import SafetyRegisterExports, { INCIDENT_CSV_COLUMNS, INVESTIGATION_CSV_COLUMNS } from '@/components/safety/SafetyRegisterExports';
import { downloadCsv } from '@/lib/csvExport';
import StatusDashboard from '@/components/safety/StatusDashboard';
import SafetyTrendsDashboard from '@/components/safety/SafetyTrendsDashboard';
import IncidentLog from '@/components/safety/IncidentLog';
import SafetyOperationsDashboard from '@/components/safety/SafetyOperationsDashboard';
import { useRole } from '@/lib/useRole';
import { ROLES } from '@/lib/roles';
import { isOpenIncident } from '@/lib/safetyFilters';

const statusFilters = ['All', 'Open', 'Reported', 'Under Investigation', 'Action Required', 'Resolved', 'Closed'];
const INC_STATUSES = ['Reported', 'Under Investigation', 'Action Required', 'Resolved', 'Closed'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const INV_STATUSES = ['Pending', 'In Progress', 'Findings Draft', 'Completed', 'Closed'];
const fieldBase = 'w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none';
const labelCls = 'text-[11px] font-semibold text-foreground/60 mb-1';
const blankInv = { title: '', investigation_id: '', incident_id: '', investigator: '', received_by: '', start_date: '', target_completion: '', status: 'Pending', incident_summary: '', evidence_reviewed: '', persons_interviewed: '', hazards_identified: '', risk_assessment: '', control_measures: '', findings: '', recommendations: '', root_cause: '', corrective_actions: '' };

export default function Incidents({ profile, profileKind, embedded = false } = {}) {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { role } = useRole();
  const canReview = !profile && [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER].includes(role);
  const [items, setItems] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [invSearch, setInvSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') === 'open' ? 'Open' : 'All');
  const [showInv, setShowInv] = useState(false);
  const [invForm, setInvForm] = useState(blankInv);
  const [view, setView] = useState('list');

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (window.location.hash !== '#incident-register') return;
    const timer = window.setTimeout(() => document.getElementById('incident-register')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const unsubInc = base44.entities.Incident.subscribe((event) => {
      if (event.type === 'create' && (!profile || (profileKind === 'participant' ? event.data.participant_id === profile.id || event.data.participant_name === profile.full_name : event.data.staff_id === profile.id || event.data.staff_name === profile.full_name))) {
        setItems((prev) => (prev.some((i) => i.id === event.data.id) ? prev : [event.data, ...prev]));
      }
    });
    const unsubInv = base44.entities.Investigation.subscribe((event) => {
      if (event.type === 'create') {
        setInvestigations((prev) => (prev.some((i) => i.id === event.data.id) ? prev : [event.data, ...prev]));
      }
    });
    return () => { unsubInc(); unsubInv(); };
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [incPage, invPage] = await Promise.all([
        base44.entities.Incident.filter(profile ? profileKind === 'participant' ? { $or: [{ participant_id: profile.id }, { participant_name: profile.full_name }] } : { $or: [{ staff_id: profile.id }, { staff_name: profile.full_name }] } : {}, { sort: '-date_occurred', limit: 500 }),
        base44.entities.Investigation.filter({}, { sort: '-start_date', limit: 500 }),
      ]);
      setItems(incPage.items || []);
      setInvestigations(invPage.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setInvForm((f) => ({ ...f, [k]: v }));

  const applyInvestigationTemplate = (t) => {
    setInvForm((f) => ({
      ...f,
      root_cause: mergeTemplateField(f.root_cause, t.root_cause),
      findings: mergeTemplateField(f.findings, t.findings),
      recommendations: mergeTemplateField(f.recommendations, t.recommendations),
    }));
    toast({ title: `Loaded "${t.name}" template` });
  };

  const commitInc = async (inc, field, value) => {
    if ((inc[field] || '') === (value || '')) return;
    try {
      await base44.entities.Incident.update(inc.id, { [field]: value });
      await recordSafetyEvent('Incident', inc.id, { notify: false });
      setItems((prev) => prev.map((i) => (i.id === inc.id ? { ...i, [field]: value } : i)));
    } catch (e) { console.error(e); }
  };

  const moveIncidentStatus = async (id, status) => {
    const inc = items.find((i) => i.id === id) || null;
    try {
      await base44.entities.Incident.update(id, { status });
      await recordSafetyEvent('Incident', id, { notify: false });
      recordStatusLog('Incident', { id, title: inc?.title || '', status: inc?.status || '' }, status, await currentUserName().catch(() => ''), 'Immutable status trail').catch(() => {});
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      toast({ title: `Moved to ${status}` });
    } catch (e) { console.error(e); toast({ title: 'Move failed', variant: 'destructive' }); }
  };

  const commitInv = async (inv, field, value) => {
    if ((inv[field] || '') === (value || '')) return;
    try {
      await base44.entities.Investigation.update(inv.id, { [field]: value });
      await recordSafetyEvent('Investigation', inv.id, { notify: false });
      setInvestigations((prev) => prev.map((i) => (i.id === inv.id ? { ...i, [field]: value } : i)));
    } catch (e) { console.error(e); }
  };

  const saveInvestigation = async (e) => {
    e.preventDefault();
    if (!invForm.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    try {
      const rec = await base44.entities.Investigation.create(invForm);
      const result = await recordSafetyEvent('Investigation', rec.id);
      if (result.email_failures?.length) toast({ title: 'Investigation logged; some administrator emails failed', description: `${result.email_failures.length} email(s) could not be sent.`, variant: 'destructive' });
      toast({ title: 'Investigation created' });
      setInvForm(blankInv);
      setShowInv(false);
      load();
    } catch (err) { toast({ title: 'Failed to create investigation', description: err.message, variant: 'destructive' }); }
  };

  const filtered = items.filter(i => {
    const matchSearch = !search ||
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.incident_id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Open' ? isOpenIncident(i) : i.status === statusFilter);
    return matchSearch && matchStatus;
  });

  const invFiltered = investigations.filter(i => {
    if (!invSearch) return true;
    return i.title?.toLowerCase().includes(invSearch.toLowerCase()) ||
      i.investigation_id?.toLowerCase().includes(invSearch.toLowerCase()) ||
      i.investigator?.toLowerCase().includes(invSearch.toLowerCase());
  });

  const incLabel = (id) => {
    const inc = items.find((x) => x.id === id);
    return inc ? inc.title : '—';
  };

  const copyToProfile = async (inc) => {
    try {
      const user = await base44.auth.me();
      const isParticipant = Boolean(inc.participant_name);
      const record = await base44.entities.CommunicationEntry.create({
        entry_kind: 'Shift Note',
        person_type: isParticipant ? 'Participant' : 'Employee',
        person_name: inc.participant_name || inc.staff_name || '',
        note_type: 'Incident',
        subject: `Incident report copy: ${inc.title || inc.incident_id || inc.id}`,
        body: [
          inc.incident_id && `Incident ID: ${inc.incident_id}`,
          inc.severity && `Severity: ${inc.severity}`,
          inc.date_occurred && `Date: ${inc.date_occurred}${inc.time_occurred ? ` ${inc.time_occurred}` : ''}`,
          inc.description && `What happened: ${inc.description}`,
          inc.immediate_actions && `Follow-up: ${inc.immediate_actions}`,
        ].filter(Boolean).join('\n\n'),
        incident_report: inc.incident_id || inc.id,
        entry_date: new Date().toISOString().slice(0, 10),
        sender_name: user?.full_name || '',
        sender_email: user?.email || '',
        module: 'Incident Clinic',
      });
      await logCommunicationRegister(record);
      toast({ title: 'Incident copied to the person\'s profile', description: 'It now appears in their communication diary.' });
    } catch (e) { toast({ title: 'Copy failed', description: e.message, variant: 'destructive' }); }
  };

  const exportRegister = (filename, columns, rows, label) => {
    if (!rows.length) { toast({ title: `No ${label} to export` }); return; }
    downloadCsv(filename, columns, rows);
    toast({ title: `${label} register exported` });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-4">
      {!embedded && <PageHeader
        title="Incident Clinic"
        subtitle="Report, investigate and resolve incidents - every report feeds the register, investigations and exports"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canReview && <Button size="sm" onClick={() => { setInvForm(blankInv); setShowInv(true); }} className="bg-warning text-warning-foreground hover:bg-warning/90 border-warning"><FileSearch className="h-4 w-4 mr-1.5" /> New investigation</Button>}
            <Link to={profile ? `/incidents/new?${profileKind === 'participant' ? 'participantId' : 'staffId'}=${encodeURIComponent(profile.id)}` : '/incidents/new'}>
              <Button size="sm" className="bg-safe text-safe-foreground hover:bg-safe/90 border-safe"><Plus className="h-4 w-4 mr-1.5" /> New incident</Button>
            </Link>
            {canReview && <Button size="sm" onClick={() => downloadIncidentReport(items)} disabled={loading || items.length === 0} className="bg-teal text-teal-foreground hover:bg-teal/90 border-teal"><Download className="h-4 w-4 mr-1.5" /> Reports (PDF)</Button>}
          </div>
        }
      />}

      <RegisterInsights module="incidents" />

      <HealthMedicationResponse />

      <SafetyOperationsDashboard />

      <SafetyTrendsDashboard />

      <IncidentLog />

      <StatusDashboard
        title="Incident Status Dashboard"
        description="Every incident and its current status — change a status here and the register updates"
        records={items}
        statuses={INC_STATUSES}
        subField="incident_id"
        disabled={!canReview}
        onChange={(inc, status) => commitInc(inc, 'status', status)}
        onExport={() => exportRegister('Incident Register.csv', INCIDENT_CSV_COLUMNS, items, 'incident')}
        emptyTitle="No incidents reported"
      />

      <SafetyRegisterExports incidents={items} investigations={investigations} />
      <SafetyFormsLibrary types={['Incident Report', 'Investigation Report', 'Take Five Assessment', 'Risk Assessment']} />

      {/* Incident Register */}
      <SectionCard
        id="incident-register"
        title="Incident Register"
        description="All reported incidents"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => exportRegister('Incident Register.csv', INCIDENT_CSV_COLUMNS, filtered, 'incident')} className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal/90"><Download className="h-3.5 w-3.5" />Export CSV</button>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/60">{items.length} incidents</span>
          </div>
        }
      >
        <div className="module-filter-bar mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border/60 bg-card p-0.5">
              <button onClick={() => setView('list')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${view === 'list' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><LayoutGrid className="h-3.5 w-3.5" />List</button>
              {canReview && <button onClick={() => setView('board')} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${view === 'board' ? 'bg-brand text-white' : 'text-foreground/60 hover:bg-muted'}`}><KanbanSquare className="h-3.5 w-3.5" />Board</button>}
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {statusFilters.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === s ? 'bg-foreground text-background' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {s === 'All' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-7 h-7 border-4 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No incidents found" />
        ) : view === 'board' ? (
          <IncidentKanban incidents={filtered} onMove={moveIncidentStatus} />
        ) : (
          <div className="space-y-3">
            {filtered.map((inc) => (
              <div key={inc.id} className="rounded-xl border border-border/60 px-3 py-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link to={`/incidents/${inc.id}`} className="text-sm font-semibold text-foreground hover:underline">{inc.title || 'Untitled'}</Link>
                    {inc.incident_id && <div className="text-xs text-foreground/40">{inc.incident_id}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => downloadIncidentReport([inc])} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground/70 hover:bg-muted"><Download className="h-3 w-3" />PDF</button>
                    {(inc.participant_name || inc.staff_name) && (
                      <button onClick={() => copyToProfile(inc)} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-brand hover:bg-brand/5"><UserPlus className="h-3 w-3" />Copy to profile</button>
                    )}
                    <select disabled={!canReview} value={inc.severity || ''} onChange={(e) => commitInc(inc, 'severity', e.target.value)} className={`${fieldBase} w-auto disabled:opacity-70`}>
                      {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select disabled={!canReview} value={inc.status || ''} onChange={(e) => commitInc(inc, 'status', e.target.value)} className={`${fieldBase} w-auto disabled:opacity-70`}>
                      {INC_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {(inc.participant_name || inc.staff_name) && <div className="mb-3 flex flex-wrap gap-2 text-xs"><span className="font-semibold text-foreground/50">Attached profiles:</span>{inc.participant_name && <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 px-2 py-1">Participant: {inc.participant_name}</span>}{inc.staff_name && <span className="rounded-full bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 px-2 py-1">Staff: {inc.staff_name}</span>}</div>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className={labelCls}>Date</div>
                    <input disabled={!canReview} type="date" defaultValue={inc.date_occurred || ''} key={`${inc.id}-date`} onBlur={(e) => commitInc(inc, 'date_occurred', e.target.value)} className={fieldBase} />
                  </div>
                  <div>
                    <div className={labelCls}>Time</div>
                    <input disabled={!canReview} type="time" defaultValue={inc.time_occurred || ''} key={`${inc.id}-time`} onBlur={(e) => commitInc(inc, 'time_occurred', e.target.value)} className={fieldBase} />
                  </div>
                  <div>
                    <div className={labelCls}>Name</div>
                    <input disabled={!canReview} defaultValue={inc.reported_by || ''} key={`${inc.id}-name`} onBlur={(e) => commitInc(inc, 'reported_by', e.target.value)} className={fieldBase} placeholder="—" />
                  </div>
                  <div>
                    <div className={labelCls}>Person received</div>
                    <input disabled={!canReview} defaultValue={inc.received_by || ''} key={`${inc.id}-recv`} onBlur={(e) => commitInc(inc, 'received_by', e.target.value)} className={fieldBase} placeholder="—" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className={labelCls}>What happened</div>
                    <textarea disabled={!canReview} defaultValue={inc.description || ''} key={`${inc.id}-desc`} onBlur={(e) => commitInc(inc, 'description', e.target.value)} rows={2} className={`${fieldBase} min-h-[60px] resize-y`} placeholder="—" />
                  </div>
                  <div>
                    <div className={labelCls}>Follow-up</div>
                    <textarea disabled={!canReview} defaultValue={inc.immediate_actions || ''} key={`${inc.id}-fu`} onBlur={(e) => commitInc(inc, 'immediate_actions', e.target.value)} rows={2} className={`${fieldBase} min-h-[60px] resize-y`} placeholder="—" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Investigation Register */}
      {canReview && <SectionCard
        title="Investigation Register"
        description="All incident investigations"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => exportRegister('Investigation Register.csv', INVESTIGATION_CSV_COLUMNS, invFiltered, 'investigation')} className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal/90"><Download className="h-3.5 w-3.5" />Export CSV</button>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/60">{investigations.length} investigations</span>
          </div>
        }
      >
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={invSearch}
              onChange={(e) => setInvSearch(e.target.value)}
              placeholder="Search investigations..."
              className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-7 h-7 border-4 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : invFiltered.length === 0 ? (
          <EmptyState icon={FileSearch} title="No investigations" subtitle="Click 'Add New Investigation' to open a new investigation." />
        ) : (
          <div className="space-y-3">
            {invFiltered.map((inv) => (
              <div key={inv.id} className="rounded-xl border border-border/60 px-3 py-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link to={`/incidents/${inv.incident_id}`} className="text-sm font-semibold text-foreground hover:underline">{inv.title || 'Untitled'}</Link>
                    {inv.investigation_id && <div className="text-xs text-foreground/40">{inv.investigation_id}</div>}
                  </div>
                  <select value={inv.status || ''} onChange={(e) => commitInv(inv, 'status', e.target.value)} className={`${fieldBase} w-auto`}>
                    {INV_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className={labelCls}>Date</div>
                    <input type="date" defaultValue={inv.start_date || ''} key={`${inv.id}-date`} onBlur={(e) => commitInv(inv, 'start_date', e.target.value)} className={fieldBase} />
                  </div>
                  <div>
                    <div className={labelCls}>Time</div>
                    <input type="time" defaultValue={inv.time || ''} key={`${inv.id}-time`} onBlur={(e) => commitInv(inv, 'time', e.target.value)} className={fieldBase} />
                  </div>
                  <div>
                    <div className={labelCls}>Name</div>
                    <input defaultValue={inv.investigator || ''} key={`${inv.id}-name`} onBlur={(e) => commitInv(inv, 'investigator', e.target.value)} className={fieldBase} placeholder="—" />
                  </div>
                  <div>
                    <div className={labelCls}>Person received</div>
                    <input defaultValue={inv.received_by || ''} key={`${inv.id}-recv`} onBlur={(e) => commitInv(inv, 'received_by', e.target.value)} className={fieldBase} placeholder="—" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className={labelCls}>What happened</div>
                    <textarea defaultValue={inv.findings || ''} key={`${inv.id}-desc`} onBlur={(e) => commitInv(inv, 'findings', e.target.value)} rows={2} className={`${fieldBase} min-h-[60px] resize-y`} placeholder="—" />
                  </div>
                  <div>
                    <div className={labelCls}>Follow-up</div>
                    <textarea defaultValue={inv.recommendations || ''} key={`${inv.id}-fu`} onBlur={(e) => commitInv(inv, 'recommendations', e.target.value)} rows={2} className={`${fieldBase} min-h-[60px] resize-y`} placeholder="—" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>}

      {/* New Investigation modal */}
      {canReview && showInv && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Investigation</h3>
              <button onClick={() => setShowInv(false)} className="rounded p-1.5 hover:bg-muted"><X className="h-4 w-4 text-foreground/50" /></button>
            </div>
            <form onSubmit={saveInvestigation} className="space-y-3">
              <Field label="Investigation Title"><TextInput value={invForm.title} onChange={(e) => set('title', e.target.value)} required placeholder="e.g. Investigation - Slip incident 12 Aug" /></Field>
              <Field label="Investigation ID"><TextInput value={invForm.investigation_id} onChange={(e) => set('investigation_id', e.target.value)} placeholder="INV-2026-001" /></Field>
              <Field label="Related Incident"><Select value={invForm.incident_id} onChange={(e) => set('incident_id', e.target.value)}><option value="">— Select incident —</option>{items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}</Select></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Investigator"><TextInput value={invForm.investigator} onChange={(e) => set('investigator', e.target.value)} /></Field>
                <Field label="Received By"><TextInput value={invForm.received_by} onChange={(e) => set('received_by', e.target.value)} /></Field>
                <Field label="Status"><Select value={invForm.status} onChange={(e) => set('status', e.target.value)}>{INV_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date"><DateInput value={invForm.start_date} onChange={(e) => set('start_date', e.target.value)} /></Field>
                <Field label="Target Completion"><DateInput value={invForm.target_completion} onChange={(e) => set('target_completion', e.target.value)} /></Field>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-foreground/60">Standard investigation steps</div>
                <TemplatePicker label="Load template" templates={INVESTIGATION_TEMPLATES} onApply={applyInvestigationTemplate} />
              </div>
              <Field label="Root Cause"><TextArea value={invForm.root_cause} onChange={(e) => set('root_cause', e.target.value)} /></Field>
              <Field label="Incident Summary"><TextArea value={invForm.incident_summary} onChange={(e) => set('incident_summary', e.target.value)} /></Field>
              <Field label="Evidence Reviewed"><TextArea value={invForm.evidence_reviewed} onChange={(e) => set('evidence_reviewed', e.target.value)} /></Field>
              <Field label="Persons Interviewed"><TextArea value={invForm.persons_interviewed} onChange={(e) => set('persons_interviewed', e.target.value)} /></Field>
              <Field label="Risks / Hazards Identified"><TextArea value={invForm.hazards_identified} onChange={(e) => set('hazards_identified', e.target.value)} /></Field>
              <Field label="Risk Assessment"><TextArea value={invForm.risk_assessment} onChange={(e) => set('risk_assessment', e.target.value)} /></Field>
              <Field label="Control Measures"><TextArea value={invForm.control_measures} onChange={(e) => set('control_measures', e.target.value)} /></Field>
              <Field label="Findings"><TextArea value={invForm.findings} onChange={(e) => set('findings', e.target.value)} /></Field>
              <Field label="Recommendations"><TextArea value={invForm.recommendations} onChange={(e) => set('recommendations', e.target.value)} /></Field>
              <Field label="Corrective Actions"><TextArea value={invForm.corrective_actions} onChange={(e) => set('corrective_actions', e.target.value)} /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowInv(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Create Investigation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}