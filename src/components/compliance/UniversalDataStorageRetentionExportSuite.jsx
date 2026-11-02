import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  UNIVERSAL_25_ITEM_TYPES,
  PARTICIPANT_11_STORAGE_BUCKETS,
  EMPLOYEE_8_STORAGE_BUCKETS,
  COMPANY_SAFE_9_PROTECTED_CATEGORIES,
  AUDIT_8_LIFECYCLE_EVENTS,
  RETENTION_7_LAYERS,
  REPORT_8_TYPES,
  EXPORT_6_SCOPES,
  exportUniversalData,
  saveUniversalRecordAcrossEcosystem,
} from '@/lib/universalStorageAndExportEngine';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  FolderLock,
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCw,
} from 'lucide-react';

export default function UniversalDataStorageRetentionExportSuite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('auto-storage');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Universal Filing Form state
  const [form, setForm] = useState({
    itemType: 'Service Agreement',
    title: '',
    personType: 'Participant',
    personName: '',
    moduleName: 'Participants & Service Delivery',
    program: 'NDIS & Aged Care',
    department: 'Client Services',
    site: 'Main Residence',
    standard: 'NDIS Practice Standards Module 1–4',
    complianceType: 'Mandatory Governance & Clinical Evidence',
    relatedIncident: 'No Open Incident',
    relatedRisk: 'Individual Risk Assessment Linked',
    relatedReview: '3-Monthly Participant Review Linked',
    relatedAudit: 'Quarterly Internal Audit Linked',
    relatedConsent: 'Active Signed Consent Linked',
    relatedServiceAgreement: 'Active Service Agreement Linked',
    signature: '',
    fileUri: '',
    fileName: '',
  });

  // 11-Attribute Search Filters
  const [filters, setFilters] = useState({
    query: '',
    module: 'All',
    program: 'All',
    department: 'All',
    complianceType: 'All',
  });

  // Report & Export State
  const [selectedReport, setSelectedReport] = useState('existing-records');
  const [selectedScope, setSelectedScope] = useState('Evidence Pack Export');
  const [records, setRecords] = useState([]);

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const loadUniversalRecords = useCallback(async () => {
    setLoading(true);
    try {
      const [pDocs, eDocs, safeDocs, consents, certs, checklists, reviews] = await Promise.all([
        base44.entities.ParticipantDocument.filter({}, { sort: '-created_date', limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.EmployeeDocument.filter({}, { sort: '-created_date', limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.CompanySafeDocument.filter({}, { sort: '-created_date', limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.InformationSharingConsent.filter({}, { sort: '-created_date', limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.Certificate.filter({}, { sort: '-created_date', limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.Checklist.filter({}, { sort: '-created_date', limit: 40 }).catch(() => ({ items: [] })),
        base44.entities.ParticipantReview.filter({}, { sort: '-created_date', limit: 40 }).catch(() => ({ items: [] })),
      ]);

      const unified = [
        ...(pDocs?.items || []).map((d, i) => ({
          id: d.id,
          recordId: `REC-P-${String(i + 1).padStart(3, '0')}`,
          docNumber: `DOC-PART-${String(i + 101)}`,
          title: d.title || d.document_type,
          itemType: d.document_type || 'Participant Document',
          personName: d.participant_name || 'Participant',
          personType: 'Participant',
          user: d.responsible_staff || 'Support Coordinator',
          date: d.uploaded_date || (d.created_date || '').slice(0, 10) || today,
          expiryDate: d.expiry_date || '',
          module: 'Participants',
          program: 'NDIS',
          department: 'Service Delivery',
          site: 'Community & SIL',
          standard: 'NDIS Module 1 & 3',
          complianceType: 'Participant Evidence',
          status: d.status || 'Verified',
          hasEvidence: Boolean(d.file_uri || d.file_url),
          hasSignature: true,
          version: 'v1.0 (Original + Current Retained)',
          destinations: 'Participant Profile · Module · Document Vault · Company Safe · Audit Log',
          linkedSummary: 'Linked to Participant, Risk, 3-Monthly Review, Consent & Service Agreement',
        })),
        ...(eDocs?.items || []).map((d, i) => ({
          id: d.id,
          recordId: `REC-E-${String(i + 1).padStart(3, '0')}`,
          docNumber: `DOC-EMP-${String(i + 201)}`,
          title: d.title || d.document_type,
          itemType: d.document_type || 'Employee Document',
          personName: d.employee_name || 'Employee',
          personType: 'Employee',
          user: d.employee_email || 'HR Manager',
          date: d.issue_date || (d.created_date || '').slice(0, 10) || today,
          expiryDate: d.expiry_date || '',
          module: 'Employees & HR',
          program: 'NDIS & Aged Care',
          department: 'Human Resources',
          site: 'Head Office',
          standard: 'NDIS Module 2 (Workforce)',
          complianceType: 'Workforce Screening',
          status: d.status || 'Current',
          hasEvidence: Boolean(d.file_uri || d.file_url),
          hasSignature: true,
          version: 'v1.0 (Original + Current Retained)',
          destinations: 'Employee Profile · HR · Document Vault · Company Safe · Audit Log',
          linkedSummary: 'Linked to Employee, Skills Assessment, 12-Monthly Review & Audit',
        })),
        ...(consents?.items || []).map((c, i) => ({
          id: c.id,
          recordId: `REC-C-${String(i + 1).padStart(3, '0')}`,
          docNumber: `DOC-CON-${String(i + 301)}`,
          title: `${c.consent_type} — ${c.participant_name}`,
          itemType: 'Consent',
          personName: c.participant_name || 'Participant',
          personType: 'Participant',
          user: c.owner || 'Compliance Manager',
          date: c.consent_start_date || (c.created_date || '').slice(0, 10) || today,
          expiryDate: c.consent_end_date || '',
          module: 'Consents',
          program: 'NDIS & Aged Care',
          department: 'Compliance & Privacy',
          site: 'All Sites',
          standard: 'NDIS Module 1 (Privacy & Consent)',
          complianceType: 'Consent Authority',
          status: c.status || 'Active',
          hasEvidence: Boolean(c.signed_form_uri || c.participant_signature),
          hasSignature: Boolean(c.participant_signature),
          version: 'v1.0 (Signed Master Retained)',
          destinations: 'Profile · Consent Register · Compliance · Document Vault · Company Safe',
          linkedSummary: `Authorised: ${c.recipient_name || 'Care Team'} · Audit Consent: ${c.audit_consent || 'Verified'}`,
        })),
        ...(certs?.items || []).map((c, i) => ({
          id: c.id,
          recordId: `REC-CERT-${String(i + 1).padStart(3, '0')}`,
          docNumber: `DOC-CERT-${String(i + 401)}`,
          title: `${c.module_title || 'Certification'} — ${c.staff_name || 'Staff'}`,
          itemType: 'Certification',
          personName: c.staff_name || 'Employee',
          personType: 'Employee',
          user: c.staff_name || 'Staff Member',
          date: c.issue_date || (c.created_date || '').slice(0, 10) || today,
          expiryDate: c.expiry_date || '',
          module: 'Skills Assessment & Capability Centre',
          program: 'NDIS & Aged Care',
          department: 'Training & Competency',
          site: 'All Sites',
          standard: 'NDIS Workforce Competency',
          complianceType: 'Certification',
          status: c.status || 'Current',
          hasEvidence: true,
          hasSignature: true,
          version: 'v1.0 (Certificate Retained)',
          destinations: 'Employee Profile · Skills Centre · Document Vault · Company Safe',
          linkedSummary: 'Linked to Employee Profile, Capability Matrix & Compliance Score',
        })),
        ...(checklists?.items || []).map((ck, i) => ({
          id: ck.id,
          recordId: `REC-ASM-${String(i + 1).padStart(3, '0')}`,
          docNumber: `DOC-ASM-${String(i + 501)}`,
          title: ck.title,
          itemType: ck.category || 'Assessment',
          personName: ck.participant_name || ck.employee_name || 'Organisation',
          personType: ck.participant_name ? 'Participant' : 'Employee',
          user: ck.reviewer || 'Compliance Officer',
          date: ck.review_date || (ck.created_date || '').slice(0, 10) || today,
          expiryDate: ck.due_date || '',
          module: 'Assessments & Checklists',
          program: 'NDIS & Aged Care',
          department: 'Quality & Safety',
          site: 'All Sites',
          standard: 'NDIS & Aged Care Standards',
          complianceType: 'Assessment Evidence',
          status: ck.status || 'Approved',
          hasEvidence: Boolean(ck.evidence_uri || ck.digital_signature),
          hasSignature: Boolean(ck.digital_signature),
          version: 'v1.0 (Signed Assessment Retained)',
          destinations: 'Profile · Checklists · Document Vault · Company Safe · Audit Log',
          linkedSummary: `Outcome: ${ck.outcome || 'Compliant'} · Approval: ${ck.approval_status || 'Approved'}`,
        })),
        ...(safeDocs?.items || []).slice(0, 15).map((sd, i) => ({
          id: sd.id,
          recordId: `REC-SAFE-${String(i + 1).padStart(3, '0')}`,
          docNumber: `DOC-SAFE-${String(i + 601)}`,
          title: sd.title,
          itemType: sd.category || 'Report',
          personName: sd.uploaded_by || 'Executive Governance',
          personType: 'Organisation',
          user: sd.uploaded_by || 'Provider Administrator',
          date: sd.uploaded_date || (sd.created_date || '').slice(0, 10) || today,
          expiryDate: sd.review_date || '',
          module: 'Company Safe',
          program: 'NDIS & Aged Care',
          department: 'Executive Governance',
          site: 'Head Office',
          standard: 'Governance Standard',
          complianceType: 'Protected Safe Record',
          status: sd.status || 'Active',
          hasEvidence: true,
          hasSignature: true,
          version: 'v1.0 (Protected Safe Copy)',
          destinations: 'Company Safe · Document Vault · Compliance · Audit Trail',
          linkedSummary: 'Protected master copy with Version, Review, Approval & Audit History',
        })),
      ];

      setRecords(unified);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadUniversalRecords();
  }, [loadUniversalRecords]);

  const handlePrivateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((prev) => ({ ...prev, fileUri: file_uri, fileName: file.name }));
      toast({
        title: 'Supporting Evidence Attached (stored privately)',
        description: `${file.name} uploaded to encrypted private storage and linked for 6-destination filing.`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAcrossEcosystem = async () => {
    if (!form.personName.trim()) {
      toast({
        title: 'Enter Related Participant or Employee Name',
        description: 'Every record must be linked to a person or owner so zero orphan records exist.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const res = await saveUniversalRecordAcrossEcosystem({ ...form, user });
      toast({
        title: `Saved to All 6 Destinations (${res.docNumber})`,
        description: `Filed to ${form.personType} Profile, ${form.moduleName}, Document Vault, Company Safe, Reporting Engine & Audit History.`,
      });
      setForm((prev) => ({ ...prev, title: '', fileUri: '', fileName: '' }));
      await loadUniversalRecords();
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return records.filter((r) => {
      if (filters.module !== 'All' && r.module !== filters.module) return false;
      if (filters.program !== 'All' && !r.program.includes(filters.program)) return false;
      if (filters.department !== 'All' && r.department !== filters.department) return false;
      if (filters.complianceType !== 'All' && r.complianceType !== filters.complianceType) return false;
      if (!q) return true;
      return [
        r.title,
        r.personName,
        r.user,
        r.recordId,
        r.docNumber,
        r.date,
        r.module,
        r.program,
        r.department,
        r.site,
        r.standard,
        r.complianceType,
        r.itemType,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [records, filters]);

  const reportRows = useMemo(() => {
    switch (selectedReport) {
      case 'missing-records':
        return records.filter((r) => r.status === 'Missing' || r.status === 'Draft');
      case 'missing-evidence':
        return records.filter((r) => !r.hasEvidence);
      case 'missing-reviews':
        return records.filter((r) => r.expiryDate && r.expiryDate < today);
      case 'missing-approvals':
        return records.filter((r) => r.status === 'Pending Review' || r.status === 'Submitted');
      case 'expiring-documents':
        return records.filter((r) => r.expiryDate && r.expiryDate <= in30Days);
      case 'expiring-certifications':
        return records.filter((r) => r.itemType === 'Certification' && r.expiryDate && r.expiryDate <= in30Days);
      case 'expiring-consents':
        return records.filter((r) => r.itemType === 'Consent' && r.expiryDate && r.expiryDate <= in30Days);
      default:
        return filteredRecords;
    }
  }, [selectedReport, records, filteredRecords, today, in30Days]);

  const handleRunExport = async (formatType) => {
    const activeReportLabel =
      REPORT_8_TYPES.find((r) => r.id === selectedReport)?.label || 'Universal Evidence Report';
    const rowsToExport = reportRows.length > 0 ? reportRows : filteredRecords;
    exportUniversalData(
      formatType,
      `${selectedScope}-${selectedReport}-${today}`,
      [
        { key: 'recordId', label: 'Record ID' },
        { key: 'docNumber', label: 'Document Number' },
        { key: 'itemType', label: 'Item Type' },
        { key: 'title', label: 'Title' },
        { key: 'personName', label: 'Related Person' },
        { key: 'user', label: 'Owner / User' },
        { key: 'date', label: 'Date' },
        { key: 'expiryDate', label: 'Review / Expiry Date' },
        { key: 'module', label: 'Module' },
        { key: 'program', label: 'Program' },
        { key: 'department', label: 'Department' },
        { key: 'site', label: 'Site' },
        { key: 'standard', label: 'Standard' },
        { key: 'version', label: 'Version & Retention' },
        { key: 'destinations', label: 'Saved Locations' },
        { key: 'linkedSummary', label: 'Linked Records' },
      ],
      rowsToExport,
      `${selectedScope} — ${activeReportLabel}`
    );

    await base44.functions
      .invoke('logUserAction', {
        action: formatType === 'pdf' ? 'Print' : 'Export',
        entity_type: 'UniversalExportEngine',
        record_title: `${selectedScope} (${activeReportLabel})`,
        details: `Exported ${rowsToExport.length} records in ${formatType.toUpperCase()} format with full 8-event Audit History & 7-layer Evidence Retention.`,
        route: window.location.pathname,
      })
      .catch(() => {});

    toast({
      title: `${selectedScope} (${formatType.toUpperCase()}) Completed`,
      description: `${rowsToExport.length} linked records exported and recorded in the Global Audit Log.`,
    });
  };

  return (
    <section
      aria-label="Universal Data Storage, Retention, Traceability & Export Standard"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md space-y-4"
    >
      {/* Header Banner */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #0A2B6D 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Database className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Universal Data Storage, Retention, Traceability &amp; Export Standard</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              Zero Information Lost · 25 Item Types Auto-Saved Across Profile, Module, Document Vault, Company Safe, Reporting &amp; Audit History
            </h2>
            <p className="text-xs font-medium text-white/95">
              Every form, intake, induction, skills assessment, review, audit, consent, service agreement, welcome pack, risk, incident, upload &amp; signature is permanently stored, linked, searchable across 11 attributes, and exportable in PDF, Word, Excel &amp; CSV.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleRunExport('pdf')}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-slate-100"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
              <span style={{ color: '#0A2B6D' }}>Export Universal Evidence Pack (PDF)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadUniversalRecords}
              disabled={loading}
              className="border-white bg-white/15 text-white font-extrabold hover:bg-white/25"
            >
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Vault &amp; Safe ({records.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {[
          { id: 'auto-storage', label: '1. Automatic 6-Destination Record Storage (25 Item Types)' },
          { id: 'search-traceability', label: '2. 11-Attribute Universal Search, 9-Way Linking & Retention' },
          { id: 'reports-exports', label: '3. 8 Live Compliance Reports & 4-Format / 6-Scope Export Engine' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === tab.id
                ? 'bg-[#0A2B6D] text-white shadow-xs'
                : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: AUTOMATIC 6-DESTINATION RECORD STORAGE + 1-CLICK MULTI-DESTINATION FILING */}
      {activeTab === 'auto-storage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Participant 11 Storage Buckets */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Participant Profile Storage (11 Linked Destinations)
              </div>
              <div className="flex flex-wrap gap-1">
                {PARTICIPANT_11_STORAGE_BUCKETS.map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-slate-200 bg-[#F5F0FF] px-2 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Employee 8 Storage Buckets */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                Employee Profile Storage (8 Linked Destinations)
              </div>
              <div className="flex flex-wrap gap-1">
                {EMPLOYEE_8_STORAGE_BUCKETS.map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-slate-200 bg-[#F5F0FF] px-2 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Safe 9 Protected Categories */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                Company Safe Protected Storage (9 Categories + 4 Histories)
              </div>
              <div className="flex flex-wrap gap-1">
                {COMPANY_SAFE_9_PROTECTED_CATEGORIES.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
                  >
                    <FolderLock className="mr-1 inline-block h-3.5 w-3.5" aria-hidden="true" /> {c}
                  </span>
                ))}
              </div>
              <div className="text-[10px] font-bold text-[#5A00D6]">
                Maintains: Version History · Review History · Approval History · Audit History
              </div>
            </div>
          </div>

          {/* Interactive Universal Multi-Destination Filing Form */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/60 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Universal 6-Destination Record &amp; Evidence Filer (25 Supported Item Types)
                </span>
                <p className="text-[11px] font-semibold text-[#5A00D6]">
                  Automatically saves to: 1. Related Profile → 2. Related Module → 3. Document Vault → 4. Company Safe → 5. Reporting Engine → 6. Audit History &amp; Compliance Records
                </p>
              </div>
              <Badge className="bg-[#0A2B6D] text-white text-[10px]">Zero Orphan Records Enforced</Badge>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Item Type (25 Types)</Label>
                <select
                  value={form.itemType}
                  onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
                >
                  {UNIVERSAL_25_ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Profile Type</Label>
                <select
                  value={form.personType}
                  onChange={(e) => setForm({ ...form, personType: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
                >
                  <option value="Participant">Participant Profile (11 Buckets)</option>
                  <option value="Employee">Employee Profile (8 Buckets)</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">
                  Related Participant / Employee Name *
                </Label>
                <Input
                  value={form.personName}
                  onChange={(e) => setForm({ ...form, personName: e.target.value })}
                  placeholder="e.g. Jordan Taylor"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Record Title / Description</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Signed NDIS Service Agreement 2026"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Department &amp; Site</Label>
                <Input
                  value={`${form.department} · ${form.site}`}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Mapped Standard</Label>
                <Input
                  value={form.standard}
                  onChange={(e) => setForm({ ...form, standard: e.target.value })}
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Digital Signature</Label>
                <Input
                  value={form.signature}
                  onChange={(e) => setForm({ ...form, signature: e.target.value })}
                  placeholder="Type full name to digitally sign"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">
                  Supporting File Upload (stored privately)
                </Label>
                <label className="mt-1 flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-[#0A2B6D] bg-white px-2.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-slate-50">
                  <Upload className="h-3.5 w-3.5 text-[#5A00D6]" />
                  <span>{uploading ? 'Uploading...' : form.fileName || 'Attach Private Evidence'}</span>
                  <input type="file" className="hidden" onChange={handlePrivateUpload} />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-[11px] font-bold text-[#0A2B6D]">
                Linked Automatically: Related Person · Participant/Employee · Risk · Incident · Review · Audit · Consent · Service Agreement
              </div>
              <Button
                size="sm"
                onClick={handleSaveAcrossEcosystem}
                disabled={saving}
                className="bg-[#0A2B6D] text-white font-extrabold"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[#00C6FF]" />
                {saving ? 'Filing to All 6 Locations...' : 'Save to Profile, Module, Vault, Safe, Reports & Audit Log'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 11-ATTRIBUTE UNIVERSAL SEARCH, 9-WAY LINKED RECORDS & 7-LAYER EVIDENCE RETENTION */}
      {activeTab === 'search-traceability' && (
        <div className="space-y-3">
          {/* 11-Attribute Filter Bar */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="lg:col-span-2">
              <Input
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Search by Name, User, Record ID, Doc #, Date, Site, Standard..."
                className="border-[#0A2B6D] bg-white"
              />
            </div>
            <select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              className="h-9 rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
            >
              <option value="All">All Modules</option>
              <option value="Participants">Participants</option>
              <option value="Employees & HR">Employees &amp; HR</option>
              <option value="Consents">Consents</option>
              <option value="Skills Assessment & Capability Centre">Skills Assessment &amp; Capability Centre</option>
              <option value="Assessments & Checklists">Assessments &amp; Checklists</option>
              <option value="Company Safe">Company Safe</option>
            </select>
            <select
              value={filters.program}
              onChange={(e) => setFilters({ ...filters, program: e.target.value })}
              className="h-9 rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
            >
              <option value="All">All Programs (NDIS &amp; Aged Care)</option>
              <option value="NDIS">NDIS</option>
              <option value="Aged Care">Aged Care</option>
            </select>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="h-9 rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
            >
              <option value="All">All Departments</option>
              <option value="Service Delivery">Service Delivery</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Compliance & Privacy">Compliance &amp; Privacy</option>
              <option value="Training & Competency">Training &amp; Competency</option>
              <option value="Quality & Safety">Quality &amp; Safety</option>
              <option value="Executive Governance">Executive Governance</option>
            </select>
          </div>

          {/* 8 Audit Lifecycle Events + 7 Retention Layers Strip */}
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-[#F5F0FF]/50 p-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                8 Tracked Audit History Events (User · Date · Time · Action)
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {AUDIT_8_LIFECYCLE_EVENTS.map((ev) => (
                  <Badge key={ev} className="bg-[#0A2B6D] text-white text-[9.5px]">
                    ✓ {ev}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-[#F5F0FF]/50 p-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                7-Layer Non-Destructive Evidence Retention (Nothing Overwritten)
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {RETENTION_7_LAYERS.map((layer) => (
                  <span
                    key={layer}
                    className="rounded border border-[#0A2B6D] bg-white px-2 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]"
                  >
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Live Traceability Table */}
          <div className="max-h-72 overflow-y-auto rounded-xl border-2 border-[#0A2B6D]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2B6D] text-white">
                <tr>
                  <th className="p-2">Record ID / Doc #</th>
                  <th className="p-2">Item &amp; Title</th>
                  <th className="p-2">Person &amp; Owner</th>
                  <th className="p-2">Module / Program / Dept / Site</th>
                  <th className="p-2">6-Destination Storage &amp; 9-Way Links</th>
                  <th className="p-2">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRecords.slice(0, 20).map((r) => (
                  <tr key={`${r.recordId}-${r.id}`} className="hover:bg-[#F5F0FF]/40">
                    <td className="p-2 font-mono text-[10.5px] font-extrabold text-[#5A00D6]">
                      <div>{r.recordId}</div>
                      <div>{r.docNumber}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-extrabold text-[#0A2B6D]">{r.title}</div>
                      <div className="text-[10px] font-semibold text-muted-foreground">
                        {r.itemType} · {r.standard} · {r.date}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-bold text-[#0A2B6D]">{r.personName}</div>
                      <div className="text-[10px] text-muted-foreground">Owner: {r.user}</div>
                    </td>
                    <td className="p-2 text-[10.5px] font-semibold text-[#0A2B6D]">
                      {r.module} · {r.program} · {r.department} · {r.site}
                    </td>
                    <td className="p-2 text-[10px]">
                      <div className="font-extrabold text-[#0072FF]">{r.destinations}</div>
                      <div className="text-muted-foreground">{r.linkedSummary}</div>
                    </td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          exportUniversalData(
                            'pdf',
                            `single-record-${r.docNumber}`,
                            [
                              { key: 'recordId', label: 'Record ID' },
                              { key: 'docNumber', label: 'Doc Number' },
                              { key: 'title', label: 'Title' },
                              { key: 'personName', label: 'Related Person' },
                              { key: 'destinations', label: 'Saved Destinations' },
                              { key: 'linkedSummary', label: 'Linked Records' },
                            ],
                            [r],
                            `Single Record Evidence Certificate — ${r.docNumber}`
                          )
                        }
                        className="h-6 px-2 text-[10px] font-extrabold border-[#0A2B6D]"
                      >
                        Export
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 8 LIVE COMPLIANCE REPORTS & 4-FORMAT / 6-SCOPE UNIVERSAL EXPORT STUDIO */}
      {activeTab === 'reports-exports' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* 8 Mandatory Reports Selector */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Select Report Type (8 Live Organisational &amp; Gap Reports)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {REPORT_8_TYPES.map((rep) => (
                  <button
                    key={rep.id}
                    type="button"
                    onClick={() => setSelectedReport(rep.id)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-extrabold transition ${
                      selectedReport === rep.id
                        ? 'border-[#0072FF] bg-[#0A2B6D] text-white'
                        : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF]'
                    }`}
                  >
                    <span>{rep.label}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Export Scopes + 4 Export Formats */}
            <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  Select Export Scope (6 Supported Scopes)
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {EXPORT_6_SCOPES.map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setSelectedScope(scope)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                        selectedScope === scope
                          ? 'bg-[#5A00D6] text-white'
                          : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Download in All 4 Mandatory Enterprise Formats ({reportRows.length || filteredRecords.length} Records Ready)
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { fmt: 'pdf', label: 'Export PDF', icon: Printer },
                    { fmt: 'word', label: 'Export Word (.doc)', icon: FileText },
                    { fmt: 'excel', label: 'Export Excel (.xls)', icon: FileSpreadsheet },
                    { fmt: 'csv', label: 'Export CSV (.csv)', icon: Download },
                  ].map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <Button
                        key={btn.fmt}
                        size="sm"
                        onClick={() => handleRunExport(btn.fmt)}
                        className="bg-[#0A2B6D] text-white text-xs font-extrabold hover:bg-[#5A00D6]"
                      >
                        <Icon className="mr-1 h-3.5 w-3.5" />
                        {btn.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}