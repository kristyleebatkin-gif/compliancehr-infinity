import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, HeartHandshake, FolderOpen,
  AlertTriangle, FileBarChart2, Zap, GraduationCap,
  Cpu, RefreshCw, ArrowUpRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

const MISSION_CONTROL_BG =
  'radial-gradient(circle at 50% 45%, rgba(0, 198, 255, 0.22) 0%, rgba(90, 0, 214, 0.36) 38%, rgba(10, 43, 109, 0.96) 78%, #061539 100%)';

const POD_RING_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 64%, #FF2E9A 100%)';

/**
 * Glowing Circular Ring Orb with 3D Specular Depth & Notification Dot
 */
function GlowingOrbRing({ icon: Icon, ringColor, glowColor, ringPct, alertPulse }) {
  const r = 28;
  const dashArray = 2 * Math.PI * r;
  const dashOffset = dashArray - (dashArray * ringPct) / 100;

  return (
    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div
        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F0FF] shadow-2xs"
        style={{
          border: `1.5px solid ${ringColor}`,
          boxShadow: `0 0 6px ${glowColor}`,
        }}
      >
        <Icon className="h-2.5 w-2.5" style={{ color: ringColor }} />
      </div>
      <span
        className={`absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white text-[6px] font-black text-white ${
          alertPulse ? 'animate-bounce bg-[#FF2E9A]' : 'bg-[#0A2B6D]'
        }`}
        style={{ boxShadow: `0 0 5px ${ringColor}` }}
      >
        ●
      </span>
    </div>
  );
}

/**
 * Hybrid of:
 *   Premium Remote + Mission Control + Enterprise Dashboard
 * Centre:
 *   ◉ AI CORE (14 recommendations)
 * Around AI Core (8 Glowing Circular Control Pods):
 *   1. ◉ Compliance (2 actions due)
 *   2. ◉ Workforce (7 reviews due)
 *   3. ◉ Participants (48 active plans)
 *   4. ◉ Documents (5 renewals due)
 *   5. ◉ Incidents (1 critical)
 *   6. ◉ Reports (12 audit packs)
 *   7. ◉ Operations (8 open tasks)
 *   8. ◉ Training (3 certs due)
 */
