import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, AlertTriangle, TrendingUp, Vote, Database, ArrowRight,
  PenTool, ShieldCheck, Lock, FileCheck2,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { logUserAction } from '@/lib/actionLog';
import { toast } from '@/components/ui/use-toast';
import {
  PAGE7_CAPA_DATA,
  PAGE8_BENEFITS_WATERFALL,
  PAGE9_RAID_DATA,
  PAGE10_EXECUTIVE_ACTIONS,
  PAGE11_BOARD_DECISIONS,
  PAGE12_FABRIC_AI_DATA,
} from '@/lib/careSpherePowerBiData';
import { PowerBiRadialGauge } from '@/components/enterprise/powerbi/PowerBiPagesOneToSix';
import BoardResolutionSignOffModal from '@/components/enterprise/powerbi/BoardResolutionSignOffModal';

export default function PowerBiPagesSevenToTwelve({ activePage }) {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState(PAGE10_EXECUTIVE_ACTIONS.actions[0]);
  const [decisions, setDecisions] = useState(PAGE11_BOARD_DECISIONS);
  const [signOffModalState, setSignOffModalState] = useState({
    open: false,
    resolution: null,
    defaultStatus: 'Approved',
  });
  const [savingSignOff, setSavingSignOff] = useState(false);

  const loadRecordedResolutions = useCallback(async () => {
    try {
      const page = await base44.entities.GovernanceObject.filter(
        { record_type: 'Board Resolution' },
        { sort: '-created_date', limit: 50 }
      );
      const items = page?.items || (Array.isArray(page) ? page : []);
      if (!items.length) return;

      setDecisions((prev) => {
        const byCode = new Map(items.map((item) => [item.object_code, item]));
        return prev.map((d) => {
          const match = byCode.get(d.id);
          if (!match) return d;
          let parsedSig = {};
          try {
            parsedSig = match.signatures ? JSON.parse(match.signatures) : {};
          } catch {
            parsedSig = {};
          }
          return {
            ...d,
            governanceObjectId: match.id,
            status: parsedSig.boardStatus || d.status,
            signedBy: parsedSig.signedBy || match.business_owner || d.signedBy,
            signerRole: parsedSig.signerRole || d.signerRole,
            signedAt: parsedSig.signedAt || match.updated_date || match.created_date || d.signedAt,
            signatureHash: parsedSig.signatureHash || d.signatureHash,
            quorumVerified: parsedSig.quorumVerified ?? true,
            resolutionNotes: match.notes || d.resolutionNotes,
          };
        });
      });
    } catch (err) {
      console.error('Could not load recorded board resolutions:', err);
    }
  }, []);

  useEffect(() => {
    if (activePage === 'p11_board_decisions') {
      loadRecordedResolutions();
    }
  }, [activePage, loadRecordedResolutions]);

  const openSignOffModal = (resolution, desiredStatus) => {
    setSignOffModalState({
      open: true,
      resolution,
      defaultStatus: desiredStatus || resolution.status || 'Approved',
    });
  };

  const handleConfirmSignOff = async (payload) => {
    setSavingSignOff(true);
    try {
      const existing = decisions.find((d) => d.id === payload.decisionId);
      const govStatus =
        payload.status === 'Approved'
          ? 'Active'
          : payload.status === 'Rejected'
          ? 'Archived'
          : 'Under Review';

      const signatureMetadata = JSON.stringify({
        boardStatus: payload.status,
        signedBy: payload.signedBy,
        signerRole: payload.signerRole,
        witnessName: payload.witnessName,
        signedAt: payload.signedAt,
        signatureHash: payload.signatureHash,
        signatureMethod: payload.signatureMethod,
        quorumVerified: payload.quorumVerified,
      });

      const recordPayload = {
        title: payload.decisionTitle,
        object_code: payload.decisionId,
        lifecycle_stage: 'Policy',
        record_type: 'Board Resolution',
        module: 'SME-GARM Board Decisions',
        document_category: 'Policy',
        business_owner: payload.owner,
        status: govStatus,
        version: 'v1.0',
        assigned_to_type: 'Organisation-wide',
        assigned_to_name: payload.committee,
        signatures: signatureMetadata,
        acknowledgements: `Digitally signed by ${payload.signedBy} (${payload.signerRole}) | Witness: ${payload.witnessName} | Seal: ${payload.signatureHash}`,
        evidence_notes: `Board Resolution ${payload.decisionId} (${payload.status}) — Quorum Verified: ${payload.quorumVerified ? 'Yes' : 'No'}`,
        notes: payload.resolutionNotes,
      };

      let savedRecord = null;
      if (existing?.governanceObjectId) {
        savedRecord = await base44.entities.GovernanceObject.update(
          existing.governanceObjectId,
          recordPayload
        );
      } else {
        savedRecord = await base44.entities.GovernanceObject.create(recordPayload);
      }

      await logUserAction(
        payload.status === 'Approved'
          ? 'Approve'
          : payload.status === 'Rejected'
          ? 'Reject'
          : 'Save',
        'GovernanceObject',
        {
          record_id: savedRecord?.id || payload.decisionId,
          record_title: `${payload.decisionId}: ${payload.decisionTitle}`,
          module: 'Board Decisions (SME-GARM)',
          previous_value: existing?.status || 'Open',
          new_value: `${payload.status} (Signed by ${payload.signedBy} · ${payload.signatureHash})`,
          details: `Digital Board Resolution Sign-Off recorded. Signatory: ${payload.signedBy} (${payload.signerRole}), Committee: ${payload.committee}, Seal: ${payload.signatureHash}`,
        }
      );

      setDecisions((prev) =>
        prev.map((d) =>
          d.id === payload.decisionId
            ? {
                ...d,
                governanceObjectId: savedRecord?.id || d.governanceObjectId,
                status: payload.status,
                signedBy: payload.signedBy,
                signerRole: payload.signerRole,
                signedAt: payload.signedAt,
                signatureHash: payload.signatureHash,
                quorumVerified: payload.quorumVerified,
                resolutionNotes: payload.resolutionNotes,
              }
            : d
        )
      );

      toast({
        title: `Board Resolution ${payload.decisionId} Digitally Signed`,
        description: `${payload.status} by ${payload.signedBy} (${payload.signatureHash}) and recorded in the Governance Register & Audit Log.`,
      });

      setSignOffModalState({ open: false, resolution: null, defaultStatus: 'Approved' });
    } catch (err) {
      toast({
        title: 'Could not record digital sign-off',
        description: err?.message || 'Please check your permissions and try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingSignOff(false);
    }
  };

  // PAGE 7: CORRECTIVE ACTIONS
  if (activePage === 'p7_capa') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PAGE7_CAPA_DATA.kpis.map((k) => (
            <div key={k.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.22)' }}>
              <div className="text-[12px] text-slate-300">{k.label}</div>
              <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
              <div className="mt-1 text-[11px] text-slate-400">{k.sub}</div>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-3 text-[16px] font-semibold text-white">
            Corrective Actions Heatmap: Severity × Days Open (Age Buckets: 0-30 · 31-60 · 61-90 · 90+)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] text-white">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                  <th className="py-2 pr-3">Severity</th>
                  {PAGE7_CAPA_DATA.ageBuckets.map((b) => (
                    <th key={b} className="py-2 px-3 text-center">{b} Days</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PAGE7_CAPA_DATA.heatmapRows.map((row) => (
                  <tr key={row.severity}>
                    <td className="py-2.5 pr-3 font-bold" style={{ color: row.color }}>{row.severity}</td>
                    {PAGE7_CAPA_DATA.ageBuckets.map((b) => {
                      const val = row.buckets[b] || 0;
                      return (
                        <td key={b} className="p-2 text-center">
                          <span
                            className="inline-block min-w-[44px] rounded-lg py-1.5 text-sm font-black"
                            style={{
                              backgroundColor: val > 0 ? `${row.color}33` : '#1E293B',
                              color: val > 0 ? row.color : '#64748B',
                              border: val > 0 ? `1px solid ${row.color}` : '1px solid transparent',
                            }}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 8: BENEFITS REALISATION
  if (activePage === 'p8_benefits') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border p-4" style={{ backgroundColor: '#1E293B', borderColor: '#22C55E' }}>
            <div className="text-[12px] text-slate-300">ROI Card</div>
            <div className="mt-1 text-[32px] font-bold" style={{ color: '#22C55E' }}>
              ROI = {PAGE8_BENEFITS_WATERFALL.roi}
            </div>
            <div className="mt-1 text-[11px] text-slate-300">Validated Enterprise Return on Investment</div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}>
            <div className="text-[12px] text-slate-300">Payback Card</div>
            <div className="mt-1 text-[32px] font-bold" style={{ color: '#39E6FF' }}>
              {PAGE8_BENEFITS_WATERFALL.payback}
            </div>
            <div className="mt-1 text-[11px] text-slate-300">Capital Recovery Velocity</div>
          </div>

          <PowerBiRadialGauge
            title="Benefits Achievement Gauge"
            value={PAGE8_BENEFITS_WATERFALL.achievement}
            target=">85%"
            status="84% Realised"
            color="#22C55E"
          />
        </div>

        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}
        >
          <div className="mb-3 text-[16px] font-semibold text-white">
            Benefits Waterfall (Investment → Executive Productivity → Workforce Optimisation → Operational Efficiency → Risk Avoidance → Net Benefit)
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {PAGE8_BENEFITS_WATERFALL.steps.map((s, idx) => (
              <div
                key={s.step}
                className="flex flex-col justify-between rounded-xl border p-3.5"
                style={{ backgroundColor: '#1E293B', borderColor: s.color }}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                    Stage {idx + 1}
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">{s.step}</div>
                </div>
                <div className="mt-3 text-xl font-black" style={{ color: s.color }}>
                  {s.display}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PAGE 9: RAID ANALYTICS
  if (activePage === 'p9_raid') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PAGE9_RAID_DATA.kpis.map((k) => (
            <div key={k.measure} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: k.color }}>
              <div className="text-[12px] text-slate-300">{k.measure}</div>
              <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">RAID Trend</div>
            <div className="space-y-2">
              {PAGE9_RAID_DATA.trend.map((t) => (
                <div key={t.month} className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px]" style={{ backgroundColor: '#1E293B' }}>
                  <span className="font-bold text-white">{t.month}</span>
                  <span style={{ color: '#EF4444' }}>R:{t.risks}</span>
                  <span style={{ color: '#39E6FF' }}>A:{t.assumptions}</span>
                  <span style={{ color: '#FBBF24' }}>I:{t.issues}</span>
                  <span style={{ color: '#22C55E' }}>D:{t.dependencies}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">Issues by Age (Bar Chart)</div>
            <div className="space-y-2.5">
              {PAGE9_RAID_DATA.issuesByAge.map((b) => (
                <div key={b.bucket} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-bold text-white">
                    <span>{b.bucket}</span>
                    <span style={{ color: '#39E6FF' }}>{b.count} Issues</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-900">
                    <div className="h-full rounded-full" style={{ width: `${(b.count / 8) * 100}%`, backgroundColor: '#39E6FF' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">Risks by Severity (17 Total)</div>
            <div className="space-y-2.5">
              {PAGE9_RAID_DATA.risksBySeverity.map((s) => (
                <div key={s.severity} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-bold text-white">
                    <span>{s.severity}</span>
                    <span style={{ color: s.color }}>{s.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-900">
                    <div className="h-full rounded-full" style={{ width: `${(s.count / 17) * 100}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 10: EXECUTIVE ACTIONS
  if (activePage === 'p10_exec_actions') {
    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PAGE10_EXECUTIVE_ACTIONS.kpis.map((k) => (
            <div key={k.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: k.color }}>
              <div className="text-[12px] text-slate-300">{k.label}</div>
              <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-xl border p-4 lg:col-span-8" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="mb-2 text-[16px] font-semibold text-white">
              Executive Action Table (Click a row to drill through)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] text-white">
                <thead>
                  <tr className="border-b border-slate-700 text-[11px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2 pr-3">Owner</th>
                    <th className="py-2 pr-3">Due Date</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">RAG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {PAGE10_EXECUTIVE_ACTIONS.actions.map((act) => (
                    <tr
                      key={act.id}
                      onClick={() => setSelectedAction(act)}
                      className="cursor-pointer transition hover:bg-slate-800/70"
                    >
                      <td className="py-2.5 pr-3 font-bold">{act.action}</td>
                      <td className="py-2.5 pr-3 text-slate-300">{act.owner}</td>
                      <td className="py-2.5 pr-3 text-slate-300">{act.dueDate}</td>
                      <td className="py-2.5 pr-3 text-slate-200">{act.status}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-black text-slate-950"
                          style={{
                            backgroundColor:
                              act.rag === 'Green' ? '#22C55E' : act.rag === 'Amber' ? '#FBBF24' : '#EF4444',
                          }}
                        >
                          {act.rag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border p-4 lg:col-span-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
            <div className="text-[16px] font-semibold text-white">
              Drill-Through: Action → Owner → Committee → Board Decision
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: 'Action', val: selectedAction.action, color: '#39E6FF' },
                { label: '↓ Owner', val: selectedAction.owner, color: '#22C55E' },
                { label: '↓ Committee', val: selectedAction.committee, color: '#FBBF24' },
                { label: '↓ Board Decision', val: selectedAction.boardDecision, color: '#39E6FF' },
              ].map((step) => (
                <div key={step.label} className="rounded-lg border p-2.5" style={{ backgroundColor: '#1E293B', borderColor: step.color }}>
                  <div className="text-[10px] font-bold uppercase" style={{ color: step.color }}>{step.label}</div>
                  <div className="text-xs font-bold text-white">{step.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 11: BOARD DECISIONS
  if (activePage === 'p11_board_decisions') {
    const counts = {
      Approved: decisions.filter((d) => d.status === 'Approved').length,
      Deferred: decisions.filter((d) => d.status === 'Deferred').length,
      Rejected: decisions.filter((d) => d.status === 'Rejected').length,
      Open: decisions.filter((d) => d.status === 'Open').length,
    };
    const signedCount = decisions.filter((d) => Boolean(d.signedBy && d.signatureHash)).length;
    const unsignedDecision = decisions.find((d) => !d.signedBy || !d.signatureHash) || decisions[0];

    return (
      <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        {/* Voting Status & Digital Sign-Off KPI Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Approved', count: counts.Approved, color: '#22C55E', sub: 'Constitutional Quorum Ratified' },
            { label: 'Deferred', count: counts.Deferred, color: '#FBBF24', sub: 'Scheduled Next Cycle' },
            { label: 'Rejected', count: counts.Rejected, color: '#EF4444', sub: 'Declined by Board' },
            { label: 'Open for Vote', count: counts.Open, color: '#39E6FF', sub: 'Awaiting Resolution' },
            {
              label: 'Digitally Signed',
              count: `${signedCount}/${decisions.length}`,
              color: signedCount === decisions.length ? '#22C55E' : '#39E6FF',
              sub: 'Recorded in GovernanceObject & AuditLog',
            },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: c.color }}>
              <div className="text-[12px] text-slate-300">{c.label}</div>
              <div className="mt-1 text-[30px] font-bold leading-none" style={{ color: c.color }}>{c.count}</div>
              <div className="mt-1 text-[10px] text-slate-400">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Decision Register with Digital Sign-Off Controls */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[16px] font-semibold text-white">
                Board Decision Register &amp; Mandatory Digital Sign-Off Ledger
              </div>
              <div className="text-[11px] text-slate-300">
                Every resolution determination requires a digital signature and is persisted to GovernanceObject &amp; the immutable system AuditLog.
              </div>
            </div>
            <button
              type="button"
              onClick={() => openSignOffModal(unsignedDecision, 'Approved')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black transition"
              style={{ backgroundColor: '#22C55E', color: '#081018' }}
            >
              <PenTool className="h-3.5 w-3.5" />
              Open Digital Sign-Off Modal ({unsignedDecision.id})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] text-white">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                  <th className="py-2 pr-3">Decision ID</th>
                  <th className="py-2 pr-3">Resolution &amp; Minute</th>
                  <th className="py-2 pr-3">Owner &amp; Committee</th>
                  <th className="py-2 pr-3">Digital Sign-Off Record</th>
                  <th className="py-2 pr-3">Vote &amp; Digital Seal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {decisions.map((d) => {
                  const isSigned = Boolean(d.signedBy && d.signatureHash);
                  return (
                    <tr key={d.id} className="align-top">
                      <td className="py-3 pr-3 font-mono font-bold" style={{ color: '#39E6FF' }}>
                        {d.id}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="font-bold text-white">{d.decision}</div>
                        {d.resolutionNotes && (
                          <div className="mt-0.5 text-[11px] text-slate-300">{d.resolutionNotes}</div>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="font-bold text-slate-200">{d.owner}</div>
                        <div className="text-[11px] text-slate-400">{d.committee}</div>
                      </td>
                      <td className="py-3 pr-3">
                        {isSigned ? (
                          <div className="rounded-lg border px-2.5 py-1.5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(34,197,94,0.35)' }}>
                            <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#22C55E' }}>
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                              Digitally Signed · {d.signatureHash}
                            </div>
                            <div className="mt-0.5 text-[11px] text-white">
                              {d.signedBy} ({d.signerRole})
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {d.signedAt ? new Date(d.signedAt).toLocaleString('en-AU') : 'Verified'}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border px-2.5 py-1.5" style={{ backgroundColor: 'rgba(251,191,36,0.12)', borderColor: '#FBBF24' }}>
                            <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#FBBF24' }}>
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              Signature Required
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-300">
                              Click Sign-Off to digitally seal &amp; record
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {['Approved', 'Deferred', 'Rejected', 'Open'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => openSignOffModal(d, st)}
                              className="rounded px-2 py-1 text-[10px] font-bold transition"
                              style={{
                                backgroundColor: d.status === st ? '#39E6FF' : '#1E293B',
                                color: d.status === st ? '#081018' : '#FFFFFF',
                              }}
                            >
                              {st}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => openSignOffModal(d, d.status === 'Open' ? 'Approved' : d.status)}
                            className="inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[10px] font-black transition"
                            style={{
                              backgroundColor: isSigned ? '#1E293B' : '#22C55E',
                              color: isSigned ? '#39E6FF' : '#081018',
                              borderColor: isSigned ? '#39E6FF' : '#22C55E',
                            }}
                          >
                            <FileCheck2 className="h-3 w-3" />
                            {isSigned ? 'Re-Sign / Amend' : 'Digital Sign-Off'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <BoardResolutionSignOffModal
          open={signOffModalState.open}
          onClose={() => setSignOffModalState({ open: false, resolution: null, defaultStatus: 'Approved' })}
          resolution={signOffModalState.resolution}
          defaultStatus={signOffModalState.defaultStatus}
          currentUser={user}
          onConfirmSignOff={handleConfirmSignOff}
          saving={savingSignOff}
        />
      </div>
    );
  }

  // PAGE 12: FABRIC, DATA & AI GOVERNANCE
  return (
    <div className="space-y-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PAGE12_FABRIC_AI_DATA.kpis.map((k) => (
          <div key={k.label} className="rounded-xl border p-3.5" style={{ backgroundColor: '#1E293B', borderColor: k.color }}>
            <div className="text-[12px] text-slate-300">{k.label}</div>
            <div className="mt-1 text-[32px] font-bold leading-none" style={{ color: k.color }}>{k.value}</div>
            <div className="mt-1 text-[11px] text-slate-400">Target: {k.target}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4" style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.24)' }}>
        <div className="mb-3 text-[16px] font-semibold text-white">
          Microsoft Fabric End-to-End Architecture Flow
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-8">
          {PAGE12_FABRIC_AI_DATA.architectureFlow.map((node) => (
            <div
              key={node.step}
              className="flex flex-col justify-between rounded-xl border p-3"
              style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
            >
              <div>
                <div className="text-[10px] font-bold uppercase" style={{ color: '#39E6FF' }}>
                  Stage {node.step}
                </div>
                <div className="mt-1 text-sm font-bold text-white">{node.name}</div>
                <div className="mt-1 text-[11px] text-slate-300">{node.sub}</div>
              </div>
              <div className="mt-2 text-right text-[10px] font-bold" style={{ color: '#22C55E' }}>
                ONLINE →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}