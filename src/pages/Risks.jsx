import React, { useState, useEffect } from 'react';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeRiskReports from '@/components/employee/EmployeeRiskReports';
export default withEmployeeView(Risks, EmployeeRiskReports);
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { recordStatusLog, currentUserName } from '@/lib/statusLog';
import { useToast } from '@/components/ui/use-toast';
import { HeaderUnderRow } from '@/components/PageHeader';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import RegisterInsights from '@/components/RegisterInsights';
import SectionCard from '@/components/SectionCard';
import { Field, TextInput, Select, TextArea, DateInput } from '@/components/Field';
import EmptyState from '@/components/EmptyState';
import TreatmentSection from '@/components/risks/TreatmentSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRole } from '@/lib/useRole';
import { ShieldAlert, Plus, Pencil, Trash2, AlertTriangle, FileWarning, Download, FileDown, Grid3X3, CheckSquare } from 'lucide-react';
import { downloadRiskReport } from '@/lib/compliancePdf';
import { downloadTake5AssessmentPdf, downloadRiskAssessmentTemplatePdf } from '@/lib/riskTemplates';
import TemplatePicker from '@/components/TemplatePicker';
import { MITIGATION_TEMPLATES, mergeTemplateField } from '@/lib/incidentRiskTemplates';
import { recordSafetyEvent } from '@/lib/safetyEvent';
import AssessmentDuePanel from '@/components/risks/AssessmentDuePanel';
import ParticipantAssessmentRecords from '@/components/participants/ParticipantAssessmentRecords';
import CommonRiskLibrary from '@/components/risks/CommonRiskLibrary';
import TakeFiveRegister from '@/components/safety/TakeFiveRegister';
import SafetyFormsLibrary from '@/components/safety/SafetyFormsLibrary';
import SafetyRegisterExports from '@/components/safety/SafetyRegisterExports';
import { isHighCriticalRisk, isOpenRisk } from '@/lib/safetyFilters';
import { downloadCsv } from '@/lib/csvExport';
import StatusDashboard from '@/components/safety/StatusDashboard';
import Universal360ProfileFramework from '@/components/enterprise/Universal360ProfileFramework';
import { RISK_CSV_COLUMNS, HAZARD_CSV_COLUMNS } from '@/components/safety/SafetyRegisterExports';

const CATEGORIES = ['Operational', 'Clinical', 'Financial', 'Workplace Health & Safety', 'Participant', 'Compliance'];
const LIKELIHOODS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const CONSEQUENCES = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'];
const RATINGS = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Identified', 'Assessed', 'Treating', 'Monitored', 'Closed'];
const CONTROL_CATEGORIES = ['Preventative', 'Protective', 'Training & Capability', 'Policy & Procedure', 'Environmental', 'Equipment & Technology', 'Supervision & Monitoring', 'Emergency Response', 'Administrative'];

const blank = { title: '', report_type: 'Risk', risk_id: '', description: '', hazards_identified: '', risk_assessment: '', control_measures: '', category: 'Operational', likelihood: 'Possible', consequence: 'Moderate', rating: 'Medium', status: 'Identified', owner: '', mitigation_plan: '', control_measure_category: 'Preventative', elimination_actions: '', minimise_actions: '', isolate_actions: '', staff_training_controls: '', compliance_controls: '', review_date: '', identified_date: '', assessment_type: 'Not scheduled', last_assessed_date: '', next_due_date: '', action_log: '' };

// 5x5 matrix cell rating
function cellRating(l, c) {
  const li = LIKELIHOODS.indexOf(l) + 1;
  const ci = CONSEQUENCES.indexOf(c) + 1;
  const score = li * ci;
  if (score <= 4) return 'Low';
  if (score <= 9) return 'Medium';
  if (score <= 15) return 'High';
  return 'Critical';
}

const ratingColor = { Low: 'bg-safe/15 text-safe', Medium: 'bg-warning/15 text-warning', High: 'bg-orange-500/15 text-orange-600', Critical: 'bg-danger/15 text-danger' };
const matrixCell = {
  Low: 'bg-green-200 text-green-950',
  Medium: 'bg-yellow-300 text-yellow-950',
  High: 'bg-orange-400 text-orange-950',
  Critical: 'bg-red-500 text-red-950',
};

