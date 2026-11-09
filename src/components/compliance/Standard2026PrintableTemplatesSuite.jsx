import React, { useState, useEffect } from 'react';
import {
  Printer, Download, Sparkles,
  FileText, ShieldCheck, Layers, Save,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { STANDARD_2026_PRINT_TEMPLATES } from '@/lib/standard2026PrintableTemplatesData';
import {
  downloadSingle2026TemplatePdf,
  downloadAll2026TemplatesPackPdf,
} from '@/lib/standard2026PrintablePdf';
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';

const HEADER_GRADIENT = '#0A2B6D';
const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export default function Standard2026PrintableTemplatesSuite() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState(STANDARD_2026_PRINT_TEMPLATES[0].id);
  const [blankMode, setBlankMode] = useState(false);
  const [savingVault, setSavingVault] = useState(false);

  const [orgInfo, setOrgInfo] = useState({
    businessName: 'ComplianceHR Infinity',
    abn: '84 202 600 450',
    ndisReg: '4-NDIS-2026-AU',
    siteName: 'Head Office & Operations Hub',
    auditConsent: 'Audit consent received',
  });

  // Per-template custom edits keyed by template id
  const [customOverrides, setCustomOverrides] = useState({});

  useEffect(() => {
    base44.entities.BusinessDetails.filter({}, { sort: '-created_date', limit: 1 })
      .then((res) => {
        const b = res?.items?.[0];
        if (b) {
          const cleanName =
            !b.business_name || /choices\s*(nq|north\s*queensland)/i.test(b.business_name)
              ? 'ComplianceHR Infinity'
              : b.business_name;
          setOrgInfo((prev) => ({
            ...prev,
            businessName: cleanName,
            abn: b.abn || prev.abn,
            ndisReg: b.ndis_registration_number || prev.ndisReg,
            siteName: b.address || prev.siteName,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const baseTpl =
    STANDARD_2026_PRINT_TEMPLATES.find((t) => t.id === selectedId) ||
    STANDARD_2026_PRINT_TEMPLATES[0];

  const tplOverrides = customOverrides[baseTpl.id] || {};

  const getFieldVal = (f) => {
    if (blankMode) return '';
    return tplOverrides.fields?.[f.key] ?? f.sample ?? '';
  };

  const setFieldVal = (key, val) => {
    if (blankMode) setBlankMode(false);
    setCustomOverrides((prev) => ({
      ...prev,
      [baseTpl.id]: {
        ...(prev[baseTpl.id] || {}),
        fields: { ...(prev[baseTpl.id]?.fields || {}), [key]: val },
      },
    }));
  };

  const getCheckpointStatus = (ref) => {
    if (blankMode) return '';
    return tplOverrides.checkpoints?.[ref]?.status ?? 'Yes';
  };

  const setCheckpointStatus = (ref, status) => {
    if (blankMode) setBlankMode(false);
    setCustomOverrides((prev) => ({
      ...prev,
      [baseTpl.id]: {
        ...(prev[baseTpl.id] || {}),
        checkpoints: {
          ...(prev[baseTpl.id]?.checkpoints || {}),
          [ref]: { ...(prev[baseTpl.id]?.checkpoints?.[ref] || {}), status },
        },
      },
    }));
  };

  const getNarrativeVal = (idx, sampleText) => {
    if (blankMode) return '';
    return tplOverrides.narratives?.[idx] ?? sampleText ?? '';
  };

  const setNarrativeVal = (idx, val) => {
    if (blankMode) setBlankMode(false);
    setCustomOverrides((prev) => ({
      ...prev,
      [baseTpl.id]: {
        ...(prev[baseTpl.id] || {}),
        narratives: { ...(prev[baseTpl.id]?.narratives || {}), [idx]: val },
      },
    }));
  };

  const buildMergedTemplate = (t) => {
    const ov = customOverrides[t.id] || {};
    return {
      ...t,
      metadataFields: t.metadataFields.map((f) => ({
        ...f,
        value: ov.fields?.[f.key] ?? f.sample,
      })),
      narrativeSections: t.narrativeSections.map((s, idx) => ({
        ...s,
        sampleText: ov.narratives?.[idx] ?? s.sampleText,
      })),
    };
  };

  const handleSaveToVault = async () => {
    setSavingVault(true);
    try {
      const merged = buildMergedTemplate(baseTpl);
      const today = new Date().toISOString().slice(0, 10);
      await base44.entities.FormSubmission.create({
        form_title: `${merged.code} — ${merged.title}`,
        category: merged.binder,
        submitted_by: orgInfo.businessName || 'Compliance Officer',
        submitted_date: today,
        submission_method: 'Online',
        online_document: true,
        status: 'Submitted',
        review_outcome: 'Approved',
        submission_summary: `2026 Standard Printable Record (${merged.code} · ${merged.version}) verified for ${orgInfo.businessName}.`,
        data: JSON.stringify({ orgInfo, template: merged }),
      });
      toast({
        title: 'Saved to Document Vault!',
        description: `${merged.code} — ${merged.title} has been filed in your Document Vault.`,
      });
    } finally {
      setSavingVault(false);
    }
  };

  return (
    <div id="standard-2026-printable-templates" className="space-y-3">
      {/* Enterprise 11-Section Controlled Form, 16-Field Document Control, 5-Mode Preview, 12-Report Engine & 19-Point Quality Gate */}
      <EnterpriseStandardQualityGateSuite />

      {/* Top Studio Header Bar */}
      <div
        className="app-section-card-header flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
        style={{ background: HEADER_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Printer className="h-4 w-4 shrink-0 text-white" />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-body text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Standard 2026-Compliant Printable Office Document Templates (12 Master Binders &amp; Forms)
              </h3>
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-body text-[7.5px] font-black text-white">
                A4 PRINT-READY · FULL NDIS &amp; ISO AUDIT CONTROL HEADERS · RULED WRITING LINES
              </span>
            </div>
            <p className="font-body text-[8px] font-bold text-white">
              Switch between **Smart-Filled 2026 Print Mode** or **Blank Office Print Mode (with ruled lines for pen completion)** and download single A4 PDFs or the complete 12-template print pack.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setBlankMode(false)}
            className={`rounded-lg px-2.5 py-1 font-body text-[7.8px] font-black transition-all ${
              !blankMode
                ? 'bg-white text-blue-950 shadow'
                : 'border border-white/40 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Sparkles className="mr-1 inline h-3 w-3 text-purple-700" />
            Smart-Filled Print Mode
          </button>
          <button
            type="button"
            onClick={() => setBlankMode(true)}
            className={`rounded-lg px-2.5 py-1 font-body text-[7.8px] font-black transition-all ${
              blankMode
                ? 'bg-white text-blue-950 shadow'
                : 'border border-white/40 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileText className="mr-1 inline h-3 w-3 text-pink-600" />
            Blank Office Form (Ruled Lines)
          </button>
          <button
            type="button"
            onClick={() => downloadAll2026TemplatesPackPdf(orgInfo, blankMode)}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 font-body text-[7.8px] font-black text-blue-950 shadow hover:bg-amber-300"
          >
            <Download className="h-3 w-3" /> Download All 12 Printable Templates (A4 PDF Pack)
          </button>
        </div>
      </div>

      {/* Office Branding Bar — Automatically stamps all 12 Printable Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 rounded-xl border border-sky-200 bg-[#F0F7FF] p-3 text-xs">
        <div>
          <label className="font-extrabold uppercase text-[#0A2B6D]">Organisation / Provider Name</label>
          <input
            type="text"
            value={orgInfo.businessName}
            onChange={(e) => setOrgInfo({ ...orgInfo, businessName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 font-bold text-[#0A2B6D]"
          />
        </div>
        <div>
          <label className="font-extrabold uppercase text-[#0A2B6D]">ABN (Printed on Header)</label>
          <input
            type="text"
            value={orgInfo.abn}
            onChange={(e) => setOrgInfo({ ...orgInfo, abn: e.target.value })}
            className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 font-bold text-[#0A2B6D]"
          />
        </div>
        <div>
          <label className="font-extrabold uppercase text-[#0A2B6D]">NDIS Provider Reg #</label>
          <input
            type="text"
            value={orgInfo.ndisReg}
            onChange={(e) => setOrgInfo({ ...orgInfo, ndisReg: e.target.value })}
            className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 font-bold text-[#0A2B6D]"
          />
        </div>
        <div>
          <label className="font-extrabold uppercase text-[#0A2B6D]">Site / Branch Location</label>
          <input
            type="text"
            value={orgInfo.siteName}
            onChange={(e) => setOrgInfo({ ...orgInfo, siteName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 font-bold text-[#0A2B6D]"
          />
        </div>
        <div>
          <label className="font-extrabold uppercase text-[#0A2B6D]">Audit Consent Stamp</label>
          <select
            value={orgInfo.auditConsent}
            onChange={(e) => setOrgInfo({ ...orgInfo, auditConsent: e.target.value })}
            className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 font-bold text-[#0A2B6D]"
          >
            <option value="Audit consent received">☑ Audit consent received</option>
            <option value="Audit declined">☐ Audit declined</option>
          </select>
        </div>
      </div>

      {/* 12 Template Selector Pills (Grouped across Binders 1-6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
        {STANDARD_2026_PRINT_TEMPLATES.map((t) => {
          const active = t.id === baseTpl.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`flex flex-col justify-between rounded-lg border-2 p-1.5 text-left transition-all ${
                active ? 'ring-2 ring-pink-500 shadow-sm' : 'hover:bg-purple-50/50'
              }`}
              style={{
                borderColor: t.accent,
                background: active ? t.accent : '#ffffff',
                color: active ? '#ffffff' : '#172554',
              }}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span
                  className={`rounded px-1 py-0.2 font-body text-[6.5px] font-black uppercase ${
                    active ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-950'
                  }`}
                >
                  {t.code}
                </span>
                <span className={`text-[6.2px] font-bold ${active ? 'text-white/90' : 'text-purple-800'}`}>
                  {t.version}
                </span>
              </div>
              <div className={`mt-0.5 font-body text-[7.5px] font-black leading-tight line-clamp-2 ${active ? 'text-white' : 'text-blue-950'}`}>
                {t.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Clean, Print-Ready A4 Document Sheet Preview */}
      <div
        className="mx-auto max-w-5xl overflow-hidden rounded-2xl border-2 bg-white shadow-lg print:border-0 print:shadow-none"
        style={{ borderColor: baseTpl.accent }}
      >
        {/* Official 2026 Document Header Band — Clean Solid Dark Blue & Light Blue (No Gradient) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-[#0072FF] bg-[#0A2B6D] px-4 py-3.5 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 font-body text-[7.5px] font-extrabold uppercase tracking-wider text-white">
                <span>{orgInfo.businessName}</span>
                <span>·</span>
                <span>ABN: {orgInfo.abn}</span>
                <span>·</span>
                <span>NDIS Reg: {orgInfo.ndisReg}</span>
                <span>·</span>
                <span className="rounded bg-white/20 px-1.5 py-0.5">{baseTpl.binder}</span>
              </div>
              <h2 className="font-body text-sm sm:text-base font-black uppercase tracking-tight text-white">
                {baseTpl.title}
              </h2>
              <p className="font-body text-[8px] font-bold text-white">
                {baseTpl.subtitle}
              </p>
            </div>
          </div>

          {/* Right Document Control Stamp */}
          <div className="rounded-lg border border-white/35 bg-white/15 px-2.5 py-1.5 text-right font-body text-white">
            <div className="text-[9px] font-black">{baseTpl.code} · {baseTpl.version}</div>
            <div className="text-[7px] font-bold">Retention: {baseTpl.retention}</div>
            <div className="text-[7px] font-bold">
              Mode: {blankMode ? 'BLANK OFFICE FORM' : '2026 SMART-FILLED'}
            </div>
          </div>
        </div>

        {/* Mandatory NDIS Practice Standard & Audit Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-purple-200 bg-purple-50/70 px-3.5 py-1.5 text-[7.8px]">
          <div className="font-body font-black text-blue-950">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-purple-700" />
            2026 Compliance Standard: <span className="text-purple-900">{baseTpl.ndisStandard}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-body font-extrabold text-blue-950">
            <span>Review Cycle: {baseTpl.reviewCycle}</span>
            <span>·</span>
            <span>Site: {orgInfo.siteName}</span>
            <span>·</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[7px] font-black text-emerald-950">
              {orgInfo.auditConsent}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {/* SECTION 1 — Mandatory 2026 Audit Control & Record Metadata Grid */}
          <div>
            <div
              className="rounded-t-lg px-2.5 py-1 font-body text-[8px] font-black uppercase tracking-wider text-white"
              style={{ background: baseTpl.accent }}
            >
              Section 1 — Mandatory 2026 Audit Control &amp; Record Metadata
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-x border-b border-purple-200 rounded-b-lg overflow-hidden">
              {baseTpl.metadataFields.map((field) => (
                <div
                  key={field.key}
                  className="border-b border-r border-purple-200 p-2 bg-white"
                >
                  <label className="block font-body text-[7px] font-black uppercase tracking-wider text-purple-900">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={getFieldVal(field)}
                    onChange={(e) => setFieldVal(field.key, e.target.value)}
                    placeholder={blankMode ? '____________________________________________________' : field.sample}
                    className="mt-0.5 w-full border-b border-dotted border-purple-400 bg-transparent py-0.5 font-body text-[8.5px] font-bold text-blue-950 focus:border-pink-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2 — 2026 Compliance Verification Checkpoints & Evidence Table */}
          <div>
            <div
              className="rounded-t-lg px-2.5 py-1 font-body text-[8px] font-black uppercase tracking-wider text-white"
              style={{ background: baseTpl.accent }}
            >
              Section 2 — Mandatory 2026 Compliance Verification Checkpoints &amp; Evidence Trail
            </div>
            <div className="overflow-x-auto border-x border-b border-purple-200 rounded-b-lg">
              <table className="w-full border-collapse text-left font-body text-[8px]">
                <thead>
                  <tr className="border-b border-purple-200 bg-purple-50/80 text-[7px] font-black uppercase text-purple-950">
                    <th className="py-1.5 px-2 w-16">Ref</th>
                    <th className="py-1.5 px-2">2026 Mandatory Audit Checkpoint</th>
                    <th className="py-1.5 px-2 w-44">Compliance Status (Tick)</th>
                    <th className="py-1.5 px-2 w-48">Evidence / Document Serial Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {baseTpl.auditCheckpoints.map((cp, i) => {
                    const st = getCheckpointStatus(cp.ref);
                    return (
                      <tr
                        key={cp.ref}
                        className={`border-b border-purple-100 ${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/25'}`}
                      >
                        <td className="py-1.5 px-2 font-black text-purple-900">{cp.ref}</td>
                        <td className="py-1.5 px-2 font-bold text-blue-950">{cp.item}</td>
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-1.5 font-black text-[7.3px]">
                            {['Yes', 'Action Req', 'N/A'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setCheckpointStatus(cp.ref, opt)}
                                className={`rounded border px-1.5 py-0.5 transition-colors ${
                                  st === opt
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-purple-300 bg-white text-blue-950'
                                }`}
                              >
                                {st === opt ? '☑' : '☐'} {opt}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 font-semibold text-purple-950">
                          {blankMode ? (
                            <span className="text-purple-400">____________________________</span>
                          ) : (
                            cp.evidence
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3 & 4 — Ruled Narrative & Evidence Sections (Office Print Ruled Lines) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {baseTpl.narrativeSections.map((sec, idx) => (
              <div
                key={sec.heading}
                className="overflow-hidden rounded-lg border border-purple-200 bg-white"
              >
                <div
                  className="px-2.5 py-1 font-body text-[7.8px] font-black uppercase tracking-wider text-white"
                  style={{ background: baseTpl.accent }}
                >
                  {sec.heading}
                </div>
                <div className="p-2 space-y-1">
                  <p className="font-body text-[7px] font-semibold italic text-purple-800">
                    {sec.prompt}
                  </p>
                  <textarea
                    rows={4}
                    value={getNarrativeVal(idx, sec.sampleText)}
                    onChange={(e) => setNarrativeVal(idx, e.target.value)}
                    placeholder={
                      blankMode
                        ? 'Ruled lines ready for handwritten office completion...'
                        : sec.sampleText
                    }
                    className="document-ruled-answer w-full rounded border border-purple-200 bg-white p-1.5 font-body text-[8px] font-bold leading-7 text-blue-950 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 5 — Mandatory Dual-Signature, Timestamp & Auditor Sign-Off Block */}
          <div>
            <div
              className="rounded-t-lg px-2.5 py-1 font-body text-[8px] font-black uppercase tracking-wider text-white"
              style={{ background: baseTpl.accent }}
            >
              Mandatory Dual-Signature, Declaration &amp; Auditor Verification Sign-Off
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-x border-b border-purple-200 rounded-b-lg bg-purple-50/30 p-2.5">
              {baseTpl.signOffRoles.map((role) => (
                <div
                  key={role.roleLabel}
                  className="rounded-lg border border-purple-300 bg-white p-2 space-y-1.5 text-[7.8px]"
                >
                  <div className="font-body font-black uppercase text-purple-900">
                    {role.roleLabel}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[6.8px] font-bold uppercase text-purple-700">Printed Name &amp; Role:</span>
                      <div className="mt-0.5 border-b border-purple-400 pb-0.5 font-bold text-blue-950">
                        {blankMode ? '\u00A0' : role.nameSample}
                      </div>
                    </div>
                    <div>
                      <span className="text-[6.8px] font-bold uppercase text-purple-700">Date &amp; Time Signed:</span>
                      <div className="mt-0.5 border-b border-purple-400 pb-0.5 font-bold text-blue-950">
                        {blankMode ? '____ / ____ / 2026 · ____:____' : `${new Date().toISOString().slice(0, 10)} · 09:30 AM`}
                      </div>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-[6.8px] font-bold uppercase text-purple-700"> Handwritten / Digital Signature:</span>
                    <div className="mt-1 h-7 rounded border border-dashed border-purple-400 bg-purple-50/40 px-2 flex items-center font-editorial-italic text-xs text-purple-900">
                      {blankMode ? '' : `Signed: ${role.nameSample}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action & Print Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-purple-200 pt-2">
            <div className="font-body text-[7.5px] font-extrabold text-purple-900">
              Document Control: <span className="font-black text-blue-950">{baseTpl.code} ({baseTpl.version})</span> · File in <span className="font-black text-pink-700">{baseTpl.binder}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 rounded-lg border-2 border-purple-600 bg-white px-2.5 py-1 font-body text-[7.8px] font-black text-purple-950 hover:bg-purple-50"
              >
                <Printer className="h-3 w-3 text-purple-700" /> Print Current Sheet (A4)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadSingle2026TemplatePdf(buildMergedTemplate(baseTpl), orgInfo, blankMode)
                }
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-body text-[7.8px] font-black text-white shadow-sm"
                style={{ background: baseTpl.accent }}
              >
                <Download className="h-3 w-3" /> Download Single A4 PDF ({baseTpl.code})
              </button>
              <button
                type="button"
                onClick={() => downloadAll2026TemplatesPackPdf(orgInfo, blankMode)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1 font-body text-[7.8px] font-black text-white shadow-sm"
                style={{ background: HEADER_GRADIENT }}
              >
                <Layers className="h-3 w-3" /> Download All 12 Printable Templates (Master A4 PDF)
              </button>
              <button
                type="button"
                disabled={savingVault}
                onClick={handleSaveToVault}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 font-body text-[7.8px] font-black text-white shadow-sm hover:bg-emerald-700"
              >
                <Save className="h-3 w-3" /> {savingVault ? 'Filing…' : 'Save Completed Form to Vault'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}