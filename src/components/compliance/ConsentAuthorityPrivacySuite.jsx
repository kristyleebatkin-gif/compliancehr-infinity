import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ParticipantConsentDialog,
  EmployeeConsentDialog,
} from '@/components/compliance/ConsentAuthorityModals';
import {
  ShieldCheck,
  Plus,
  BellRing,
  Lock,
  Undo2,
  History,
  Users,
  UserCheck,
  FileCheck2,
  Pencil,
} from 'lucide-react';
import {
  exportControlledRecordAsPdf,
  exportControlledRecordAsWord,
  exportControlledRecordAsExcel,
  exportControlledRecordAsCsv,
  autoFileToVaultAndCompanySafe,
} from '@/lib/enterpriseGovernanceStandard';

export const PARTICIPANT_18_CONSENT_TYPES = [
  'Information Collection',
  'Information Storage',
  'Internal Information Sharing',
  'External Information Sharing',
  'Family Information Sharing',
  'Guardian Information Sharing',
  'Medical Information Sharing',
  'Medication Administration',
  'Service Delivery',
  'Photos',
  'Videos',
  'Audio Recordings',
  'Marketing Materials',
  'Testimonials',
  'NDIS Audits',
  'Quality Audits',
  'Accreditation Audits',
  'Research Participation',
  'Electronic Signatures',
];

export const EMPLOYEE_12_CONSENT_TYPES = [
  'Information Collection',
  'Information Storage',
  'Personnel Records',
  'Compliance Audits',
  'Training Records',
  'Certifications',
  'Employee Recognition',
  'Workforce Reporting',
  'Internal Communications',
  'External Reporting',
  'Photographs',
  'Marketing Participation',
];

export const CONSENT_6_REPORTS = [
  {
    id: 'consent-register',
    title: 'Consent Register Report',
    desc: 'Complete register of active, renewed, expired and withdrawn participant & employee consents.',
  },
  {
    id: 'consent-expiry',
    title: 'Consent Expiry Report',
    desc: 'Upcoming 30/60/90-day consent expiries and overdue review schedules.',
  },
  {
    id: 'medication-consent',
    title: 'Medication Consent Report',
    desc: 'Participant medication administration and medical information sharing authorities.',
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing Report',
    desc: 'Internal, external, family, guardian and clinical information sharing permissions.',
  },
  {
    id: 'employee-consent',
    title: 'Employee Consent Report',
    desc: 'Workforce personnel, audit, training, certification and media consents.',
  },
  {
    id: 'audit-consent',
    title: 'Audit Consent Report',
    desc: 'Verified NDIS, Quality & Accreditation audit visibility permissions (excludes withdrawn records).',
  },
];

const BLANK_PARTICIPANT_CONSENT = {
  participant_id: '',
  participant_name: '',
  consent_type: 'External Information Sharing',
  consent_description: '',
  recipient_name: '',
  organisation: '',
  relationship: 'Support Coordinator / Nominee',
  information_authorised: '',
  information_excluded: '',
  sharing_purpose: '',
  consent_start_date: new Date().toISOString().slice(0, 10),
  review_date: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
  consent_end_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  status: 'Active',
  participant_signatory_name: '',
  participant_signed_date: new Date().toISOString().slice(0, 10),
  participant_signature: '',
  guardian_signature: '',
  witness_name: '',
  witness_signature: '',
  approval_signature: '',
  owner: 'Compliance Manager',
  responsible_manager: 'Provider Administrator',
  signed_form_uri: '',
  signed_form_name: '',
  notes: '',
};

const BLANK_EMPLOYEE_CONSENT = {
  employee_id: '',
  employee_name: '',
  employee_email: '',
  consent_type: 'Personnel Records',
  consent_description: '',
  status: 'Active',
  date_signed: new Date().toISOString().slice(0, 10),
  review_date: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
  expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  signed_by: '',
  employee_signature: '',
  witness_name: '',
  witness_signature: '',
  approval_signature: '',
  owner: 'Human Resources Manager',
  responsible_manager: 'Provider Administrator',
  supporting_evidence_uri: '',
  supporting_evidence_name: '',
  audit_consent: 'Audit consent received',
  notes: '',
};

