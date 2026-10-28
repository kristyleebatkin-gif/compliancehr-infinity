import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Heart, ShieldAlert, AlertTriangle, ShieldCheck, ClipboardCheck,
  FolderOpen, Truck, Sparkles, CheckCircle2, ArrowRight, RefreshCw,
  GitBranch, Clock, FileCheck2, Zap, Layers, Lock, Play, PlusCircle,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 16%, #5A00D6 40%, #A100FF 68%, #FF2E9A 100%)';

export const UNIVERSAL_19_SECTIONS = [
  'Overview',
  'Status',
  'Ownership',
  'Related People',
  'Related Risks',
  'Related Incidents',
  'Related Reviews',
  'Related Assessments',
  'Related Audits',
  'Related Actions',
  'Related Goals',
  'Related Communications',
  'Related Documents',
  'Related Evidence',
  'Related Standards',
  'Compliance Mapping',
  'Timeline',
  'Audit Trail',
  'AI Insights',
];

export const MASTER_12_WORKFLOW_STEPS = [
  { step: 1, label: 'Create', desc: 'Single-entry capture with mandatory metadata & owner' },
  { step: 2, label: 'Validate', desc: '19-point data quality & duplicate gate' },
  { step: 3, label: 'Assign', desc: 'Role-matched owner, reviewer & SLA deadline' },
  { step: 4, label: 'Assess', desc: '5×5 ISO 31000 risk & clinical/NDIS impact check' },
  { step: 5, label: 'Review', desc: 'Supervisor / Compliance Manager quality review' },
  { step: 6, label: 'Action', desc: 'Corrective & preventive action execution' },
  { step: 7, label: 'Verify', desc: 'Independent verification & dual sign-off' },
  { step: 8, label: 'Evidence', desc: '5-point evidence stamp & Vault + Safe lock' },
  { step: 9, label: 'Report', desc: 'Executive, Board, NDIS & Aged Care reporting' },
  { step: 10, label: 'Audit', desc: '356-checkpoint NDIS & Aged Care audit trace' },
  { step: 11, label: 'Improve', desc: 'Continuous improvement register & lessons learned' },
  { step: 12, label: 'Close', desc: 'System-verified closure & next review scheduled' },
];

export const MASTER_14_AUTOMATION_OUTPUTS = [
  'Create Tasks',
  'Create Reviews',
  'Create Assessments',
  'Create Notifications',
  'Create Reminders',
  'Create Escalations',
  'Update Compliance Mapping',
  'Update Evidence Mapping',
  'Update Related Records',
  'Update Dashboards',
  'Update Reports',
  'Update Readiness Scores',
  'Update Organisation Health',
  'Update AI Recommendations',
];

