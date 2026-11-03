import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, RefreshCw, Database } from 'lucide-react';

export default function CanonicalIntakeConsolidationBar({ onConsolidated }) {
  const [state, setState] = useState({
    loading: true,
    legacyCount: 0,
    unmigrated: [],
    syncing: false,
    syncedMessage: '',
  });

  const checkLegacyRecords = async () => {
    try {
      const [legacyRes, canonicalRes] = await Promise.all([
        base44.entities.Intake.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.IntakeCase.filter({}, { limit: 200 }).catch(() => ({ items: [] })),
      ]);
      const legacyItems = legacyRes?.items || [];
      const canonicalItems = canonicalRes?.items || [];
      const canonicalNames = new Set(
        canonicalItems.map((c) => (c.full_name || c.person_name || '').trim().toLowerCase()).filter(Boolean)
      );

      const unmigrated = legacyItems.filter((item) => {
        const name = (item.full_name || item.participant_name || item.applicant_name || item.name || '').trim().toLowerCase();
        return name && !canonicalNames.has(name);
      });

      setState((s) => ({
        ...s,
        loading: false,
        legacyCount: legacyItems.length,
        unmigrated,
      }));
    } catch (e) {
      console.error(e);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  useEffect(() => {
    checkLegacyRecords();
  }, []);

  const handleConsolidate = async () => {
    if (!state.unmigrated.length || state.syncing) return;
    setState((s) => ({ ...s, syncing: true, syncedMessage: '' }));
    try {
      const payloads = state.unmigrated.map((item) => ({
        full_name: item.full_name || item.participant_name || item.applicant_name || item.name || 'Migrated Intake Record',
        intake_type: item.intake_type === 'Employee' || item.role ? 'Employee' : 'Participant',
        status: item.status === 'Approved' ? 'Approved' : 'Ready for Review',
        email: item.email || '',
        phone: item.phone || '',
        notes: item.notes || 'Consolidated from legacy Intake register into canonical IntakeCase.',
      }));
      await base44.entities.IntakeCase.bulkCreate(payloads);
      await checkLegacyRecords();
      if (onConsolidated) onConsolidated();
      setState((s) => ({
        ...s,
        syncing: false,
        syncedMessage: `${payloads.length} legacy Intake record(s) consolidated into the canonical IntakeCase register.`,
      }));
    } catch (e) {
      console.error(e);
      setState((s) => ({ ...s, syncing: false }));
    }
  };

  if (state.loading) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-[#F0F7FF] px-4 py-2.5 text-xs">
      <div className="flex items-center gap-2 font-bold text-[#0A2B6D]">
        <Database className="h-4 w-4 text-[#0072FF] shrink-0" />
        <span>
          Single Source of Truth Register Status:{' '}
          {state.unmigrated.length === 0 ? (
            <strong className="text-emerald-700">
              100% Consolidated in Canonical IntakeCase Register
            </strong>
          ) : (
            <strong className="text-amber-800">
              {state.unmigrated.length} legacy Intake record(s) ready to merge into IntakeCase
            </strong>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {state.syncedMessage && (
          <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {state.syncedMessage}
          </span>
        )}
        {state.unmigrated.length > 0 ? (
          <button
            type="button"
            onClick={handleConsolidate}
            disabled={state.syncing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-[#0072FF] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${state.syncing ? 'animate-spin' : ''}`} />
            <span>{state.syncing ? 'Consolidating…' : 'Consolidate Legacy Records Now'}</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Zero Duplicate Orphans
          </span>
        )}
      </div>
    </div>
  );
}