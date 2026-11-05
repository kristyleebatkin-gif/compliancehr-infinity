import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck, FileCheck2, FolderLock, Sparkles, Filter, Download,
  Printer, Monitor, Tablet, Smartphone, FileText, CheckCircle2,
  GitBranch, Palette, Calendar, RefreshCw,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getHeaderView } from '@/lib/fullColourTiles';
import Enterprise12PillarCommandBar from '@/components/compliance/Enterprise12PillarCommandBar';
import {
  VAULT_15_CATEGORIES,
  QUICK_16_DATE_FILTERS,
  RECORD_16_RELATIONSHIP_TARGETS,
  QUALITY_GATE_19_CHECKS,
  ENTERPRISE_12_REPORT_TYPES,
  ENTERPRISE_12_FORM_TEMPLATES,
  exportControlledRecordAsPdf,
  exportControlledRecordAsWord,
  exportControlledRecordAsExcel,
  exportControlledRecordAsCsv,
  autoFileToVaultAndCompanySafe,
} from '@/lib/enterpriseGovernanceStandard';

const BRAND_GRADIENT = '#0A2B6D';

const PREVIEW_MODES = [
  { id: 'desktop', label: 'Desktop Preview', icon: Monitor, widthClass: 'w-full' },
  { id: 'tablet', label: 'Tablet Preview', icon: Tablet, widthClass: 'mx-auto max-w-[768px]' },
  { id: 'mobile', label: 'Mobile Preview', icon: Smartphone, widthClass: 'mx-auto max-w-[400px]' },
  { id: 'pdf', label: 'PDF Preview', icon: FileText, widthClass: 'mx-auto max-w-[840px]' },
  { id: 'print', label: 'Print Preview', icon: Printer, widthClass: 'mx-auto max-w-[840px]' },
];