function Risks({ profile, profileKind, embedded = false } = {}) {
  const [searchParams] = useSearchParams();
  const { can } = useRole();
  const { toast } = useToast();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [ratingFilter, setRatingFilter] = useState(searchParams.get('rating') === 'high-critical' ? 'High / Critical' : 'All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') === 'open' ? 'Open' : 'All');
  const [issueFilter, setIssueFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [riskTab, setRiskTab] = useState('register');

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const query = profile ? profileKind === 'participant' ? { $or: [{ participant_id: profile.id }, { participant_name: profile.full_name }] } : { owner: profile.full_name } : {};
      const page = await base44.entities.Risk.filter(query, { sort: '-identified_date', limit: 500 });
      setRisks(page.items || []);
    } catch (e) { console.error(e); setLoadError(true); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const matchesProfile = (rec) => !profile || (profileKind === 'participant'
      ? rec?.participant_id === profile.id || rec?.participant_name === profile.full_name
      : rec?.owner === profile.full_name);

    const unsub = base44.entities.Risk.subscribe((event) => {
      if (event.type === 'create' && event.data && matchesProfile(event.data)) {
        setRisks((prev) => (prev.some((r) => r.id === event.data.id) ? prev : [event.data, ...prev]));
      } else if (event.type === 'update' && event.data) {
        setRisks((prev) => prev.map((r) => (r.id === event.data.id ? { ...r, ...event.data } : r)));
      } else if (event.type === 'delete') {
        setRisks((prev) => prev.filter((r) => r.id !== event.id));
      }
    });
    return unsub;
  }, [profile?.id, profile?.full_name, profileKind]);
  useEffect(() => {
    if (window.location.hash !== '#risk-register') return;
    const timer = window.setTimeout(() => document.getElementById('risk-register')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const applyMitigationTemplate = (t) => {
    setForm((f) => ({
      ...f,
      elimination_actions: mergeTemplateField(f.elimination_actions, t.elimination_actions),
      minimise_actions: mergeTemplateField(f.minimise_actions, t.minimise_actions),
      isolate_actions: mergeTemplateField(f.isolate_actions, t.isolate_actions),
      staff_training_controls: mergeTemplateField(f.staff_training_controls, t.staff_training_controls),
      compliance_controls: mergeTemplateField(f.compliance_controls, t.compliance_controls),
    }));
    toast({ title: `Loaded "${t.name}" template` });
  };

  const openNew = () => { setEditing('new'); setForm({ ...blank, report_type: 'Risk' }); };
  const openEdit = (r) => { setEditing(r.id); setForm({ ...blank, ...r, report_type: r.report_type || (r.title?.startsWith('Hazard: ') ? 'Hazard' : r.title?.startsWith('Near Miss: ') ? 'Near Miss' : 'Risk') }); };
  const openReport = (type) => {
    const today = new Date().toISOString().slice(0, 10);
    if (type === 'hazard') {
      setForm({ ...blank, report_type: 'Hazard', title: 'Hazard: ', category: 'Workplace Health & Safety', control_measure_category: 'Environmental', status: 'Identified', identified_date: today, description: 'Hazard observed:\nLocation:\nReported by:' });
    } else {
      setForm({ ...blank, report_type: 'Near Miss', title: 'Near Miss: ', category: 'Workplace Health & Safety', control_measure_category: 'Preventative', status: 'Identified', identified_date: today, description: 'Near miss description:\nWhat almost happened:\nContributing factors:\nReported by:' });
    }
    setEditing('new');
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    const payload = { ...form, rating: cellRating(form.likelihood, form.consequence), ...(profileKind === 'participant' ? { participant_id: profile.id, participant_name: profile.full_name } : profile ? { owner: profile.full_name } : {}) };
    const previous = risks.find((risk) => risk.id === editing);
    const scheduleChanged = previous && (previous.assessment_type !== payload.assessment_type || previous.last_assessed_date !== payload.last_assessed_date);
    if (payload.assessment_type !== 'Not scheduled' && payload.last_assessed_date && (!payload.next_due_date || (scheduleChanged && payload.next_due_date === previous.next_due_date))) {
      const next = new Date(`${payload.last_assessed_date}T00:00:00`);
      const originalDay = next.getDate();
      next.setDate(1);
      next.setMonth(next.getMonth() + (payload.assessment_type === 'Home' ? 1 : 3));
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(originalDay, lastDay));
      payload.next_due_date = next.toISOString().slice(0, 10);
    }
    try {
      let rec;
      if (editing === 'new') {
        rec = await base44.entities.Risk.create(payload);
        const result = await recordSafetyEvent('Risk', rec.id);
        if (result.email_failures?.length) toast({ title: 'Record saved; some administrator emails failed', description: `${result.email_failures.length} email(s) could not be sent.`, variant: 'destructive' });
      } else {
        rec = await base44.entities.Risk.update(editing, payload);
        await recordSafetyEvent('Risk', editing, { notify: false });
      }
      toast({ title: `${payload.report_type} saved` });
      setEditing(null); load();
    } catch (err) { toast({ title: 'Failed to save', description: err.message, variant: 'destructive' }); }
  };

  const remove = async (r) => {
    if (!confirm(`Delete "${r.title}"?`)) return;
    try {
      await base44.entities.Risk.delete(r.id);
      toast({ title: 'Risk deleted' });
      load();
    } catch (err) { toast({ title: 'Delete failed', description: err.message, variant: 'destructive' }); }
  };

  const changeRiskStatus = async (r, status) => {
    if (r.status === status) return;
    try {
      await base44.entities.Risk.update(r.id, { status });
      await recordSafetyEvent('Risk', r.id, { notify: false });
      recordStatusLog('Risk', { id: r.id, title: r.title || r.hazard || '', status: r.status }, status, await currentUserName().catch(() => ''), 'Immutable status trail').catch(() => {});
      setRisks((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
      toast({ title: `Risk moved to ${status}` });
    } catch (err) { toast({ title: 'Status change failed', description: err.message, variant: 'destructive' }); }
  };

  const exportHazards = () => {
    const hazards = risks.filter((r) => r.report_type === 'Hazard' || r.report_type === 'Near Miss' || (!r.report_type && r.title?.startsWith('Hazard: ')));
    if (!hazards.length) { toast({ title: 'No hazards to export' }); return; }
    downloadCsv('Hazard Register.csv', HAZARD_CSV_COLUMNS, hazards);
    toast({ title: 'Hazard register exported' });
  };

  const exportControls = () => {
    if (!risks.length) { toast({ title: 'No controls to export' }); return; }
    downloadCsv(
      'Staff Training & Compliance Controls.csv',
      [
        { key: 'risk_id', label: 'Risk ID' }, { key: 'title', label: 'Risk / Hazard' }, { key: 'report_type', label: 'Report Type' },
        { key: 'category', label: 'Category' }, { key: 'rating', label: 'Risk Rating' }, { key: 'status', label: 'Status' },
        { key: 'owner', label: 'Owner' }, { key: 'staff_training_controls', label: 'Staff Training Controls' },
        { key: 'compliance_controls', label: 'Compliance Controls' },
      ],
      risks,
    );
    toast({ title: 'Training & compliance controls exported' });
  };

  const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  risks.forEach((r) => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
  const filteredRisks = risks.filter((risk) => {
    const ratingMatches = ratingFilter === 'All'
      || (ratingFilter === 'High / Critical' ? isHighCriticalRisk(risk) : risk.rating === ratingFilter);
    const statusMatches = statusFilter === 'All'
      || (statusFilter === 'Open' ? isOpenRisk(risk) : risk.status === statusFilter);
    const folderMatches = issueFilter === 'All'
      || (issueFilter === 'Issues and Concerns' ? risk.source_entity_type === 'Issue or Concern Report' : true);
    const searchMatches = !query.trim() || [risk.title, risk.risk_id, risk.category, risk.owner, risk.status].some((f) => (f || '').toLowerCase().includes(query.trim().toLowerCase()));
    return ratingMatches && statusMatches && folderMatches && searchMatches;
  });

  const btn = 'flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/80 disabled:opacity-50';
  const actionRow = can('risks') && (
    <>
      <button onClick={openNew} className={btn}><Plus className="h-4 w-4" />Add Risk Report</button>
      <button onClick={() => openReport('hazard')} className={btn}><AlertTriangle className="h-4 w-4" />Report Hazard</button>
      <button onClick={() => openReport('nearmiss')} className={btn}><FileWarning className="h-4 w-4" />Report Near Miss</button>
      <button onClick={() => downloadTake5AssessmentPdf()} className={btn}><FileDown className="h-4 w-4" />Take 5 Risk Assessment</button>
      <button onClick={() => downloadRiskAssessmentTemplatePdf()} className={btn}><FileDown className="h-4 w-4" />Risk Assessment Template</button>
      <button onClick={() => downloadRiskReport(risks)} disabled={loading || risks.length === 0} className={btn}><Download className="h-4 w-4" />Download PDF</button>
    </>
  );
  const tiles = RATINGS.map((r) => (
    <div key={r}>
      <div className="text-2xl font-bold tabular-nums">{counts[r]}</div>
      <div className="text-xs font-medium">{r} Risk Report</div>
    </div>
  ));

  return (
    <div className="safety-workspace mx-auto min-w-0 max-w-[1440px] space-y-4">
      {loadError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Risk data could not be confirmed; displayed totals may be incomplete.<button type="button" onClick={load} className="rounded border px-3 py-1">Retry</button></div>}
      {embedded ? (
        <>
          <RegisterInsights module="risks" />
          {actionRow && <HeaderUnderRow>{actionRow}</HeaderUnderRow>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles}</div>
        </>
      ) : (
        <ModuleShell
          title="Risk Management"
          subtitle={`${risks.length} risk reports in register — 5×5 matrix, monthly Home & 3-monthly Individual review cycles`}
          icon={ShieldAlert}
          moduleKey="risks"
          insightModule="risks"
          search={<ModuleSearchBar value={query} onChange={setQuery} placeholder="Search risks…" />}
          actions={actionRow || undefined}
          small={tiles}
        />
      )}

      {/* Standardized iPad-Style Risk Workspace Tabs */}
      <Tabs value={riskTab} onValueChange={setRiskTab}>
        <TabsList>
          <TabsTrigger value="all" data-hint="5×5 Matrix, Registers, Take 5 & Controls">
            <ShieldAlert className="h-3.5 w-3.5" />
            All Risk Workspaces
          </TabsTrigger>
          <TabsTrigger value="register" data-hint="Live 5×5 Matrix, Status & Risk Register">
            <Grid3X3 className="h-3.5 w-3.5" />
            Risk Matrix &amp; Register
          </TabsTrigger>
          <TabsTrigger value="hazards" data-hint="Hazards, Near Misses & Take 5 Checks">
            <AlertTriangle className="h-3.5 w-3.5" />
            Hazards &amp; Take 5
          </TabsTrigger>
          <TabsTrigger value="controls" data-hint="Eliminate, Minimise, Isolate & Due Dates">
            <CheckSquare className="h-3.5 w-3.5" />
            Controls &amp; Review Cycles
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {profileKind === 'participant' && profile && <ParticipantAssessmentRecords participant={profile} />}

      <div className="rounded-xl border-2 border-[#ea580c] bg-orange-50/70 p-2.5 flex flex-wrap items-center justify-between gap-2" style={{ borderTopWidth: '4px' }}>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-orange-900">
            Section 11 — 5×5 Inherent &amp; Residual Risk Governance (Eliminate · Minimise · Isolate · Training · Compliance)
          </h3>
          <p className="text-[10px] font-semibold text-orange-800">
            High and Critical risks automatically link to Individual (3-monthly) and Home (monthly) review schedules and closed-loop Continuous Improvement actions.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-[#ea580c] px-2.5 py-0.5 text-[10px] font-black text-white">
            {counts.High + counts.Critical} High / Critical Risks
          </span>
        </div>
      </div>

      {(riskTab === 'all' || riskTab === 'register') && (
        <>
          <Universal360ProfileFramework initialType="risk" compact />
          <CommonRiskLibrary onAdded={load} />
        </>
      )}

      {(riskTab === 'all' || riskTab === 'hazards') && (
        <>
          <TakeFiveRegister />
          <SafetyFormsLibrary types={['Risk Assessment', 'Hazard Report', 'Near Miss Report', 'Take Five Assessment', 'Individual Risk Assessment', 'Daily Vehicle Check', 'Home Risk Assessment']} />
        </>
      )}

      {(riskTab === 'all' || riskTab === 'register') && (
        <>
          <SafetyRegisterExports risks={risks} />

          {/* Changeable status dashboard */}
          <StatusDashboard
            title="Risk Status Dashboard"
            description="Every risk and its current status — change a status here and the register updates"
            records={risks}
            statuses={STATUSES}
            subField="risk_id"
            disabled={!can('risks')}
            onChange={changeRiskStatus}
            onExport={() => {
              if (!risks.length) { toast({ title: 'No risks to export' }); return; }
              downloadCsv('Risk Register.csv', RISK_CSV_COLUMNS, risks);
              toast({ title: 'Risk register exported' });
            }}
            emptyTitle="No risks recorded"
          />
        </>
      )}

      {/* Individual (3-monthly) and home (monthly) assessment due tracking */}
      {(riskTab === 'all' || riskTab === 'controls') && (
        <AssessmentDuePanel
          risks={risks}
          onEdit={openEdit}
          canEdit={can('risks')}
          onUpdate={async (risk, patch) => {
            await base44.entities.Risk.update(risk.id, patch);
            toast({ title: 'Assessment logged; next due date set' });
            load();
          }}
        />
      )}

      {/* Hazard Register - live updates as hazards are entered */}
      {(riskTab === 'all' || riskTab === 'hazards') && <SectionCard
        collapsible
        title="Hazard Register"
        description="Hazards reported via the Report Hazard button"
        action={
          <div className="flex items-center gap-2">
            <button onClick={exportHazards} className="flex items-center gap-1.5 rounded-lg bg-warning/15 px-3 py-1.5 text-xs font-semibold text-warning hover:bg-warning/25"><Download className="h-3.5 w-3.5" />Export CSV</button>
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">{risks.filter((r) => r.report_type === 'Hazard' || r.report_type === 'Near Miss' || (!r.report_type && r.title?.startsWith('Hazard: '))).length} entries</span>
          </div>
        }
      >
        {(() => {
          const hazards = risks.filter((r) => r.report_type === 'Hazard' || r.report_type === 'Near Miss' || (!r.report_type && r.title?.startsWith('Hazard: ')));
          if (loading) return <div className="py-8 text-center text-sm text-foreground/40">Loading...</div>;
          if (hazards.length === 0) return <EmptyState icon={AlertTriangle} title="No hazards reported" subtitle="Click 'Report Hazard' to log a hazard — it will appear here instantly." />;
          return (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand/20 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent text-left text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
                    <th className="px-3 py-2 font-medium">Hazard</th>
                    <th className="px-3 py-2 font-medium">Location / Details</th>
                    <th className="px-3 py-2 font-medium">Date Identified</th>
                    <th className="px-3 py-2 font-medium">Rating</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    {can('risks') && <th className="px-3 py-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {hazards.map((r) => (
                    <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-3 py-2.5"><div className="font-medium">{r.title}</div>{r.risk_id && <div className="text-xs text-foreground/40">{r.risk_id}</div>}</td>
                      <td className="px-3 py-2.5 text-foreground/60 text-xs max-w-xs"><div className="line-clamp-2 whitespace-pre-wrap">{r.description || '—'}</div></td>
                      <td className="px-3 py-2.5 text-foreground/60 text-xs">{r.identified_date || '—'}</td>
                      <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ratingColor[r.rating]}`}>{r.rating}</span></td>
                      <td className="px-3 py-2.5 text-foreground/60">{r.status}</td>
                      {can('risks') && (
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(r)} aria-label="Edit risk" className="rounded p-1.5 hover:bg-brand/10"><Pencil className="h-4 w-4 text-foreground/50" /></button>
                            <button onClick={() => remove(r)} aria-label="Delete risk" className="rounded p-1.5 hover:bg-danger/10"><Trash2 className="h-4 w-4 text-danger" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </SectionCard>}

      {/* Risk Matrix */}
      {(riskTab === 'all' || riskTab === 'register') && <SectionCard title="Risk Matrix" description="Likelihood × Consequence — the number in each cell shows how many risks sit at that score">
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">
            <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-1">
              <div />
              {CONSEQUENCES.map((c, i) => (
                <div key={c} className="rounded-md bg-muted/60 px-1 py-1.5 text-center">
                  <div className="text-[10px] font-bold text-foreground/40">{i + 1}</div>
                  <div className="text-[10px] font-semibold text-foreground/70">{c}</div>
                </div>
              ))}
            </div>
            {LIKELIHOODS.slice().reverse().map((l, li) => {
              const likelihoodScore = LIKELIHOODS.length - li;
              return (
                <div key={l} className="mt-1 grid grid-cols-[120px_repeat(5,1fr)] gap-1">
                  <div className="flex flex-col items-end justify-center rounded-md bg-muted/60 px-2 py-1.5 text-right">
                    <div className="text-[10px] font-bold text-foreground/40">{likelihoodScore}</div>
                    <div className="text-[10px] font-semibold text-foreground/70">{l}</div>
                  </div>
                  {CONSEQUENCES.map((c) => {
                    const ci = CONSEQUENCES.indexOf(c);
                    const rating = cellRating(l, c);
                    const score = likelihoodScore * (ci + 1);
                    const count = risks.filter((r) => r.likelihood === l && r.consequence === c).length;
                    return (
                      <div key={c} className={`flex h-14 flex-col items-center justify-center rounded-md ${matrixCell[rating]}`}>
                        <span className="text-[11px] font-bold">{count > 0 ? count : ''}</span>
                        <span className="text-[9px] font-semibold opacity-70">{score} · {rating}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Legend</span>
              {RATINGS.map((r) => (
                <div key={r} className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${matrixCell[r]}`}>{r}</div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>}

      {/* Risk register */}
      {(riskTab === 'all' || riskTab === 'register') && <SectionCard
        id="risk-register"
        collapsible
        title="Risk Register"
        description={`Displaying ${filteredRisks.length} of ${risks.length} risk reports`}
        action={(
          <div className="module-filter-bar flex flex-wrap">
            <select value={issueFilter} onChange={(event) => setIssueFilter(event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold">
              <option>All</option>
              <option>Issues and Concerns</option>
            </select>
            <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold">
              <option>All</option>
              <option>High / Critical</option>
              {RATINGS.map((rating) => <option key={rating}>{rating}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold">
              <option>All</option>
              <option>Open</option>
              {STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        )}
      >
        {loading ? (
          <div className="py-8 text-center text-sm text-foreground/40">Loading...</div>
        ) : filteredRisks.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No risks match these filters" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand/20 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent text-left text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Control Measure</th>
                  <th className="px-3 py-2 font-medium">L × C</th>
                  <th className="px-3 py-2 font-medium">Rating</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  {can('risks') && <th className="px-3 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="px-3 py-2.5"><div className="font-medium">{r.title}</div>{r.risk_id && <div className="text-xs text-foreground/40">{r.risk_id}</div>}</td>
                    <td className="px-3 py-2.5 text-foreground/60">{r.category}</td>
                    <td className="px-3 py-2.5 text-foreground/60 text-xs">{r.control_measure_category || '—'}</td>
                    <td className="px-3 py-2.5 text-foreground/60 text-xs">{r.likelihood} / {r.consequence}</td>
                    <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ratingColor[r.rating]}`}>{r.rating}</span></td>
                    <td className="px-3 py-2.5 text-foreground/60">{r.owner || '—'}</td>
                    <td className="px-3 py-2.5 text-foreground/60">{r.status}</td>
                    {can('risks') && (
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(r)} aria-label="Edit risk" className="rounded p-1.5 hover:bg-brand/10"><Pencil className="h-4 w-4 text-foreground/50" /></button>
                          <button onClick={() => remove(r)} aria-label="Delete risk" className="rounded p-1.5 hover:bg-danger/10"><Trash2 className="h-4 w-4 text-danger" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>}

      {(riskTab === 'all' || riskTab === 'controls') && (
        <>
          {/* Elimination section */}
          <TreatmentSection
            type="elimination"
            title="Elimination Strategies"
            description="Hierarchy of controls - eliminate the hazard entirely"
            field="elimination_actions"
            risks={risks}
            loading={loading}
            canEdit={can('risks')}
            onEdit={openEdit}
          />

          {/* Minimise section */}
          <TreatmentSection
            type="minimise"
            title="Minimise Strategies"
            description="Hierarchy of controls - reduce likelihood and severity"
            field="minimise_actions"
            risks={risks}
            loading={loading}
            canEdit={can('risks')}
            onEdit={openEdit}
          />

          {/* Isolate section */}
          <TreatmentSection
            type="isolate"
            title="Isolate Strategies"
            description="Hierarchy of controls - separate people from the hazard"
            field="isolate_actions"
            risks={risks}
            loading={loading}
            canEdit={can('risks')}
            onEdit={openEdit}
          />

          {/* Staff Training & Compliance Controls */}
          <SectionCard
            collapsible
            title="Staff Training & Compliance Controls"
        description="Training and compliance controls recorded against each risk"
        action={
          <div className="flex items-center gap-2">
            <button onClick={exportControls} className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal/90"><Download className="h-3.5 w-3.5" />Export CSV</button>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/60">{risks.length} records</span>
          </div>
        }
      >
        {loading ? (
          <div className="py-8 text-center text-sm text-foreground/40">Loading...</div>
        ) : risks.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No risks recorded" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand/20 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent text-left text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Staff Training Controls</th>
                  <th className="px-3 py-2 font-medium">Compliance Controls</th>
                  {can('risks') && <th className="px-3 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30 align-top">
                    <td className="px-3 py-2.5"><div className="font-medium">{r.title}</div>{r.risk_id && <div className="text-xs text-foreground/40">{r.risk_id}</div>}</td>
                    <td className="px-3 py-2.5 text-foreground/60 text-xs">{r.category}</td>
                    <td className="px-3 py-2.5 text-foreground/70 text-xs max-w-xs"><div className="whitespace-pre-wrap">{r.staff_training_controls || '—'}</div></td>
                    <td className="px-3 py-2.5 text-foreground/70 text-xs max-w-xs"><div className="whitespace-pre-wrap">{r.compliance_controls || '—'}</div></td>
                    {can('risks') && (
                      <td className="px-3 py-2.5 text-right">
                        <button onClick={() => openEdit(r)} aria-label="Edit risk" className="rounded p-1.5 hover:bg-brand/10"><Pencil className="h-4 w-4 text-foreground/50" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-lg sm:max-w-2xl rounded-xl bg-card p-3 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-2 text-base font-semibold">{editing === 'new' ? 'Add Risk' : 'Edit Risk'}</h3>
            <form onSubmit={save} className="compact-safety-form space-y-2">
              <Field label="Risk Title" className="sm:col-span-2"><TextInput value={form.title} onChange={(e) => set('title', e.target.value)} required /></Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Report Type"><Select value={form.report_type || 'Risk'} onChange={(e) => set('report_type', e.target.value)}><option value="Risk">Risk Report</option><option value="Hazard">Hazard</option><option value="Near Miss">Near Miss</option></Select></Field>
                <Field label="Risk ID"><TextInput value={form.risk_id || ''} onChange={(e) => set('risk_id', e.target.value)} /></Field>
              </div>
              <Field label="Description" className="sm:col-span-2"><TextArea value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></Field>
              <Field label="Risks / Hazards Identified"><TextArea value={form.hazards_identified || ''} onChange={(e) => set('hazards_identified', e.target.value)} /></Field>
              <Field label="Risk Assessment"><TextArea value={form.risk_assessment || ''} onChange={(e) => set('risk_assessment', e.target.value)} placeholder="Who may be harmed, existing controls, likelihood, consequence and rating" /></Field>
              <Field label="Control Measures"><TextArea value={form.control_measures || ''} onChange={(e) => set('control_measures', e.target.value)} placeholder="Controls, responsible person, due date and monitoring arrangements" /></Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Category"><Select value={form.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
                <Field label="Owner"><TextInput value={form.owner || ''} onChange={(e) => set('owner', e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Likelihood"><Select value={form.likelihood} onChange={(e) => set('likelihood', e.target.value)}>{LIKELIHOODS.map((l) => <option key={l}>{l}</option>)}</Select></Field>
                <Field label="Consequence"><Select value={form.consequence} onChange={(e) => set('consequence', e.target.value)}>{CONSEQUENCES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-foreground/60">Auto-calculated rating: <span className="font-semibold">{cellRating(form.likelihood, form.consequence)}</span></div>
              <Field label="Status"><Select value={form.status} onChange={(e) => set('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="Mitigation Plan"><TextArea value={form.mitigation_plan || ''} onChange={(e) => set('mitigation_plan', e.target.value)} /></Field>
              <Field label="Control Measure Category"><Select value={form.control_measure_category || 'Preventative'} onChange={(e) => set('control_measure_category', e.target.value)}>{CONTROL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-[11px] font-semibold text-foreground/60">Common risk mitigation actions</div>
                <TemplatePicker label="Load template" templates={MITIGATION_TEMPLATES} onApply={applyMitigationTemplate} />
              </div>
              <Field label="Elimination Actions (remove the hazard entirely)"><TextArea value={form.elimination_actions || ''} onChange={(e) => set('elimination_actions', e.target.value)} placeholder="Actions to eliminate the risk - remove hazard, discontinue activity, redesign process..." /></Field>
              <Field label="Minimise Actions (reduce likelihood/severity)"><TextArea value={form.minimise_actions || ''} onChange={(e) => set('minimise_actions', e.target.value)} placeholder="Actions to minimise the risk - reduce exposure, training, controls, frequency..." /></Field>
              <Field label="Isolate Actions (separate from hazard)"><TextArea value={form.isolate_actions || ''} onChange={(e) => set('isolate_actions', e.target.value)} placeholder="Actions to isolate the risk - barriers, separation, restricted access, relocation..." /></Field>
              <Field label="Staff Training Controls (training & capability)"><TextArea value={form.staff_training_controls || ''} onChange={(e) => set('staff_training_controls', e.target.value)} placeholder="Mandatory training, competency assessment, refresher schedule, supervisor sign-off..." /></Field>
              <Field label="Compliance Controls (policy & standards)"><TextArea value={form.compliance_controls || ''} onChange={(e) => set('compliance_controls', e.target.value)} placeholder="NDIS Practice Standards, Code of Conduct, policy alignment, audit & record-keeping..." /></Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Date Identified"><DateInput value={form.identified_date || ''} onChange={(e) => set('identified_date', e.target.value)} /></Field>
                <Field label="Review Date"><DateInput value={form.review_date || ''} onChange={(e) => set('review_date', e.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Assessment Schedule"><Select value={form.assessment_type || 'Not scheduled'} onChange={(e) => set('assessment_type', e.target.value)}><option value="Not scheduled">Not scheduled</option><option value="Individual">Individual (every 3 months)</option><option value="Home">Home (every month)</option></Select></Field>
                <Field label="Last Assessed"><DateInput value={form.last_assessed_date || ''} onChange={(e) => set('last_assessed_date', e.target.value)} /></Field>
                <Field label="Next Due Date"><DateInput value={form.next_due_date || ''} onChange={(e) => set('next_due_date', e.target.value)} /></Field>
              </div>
              <Field label="Action Log"><TextArea value={form.action_log || ''} onChange={(e) => set('action_log', e.target.value)} /></Field>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button><button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}