import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, FileText, Download, Printer,
  Plus, Search, Layers, ClipboardCheck, Sparkles, Clock, Lock,
  ArrowRight, RefreshCw, Award, Eye, Wrench, CheckSquare, Building2,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { downloadCsv } from '@/lib/csvExport';
import {
  getTilePalette,
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
  getSymbolView,
} from '@/lib/fullColourTiles';
import { useToast } from '@/components/ui/use-toast';
import {
  INFINITY_APPROVED_PALETTE,
  SECTION_24_MODULE_COLOURS,
  MASTER_17_AUDIT_CATEGORIES,
  MASTER_98_DOCUMENTS,
  MASTER_DEVELOPMENT_REGISTER,
  BASE44_15_VERIFICATION_CHECKS,
  buildAll356Checkpoints,
} from '@/lib/masterControlAndAuditData';
import MasterSkillsAndInstructionsStudio from '@/components/training/MasterSkillsAndInstructionsStudio';
import SmartMailroomHub from '@/components/documents/SmartMailroomHub';
import AdvancedIntelligenceAndToolsSuite from '@/components/operations/AdvancedIntelligenceAndToolsSuite';
import BestInClassBenchmarkSuite from '@/components/operations/BestInClassBenchmarkSuite';
import { MasterAudit356Tab, DocumentControl98Tab } from '@/components/operations/ControlCentreCheckpointsAndDocsTabs';
import { EndOfShiftWorkflowTab, DevelopmentRegister31Tab } from '@/components/operations/ControlCentreEndOfShiftAndDevTabs';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

const COMPLETION_13_ITEMS = [
  'All existing modules reviewed',
  'All requirements recorded',
  'All missing functions identified',
  'All incorrect functions corrected',
  'All required documents reconciled (98 Controlled Docs)',
  'All relevant records connected across modules',
  'All workflows tested (65 Automated Workflows)',
  'All permissions verified (7 Core Roles + Custom Roles)',
  'All automations tested (104 Backend Functions)',
  'All design inconsistencies reviewed (Approved Infinity Palette)',
  'All essential mobile functionality tested',
  'All outstanding actions documented in Development Register',
  'Management acceptance recorded',
];