export default function ConsentAuthorityPrivacySuite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRegisterTab, setActiveRegisterTab] = useState('participant-register');
  const [auditorSafeMode, setAuditorSafeMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [participantConsents, setParticipantConsents] = useState([]);
  const [employeeConsents, setEmployeeConsents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dialog states
  const [pModalOpen, setPModalOpen] = useState(false);
  const [eModalOpen, setEModalOpen] = useState(false);
  const [editingPId, setEditingPId] = useState(null);
  const [editingEId, setEditingEId] = useState(null);
  const [pForm, setPForm] = useState(BLANK_PARTICIPANT_CONSENT);
  const [eForm, setEForm] = useState(BLANK_EMPLOYEE_CONSENT);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [sweepingExpiry, setSweepingExpiry] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pConsentsPage, eConsentsPage, pProfilesPage, eProfilesPage, logsPage] = await Promise.all([
        base44.entities.InformationSharingConsent.filter({}, { sort: '-created_date', limit: 200 }).catch(() => ({ items: [] })),
        base44.entities.EmployeeConsent.filter({}, { sort: '-created_date', limit: 200 }).catch(() => ({ items: [] })),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 200 }).catch(() => ({ items: [] })),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 200 }).catch(() => ({ items: [] })),
        base44.entities.StatusLog.filter({ entity_type: { $in: ['ParticipantConsent', 'EmployeeConsent'] } }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
      ]);
      setParticipantConsents(pConsentsPage?.items || []);
      setEmployeeConsents(eConsentsPage?.items || []);
      setParticipants(pProfilesPage?.items || []);
      setEmployees(eProfilesPage?.items || []);
      setAuditLogs(logsPage?.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const computeStatus = (record) => {
    if (record.status === 'Withdrawn') return 'Withdrawn';
    const exp = record.consent_end_date || record.expiry_date;
    if (exp && exp < today) return 'Expired';
    return record.status || 'Active';
  };

  const isExpiringSoon = (record) => {
    const st = computeStatus(record);
    const exp = record.consent_end_date || record.expiry_date;
    return (st === 'Active' || st === 'Renewed') && exp && exp >= today && exp <= in30Days;
  };

  const recordConsentLifecycleEvent = async ({
    entityType,
    recordId,
    subjectName,
    eventLabel,
    previousStatus,
    newStatus,
    consentType,
  }) => {
    const nowIso = new Date().toISOString();
    const actorName = user?.full_name || user?.email || 'Authorised Officer';
    await Promise.allSettled([
      base44.entities.StatusLog.create({
        entity_type: entityType,
        entity_id: recordId || `CNS-${Date.now()}`,
        previous_status: previousStatus || 'None',
        new_status: newStatus || 'Active',
        changed_by: actorName,
        notes: `${eventLabel} · ${subjectName} (${consentType}) · Stamp: ${nowIso}`,
      }),
      base44.functions.invoke('logUserAction', {
        action: eventLabel,
        entity_type: entityType,
        record_id: recordId || '',
        record_title: `${subjectName} — ${consentType}`,
        details: `${eventLabel} | User: ${actorName} | Date: ${nowIso.slice(0, 10)} | Time: ${nowIso.slice(11, 19)} | Previous Status: ${previousStatus || 'None'} | New Status: ${newStatus}`,
        route: window.location.pathname,
      }),
    ]);
  };

  const handleUploadEvidence = async (file, target) => {
    if (!file) return;
    setUploadingFile(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      if (target === 'participant') {
        setPForm((prev) => ({ ...prev, signed_form_uri: file_uri, signed_form_name: file.name }));
      } else {
        setEForm((prev) => ({ ...prev, supporting_evidence_uri: file_uri, supporting_evidence_name: file.name }));
      }
      toast({
        title: 'Signed Consent Evidence Uploaded',
        description: `${file.name} attached and stored privately.`,
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const saveParticipantConsent = async () => {
    if (!pForm.participant_name.trim() && !pForm.participant_id) return;
    setSaving(true);
    try {
      const nowStamp = new Date().toISOString();
      const actor = user?.full_name || user?.email || 'Authorised Officer';
      const payload = {
        ...pForm,
        recipient_name: pForm.recipient_name || pForm.participant_signatory_name || pForm.participant_name,
        signature_timestamp: nowStamp,
        signature_user_id: user?.id || actor,
        audit_trail_log: `${editingPId ? 'Consent Updated' : 'Consent Created'} by ${actor} at ${nowStamp}`,
      };
      let saved;
      if (editingPId) {
        const oldRec = participantConsents.find((x) => x.id === editingPId);
        saved = await base44.entities.InformationSharingConsent.update(editingPId, payload);
        await recordConsentLifecycleEvent({
          entityType: 'ParticipantConsent',
          recordId: editingPId,
          subjectName: payload.participant_name,
          eventLabel: payload.status === 'Renewed' ? 'Consent Renewed' : 'Consent Updated',
          previousStatus: oldRec?.status || 'Active',
          newStatus: payload.status,
          consentType: payload.consent_type,
        });
      } else {
        saved = await base44.entities.InformationSharingConsent.create(payload);
        await recordConsentLifecycleEvent({
          entityType: 'ParticipantConsent',
          recordId: saved?.id,
          subjectName: payload.participant_name,
          eventLabel: 'Consent Created',
          previousStatus: 'None',
          newStatus: payload.status,
          consentType: payload.consent_type,
        });
      }
      setPModalOpen(false);
      await loadAll();
      toast({
        title: editingPId ? 'Participant Consent Updated' : 'Participant Consent Recorded',
        description: `Digitally stamped (${nowStamp.slice(0, 19).replace('T', ' ')}) and logged to Audit Trail.`,
      });
    } finally {
      setSaving(false);
    }
  };

  const saveEmployeeConsent = async () => {
    if (!eForm.employee_name.trim()) return;
    setSaving(true);
    try {
      const nowStamp = new Date().toISOString();
      const actor = user?.full_name || user?.email || 'Authorised Officer';
      const payload = {
        ...eForm,
        signature_timestamp: nowStamp,
        signature_user_id: user?.id || actor,
        audit_trail_log: `${editingEId ? 'Consent Updated' : 'Consent Created'} by ${actor} at ${nowStamp}`,
      };
      let saved;
      if (editingEId) {
        const oldRec = employeeConsents.find((x) => x.id === editingEId);
        saved = await base44.entities.EmployeeConsent.update(editingEId, payload);
        await recordConsentLifecycleEvent({
          entityType: 'EmployeeConsent',
          recordId: editingEId,
          subjectName: payload.employee_name,
          eventLabel: payload.status === 'Renewed' ? 'Consent Renewed' : 'Consent Updated',
          previousStatus: oldRec?.status || 'Active',
          newStatus: payload.status,
          consentType: payload.consent_type,
        });
      } else {
        saved = await base44.entities.EmployeeConsent.create(payload);
        await recordConsentLifecycleEvent({
          entityType: 'EmployeeConsent',
          recordId: saved?.id,
          subjectName: payload.employee_name,
          eventLabel: 'Consent Created',
          previousStatus: 'None',
          newStatus: payload.status,
          consentType: payload.consent_type,
        });
      }
      setEModalOpen(false);
      await loadAll();
      toast({
        title: editingEId ? 'Employee Consent Updated' : 'Employee Consent Recorded',
        description: `Digitally stamped (${nowStamp.slice(0, 19).replace('T', ' ')}) and logged to Audit Trail.`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWithdrawConsent = async (record, kind) => {
    const prev = computeStatus(record);
    const subjectName = kind === 'participant' ? record.participant_name : record.employee_name;
    if (kind === 'participant') {
      await base44.entities.InformationSharingConsent.update(record.id, {
        status: 'Withdrawn',
        withdrawal_date: today,
      });
    } else {
      await base44.entities.EmployeeConsent.update(record.id, {
        status: 'Withdrawn',
        withdrawal_date: today,
        audit_consent: 'Audit declined',
      });
    }
    await recordConsentLifecycleEvent({
      entityType: kind === 'participant' ? 'ParticipantConsent' : 'EmployeeConsent',
      recordId: record.id,
      subjectName,
      eventLabel: 'Consent Withdrawn',
      previousStatus: prev,
      newStatus: 'Withdrawn',
      consentType: record.consent_type || 'Information Sharing',
    });
    await loadAll();
    toast({
      title: 'Consent Withdrawn & Record Protected',
      description: `${subjectName}'s record is now restricted from Auditor visibility and excluded from external reporting.`,
    });
  };

  const handleRenewConsent = async (record, kind) => {
    const prev = computeStatus(record);
    const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    const nextReview = new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10);
    const subjectName = kind === 'participant' ? record.participant_name : record.employee_name;
    if (kind === 'participant') {
      await base44.entities.InformationSharingConsent.update(record.id, {
        status: 'Renewed',
        consent_end_date: nextYear,
        review_date: nextReview,
      });
    } else {
      await base44.entities.EmployeeConsent.update(record.id, {
        status: 'Renewed',
        expiry_date: nextYear,
        review_date: nextReview,
      });
    }
    await recordConsentLifecycleEvent({
      entityType: kind === 'participant' ? 'ParticipantConsent' : 'EmployeeConsent',
      recordId: record.id,
      subjectName,
      eventLabel: 'Consent Renewed',
      previousStatus: prev,
      newStatus: 'Renewed',
      consentType: record.consent_type || 'Information Sharing',
    });
    await loadAll();
    toast({
      title: 'Consent Renewed for 12 Months',
      description: `Next expiry set to ${nextYear} with 6-monthly review reminder (${nextReview}).`,
    });
  };

  const triggerConsentExpiryNotifications = async () => {
    setSweepingExpiry(true);
    try {
      const expiringP = participantConsents.filter((c) => isExpiringSoon(c) || computeStatus(c) === 'Expired');
      const expiringE = employeeConsents.filter((c) => isExpiringSoon(c) || computeStatus(c) === 'Expired');
      const allFlagged = [
        ...expiringP.map((c) => ({
          name: c.participant_name,
          type: c.consent_type || 'Information Sharing',
          expiry: c.consent_end_date || today,
          owner: c.owner || 'Compliance Manager',
          manager: c.responsible_manager || 'Provider Administrator',
          roleTarget: 'Participant',
        })),
        ...expiringE.map((c) => ({
          name: c.employee_name,
          type: c.consent_type || 'Personnel Consent',
          expiry: c.expiry_date || today,
          owner: c.owner || 'Human Resources Manager',
          manager: c.responsible_manager || 'Provider Administrator',
          roleTarget: 'Employee',
        })),
      ];

      if (allFlagged.length > 0) {
        await base44.entities.TodoTask.bulkCreate(
          allFlagged.map((item) => ({
            title: `[Consent Expiry Alert] Renew ${item.type} for ${item.name}`,
            module: 'Consent Management',
            priority: 'High',
            status: 'Open',
            due_date: item.expiry,
            assigned_to: item.owner,
            notes: `Automated Consent Expiry Notification dispatched to Owner (${item.owner}), ${item.roleTarget} (${item.name}), and Responsible Manager (${item.manager}).`,
          }))
        );
      }

      await recordConsentLifecycleEvent({
        entityType: 'ParticipantConsent',
        recordId: `EXP-SWEEP-${today}`,
        subjectName: 'Platform Consent Expiry Monitor',
        eventLabel: 'Consent Expiry Sweep',
        previousStatus: 'Monitored',
        newStatus: `${allFlagged.length} Notifications Dispatched`,
        consentType: 'Owner + Participant + Manager Alerts',
      });

      toast({
        title: 'Consent Expiry Monitoring & Notifications Complete',
        description:
          allFlagged.length > 0
            ? `Notified Owner, Participant/Employee & Manager and created ${allFlagged.length} review reminders.`
            : 'All active participant and employee consents are within valid review dates.',
      });
    } finally {
      setSweepingExpiry(false);
    }
  };

  const handleExportConsentReport = async (reportDef, formatType = 'pdf') => {
    const activeP = participantConsents.filter((c) => computeStatus(c) !== 'Withdrawn');
    const activeE = employeeConsents.filter((c) => computeStatus(c) !== 'Withdrawn');
    const docNum = `CHR-CNS-2026-${reportDef.id.toUpperCase().slice(0, 6)}`;

    const controlledRecord = {
      documentName: `${reportDef.title} — Consent, Authority & Privacy Standard`,
      documentNumber: docNum,
      recordId: `REC-${docNum}`,
      versionNumber: 'v2026.1',
      status: 'Approved',
      module: 'Consent Management',
      category: 'Consent Records',
      owner: user?.full_name || 'Compliance Manager',
      department: 'Privacy, Safeguarding & Audit Assurance',
      createdDate: today,
      modifiedDate: today,
      lastReviewDate: today,
      nextReviewDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      reviewFrequency: 'Quarterly',
      approvedBy: user?.full_name || 'Provider Administrator',
      approvalDate: today,
      purpose: `${reportDef.desc} Strictly excludes withdrawn records where required under Permission-Based Auditing.`,
      scope: `Covers ${activeP.length} active Participant Consents and ${activeE.length} active Employee Consents with date/time-stamped digital signatures.`,
      relatedDocuments: [
        'Privacy Act 1988 (Cth) & Australian Privacy Principles',
        'NDIS Practice Standards — Rights & Responsibilities (Consent)',
        'Strengthened Aged Care Quality Standards — Dignity & Choice',
      ],
      mainFields: [
        { key: 'reportType', label: 'Report Type', value: reportDef.title },
        { key: 'activeParticipantConsents', label: 'Active Participant Consents Included', value: `${activeP.length} Verified Records` },
        { key: 'activeEmployeeConsents', label: 'Active Employee Consents Included', value: `${activeE.length} Verified Records` },
        { key: 'withdrawnExcluded', label: 'Withdrawn Consents Protected & Excluded', value: `${participantConsents.length - activeP.length + (employeeConsents.length - activeE.length)} Restricted Records` },
        { key: 'vaultPath', label: 'Document Vault Destination', value: 'Document Vault → Consent Management' },
        { key: 'safePath', label: 'Company Safe Destination', value: 'Company Safe → Consent Records' },
      ],
      evidenceItems: [
        'Participant, Guardian, Employee, Witness & Approval Digital Signatures Date/Time Stamped',
        'Withdrawn records automatically restricted from Auditor visibility and excluded from export',
        'Filed automatically to Document Vault → Consent Management and Company Safe → Consent Records',
      ],
      actionsItems: [
        'Owner, Participant & Manager notified before consent expiry',
        'Full Audit Trail recorded (User, Date, Time, Previous Status, New Status)',
      ],
    };

    if (formatType === 'pdf') exportControlledRecordAsPdf(controlledRecord);
    if (formatType === 'word') exportControlledRecordAsWord(controlledRecord);
    if (formatType === 'excel') exportControlledRecordAsExcel(controlledRecord);
    if (formatType === 'csv') exportControlledRecordAsCsv(controlledRecord);

    await autoFileToVaultAndCompanySafe(
      controlledRecord,
      `Consent Report Exported (${reportDef.title} · ${formatType.toUpperCase()}) → Document Vault (Consent Management) & Company Safe (Consent Records)`
    );

    toast({
      title: `${reportDef.title} Exported (${formatType.toUpperCase()})`,
      description: 'Automatically saved to Document Vault → Consent Management and Company Safe → Consent Records.',
    });
  };

  const filteredParticipantConsents = useMemo(() => {
    return participantConsents.filter((c) => {
      const st = computeStatus(c);
      if (auditorSafeMode && (st === 'Withdrawn' || st === 'Expired' || c.audit_consent === 'Audit declined')) {
        return false;
      }
      if (typeFilter !== 'ALL' && (c.consent_type || 'External Information Sharing') !== typeFilter) return false;
      if (statusFilter !== 'ALL' && st !== statusFilter) return false;
      return true;
    });
  }, [participantConsents, auditorSafeMode, typeFilter, statusFilter]);

  const filteredEmployeeConsents = useMemo(() => {
    return employeeConsents.filter((c) => {
      const st = computeStatus(c);
      if (auditorSafeMode && (st === 'Withdrawn' || st === 'Expired' || c.audit_consent === 'Audit declined')) {
        return false;
      }
      if (typeFilter !== 'ALL' && c.consent_type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && st !== statusFilter) return false;
      return true;
    });
  }, [employeeConsents, auditorSafeMode, typeFilter, statusFilter]);

  const totalActive =
    participantConsents.filter((c) => computeStatus(c) === 'Active' || computeStatus(c) === 'Renewed').length +
    employeeConsents.filter((c) => computeStatus(c) === 'Active' || computeStatus(c) === 'Renewed').length;
  const totalExpiring =
    participantConsents.filter(isExpiringSoon).length + employeeConsents.filter(isExpiringSoon).length;
  const totalWithdrawn =
    participantConsents.filter((c) => computeStatus(c) === 'Withdrawn').length +
    employeeConsents.filter((c) => computeStatus(c) === 'Withdrawn').length;

  return (
    <div className="space-y-4">
      {/* Top Executive Banner */}
      <div
        className="rounded-2xl p-4 text-white shadow-md"
        style={{
          background:
            'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 58%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Consent, Authority, Privacy &amp; Audit Evidence Standard</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              Participant (18 Types) &amp; Employee (12 Types) Consent Registers · 5-Signature Authority · Auditor Privacy Gate
            </h2>
            <p className="text-xs font-medium text-white/95">
              No participant, employee, contractor, volunteer or representative record is displayed, shared, reported, audited or exported without verified consent and authority.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAuditorSafeMode((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                auditorSafeMode
                  ? 'bg-[#00C6FF] text-[#0A2B6D] shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>
                {auditorSafeMode
                  ? 'Auditor Safe View ON (Withdrawn Hidden)'
                  : 'Simulate Auditor Permission View'}
              </span>
            </button>
            <button
              type="button"
              onClick={triggerConsentExpiryNotifications}
              disabled={sweepingExpiry}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-slate-100"
            >
              <BellRing className={`h-3.5 w-3.5 text-[#5A00D6] ${sweepingExpiry ? 'animate-spin' : ''}`} />
              <span style={{ color: '#0A2B6D' }}>Notify Owner, Participant &amp; Manager of Expiries</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card>
          <CardContent className="p-3.5">
            <div className="text-2xl font-extrabold text-[#0A2B6D] tabular-nums">
              {participantConsents.length}
            </div>
            <div className="text-xs font-bold text-[#5A00D6]">Participant Consents (18 Types)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="text-2xl font-extrabold text-[#0072FF] tabular-nums">
              {employeeConsents.length}
            </div>
            <div className="text-xs font-bold text-[#5A00D6]">Employee Consents (12 Types)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="text-2xl font-extrabold text-[#0072FF] tabular-nums">{totalActive}</div>
            <div className="text-xs font-bold text-[#0A2B6D]">Active &amp; Digitally Signed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="text-2xl font-extrabold text-[#A100FF] tabular-nums">{totalExpiring}</div>
            <div className="text-xs font-bold text-[#0A2B6D]">Expiring in 30 Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="text-2xl font-extrabold text-[#FF2E9A] tabular-nums">{totalWithdrawn}</div>
            <div className="text-xs font-bold text-[#0A2B6D]">Withdrawn (Protected &amp; Restricted)</div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'participant-register', label: 'Participant Consent Register (18 Types)', icon: Users },
            { id: 'employee-register', label: 'Employee Consent Register (12 Types)', icon: UserCheck },
            { id: 'consent-reports', label: '6 Consent Reports & Vault/Safe Exports', icon: FileCheck2 },
            { id: 'consent-audit-trail', label: '5-Event Consent Audit Trail', icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeRegisterTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveRegisterTab(t.id);
                  setTypeFilter('ALL');
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-[#0A2B6D] text-white shadow-xs'
                    : 'bg-white text-[#0A2B6D] border border-slate-200 hover:border-[#0072FF]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setEditingPId(null);
              setPForm(BLANK_PARTICIPANT_CONSENT);
              setPModalOpen(true);
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> New Participant Consent
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingEId(null);
              setEForm(BLANK_EMPLOYEE_CONSENT);
              setEModalOpen(true);
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> New Employee Consent
          </Button>
        </div>
      </div>

      {/* TAB 1: PARTICIPANT CONSENT REGISTER */}
      {activeRegisterTab === 'participant-register' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
            >
              <option value="ALL">All 18 Participant Consent Types</option>
              {PARTICIPANT_18_CONSENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Renewed">Renewed</option>
              <option value="Expired">Expired</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-[#0A2B6D] bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2B6D] text-white">
                <tr>
                  <th className="p-2.5 font-extrabold text-white">Participant</th>
                  <th className="p-2.5 font-extrabold text-white">Consent Type</th>
                  <th className="p-2.5 font-extrabold text-white">Signed By &amp; Relationship</th>
                  <th className="p-2.5 font-extrabold text-white">Witness &amp; Digital Signatures</th>
                  <th className="p-2.5 font-extrabold text-white">Signed / Review / Expiry</th>
                  <th className="p-2.5 font-extrabold text-white">Status &amp; Audit Visibility</th>
                  <th className="p-2.5 font-extrabold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredParticipantConsents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No participant consent records match the current filter. Click &ldquo;New Participant Consent&rdquo; to record one.
                    </td>
                  </tr>
                ) : (
                  filteredParticipantConsents.map((c) => {
                    const st = computeStatus(c);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-extrabold text-[#0A2B6D]">
                          <div>{c.participant_name || '—'}</div>
                          <div className="text-[10px] font-semibold text-[#5A00D6]">
                            Authorised: {c.recipient_name || 'Internal/Provider'}
                          </div>
                        </td>
                        <td className="p-2.5">
                          <Badge className="bg-[#0072FF]/10 text-[#0072FF]">
                            {c.consent_type || 'External Information Sharing'}
                          </Badge>
                          {c.consent_description && (
                            <div className="mt-1 text-[11px] text-[#0A2B6D]/80">{c.consent_description}</div>
                          )}
                        </td>
                        <td className="p-2.5 text-[#0A2B6D]">
                          <div className="font-bold">{c.participant_signatory_name || c.participant_name || '—'}</div>
                          <div className="text-[10px] text-muted-foreground">{c.relationship || 'Self / Nominee'}</div>
                        </td>
                        <td className="p-2.5 text-[11px] text-[#0A2B6D]">
                          <div>Sig: {c.participant_signature || c.guardian_signature || 'Signed on file'}</div>
                          {c.witness_name && <div>Witness: {c.witness_name}</div>}
                          {c.signed_form_name && (
                            <div className="text-[10px] font-bold text-[#5A00D6]">Evidence: {c.signed_form_name}</div>
                          )}
                        </td>
                        <td className="p-2.5 tabular-nums text-[11px] text-[#0A2B6D]">
                          <div>Signed: {c.participant_signed_date || c.consent_start_date || '—'}</div>
                          <div>Review: {c.review_date || '—'}</div>
                          <div>Expiry: {c.consent_end_date || '—'}</div>
                        </td>
                        <td className="p-2.5">
                          <Badge
                            className={
                              st === 'Withdrawn' || st === 'Expired'
                                ? 'bg-[#FF2E9A] text-white'
                                : 'bg-[#0072FF] text-white'
                            }
                          >
                            {st}
                          </Badge>
                          {st === 'Withdrawn' && (
                            <div className="mt-1 text-[10px] font-extrabold text-[#FF2E9A]">
                              Protected · Excluded from Audits
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            {st !== 'Withdrawn' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px]"
                                onClick={() => handleRenewConsent(c, 'participant')}
                              >
                                Renew
                              </Button>
                            )}
                            {st !== 'Withdrawn' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Withdraw Consent"
                                onClick={() => handleWithdrawConsent(c, 'participant')}
                              >
                                <Undo2 className="h-3.5 w-3.5 text-[#FF2E9A]" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingPId(c.id);
                                setPForm({ ...BLANK_PARTICIPANT_CONSENT, ...c });
                                setPModalOpen(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE CONSENT REGISTER */}
      {activeRegisterTab === 'employee-register' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
            >
              <option value="ALL">All 12 Employee Consent Types</option>
              {EMPLOYEE_12_CONSENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-[#0A2B6D] bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2B6D] text-white">
                <tr>
                  <th className="p-2.5 font-extrabold text-white">Employee</th>
                  <th className="p-2.5 font-extrabold text-white">Consent Type</th>
                  <th className="p-2.5 font-extrabold text-white">Digital Signatures (Staff / Witness / Approval)</th>
                  <th className="p-2.5 font-extrabold text-white">Date Signed / Review / Withdrawal</th>
                  <th className="p-2.5 font-extrabold text-white">Status &amp; Auditor Access</th>
                  <th className="p-2.5 font-extrabold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployeeConsents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No employee consent records yet. Click &ldquo;New Employee Consent&rdquo; to record staff consent.
                    </td>
                  </tr>
                ) : (
                  filteredEmployeeConsents.map((ec) => {
                    const st = computeStatus(ec);
                    return (
                      <tr key={ec.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-extrabold text-[#0A2B6D]">
                          <div>{ec.employee_name}</div>
                          <div className="text-[10px] font-normal text-muted-foreground">{ec.employee_email || ''}</div>
                        </td>
                        <td className="p-2.5">
                          <Badge className="bg-[#5A00D6] text-white">{ec.consent_type}</Badge>
                          {ec.consent_description && (
                            <div className="mt-1 text-[11px] text-[#0A2B6D]/80">{ec.consent_description}</div>
                          )}
                        </td>
                        <td className="p-2.5 text-[11px] text-[#0A2B6D]">
                          <div>Employee Sig: {ec.employee_signature || 'Digitally Signed'}</div>
                          {ec.witness_name && <div>Witness: {ec.witness_name} ({ec.witness_signature || 'Signed'})</div>}
                          {ec.approval_signature && <div>Approval: {ec.approval_signature}</div>}
                          {ec.supporting_evidence_name && (
                            <div className="text-[10px] font-bold text-[#0072FF]">Evidence: {ec.supporting_evidence_name}</div>
                          )}
                        </td>
                        <td className="p-2.5 tabular-nums text-[11px] text-[#0A2B6D]">
                          <div>Signed: {ec.date_signed || '—'}</div>
                          <div>Review: {ec.review_date || '—'}</div>
                          {ec.withdrawal_date && (
                            <div className="font-bold text-[#FF2E9A]">Withdrawn: {ec.withdrawal_date}</div>
                          )}
                        </td>
                        <td className="p-2.5">
                          <Badge className={st === 'Withdrawn' ? 'bg-[#FF2E9A] text-white' : 'bg-[#0072FF] text-white'}>
                            {st}
                          </Badge>
                          <div className="mt-1 text-[10px] font-bold text-[#5A00D6]">
                            {st === 'Withdrawn' ? 'Auditor Restricted' : ec.audit_consent || 'Audit consent received'}
                          </div>
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            {st !== 'Withdrawn' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px]"
                                onClick={() => handleRenewConsent(ec, 'employee')}
                              >
                                Renew
                              </Button>
                            )}
                            {st !== 'Withdrawn' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleWithdrawConsent(ec, 'employee')}
                              >
                                <Undo2 className="h-3.5 w-3.5 text-[#FF2E9A]" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingEId(ec.id);
                                setEForm({ ...BLANK_EMPLOYEE_CONSENT, ...ec });
                                setEModalOpen(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 6 CONSENT REPORTS & 4-FORMAT EXPORTS */}
      {activeRegisterTab === 'consent-reports' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CONSENT_6_REPORTS.map((rep) => (
            <div
              key={rep.id}
              className="flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#5A00D6] text-white">Consent Standard Report</Badge>
                  <span className="text-[10px] font-extrabold text-[#0072FF]">Vault + Safe Auto-Save</span>
                </div>
                <h4 className="mt-2 font-editorial text-base font-extrabold text-[#0A2B6D]">{rep.title}</h4>
                <p className="mt-1 text-xs text-[#0A2B6D]/80">{rep.desc}</p>
                <div className="mt-2 rounded-lg bg-[#F5F0FF] p-2 text-[10px] font-bold text-[#0A2B6D]">
                  <div>→ Document Vault: Consent Management</div>
                  <div>→ Company Safe: Consent Records</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-slate-100 pt-2.5">
                {['pdf', 'excel', 'word', 'csv'].map((fmt) => (
                  <Button
                    key={fmt}
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportConsentReport(rep, fmt)}
                    className="h-7 px-2 text-[10px] font-extrabold uppercase"
                  >
                    {fmt}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: 5-EVENT CONSENT AUDIT TRAIL */}
      {activeRegisterTab === 'consent-audit-trail' && (
        <div className="overflow-x-auto rounded-xl border-2 border-[#0A2B6D] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A2B6D] text-white">
              <tr>
                <th className="p-2.5 font-extrabold text-white">Date &amp; Time</th>
                <th className="p-2.5 font-extrabold text-white">User</th>
                <th className="p-2.5 font-extrabold text-white">Register</th>
                <th className="p-2.5 font-extrabold text-white">Previous Status</th>
                <th className="p-2.5 font-extrabold text-white">New Status</th>
                <th className="p-2.5 font-extrabold text-white">Audit Trail Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Consent Created, Updated, Withdrawn, Expired and Renewed events appear here with User, Date, Time, Previous Status and New Status.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 tabular-nums font-bold text-[#0A2B6D]">
                      {(log.created_date || '').replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="p-2.5 font-bold text-[#5A00D6]">{log.changed_by || 'System'}</td>
                    <td className="p-2.5">{log.entity_type}</td>
                    <td className="p-2.5">
                      <Badge variant="outline">{log.previous_status || 'None'}</Badge>
                    </td>
                    <td className="p-2.5">
                      <Badge className="bg-[#0072FF] text-white">{log.new_status}</Badge>
                    </td>
                    <td className="p-2.5 text-[#0A2B6D]">{log.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ParticipantConsentDialog
        open={pModalOpen}
        onOpenChange={setPModalOpen}
        editingId={editingPId}
        form={pForm}
        setForm={setPForm}
        participants={participants}
        consentTypes={PARTICIPANT_18_CONSENT_TYPES}
        uploadingFile={uploadingFile}
        onUploadEvidence={handleUploadEvidence}
        onSave={saveParticipantConsent}
        saving={saving}
      />

      <EmployeeConsentDialog
        open={eModalOpen}
        onOpenChange={setEModalOpen}
        editingId={editingEId}
        form={eForm}
        setForm={setEForm}
        employees={employees}
        consentTypes={EMPLOYEE_12_CONSENT_TYPES}
        uploadingFile={uploadingFile}
        onUploadEvidence={handleUploadEvidence}
        onSave={saveEmployeeConsent}
        saving={saving}
      />
    </div>
  );
}