export const PROFILE_360_TYPES = [
  {
    id: 'employee',
    label: 'Employee 360° Profile',
    shortLabel: 'Employee 360°',
    icon: Users,
    route: '/our-employees',
    tone: '#0072FF',
    fields: [
      'Personal Information', 'Employment Information', 'Recruitment', 'References',
      'Police Checks', 'NDIS Screening', 'Working With Children Checks', 'Qualifications',
      'Certifications', 'Induction', 'Policies', 'Procedures', 'Training', 'Competencies',
      'Skills Matrix', 'Skill Assessments', 'Performance Reviews', 'Supervision',
      'Development Plans', 'Career Pathway', 'Succession Planning', 'Goals', 'Goal Progress',
      'Rosters', 'Shifts', 'Leave', 'Risks', 'Incidents', 'Complaints', 'Communications',
      'Notes', 'Meetings', 'Documents', 'Evidence', 'Audits', 'Reviews', 'Actions',
      'Compliance Status', 'Workforce Readiness Score', 'AI Summary', 'Audit History',
    ],
  },
  {
    id: 'participant',
    label: 'Participant 360° Profile',
    shortLabel: 'Participant 360°',
    icon: Heart,
    route: '/our-participants',
    tone: '#FF2E9A',
    fields: [
      'Referral', 'Intake', 'Consents', 'Assessments', 'Risk Assessments', 'Support Plans',
      'Service Agreements', 'Goals', 'Goal Progress', 'Reviews', 'Risks', 'Incidents',
      'Complaints', 'Family Engagement', 'Communications', 'Documents', 'Evidence',
      'Outcomes', 'Actions', 'Compliance Status', 'Readiness Score', 'AI Summary', 'Audit Trail',
    ],
  },
  {
    id: 'risk',
    label: 'Risk 360° Profile',
    shortLabel: 'Risk 360°',
    icon: ShieldAlert,
    route: '/risks',
    tone: '#5A00D6',
    fields: [
      'Risk Information', 'Risk Level', 'Risk Rating', 'Controls', 'Treatments', 'Reviews',
      'Incidents', 'Related People', 'Related Standards', 'Assessments', 'Audits',
      'Corrective Actions', 'Improvements', 'Evidence', 'Documents', 'AI Analysis', 'Audit Trail',
      'Strategic Risks', 'Operational Risks', 'Workforce Risks', 'Participant Risks',
      'Financial Risks', 'Governance Risks', 'Privacy Risks', 'Compliance Risks',
      'Cyber Risks', 'WHS Risks', 'Clinical Risks', 'Reputational Risks',
    ],
  },
  {
    id: 'incident',
    label: 'Incident 360° Profile',
    shortLabel: 'Incident 360°',
    icon: AlertTriangle,
    route: '/incidents',
    tone: '#FF2E9A',
    fields: [
      'Incident Details', 'Classification', 'Severity', 'Involved Participants',
      'Involved Employees', 'Evidence', 'Investigation', 'Root Cause Analysis',
      'Corrective Actions', 'Preventive Actions', 'Improvements', 'Related Risks',
      'Related Standards', 'Related Audits', 'Related Documents', 'AI Investigation Summary',
      'Audit Trail',
    ],
  },
  {
    id: 'standard',
    label: 'Compliance Standard 360° Profile',
    shortLabel: 'Standard 360°',
    icon: ShieldCheck,
    route: '/compliance',
    tone: '#0A2B6D',
    fields: [
      'Standard Information', 'Requirements', 'Compliance Score', 'Readiness Score',
      'Evidence Coverage', 'Policies', 'Procedures', 'Work Instructions', 'Training',
      'Assessments', 'Reviews', 'Risks', 'Incidents', 'Audits', 'Findings',
      'Corrective Actions', 'Preventive Actions', 'Improvements', 'Related Reports',
      'Compliance Timeline', 'AI Compliance Analysis',
    ],
  },
  {
    id: 'audit',
    label: 'Audit 360° Profile',
    shortLabel: 'Audit 360°',
    icon: ClipboardCheck,
    route: '/auditor-portal',
    tone: '#0072FF',
    fields: [
      'Audit Overview', 'Scope', 'Standards', 'Evidence', 'Findings', 'Corrective Actions',
      'Verification', 'Improvements', 'Related Risks', 'Related Incidents', 'Related Reviews',
      'Related Documents', 'Readiness Status', 'AI Audit Summary', 'Audit History',
    ],
  },
  {
    id: 'document',
    label: 'Document 360° Profile',
    shortLabel: 'Document 360°',
    icon: FolderOpen,
    route: '/documents',
    tone: '#5A00D6',
    fields: [
      'Document Information', 'Owner', 'Status', 'Version', 'Review Date',
      'Related Standards', 'Related Policies', 'Related Procedures', 'Related Reviews',
      'Related Risks', 'Related Incidents', 'Related Audits', 'Related Actions',
      'Approval Workflow', 'Audit Trail',
    ],
  },
  {
    id: 'supplier',
    label: 'Supplier 360° Profile',
    shortLabel: 'Supplier 360°',
    icon: Truck,
    route: '/procurement',
    tone: '#0A2B6D',
    fields: [
      'Supplier Information', 'Contracts', 'Insurance', 'Certifications', 'Compliance',
      'Risks', 'Reviews', 'Assessments', 'Incidents', 'Documents', 'Actions',
      'Audit History', 'AI Summary',
    ],
  },
];