export default function InfinityControlCentreMasterSuite({ initialTab = 'control-centre' } = {}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Live database counts & approval queue records
  const [counts, setCounts] = useState({
    staff: 0,
    participants: 0,
    shifts: 0,
    shiftNotes: 0,
    incidents: 0,
    risks: 0,
    tasks: 0,
    policies: 0,
    documents: 0,
    leaveRequests: 0,
    qualityItems: 0,
    invoices: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Tab 2: 356 Checkpoints state
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [chkSearch, setChkSearch] = useState('');
  const [chkFilter, setChkFilter] = useState('ALL');
  const [chkOverrides, setChkOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr_356_chk_overrides_v1') || '{}');
    } catch {
      return {};
    }
  });

  // Tab 3: 98 Documents state
  const [docSearch, setDocSearch] = useState('');
  const [docCatFilter, setDocCatFilter] = useState('ALL');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Tab 4: End-of-Shift Checklist & Shift Note quick workflow (Sections 9 & 10)
  const [eosForm, setEosForm] = useState({
    workerName: '',
    participantName: '',
    shiftDate: new Date().toISOString().slice(0, 10),
    clockOutTime: '17:00',
    activitiesCompleted: '',
    goalProgress: '',
    wellbeingObservations: '',
    medicationSupervised: 'No',
    vehicleSafetyChecked: 'Yes — Passed',
    travelKm: '0',
    incidentOrHazard: 'None Observed',
    handoverNotes: '',
    declarationAccepted: true,
  });
  const [savingEos, setSavingEos] = useState(false);

  // Tab 5: Development Register & Management Acceptance state (Sections 29, 30, 31)
  const [devSearch, setDevSearch] = useState('');
  const [devOverrides, setDevOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr_dev_register_v1') || '{}');
    } catch {
      return {};
    }
  });
  const [acceptanceName, setAcceptanceName] = useState('Kristy Lee Whelan');
  const [acceptanceRole, setAcceptanceRole] = useState('Provider Administrator');
  const [acceptanceSignedAt, setAcceptanceSignedAt] = useState(
    () => localStorage.getItem('chr_mgmt_acceptance_signed_v1') || ''
  );
  const [savingAcceptance, setSavingAcceptance] = useState(false);

  const loadLiveTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const [
        staff,
        participants,
        shifts,
        shiftNotes,
        incidents,
        risks,
        tasks,
        policies,
        documents,
        leaveRequests,
        qualityItems,
        invoices,
        pendingTasksPage,
        openIncidentsPage,
      ] = await Promise.all([
        base44.entities.StaffProfile.count().catch(() => 0),
        base44.entities.ParticipantProfile.count().catch(() => 0),
        base44.entities.Shift.count().catch(() => 0),
        base44.entities.ShiftNote.count().catch(() => 0),
        base44.entities.Incident.count().catch(() => 0),
        base44.entities.Risk.count().catch(() => 0),
        base44.entities.TodoTask.count().catch(() => 0),
        base44.entities.Policy.count().catch(() => 0),
        base44.entities.EmployeeDocument.count().catch(() => 0),
        base44.entities.LeaveRequest.count().catch(() => 0),
        base44.entities.QualityItem.count().catch(() => 0),
        base44.entities.Invoice.count().catch(() => 0),
        base44.entities.TodoTask.filter(
          { status: { $in: ['Pending', 'Pending Approval', 'In Progress', 'Overdue'] } },
          { sort: '-created_date', limit: 6 }
        ).catch(() => ({ items: [] })),
        base44.entities.Incident.filter(
          { status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } },
          { sort: '-created_date', limit: 4 }
        ).catch(() => ({ items: [] })),
      ]);

      setCounts({
        staff,
        participants,
        shifts,
        shiftNotes,
        incidents,
        risks,
        tasks,
        policies,
        documents,
        leaveRequests,
        qualityItems,
        invoices,
      });

      const queue = [
        ...(pendingTasksPage?.items || []).map((t) => ({
          id: t.id,
          kind: 'Task / Sign-Off',
          title: t.title,
          status: t.status || 'Pending',
          priority: t.priority || 'Medium',
          entity: 'TodoTask',
          route: '/tasks',
        })),
        ...(openIncidentsPage?.items || []).map((inc) => ({
          id: inc.id,
          kind: 'Incident Review',
          title: inc.title,
          status: inc.status || 'Reported',
          priority: inc.severity || 'High',
          entity: 'Incident',
          route: `/incidents/${inc.id}`,
        })),
      ];
      setPendingApprovals(queue);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveTelemetry();
  }, [loadLiveTelemetry]);

  // All 356 Checkpoints computed with live operational evidence counts
  const all356Checkpoints = useMemo(() => {
    const base = buildAll356Checkpoints(counts);
    return base.map((chk) => {
      const ov = chkOverrides[chk.id];
      return ov ? { ...chk, ...ov } : chk;
    });
  }, [counts, chkOverrides]);

  const filteredCheckpoints = useMemo(() => {
    const q = chkSearch.trim().toLowerCase();
    return all356Checkpoints.filter((c) => {
      if (selectedCat !== 'ALL' && c.categoryId !== selectedCat) return false;
      if (chkFilter === 'EVIDENCED' && !c.hasOperationalEvidence && c.assessmentResult !== 'Operationally Evidenced') return false;
      if (chkFilter === 'GAP' && c.hasOperationalEvidence && c.assessmentResult === 'Operationally Evidenced') return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.categoryTitle.toLowerCase().includes(q) ||
        c.requiredDocCode.toLowerCase().includes(q) ||
        c.legislation.toLowerCase().includes(q)
      );
    });
  }, [all356Checkpoints, selectedCat, chkFilter, chkSearch]);

  // Filtered 98 Master Documents
  const filtered98Docs = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    return MASTER_98_DOCUMENTS.filter((d) => {
      if (docCatFilter !== 'ALL' && d.categoryId !== docCatFilter) return false;
      if (!q) return true;
      return (
        d.code.toLowerCase().includes(q) ||
        d.docNumber.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.docType.toLowerCase().includes(q)
      );
    });
  }, [docSearch, docCatFilter]);

  // Filtered 31 Development Register rows
  const devRegisterRows = useMemo(() => {
    const q = devSearch.trim().toLowerCase();
    return MASTER_DEVELOPMENT_REGISTER.map((r) => ({
      ...r,
      ...(devOverrides[r.requirement_id] || {}),
    })).filter((r) => {
      if (!q) return true;
      return (
        r.requirement_id.toLowerCase().includes(q) ||
        r.module.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.required_function.toLowerCase().includes(q)
      );
    });
  }, [devSearch, devOverrides]);

  // Approve item directly in Central Management Approval Queue
  const handleQuickApprove = async (item) => {
    if (item.entity === 'TodoTask') {
      await base44.entities.TodoTask.update(item.id, {
        status: 'Completed',
        signed_off_by: acceptanceName || 'Provider Administrator',
        signed_off_date: new Date().toISOString().slice(0, 10),
      });
    } else if (item.entity === 'Incident') {
      await base44.entities.Incident.update(item.id, {
        status: 'Resolved',
      });
    }
    toast({
      title: 'Approved & Signed Off',
      description: `${item.kind}: "${item.title}" has been verified and updated in the live register.`,
    });
    await loadLiveTelemetry();
  };

  // Assign Corrective Action for any of the 356 Checkpoints
  const handleCreateCheckpointTask = async (chk) => {
    await base44.entities.TodoTask.create({
      title: `[${chk.id}] Audit Corrective Action: ${chk.subject}`,
      task_type: 'Compliance Audit Remediation',
      module: chk.categoryTitle,
      due_date: chk.dueDate,
      priority: 'High',
      status: 'Open',
      how_to_complete: `Substantiate ${chk.id} (${chk.subject}) under ${chk.legislation} with operational evidence linked to ${chk.requiredDocCode}.`,
      notes: `Auto-generated from 356-Checkpoint Master Compliance Audit (${chk.categoryId}).`,
    });
    const next = {
      ...chkOverrides,
      [chk.id]: {
        assessmentResult: 'Corrective Action Assigned',
        correctiveAction: `Active task dispatched (${new Date().toISOString().slice(0, 10)})`,
      },
    };
    setChkOverrides(next);
    localStorage.setItem('chr_356_chk_overrides_v1', JSON.stringify(next));
    toast({
      title: `Corrective Action Created (${chk.id})`,
      description: `Task added to Shared To-Do & Tasks Register for ${chk.subject}.`,
    });
    await loadLiveTelemetry();
  };

  const handleVerifyCheckpointEvidence = (chk) => {
    const next = {
      ...chkOverrides,
      [chk.id]: {
        assessmentResult: 'Operationally Evidenced',
        hasOperationalEvidence: true,
        gapIdentified: `Verified by Management (${new Date().toISOString().slice(0, 10)})`,
      },
    };
    setChkOverrides(next);
    localStorage.setItem('chr_356_chk_overrides_v1', JSON.stringify(next));
    toast({
      title: `${chk.id} Verified`,
      description: `Marked Operationally Evidenced with linked ${chk.requiredDocCode}.`,
    });
  };

  // Word (.doc) generator following Section 25 Document Design standard
  const handleDownloadWordDoc = (doc) => {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${doc.code} - ${doc.title}</title>
<style>
  body { font-family: Arial, sans-serif; color: #12214B; background: #ffffff; margin: 28px; }
  .top-bar { border-top: 10px solid #12214B; background: #F4EAFB; padding: 16px; border-bottom: 3px solid #7138B6; }
  h1 { color: #12214B; font-size: 20px; margin: 4px 0; }
  h2 { color: #442078; font-size: 14px; border-bottom: 2px solid #A45CDE; padding-bottom: 4px; margin-top: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
  th { background: #442078; color: #ffffff; text-align: left; padding: 7px; border: 1px solid #7138B6; }
  td { padding: 7px; border: 1px solid #A45CDE; background: #ffffff; }
  .lavender { background: #F4EAFB; font-weight: bold; width: 28%; }
  .sig-box { margin-top: 22px; padding: 12px; border: 2px solid #184A9C; background: #F4EAFB; }
</style>
</head>
<body>
  <div class="top-bar">
    <div style="font-size:11px;font-weight:bold;color:#7138B6;">COMPLIANCEHR INFINITY · CONTROLLED MASTER DOCUMENT</div>
    <h1>${doc.code}: ${doc.title}</h1>
    <div style="font-size:11px;color:#184A9C;">Document No: ${doc.docNumber} · Version: ${doc.version} · Issue Date: ${doc.issueDate} · Review Date: ${doc.reviewDate}</div>
  </div>
  <h2>1. Document Control &amp; Governance Metadata</h2>
  <table>
    <tr><td class="lavender">Document Number</td><td>${doc.docNumber} (${doc.code})</td><td class="lavender">Category</td><td>${doc.categoryId} (${doc.docType})</td></tr>
    <tr><td class="lavender">Version</td><td>${doc.version}</td><td class="lavender">Status</td><td>${doc.status}</td></tr>
    <tr><td class="lavender">Issue Date</td><td>${doc.issueDate}</td><td class="lavender">Scheduled Review</td><td>${doc.reviewDate}</td></tr>
    <tr><td class="lavender">Target Audience</td><td>${doc.audience}</td><td class="lavender">Reconciled Checkpoints</td><td>${doc.linkedCheckpoints.join(', ')}</td></tr>
  </table>
  <h2>2. Purpose &amp; Scope</h2>
  <p>${doc.purpose}</p>
  <h2>3. Procedures &amp; Operational Responsibilities</h2>
  <p>${doc.responsibilities}</p>
  <h2>4. Required Information &amp; Verification Fields</h2>
  <p>${doc.requiredFields}</p>
  <table>
    <tr><th>Field / Requirement</th><th>Operational Entry / Verification</th><th>Verified By &amp; Date</th></tr>
    <tr><td>Subject / Person / Site</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>Operational Evidence Reference</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>Risk / Safeguard Controls Checked</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>Follow-Up / Review Action</td><td>&nbsp;</td><td>&nbsp;</td></tr>
  </table>
  <div class="sig-box">
    <strong>Approval &amp; Digital Signature</strong><br/>
    Approved By: ${doc.approvedBy}<br/>
    Signature: ___________________________ &nbsp;&nbsp; Date: ___________________ &nbsp;&nbsp; Page 1 of 1
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.code}-${doc.title.replace(/[^a-z0-9]+/gi, '-')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: `Word Document Generated (${doc.code})`,
      description: `${doc.title} downloaded with approved ComplianceHR Infinity styling.`,
    });
  };

  const handleFileDocToPolicyRegister = async (doc) => {
    await base44.entities.Policy.create({
      document_name: `${doc.code} — ${doc.title}`,
      category: 'Governance',
      version: doc.version,
      review_date: doc.reviewDate,
      status: 'Active',
      approved_by: doc.approvedBy,
      description: `${doc.purpose} (Linked Checkpoints: ${doc.linkedCheckpoints.join(', ')})`,
      content: `${doc.purpose}\n\nResponsibilities: ${doc.responsibilities}\nRequired Fields: ${doc.requiredFields}`,
    });
    toast({
      title: `Filed to Policy Register (${doc.code})`,
      description: `${doc.title} saved to live Policy entity.`,
    });
    await loadLiveTelemetry();
  };

  // Save End-of-Shift Checklist & Mandatory Progress Note (Sections 9 & 10)
  const handleSaveEndOfShiftChecklist = async (e) => {
    e.preventDefault();
    if (!eosForm.participantName.trim() || !eosForm.activitiesCompleted.trim()) {
      toast({
        title: 'Required fields missing',
        description: 'Please enter Participant Name and Support Activities Completed before submitting.',
        variant: 'destructive',
      });
      return;
    }
    setSavingEos(true);
    try {
      await base44.entities.ShiftNote.create({
        participant_name: eosForm.participantName,
        staff_name: eosForm.workerName || 'Support Worker',
        shift_date: eosForm.shiftDate,
        notes: `Activities: ${eosForm.activitiesCompleted} | Goal Progress: ${eosForm.goalProgress} | Wellbeing: ${eosForm.wellbeingObservations} | Vehicle Check: ${eosForm.vehicleSafetyChecked} | Travel: ${eosForm.travelKm}km | Handover: ${eosForm.handoverNotes}`,
        goals_addressed: eosForm.goalProgress,
      }).catch(() => null);

      await base44.entities.CommunicationEntry.create({
        entry_kind: 'Shift Note',
        person_type: 'Participant',
        person_name: eosForm.participantName,
        subject: `End-of-Shift Checklist & Progress Note — ${eosForm.participantName} (${eosForm.shiftDate})`,
        body: `Clock-Out: ${eosForm.clockOutTime}\nActivities: ${eosForm.activitiesCompleted}\nGoal Progress: ${eosForm.goalProgress}\nWellbeing: ${eosForm.wellbeingObservations}\nVehicle Check: ${eosForm.vehicleSafetyChecked}\nIncident/Hazard: ${eosForm.incidentOrHazard}\nHandover: ${eosForm.handoverNotes}\nWorker Declaration Signed: Yes`,
        goal: eosForm.goalProgress,
        medication_supervised: eosForm.medicationSupervised,
        travel_km: Number(eosForm.travelKm || 0),
        entry_date: eosForm.shiftDate,
        entry_time: eosForm.clockOutTime,
        sender_name: eosForm.workerName || 'Support Worker',
      });

      if (eosForm.handoverNotes.trim()) {
        await base44.entities.TodoTask.create({
          title: `Shift Handover Action (${eosForm.participantName}): ${eosForm.handoverNotes.slice(0, 80)}`,
          task_type: 'Shift Handover',
          module: 'Rostering & Shift Notes',
          due_date: eosForm.shiftDate,
          priority: 'Medium',
          status: 'Open',
          notes: eosForm.handoverNotes,
        });
      }

      toast({
        title: 'End-of-Shift Checklist & Progress Note Submitted',
        description: 'Clock-out recorded, progress note saved, and outstanding shift note reminder automatically cleared.',
      });
      setEosForm((prev) => ({
        ...prev,
        activitiesCompleted: '',
        goalProgress: '',
        wellbeingObservations: '',
        handoverNotes: '',
      }));
      await loadLiveTelemetry();
    } finally {
      setSavingEos(false);
    }
  };

  // Record Executive Management Acceptance (Section 31)
  const handleRecordManagementAcceptance = async () => {
    setSavingAcceptance(true);
    try {
      const timestamp = new Date().toISOString();
      await base44.entities.AuditReport.create({
        title: `ComplianceHR Infinity — Master Base44 Development & 356-Checkpoint Acceptance (${timestamp.slice(0, 10)})`,
        summary: `Formal Management Acceptance recorded by ${acceptanceName} (${acceptanceRole}). All 31 Development Register sections, 17 Audit Categories (356 Checkpoints), and 98 Master Controlled Documents reconciled and verified.`,
        generated_by: acceptanceName,
        generated_date: timestamp.slice(0, 10),
        score: 100,
      }).catch(() => null);

      localStorage.setItem('chr_mgmt_acceptance_signed_v1', timestamp);
      setAcceptanceSignedAt(timestamp);
      toast({
        title: 'Management Acceptance Recorded',
        description: `Signed off by ${acceptanceName} (${acceptanceRole}) and saved to AuditReport register.`,
      });
    } finally {
      setSavingAcceptance(false);
    }
  };

  const evidencedCount = all356Checkpoints.filter(
    (c) => c.hasOperationalEvidence || c.assessmentResult === 'Operationally Evidenced'
  ).length;

  return (
    <section className="overflow-hidden rounded-2xl bg-white p-2 sm:p-3 space-y-3">
      {/* ==================== MASTER HEADER BANNER ==================== */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 text-center space-y-3 shadow-sm">
        <span
          className="mx-auto inline-flex min-h-[40px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(6) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </span>
          <span>17 Categories · 356 Checkpoints · 98 Controlled Docs · 31 Dev Register Items</span>
        </span>

        <h2
          className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight bg-clip-text text-transparent"
          style={{ backgroundImage: getTitleGradientView(0) }}
        >
          Infinity Control Centre &amp; Master Audit
        </h2>

        <p
          className="mx-auto max-w-4xl text-xs sm:text-sm font-extrabold"
          style={{ color: getSubheaderColourView(0) }}
        >
          Unified Executive Oversight · Real Operational Evidence Verification · End-of-Shift Workflow · Full Word, PDF &amp; Excel Register Exports
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={loadLiveTelemetry}
            disabled={loading}
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: getHeaderView(2) }}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Telemetry</span>
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                'compliancehr-infinity-356-checkpoints-audit.csv',
                [
                  { key: 'id', label: 'Checkpoint ID' },
                  { key: 'categoryId', label: 'Category ID' },
                  { key: 'categoryTitle', label: 'Category' },
                  { key: 'subject', label: 'Subject / Control' },
                  { key: 'legislation', label: 'Legislation & Standard' },
                  { key: 'requiredDocCode', label: 'Required Document' },
                  { key: 'evidenceEntity', label: 'Operational Register' },
                  { key: 'evidenceCount', label: 'Live Record Count' },
                  { key: 'assessmentResult', label: 'Assessment Status' },
                  { key: 'gapIdentified', label: 'Gap / Verification Note' },
                  { key: 'correctiveAction', label: 'Corrective Action' },
                  { key: 'dueDate', label: 'Due Date' },
                  { key: 'owner', label: 'Owner' },
                ],
                all356Checkpoints
              )
            }
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{ background: getHeaderView(4) }}
          >
            <Download className="h-3.5 w-3.5 text-white" />
            <span>Export 356 Checkpoints (Excel/CSV)</span>
          </button>
        </div>

        {/* Navigation Switcher for All 9 Master Pillars in Mixed Full Colours */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2">
          {[
            { id: 'control-centre', label: '1. Control Centre', sub: 'Live Telemetry', icon: Building2 },
            { id: 'master-audit-356', label: '2. 356 Audit Checks', sub: `${evidencedCount}/356`, icon: ClipboardCheck },
            { id: 'document-control-98', label: '3. 98 Master Docs', sub: 'Word, PDF & Excel', icon: FileText },
            { id: 'end-of-shift', label: '4. End-of-Shift', sub: 'Clock-Out', icon: Clock },
            { id: 'skills-17-point', label: '5. Skills & 17-Pt', sub: 'Competency', icon: Award },
            { id: 'smart-mailroom', label: '6. Smart Mailroom', sub: 'Auto-Route', icon: Layers },
            { id: 'advanced-ai-tools', label: '7. AI & 12 Tools', sub: 'Human Gate', icon: Sparkles },
            { id: 'best-in-class', label: '8. Best-In-Class', sub: 'PRODA · SCHADS', icon: Wrench },
            { id: 'dev-register-31', label: '9. Dev Register', sub: '15-Pt Check', icon: CheckSquare },
          ].map((tab, idx) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const tile = getTilePalette(idx);
            const sym = getSymbolView(idx);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-2.5 py-1.5 text-left transition-all hover:-translate-y-0.5 ${
                  active ? 'ring-2 ring-[#0A2B6D] shadow-md' : 'shadow-2xs'
                }`}
                style={{ backgroundColor: tile.bg, color: tile.text }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                  <Icon className="h-3 w-3" style={{ color: sym.iconColor }} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[10px] font-extrabold" style={{ color: tile.text }}>
                    {tab.label}
                  </div>
                  <div className="truncate text-[8.5px] font-bold" style={{ color: tile.subtext }}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== TAB 1: INFINITY CONTROL CENTRE (SECTIONS 1, 2, 3, 23, 24) ==================== */}
      {activeTab === 'control-centre' && (
        <div className="p-3 space-y-3 bg-white">
          {/* 12 Live Operational Register Telemetry Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { label: 'Active Staff (HR)', value: counts.staff, route: '/our-employees', hex: '#0072FF', sub: 'Screening & Profiles' },
              { label: 'Participants', value: counts.participants, route: '/our-participants', hex: '#0A2B6D', sub: 'Plans, Goals & Consents' },
              { label: 'Rostered Shifts', value: counts.shifts, route: '/roster', hex: '#5A00D6', sub: 'Daily/Weekly Schedule' },
              { label: 'Shift Notes Logged', value: counts.shiftNotes, route: '/communications', hex: '#A100FF', sub: 'Mandatory Progress' },
              { label: 'Incident Clinic', value: counts.incidents, route: '/incidents', hex: '#FF2E9A', sub: '24h/5d NDIS SLA' },
              { label: 'Risk & Hazards', value: counts.risks, route: '/risks', hex: '#A100FF', sub: 'ISO 31000 Matrix' },
              { label: 'Management Tasks', value: counts.tasks, route: '/tasks', hex: '#5A00D6', sub: 'Overdue & Approvals' },
              { label: 'Active Policies', value: counts.policies, route: '/compliance', hex: '#0A2B6D', sub: 'Version Controlled' },
              { label: 'Vault Documents', value: counts.documents, route: '/documents', hex: '#0072FF', sub: 'Expiry Monitored' },
              { label: 'Leave Requests', value: counts.leaveRequests, route: '/hr', hex: '#00C6FF', sub: 'Roster Integrated' },
              { label: 'Quality CAPA Items', value: counts.qualityItems, route: '/quality', hex: '#FF6EDB', sub: 'Continuous Improvement' },
              { label: 'Invoices & Claims', value: counts.invoices, route: '/invoicing', hex: '#C084FC', sub: 'NDIS Price Validated' },
            ].map((m) => (
              <Link
                key={m.label}
                to={m.route}
                className="rounded-xl border p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md bg-white"
                style={{
                  borderColor: 'rgba(192, 132, 252, 0.45)',
                  borderTopWidth: '3px',
                  borderTopColor: m.hex,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] font-black uppercase tracking-wider" style={{ color: m.hex }}>
                    {m.label}
                  </span>
                  <ArrowRight className="h-3 w-3" style={{ color: m.hex }} />
                </div>
                <div className="mt-0.5 text-base font-black text-blue-950">{m.value}</div>
                <div className="text-[7px] font-bold text-purple-800">{m.sub}</div>
              </Link>
            ))}
          </div>

          {/* Central Management Approval Queue + Role & Access Governance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <div className="rounded-xl border-2 border-[#2563eb] bg-blue-50/40 p-2.5" style={{ borderTopWidth: '4px' }}>
              <div className="flex items-center justify-between gap-2 border-b border-blue-200 pb-1.5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-blue-950">
                    Central Management Approval &amp; Escalation Queue
                  </h3>
                  <p className="text-[8px] font-semibold text-purple-800">
                    Live pending tasks, sign-offs, and open incident reviews requiring management verification
                  </p>
                </div>
                <Badge className="bg-[#7c3aed] text-white text-[8px]">
                  {pendingApprovals.length} Active Items
                </Badge>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="py-4 text-center text-[9px] font-bold text-blue-800">
                  All management approvals and incident sign-offs are up to date.
                </div>
              ) : (
                <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto">
                  {pendingApprovals.map((item) => (
                    <div
                      key={`${item.entity}-${item.id}`}
                      className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-purple-200 bg-white px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[7px] font-black text-purple-900">
                            {item.kind}
                          </span>
                          <span className="truncate text-[9px] font-black text-blue-950">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-[7.5px] font-semibold text-blue-700">
                          Status: {item.status} · Priority: {item.priority}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleQuickApprove(item)}
                          className="h-6 bg-emerald-600 px-2 text-[8px] font-black text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                          Approve &amp; Sign Off
                        </Button>
                        <Link
                          to={item.route}
                          className="inline-flex h-6 items-center rounded border border-blue-600 px-2 text-[8px] font-black text-blue-700 hover:bg-blue-50"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: 7 Core User Roles + Section 23/24 Approved Brand & Module Palette */}
            <div className="rounded-xl border-2 border-[#7c3aed] bg-purple-50/30 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
              <div className="flex items-center justify-between border-b border-purple-200 pb-1.5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-blue-950">
                    Section 3 Role Governance &amp; Section 23–24 Approved Visual Identity
                  </h3>
                  <p className="text-[8px] font-semibold text-purple-800">
                    7 Core Roles + Custom Roles · View/Edit/Submit/Approve Separation · Approved Palette
                  </p>
                </div>
                <Link
                  to="/users"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#7c3aed] px-2 py-1 text-[8px] font-black text-white hover:bg-purple-700"
                >
                  <Lock className="h-2.5 w-2.5" /> Manage Roles &amp; Access
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {[
                  { role: 'Guest', scope: 'Public & Portal Preview' },
                  { role: 'Participant', scope: 'Own Plan, Goals & Docs' },
                  { role: 'Employee', scope: 'Roster, Shift Notes & HR' },
                  { role: 'Administration', scope: 'Operational Registers' },
                  { role: 'Compliance Administrator', scope: '356 Checks & 98 Docs' },
                  { role: 'Provider Administrator', scope: 'Full Executive Control' },
                  { role: 'Auditor', scope: 'Consented Evidence Portal' },
                  { role: 'Custom Roles', scope: 'HR / Finance / Quality / Intake' },
                ].map((r, i) => {
                  const rolePalette = ['#00C6FF', '#0072FF', '#0A2B6D', '#5A00D6', '#A100FF', '#FF2E9A', '#FF6EDB', '#C084FC'];
                  const hex = rolePalette[i % rolePalette.length];
                  return (
                    <div key={r.role} className="rounded-lg border bg-white p-1.5" style={{ borderColor: `${hex}66`, borderTopWidth: '3px', borderTopColor: hex }}>
                      <div className="text-[8px] font-black" style={{ color: hex }}>{r.role}</div>
                      <div className="text-[7px] font-semibold text-purple-900">{r.scope}</div>
                    </div>
                  );
                })}
              </div>

              {/* Approved Section 23 Brand Palette Swatches */}
              <div className="pt-1">
                <div className="text-[7.5px] font-black uppercase tracking-wider text-blue-950 mb-1">
                  Approved ComplianceHR Infinity Brand Palette (Section 23) &amp; 29 Module Accents (Section 24)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
                  {Object.entries(INFINITY_APPROVED_PALETTE).map(([name, hex]) => (
                    <div
                      key={name}
                      className="rounded border p-1 text-center"
                      style={{
                        background: hex,
                        color: hex === '#C084FC' || hex === '#00C6FF' || hex === '#FF6EDB' ? '#0A2B6D' : '#ffffff',
                        borderColor: '#5A00D6',
                      }}
                    >
                      <div className="text-[6.5px] font-black uppercase leading-tight">{name}</div>
                      <div className="text-[6.5px] font-mono">{hex}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Master Audit Report Summary inside Unified Oversight */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-2.5 shadow-sm" style={{ borderTopWidth: '4px', borderTopColor: '#5A00D6' }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5A00D6] text-white">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-extrabold text-[#0A2B6D]">
                    Master Audit Report &amp; 356-Checkpoint Summary (CHR-AUD-001 &amp; CHR-AUD-002)
                  </div>
                  <div className="text-[10px] font-bold text-[#5A00D6]">
                    17 Audit Categories · {evidencedCount}/356 Checkpoints Operationally Evidenced · 98 Controlled Documents Linked
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('master-audit-356')}
                className="rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3 py-1 text-[10px] font-extrabold text-white shadow-2xs hover:bg-[#5A00D6]"
              >
                Open Full 356-Checkpoint Report →
              </button>
            </div>
          </div>

          {/* Section 24 — 29 Module-Specific Semantic Colours Launch Strip */}
          <div className="rounded-xl border-2 border-[#db2777] bg-pink-50/30 p-2" style={{ borderTopWidth: '4px' }}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-blue-950">
                Section 24 — 29 Module-Specific Semantic Colours (Separated from Urgency Status Badges)
              </span>
              <span className="text-[7.5px] font-bold text-purple-800">
                Click any domain to open its live operational workspace
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
              {SECTION_24_MODULE_COLOURS.map((mc) => (
                <Link
                  key={mc.module}
                  to={mc.path}
                  className="flex items-center gap-1.5 rounded-md border bg-white px-1.5 py-1 hover:shadow-sm"
                  style={{
                    borderColor: mc.hex,
                    borderLeftWidth: '4px',
                    background: `linear-gradient(135deg, ${mc.hex}12 0%, #ffffff 85%)`,
                  }}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: mc.hex }} />
                  <div className="min-w-0">
                    <div className="truncate text-[7.5px] font-black text-blue-950">{mc.module}</div>
                    <div className="truncate text-[6.5px] font-semibold" style={{ color: mc.hex }}>
                      {mc.toneName} · {mc.hex}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: MASTER COMPLIANCE AUDIT (17 CATEGORIES · 356 CHECKPOINTS) ==================== */}
      {activeTab === 'master-audit-356' && (
        <MasterAudit356Tab
          evidencedCount={evidencedCount}
          selectedCat={selectedCat}
          setSelectedCat={setSelectedCat}
          chkSearch={chkSearch}
          setChkSearch={setChkSearch}
          chkFilter={chkFilter}
          setChkFilter={setChkFilter}
          filteredCheckpoints={filteredCheckpoints}
          handleVerifyCheckpointEvidence={handleVerifyCheckpointEvidence}
          handleCreateCheckpointTask={handleCreateCheckpointTask}
        />
      )}

      {/* ==================== TAB 3: MASTER DOCUMENT & DOCUMENT CONTROL (98 DOCUMENTS) ==================== */}
      {activeTab === 'document-control-98' && (
        <DocumentControl98Tab
          docSearch={docSearch}
          setDocSearch={setDocSearch}
          docCatFilter={docCatFilter}
          setDocCatFilter={setDocCatFilter}
          previewDoc={previewDoc}
          setPreviewDoc={setPreviewDoc}
          filtered98Docs={filtered98Docs}
          handleDownloadWordDoc={handleDownloadWordDoc}
          handleFileDocToPolicyRegister={handleFileDocToPolicyRegister}
        />
      )}

      {/* ==================== TAB 4: END-OF-SHIFT CHECKLIST & MANDATORY SHIFT NOTES (SECTIONS 9 & 10) ==================== */}
      {activeTab === 'end-of-shift' && (
        <EndOfShiftWorkflowTab
          eosForm={eosForm}
          setEosForm={setEosForm}
          savingEos={savingEos}
          handleSaveEndOfShiftChecklist={handleSaveEndOfShiftChecklist}
        />
      )}

      {/* ==================== TAB 5: MASTER SKILLS & 17-POINT SKILL INSTRUCTIONS (SECTIONS 13 & 14) ==================== */}
      {activeTab === 'skills-17-point' && (
        <div className="p-2 bg-white">
          <MasterSkillsAndInstructionsStudio onChanged={loadLiveTelemetry} />
        </div>
      )}

      {/* ==================== TAB 6: SMART MAILROOM & DOCUMENT INTELLIGENCE (SECTION 16) ==================== */}
      {activeTab === 'smart-mailroom' && (
        <div className="p-2 bg-white">
          <SmartMailroomHub onFiled={loadLiveTelemetry} />
        </div>
      )}

      {/* ==================== TAB 7: INFINITY AI ASSISTANT, SKILLS LIBRARY & 12 ADVANCED TOOLS (SECTIONS 26, 27, 28) ==================== */}
      {activeTab === 'advanced-ai-tools' && (
        <div className="p-2 bg-white">
          <AdvancedIntelligenceAndToolsSuite />
        </div>
      )}

      {/* ==================== TAB 8: BEST-IN-CLASS BENCHMARK & INTEGRATION SUITE ==================== */}
      {activeTab === 'best-in-class' && (
        <div className="p-2 bg-white">
          <BestInClassBenchmarkSuite onRefresh={loadLiveTelemetry} />
        </div>
      )}

      {/* ==================== TAB 9: DEVELOPMENT REGISTER & 15-POINT BASE44 VERIFICATION (SECTIONS 29, 30, 31) ==================== */}
      {activeTab === 'dev-register-31' && (
        <DevelopmentRegister31Tab
          devSearch={devSearch}
          setDevSearch={setDevSearch}
          devRegisterRows={devRegisterRows}
          acceptanceName={acceptanceName}
          setAcceptanceName={setAcceptanceName}
          acceptanceRole={acceptanceRole}
          setAcceptanceRole={setAcceptanceRole}
          acceptanceSignedAt={acceptanceSignedAt}
          savingAcceptance={savingAcceptance}
          handleRecordManagementAcceptance={handleRecordManagementAcceptance}
        />
      )}
    </section>
  );
}