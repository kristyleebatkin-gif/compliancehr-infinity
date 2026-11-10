import React, { useEffect, useState } from 'react';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeIncidents from '@/components/employee/EmployeeIncidents';
export default withEmployeeView(Incidents, EmployeeIncidents);
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import RegisterInsights from '@/components/RegisterInsights';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { Field, TextInput, TextArea, Select, DateInput } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, AlertTriangle, FileSearch, UserPlus, X, Download, LayoutGrid, KanbanSquare, BarChart3, ShieldAlert } from 'lucide-react';
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
import IncidentAnalytics from '@/pages/IncidentAnalytics';
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

function Incidents({ profile, profileKind, embedded = false } = {}) {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { role } = useRole();
  const canReview = [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER].includes(role);
  const [items, setItems] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [invSearch, setInvSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') === 'open' ? 'Open' : 'All');
  const [showInv, setShowInv] = useState(false);
  const [invForm, setInvForm] = useState(blankInv);
  const [editingInvestigation, setEditingInvestigation] = useState(null);
  const [savingInvestigation, setSavingInvestigation] = useState(false);
  const [view, setView] = useState('list');
  const [screenMode, setScreenMode] = useState('clinic');
  const [escalatingId, setEscalatingId] = useState(null);
  const [lastEscalatedSummary, setLastEscalatedSummary] = useState(null);

  const escalateIncidentClosedLoop = async (target) => {
    if (!target) {
      toast({ title: 'No incident available to escalate' });
      return;
    }
    setEscalatingId(target.id);
    const fiveDayDue = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    const fourteenDayTarget = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const priority = target.severity === 'Critical' || target.severity === 'High' ? 'High' : 'Medium';
    const riskRating = target.severity === 'Critical' ? 'Critical' : target.severity === 'High' ? 'High' : 'Medium';
    try {
      const userName = await currentUserName().catch(() => 'Compliance Manager');
      await Promise.all([
        base44.entities.QualityItem.create({
          title: `CAPA: ${target.title || target.incident_id || 'Incident Follow-up'}`,
          type: 'Corrective Action',
          source_type: 'Incident',
          source_record_id: target.id,
          source: 'Incident',
          priority,
          status: 'In Progress',
          owner: target.responsible_manager || userName || 'Compliance Manager',
          raised_by: userName || target.reported_by || 'Compliance Manager',
          raised_date: new Date().toISOString().slice(0, 10),
          target_date: fourteenDayTarget,
          description: `Closed-loop corrective action linked to Incident ${target.incident_id || target.id}: ${target.description || ''}`,
          notes: target.immediate_actions || 'Complete root-cause investigation, verify NDIS Commission 5-day report, and update participant risk controls.',
        }),
        base44.entities.ImprovementAction.create({
          title: `CAPA: ${target.title || target.incident_id || 'Incident Follow-up'}`,
          improvement_id: `IMP-${Date.now().toString().slice(-6)}`,
          description: target.immediate_actions || target.description || 'Corrective and preventive action escalated from incident.',
          owner: target.responsible_manager || userName || 'Compliance Manager',
          priority,
          target_date: fourteenDayTarget,
          source: 'Incident Reviews',
          date_identified: new Date().toISOString().slice(0, 10),
          identified_by: userName || 'System Escalation',
          status: 'Identified',
          linked_entity_type: 'Incident',
          linked_entity_id: target.id,
        }).catch(() => null),
        base44.entities.Risk.create({
          title: `Incident Risk: ${target.title || target.incident_id || 'Safety Hazard'}`,
          report_type: 'Risk',
          category: target.category === 'Medical' || target.category === 'Medication Error' ? 'Clinical' : 'Operational',
          rating: riskRating,
          status: 'Treating',
          owner: target.responsible_manager || userName || 'Compliance Manager',
          participant_name: target.participant_name || '',
          hazards_identified: target.hazards_identified || target.description || '',
          control_measures: target.control_measures || target.immediate_actions || '',
          source_entity_type: 'Incident',
          source_entity_id: target.id,
          identified_date: new Date().toISOString().slice(0, 10),
          review_date: fourteenDayTarget,
        }),
        base44.entities.Incident.update(target.id, {
          status: target.status === 'Reported' ? 'Action Required' : target.status,
          five_day_follow_up_due: target.five_day_follow_up_due || fiveDayDue,
        }),
      ]);
      setItems((prev) =>
        prev.map((i) =>
          i.id === target.id
            ? {
                ...i,
                status: i.status === 'Reported' ? 'Action Required' : i.status,
                five_day_follow_up_due: i.five_day_follow_up_due || fiveDayDue,
              }
            : i
        )
      );
      setLastEscalatedSummary({
        id: target.id,
        title: target.title || target.incident_id || 'Incident',
        priority,
        riskRating,
        fiveDayDue,
      });
      toast({
        title: 'Closed-Loop Incident Escalation Complete',
        description: `Created linked CAPA, Quality Item & ${riskRating} Risk for "${target.title}".`,
      });
    } catch (err) {
      toast({ title: 'Escalation failed', description: err.message, variant: 'destructive' });
    } finally {
      setEscalatingId(null);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (window.location.hash !== '#incident-register') return;
    const timer = window.setTimeout(() => document.getElementById('incident-register')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const matchesProfile = (rec) => !profile || (profileKind === 'participant'
      ? rec?.participant_id === profile.id || rec?.participant_name === profile.full_name
      : rec?.staff_id === profile.id || rec?.staff_name === profile.full_name);

    const unsubInc = base44.entities.Incident.subscribe((event) => {
      if (event.type === 'create' && matchesProfile(event.data)) {
        setItems((prev) => (prev.some((i) => i.id === event.data.id) ? prev : [event.data, ...prev]));
      } else if (event.type === 'update' && event.data) {
        setItems((prev) => prev.map((i) => (i.id === event.data.id ? { ...i, ...event.data } : i)));
      } else if (event.type === 'delete') {
        setItems((prev) => prev.filter((i) => i.id !== event.id));
      }
    });
    const unsubInv = base44.entities.Investigation.subscribe((event) => {
      if (event.type === 'create' && event.data) {
        setInvestigations((prev) => (prev.some((i) => i.id === event.data.id) ? prev : [event.data, ...prev]));
      } else if (event.type === 'update' && event.data) {
        setInvestigations((prev) => prev.map((i) => (i.id === event.data.id ? { ...i, ...event.data } : i)));
      } else if (event.type === 'delete') {
        setInvestigations((prev) => prev.filter((i) => i.id !== event.id));
      }
    });
    return () => { unsubInc(); unsubInv(); };
  }, [profile?.id, profile?.full_name, profileKind]);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [incPage, invPage] = await Promise.all([
        base44.entities.Incident.filter(profile ? profileKind === 'participant' ? { $or: [{ participant_id: profile.id }, { participant_name: profile.full_name }] } : { $or: [{ staff_id: profile.id }, { staff_name: profile.full_name }] } : {}, { sort: '-date_occurred', limit: 500 }),
        base44.entities.Investigation.filter({}, { sort: '-start_date', limit: 500 }),
      ]);
      setItems(incPage.items || []);
      setInvestigations(invPage.items || []);
    } catch (e) { console.error(e); setLoadError(true); }
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
    } catch (e) { toast({ title: 'Could not save incident', description: e.message, variant: 'destructive' }); }
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
    } catch (e) { toast({ title: 'Could not save investigation', description: e.message, variant: 'destructive' }); }
  };

  const saveInvestigation = async (e) => {
    e.preventDefault();
    if (!invForm.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSavingInvestigation(true);
    try {
      const payload = Object.fromEntries(Object.keys(blankInv).map((key) => [key, invForm[key] ?? blankInv[key]]));
      const rec = editingInvestigation
        ? await base44.entities.Investigation.update(editingInvestigation, payload)
        : await base44.entities.Investigation.create(payload);
      const result = await recordSafetyEvent('Investigation', rec.id, editingInvestigation ? { notify: false } : undefined);
      if (result.email_failures?.length) toast({ title: 'Investigation saved; some administrator emails failed', description: `${result.email_failures.length} email(s) could not be sent.`, variant: 'destructive' });
      toast({ title: editingInvestigation ? 'Investigation updated' : 'Investigation created' });
      setInvForm(blankInv);
      setEditingInvestigation(null);
      setShowInv(false);
      await load();
    } catch (err) { toast({ title: 'Failed to save investigation', description: err.message, variant: 'destructive' }); }
    finally { setSavingInvestigation(false); }
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
    <div className="safety-workspace mx-auto min-w-0 max-w-[1440px] space-y-4">
      <ModuleShell
        embedded={embedded}
        title="Incident Clinic"
        subtitle="Report, investigate and resolve incidents — real-time 24h / 5-day NDIS reportable tracking, investigations and exports"
        icon={AlertTriangle}
        moduleKey="incidents"
        insightModule="incidents"
        search={<ModuleSearchBar value={search} onChange={setSearch} placeholder="Search incidents..." />}
        actions={<>
          {canReview && <Button size="sm" onClick={() => { setEditingInvestigation(null); setInvForm(blankInv); setShowInv(true); }}><FileSearch className="h-4 w-4 mr-1.5" /> New Investigation</Button>}
          <Link to={profile ? `/incidents/new?${profileKind === 'participant' ? 'participantId' : 'staffId'}=${encodeURIComponent(profile.id)}` : '/incidents/new'}>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> New Incident</Button>
          </Link>
          {canReview && <Button size="sm" onClick={() => downloadIncidentReport(items)} disabled={loading || items.length === 0}><Download className="h-4 w-4 mr-1.5" /> Reports (PDF)</Button>}
        </>}
      >
      {embedded && <RegisterInsights module="incidents" />}

      {/* Standardized iPad-Style Workspace Tabs */}
      <Tabs value={screenMode} onValueChange={setScreenMode}>
        <TabsList>
          <TabsTrigger value="both" data-hint="Clinic, 24h/5d NDIS Escalation & Analytics">
            <ShieldAlert className="h-3.5 w-3.5" />
            Combined Clinic &amp; Analytics
          </TabsTrigger>
          <TabsTrigger value="clinic" data-hint="Incident Register, CAPA & Investigations">
            <AlertTriangle className="h-3.5 w-3.5" />
            Incident Clinic &amp; Register
          </TabsTrigger>
          <TabsTrigger value="analytics" data-hint="Blame-Free Safety Trends & Support Charts">
            <BarChart3 className="h-3.5 w-3.5" />
            Friendly Incident Analytics
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {(screenMode === 'analytics' || screenMode === 'both') && (
        <SectionCard
          collapsible
          defaultOpen
          title="Friendly Incident & Safety Support Analytics"
          description="User-friendly, blame-free charts and safety trends to direct support where it is needed most"
        >
          <IncidentAnalytics embedded />
        </SectionCard>
      )}

      {screenMode !== 'analytics' && (
      <div className="space-y-4">
      <div className="rounded-xl border-2 border-[#dc2626] bg-rose-50/70 p-2.5 flex flex-wrap items-center justify-between gap-2" style={{ borderTopWidth: '4px' }}>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-900">
            Section 11 — NDIS 24-Hour &amp; 5-Day Statutory Reportable Incident Escalation &amp; Closed-Loop CAPA
          </h3>
          <p className="text-[10px] font-semibold text-rose-800">
            Reportable incidents (Death, Serious Injury, Abuse/Neglect, Unlawful Contact, Sexual Misconduct, Unauthorised Restrictive Practice) require 24-hour NDIS Commission notification &amp; 5-day follow-up.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-[#dc2626] px-2.5 py-0.5 text-[10px] font-black text-white">
            {items.filter((i) => i.requires_ndis_report || i.severity === 'Critical' || i.severity === 'High').length} High/Reportable
          </span>
          {canReview && (
            <Button
              size="sm"
              disabled={Boolean(escalatingId)}
              className="h-auto min-h-9 max-w-full whitespace-normal border border-[#dc2626] bg-white text-xs font-black leading-snug text-rose-900 hover:bg-rose-100"
              onClick={() => {
                const highIncidents = items.filter((i) => (i.requires_ndis_report || i.severity === 'Critical' || i.severity === 'High') && i.status !== 'Closed');
                const target = highIncidents[0] || items[0];
                escalateIncidentClosedLoop(target);
              }}
            >
              {escalatingId ? 'Escalating…' : '1-Click Escalate Latest High/Reportable Incident (CAPA + Risk)'}
            </Button>
          )}
        </div>
      </div>

      {lastEscalatedSummary && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-50/90 px-3 py-2 text-xs font-bold text-[#0A2B6D]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
              Escalated
            </span>
            <span>
              <strong>{lastEscalatedSummary.title}</strong> linked to CAPA ({lastEscalatedSummary.priority}), Risk Register ({lastEscalatedSummary.riskRating}), and 5-Day Follow-up ({lastEscalatedSummary.fiveDayDue}).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/quality" className="rounded-md bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0072FF] shadow-2xs hover:underline">
              Open CAPA Register →
            </Link>
            <Link to="/risks" className="rounded-md bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#5A00D6] shadow-2xs hover:underline">
              Open Risk Register →
            </Link>
          </div>
        </div>
      )}

      <HealthMedicationResponse />

      <SafetyOperationsDashboard />

      <SafetyTrendsDashboard />

      <IncidentLog />

      {loadError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Incident and investigation data could not be confirmed; displayed totals may be incomplete.<Button size="sm" variant="outline" onClick={load}>Retry</Button></div>}
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
        collapsible
        defaultOpen
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    {canReview && (
                      <button
                        type="button"
                        disabled={escalatingId === inc.id}
                        onClick={() => escalateIncidentClosedLoop(inc)}
                        className="flex items-center gap-1 rounded-md border border-[#5A00D6]/40 bg-[#F5F0FF] px-2 py-1 text-[11px] font-extrabold text-[#5A00D6] hover:bg-[#EDE9FE] disabled:opacity-50"
                        title="1-Click Closed-Loop Escalation to CAPA, Quality & Risk Registers"
                      >
                        <ShieldAlert className="h-3 w-3 text-[#FF2E9A]" />
                        {escalatingId === inc.id ? 'Escalating…' : '1-Click Escalate (CAPA + Risk)'}
                      </button>
                    )}
                    {canReview && <Link to={`/incidents/${inc.id}/edit`} className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-muted">Edit all sections</Link>}
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
        collapsible
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
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => { setEditingInvestigation(inv.id); setInvForm({ ...blankInv, ...inv }); setShowInv(true); }}>Edit all sections</Button>
                    <select value={inv.status || ''} onChange={(e) => commitInv(inv, 'status', e.target.value)} className={`${fieldBase} w-auto`}>
                      {INV_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
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

      </div>
      )}

      {/* New Investigation modal */}
      {canReview && showInv && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-lg sm:max-w-2xl rounded-xl bg-card p-3 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingInvestigation ? 'Edit Investigation' : 'Add New Investigation'}</h3>
              <button onClick={() => setShowInv(false)} className="rounded p-1.5 hover:bg-muted"><X className="h-4 w-4 text-foreground/50" /></button>
            </div>
            <form onSubmit={saveInvestigation} className="compact-safety-form space-y-2">
              <Field label="Investigation Title" className="sm:col-span-2"><TextInput value={invForm.title} onChange={(e) => set('title', e.target.value)} required placeholder="e.g. Investigation - Slip incident 12 Aug" /></Field>
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
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowInv(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" disabled={savingInvestigation} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingInvestigation ? 'Saving...' : editingInvestigation ? 'Save Investigation' : 'Create Investigation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </ModuleShell>
    </div>
  );
}