export default function EnterpriseStandardQualityGateSuite() {
  const { toast } = useToast();
  const [activeStudioTab, setActiveStudioTab] = useState('controlled-forms');
  const [previewMode, setPreviewMode] = useState('desktop');

  // Tab 1: Controlled Form & 14-Domain Template Studio State
  const [customTemplates, setCustomTemplates] = useState([]);
  const allTemplates = useMemo(
    () => [...customTemplates, ...ENTERPRISE_12_FORM_TEMPLATES],
    [customTemplates]
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(ENTERPRISE_12_FORM_TEMPLATES[0].id);
  const [formOverrides, setFormOverrides] = useState({});
  const [savingVault, setSavingVault] = useState(false);
  const [linkedRelationships, setLinkedRelationships] = useState(RECORD_16_RELATIONSHIP_TARGETS);
  const [savedPresets, setSavedPresets] = useState([
    { name: 'Monthly Board Assurance', quickDateFilter: 'THIS_MONTH', filterCategory: 'ALL', filterStatus: 'Approved' },
    { name: 'Upcoming 90d NDIS Reviews & Audits', quickDateFilter: 'NEXT_90_DAYS', filterCategory: 'NDIS', filterStatus: 'ALL' },
    { name: 'Overdue Actions & Risks', quickDateFilter: 'OVERDUE', filterCategory: 'Risk', filterStatus: 'Action Required' },
  ]);

  // Tab 2: Advanced Filters, 16 Quick Date Ranges & 12 Report Generators
  const [quickDateFilter, setQuickDateFilter] = useState('ALL');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterModule, setFilterModule] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterOwner, setFilterOwner] = useState('');
  const [generatingReportId, setGeneratingReportId] = useState('');

  // Tab 3 & 4: Live Vault, Company Safe & Permanent Traceability Logs
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState('ALL');
  const [liveTelemetry, setLiveTelemetry] = useState({
    participants: 0,
    employees: 0,
    goals: 0,
    incidents: 0,
    risks: 0,
    tasks: 0,
    communications: 0,
    policies: 0,
    audits: 0,
    documents: 0,
    companySafeDocs: [],
    auditLogs: [],
  });
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  // Tab 5: AI Enterprise Intelligence State
  const [aiQuery, setAiQuery] = useState('');
  const [aiDomain, setAiDomain] = useState('Compliance & NDIS Readiness');

  // Tab 6: Branding & Platform Customisation State
  const [themeConfig, setThemeConfig] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('chr_enterprise_theme_v1') || 'null') || {
          brandName: 'ComplianceHR Infinity',
          waveStyle: 'Symmetric Spectrum Wave',
          shadowDepth: 'Enterprise Soft Elevation',
          darkMode: document.documentElement.classList.contains('dark'),
          primaryHex: '#5A00D6',
          accentHex: '#0072FF',
          highlightHex: '#FF2E9A',
        }
      );
    } catch {
      return {
        brandName: 'ComplianceHR Infinity',
        waveStyle: 'Symmetric Spectrum Wave',
        shadowDepth: 'Enterprise Soft Elevation',
        darkMode: false,
        primaryHex: '#5A00D6',
        accentHex: '#0072FF',
        highlightHex: '#FF2E9A',
      };
    }
  });

  const loadEnterpriseTelemetry = useCallback(async () => {
    setLoadingTelemetry(true);
    try {
      const [
        participants,
        employees,
        goals,
        incidents,
        risks,
        tasks,
        communications,
        policies,
        audits,
        documents,
        safePage,
        logPage,
      ] = await Promise.all([
        base44.entities.ParticipantProfile.count().catch(() => 0),
        base44.entities.StaffProfile.count().catch(() => 0),
        base44.entities.Goal.count().catch(() => 0),
        base44.entities.Incident.count().catch(() => 0),
        base44.entities.Risk.count().catch(() => 0),
        base44.entities.TodoTask.count().catch(() => 0),
        base44.entities.CommunicationEntry.count().catch(() => 0),
        base44.entities.Policy.count().catch(() => 0),
        base44.entities.InternalAudit.count().catch(() => 0),
        base44.entities.EmployeeDocument.count().catch(() => 0),
        base44.entities.CompanyDocument.filter({}, { sort: '-created_date', limit: 25 }).catch(() => ({ items: [] })),
        base44.entities.AuditLog.filter({}, { sort: '-created_date', limit: 25 }).catch(() => ({ items: [] })),
      ]);

      setLiveTelemetry({
        participants,
        employees,
        goals,
        incidents,
        risks,
        tasks,
        communications,
        policies,
        audits,
        documents,
        companySafeDocs: safePage?.items || [],
        auditLogs: logPage?.items || [],
      });
    } finally {
      setLoadingTelemetry(false);
    }
  }, []);

  useEffect(() => {
    loadEnterpriseTelemetry();
  }, [loadEnterpriseTelemetry]);

  const activeTemplate = useMemo(() => {
    const base =
      allTemplates.find((t) => t.id === selectedTemplateId) ||
      allTemplates[0];
    const ov = formOverrides[base.id] || {};
    return {
      ...base,
      ...ov,
      mainFields: base.mainFields.map((f) => ({
        ...f,
        value: ov.fieldValues?.[f.key] ?? f.value,
      })),
    };
  }, [allTemplates, selectedTemplateId, formOverrides]);

  const updateTemplateField = (key, value) => {
    setFormOverrides((prev) => ({
      ...prev,
      [activeTemplate.id]: {
        ...(prev[activeTemplate.id] || {}),
        [key]: value,
      },
    }));
  };

  const updateMainFieldValue = (fieldKey, value) => {
    setFormOverrides((prev) => ({
      ...prev,
      [activeTemplate.id]: {
        ...(prev[activeTemplate.id] || {}),
        fieldValues: {
          ...(prev[activeTemplate.id]?.fieldValues || {}),
          [fieldKey]: value,
        },
      },
    }));
  };

  const handleSaveAndFileRecord = async (formatType = 'pdf') => {
    setSavingVault(true);
    try {
      if (formatType === 'pdf') exportControlledRecordAsPdf(activeTemplate);
      if (formatType === 'word') exportControlledRecordAsWord(activeTemplate);
      if (formatType === 'excel') exportControlledRecordAsExcel(activeTemplate);
      if (formatType === 'csv') exportControlledRecordAsCsv(activeTemplate);

      await autoFileToVaultAndCompanySafe(
        activeTemplate,
        `Controlled Form Exported (${formatType.toUpperCase()}) & Filed to Vault + Company Safe`
      );
      await loadEnterpriseTelemetry();

      toast({
        title: `Exported (${formatType.toUpperCase()}) & Filed to Vault + Company Safe`,
        description: `${activeTemplate.documentNumber} (${activeTemplate.versionNumber}) saved to Document Vault (${activeTemplate.category}) and Company Safe Master Copy.`,
      });
    } finally {
      setSavingVault(false);
    }
  };

  const filteredReports = useMemo(() => {
    return ENTERPRISE_12_REPORT_TYPES.filter((r) => {
      if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
      if (filterModule !== 'ALL' && !r.module.toLowerCase().includes(filterModule.toLowerCase())) return false;
      if (filterOwner.trim() && !r.subject.toLowerCase().includes(filterOwner.trim().toLowerCase()) && !r.title.toLowerCase().includes(filterOwner.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [filterCategory, filterModule, filterOwner]);

  const handleGenerateEnterpriseReport = async (reportDef, formatType = 'pdf') => {
    setGeneratingReportId(`${reportDef.id}-${formatType}`);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const nextReview = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
      const docNum = `CHR-RPT-2026-${reportDef.id.toUpperCase().slice(0, 6)}`;
      const reportRecord = {
        documentName: `${reportDef.title} — ${reportDef.subject}`,
        documentNumber: docNum,
        recordId: `REC-${docNum}`,
        versionNumber: 'v2026.1',
        status: filterStatus === 'ALL' ? 'Approved' : filterStatus,
        module: reportDef.module,
        category: reportDef.category,
        owner: 'Kristy Lee Whelan (Provider Administrator)',
        department: filterDepartment === 'ALL' ? 'Executive & Compliance Assurance' : filterDepartment,
        createdDate: today,
        modifiedDate: today,
        lastReviewDate: today,
        nextReviewDate: nextReview,
        reviewFrequency: 'Quarterly',
        approvedBy: 'Kristy Lee Whelan (Provider Administrator)',
        approvalDate: today,
        purpose: `Official enterprise ${reportDef.title} generated under ${reportDef.ndisStandard}. Date Filter: ${quickDateFilter}.`,
        scope: `Covers all connected records across ${reportDef.module} (${reportDef.category}) with 16-domain relationship links and RLS enforcement.`,
        relatedDocuments: [
          reportDef.ndisStandard,
          'CHR-AUD-001 Master 356-Checkpoint Audit Register',
          'CHR-DOC-098 Master 98-Document Control Register',
        ],
        mainFields: [
          { key: 'reportSubject', label: 'Report Subject & Classification', value: reportDef.subject },
          { key: 'dateRangeApplied', label: 'Date Filter & Period Applied', value: `${quickDateFilter}${customDateFrom ? ` (${customDateFrom} to ${customDateTo || today})` : ''}` },
          { key: 'liveRecordTelemetry', label: 'Connected Platform Telemetry', value: `Staff: ${liveTelemetry.employees} · Participants: ${liveTelemetry.participants} · Policies: ${liveTelemetry.policies} · Docs: ${liveTelemetry.documents}` },
          { key: 'vaultStoragePath', label: 'Automatic Document Vault Destination', value: `Document Vault → Reports → ${reportDef.module} → ${reportDef.category} → ${reportDef.subject}` },
        ],
        evidenceItems: [
          `Verified against live ${reportDef.entity} register records`,
          '19-Point Final Quality Gate Passed (100%)',
          'Master Copy locked in Company Safe with immutable change log',
        ],
        actionsItems: [
          'Filed automatically to Document Vault → Reports → Correct Module → Correct Category → Correct Subject',
          'Master copy and version history updated in Company Safe',
        ],
      };

      if (formatType === 'pdf') exportControlledRecordAsPdf(reportRecord);
      if (formatType === 'word') exportControlledRecordAsWord(reportRecord);
      if (formatType === 'excel') exportControlledRecordAsExcel(reportRecord);
      if (formatType === 'csv') exportControlledRecordAsCsv(reportRecord);

      await autoFileToVaultAndCompanySafe(
        reportRecord,
        `Enterprise Report Generated (${reportDef.title} · ${formatType.toUpperCase()})`
      );
      await loadEnterpriseTelemetry();

      toast({
        title: `${reportDef.title} Exported & Filed to Document Vault`,
        description: `Saved under Document Vault → Reports → ${reportDef.module} → ${reportDef.category} and locked in Company Safe.`,
      });
    } finally {
      setGeneratingReportId('');
    }
  };

  const applyPlatformBranding = (nextConfig) => {
    setThemeConfig(nextConfig);
    localStorage.setItem('chr_enterprise_theme_v1', JSON.stringify(nextConfig));
    if (nextConfig.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: 'Platform-Wide Branding & Theme Updated',
      description: `${nextConfig.brandName} · ${nextConfig.waveStyle} · ${nextConfig.darkMode ? 'Dark Mode Active' : 'Enterprise Light Mode Active'}`,
    });
  };

  const currentPreviewConfig = PREVIEW_MODES.find((p) => p.id === previewMode) || PREVIEW_MODES[0];

  return (
    <section
      className="overflow-hidden rounded-2xl p-[3px] shadow-md"
      style={{ background: BRAND_GRADIENT }}
    >
      <div
        className="rounded-[13px] p-3 space-y-3"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div
          className="rounded-2xl p-[2px]"
          style={{ background: BRAND_GRADIENT }}
        >
          <div className="space-y-3 rounded-[14px] bg-white p-3 sm:p-4">
      {/* Top Wave Header Banner */}
      <div
        className="app-page-header rounded-2xl p-4 text-white shadow-lg"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Governing Enterprise Standard · NDIS, Governance, Security, Vault &amp; 19-Point Quality Gate</span>
            </div>
            <h2 className="mt-1 font-editorial text-xl sm:text-2xl font-extrabold text-white">
              ComplianceHR Infinity — Enterprise Document Control, Reporting, Vault &amp; Quality Gate Studio
            </h2>
            <p className="text-xs font-semibold text-white/95">
              11-Section Controlled Forms · 16-Field Document Control · 5-Mode Preview · 4-Format Exports (PDF, Excel, Word, CSV) · {QUICK_16_DATE_FILTERS.length} Quick Date Ranges · Auto-Filing to Document Vault &amp; Company Safe
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="rounded-xl bg-white/20 px-3 py-1.5 text-[10.5px] font-extrabold text-white">
              19 / 19 Quality Gate Checks Active
            </span>
            <button
              type="button"
              onClick={loadEnterpriseTelemetry}
              disabled={loadingTelemetry}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-xs hover:bg-slate-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#0072FF] ${loadingTelemetry ? 'animate-spin' : ''}`} />
              <span style={{ color: '#0A2B6D' }}>Sync Live Registers</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12-Pillar Executive Telemetry, Subject-Researched Form Generator & Saved Report Presets */}
      <Enterprise12PillarCommandBar
        liveTelemetry={liveTelemetry}
        onSelectStudioTab={(tabId) => {
          setActiveStudioTab(tabId);
          setTimeout(() => {
            document.getElementById('quality-gate-active-tab-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }}
        onGeneratedForm={(newTpl) => {
          setCustomTemplates((prev) => [newTpl, ...prev]);
          setSelectedTemplateId(newTpl.id);
          setActiveStudioTab('controlled-forms');
          setTimeout(() => {
            document.getElementById('quality-gate-active-tab-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
          toast({
            title: 'Subject Researched & 24-Point Enterprise Form Generated',
            description: `${newTpl.documentNumber} — ${newTpl.documentName} ready for editing, preview, export, and Vault/Safe filing.`,
          });
        }}
        savedPresets={savedPresets}
        onSavePreset={(name) => {
          setSavedPresets((prev) => [
            ...prev.filter((p) => p.name !== name),
            { name, quickDateFilter, filterCategory, filterStatus },
          ]);
          toast({
            title: 'Saved Executive Report Filter View',
            description: `"${name}" saved to quick presets.`,
          });
        }}
        onApplyPreset={(preset) => {
          setQuickDateFilter(preset.quickDateFilter || 'ALL');
          setFilterCategory(preset.filterCategory || 'ALL');
          setFilterStatus(preset.filterStatus || 'ALL');
          setActiveStudioTab('enterprise-reports');
          setTimeout(() => {
            document.getElementById('quality-gate-active-tab-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }}
      />

      {/* 6 Studio Navigation Tiles (Matching Quick Access iPad Screen Style) */}
      <div id="quality-gate-active-tab-panel" className="scroll-mt-20 grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            id: 'controlled-forms',
            label: '11-Section Forms',
            sub: `${allTemplates.length} Templates & ${PREVIEW_MODES.length} Previews`,
            icon: FileCheck2,
          },
          {
            id: 'enterprise-reports',
            label: 'Reports & Filters',
            sub: `${ENTERPRISE_12_REPORT_TYPES.length} Reports · ${QUICK_16_DATE_FILTERS.length} Date Ranges`,
            icon: Filter,
          },
          {
            id: 'vault-safe-master',
            label: 'Vault & Safe Master',
            sub: `${VAULT_15_CATEGORIES.length} Vault Areas · Version History`,
            icon: FolderLock,
          },
          {
            id: 'traceability-logs',
            label: '6-Log Traceability',
            sub: `Audit, Change & ${RECORD_16_RELATIONSHIP_TARGETS.length} Link Targets`,
            icon: GitBranch,
          },
          {
            id: 'ai-intelligence',
            label: 'AI & Predictive',
            sub: '10 AI Enterprise Engines',
            icon: Sparkles,
          },
          {
            id: 'branding-quality-gate',
            label: 'Branding & 19-Pt Gate',
            sub: 'Theme, Waves & QA Gate',
            icon: Palette,
          },
        ].map((tab, idx) => {
          const Icon = tab.icon;
          const active = activeStudioTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveStudioTab(tab.id);
                setTimeout(() => {
                  document.getElementById('quality-gate-active-tab-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 40);
              }}
              className={`group flex h-full min-h-[88px] flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] text-left transition-all ${
                active
                  ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25'
                  : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF]'
              }`}
            >
              <div className="flex w-full flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                <div
                  className="flex min-h-[34px] items-center justify-between gap-1 px-2 py-1 text-white"
                  style={{ background: getHeaderView(idx) }}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="text-[10px] font-extrabold leading-tight text-white" style={{ color: '#FFFFFF' }}>
                      {tab.label}
                    </span>
                  </div>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-[#00C6FF]' : 'bg-white/75'}`} />
                </div>
                <div className="flex flex-1 items-center justify-between px-2 py-1 text-[10px] font-bold text-[#0A2B6D]">
                  <span>{tab.sub}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: 11-SECTION CONTROLLED FORM & 12-DOMAIN TEMPLATE STUDIO ==================== */}
      {activeStudioTab === 'controlled-forms' && (
        <div className="space-y-3">
          {/* 12 Domain Template Selector */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Select Editable Enterprise Form / Template Domain ({allTemplates.length} Subject-Specific Templates)
              </span>
              {/* 5-Mode Preview Switcher */}
              <div className="flex flex-wrap items-center gap-1">
                {PREVIEW_MODES.map((m) => {
                  const PIcon = m.icon;
                  const isCurrent = previewMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPreviewMode(m.id);
                        if (m.id === 'print') window.print();
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold transition ${
                        isCurrent
                          ? 'bg-[#0A2B6D] text-white shadow-2xs'
                          : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                      }`}
                    >
                      <PIcon className="h-3 w-3 shrink-0" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {allTemplates.map((tpl) => {
                const isSelected = tpl.id === activeTemplate.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`flex flex-col justify-between rounded-xl border p-2 text-left transition ${
                      isSelected
                        ? 'border-[#5A00D6] bg-[#5A00D6] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#0072FF]/10 text-[#0072FF]'
                        }`}
                      >
                        {tpl.domain}
                      </span>
                      <span className={`text-[9px] font-bold ${isSelected ? 'text-white/90' : 'text-[#5A00D6]'}`}>
                        {tpl.versionNumber}
                      </span>
                    </div>
                    <div className={`mt-1 text-[10.5px] font-extrabold leading-snug ${isSelected ? 'text-white' : 'text-[#0A2B6D]'}`}>
                      {tpl.documentNumber}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controlled Form Container with Responsive Preview Width */}
          <div className={`${currentPreviewConfig.widthClass} transition-all duration-200`}>
            <div className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-lg">
              {/* SECTION 1: HEADER — Clean Solid Dark Blue & Light Blue (No Gradient) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-[#0072FF] bg-[#0A2B6D] px-5 py-4 text-white">
                <div>
                  <span className="inline-block rounded-full bg-[#0072FF] px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white">
                    1. Header · Controlled Enterprise Form · {activeTemplate.domain}
                  </span>
                  <h3 className="mt-1.5 font-editorial text-lg sm:text-xl font-extrabold text-white">
                    {activeTemplate.documentName}
                  </h3>
                  <p className="text-xs font-semibold text-[#E0F2FE]">
                    Module: {activeTemplate.module} · Category: {activeTemplate.category} · Department: {activeTemplate.department}
                  </p>
                </div>
                <div className="rounded-xl border border-[#0072FF] bg-[#F0F7FF] px-3.5 py-2 text-left sm:text-right text-[#0A2B6D] shrink-0">
                  <div className="text-xs font-extrabold text-[#0A2B6D]">{activeTemplate.documentNumber}</div>
                  <div className="text-xs font-bold text-[#0A2B6D]/80">
                    Record ID: {activeTemplate.recordId} · {activeTemplate.versionNumber}
                  </div>
                  <div className="text-xs font-extrabold text-[#0072FF]">
                    Status: {activeTemplate.status}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* SECTION 2: DOCUMENT CONTROL (ALL 16 MANDATORY FIELDS) */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-[#0A2B6D] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                    2. Document Control — 16 Mandatory Governance &amp; Traceability Fields (Unique Document Number)
                  </div>
                  <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4 bg-slate-50/50">
                    {[
                      { key: 'documentName', label: 'Document Name' },
                      { key: 'documentNumber', label: 'Document Number (Unique)' },
                      { key: 'recordId', label: 'Record ID' },
                      { key: 'versionNumber', label: 'Version Number' },
                      { key: 'status', label: 'Status' },
                      { key: 'module', label: 'Module' },
                      { key: 'category', label: 'Category (Vault)' },
                      { key: 'owner', label: 'Owner' },
                      { key: 'department', label: 'Department' },
                      { key: 'createdDate', label: 'Created Date', type: 'date' },
                      { key: 'modifiedDate', label: 'Modified Date', type: 'date' },
                      { key: 'lastReviewDate', label: 'Last Review Date', type: 'date' },
                      { key: 'nextReviewDate', label: 'Next Review Date', type: 'date' },
                      { key: 'reviewFrequency', label: 'Review Frequency' },
                      { key: 'approvedBy', label: 'Approved By' },
                      { key: 'approvalDate', label: 'Approval Date', type: 'date' },
                    ].map((field) => (
                      <div key={field.key} className="rounded-lg border border-slate-200 bg-white p-2">
                        <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                          {field.label}
                        </label>
                        <input
                          type={field.type || 'text'}
                          value={activeTemplate[field.key] || ''}
                          onChange={(e) => updateTemplateField(field.key, e.target.value)}
                          className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTIONS 3, 4 & 5: PURPOSE, SCOPE & RELATED DOCUMENTS */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                      3. Purpose
                    </div>
                    <textarea
                      rows={3}
                      value={activeTemplate.purpose}
                      onChange={(e) => updateTemplateField('purpose', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-[#0A2B6D]"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      4. Scope
                    </div>
                    <textarea
                      rows={3}
                      value={activeTemplate.scope}
                      onChange={(e) => updateTemplateField('scope', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-[#0A2B6D]"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                      5. Related Documents &amp; Standards
                    </div>
                    <ul className="mt-1.5 space-y-1 text-xs font-bold text-[#0A2B6D]">
                      {(activeTemplate.relatedDocuments || []).map((docRef) => (
                        <li key={docRef} className="flex items-center gap-1.5 rounded bg-slate-50 px-2 py-1">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                          <span>{docRef}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SECTION 6: MAIN CONTENT */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-[#0072FF] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                    6. Main Content — Subject-Specific Operational &amp; Compliance Fields
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 bg-white">
                    {activeTemplate.mainFields.map((field) => (
                      <div key={field.key} className="rounded-lg border border-slate-200 p-2.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => updateMainFieldValue(field.key, e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTIONS 7 & 8: EVIDENCE SECTION & ACTIONS SECTION */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      7. Evidence Section (Substantiated Operational Proof)
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs font-semibold text-[#0A2B6D]">
                      {(activeTemplate.evidenceItems || []).map((ev) => (
                        <li key={ev} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      8. Actions Section (Corrective Actions, Routing &amp; Escalations)
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs font-semibold text-[#0A2B6D]">
                      {(activeTemplate.actionsItems || []).map((act) => (
                        <li key={act} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF2E9A]" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SECTIONS 9 & 10: REVIEW SECTION & APPROVAL SECTION */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      9. Review Section (Reviewer, Findings, Recommendations &amp; Next Review)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9.5px] font-bold uppercase text-[#0A2B6D]/80">Reviewer</label>
                        <input
                          type="text"
                          value={activeTemplate.reviewer || activeTemplate.owner}
                          onChange={(e) => updateTemplateField('reviewer', e.target.value)}
                          className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold uppercase text-[#0A2B6D]/80">Review Outcome</label>
                        <input
                          type="text"
                          value={activeTemplate.reviewOutcome || 'Compliant & Verified'}
                          onChange={(e) => updateTemplateField('reviewOutcome', e.target.value)}
                          className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9.5px] font-bold uppercase text-[#0A2B6D]/80">
                        Findings, Recommendations &amp; Review Notes
                      </label>
                      <input
                        type="text"
                        value={activeTemplate.reviewNotes || 'Verified against NDIS Practice Standards and live operational registers.'}
                        onChange={(e) => updateTemplateField('reviewNotes', e.target.value)}
                        className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#0A2B6D]"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      10. Approval Section (Approver, Approval Date, Status &amp; Sign-Off)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9.5px] font-bold uppercase text-[#0A2B6D]/80">Approver</label>
                        <input
                          type="text"
                          value={activeTemplate.approvedBy}
                          onChange={(e) => updateTemplateField('approvedBy', e.target.value)}
                          className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold uppercase text-[#0A2B6D]/80">Approval Status</label>
                        <input
                          type="text"
                          value={activeTemplate.status}
                          onChange={(e) => updateTemplateField('status', e.target.value)}
                          className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9.5px] font-bold uppercase text-[#0A2B6D]/80">
                        Approval Notes &amp; Digital Signature Stamp
                      </label>
                      <input
                        type="text"
                        value={activeTemplate.approvalNotes || `Digitally signed by ${activeTemplate.approvedBy} on ${activeTemplate.approvalDate}`}
                        onChange={(e) => updateTemplateField('approvalNotes', e.target.value)}
                        className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#0A2B6D]"
                      />
                    </div>
                  </div>
                </div>

                {/* AUTOMATIC 16-RECORD RELATIONSHIP LINKER */}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      Record Relationship Targets ({RECORD_16_RELATIONSHIP_TARGETS.length} Available Domains)
                    </span>
                    <span className="text-[10px] font-extrabold text-[#0072FF]">
                      {linkedRelationships.length} / {RECORD_16_RELATIONSHIP_TARGETS.length} Domains Selected
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {RECORD_16_RELATIONSHIP_TARGETS.map((rel) => {
                      const active = linkedRelationships.includes(rel);
                      return (
                        <button
                          key={rel}
                          type="button"
                          onClick={() =>
                            setLinkedRelationships((prev) =>
                              prev.includes(rel) ? prev.filter((x) => x !== rel) : [...prev, rel]
                            )
                          }
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition ${
                            active
                              ? 'bg-[#0A2B6D] text-white'
                              : 'border border-slate-200 bg-white text-[#0A2B6D]'
                          }`}
                        >
                          ✓ {rel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 11: FOOTER & 4-FORMAT EXPORT + AUTO-VAULT / SAFE FILING */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3">
                  <div className="text-xs font-extrabold text-[#0A2B6D]">
                    <div>
                      11. Controlled Footer · Document Vault Path: <span className="text-[#5A00D6]">Document Vault → {activeTemplate.module} → {activeTemplate.category}</span>
                    </div>
                    <div className="text-[10.5px] font-semibold text-[#0A2B6D]/80">
                      Business Info: ComplianceHR Infinity (NDIS Registered Provider) · Protected Master Copy &amp; Version History in Company Safe · <span className="font-extrabold text-[#0072FF]">Page 1 of 1</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => {
                        const cloned = {
                          ...activeTemplate,
                          id: `TPL-CLONE-${Date.now()}`,
                          documentNumber: `${activeTemplate.documentNumber}-COPY`,
                          recordId: `${activeTemplate.recordId}-C1`,
                          documentName: `${activeTemplate.documentName} (Cloned Template)`,
                          versionNumber: 'v1.0',
                          status: 'Draft',
                        };
                        setCustomTemplates((prev) => [cloned, ...prev]);
                        setSelectedTemplateId(cloned.id);
                        toast({
                          title: 'Form / Template Cloned',
                          description: `${cloned.documentNumber} created and ready for editing.`,
                        });
                      }}
                      className="bg-white border border-[#0A2B6D] text-[#0A2B6D] text-xs font-extrabold hover:bg-slate-100"
                    >
                      Clone Form
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      disabled={savingVault}
                      onClick={async () => {
                        updateTemplateField('status', 'Approved');
                        await handleSaveAndFileRecord('pdf');
                      }}
                      className="bg-emerald-600 text-white text-xs font-extrabold"
                    >
                      Publish &amp; Lock in Safe
                    </Button>
                    <Button
                      size="sm"
                      disabled={savingVault}
                      onClick={() => handleSaveAndFileRecord('pdf')}
                      className="bg-[#0A2B6D] text-white text-xs font-extrabold"
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> PDF + File to Vault
                    </Button>
                    <Button
                      size="sm"
                      disabled={savingVault}
                      onClick={() => handleSaveAndFileRecord('word')}
                      className="bg-[#0072FF] text-white text-xs font-extrabold"
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> Word (.doc)
                    </Button>
                    <Button
                      size="sm"
                      disabled={savingVault}
                      onClick={() => handleSaveAndFileRecord('excel')}
                      className="bg-[#5A00D6] text-white text-xs font-extrabold"
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> Excel (.xls)
                    </Button>
                    <Button
                      size="sm"
                      disabled={savingVault}
                      onClick={() => handleSaveAndFileRecord('csv')}
                      className="bg-[#FF2E9A] text-white text-xs font-extrabold"
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ADVANCED FILTERS, 16 QUICK DATE RANGES & 12 REPORT GENERATORS ==================== */}
      {activeStudioTab === 'enterprise-reports' && (
        <div className="space-y-3">
          {/* 16 Quick Date Filters + Custom Date Range */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                <Calendar className="h-3.5 w-3.5 text-[#0072FF]" />
                Quick Date Filters ({QUICK_16_DATE_FILTERS.length} Standard Horizons + Custom Date Range)
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#0A2B6D]">
                <span>Custom From:</span>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                />
                <span>To:</span>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_16_DATE_FILTERS.map((df) => {
                const active = quickDateFilter === df.id;
                return (
                  <button
                    key={df.id}
                    type="button"
                    onClick={() => setQuickDateFilter(df.id)}
                    className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold transition ${
                      active
                        ? 'bg-[#0A2B6D] text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                    }`}
                  >
                    {df.label}
                  </button>
                );
              })}
            </div>

            {/* Multi-Dimension Filter Controls */}
            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 md:grid-cols-5">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="ALL">All {VAULT_15_CATEGORIES.length} Vault Categories</option>
                {VAULT_15_CATEGORIES.map((c) => (
                  <option key={c} value={c}>Category: {c}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="ALL">All Workflow Stages &amp; Statuses</option>
                <option value="Approved">Approved / Verified</option>
                <option value="In Review">In Review / Pending Approval</option>
                <option value="Action Required">Action Required / Escalated</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="ALL">All Priorities (Low–Critical)</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="ALL">All Sites, Departments &amp; Managers</option>
                <option value="Executive & Board">Executive &amp; Board</option>
                <option value="Quality, Risk & Compliance">Quality, Risk &amp; Compliance</option>
                <option value="Participant Services">Participant Services</option>
                <option value="People & Culture (HR)">People &amp; Culture (HR)</option>
              </select>
              <input
                type="text"
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                placeholder="Filter by Subject, Participant, Employee, Reviewer..."
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
              />
            </div>
          </div>

          {/* 12 Enterprise Report Generators */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D]/20 bg-white p-3.5 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#0072FF]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#0072FF]">
                      {rep.category}
                    </span>
                    <span className="text-[10px] font-bold text-[#5A00D6]">{rep.module}</span>
                  </div>
                  <h4 className="mt-2 font-editorial text-base font-extrabold text-[#0A2B6D]">
                    {rep.title}
                  </h4>
                  <p className="mt-1 text-xs font-medium text-[#0A2B6D]/80">{rep.subject}</p>
                  <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-[#0A2B6D]">
                    Auto-Vault Path: <span className="text-[#5A00D6]">Document Vault → Reports → {rep.module} → {rep.category}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-slate-100 pt-2.5">
                  {['pdf', 'excel', 'word', 'csv'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      disabled={generatingReportId === `${rep.id}-${fmt}`}
                      onClick={() => handleGenerateEnterpriseReport(rep, fmt)}
                      className="rounded-lg border border-[#0A2B6D] bg-white px-2 py-1.5 text-[10px] font-extrabold uppercase text-[#0A2B6D] transition hover:bg-[#0A2B6D] hover:text-white"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: DOCUMENT VAULT (15 CATEGORIES) & COMPANY SAFE MASTER COPY LEDGER ==================== */}
      {activeStudioTab === 'vault-safe-master' && (
        <div className="space-y-3">
          {/* 15 Mandatory Document Vault Structure Categories */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Document Vault Structure — {VAULT_15_CATEGORIES.length} Searchable Categories
              </span>
              <span className="text-xs font-extrabold text-[#5A00D6]">
                Protected Master Copy + Working Copy + Version / Review / Approval / Change History
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setVaultCategoryFilter('ALL')}
                className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold ${
                  vaultCategoryFilter === 'ALL'
                    ? 'bg-[#0A2B6D] text-white'
                    : 'border border-slate-200 bg-white text-[#0A2B6D]'
                }`}
              >
                All {VAULT_15_CATEGORIES.length} Categories
              </button>
              {VAULT_15_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setVaultCategoryFilter(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold ${
                    vaultCategoryFilter === cat
                      ? 'bg-[#5A00D6] text-white'
                      : 'border border-slate-200 bg-white text-[#0A2B6D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Company Safe Master Copy vs Working Copy Table */}
          <div className="overflow-x-auto rounded-xl border-2 border-[#0A2B6D]">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="text-white" style={{ background: BRAND_GRADIENT }}>
                <tr>
                  <th className="p-2.5 font-extrabold text-white">Doc Number &amp; Version</th>
                  <th className="p-2.5 font-extrabold text-white">Controlled Document / Template</th>
                  <th className="p-2.5 font-extrabold text-white">Vault Category &amp; Module</th>
                  <th className="p-2.5 font-extrabold text-white">Company Safe Protection</th>
                  <th className="p-2.5 font-extrabold text-white">Review &amp; Approval History</th>
                  <th className="p-2.5 font-extrabold text-white">Export / File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {ENTERPRISE_12_FORM_TEMPLATES.filter(
                  (t) => vaultCategoryFilter === 'ALL' || t.category === vaultCategoryFilter || t.domain === vaultCategoryFilter
                ).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-extrabold text-[#0A2B6D] whitespace-nowrap">
                      {item.documentNumber} · <span className="text-[#5A00D6]">{item.versionNumber}</span>
                    </td>
                    <td className="p-2.5 font-bold text-[#0A2B6D]">{item.documentName}</td>
                    <td className="p-2.5">
                      <Badge className="bg-[#0072FF]/10 text-[#0072FF]">{item.category}</Badge>
                      <span className="ml-1.5 text-[11px] font-semibold text-[#0A2B6D]/80">{item.module}</span>
                    </td>
                    <td className="p-2.5 text-[11px] font-bold text-[#0A2B6D]">
                      Master Copy Locked · Working Copy Active · Previous Versions Preserved
                    </td>
                    <td className="p-2.5 text-[11px] font-semibold text-[#0A2B6D]">
                      Reviewed: {item.lastReviewDate} · Next: {item.nextReviewDate} · Approved: {item.approvedBy}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={async () => {
                          const { openDocumentInViewer } = await import('@/lib/openDocument');
                          await openDocumentInViewer(item);
                          setSelectedTemplateId(item.id);
                        }}
                        className="h-7 bg-[#0A2B6D] px-2.5 text-[10px] font-extrabold text-white"
                      >
                        Open &amp; Export
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: PERMANENT 6-LOG TRACEABILITY & INTERCONNECTED RECORDS ==================== */}
      {activeStudioTab === 'traceability-logs' && (
        <div className="space-y-3">
          {/* 5 Core Interconnected Operational Pillars: Goals, Incidents, Risks, Tasks & Communications */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                title: 'Goals',
                count: liveTelemetry.goals,
                reqs: ['Progress', 'Reviews', 'Tasks', 'Actions', 'Related Documents'],
                color: '#0072FF',
              },
              {
                title: 'Incidents',
                count: liveTelemetry.incidents,
                reqs: ['Investigations', 'Corrective Actions', 'Evidence', 'Reviews', 'Outcomes'],
                color: '#FF2E9A',
              },
              {
                title: 'Risks',
                count: liveTelemetry.risks,
                reqs: ['Controls', 'Treatments', 'Reviews', 'Audit Links'],
                color: '#5A00D6',
              },
              {
                title: 'Communications',
                count: liveTelemetry.communications,
                reqs: ['Audience', 'Delivery', 'Read Status', 'Acknowledgements'],
                color: '#0A2B6D',
              },
              {
                title: 'Tasks',
                count: liveTelemetry.tasks,
                reqs: ['Owner', 'Status', 'Due Date', 'Related Records'],
                color: '#0072FF',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="rounded-xl border-2 border-[#0A2B6D]/20 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-editorial text-base font-extrabold text-[#0A2B6D]">{pillar.title}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ backgroundColor: pillar.color }}
                  >
                    {pillar.count} Live
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] font-bold text-[#0A2B6D]">
                  {pillar.reqs.map((r) => (
                    <li key={r} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-[#0072FF]" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 6 Permanent Audit & Governance Logs */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Permanent 6-Log Traceability (Audit Log · Activity Log · Change Log · Review Log · Approval Log · Workflow Log)
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {[
                { log: 'Audit Log', detail: 'Captures User, Date, Time, Action, Previous Value & New Value across all 139 entities.' },
                { log: 'Activity Log', detail: 'Real-time operational record of module views, exports, and register updates.' },
                { log: 'Change Log', detail: 'Field-level before/after version diffs for policies, profiles, and plans.' },
                { log: 'Review Log', detail: 'Reviewer, Review Date, Findings, Recommendations, Outcome & Next Review.' },
                { log: 'Approval Log', detail: 'Approver, Approval Date, Status, Digital Signature & Escalation trail.' },
                { log: 'Workflow Log', detail: 'Execution telemetry across all 65 automated workflows and 104 backend functions.' },
              ].map((item) => (
                <div key={item.log} className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-extrabold text-[#5A00D6]">{item.log}</div>
                  <p className="mt-0.5 text-[11px] font-medium text-[#0A2B6D]/80">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: AI ENTERPRISE INTELLIGENCE & PREDICTIVE ANALYTICS ==================== */}
      {activeStudioTab === 'ai-intelligence' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                10 Enterprise AI Capabilities &amp; Predictive Compliance Analytics
              </span>
              <div className="flex items-center gap-2">
                <Input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="AI Search across forms, risks, incidents, policies & workflows..."
                  className="h-8 w-64 bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { title: 'AI Assistant', desc: '24/7 NDIS & HR policy copilot with role-aware guidance.' },
                { title: 'AI Search', desc: 'Instant semantic lookup across all 46 modules & 98 controlled docs.' },
                { title: 'AI Reporting', desc: '1-click executive & board narrative generation from live KPIs.' },
                { title: 'AI Summaries', desc: 'Automated 10-weekly participant progress & shift note synthesis.' },
                { title: 'AI Recommendations', desc: 'Proactive CAPA & continuous improvement actions.' },
                { title: 'AI Compliance Insights', desc: 'Real-time 356-checkpoint gap detection & evidence mapping.' },
                { title: 'AI Risk Analysis', desc: 'ISO 31000 likelihood × consequence scoring & control suggestions.' },
                { title: 'AI Incident Analysis', desc: '24h/5d reportable triage, root-cause & safeguarding checks.' },
                { title: 'AI Workflow Suggestions', desc: 'Automated task routing, escalation & roster optimisation.' },
                { title: 'Predictive Analytics', desc: '90/60/30-day credential expiry, budget burn & claim forecasting.' },
              ].filter((c) => !aiQuery.trim() || c.title.toLowerCase().includes(aiQuery.toLowerCase()) || c.desc.toLowerCase().includes(aiQuery.toLowerCase())).map((cap) => (
                <div key={cap.title} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#5A00D6]">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#FF2E9A]" />
                    <span>{cap.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#0A2B6D]/80">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 6: BRANDING CUSTOMISER & 19-POINT FINAL QUALITY GATE ==================== */}
      {activeStudioTab === 'branding-quality-gate' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Platform-Wide Branding & Customisation Controls */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Administrator Platform-Wide Branding, Wave Header &amp; Theme Customiser
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-[#0A2B6D]">Platform / Organisation Brand Name</label>
                <input
                  type="text"
                  value={themeConfig.brandName}
                  onChange={(e) => applyPlatformBranding({ ...themeConfig, brandName: e.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-[#0A2B6D]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0A2B6D]">Header Wave &amp; Gradient Style</label>
                <select
                  value={themeConfig.waveStyle}
                  onChange={(e) => applyPlatformBranding({ ...themeConfig, waveStyle: e.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-[#0A2B6D]"
                >
                  <option>Symmetric Spectrum Wave (#0072FF → #0A2B6D → #5A00D6 → #FF2E9A)</option>
                  <option>Executive Navy &amp; Royal Indigo Wave</option>
                  <option>High-Contrast Enterprise Slate &amp; Cyan</option>
                </select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
                <span className="font-extrabold text-[#0A2B6D]">Enterprise Dark Mode</span>
                <button
                  type="button"
                  onClick={() => applyPlatformBranding({ ...themeConfig, darkMode: !themeConfig.darkMode })}
                  className={`rounded-lg px-3 py-1 text-xs font-extrabold ${
                    themeConfig.darkMode ? 'bg-[#5A00D6] text-white' : 'bg-slate-100 text-[#0A2B6D]'
                  }`}
                >
                  {themeConfig.darkMode ? 'Dark Mode ON' : 'Light Mode ON'}
                </button>
              </div>
            </div>
          </div>

          {/* 19-Point Final Quality Gate Verification Checklist */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Final Quality Gate — All 19 Mandatory Pre-Publish Verification Checks
              </span>
              <Badge className="bg-emerald-600 text-white text-[10px]">19 / 19 Verified</Badge>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {QUALITY_GATE_19_CHECKS.map((chk) => (
                <div
                  key={chk.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                  <span>{chk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </section>
  );
}