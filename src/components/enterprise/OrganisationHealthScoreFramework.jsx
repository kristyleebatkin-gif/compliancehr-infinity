import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ShieldCheck, Users, AlertTriangle, Award,
  RefreshCw, Camera, Download, Sliders, Eye, Layers, CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid,
} from 'recharts';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { loadAndCalculateExecutiveScores } from '@/lib/organisationHealthScoreEngine';
import { downloadCsv } from '@/lib/csvExport';
import { logUserAction } from '@/lib/actionLog';
import ExecutiveScoreDrillDownModal from '@/components/enterprise/ExecutiveScoreDrillDownModal';
import EnterpriseArchitectureMasterBlueprint from '@/components/enterprise/EnterpriseArchitectureMasterBlueprint';

const SCORE_ORDER = [
  { key: 'organisation_health', icon: Activity },
  { key: 'compliance', icon: ShieldCheck },
  { key: 'workforce', icon: Users },
  { key: 'risk', icon: AlertTriangle },
  { key: 'quality', icon: Award },
];

export default function OrganisationHealthScoreFramework({ onScoresLoaded }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordingSnapshot, setRecordingSnapshot] = useState(false);
  const [selectedScoreKey, setSelectedScoreKey] = useState(null);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showIntelligenceMatrix, setShowIntelligenceMatrix] = useState(true);

  const refreshScores = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadAndCalculateExecutiveScores();
      setData(result);
      if (onScoresLoaded) onScoresLoaded(result);
    } finally {
      setLoading(false);
    }
  }, [onScoresLoaded]);

  useEffect(() => {
    refreshScores();
  }, [refreshScores]);

  const handleRecordSnapshot = async () => {
    if (!data?.scores) return;
    setRecordingSnapshot(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const actor = user?.email || user?.full_name || 'Executive User';
      const today = new Date().toISOString().slice(0, 10);
      const s = data.scores;

      await base44.entities.ExecutiveScoreSnapshot.create({
        snapshot_date: today,
        organisation_health_score: s.organisation_health.score ?? 0,
        compliance_score: s.compliance.score ?? 0,
        workforce_score: s.workforce.score ?? 0,
        risk_score: s.risk.score ?? 0,
        quality_score: s.quality.score ?? 0,
        metrics_summary_json: JSON.stringify(data.rawCounts || {}),
        recorded_by: actor,
        notes: 'Point-in-time executive health snapshot',
      });

      await logUserAction('Executive Score Snapshot Recorded', 'ExecutiveScoreSnapshot', {
        record_id: today,
        record_title: `Organisation Health Snapshot (${today})`,
        details: `OrgHealth=${s.organisation_health.score ?? 'N/A'}%, Compliance=${s.compliance.score ?? 'N/A'}%, Workforce=${s.workforce.score ?? 'N/A'}%, Risk=${s.risk.score ?? 'N/A'}%, Quality=${s.quality.score ?? 'N/A'}%`,
      });

      toast({
        title: 'Executive Score Snapshot saved',
        description: 'Historical trend and audit log updated with current live scores.',
      });
      await refreshScores();
    } catch (err) {
      toast({
        title: 'Could not save snapshot',
        description: err?.message || 'Check permissions and try again.',
        variant: 'destructive',
      });
    } finally {
      setRecordingSnapshot(false);
    }
  };

  const handleExportCsv = () => {
    if (!data?.scores) return;
    const rows = [
      ...SCORE_ORDER.map(({ key }) => {
        const sc = data.scores[key];
        return {
          category: 'Executive Core Score',
          title: sc.title,
          score: sc.score !== null ? sc.score : 'Missing Data',
          status: sc.band?.status || 'Missing Data',
          evidenceCount: sc.evidenceCount ?? 0,
          calculatedAt: sc.calculatedAt || data.calculatedAt || '',
          formula_description: sc.formula_description || '',
        };
      }),
      ...(data.accuracyControl || []).map((ac) => ({
        category: 'Accuracy Control Framework',
        title: ac.title,
        score: ac.score !== null ? ac.score : 'Missing Data',
        status: ac.band?.status || 'Missing Data',
        evidenceCount: ac.detail,
        calculatedAt: data.calculatedAt || '',
        formula_description: ac.detail,
      })),
      ...(data.liveIntelligence13 || []).map((li) => ({
        category: '13-Score Live Compliance Intelligence',
        title: li.title,
        score: li.score !== null ? li.score : 'Missing Data',
        status: li.band?.status || 'Missing Data',
        evidenceCount: li.detail,
        calculatedAt: data.calculatedAt || '',
        formula_description: li.detail,
      })),
    ];

    downloadCsv(
      `executive-health-and-accuracy-scores-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'category', label: 'Framework Category' },
        { key: 'title', label: 'Score Title' },
        { key: 'score', label: 'Score (%)' },
        { key: 'status', label: 'Status Band' },
        { key: 'evidenceCount', label: 'Evidence / Detail' },
        { key: 'calculatedAt', label: 'Calculated Timestamp' },
        { key: 'formula_description', label: 'Formula / Basis' },
      ],
      rows
    );
  };

  const chartData = data?.scores
    ? SCORE_ORDER.map(({ key }) => ({
        name: data.scores[key].shortTitle,
        score: data.scores[key].score ?? 0,
        warning: data.scores[key].warning_threshold,
        color: data.scores[key].color,
      }))
    : [];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div
        className="h-1 w-full"
        style={{
          background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
        }}
      />

      {/* Clean Microsoft Purview / ServiceNow Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#F8FAFC] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0072FF]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0072FF]">
              <Activity className="h-3.5 w-3.5" />
              Accuracy Control &amp; Live Compliance Intelligence
            </span>
            <span className="text-xs font-semibold text-[#0A2B6D]/70">
              Evidence-backed · Zero synthetic fallbacks
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-lg font-extrabold text-[#0A2B6D] sm:text-xl">
            Executive Health Scorecards, Accuracy Control &amp; 13-Score Live Intelligence
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setShowIntelligenceMatrix((v) => !v)}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[#0072FF]" />
            {showIntelligenceMatrix ? 'Hide 13-Score Matrix' : 'Show 13-Score Matrix'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleRecordSnapshot}
            disabled={recordingSnapshot || loading}
          >
            <Camera className="mr-1.5 h-3.5 w-3.5 text-[#0072FF]" />
            {recordingSnapshot ? 'Recording…' : 'Record Snapshot'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleExportCsv}
            disabled={loading || !data}
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setShowBlueprint((v) => !v)}
          >
            <Layers className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
            {showBlueprint ? 'Hide Blueprint' : 'Master Blueprint'}
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={refreshScores}
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* ROW 1: 5 Interactive Executive Score Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SCORE_ORDER.map(({ key, icon: Icon }) => {
            const sc = data?.scores?.[key];
            if (!sc) {
              return (
                <div
                  key={key}
                  className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4"
                />
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedScoreKey(key)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-2xs transition hover:border-[#0072FF] hover:shadow-sm focus:outline-none"
              >
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: sc.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <Badge className={`${sc.band?.badgeClass} text-xs px-2 py-0.5`}>
                      {sc.band?.status}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]/75">
                      {sc.title}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                        {sc.score !== null ? `${sc.score}%` : 'Unassessed'}
                      </span>
                      <span className="text-xs font-medium text-[#0A2B6D]/60">
                        W&lt;{sc.warning_threshold}% · C&lt;{sc.critical_threshold}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: sc.score !== null ? `${sc.score}%` : '0%',
                        backgroundColor: sc.color,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex w-full items-center justify-between border-t border-slate-100 pt-2 text-xs font-bold text-[#0072FF]">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    Inspect Formula &amp; Evidence
                  </span>
                  <Sliders className="h-3.5 w-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* ROW 2: Accuracy Control Framework (5 Live Integrity Scores) + 13 Live Compliance Intelligence Scores */}
        {showIntelligenceMatrix && data && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Accuracy Control Framework — 5 Continuous Verification Scores
                  </h3>
                  <p className="text-xs text-[#0A2B6D]/75">
                    Continuously validates participant, workforce, training, compliance, audit, risk, incident, and document evidence.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  100% Evidence-Backed
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                {(data.accuracyControl || []).map((ac) => (
                  <Link
                    key={ac.key}
                    to={ac.route}
                    className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-2xs transition hover:border-[#0072FF]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0A2B6D]">{ac.title}</span>
                      <Badge className={`${ac.band?.badgeClass} text-xs px-2 py-0`}>
                        {ac.band?.status}
                      </Badge>
                    </div>
                    <div className="mt-1.5 text-xl font-extrabold text-[#0A2B6D]">
                      {ac.score !== null ? `${ac.score}%` : 'Unassessed'}
                    </div>
                    <p className="mt-1 text-xs text-[#0A2B6D]/70">{ac.detail}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    13-Score Live Compliance &amp; Outcomes Intelligence
                  </h3>
                  <p className="text-xs text-[#0A2B6D]/75">
                    Real-time posture across NDIS Practice Standards, Strengthened Aged Care Standards, Clinical Governance, WHS, and Participant Outcomes.
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {(data.liveIntelligence13 || []).map((item) => (
                  <Link
                    key={item.key}
                    to={item.route}
                    className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-2xs transition hover:border-[#0072FF]"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-[#0A2B6D]">{item.title}</span>
                      <span className="text-sm font-extrabold text-[#0072FF]">
                        {item.score !== null ? `${item.score}%` : '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#0A2B6D]/70">{item.detail}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROW 3: Comparative Visualisation & Explainability Bar */}
        {data?.scores && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Executive Score Comparison vs Thresholds
                </span>
                <span className="text-xs font-bold text-[#5A00D6]">
                  {data.snapshots?.length || 0} saved snapshot(s)
                </span>
              </div>
              <div className="h-44 w-full rounded-lg bg-white p-2.5 border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 600 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="score" name="Live Score (%)" radius={[4, 4, 0, 0]} barSize={30}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Transparent Formula &amp; Weighting Reference
                </span>
                <span className="text-xs font-semibold text-[#0072FF]">
                  Click any score row to customise weightings or inspect source evidence
                </span>
              </div>
              <div className="space-y-2">
                {SCORE_ORDER.map(({ key }) => {
                  const sc = data.scores[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedScoreKey(key)}
                      className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3.5 py-2 text-left text-xs transition hover:border-[#0072FF] hover:bg-white"
                    >
                      <span className="font-bold text-[#0A2B6D]">{sc.title}</span>
                      <span className="font-mono text-xs font-semibold text-[#5A00D6]">
                        {sc.weights.map((w) => `${w.key}:${w.pct}%`).join(' + ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {showBlueprint && <EnterpriseArchitectureMasterBlueprint />}
      </div>

      {selectedScoreKey && data?.scores?.[selectedScoreKey] && (
        <ExecutiveScoreDrillDownModal
          scoreData={data.scores[selectedScoreKey]}
          snapshots={data.snapshots}
          onClose={() => setSelectedScoreKey(null)}
          onSaved={refreshScores}
        />
      )}
    </section>
  );
}