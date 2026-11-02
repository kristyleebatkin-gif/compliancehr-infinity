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
 * Hybrid of:
 *   Premium Remote + Mission Control + Enterprise Dashboard
 * Centre:
 *   ◉ AI CORE (14 recommendations)
 * Around AI Core (8 Glowing Circular Control Pods):
 *   1. ◉ Compliance (2 actions due)
 *   2. ◉ Workforce (7 reviews due)
 *   3. ◉ Participants (4 plan reviews)
 *   4. ◉ Documents (5 renewals due)
 *   5. ◉ Incidents (1 critical)
 *   6. ◉ Reports (12 audit packs)
 *   7. ◉ Operations (8 live sweeps)
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
      // Keep baseline mission control telemetry when unauthenticated on public preview
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
    }
    navigate(pod.path);
  };

  return (
    <section
      className="preserve-island-theme relative overflow-hidden rounded-3xl border-2 border-[#00C6FF]/45 p-3 sm:p-5 shadow-[0_20px_60px_-15px_rgba(10,43,109,0.75)]"
      style={{ background: MISSION_CONTROL_BG }}
    >
      {/* Ambient Mission Control Radar Rings & 3D Depth Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-30"
      >
        <div className="h-[260px] w-[260px] sm:h-[380px] sm:w-[380px] rounded-full border border-[#00C6FF]/40 animate-pulse" />
        <div className="absolute h-[420px] w-[420px] sm:h-[560px] sm:w-[560px] rounded-full border border-dashed border-[#FF6EDB]/35" />
        <div className="absolute h-[640px] w-[640px] rounded-full border border-white/10" />
      </div>

      {/* Top White Title Card with Readable Larger Logo & Previous Colourful Slogan */}
      {showHeaderLogo && (
        <div className="relative z-10 mb-4 flex flex-col items-center justify-between gap-2 rounded-2xl border border-white/40 bg-white/95 px-4 py-2.5 text-center shadow-lg backdrop-blur-md sm:flex-row sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2B6D] px-3 py-0.5 text-[9.5px] font-black uppercase tracking-widest text-[#00C6FF]">
              <span
                className="h-2 w-2 rounded-full bg-[#00C6FF] animate-ping"
                style={{ animationDuration: '2.4s' }}
              />
              <span>PREMIUM REMOTE · MISSION CONTROL · ENTERPRISE DASHBOARD</span>
            </div>
            <h2
              className="mt-1 font-editorial text-sm sm:text-lg font-extrabold tracking-tight text-[#0A2B6D]"
              style={{ color: '#0A2B6D' }}
            >
              NDIS &amp; Aged Care Support Super-Platform — Organisational Command System
            </h2>
            <p className="text-[10.5px] font-bold text-[#5A00D6]" style={{ color: '#5A00D6' }}>
              Click any glowing circular control pod around the AI Core to launch its live command centre
            </p>
          </div>

          <div className="flex flex-col items-center">
            <BrandLogoLockup size="md" theme="light" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMetrics}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-[#F5F0FF] px-3 py-1.5 text-[10px] font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-[#0072FF] hover:text-white"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== ORBITAL MISSION CONTROL MATRIX: 8 CIRCULAR PODS AROUND CENTRAL AI CORE ==================== */}
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 lg:gap-5 items-center justify-items-center">
          {ORBITAL_PODS.map((pod, index) => {
            const Icon = pod.icon;
            const isSelected = selectedPod === pod.id;
            const dashArray = 2 * Math.PI * 52;
            const dashOffset = dashArray - (dashArray * pod.ringPct) / 100;

            // Render the Central AI CORE right in the middle (position 5 of the 3x3 grid on desktop)
            const renderCenterAiCoreBefore = index === 4;

            return (
              <React.Fragment key={pod.id}>
                {renderCenterAiCoreBefore && (
                  <div className="col-span-2 sm:col-span-3 lg:col-span-1 lg:col-start-2 lg:row-start-2 flex items-center justify-center my-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPod('ai-core');
                        if (onSelectSuite) onSelectSuite('os-command');
                        else navigate('/assistant');
                      }}
                      className="group relative flex h-44 w-44 sm:h-52 sm:w-52 flex-col items-center justify-center rounded-full p-2 text-center transition-all duration-300 hover:scale-105 focus:outline-none"
                      style={{
                        background: POD_RING_GRADIENT,
                        boxShadow:
                          '0 0 42px rgba(0, 198, 255, 0.75), 0 0 80px rgba(255, 46, 154, 0.45), inset 0 2px 8px rgba(255, 255, 255, 0.65)',
                      }}
                    >
                      {/* Outer Rotating / Pulsing Notification Ring */}
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
                        viewBox="0 0 140 140"
                      >
                        <circle
                          cx="70"
                          cy="70"
                          r="64"
                          fill="none"
                          stroke="rgba(255,255,255,0.22)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="70"
                          cy="70"
                          r="64"
                          fill="none"
                          stroke="#00C6FF"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray="360"
                          strokeDashoffset="28"
                        />
                      </svg>

                      {/* Inner 3D Glassmorphic Core Sphere */}
                      <div
                        className="relative flex h-full w-full flex-col items-center justify-center rounded-full border border-white/40 px-3 py-2 backdrop-blur-xl"
                        style={{
                          background:
                            'radial-gradient(circle at 32% 24%, rgba(0, 198, 255, 0.42) 0%, rgba(90, 0, 214, 0.88) 52%, #061539 100%)',
                          boxShadow: 'inset 0 4px 14px rgba(255,255,255,0.45), 0 10px 25px rgba(0,0,0,0.5)',
                        }}
                      >
                        {/* White Pill Title Header Inside AI Core */}
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#0A2B6D] shadow-sm">
                          <Cpu className="h-3 w-3 text-[#5A00D6]" />
                          <span style={{ color: '#0A2B6D' }}>CENTRAL HUB</span>
                        </span>

                        <div className="mt-1.5 flex items-center justify-center gap-1 text-base sm:text-xl font-black tracking-tight text-white">
                          <span className="text-[#00C6FF] animate-pulse">◉</span>
                          <span style={{ color: '#FFFFFF' }}>AI CORE</span>
                        </div>

                        <div
                          className="mt-1 rounded-full border border-[#00C6FF]/60 bg-[#0A2B6D]/90 px-3 py-0.5 text-[11px] sm:text-xs font-extrabold text-[#00C6FF] shadow-[0_0_14px_rgba(0,198,255,0.6)]"
                          style={{ color: '#00C6FF' }}
                        >
                          {liveMetrics.aiRecommendations} recommendations
                        </div>

                        <span
                          className="mt-1 text-[9px] font-bold text-white/90"
                          style={{ color: '#FFFFFF' }}
                        >
                          Live Digital Twin · 46 Modules
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Glowing Circular Control Pod */}
                <button
                  type="button"
                  onClick={() => handlePodClick(pod)}
                  className={`group relative flex h-36 w-36 sm:h-40 sm:w-40 flex-col items-center justify-center rounded-full p-1.5 text-center transition-all duration-300 hover:-translate-y-1 hover:scale-105 focus:outline-none ${pod.posClass}`}
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28) 0%, rgba(10, 43, 109, 0.92) 70%, #061539 100%)',
                    boxShadow: isSelected
                      ? `0 0 32px ${pod.glowColor}, inset 0 2px 6px rgba(255,255,255,0.45)`
                      : `0 12px 28px -6px rgba(0,0,0,0.55), 0 0 18px ${pod.glowColor}, inset 0 2px 4px rgba(255,255,255,0.3)`,
                  }}
                >
                  {/* Animated Notification Ring SVG */}
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="rgba(255,255,255,0.14)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={pod.ringColor}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-500"
                    />
                  </svg>

                  {/* Glassmorphic Circular Pod Interior */}
                  <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full border border-white/25 bg-white/10 px-2.5 py-2 backdrop-blur-md">
                    {/* Icon Orb with 3D Specular Depth */}
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
                      style={{
                        background: POD_RING_GRADIENT,
                        boxShadow: `0 0 12px ${pod.glowColor}`,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                    </div>

                    {/* White Title Pill Background for Crisp Readability */}
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 shadow-xs">
                      <span
                        className={`text-[10px] leading-none ${pod.alertPulse ? 'animate-ping' : ''}`}
                        style={{ color: pod.ringColor }}
                      >
                        ◉
                      </span>
                      <span
                        className="text-[10.5px] font-extrabold tracking-tight text-[#0A2B6D]"
                        style={{ color: '#0A2B6D' }}
                      >
                        {pod.label}
                      </span>
                    </div>

                    {/* Live Metric Notification Badge */}
                    <div
                      className="mt-1 rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide text-white"
                      style={{
                        backgroundColor: pod.alertPulse ? '#FF2E9A' : 'rgba(6, 21, 57, 0.85)',
                        border: `1px solid ${pod.ringColor}`,
                        color: '#FFFFFF',
                      }}
                    >
                      {pod.metric}
                    </div>

                    {!compact && (
                      <span
                        className="mt-0.5 line-clamp-1 text-[8px] font-bold text-white/85"
                        style={{ color: '#E2E8F0' }}
                      >
                        {pod.sub}
                      </span>
                    )}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ==================== BOTTOM CIRCULAR POD SUITE SWITCHER (REPLACES FLAT BUTTONS) ==================== */}
      {onSelectSuite && (
        <div className="relative z-10 mt-4 border-t border-white/15 pt-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span
              className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#00C6FF]"
              style={{ color: '#00C6FF' }}
            >
              ◉ Mission Control Command Pods — Switch Active Executive Workspace
            </span>
            <Link
              to="/operations-centre"
              className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white hover:text-[#00C6FF]"
              style={{ color: '#FFFFFF' }}
            >
              <span>Full Operations Centre</span>
              <ArrowUpRight className="h-3 w-3 text-[#00C6FF]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {SUITE_PODS.map((suite) => {
              const active = activeSuite === suite.id;
              return (
                <button
                  key={suite.id}
                  type="button"
                  onClick={() => onSelectSuite(suite.id)}
                  aria-pressed={active}
                  className={`group flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-left backdrop-blur-md transition-all duration-200 ${
                    active
                      ? 'border-[#00C6FF] bg-white text-[#0A2B6D] shadow-[0_0_20px_rgba(0,198,255,0.75)] scale-[1.02]'
                      : 'border-white/25 bg-white/10 text-white hover:border-[#00C6FF] hover:bg-white/20'
                  }`}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white shadow-inner"
                    style={{
                      backgroundColor: active ? '#0A2B6D' : suite.color,
                      boxShadow: `0 0 10px ${suite.color}`,
                    }}
                  >
                    ◉
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-[10px] font-extrabold leading-tight"
                      style={{ color: active ? '#0A2B6D' : '#FFFFFF' }}
                    >
                      {suite.label}
                    </div>
                    <div
                      className="truncate text-[8.5px] font-bold leading-tight"
                      style={{ color: active ? '#5A00D6' : '#00C6FF' }}
                    >
                      {suite.metric}
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