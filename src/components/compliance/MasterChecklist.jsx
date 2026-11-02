import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { canonicalIntakeDocumentType } from '@/lib/intakeCases';
import { downloadCsv } from '@/lib/csvExport';
import { downloadComplianceAuditReport } from '@/lib/complianceAuditReportPdf';
import StaffFileMatrix, { STAFF_COLUMNS, staffColumnStatus } from '@/components/compliance/StaffFileMatrix';
import ParticipantFileMatrix from '@/components/compliance/ParticipantFileMatrix';
import PlatformComplianceStatus from '@/components/compliance/PlatformComplianceStatus';
import MasterComplianceAuditForms from '@/components/compliance/MasterComplianceAuditForms';
import { format } from 'date-fns';
import { Download, ClipboardCheck, Boxes, Car, Flame, ShieldCheck, FileDown, Loader2, UploadCloud } from 'lucide-react';

const PARTICIPANT_COLUMNS = [
  'Service Agreement',
  'NDIS Plan',
  'Participant Support Plan',
  'Individual Risk Assessment',
  'Consent to Share Information',
  'Personal Emergency Form',
  'Satisfaction Survey',
];

const statusFor = (pct) => (pct >= 90 ? 'Compliant' : pct >= 70 ? 'Needs Attention' : 'At Risk');
const TONE = { Compliant: 'bg-safe/10 text-safe', 'Needs Attention': 'bg-warning/10 text-warning', 'At Risk': 'bg-red-600/10 text-red-600 dark:text-red-300' };

const SectionSummary = ({ title, icon: Icon, status, readiness, lines, action }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-muted p-2"><Icon className="h-4 w-4 text-muted-foreground" /></div>
        <p className="font-semibold">{title}</p>
      </div>
      <div className="flex items-center gap-2">
        {action}
        <span className="text-xs font-semibold text-muted-foreground">{readiness == null ? 'n/a' : `${Math.round(readiness)}%`}</span>
        <Badge className={TONE[status]}>{status}</Badge>
      </div>
    </div>
    {lines.length > 0 && (
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {lines.map((line, index) => <li key={index}>{line}</li>)}
      </ul>
    )}
  </div>
);

/**
 * Master compliance checklist: live status for every module, staff file and
 * participant file checklists, kits and drills, vehicles, assets, visitor
 * sheet and the continuous improvement register - plus an exportable
 * Compliance Audit Report.
 */