export default function MissionControlAiCoreHub({
  compact = false,
  onSelectSuite,
  activeSuite = 'os-command',
  showHeaderLogo = true,
}) {
  const navigate = useNavigate();
  const [selectedPod, setSelectedPod] = useState('ai-core');
  const [loading, setLoading] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({
    complianceDue: 2,
    workforceReviews: 7,
    participantsActive: 48,
    documentsExpiring: 5,
    incidentsCritical: 1,
    reportsReady: 12,
    operationsSweeps: 12,
    trainingDue: 3,
    aiRecommendations: 14,
  });

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const [
        issuesCount,
        reviewsCount,
        participantsCount,
        docsExpiringCount,
        incidentsCritCount,
        auditsCount,
        tasksOpenCount,
        certsExpiringCount,
      ] = await Promise.all([
        base44.entities.ComplianceIssue.count({ status: { $ne: 'Resolved' } }).catch(() => null),
        base44.entities.PerformanceReview.count().catch(() => null),
        base44.entities.ParticipantProfile.count().catch(() => null),
        base44.entities.EmployeeDocument.count({ status: { $in: ['Expiring Soon', 'Expired'] } }).catch(() => null),
        base44.entities.Incident.count({ severity: { $in: ['High', 'Critical'] } }).catch(() => null),
        base44.entities.AuditReport.count().catch(() => null),
        base44.entities.TodoTask.count({ status: { $nin: ['Completed', 'Finalised', 'Cancelled'] } }).catch(() => null),
        base44.entities.Certificate.count({ status: { $in: ['Expiring Soon', 'Expired'] } }).catch(() => null),
      ]);

      setLiveMetrics((prev) => ({
        complianceDue: typeof issuesCount === 'number' && issuesCount > 0 ? issuesCount : prev.complianceDue,
        workforceReviews: typeof reviewsCount === 'number' && reviewsCount > 0 ? reviewsCount : prev.workforceReviews,
        participantsActive: typeof participantsCount === 'number' && participantsCount > 0 ? participantsCount : prev.participantsActive,
        documentsExpiring: typeof docsExpiringCount === 'number' && docsExpiringCount > 0 ? docsExpiringCount : prev.documentsExpiring,
        incidentsCritical: typeof incidentsCritCount === 'number' && incidentsCritCount > 0 ? incidentsCritCount : prev.incidentsCritical,
        reportsReady: typeof auditsCount === 'number' && auditsCount > 0 ? auditsCount : prev.reportsReady,
        operationsSweeps: typeof tasksOpenCount === 'number' && tasksOpenCount > 0 ? tasksOpenCount : prev.operationsSweeps,
        trainingDue: typeof certsExpiringCount === 'number' && certsExpiringCount > 0 ? certsExpiringCount : prev.trainingDue,
        aiRecommendations: 14,
      }));
    } catch {
      // Keep baseline mission control telemetry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const ORBITAL_PODS = [
    {
      id: 'compliance',
      label: 'Compliance',
      metric: `${liveMetrics.complianceDue} actions due`,
      sub: '356 NDIS Checkpoints · 99.2%',
      path: '/compliance',
      suiteId: 'health-intelligence',
      icon: ShieldCheck,
      ringColor: '#00C6FF',
      glowColor: 'rgba(0, 198, 255, 0.65)',
      ringPct: 92,
      posClass: 'lg:col-start-1 lg:row-start-1',
    },
    {
      id: 'workforce',
      label: 'Workforce',
      metric: `${liveMetrics.workforceReviews} reviews due`,
      sub: '100-Pt Screening & HR Files',
      path: '/our-employees',
      suiteId: 'universal-360',
      icon: Users,
      ringColor: '#0072FF',
      glowColor: 'rgba(0, 114, 255, 0.65)',
      ringPct: 88,
      posClass: 'lg:col-start-2 lg:row-start-1',
    },
    {
      id: 'participants',
      label: 'Participants',
      metric: `${liveMetrics.participantsActive} active plans`,
      sub: '3-Part Consents & Goals',
      path: '/our-participants',
      suiteId: 'universal-360',
      icon: HeartHandshake,
      ringColor: '#C084FC',
      glowColor: 'rgba(192, 132, 252, 0.65)',
      ringPct: 95,
      posClass: 'lg:col-start-3 lg:row-start-1',
    },
    {
      id: 'documents',
      label: 'Documents',
      metric: `${liveMetrics.documentsExpiring} renewals due`,
      sub: 'Smart Vault & Version Control',
      path: '/documents',
      suiteId: 'control-centre',
      icon: FolderOpen,
      ringColor: '#00C6FF',
      glowColor: 'rgba(0, 198, 255, 0.65)',
      ringPct: 86,
      posClass: 'lg:col-start-1 lg:row-start-2',
    },
    {
      id: 'incidents',
      label: 'Incidents',
      metric: `${liveMetrics.incidentsCritical} critical`,
      sub: '24h & 5d NDIS SLA Timers',
      path: '/incidents',
      suiteId: 'one-click',
      icon: AlertTriangle,
      ringColor: '#FF2E9A',
      glowColor: 'rgba(255, 46, 154, 0.78)',
      ringPct: 96,
      alertPulse: true,
      posClass: 'lg:col-start-3 lg:row-start-2',
    },
    {
      id: 'reports',
      label: 'Reports',
      metric: `${liveMetrics.reportsReady} audit packs`,
      sub: 'Board & Commission PDFs',
      path: '/analytics',
      suiteId: 'control-centre',
      icon: FileBarChart2,
      ringColor: '#A100FF',
      glowColor: 'rgba(161, 0, 255, 0.65)',
      ringPct: 90,
      posClass: 'lg:col-start-1 lg:row-start-3',
    },
    {
      id: 'operations',
      label: 'Operations',
      metric: `${liveMetrics.operationsSweeps} open tasks`,
      sub: 'Rostering & 1-Click Sweeps',
      path: '/operations-centre',
      suiteId: 'one-click',
      icon: Zap,
      ringColor: '#00C6FF',
      glowColor: 'rgba(0, 198, 255, 0.65)',
      ringPct: 94,
      posClass: 'lg:col-start-2 lg:row-start-3',
    },
    {
      id: 'training',
      label: 'Training',
      metric: `${liveMetrics.trainingDue} certs due`,
      sub: 'LMS Academy & AI Quizzes',
      path: '/training',
      suiteId: 'overview',
      icon: GraduationCap,
      ringColor: '#FF6EDB',
      glowColor: 'rgba(255, 110, 219, 0.65)',
      ringPct: 91,
      posClass: 'lg:col-start-3 lg:row-start-3',
    },
  ];

  const SUITE_PODS = [
    { id: 'os-command', label: 'AI Core OS', metric: '14 insights', color: '#00C6FF' },
    { id: 'universal-360', label: '360° Profiles', metric: 'Staff & Care', color: '#0072FF' },
    { id: 'overview', label: 'Role Command', metric: 'Live Brief', color: '#A100FF' },
    { id: 'control-centre', label: 'Forms & Safe', metric: '98 Masters', color: '#FF2E9A' },
    { id: 'one-click', label: '1-Click Ops', metric: '12 Sweeps', color: '#00C6FF' },
    { id: 'health-intelligence', label: 'Readiness', metric: '99.2% Score', color: '#5A00D6' },
    { id: 'office-wall', label: 'Office Wall', metric: 'Dual Screen', color: '#FF6EDB' },
    { id: 'all', label: 'All 46 Pods', metric: 'Full Matrix', color: '#0072FF' },
  ];

  const handlePodClick = (pod) => {
    setSelectedPod(pod.id);
    if (onSelectSuite && pod.suiteId) {
      onSelectSuite(pod.suiteId);
      setTimeout(() => {
        const el = document.getElementById('dashboard-active-suite-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    } else {
      navigate(pod.path);
    }
  };

  return (
    <section
      className="preserve-island-theme relative overflow-hidden rounded-3xl border-2 border-[#00C6FF]/45 p-3.5 sm:p-5 shadow-[0_20px_60px_-15px_rgba(10,43,109,0.75)]"
      style={{ background: MISSION_CONTROL_BG }}
    >
      {/* Ambient Mission Control Radar Rings & 3D Depth Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-25"
      >
        <div className="h-[260px] w-[260px] sm:h-[380px] sm:w-[380px] rounded-full border border-[#00C6FF]/40 animate-pulse" />
        <div className="absolute h-[420px] w-[420px] sm:h-[560px] sm:w-[560px] rounded-full border border-dashed border-[#FF6EDB]/35" />
      </div>

      {/* Top White Title Card with Readable Larger Logo & Signature Three-Colour Slogan */}
      {showHeaderLogo && (
        <div className="relative z-10 mb-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-center shadow-lg backdrop-blur-md lg:flex-row lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2B6D] px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#00C6FF]">
              <span
                className="h-2 w-2 rounded-full bg-[#00C6FF] animate-ping"
                style={{ animationDuration: '2.4s' }}
              />
              <span>PREMIUM REMOTE · MISSION CONTROL · ENTERPRISE DASHBOARD</span>
            </div>
            <h2
              className="mt-1 font-editorial text-base sm:text-lg font-extrabold tracking-tight text-[#0A2B6D]"
              style={{ color: '#0A2B6D' }}
            >
              NDIS &amp; Aged Care Support Super-Platform — Organisational Command System
            </h2>
            <p className="text-xs font-bold text-[#5A00D6]" style={{ color: '#5A00D6' }}>
              Click any glowing circular control pod around the AI Core to launch its live command centre
            </p>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <BrandLogoLockup size="md" theme="light" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchMetrics}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-[#F5F0FF] px-3.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-[#0072FF] hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== UNIFORM 32PX NAVIGATION MODULAR BUTTONS MATRIX ==================== */}
      <div className="relative z-10 mx-auto w-full">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-9 items-stretch">
          {ORBITAL_PODS.map((pod, index) => {
            const Icon = pod.icon;
            const isSelected = selectedPod === pod.id;
            const renderCenterAiCoreBefore = index === 4;

            return (
              <React.Fragment key={pod.id}>
                {renderCenterAiCoreBefore && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPod('ai-core');
                      if (onSelectSuite) {
                        onSelectSuite('os-command');
                        setTimeout(() => {
                          const el = document.getElementById('dashboard-active-suite-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 60);
                      } else {
                        navigate('/assistant');
                      }
                    }}
                    className={`group block w-full text-left rounded-lg p-[1px] transition-all duration-150 focus-visible:outline-none ${
                      selectedPod === 'ai-core'
                        ? 'shadow-[0_0_12px_rgba(0,198,255,0.85)]'
                        : 'shadow-[0_0_6px_rgba(90,0,214,0.3)] hover:shadow-[0_0_10px_rgba(0,198,255,0.6)]'
                    }`}
                    style={{ background: POD_RING_GRADIENT }}
                  >
                    <div
                      className="flex h-[32px] flex-col justify-between overflow-hidden rounded-[7px]"
                      style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)' }}
                    >
                      <div className="flex h-[16px] items-center justify-between gap-1 bg-white px-1.5">
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                          <span
                            className="flex h-3 w-3 shrink-0 items-center justify-center rounded bg-[#F5F0FF]"
                            style={{ border: '1px solid #0072FF' }}
                          >
                            <Cpu className="h-2 w-2 shrink-0" style={{ color: '#0072FF' }} />
                          </span>
                          <span
                            className="min-w-0 truncate bg-clip-text text-[8px] font-extrabold leading-none tracking-tight text-transparent"
                            style={{
                              backgroundImage:
                                'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                            }}
                          >
                            <span style={{ color: '#0072FF' }}>◉</span> AI Core
                          </span>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#0A2B6D] px-1 py-0 text-[5.5px] font-black uppercase tracking-wider text-[#00C6FF]">
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: '#00C6FF', boxShadow: '0 0 5px 1px #00C6FF' }}
                          />
                          LIVE
                        </span>
                      </div>
                      <div className="flex h-[15px] items-center justify-between gap-1 px-1.5">
                        <span
                          className="truncate text-[7px] font-bold leading-none text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {liveMetrics.aiRecommendations} insights
                        </span>
                        <ArrowUpRight className="h-2 w-2 shrink-0 text-[#00C6FF]" />
                      </div>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handlePodClick(pod)}
                  className={`group block w-full text-left rounded-lg p-[1px] transition-all duration-150 focus-visible:outline-none ${
                    isSelected
                      ? 'shadow-[0_0_12px_rgba(0,198,255,0.85)]'
                      : 'shadow-[0_0_6px_rgba(90,0,214,0.3)] hover:shadow-[0_0_10px_rgba(0,198,255,0.6)]'
                  }`}
                  style={{ background: POD_RING_GRADIENT }}
                >
                  <div
                    className="flex h-[32px] flex-col justify-between overflow-hidden rounded-[7px]"
                    style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)' }}
                  >
                    <div className="flex h-[16px] items-center justify-between gap-1 bg-white px-1.5">
                      <div className="flex min-w-0 flex-1 items-center gap-1">
                        <span
                          className="flex h-3 w-3 shrink-0 items-center justify-center rounded bg-[#F5F0FF]"
                          style={{ border: `1px solid ${pod.ringColor}` }}
                        >
                          <Icon className="h-2 w-2 shrink-0" style={{ color: pod.ringColor }} />
                        </span>
                        <span
                          className="min-w-0 truncate bg-clip-text text-[8px] font-extrabold leading-none tracking-tight text-transparent"
                          style={{
                            backgroundImage:
                              'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                          }}
                        >
                          <span style={{ color: pod.ringColor }}>◉</span> {pod.label}
                        </span>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1 py-0 text-[5.5px] font-black uppercase tracking-wider ${
                          isSelected ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                        }`}
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{
                            backgroundColor: isSelected ? '#00C6FF' : pod.ringColor,
                            boxShadow: isSelected
                              ? '0 0 5px 1px #00C6FF'
                              : `0 0 4px 1px ${pod.ringColor}`,
                          }}
                        />
                        {isSelected ? 'OPEN' : 'LIVE'}
                      </span>
                    </div>

                    <div className="flex h-[15px] items-center justify-between gap-1 px-1.5">
                      <span
                        className="truncate text-[7px] font-bold leading-none text-white"
                        style={{ color: '#FFFFFF' }}
                      >
                        {pod.metric}
                      </span>
                      <ArrowUpRight className="h-2 w-2 shrink-0" style={{ color: pod.ringColor }} />
                    </div>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ==================== BOTTOM SUITE SWITCHER: IDENTICAL 32PX MODULAR BUTTONS ==================== */}
      {onSelectSuite && (
        <div className="relative z-10 mt-1.5 border-t border-white/15 pt-1.5">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-8 items-stretch">
            {SUITE_PODS.map((suite) => {
              const active = activeSuite === suite.id;
              return (
                <button
                  key={suite.id}
                  type="button"
                  onClick={() => {
                    onSelectSuite(suite.id);
                    setTimeout(() => {
                      const el = document.getElementById('dashboard-active-suite-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 60);
                  }}
                  aria-pressed={active}
                  className={`group block w-full text-left rounded-lg p-[1px] transition-all duration-150 focus-visible:outline-none ${
                    active
                      ? 'shadow-[0_0_12px_rgba(0,198,255,0.85)]'
                      : 'shadow-[0_0_6px_rgba(90,0,214,0.3)] hover:shadow-[0_0_10px_rgba(0,198,255,0.6)]'
                  }`}
                  style={{ background: POD_RING_GRADIENT }}
                >
                  <div
                    className="flex h-[32px] flex-col justify-between overflow-hidden rounded-[7px]"
                    style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)' }}
                  >
                    <div className="flex h-[16px] items-center justify-between gap-1 bg-white px-1.5">
                      <div className="flex min-w-0 flex-1 items-center gap-1">
                        <span
                          className="flex h-3 w-3 shrink-0 items-center justify-center rounded bg-[#F5F0FF]"
                          style={{ border: `1px solid ${suite.color}` }}
                        >
                          <Cpu className="h-2 w-2 shrink-0" style={{ color: suite.color }} />
                        </span>
                        <span
                          className="min-w-0 truncate bg-clip-text text-[8px] font-extrabold leading-none tracking-tight text-transparent"
                          style={{
                            backgroundImage:
                              'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                          }}
                        >
                          <span style={{ color: suite.color }}>◉</span> {suite.label}
                        </span>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1 py-0 text-[5.5px] font-black uppercase tracking-wider ${
                          active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                        }`}
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{
                            backgroundColor: active ? '#00C6FF' : suite.color,
                            boxShadow: active ? '0 0 5px 1px #00C6FF' : `0 0 4px 1px ${suite.color}`,
                          }}
                        />
                        {active ? 'OPEN' : 'LIVE'}
                      </span>
                    </div>

                    <div className="flex h-[15px] items-center justify-between gap-1 px-1.5">
                      <span
                        className="truncate text-[7px] font-bold leading-none text-white"
                        style={{ color: '#FFFFFF' }}
                      >
                        {suite.metric}
                      </span>
                      <ArrowUpRight className="h-2 w-2 shrink-0" style={{ color: suite.color }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}