import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, ShieldCheck, Users, AlertTriangle, Award,
  RefreshCw, Camera, Download, Sliders, Eye, Layers,
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
    downloadCsv(
      `executive-health-scores-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'title', label: 'Score Title' },
        { key: 'score', label: 'Score (%)' },
        { key: 'status', label: 'Status Band' },
        { key: 'evidenceCount', label: 'Evidence Count' },
        { key: 'calculatedAt', label: 'Calculated Timestamp' },
        { key: 'warning_threshold', label: 'Warning Threshold (%)' },
        { key: 'critical_threshold', label: 'Critical Threshold (%)' },
        { key: 'formula_description', label: 'Formula' },
      ],
      SCORE_ORDER.map(({ key }) => {
        const sc = data.scores[key];
        return {
          title: sc.title,
          score: sc.score !== null ? sc.score : 'Missing Data',
          status: sc.band?.status || 'Missing Data',
          evidenceCount: sc.evidenceCount ?? 0,
          calculatedAt: sc.calculatedAt || data.calculatedAt || '',
          warning_threshold: sc.warning_threshold,
          critical_threshold: sc.critical_threshold,
          formula_description: sc.formula_description || '',
        };
      })
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

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

  return (
    <section
      className="overflow-hidden rounded-2xl p-[3px] shadow-md"
      style={{ background: APP_BORDER_GRADIENT }}
    >
      <div
        className="rounded-[13px] p-3 space-y-3"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        {/* Header White Section Inside Dark Blue Surround */}
        <div
          className="rounded-2xl p-[2px] shadow-2xs"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white px-3.5 py-2.5 text-[#0A2B6D]">
            <div className="min-w-0">
              <div
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                }}
              >
                <Activity className="h-3 w-3 text-[#0072FF]" />
                <span style={{ color: '#0A2B6D' }}>Organisation Health &amp; 5-Score Executive Framework</span>
              </div>
              <h2 className="mt-1 font-editorial text-xs sm:text-sm font-extrabold text-[#0A2B6D] leading-tight" style={{ color: '#0A2B6D' }}>
                <span style={{ color: '#5A00D6' }}>◉</span> Executive Health Scorecards — Click Any Score to Inspect Formula, Weightings &amp; Trends
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                type="button"
                onClick={handleRecordSnapshot}
                disabled={recordingSnapshot || loading}
                className="min-h-7 h-7 rounded-full px-2.5 py-0.5 text-[#0A2B6D] font-extrabold text-[10px]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <Camera className="mr-1 h-3 w-3 text-[#0072FF]" />
                <span style={{ color: '#0A2B6D' }}>{recordingSnapshot ? 'Recording…' : 'Snapshot'}</span>
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={handleExportCsv}
                disabled={loading || !data}
                className="min-h-7 h-7 rounded-full px-2.5 py-0.5 text-[#0A2B6D] font-extrabold text-[10px]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <Download className="mr-1 h-3 w-3 text-[#5A00D6]" />
                <span style={{ color: '#0A2B6D' }}>CSV</span>
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() => setShowBlueprint((v) => !v)}
                className="min-h-7 h-7 rounded-full px-2.5 py-0.5 text-[#0A2B6D] font-extrabold text-[10px]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <Layers className="mr-1 h-3 w-3 text-[#FF2E9A]" />
                <span style={{ color: '#0A2B6D' }}>{showBlueprint ? 'Hide Blueprint' : 'Blueprint'}</span>
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={refreshScores}
                disabled={loading}
                className="min-h-7 h-7 rounded-full px-2.5 py-0.5 text-[#0A2B6D] font-extrabold text-[10px]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                  color: '#0A2B6D',
                }}
              >
                <RefreshCw className={`mr-1 h-3 w-3 text-[#0072FF] ${loading ? 'animate-spin' : ''}`} />
                <span style={{ color: '#0A2B6D' }}>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Body White Section Inside Dark Blue Surround */}
        <div
          className="rounded-2xl p-[2px] shadow-2xs"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="rounded-[14px] bg-white p-3 space-y-2.5">
        {/* 5 Interactive Executive Score Cards (50% Compact) */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {SCORE_ORDER.map(({ key, icon: Icon }) => {
            const sc = data?.scores?.[key];
            if (!sc) {
              return (
                <div
                  key={key}
                  className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-2"
                />
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedScoreKey(key)}
                className="group flex flex-col justify-between rounded-xl border border-[#0A2B6D] bg-white p-2 text-left shadow-2xs transition hover:border-[#5A00D6] focus:outline-none"
              >
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: sc.color }}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <Badge className={`${sc.band?.badgeClass} text-[8.5px] px-1.5 py-0`}>
                      {sc.band?.status}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      {sc.title}
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="font-editorial text-sm font-extrabold text-[#0A2B6D]">
                        {sc.score !== null ? `${sc.score}%` : 'Unassessed'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-600">
                        W&lt;{sc.warning_threshold}% · C&lt;{sc.critical_threshold}%
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: sc.score !== null ? `${sc.score}%` : '0%',
                        backgroundColor: sc.color,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-1.5 flex w-full items-center justify-between border-t border-slate-100 pt-1 text-[8.5px] font-extrabold text-[#0072FF]">
                  <span className="inline-flex items-center gap-0.5">
                    <Eye className="h-2.5 w-2.5" />
                    Formula &amp; Trends
                  </span>
                  <Sliders className="h-2.5 w-2.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparative Visualisation & Explainability Bar */}
        {data?.scores && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-[#F6F0FF]/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Executive Score Comparison vs Thresholds
                </span>
                <span className="text-[10.5px] font-bold text-[#5A00D6]">
                  {data.snapshots?.length || 0} saved snapshot(s)
                </span>
              </div>
              <div className="h-40 w-full rounded-lg bg-white p-2 border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9d5ff" />
                    <XAxis dataKey="name" fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 800 }} />
                    <YAxis domain={[0, 100]} fontSize={10} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="score" name="Live Score (%)" radius={[4, 4, 0, 0]} barSize={28}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Transparent Formula &amp; Weighting Reference
                </span>
                <span className="text-[10.5px] font-bold text-[#0072FF]">
                  Click any score card above to customise weightings or drill into records
                </span>
              </div>
              <div className="space-y-1.5">
                {SCORE_ORDER.map(({ key }) => {
                  const sc = data.scores[key];
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedScoreKey(key)}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-[#F6F0FF]/35 px-3 py-1.5 hover:border-[#0072FF]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold text-[#0A2B6D]">{sc.title}</span>
                        <span className="font-mono text-[10.5px] font-bold text-[#5A00D6]">
                          {sc.weights.map((w) => `${w.key}:${w.pct}%`).join(' + ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Collapsible 8-Prompt Blueprint & Master Audit */}
        {showBlueprint && <EnterpriseArchitectureMasterBlueprint />}
          </div>
        </div>
      </div>

      {/* Drill-Down Modal */}
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