export default function MasterChecklist() {
  const { toast } = useToast();
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const [intakeDocs, setIntakeDocs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [safetyChecks, setSafetyChecks] = useState([]);
  const [drills, setDrills] = useState([]);
  const [entries, setEntries] = useState([]);
  const [qualityItems, setQualityItems] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [uploadingCar, setUploadingCar] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [staffPage, participantPage, completionPage, employeeDocPage, intakeDocPage, assetPage, checkPage, drillPage, entryPage, qualityPage, policyPage] = await Promise.all([
        base44.entities.StaffProfile.filter({}, { limit: 500 }),
        base44.entities.ParticipantProfile.filter({}, { limit: 500 }),
        base44.entities.TrainingCompletion.filter({ learner_type: 'Employee', status: { $ne: 'Archived' } }, { limit: 1000 }),
        base44.entities.EmployeeDocument.filter({}, { limit: 500 }),
        base44.entities.IntakeDocument.filter({}, { limit: 1000 }),
        base44.entities.Asset.filter({}, { limit: 500 }),
        base44.entities.SafetyCheck.filter({}, { limit: 500 }),
        base44.entities.EmergencyDrill.filter({}, { limit: 500 }),
        base44.entities.ComplianceChecklistEntry.filter({}, { sort: '-created_date', limit: 500 }),
        base44.entities.QualityItem.filter({ type: 'Corrective Action' }, { sort: '-created_date', limit: 200 }),
        base44.entities.Policy.filter({}, { limit: 200 }),
      ]);
      setStaff(staffPage.items || []);
      setParticipants(participantPage.items || []);
      setCompletions(completionPage.items || []);
      setEmployeeDocs(employeeDocPage.items || []);
      setIntakeDocs((intakeDocPage.items || []).map((doc) => ({ ...doc, document_type: canonicalIntakeDocumentType(doc.document_type) })));
      setAssets(assetPage.items || []);
      setSafetyChecks(checkPage.items || []);
      setDrills(drillPage.items || []);
      setEntries(entryPage.items || []);
      setQualityItems(qualityPage.items || []);
      setPolicies(policyPage.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Shared document / training indexes (used for readiness and exports)
  const trainingByName = new Map();
  const docsByName = new Map();
  const intakeByProfile = new Map();
  completions.forEach((r) => {
    const key = String(r.employee_name || r.learner_name || '').trim().toLowerCase();
    if (!key) return;
    if (!trainingByName.has(key)) trainingByName.set(key, new Set());
    trainingByName.get(key).add(r.module_title);
  });
  employeeDocs.forEach((r) => {
    const key = String(r.employee_name || '').trim().toLowerCase();
    if (!key) return;
    if (!docsByName.has(key)) docsByName.set(key, new Set());
    docsByName.get(key).add(r.document_type);
  });
  intakeDocs.forEach((r) => {
    if (!r.profile_id) return;
    if (!intakeByProfile.has(r.profile_id)) intakeByProfile.set(r.profile_id, new Set());
    intakeByProfile.get(r.profile_id).add(r.document_type);
  });

  // Staff matrix readiness
  const staffOverall = (() => {
    if (!staff.length) return null;
    const percents = staff.map((member) => {
      const nameKey = String(member.full_name || '').trim().toLowerCase();
      const trainingSet = trainingByName.get(nameKey) || new Set();
      const docSet = docsByName.get(nameKey) || new Set();
      const intakeSet = intakeByProfile.get(member.id) || new Set();
      const done = STAFF_COLUMNS.filter((column) => staffColumnStatus(member, column, trainingSet, docSet, intakeSet)).length;
      return (done / STAFF_COLUMNS.length) * 100;
    });
    return percents.reduce((sum, pct) => sum + pct, 0) / percents.length;
  })();

  // Participant matrix readiness
  const participantOverall = (() => {
    if (!participants.length) return null;
    const percents = participants.map((participant) => {
      const docs = intakeByProfile.get(participant.id) || new Set();
      return (PARTICIPANT_COLUMNS.filter((column) => docs.has(column)).length / PARTICIPANT_COLUMNS.length) * 100;
    });
    return percents.reduce((sum, pct) => sum + pct, 0) / percents.length;
  })();

  // Kits & drills readiness
  const KIT_TYPES = ['Natural Disaster Kit Check', 'First Aid Kit Check', 'Fire Safety Equipment Check'];
  const kitStatuses = KIT_TYPES.map((checkType) => {
    const latest = safetyChecks
      .filter((c) => c.check_type === checkType)
      .sort((a, b) => String(b.date_completed || '').localeCompare(String(a.date_completed || '')))[0];
    const due = latest?.next_due_date || '';
    const current = due && due >= today;
    return { checkType, latest, due, current: Boolean(current) };
  });
  const latestFireDrill = drills
    .filter((d) => d.drill_type === 'Fire Evacuation')
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0];
  const fireDrillDue = latestFireDrill?.date
    ? format(new Date(new Date(`${latestFireDrill.date}T00:00:00`).getTime() + 182 * 86400000), 'yyyy-MM-dd')
    : '';
  const kitsOverall = (() => {
    const flags = [...kitStatuses.map((k) => k.current), Boolean(fireDrillDue && fireDrillDue >= today)];
    return (flags.filter(Boolean).length / flags.length) * 100;
  })();

  const carSafetyDocs = intakeDocs.filter((doc) => doc.document_type === 'Car Safety Check Form');
  const overdueAssets = assets.filter((asset) => asset.next_service_date && asset.next_service_date < today);
  const activePolicies = policies.filter((p) => p.status === 'Active');
  const openCorrective = qualityItems.filter((q) => q.status === 'New' || q.status === 'In Progress');

  const uploadCarSafetyCheck = async (file) => {
    if (!file) return;
    setUploadingCar(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.IntakeDocument.create({
        intake_type: 'Employee',
        document_type: 'Car Safety Check Form',
        file_name: file.name,
        file_uri,
        uploaded_by: user?.full_name || user?.email || 'Compliance team',
        uploaded_date: today,
      });
      await load();
      toast({ title: 'Car safety check filed (stored privately)' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingCar(false);
    }
  };

  const viewDoc = async (doc) => {
    try {
      await openDocumentInViewer(doc);
    } catch (error) {
      toast({ title: 'Unable to open document', description: error.message, variant: 'destructive' });
    }
  };

  const reportSections = () => ([
    {
      title: 'Policies & Legal Requirements',
      status: statusFor(policies.length ? (activePolicies.length / policies.length) * 100 : 100),
      readiness: policies.length ? (activePolicies.length / policies.length) * 100 : 100,
      lines: [
        `${policies.length} policies recorded, ${activePolicies.length} active.`,
        `${policies.filter((p) => p.status === 'Under Review' || p.status === 'Expired').length} policies under review or expired.`,
      ],
    },
    {
      title: 'Staff Files & Training Compliance',
      status: statusFor(staffOverall ?? 0),
      readiness: staffOverall,
      lines: staff.length
        ? [`${staff.length} staff in system. Required certificates, licences, IDs, car rego, first aid, CPR and NDIS module certificates are tracked live per staff member.`]
        : ['No staff profiles in the system yet.'],
    },
    {
      title: 'Participant Files',
      status: statusFor(participantOverall ?? 0),
      readiness: participantOverall,
      lines: participants.length
        ? [`${participants.length} participants in system. Service agreements, NDIS plans, support plans, risk assessments and consents are tracked live per participant.`]
        : ['No participant profiles in the system yet.'],
    },
    {
      title: 'Emergency Kits & Fire Drills',
      status: statusFor(kitsOverall),
      readiness: kitsOverall,
      lines: [
        ...kitStatuses.map((kit) => `${kit.checkType}: ${kit.latest ? `last checked ${kit.latest.date_completed || 'unknown'}, next due ${kit.due ? format(new Date(`${kit.due}T00:00:00`), 'd MMM yyyy') : 'not set'}` : 'no check recorded yet'}.`),
        latestFireDrill
          ? `Fire evacuation drill: last completed ${latestFireDrill.date ? format(new Date(`${latestFireDrill.date}T00:00:00`), 'd MMM yyyy') : 'unknown'}, next due ${fireDrillDue ? format(new Date(`${fireDrillDue}T00:00:00`), 'd MMM yyyy') : 'not set'} (6-month cycle).`
          : 'Fire evacuation drill: no drill recorded yet (6-month cycle).',
      ],
    },
    {
      title: 'Vehicles & Car Safety Checks',
      status: statusFor(carSafetyDocs.length > 0 ? 100 : 0),
      readiness: carSafetyDocs.length > 0 ? 100 : 0,
      lines: [`${carSafetyDocs.length} car safety check(s) uploaded and filed in this section.`],
    },
    {
      title: 'Asset Register',
      status: statusFor(assets.length ? ((assets.length - overdueAssets.length) / assets.length) * 100 : 100),
      readiness: assets.length ? ((assets.length - overdueAssets.length) / assets.length) * 100 : 100,
      lines: [`${assets.length} assets on the register, ${overdueAssets.length} with overdue servicing.`],
    },
    {
      title: 'Continuous Improvement & Corrective Actions',
      status: statusFor(qualityItems.length ? ((qualityItems.length - openCorrective.length) / qualityItems.length) * 100 : 100),
      readiness: qualityItems.length ? ((qualityItems.length - openCorrective.length) / qualityItems.length) * 100 : 100,
      lines: [
        `${qualityItems.length} corrective actions recorded, ${openCorrective.length} still open.`,
        'Corrective actions from internal audits are added automatically.',
      ],
    },
    {
      title: 'Visitor Sign In / Out',
      status: entries.length > 0 ? 'Compliant' : 'Needs Attention',
      readiness: entries.length > 0 ? 100 : 0,
      lines: [`${entries.length} completed compliance checklist record(s) on file, including the visitor sign in/out sheet.`],
    },
  ]);

  const overallReadiness = () => {
    const sections = reportSections();
    const withReadiness = sections.filter((s) => s.readiness != null);
    if (!withReadiness.length) return 0;
    return Math.round(withReadiness.reduce((sum, s) => sum + s.readiness, 0) / withReadiness.length);
  };

  const exportReport = () => {
    downloadComplianceAuditReport({
      sections: reportSections(),
      generatedBy: user?.full_name || user?.email || 'Compliance & Report Centre',
      generatedAt: format(new Date(), 'd MMM yyyy, h:mma'),
      overallReadiness: overallReadiness(),
    });
    toast({ title: 'Compliance audit report downloaded' });
  };

  const exportEntries = () => {
    downloadCsv('compliance-checklist-log.csv', [
      { key: 'title', label: 'Checklist' }, { key: 'section', label: 'Section' }, { key: 'completed_by', label: 'Completed By' },
      { key: 'completed_date', label: 'Completed Date' }, { key: 'completed_time', label: 'Time' }, { key: 'next_due_date', label: 'Next Due' },
      { key: 'file_name', label: 'File' }, { key: 'notes', label: 'Notes' },
    ], entries);
    toast({ title: 'Compliance reports log exported' });
  };

  const exportCorrective = () => {
    downloadCsv('corrective-actions.csv', [
      { key: 'title', label: 'Action' }, { key: 'source', label: 'Source' }, { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' }, { key: 'raised_by', label: 'Raised By' }, { key: 'raised_date', label: 'Raised Date' },
      { key: 'nominated_to', label: 'Nominated To' }, { key: 'target_date', label: 'Target Date' }, { key: 'outcome', label: 'Outcome' },
    ], qualityItems);
    toast({ title: 'Corrective actions exported' });
  };

  const exportPolicies = () => {
    downloadCsv('policies.csv', [
      { key: 'document_name', label: 'Policy' }, { key: 'category', label: 'Category' }, { key: 'version', label: 'Version' },
      { key: 'status', label: 'Status' }, { key: 'approved_by', label: 'Approved By' }, { key: 'review_date', label: 'Review Date' },
    ], policies);
    toast({ title: 'Policies exported' });
  };

  const exportKits = () => {
    downloadCsv('emergency-kits-and-drills.csv', [
      { key: 'check_type', label: 'Check / Drill' }, { key: 'last_completed', label: 'Last Completed' },
      { key: 'next_due', label: 'Next Due' }, { key: 'current', label: 'Current' },
    ], [
      ...kitStatuses.map((k) => ({ check_type: k.checkType, last_completed: k.latest?.date_completed || '', next_due: k.due || '', current: k.current ? 'Yes' : 'No' })),
      { check_type: 'Fire Evacuation Drill', last_completed: latestFireDrill?.date || '', next_due: fireDrillDue || '', current: fireDrillDue && fireDrillDue >= today ? 'Yes' : 'No' },
    ]);
    toast({ title: 'Kits and drills exported' });
  };

  const exportCarDocs = () => {
    downloadCsv('car-safety-checks.csv', [
      { key: 'file_name', label: 'File' }, { key: 'intake_case_number', label: 'Case Number' },
      { key: 'profile_id', label: 'Profile ID' }, { key: 'uploaded_by', label: 'Uploaded By' }, { key: 'uploaded_date', label: 'Uploaded Date' },
    ], carSafetyDocs);
    toast({ title: 'Car safety checks exported' });
  };

  const exportAssets = () => {
    downloadCsv('asset-register.csv', [
      { key: 'name', label: 'Asset' }, { key: 'category', label: 'Category' }, { key: 'serial_number', label: 'Serial Number' },
      { key: 'condition', label: 'Condition' }, { key: 'status', label: 'Status' }, { key: 'location', label: 'Location' },
      { key: 'next_service_date', label: 'Next Service' },
    ], assets);
    toast({ title: 'Asset register exported' });
  };

  const exportStaffFiles = () => {
    downloadCsv('staff-file-checklist.csv', [
      { key: 'name', label: 'Staff Member' }, { key: 'position', label: 'Position' }, { key: 'status', label: 'Status' },
      ...STAFF_COLUMNS.map((col) => ({ key: col, label: col })),
    ], staff.map((member) => {
      const nameKey = String(member.full_name || '').trim().toLowerCase();
      const trainingSet = trainingByName.get(nameKey) || new Set();
      const docSet = docsByName.get(nameKey) || new Set();
      const intakeSet = intakeByProfile.get(member.id) || new Set();
      const row = { name: member.full_name, position: member.position || member.role || '', status: member.status || '' };
      STAFF_COLUMNS.forEach((col) => { row[col] = staffColumnStatus(member, col, trainingSet, docSet, intakeSet) ? 'Yes' : 'No'; });
      return row;
    }));
    toast({ title: 'Staff file checklist exported' });
  };

  const exportParticipantFiles = () => {
    downloadCsv('participant-file-checklist.csv', [
      { key: 'name', label: 'Participant' }, { key: 'ndis_number', label: 'NDIS Number' }, { key: 'status', label: 'Status' },
      ...PARTICIPANT_COLUMNS.map((col) => ({ key: col, label: col })),
    ], participants.map((participant) => {
      const docs = intakeByProfile.get(participant.id) || new Set();
      const row = { name: participant.full_name, ndis_number: participant.ndis_number || '', status: participant.status || '' };
      PARTICIPANT_COLUMNS.forEach((col) => { row[col] = docs.has(col) ? 'Yes' : 'No'; });
      return row;
    }));
    toast({ title: 'Participant file checklist exported' });
  };

  const exportFireDrills = () => {
    downloadCsv('fire-drills.csv', [
      { key: 'title', label: 'Drill' }, { key: 'date', label: 'Date' }, { key: 'location', label: 'Location' },
      { key: 'attendees_count', label: 'Attendees' }, { key: 'outcome', label: 'Outcome' },
    ], drills.filter((d) => d.drill_type === 'Fire Evacuation'));
    toast({ title: 'Fire drills exported' });
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={exportReport}><Download className="mr-2 h-4 w-4" /> Export compliance audit report</Button>
      </div>

      <MasterComplianceAuditForms />

      <PlatformComplianceStatus />

      <SectionCard
        title="Staff file checklist"
        description="Live checklist for every staff member in the system: certificates, licences, identifications, car rego, first aid, CPR, NDIS module certificates and cards."
        action={<Button variant="outline" size="sm" onClick={exportStaffFiles}><Download className="h-3.5 w-3.5" /> Export</Button>}
      >
        <StaffFileMatrix staff={staff} completions={completions} employeeDocs={employeeDocs} intakeDocs={intakeDocs} />
      </SectionCard>

      <SectionCard
        title="Participant file checklist"
        description="Live checklist for every participant in the system with their name and NDIS number."
        action={<Button variant="outline" size="sm" onClick={exportParticipantFiles}><Download className="h-3.5 w-3.5" /> Export</Button>}
      >
        <ParticipantFileMatrix participants={participants} intakeDocs={intakeDocs} />
      </SectionCard>

      <SectionCard title="Car safety checks" description="Copies of all uploaded car safety checks, filed in the correct compliance section." action={<Button variant="outline" size="sm" onClick={exportCarDocs}><Download className="h-3.5 w-3.5" /> Export</Button>}>
        {carSafetyDocs.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">No car safety checks uploaded yet.</p>
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => { uploadCarSafetyCheck(e.target.files?.[0]); e.target.value = ''; }} />
              <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium hover:bg-accent">
                {uploadingCar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />} Upload car safety check
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            {carSafetyDocs.map((doc) => (
              <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-sm">
                <div>
                  <p className="font-medium">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[doc.intake_case_number, doc.profile_id, doc.uploaded_by, doc.uploaded_date ? `Uploaded ${format(new Date(doc.uploaded_date), 'd MMM yyyy')}` : ''].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => viewDoc(doc)}><FileDown className="h-3.5 w-3.5" /> View</Button>
              </div>
            ))}
            <div className="flex justify-end">
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => { uploadCarSafetyCheck(e.target.files?.[0]); e.target.value = ''; }} />
                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium hover:bg-accent">
                  {uploadingCar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />} Upload car safety check
                </span>
              </label>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Fire drills completed" description="Fire evacuation drills recorded and submitted." action={<Button variant="outline" size="sm" onClick={exportFireDrills}><Download className="h-3.5 w-3.5" /> Export</Button>}>
        {drills.filter((d) => d.drill_type === 'Fire Evacuation').length === 0 ? (
          <p className="text-sm text-muted-foreground">No fire drills recorded yet. Complete the Fire Drill Plan and Evacuation Checklist to log one.</p>
        ) : (
          <div className="space-y-2">
            {drills.filter((d) => d.drill_type === 'Fire Evacuation').map((drill) => (
              <div key={drill.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-sm">
                <div>
                  <p className="font-medium">{drill.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[drill.date ? format(new Date(`${drill.date}T00:00:00`), 'd MMM yyyy') : '', drill.location, drill.attendees_count != null ? `${drill.attendees_count} attendees` : ''].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Badge className={drill.outcome === 'Completed' ? 'bg-safe/10 text-safe' : 'bg-warning/10 text-warning'}>{drill.outcome || 'Completed'}</Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Compliance reports completed (logs)"
        description="Every completed compliance checklist with who completed it, when, and the next 6-month due date."
        action={<Button variant="outline" size="sm" onClick={exportEntries}><Download className="h-3.5 w-3.5" /> Export log</Button>}
      >
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed compliance reports yet. Complete a checklist in the Kits &amp; Drills tab.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Checklist</th><th className="py-2 pr-3">Section</th><th className="py-2 pr-3">Completed by</th>
                  <th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Next due</th><th className="py-2">File</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 25).map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{entry.title}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{entry.section || '-'}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{entry.completed_by || '-'}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{entry.completed_date ? format(new Date(entry.completed_date), 'd MMM yyyy') : '-'}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{entry.next_due_date ? format(new Date(`${entry.next_due_date}T00:00:00`), 'd MMM yyyy') : '-'}</td>
                    <td className="py-2">
                      <Button variant="ghost" size="sm" onClick={() => viewDoc(entry)}><FileDown className="h-3.5 w-3.5" /> View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Continuous improvement & corrective actions"
        description="All corrective actions, including those recorded automatically from internal audits."
        action={<Button variant="outline" size="sm" onClick={exportCorrective}><Download className="h-3.5 w-3.5" /> Export</Button>}
      >
        {qualityItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No corrective actions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {qualityItems.slice(0, 15).map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{[item.source, item.raised_by, item.raised_date ? format(new Date(item.raised_date), 'd MMM yyyy') : ''].filter(Boolean).join(' · ')}</p>
                </div>
                <Badge className={item.status === 'New' ? 'bg-warning/10 text-warning' : item.status === 'Closed' || item.status === 'Implemented' ? 'bg-safe/10 text-safe' : 'bg-brand/10 text-brand'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Completed audits summary" description="Internal and NDIS audits are now managed in the Audits tab of this centre.">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardCheck className="h-4 w-4 text-brand" />
          Open the Audits tab above for the audit register, actions, checklists, calendar and status log.
        </div>
      </SectionCard>

      <div className="flex flex-wrap items-center gap-2">
        <Badge className={TONE[statusFor(overallReadiness())]}>Overall readiness {overallReadiness()}%</Badge>
        <span className="text-xs text-muted-foreground">Live - updates as documents are submitted.</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionSummary
          title="Policies & Legal Requirements"
          icon={ShieldCheck}
          status={statusFor(policies.length ? (activePolicies.length / policies.length) * 100 : 100)}
          readiness={policies.length ? (activePolicies.length / policies.length) * 100 : 100}
          lines={[`${activePolicies.length} of ${policies.length} policies active.`]}
          action={<Button variant="outline" size="sm" onClick={exportPolicies}><Download className="h-3.5 w-3.5" /> Export</Button>}
        />
        <SectionSummary
          title="Emergency Kits & Fire Drills"
          icon={Flame}
          status={statusFor(kitsOverall)}
          readiness={kitsOverall}
          lines={[
            ...kitStatuses.map((kit) => `${kit.checkType}: ${kit.latest ? `next due ${kit.due ? format(new Date(`${kit.due}T00:00:00`), 'd MMM yyyy') : 'not set'}` : 'no check recorded yet'}`),
            `Fire evacuation drill: ${latestFireDrill ? `next due ${fireDrillDue ? format(new Date(`${fireDrillDue}T00:00:00`), 'd MMM yyyy') : 'not set'}` : 'no drill recorded yet'}`,
          ]}
          action={<Button variant="outline" size="sm" onClick={exportKits}><Download className="h-3.5 w-3.5" /> Export</Button>}
        />
        <SectionSummary
          title="Vehicles & Car Safety Checks"
          icon={Car}
          status={statusFor(carSafetyDocs.length > 0 ? 100 : 0)}
          readiness={carSafetyDocs.length > 0 ? 100 : 0}
          lines={[`${carSafetyDocs.length} car safety check(s) filed in this section.`]}
          action={<Button variant="outline" size="sm" onClick={exportCarDocs}><Download className="h-3.5 w-3.5" /> Export</Button>}
        />
        <SectionSummary
          title="Asset Register"
          icon={Boxes}
          status={statusFor(assets.length ? ((assets.length - overdueAssets.length) / assets.length) * 100 : 100)}
          readiness={assets.length ? ((assets.length - overdueAssets.length) / assets.length) * 100 : 100}
          lines={[`${assets.length} assets on the register, ${overdueAssets.length} overdue for service.`]}
          action={<Button variant="outline" size="sm" onClick={exportAssets}><Download className="h-3.5 w-3.5" /> Export</Button>}
        />
      </div>
    </div>
  );
}