export default function Universal360ProfileFramework({
  initialType = 'employee',
  focusRecord = null,
  compact = false,
}) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState(initialType);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(8);
  const [runningAutomation, setRunningAutomation] = useState(false);
  const [liveRecords, setLiveRecords] = useState({
    employee: [],
    participant: [],
    risk: [],
    incident: [],
    standard: [],
    audit: [],
    document: [],
    supplier: [],
  });
  const [selectedRecordIdx, setSelectedRecordIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadStates, setLoadStates] = useState({});
  const [actionResult, setActionResult] = useState(null);
  const actionLock = useRef(false);
  const completedActions = useRef(new Set());

  const load360Data = useCallback(async () => {
    setLoading(true);
    try {
      const types = ['employee', 'participant', 'risk', 'incident', 'standard', 'audit', 'document', 'supplier'];
      const entities = ['StaffProfile', 'ParticipantProfile', 'Risk', 'Incident', 'Policy', 'InternalAudit', 'EmployeeDocument', 'Supplier'];
      const results = await Promise.allSettled(entities.map((entity) =>
        Promise.resolve().then(() => base44.entities[entity].filter({}, { sort: '-created_date', limit: 8 }))
      ));
      const states = {};
      const responses = results.map((result, index) => {
        if (result.status === 'rejected') {
          const status = result.reason?.status ?? result.reason?.response?.status;
          states[types[index]] = status === 401 || status === 403 ? 'denied' : 'error';
          return { items: [] };
        }
        const value = result.value;
        const items = Array.isArray(value) ? value : value?.items;
        if (!Array.isArray(items)) {
          states[types[index]] = 'error';
          return { items: [] };
        }
        states[types[index]] = items.length ? 'loaded' : 'empty';
        return { items };
      });
      setLoadStates(states);
      const [staffRes, partRes, riskRes, incRes, polRes, audRes, docRes, supRes] = responses;

      setLiveRecords({
        employee: (staffRes?.items || []).map((r) => ({
          id: r.id,
          name: r.full_name || 'Staff Member',
          sub: `${r.position || 'Support Worker'} · ${r.department || 'Service Delivery'}`,
          status: r.status || 'Not recorded',
          owner: r.manager || 'Human Resources Manager',
          score: 'Readiness not assessed',
          standard: 'NDIS Practice Standard 2 & Aged Care Standard 7 (Workforce)',
          detailUrl: `/our-employees/${r.id}`,
        })),
        participant: (partRes?.items || []).map((r) => ({
          id: r.id,
          name: r.full_name || 'Participant',
          sub: `NDIS #: ${r.ndis_number || 'Not recorded'} · ${r.support_type || 'Core & Capacity Building'}`,
          status: r.status || 'Not recorded',
          owner: r.support_coordinator || 'Participant Services Lead',
          score: 'Readiness not assessed',
          standard: 'NDIS Practice Standard 1 & 3 · Aged Care Standard 1 & 3',
          detailUrl: `/our-participants/${r.id}`,
        })),
        risk: (riskRes?.items || []).map((r) => ({
          id: r.id,
          name: r.title || 'Enterprise Risk Record',
          sub: `${r.category || 'Operational'} · Rating: ${r.rating || 'Medium'} (${r.likelihood || 'Possible'} × ${r.consequence || 'Moderate'})`,
          status: r.status || 'Not recorded',
          owner: r.owner || 'Compliance & Risk Manager',
          score: r.rating || 'Rating not recorded',
          standard: 'ISO 31000 Risk Governance & NDIS Governance Standard 2',
          detailUrl: '/risks',
        })),
        incident: (incRes?.items || []).map((r) => ({
          id: r.id,
          name: r.title || 'Incident Record',
          sub: `${r.category || 'Safety'} · Severity: ${r.severity || 'Medium'} · ${r.date_occurred || 'Logged'}`,
          status: r.status || 'Not recorded',
          owner: r.responsible_manager || 'Incident & Safeguarding Lead',
          score: 'Reporting requirements need review',
          standard: 'NDIS Reportable Incidents & Aged Care SIRS Framework',
          detailUrl: `/incidents/${r.id}`,
        })),
        standard: (polRes?.items || []).map((p) => ({
          id: p.id,
          name: p.document_name || 'Organisational policy',
          sub: `${p.category || 'Category not recorded'} · Version ${p.version || 'not recorded'}`,
          status: p.status || 'Not recorded',
          owner: p.approved_by || 'Not recorded',
          score: 'Readiness not assessed',
          standard: 'Mapping not verified',
          detailUrl: '/compliance',
        })),
        audit: (audRes?.items || []).map((r) => ({
          id: r.id,
          name: r.title || r.audit_name || 'Internal Compliance & Quality Audit',
          sub: `${r.scope || 'Full NDIS & Aged Care Scope'} · Auditor: ${r.auditor || 'Lead Quality Auditor'}`,
          status: r.status || 'Not recorded',
          owner: r.auditor || 'Compliance Manager',
          score: 'Readiness not assessed',
          standard: 'ISO 19011 Auditing & NDIS Mid-Term / Renewal Audit',
          detailUrl: '/auditor-portal',
        })),
        document: (docRes?.items || []).map((r) => ({
          id: r.id,
          name: r.title || 'Controlled Compliance Document',
          sub: `${r.document_type || 'Credential'} · Employee: ${r.employee_name || 'Organisation'}`,
          status: r.status || 'Not recorded',
          owner: r.employee_name || 'Document Control Officer',
          score: r.expiry_date ? `Exp: ${r.expiry_date}` : 'Version not recorded',
          standard: 'Universal Document Vault & Company Safe Standard',
          detailUrl: '/documents',
        })),
        supplier: (supRes?.items || []).map((r) => ({
          id: r.id,
          name: r.name || r.company_name || 'Approved Contractor / Supplier',
          sub: `${r.category || 'Service Provider'} · ABN: ${r.abn || 'Not recorded'}`,
          status: r.status || 'Not recorded',
          owner: 'Procurement & Contracts Officer',
          score: 'Screening not verified',
          standard: 'Contractor WHS, Insurance & NDIS Worker Screening Gate',
          detailUrl: '/procurement',
        })),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load360Data();
  }, [load360Data]);

  const currentTypeObj = useMemo(
    () => PROFILE_360_TYPES.find((t) => t.id === selectedType) || PROFILE_360_TYPES[0],
    [selectedType]
  );

  const currentList = useMemo(() => {
    if (focusRecord) {
      return [
        {
          id: focusRecord.id || null,
          name:
            focusRecord.full_name ||
            focusRecord.title ||
            focusRecord.document_name ||
            focusRecord.name ||
            'Selected 360° Record',
          sub:
            focusRecord.position ||
            focusRecord.ndis_number ||
            focusRecord.category ||
            'Live Connected 360° Record',
          status: focusRecord.status || 'Not recorded',
          owner: focusRecord.owner || focusRecord.responsible_manager || 'Compliance Manager',
          score: 'Readiness not assessed',
          standard: 'NDIS Practice Standards & Aged Care Quality Standards',
          detailUrl: currentTypeObj.route,
        },
      ];
    }
    const list = liveRecords[selectedType] || [];
    if (list.length > 0) return list;
    return [
      {
        id: null,
        name: 'No record selected',
        sub: 'Select an available record before creating a review task.',
        status: 'Not assessed',
        owner: 'Compliance Manager',
        score: 'Readiness not assessed',
        standard: 'NDIS Practice Standards · Aged Care Quality Standards · WHS & Privacy',
        detailUrl: currentTypeObj.route,
      },
    ];
  }, [focusRecord, liveRecords, selectedType, currentTypeObj]);

  const activeRecord = currentList[selectedRecordIdx] || currentList[0];

  const triggerMasterAutomation = async () => {
    const recordId = activeRecord?.id;
    const actionKey = `${selectedType}:${recordId}`;
    if (actionLock.current) return;
    if (!recordId || loading || (!focusRecord && loadStates[selectedType] !== 'loaded')) {
      toast({ title: 'Select an available record', description: 'A saved record is required to create a review task.', variant: 'destructive' });
      return;
    }
    if (completedActions.current.has(actionKey)) {
      toast({ title: 'Review task already created', description: 'No additional task was created in this session.' });
      return;
    }
    actionLock.current = true;
    setRunningAutomation(true);
    setActionResult(null);
    let taskCreated = false;
    try {
      const user = await base44.auth.me();
      if (!user?.id) throw new Error('Authentication required');
      const today = new Date().toISOString().slice(0, 10);
      const due = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const task = await base44.entities.TodoTask.create({
        title: `[360° Review] Verify & Review ${activeRecord.name} (${currentTypeObj.shortLabel})`,
        task_type: '360° Master Automation',
        module: currentTypeObj.shortLabel,
        task_date: today,
        due_date: due,
        assigned_to: activeRecord.owner || 'Compliance Manager',
        priority: 'High',
        status: 'Pending',
        how_to_complete: `Review source record ${recordId} and verify the ${currentTypeObj.fields.length} declared profile fields against evidence. Readiness and mapping have not been updated by this action.`,
      });
      if (!task?.id) throw new Error('Task creation was not confirmed');
      taskCreated = true;
      completedActions.current.add(actionKey);
      await base44.entities.AuditLog.create({
        action: '360° Review Task Created',
        entity_type: currentTypeObj.shortLabel,
        record_id: String(recordId),
        record_title: activeRecord.name,
        performed_by: user.email || user.full_name || user.id,
        details: `Created review task ${task.id}. No readiness scores, compliance mappings, notifications or other automation outputs were updated by this action.`,
      });
      const message = 'Review task created and audit entry saved. Readiness and mapping were not changed.';
      setActionResult(message);
      toast({ title: 'Review task created', description: message });
    } catch {
      const message = taskCreated
        ? 'Review task created, but its audit entry could not be confirmed. Do not create another task; ask an administrator to reconcile the audit entry.'
        : 'Task creation could not be confirmed. Check the task register before retrying to avoid duplicates.';
      setActionResult(message);
      toast({ title: taskCreated ? 'Audit entry needs review' : 'Task creation not confirmed', description: message, variant: 'destructive' });
    } finally {
      actionLock.current = false;
      setRunningAutomation(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
      {/* Top Banner */}
      <div
        className="app-section-card-header flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white"
        style={{ background: HEADER_GRADIENT }}
      >
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            <Layers className="h-3 w-3 text-[#00C6FF]" />
            <span>Universal 360° Profile, 12-Step Master Workflow &amp; 14-Point Automation Framework</span>
          </div>
          <h3 className="mt-1 font-editorial text-base sm:text-lg font-extrabold text-white">
            Zero-Hop 360° Operational Profiles — Every Person, Risk, Incident, Standard, Audit, Document &amp; Supplier in One Place
          </h3>
          <p className="text-[11px] font-semibold text-white/95">
            Never jump between modules: inspect all 19 Universal 360° layers, domain attributes, linked evidence, compliance standards, and trigger 1-click Master Automation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            type="button"
            disabled={runningAutomation}
            onClick={triggerMasterAutomation}
            className="bg-white text-[#0A2B6D] hover:bg-slate-100 font-extrabold text-xs border border-white"
          >
            <Zap className="mr-1 h-3.5 w-3.5 text-[#FF2E9A]" />
            <span style={{ color: '#0A2B6D' }}>
              {runningAutomation ? 'Running 14 Automations…' : 'Run 14-Point Master Automation'}
            </span>
          </Button>
          {!focusRecord && (
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={load360Data}
              disabled={loading}
              className="border-white/50 bg-white/15 text-white hover:bg-white/25 text-xs font-extrabold"
            >
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync 360° Graph
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        <div role="status" aria-live="polite" className="rounded-xl border border-[#C084FC] bg-[#F6F0FF] p-3 text-xs font-semibold text-[#0A2B6D]">
          {actionResult || 'The automation button currently creates one review task and an audit entry. The 14 outputs, workflow steps and related sections below describe the framework; their execution and evidence are not verified here.'}
        </div>
        {!focusRecord && (loading || loadStates[selectedType] !== 'loaded') && (
          <div role="status" className="rounded-xl border border-[#C084FC] bg-white p-3 text-sm font-semibold text-[#0A2B6D]">
            {loading ? 'Loading records…' : loadStates[selectedType] === 'denied'
              ? 'Access denied. Your permissions do not allow these records to be loaded.'
              : loadStates[selectedType] === 'error'
                ? 'Records could not be loaded. Use Sync to retry.'
                : 'No records were returned for this profile type.'}
          </div>
        )}
        {/* 8 Master 360° Profile Type Selector Tabs */}
        {!focusRecord && (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8">
            {PROFILE_360_TYPES.map((type) => {
              const Icon = type.icon;
              const active = selectedType === type.id;
              const count = (liveRecords[type.id] || []).length;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.id);
                    setSelectedRecordIdx(0);
                  }}
                  className={`flex flex-col justify-between rounded-xl border-2 p-2 text-left transition-all ${
                    active
                      ? 'border-[#5A00D6] bg-[#5A00D6] text-white shadow-sm'
                      : 'border-[#0A2B6D]/25 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#00C6FF]' : 'text-[#0072FF]'}`} />
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                        active ? 'bg-white/20 text-white' : 'bg-[#F5F0FF] text-[#5A00D6]'
                      }`}
                    >
                      {type.fields.length} pts
                    </span>
                  </div>
                  <div className={`mt-1.5 text-[11px] font-extrabold leading-tight ${active ? 'text-white' : 'text-[#0A2B6D]'}`}>
                    {type.shortLabel}
                  </div>
                  <div className={`text-[9.5px] font-semibold ${active ? 'text-white/85' : 'text-[#5A00D6]'}`}>
                    {count > 0 ? `${count} live records` : 'Master 360° schema'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Record Picker Strip + Selected Record Summary Header */}
        <div className="rounded-xl border border-[#C084FC]/60 bg-[#F6F0FF]/70 p-3 space-y-2.5">
          {!focusRecord && currentList.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Select {currentTypeObj.shortLabel} Record:
              </span>
              {currentList.map((rec, idx) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setSelectedRecordIdx(idx)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                    idx === selectedRecordIdx
                      ? 'bg-[#0A2B6D] text-white shadow-2xs'
                      : 'border border-[#C084FC]/60 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                  }`}
                >
                  {rec.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="bg-[#5A00D6] text-white text-[10px]">
                  {currentTypeObj.label}
                </Badge>
                <Badge className="bg-[#0072FF] text-white text-[10px]">
                  Status: {activeRecord.status}
                </Badge>
                <Badge className="bg-[#FF2E9A] text-white text-[10px]">
                  {activeRecord.score}
                </Badge>
              </div>
              <h4 className="mt-1 font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                {activeRecord.name}
              </h4>
              <p className="text-xs font-semibold text-[#0A2B6D]/85">
                {activeRecord.sub} · <span className="font-extrabold text-[#5A00D6]">Owner: {activeRecord.owner}</span>
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-[#0072FF]">
                Mapped Standards: {activeRecord.standard}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <Link
                to={activeRecord.detailUrl || currentTypeObj.route}
                className="inline-flex items-center gap-1 rounded-xl bg-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold text-white shadow-2xs hover:bg-[#0072FF]"
              >
                <span style={{ color: '#FFFFFF' }}>Open Full Dedicated Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#00C6FF]" />
              </Link>
            </div>
          </div>
        </div>

        {/* All Domain-Specific 360° Attributes for this Object */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              {currentTypeObj.label} — All {currentTypeObj.fields.length} Connected 360° Domain Components
            </span>
            <span className="text-[10.5px] font-extrabold text-[#0072FF]">
              Available fields · Evidence links require verification
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentTypeObj.fields.map((field, i) => (
              <span
                key={field}
                className="inline-flex items-center gap-1 rounded-lg border border-[#C084FC]/60 bg-[#F6F0FF]/50 px-2.5 py-1 text-[10.5px] font-extrabold text-[#0A2B6D]"
              >
                <CheckCircle2
                  className="h-3 w-3 shrink-0"
                  style={{ color: i % 3 === 0 ? '#0072FF' : i % 3 === 1 ? '#5A00D6' : '#FF2E9A' }}
                />
                <span>{field}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Universal 19-Point 360° Profile Rule Grid */}
        {!compact && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Universal 360° Profile Rule — All 19 Mandatory Connected Panes for {activeRecord.name}
              </span>
              <span className="text-[10.5px] font-extrabold text-[#5A00D6]">
                Every Record Auto-Participates in Workflow, Compliance, Evidence &amp; Readiness
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {UNIVERSAL_19_SECTIONS.map((sec, idx) => (
                <div
                  key={sec}
                  className="rounded-xl border border-[#0A2B6D]/20 bg-white p-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#5A00D6]">
                      {idx + 1}. {sec}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#0072FF]" />
                  </div>
                  <p className="mt-1 text-[11px] font-bold text-[#0A2B6D]">
                    {sec === 'Overview' && `${activeRecord.name} (${activeRecord.status})`}
                    {sec === 'Status' && `${activeRecord.status} · SLA not assessed`}
                    {sec === 'Ownership' && activeRecord.owner}
                    {sec === 'Related People' && 'Linked Staff, Participants & Nominees'}
                    {sec === 'Related Risks' && '5×5 Matrix Controls & Treatments Linked'}
                    {sec === 'Related Incidents' && '24h/5d NDIS & SIRS Safeguards Synced'}
                    {sec === 'Related Reviews' && '10-Weekly / 6-Monthly Review Scheduled'}
                    {sec === 'Related Assessments' && 'Intake, Clinical & Competency Assessments'}
                    {sec === 'Related Audits' && '356-Checkpoint Internal & External Audits'}
                    {sec === 'Related Actions' && 'Assigned CAPA & Shared To-Do Actions'}
                    {sec === 'Related Goals' && 'Outcomes, Milestones & Funding Tracked'}
                    {sec === 'Related Communications' && 'Notes, Emails, Calls & Acknowledgements'}
                    {sec === 'Related Documents' && 'Version-Controlled Vault & Safe Copies'}
                    {sec === 'Related Evidence' && '5-Point Stamped Operational Evidence'}
                    {sec === 'Related Standards' && activeRecord.standard}
                    {sec === 'Compliance Mapping' && `${activeRecord.score} · Mapping not verified`}
                    {sec === 'Timeline' && 'Chronological End-to-End Lifecycle Feed'}
                    {sec === 'Audit Trail' && 'Immutable User, Timestamp & Before/After Diff'}
                    {sec === 'AI Insights' && 'No verified recommendation loaded'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12-Step Master Workflow Rule & 14-Point Master Automation Rule */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                12-Step Master Workflow Rule (Zero Bypass of Accountability, Evidence or Reporting)
              </span>
              <span className="text-[10px] font-extrabold text-[#0072FF]">
                Preview Step: {activeWorkflowStep} ({MASTER_12_WORKFLOW_STEPS[activeWorkflowStep - 1]?.label})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
              {MASTER_12_WORKFLOW_STEPS.map((s) => {
                const done = s.step === activeWorkflowStep;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveWorkflowStep(s.step)}
                    className={`rounded-lg border p-2 text-left transition ${
                      done
                        ? 'border-[#0072FF] bg-[#F6F0FF] text-[#0A2B6D]'
                        : 'border-slate-200 bg-white text-[#0A2B6D]/75'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold">
                      <span className="text-[#5A00D6]">
                        {s.step}. {s.label}
                      </span>
                      {done && <Clock className="h-3 w-3 text-[#0072FF]" />}
                    </div>
                    <div className="mt-0.5 text-[9.5px] font-semibold leading-tight text-[#0A2B6D]/85">
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                14-Point Master Automation Rule (On Create / Update / Close)
              </span>
              <Badge className="bg-[#0072FF] text-white text-[9.5px]">Not verified</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MASTER_14_AUTOMATION_OUTPUTS.map((autoItem) => (
                <span
                  key={autoItem}
                  className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/20 bg-[#F6F0FF] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
                >
                  <Zap className="h-2.5 w-2.5 text-[#FF2E9A]" />
                  <span>{autoItem}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}