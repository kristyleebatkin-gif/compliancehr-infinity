import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Calculator, Sliders, FileText, TrendingUp, History,
  ArrowUpRight, Save,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function ExecutiveScoreDrillDownModal({
  scoreData,
  snapshots = [],
  onClose,
  onSaved,
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('formula');
  const [warningThreshold, setWarningThreshold] = useState(scoreData?.warning_threshold ?? 80);
  const [criticalThreshold, setCriticalThreshold] = useState(scoreData?.critical_threshold ?? 65);
  const [weights, setWeights] = useState(scoreData?.weights || []);
  const [changeReason, setChangeReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    if (!scoreData) return;
    setWarningThreshold(scoreData.warning_threshold ?? 80);
    setCriticalThreshold(scoreData.critical_threshold ?? 65);
    setWeights(scoreData.weights || []);
    setChangeReason('');
  }, [scoreData]);

  useEffect(() => {
    if (!scoreData?.score_key) return;
    base44.entities.AuditLog.filter(
      { entity_type: 'ExecutiveScoreConfig', record_id: scoreData.score_key },
      { sort: '-created_date', limit: 10 }
    )
      .then((res) => setAuditLogs(Array.isArray(res) ? res : res?.items || []))
      .catch(() => setAuditLogs([]));
  }, [scoreData?.score_key]);

  if (!scoreData) return null;

  const totalWeight = weights.reduce((acc, w) => acc + (Number(w.pct) || 0), 0);

  const handleWeightChange = (idx, value) => {
    const next = [...weights];
    next[idx] = { ...next[idx], pct: Math.max(0, Math.min(100, Number(value) || 0)) };
    setWeights(next);
  };

  const handleSaveConfig = async () => {
    if (totalWeight !== 100) {
      toast({
        title: 'Weights must total 100%',
        description: `Current total is ${totalWeight}%. Adjust component weightings so they sum to 100%.`,
        variant: 'destructive',
      });
      return;
    }
    if (Number(criticalThreshold) >= Number(warningThreshold)) {
      toast({
        title: 'Invalid threshold order',
        description: 'Critical threshold must be lower than Warning threshold.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const actor = user?.email || user?.full_name || 'Administrator';
      const payload = {
        score_key: scoreData.score_key,
        title: scoreData.title,
        warning_threshold: Number(warningThreshold),
        critical_threshold: Number(criticalThreshold),
        weights_json: JSON.stringify(weights),
        formula_description: scoreData.formula_description,
        updated_by_email: actor,
        change_reason: changeReason || 'Updated executive score weightings and thresholds',
      };

      if (scoreData.configRecordId) {
        await base44.entities.ExecutiveScoreConfig.update(scoreData.configRecordId, payload);
      } else {
        await base44.entities.ExecutiveScoreConfig.create(payload);
      }

      await base44.entities.AuditLog.create({
        action: 'Executive Score Configuration Updated',
        entity_type: 'ExecutiveScoreConfig',
        record_id: scoreData.score_key,
        record_title: scoreData.title,
        performed_by: actor,
        details: `Warning=${warningThreshold}%, Critical=${criticalThreshold}%, Weights=${weights
          .map((w) => `${w.key}:${w.pct}%`)
          .join(', ')}. Reason: ${payload.change_reason}`,
      });

      toast({
        title: 'Configuration saved & audited',
        description: `${scoreData.title} weightings and thresholds updated.`,
      });
      if (onSaved) await onSaved();
    } catch (err) {
      toast({
        title: 'Could not save configuration',
        description: err?.message || 'Check your permissions and try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const snapshotFieldMap = {
    organisation_health: 'organisation_health_score',
    compliance: 'compliance_score',
    workforce: 'workforce_score',
    risk: 'risk_score',
    quality: 'quality_score',
  };
  const metricKey = snapshotFieldMap[scoreData.score_key] || 'organisation_health_score';
  const trendSeries = snapshots.map((s) => ({
    date: s.snapshot_date,
    score: s[metricKey] ?? 0,
    recorded_by: s.recorded_by || 'System',
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-drilldown-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6 overflow-y-auto"
    >
      <div className="w-full max-w-4xl rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-white"
          style={{
            background:
              'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 56%, #FF2E9A 100%)',
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Executive Score Drill-Down · Transparent &amp; Auditable
              </span>
              <Badge className={scoreData.band?.badgeClass}>
                {scoreData.band?.status}
              </Badge>
            </div>
            <h3 id="score-drilldown-title" className="mt-1 font-editorial text-xl font-extrabold text-white">
              {scoreData.title} — {scoreData.score !== null ? `${scoreData.score}%` : 'Unassessed'}
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClose}
            className="border-white/50 bg-white/15 text-white hover:bg-white/25 font-extrabold"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>

        {/* Drill-Down Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-[#F6F0FF] px-5 py-2.5">
          {[
            { id: 'formula', label: '1. Formula & Weightings', icon: Calculator },
            { id: 'records', label: '2. Contributing Records & Modules', icon: FileText },
            { id: 'trends', label: '3. Trends & Historical Snapshots', icon: TrendingUp },
            { id: 'config', label: '4. Configure Weights & Thresholds', icon: Sliders },
            { id: 'audit', label: '5. Audit Trail', icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-[#0A2B6D] text-white shadow-2xs'
                    : 'border border-[#C084FC]/60 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          {activeTab === 'formula' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F6F0FF]/70 p-4 space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  Mathematical Calculation Formula
                </div>
                <code className="block rounded-lg border border-[#C084FC] bg-white p-3 font-mono text-xs font-bold text-[#0A2B6D]">
                  {scoreData.formula_description}
                </code>
                <div className="flex flex-wrap gap-3 text-xs font-bold text-[#0A2B6D]">
                  <span>
                    Healthy Target: <strong>≥ {scoreData.warning_threshold}%</strong>
                  </span>
                  <span>
                    Warning Threshold: <strong>&lt; {scoreData.warning_threshold}%</strong>
                  </span>
                  <span>
                    Critical Threshold: <strong>&lt; {scoreData.critical_threshold}%</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Weighted Component Breakdown (Live Evidence Calculation)
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {scoreData.breakdown.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#0A2B6D]">{item.label}</span>
                        <Badge className="bg-[#5A00D6] text-white text-[10px]">
                          Weight: {item.pct}%
                        </Badge>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-editorial text-lg font-extrabold text-[#0072FF]">
                          {item.rate !== null ? `${item.rate}%` : 'No data'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">
                          Weighted pts: {item.contribution !== null ? `+${item.contribution}` : '—'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#0A2B6D]/85">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Contributing Modules &amp; Entities
                </div>
                <div className="flex flex-wrap gap-2">
                  {scoreData.contributingModules.map((m) => (
                    <Link
                      key={m.name}
                      to={m.route}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#0A2B6D]/25 bg-[#F6F0FF] px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] hover:border-[#0072FF]"
                    >
                      <span>{m.name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#0072FF]" />
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scoreData.contributingEntities.map((ent) => (
                    <span
                      key={ent}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold text-[#5A00D6]"
                    >
                      Entity: {ent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Recent Contributing Source Records
                </div>
                {scoreData.contributingRecords.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                    No records currently stored in the contributing entities for this score. Add records in the linked modules above to populate live calculations.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                    {scoreData.contributingRecords.map((rec) => (
                      <div
                        key={`${rec.entityType}-${rec.id}`}
                        className="flex flex-wrap items-center justify-between gap-2 p-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-[#F6F0FF] px-2 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                              {rec.entityType}
                            </span>
                            <span className="text-xs font-extrabold text-[#0A2B6D]">{rec.title}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-600">
                            Status: <strong>{rec.status}</strong> · Owner: {rec.owner} · Date: {rec.date || '—'}
                          </div>
                        </div>
                        <Link
                          to={rec.route}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0A2B6D] px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-[#0072FF]"
                        >
                          <span style={{ color: '#FFFFFF' }}>Inspect</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Historical Score Trajectory ({scoreData.title})
              </div>
              {trendSeries.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                  No historical snapshots recorded yet. Click <strong>Record Score Snapshot</strong> on the main Organisation Health bar to capture baseline and periodic history.
                </div>
              ) : (
                <>
                  <div className="h-52 w-full rounded-xl border border-slate-200 bg-white p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                        <XAxis dataKey="date" fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                        <YAxis domain={[0, 100]} fontSize={11} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          name={scoreData.title}
                          stroke="#5A00D6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#0072FF' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                    {snapshots
                      .slice()
                      .reverse()
                      .map((snap) => (
                        <div key={snap.id} className="flex items-center justify-between p-2.5 text-xs">
                          <div>
                            <span className="font-extrabold text-[#0A2B6D]">{snap.snapshot_date}</span>
                            <span className="ml-2 text-slate-600">
                              Recorded by {snap.recorded_by || 'System'}
                            </span>
                          </div>
                          <Badge className="bg-[#0A2B6D] text-white">
                            {snap[metricKey] ?? '—'}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                  <label className="text-xs font-extrabold text-[#0A2B6D]">
                    Warning Threshold (%)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-600">
                    Scores below this value trigger Warning status.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                  <label className="text-xs font-extrabold text-[#0A2B6D]">
                    Critical Threshold (%)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={98}
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-600">
                    Scores below this value trigger Critical escalation status.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Component Weightings (Must Equal 100%)
                  </span>
                  <Badge
                    className={
                      totalWeight === 100
                        ? 'bg-[#0072FF] text-white'
                        : 'bg-[#FF2E9A] text-white'
                    }
                  >
                    Total: {totalWeight}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  {weights.map((w, idx) => (
                    <div key={w.key} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                      <span className="sm:col-span-8 text-xs font-bold text-[#0A2B6D]">
                        {w.label}
                      </span>
                      <div className="sm:col-span-4 flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={w.pct}
                          onChange={(e) => handleWeightChange(idx, e.target.value)}
                        />
                        <span className="text-xs font-extrabold text-[#5A00D6]">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-extrabold text-[#0A2B6D]">
                    Audit Reason for Change
                  </label>
                  <Input
                    placeholder="e.g., Adjusted weighting for annual NDIS mid-term audit focus"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveConfig}
                    className="bg-[#5A00D6] text-white hover:bg-[#0072FF] font-extrabold"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? 'Saving…' : 'Save & Audit Configuration'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Configuration &amp; Formula Audit Trail
              </div>
              {auditLogs.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                  Using default platform specification. Any threshold or weighting modification saved in tab 4 is logged here with user and timestamp.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#0A2B6D]">{log.action}</span>
                        <span className="text-slate-500">
                          {(log.created_date || '').replace('T', ' ').slice(0, 16)}
                        </span>
                      </div>
                      <p className="text-xs text-[#0A2B6D]/90">{log.details}</p>
                      <div className="text-[11px] font-bold text-[#5A00D6]">
                        By: {log.performed_by}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}