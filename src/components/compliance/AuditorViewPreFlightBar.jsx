import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, Lock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuditorViewPreFlightBar({
  onOpenAuditorScreen,
  onOpenConsentRegister,
}) {
  const [simulatingAuditor, setSimulatingAuditor] = useState(false);
  const [stats, setStats] = useState({
    loading: true,
    consentedDocs: 0,
    withheldDocs: 0,
    consentedCerts: 0,
    withheldCerts: 0,
    activeConsents: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function loadConsentCoverage() {
      try {
        const [partDocsRes, certsRes, docCtrlRes, consentsRes] = await Promise.all([
          base44.entities.ParticipantDocument.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
          base44.entities.Certificate.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
          base44.entities.DocumentControl.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
          base44.entities.InformationSharingConsent.filter({ status: 'Active' }, { limit: 100 }).catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;

        const allDocs = [...(partDocsRes?.items || []), ...(docCtrlRes?.items || [])];
        const consentedDocs = allDocs.filter((d) => d.audit_consent === 'Audit consent received').length;
        const withheldDocs = allDocs.length - consentedDocs;

        const certs = certsRes?.items || [];
        const consentedCerts = certs.filter((c) => c.audit_consent === 'Audit consent received').length;
        const withheldCerts = certs.length - consentedCerts;

        setStats({
          loading: false,
          consentedDocs,
          withheldDocs,
          consentedCerts,
          withheldCerts,
          activeConsents: (consentsRes?.items || []).length,
        });
      } catch (e) {
        console.error(e);
        if (!cancelled) setStats((s) => ({ ...s, loading: false }));
      }
    }
    loadConsentCoverage();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-[#F0F7FF]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A2B6D] text-white">
            <ShieldCheck className="h-5 w-5 text-[#00C6FF]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Pre-Audit Privacy &amp; Consent Flight Check
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                  simulatingAuditor
                    ? 'bg-[#5A00D6] text-white'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {simulatingAuditor
                  ? 'Previewing External Auditor View (Consent-Filtered)'
                  : 'Viewing as: Provider Admin / Compliance'}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-[#0A2B6D]/80">
              External auditors only see records where <strong className="text-[#0A2B6D]">Audit consent received</strong> is verified.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !simulatingAuditor;
              setSimulatingAuditor(next);
              if (next && onOpenAuditorScreen) {
                onOpenAuditorScreen();
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
              simulatingAuditor
                ? 'bg-[#5A00D6] text-white shadow-sm'
                : 'border border-[#0072FF] bg-white text-[#0A2B6D] hover:bg-sky-50'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>
              {simulatingAuditor ? 'Exit Auditor Simulation' : 'Simulate External Auditor View'}
            </span>
          </button>

          {onOpenConsentRegister && (
            <button
              type="button"
              onClick={onOpenConsentRegister}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A2B6D] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
            >
              <span>Manage Audit Consents</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#00C6FF]" />
            </button>
          )}
        </div>
      </div>

      {/* Live Consent Telemetry Strip */}
      <div className="grid grid-cols-2 gap-2 border-t border-sky-200 bg-white px-4 py-2.5 sm:grid-cols-4 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-600">
            Auditor-Visible Docs: <strong className="font-extrabold text-[#0A2B6D]">{stats.consentedDocs}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-slate-600">
            Withheld (No Consent): <strong className="font-extrabold text-amber-700">{stats.withheldDocs}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-600">
            Auditor-Visible Certs: <strong className="font-extrabold text-[#0A2B6D]">{stats.consentedCerts}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#0072FF] shrink-0" />
          <span className="font-semibold text-slate-600">
            Active Sharing Consents: <strong className="font-extrabold text-[#0A2B6D]">{stats.activeConsents}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}