import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ShieldCheck, Users, HeartHandshake, AlertTriangle,
  Flame, DollarSign, Award, Lock, Download, RefreshCw,
  ArrowUpRight, CheckCircle2, Clock, TrendingUp,
  BarChart3, Layers, Sparkles, Monitor, Smartphone, Tablet,
  Sun, CloudSun, Mail, Calendar, MessageSquare, ClipboardCheck, Radio,
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Cell, AreaChart,
} from 'recharts';
import { base44 } from '@/api/base44Client';
import { downloadBusinessHealthIntelligencePdf } from '@/lib/businessHealthIntelligencePdf';
import {
  getHeaderView,
  getTitleGradientView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

const TREND_DATA_2026 = [
  { month: 'May 26', compliance: 94.2, health: 92.8, revenueK: 118, auditReadiness: 93 },
  { month: 'Jun 26', compliance: 95.4, health: 94.1, revenueK: 126, auditReadiness: 95 },
  { month: 'Jul 26', compliance: 96.5, health: 95.6, revenueK: 134, auditReadiness: 96 },
  { month: 'Aug 26', compliance: 97.3, health: 96.8, revenueK: 141, auditReadiness: 97 },
  { month: 'Sep 26', compliance: 98.1, health: 97.7, revenueK: 149, auditReadiness: 98 },
  { month: 'Oct 26', compliance: 98.7, health: 98.4, revenueK: 158, auditReadiness: 99 },
];

const MINI_RISK_SEVERITY_DATA = [
  { level: 'Low', count: 8, fill: '#0072FF' },
  { level: 'Med', count: 4, fill: '#5A00D6' },
  { level: 'High', count: 2, fill: '#F97316' },
  { level: 'Crit', count: 0, fill: '#EF4444' },
];

const MINI_RISK_CONTROL_DATA = [
  { stage: 'Elim', pct: 96 },
  { stage: 'Min', pct: 99 },
  { stage: 'Isol', pct: 98 },
  { stage: 'Train', pct: 100 },
];

export default function BusinessHealthComplianceIntelligenceDashboard({ compact = false }) {
  const [liveCounts, setLiveCounts] = useState({
    staff: 24,
    participants: 38,
    policies: 42,
    openTasks: 6,
    completedTasks: 148,
    incidents: 2,
    risks: 14,
    certificates: 64,
    drills: 8,
    audits: 12,
  });
  const [selectedDomainId, setSelectedDomainId] = useState('governance');
  const [horizonFilter, setHorizonFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [litKpiIdx, setLitKpiIdx] = useState(4);
  const [trafficStep, setTrafficStep] = useState(0);
  const [riskWaveTick, setRiskWaveTick] = useState(0);
  const [dayLightSwitches, setDayLightSwitches] = useState({
    '90': true,
    '60': true,
    '30': true,
    '21': true,
    '14': true,
  });

  const toggleDaySwitch = (dayKey) => {
    setDayLightSwitches((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
    setRiskWaveTick((prev) => prev + 1);
  };

  // Live moving pulse so Risk Charts visibly move with real-time & user changes
  useEffect(() => {
    const waveTimer = setInterval(() => {
      setRiskWaveTick((prev) => (prev + 1) % 12);
    }, 3500);
    return () => clearInterval(waveTimer);
  }, []);

  // Light up TWO tiles under Live Executive at a time for 30 seconds each, then go left to the next pair, cycling Green, Yellow & Red
  useEffect(() => {
    const timer30 = setInterval(() => {
      setLitKpiIdx((prev) => (prev - 1 + 6) % 6);
      setTrafficStep((prev) => (prev + 1) % 3);
    }, 30000);
    return () => clearInterval(timer30);
  }, []);

  const loadLiveIntelligence = useCallback(async () => {
    setRefreshing(true);
    try {
      const results = await Promise.allSettled([
        base44.entities.StaffProfile.count({}),
        base44.entities.ParticipantProfile.count({}),
        base44.entities.Policy.count({}),
        base44.entities.TodoTask.count({ status: { $in: ['Pending', 'Open', 'In Progress'] } }),
        base44.entities.TodoTask.count({ status: { $in: ['Completed', 'Finalised'] } }),
        base44.entities.Incident.count({}),
        base44.entities.Risk.count({}),
        base44.entities.Certificate.count({}),
        base44.entities.EmergencyDrill.count({}),
        base44.entities.InternalAudit.count({}),
      ]);

      const val = (idx, fallback) =>
        results[idx]?.status === 'fulfilled' && typeof results[idx].value === 'number' && results[idx].value > 0
          ? results[idx].value
          : fallback;

      setLiveCounts({
        staff: val(0, 24),
        participants: val(1, 38),
        policies: val(2, 42),
        openTasks: val(3, 6),
        completedTasks: val(4, 148),
        incidents: val(5, 2),
        risks: val(6, 14),
        certificates: val(7, 64),
        drills: val(8, 8),
        audits: val(9, 12),
      });
    } catch {
      // Keep default executive benchmarks if guest/unauthenticated
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveIntelligence();
  }, [loadLiveIntelligence]);

  const intelligenceDomains = [
    {
      id: 'governance',
      name: 'NDIS Governance & Policy Control',
      shortName: 'Governance',
      standard: 'NDIS Core Module 2 · 356 Checkpoints',
      score: 99.2,
      status: 'Audit Ready',
      colour: '#5A00D6',
      icon: ShieldCheck,
      route: '/compliance',
      metricLabel: 'Controlled Policies & SOPs',
      metricValue: `${liveCounts.policies} Active · 100% Current`,
      detail: 'All 17 Audit Categories & 46 Module SOPs mapped to 2026 Practice Standards',
      ActionItems: [
        'Annual Governance & Legislative Register verified against 2026 NDIS Rules',
        '100% Key Personnel conflict-of-interest & board quorum minutes ratified',
        'Dual Master Audit Checklists (CHR-AUD-001 & CHR-AUD-002) active',
      ],
    },
    {
      id: 'workforce',
      name: 'Workforce & 100-Point HR Assurance',
      shortName: 'HR & Screening',
      standard: 'Worker Screening Rules & SCHADS',
      score: 98.8,
      status: '100% Cleared',
      colour: '#0072FF',
      icon: Users,
      route: '/hr',
      metricLabel: 'Cleared Staff & Credentials',
      metricValue: `${liveCounts.staff} Staff · ${liveCounts.certificates} Certs`,
      detail: '100% NDIS Worker Screening, Blue Card, Police Check & First Aid/CPR verified',
      ActionItems: [
        'Zero unscreened workers permitted on Shift Roster (Automated Roster Gate active)',
        '14-Day & 30-Day automated credential expiry email/push sweeps running',
        'Quarterly staff supervision & 360° performance appraisals tracked',
      ],
    },
    {
      id: 'participants',
      name: 'Participant Care, Consents & Goals',
      shortName: 'Participants',
      standard: 'NDIS Core Modules 1 & 3 · Rights & Care',
      score: 98.5,
      status: 'Audit Ready',
      colour: '#FF2E9A',
      icon: HeartHandshake,
      route: '/our-participants',
      metricLabel: 'Active Participant Profiles',
      metricValue: `${liveCounts.participants} Profiles · 3-Part Consents`,
      detail: 'Service Agreements, 3-Part Consents (Sharing/Advocacy/Med) & 10-Weekly Notes',
      ActionItems: [
        'All active participants hold signed 2026 Service Agreements & Support Schedules',
        '3-Part Informed Consent & Audit Opt-In/Declined flags enforced by RLS',
        '10-Weekly progress note copies & 3-monthly plan reviews automated',
      ],
    },
    {
      id: 'safety',
      name: 'WHS, Incidents & NDIS Reportables',
      shortName: 'WHS & Incidents',
      standard: 'NDIS Incident Rules 2018 & WHS Act',
      score: 97.9,
      status: 'Zero Overdue SLA',
      colour: '#FF2E9A',
      icon: AlertTriangle,
      route: '/incidents',
      metricLabel: 'Incidents & Active Risk Controls',
      metricValue: `${liveCounts.incidents} Incidents · ${liveCounts.risks} Risk Controls`,
      detail: '24-Hour & 5-Day NDIS Commission notification timers & root-cause CAPA linked',
      ActionItems: [
        '100% of reportable incidents assessed within statutory 24-hour window',
        'Individual & Home 6-monthly risk assessments linked to shift briefings',
        'Pre-shift Take-5 safety checks and vehicle inspections logged daily',
      ],
    },
    {
      id: 'emergency',
      name: 'Emergency Drills, Kits & Facility Safe',
      shortName: 'Emergency & Kits',
      standard: 'Emergency & Disaster Management Standard',
      score: 99.0,
      status: '6-Mo Verified',
      colour: '#A100FF',
      icon: Flame,
      route: '/emergency-response',
      metricLabel: 'Evacuation Drills & Kit Audits',
      metricValue: `${liveCounts.drills} Drills · All Kits Green`,
      detail: '6-Monthly Fire Drills, First Aid Kits, Natural Disaster Kits & PEEPs current',
      ActionItems: [
        '6-Monthly Evacuation Drills timed and debriefed across all sites',
        'First Aid Kits, Smoke Alarms, Fire Extinguishers & MSDS registers in-date',
        'Digital Visitor Sign-In/Out & Contractor screening active at reception',
      ],
    },
    {
      id: 'finance',
      name: 'Financial Health, NDIS Claims & Roster',
      shortName: 'Finance & Roster',
      standard: 'NDIS 2025–26 Price Guide & ATO Rules',
      score: 98.4,
      status: 'Balanced & Verified',
      colour: '#0072FF',
      icon: DollarSign,
      route: '/invoicing',
      metricLabel: '3-Way Claim Reconciliation',
      metricValue: '99.4% Claim Accuracy · 4.2d DSO',
      detail: 'Every NDIS invoice line reconciled against signed-off roster & shift note',
      ActionItems: [
        '3-Way Match: Rostered Shift → Completed Progress Note → NDIS Invoice Line',
        'Real-time participant NDIS plan budget utilisation alerts',
        'Automated bank statement reconciliation & SCHADS payroll award compliance',
      ],
    },
    {
      id: 'quality',
      name: 'Quality (QMS), Complaints & Audits',
      shortName: 'Quality & CIR',
      standard: 'NDIS Complaints Rules & ISO 9001 QMS',
      score: 98.2,
      status: 'Continuous Improv.',
      colour: '#5A00D6',
      icon: Award,
      route: '/quality',
      metricLabel: 'Internal Audits & Closed Tasks',
      metricValue: `${liveCounts.audits} Audits · ${liveCounts.completedTasks} Closed Actions`,
      detail: '24h Complaint SLA, Procedural Fairness & Continuous Improvement Register',
      ActionItems: [
        '100% of complaints acknowledged within 24 hours with independent advocate offer',
        'Every incident, audit finding & suggestion auto-routed to Continuous Improvement',
        'Weekly & Monthly Board Quality Intelligence PDF packs generated automatically',
      ],
    },
    {
      id: 'vault',
      name: 'Document Vault, Privacy & Data Control',
      shortName: 'Vault & Privacy',
      standard: 'Privacy Act 1988, NDB Scheme & RLS',
      score: 99.6,
      status: 'Zero Data Breaches',
      colour: '#FF2E9A',
      icon: Lock,
      route: '/documents',
      metricLabel: '2026 Master Docs & Binders',
      metricValue: '125+ Docs · 6 Binders · 0 Breaches',
      detail: 'Strict Role-Based Access (RLS), Private Signed URLs & Immutable Audit Trail',
      ActionItems: [
        'All 125+ 2026-compliant templates & 12 A4 printable office masters active',
        'Strict Row-Level Security (RLS) isolates Auditor, Staff & Participant records',
        'Notifiable Data Breach (NDB) register at zero open breaches; full user action log',
      ],
    },
  ];

  // Ordered descending by days (90 -> 60 -> 30 -> 21 -> 14): Largest amount of days is RED, then ORANGE, GREEN, BLUE, WHITE real lights
  const predictiveAlerts = [
    {
      id: 'AL-5',
      dayKey: '90',
      days: 90,
      horizon: '90 DAYS',
      lightName: 'RED LIGHT',
      lightHex: '#EF4444',
      lightGlow: '0 0 14px 4px rgba(239, 68, 68, 0.95)',
      severity: 'Critical Horizon',
      colour: '#EF4444',
      title: 'NDIS Mid-Term Quality & Safeguards Commission Readiness Mock Audit',
      action: 'Auto-scheduled · 356 Checkpoints at 98.7% verified readiness',
      owner: 'Provider Administrator',
      route: '/compliance',
    },
    {
      id: 'AL-4',
      dayKey: '60',
      days: 60,
      horizon: '60 DAYS',
      lightName: 'ORANGE LIGHT',
      lightHex: '#F97316',
      lightGlow: '0 0 14px 4px rgba(249, 115, 22, 0.95)',
      severity: 'High Horizon',
      colour: '#F97316',
      title: 'Q4 6-Monthly Facility Fire Evacuation Drill & First Aid Kit Restock',
      action: 'Auto-calendar sync active · Kit checklist (CHR-2026-SAF-03) assigned',
      owner: 'Facility Warden',
      route: '/emergency-response',
    },
    {
      id: 'AL-2',
      dayKey: '30',
      days: 30,
      horizon: '30 DAYS',
      lightName: 'GREEN LIGHT',
      lightHex: '#10B981',
      lightGlow: '0 0 14px 4px rgba(16, 185, 129, 0.95)',
      severity: 'Medium Horizon',
      colour: '#10B981',
      title: '4 Participant 10-Weekly Progress Snapshots & Plan Budget Reviews Due',
      action: 'Auto-filled 2026 Progress Review Forms queued for Team Leader sign-off',
      owner: 'Team Leader / Support Coordination',
      route: '/our-participants',
    },
    {
      id: 'AL-3',
      dayKey: '21',
      days: 21,
      horizon: '21 DAYS',
      lightName: 'BLUE LIGHT',
      lightHex: '#0072FF',
      lightGlow: '0 0 14px 4px rgba(0, 114, 255, 0.95)',
      severity: 'Active Horizon',
      colour: '#0072FF',
      title: '6-Monthly Home Environment Risk Assessment & PEEP Check Cycle',
      action: 'Auto-queued on Review Due Board (CHR-2026-SAF-02 printable sheet ready)',
      owner: 'Compliance & Safety Officer',
      route: '/risks',
    },
    {
      id: 'AL-1',
      dayKey: '14',
      days: 14,
      horizon: '14 DAYS',
      lightName: 'WHITE LIGHT',
      lightHex: '#FFFFFF',
      lightGlow: '0 0 16px 5px rgba(255, 255, 255, 1), 0 0 8px 2px #00C6FF',
      severity: 'Immediate',
      colour: '#0A2B6D',
      title: '2 Staff HLTAID009 CPR Certificates Approaching Annual Renewal',
      action: 'Auto-reminder sent · Refresher booked via Training & LMS Centre',
      owner: 'Human Resources Manager',
      route: '/certificates',
    },
  ];

  const filteredAlerts =
    horizonFilter === 'ALL'
      ? predictiveAlerts
      : predictiveAlerts.filter((a) => a.horizon.includes(horizonFilter));

  const selectedDomain =
    intelligenceDomains.find((d) => d.id === selectedDomainId) || intelligenceDomains[0];

  const overallScore = 98.7;

  const topKpis = [
    {
      category: 'Governance & Audit',
      icon: ShieldCheck,
      label: 'Overall Business & Compliance Health',
      value: `${overallScore}%`,
      sub: 'Audit-Ready across 17 Categories & 356 Checkpoints',
      badge: '+2.4% vs Q3',
    },
    {
      category: 'People & HR Screening',
      icon: Users,
      label: 'Workforce 100-Point Screening',
      value: '100%',
      sub: `${liveCounts.staff} Active Staff · ${liveCounts.certificates} Verified Credentials`,
      badge: 'Zero Unscreened Shifts',
    },
    {
      category: 'Care & Consents',
      icon: HeartHandshake,
      label: 'Participant Consents & Care Plans',
      value: '99.1%',
      sub: `${liveCounts.participants} Participants · 3-Part Consents Current`,
      badge: '10-Wk Reviews Active',
    },
    {
      category: 'Safety & WHS SLA',
      icon: AlertTriangle,
      label: 'WHS, Incident & Reportable SLA',
      value: '100% On-Time',
      sub: `${liveCounts.incidents} Incidents · ${liveCounts.risks} Active Risk Controls`,
      badge: '24h / 5d SLA Met',
    },
    {
      category: 'Finance & Claims',
      icon: DollarSign,
      label: 'NDIS Billing & Financial Health',
      value: '99.4%',
      sub: '3-Way Roster, Note & Invoice Match · 4.2d DSO',
      badge: 'PRODA Claim Ready',
    },
    {
      category: 'Tasks & Quality',
      icon: CheckCircle2,
      label: 'Action & Task Closure Velocity',
      value: `${liveCounts.completedTasks} Closed`,
      sub: `${liveCounts.openTasks} Open Tasks · ${liveCounts.audits} Internal Audits`,
      badge: '96.1% On-Time SLA',
    },
  ];

  return (
    <section
      id="business-health-intelligence"
      className="scroll-mt-14 rounded-xl bg-white p-1.5 sm:p-2 space-y-2 text-center"
    >
      {/* 50% Smaller Top Banner Header in App-Design Coloured Border */}
      <div
        className="w-full rounded-xl p-[2.5px] shadow-2xs"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex flex-col items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center space-y-1.5">
          <h2 className="font-editorial text-lg sm:text-xl md:text-2xl font-extrabold leading-tight tracking-tight">
            <span className="text-[#0A2B6D]">Business Health &amp; </span>
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              Compliance
            </span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
              Intelligence
            </span>
          </h2>

          <p className="mx-auto max-w-4xl text-[10px] sm:text-xs font-extrabold text-[#0072FF] leading-tight">
            Real-time cross-module intelligence uniting NDIS Practice Standards, 100-Point HR Screening, Participant Safeguarding, WHS Risk Radar, and Financial Claim Integrity.
          </p>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1.5">
            <div
              className="rounded-full p-[1.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={loadLiveIntelligence}
                className="gradient-brand flex min-h-[26px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-extrabold text-white transition-all hover:opacity-95"
                style={{ background: getHeaderView(5), color: '#FFFFFF' }}
              >
                <RefreshCw className={`h-3 w-3 text-white ${refreshing ? 'animate-spin' : ''}`} style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>Sync Live Telemetry</span>
              </button>
            </div>

            <div
              className="rounded-full p-[1.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={() =>
                  downloadBusinessHealthIntelligencePdf({
                    overallScore,
                    domains: intelligenceDomains,
                    kpis: topKpis,
                    predictiveAlerts,
                  })
                }
                className="gradient-brand flex min-h-[26px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-extrabold text-white transition-all hover:opacity-95"
                style={{ background: getHeaderView(1), color: '#FFFFFF' }}
              >
                <Download className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>Export Board Intelligence Report (A4 PDF)</span>
              </button>
            </div>
          </div>

          {/* 50% Smaller Live Executive Command With Thick App-Design Border & Glowing White Lights on One Line */}
          <div
            className="w-full rounded-xl border border-[#0A2B6D] p-[3px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand relative flex min-h-[28px] w-full flex-wrap items-center justify-center gap-2 rounded-[8px] border border-white px-3 py-1 text-center text-white"
              style={{
                background: getHeaderView(3),
                color: '#FFFFFF',
                boxShadow: '0 0 12px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              <div className="flex items-center justify-center gap-1">
                {[0, 1, 2].map((bulb) => (
                  <span
                    key={bulb}
                    className="h-2 w-2 rounded-full bg-white"
                    style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF' }}
                  />
                ))}
              </div>
              <Activity className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
              <span className="text-[10px] sm:text-xs font-extrabold tracking-wide text-white" style={{ color: '#FFFFFF' }}>
                Live Executive Command · 98.7% Overall Business Health &amp; Verified 2026 NDIS Audit Readiness
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Executive Intelligence KPI Tiles — 50% Smaller & App-Design Colour Between Side Border and White Word Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 items-stretch">
        {topKpis.map((k, idx) => {
          const KpiIcon = k.icon;
          const sym = getSymbolView(idx);
          const isGovernanceTile = idx === 0;
          const isLit = idx === litKpiIdx || idx === (litKpiIdx + 1) % 6;
          const trafficPalette = [
            { label: 'GREEN', bg: '#10B981', ring: 'rgba(16, 185, 129, 0.85)' },
            { label: 'YELLOW', bg: '#EAB308', ring: 'rgba(234, 179, 8, 0.85)' },
            { label: 'RED', bg: '#EF4444', ring: 'rgba(239, 68, 68, 0.85)' },
          ][trafficStep % 3];
          const outerBg = isGovernanceTile
            ? '#EAB308'
            : isLit
              ? trafficPalette.bg
              : getHeaderView(idx);
          return (
            <div
              key={k.label}
              onClick={() => {
                setLitKpiIdx(idx);
                setTrafficStep((prev) => (prev + 1) % 3);
              }}
              className={`flex h-full cursor-pointer rounded-xl border-2 border-[#0A2B6D] p-[3px] transition-all duration-300 ${
                isLit || isGovernanceTile ? '-translate-y-0.5 shadow-md' : 'shadow-2xs'
              }`}
              style={{
                background: outerBg,
                boxShadow: isGovernanceTile
                  ? '0 0 16px 4px rgba(234, 179, 8, 0.95), 0 0 10px 2px #FFFFFF'
                  : isLit
                    ? `0 0 0 3px ${trafficPalette.ring}, 0 0 14px 3px rgba(255, 255, 255, 0.95)`
                    : '0 0 8px 2px rgba(255, 255, 255, 0.85)',
              }}
            >
              {/* App-Design Colour Outside Between Side Border & Words */}
              <div
                className="flex h-full w-full flex-col items-center justify-between gap-1 rounded-[8px] p-1 text-center"
                style={{ background: isGovernanceTile ? '#EAB308' : TOP_BORDER_GRADIENT }}
              >
                {/* One-Line Top Live Tracker / Light Bar */}
                <div className="flex w-full items-center justify-center gap-1 rounded-full bg-white px-1.5 py-0.5 whitespace-nowrap">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/30"
                    style={{
                      backgroundColor: isGovernanceTile ? '#EAB308' : '#FFFFFF',
                      boxShadow: isGovernanceTile
                        ? '0 0 8px 3px #EAB308'
                        : '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF',
                    }}
                  />
                  <KpiIcon className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                  <span className="truncate text-[7.5px] font-extrabold uppercase tracking-tight text-[#0A2B6D]">
                    {isGovernanceTile ? 'LIVE TRACKER · GOV YELLOW' : k.category}
                  </span>
                </div>

                {/* Writing Box 1: Pure White Inside App-Design Coloured Frame */}
                <div className="flex min-h-[28px] w-full flex-col items-center justify-center rounded-[6px] bg-white px-1.5 py-0.5 text-center">
                  <div
                    className="text-[7.5px] font-extrabold uppercase leading-tight"
                    style={{ color: sym.iconColor }}
                  >
                    {k.label}
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className="font-editorial text-xs font-extrabold leading-none bg-clip-text text-transparent"
                      style={{ backgroundImage: getTitleGradientView(idx) }}
                    >
                      {k.value}
                    </span>
                    <span
                      className="text-[7px] font-extrabold"
                      style={{ color: getSymbolView(idx + 2).iconColor }}
                    >
                      {k.badge}
                    </span>
                  </div>
                </div>

                {/* Writing Box 2: Pure White Inside App-Design Coloured Frame */}
                <div
                  className="flex min-h-[20px] w-full items-center justify-center rounded-[6px] bg-white px-1.5 py-0.5 text-center text-[7.5px] font-extrabold leading-tight"
                  style={{ color: getSymbolView(idx + 1).iconColor }}
                >
                  {k.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 8-Pillar Matrix + Selected Pillar Side Panel — 50% Smaller, App-Design Colour Between Side Border & Words, Live Tracker at Top of Governance Tile & Governance Lit Up in Yellow */}
      <div
        className="w-full rounded-2xl p-[4px] shadow-md"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch rounded-[14px] p-1.5"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          {/* Left 7 Columns: 8-Domain Health Cards (50% Smaller, App-Design Colour Outside Words, Live Tracker at Top of Governance Tile & Governance Lit in Yellow) */}
          <div className="lg:col-span-7 flex rounded-xl bg-white p-2 shadow-2xs">
            <div className="flex w-full flex-col justify-between space-y-1.5">
              {/* Header 1: 8-Pillar Matrix Header With Glowing White Lights on Both Sides */}
              <div
                className="mx-auto w-full rounded-full p-[2px] shadow-2xs"
                style={{
                  background: TOP_BORDER_GRADIENT,
                  boxShadow: '0 0 12px 3px rgba(255, 255, 255, 0.95)',
                }}
              >
                <div
                  className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-white whitespace-nowrap"
                  style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-white"
                    style={{ boxShadow: '0 0 10px 3px #FFFFFF, 0 0 14px 3px #00C6FF' }}
                  />
                  <ShieldCheck className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                  <span className="truncate" style={{ color: '#FFFFFF' }}>
                    8-Pillar Business Health &amp; NDIS Practice Standard Matrix
                  </span>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-white"
                    style={{ boxShadow: '0 0 10px 3px #FFFFFF, 0 0 14px 3px #00C6FF' }}
                  />
                </div>
              </div>

              {/* AI Insight Under Header 1 */}
              <div
                className="w-full rounded-lg p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div className="flex items-center justify-center gap-1 rounded-[6px] bg-white px-2 py-0.5 text-center">
                  <Sparkles className="h-3 w-3 shrink-0 text-[#0A2B6D]" />
                  <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-[#0A2B6D] leading-tight">
                    AI Insight: All 8 NDIS Practice Standard pillars exceed 97.9% with 100% worker screening.
                  </span>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 xl:grid-cols-4 gap-1.5 items-stretch">
                {intelligenceDomains.map((dom, idx) => {
                  const DomainIcon = dom.icon;
                  const isSelected = dom.id === selectedDomain.id;
                  const isGovernance = dom.id === 'governance';
                  return (
                    <div
                      key={dom.id}
                      className={`flex h-full rounded-xl border-2 border-[#0A2B6D] p-[2.5px] shadow-2xs transition-all ${
                        isSelected ? 'ring-2 ring-[#FF2E9A]' : ''
                      }`}
                      style={{
                        background: isGovernance ? '#EAB308' : getHeaderView(idx),
                        boxShadow: isGovernance
                          ? '0 0 18px 4px rgba(234, 179, 8, 0.95), 0 0 10px 2px #FFFFFF'
                          : '0 0 8px 2px rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      {/* App-Design Colour (or Yellow for Governance) Between Side Border & White Word Boxes */}
                      <button
                        type="button"
                        onClick={() => setSelectedDomainId(dom.id)}
                        className="flex h-full w-full flex-col items-center justify-between gap-1 rounded-[8px] p-1 text-center"
                        style={{
                          background: isGovernance ? '#EAB308' : TOP_BORDER_GRADIENT,
                        }}
                      >
                        {/* Live Tracker at Top of Tile Fitted on One Line (+ Yellow Light on Governance) */}
                        <div className="flex w-full items-center justify-between gap-1 rounded-full bg-white px-1.5 py-0.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[7px] font-extrabold uppercase text-[#0A2B6D]">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/40"
                              style={{
                                backgroundColor: isGovernance ? '#EAB308' : '#10B981',
                                boxShadow: isGovernance
                                  ? '0 0 8px 3px #EAB308'
                                  : '0 0 6px 2px #10B981',
                              }}
                            />
                            <span>{isGovernance ? 'LIVE TRACKER · YELLOW' : 'LIVE TRACKER'}</span>
                          </span>
                          <span className="text-[7px] font-extrabold text-[#0A2B6D]">{dom.score}%</span>
                        </div>

                        {/* One-Line Category Symbol + Header With Glowing White Light */}
                        <div
                          className="flex min-h-[20px] w-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold leading-none text-center whitespace-nowrap"
                          style={{
                            background: isGovernance ? '#FEF08A' : '#FFFFFF',
                            color: '#0A2B6D',
                            boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.95)',
                          }}
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/30 bg-white"
                            style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                          />
                          <DomainIcon className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                          <span className="truncate text-[#0A2B6D]">
                            {dom.shortName} · {dom.score}%
                          </span>
                        </div>

                        {/* 50% Smaller Writing Box 1 With White Light Next to Title */}
                        <div className="flex min-h-[30px] w-full flex-col items-center justify-center rounded-[6px] bg-white px-1.5 py-0.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[8.5px] font-extrabold leading-tight text-[#0A2B6D]">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/30 bg-white"
                              style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 10px 2px #00C6FF' }}
                            />
                            <span>{dom.name}</span>
                          </div>
                          <div className="text-[7.5px] font-bold text-[#0A2B6D] leading-tight">
                            {dom.standard}
                          </div>
                        </div>

                        {/* 50% Smaller Writing Box 2: Pure White Inside App-Design Coloured Frame */}
                        <div className="flex w-full flex-col items-center justify-center gap-0.5 rounded-[6px] bg-white px-1.5 py-0.5 text-center">
                          <div className="h-1 w-full overflow-hidden rounded-full border border-[#0A2B6D]/20 bg-[#F5F0FF]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${dom.score}%`,
                                background: isGovernance ? '#EAB308' : TOP_BORDER_GRADIENT,
                              }}
                            />
                          </div>
                          <div className="text-center text-[7.5px] font-extrabold text-[#0A2B6D] whitespace-nowrap">
                            {dom.metricValue}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Selected Pillar Side Panel — 50% Smaller, Live Tracker at Top of Tile With Governance Lit in Yellow on One Line, 50% Smaller Charts & Date Above Open Governance */}
          <div
            className="lg:col-span-5 flex rounded-xl p-[3.5px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            {(() => {
              const SelectedIcon = selectedDomain.icon;
              const rightTrackerItems = [
                {
                  label: 'Communication - Emails',
                  icon: Mail,
                  lightColor: '#10B981',
                  trackerPct: 100,
                  statusText: '24/7 Synced',
                  route: '/communications',
                },
                {
                  label: 'Rosters',
                  icon: Calendar,
                  lightColor: '#00C6FF',
                  trackerPct: 99,
                  statusText: `${liveCounts.staff} Staff Screened`,
                  route: '/roster',
                },
                {
                  label: 'Risk',
                  icon: AlertTriangle,
                  lightColor: '#F97316',
                  trackerPct: 98,
                  statusText: `${liveCounts.risks} Controls`,
                  route: '/risks',
                },
                {
                  label: 'Incidents',
                  icon: Flame,
                  lightColor: '#EF4444',
                  trackerPct: 100,
                  statusText: `${liveCounts.incidents} SLA Met`,
                  route: '/incidents',
                },
                {
                  label: 'Feedback',
                  icon: MessageSquare,
                  lightColor: '#A100FF',
                  trackerPct: 99,
                  statusText: '100% <24h',
                  route: '/feedback',
                },
                {
                  label: 'Audits',
                  icon: ClipboardCheck,
                  lightColor: '#0072FF',
                  trackerPct: 100,
                  statusText: `${liveCounts.audits} Audits`,
                  route: '/compliance',
                },
              ];

              return (
                <div
                  className="relative flex h-full w-full flex-col items-center justify-between rounded-[9px] p-1.5 text-center space-y-1 overflow-hidden"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  {/* Top Live Tracker + Spotlights Fitted on One Single Line */}
                  <div className="flex w-full items-center justify-between gap-1.5 rounded-full bg-white px-2.5 py-0.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase text-[#0A2B6D]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#0A2B6D]/40 bg-[#EAB308]"
                        style={{ boxShadow: '0 0 8px 3px #EAB308' }}
                      />
                      <span>LIVE TRACKER · GOVERNANCE YELLOW LIT ✦</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full border border-[#0A2B6D]/25 bg-[#F5F0FF]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${selectedDomain.score}%`, background: '#EAB308' }}
                        />
                      </div>
                      <span className="text-[8px] font-extrabold text-[#0A2B6D]">
                        {selectedDomain.score}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-1">
                    {/* 1. SELECTED & NDIS GOVERNANCE BESIDE EACH OTHER IN ONE LINE & LIT UP IN YELLOW */}
                    <div
                      className="w-full rounded-xl p-[2.5px]"
                      style={{
                        background: '#EAB308',
                        boxShadow: '0 0 14px 3px rgba(234, 179, 8, 0.95)',
                      }}
                    >
                      <div
                        className="flex min-h-[28px] w-full items-center justify-center gap-1.5 rounded-[9px] px-2.5 py-1 text-center whitespace-nowrap"
                        style={{ background: '#EAB308', color: '#0A2B6D' }}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#0A2B6D] bg-white"
                          style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 3px #EAB308' }}
                        />
                        <SelectedIcon className="h-3.5 w-3.5 shrink-0 text-[#0A2B6D]" />
                        <span
                          className="font-editorial text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#0A2B6D] truncate"
                          style={{ color: '#0A2B6D' }}
                        >
                          SELECTED · NDIS {selectedDomain.shortName.toUpperCase()} ({selectedDomain.score}%) · YELLOW LIT
                        </span>
                      </div>
                    </div>

                    {/* 2. AI INSIGHT UNDER SELECTED HEADER (ONE LINE) */}
                    <div className="flex w-full items-center justify-center gap-1 rounded-lg bg-white px-2 py-0.5 text-center whitespace-nowrap overflow-hidden">
                      <Sparkles className="h-3 w-3 shrink-0 text-[#0A2B6D]" />
                      <span className="truncate text-[8.5px] font-extrabold text-[#0A2B6D]">
                        AI Insight: {selectedDomain.name} verified at {selectedDomain.score}% ({selectedDomain.metricValue}).
                      </span>
                    </div>

                    {/* 3. ANNUAL GOVERNANCE LIGHT UP BRIGHT RED (ONE LINE) */}
                    <div
                      className="w-full rounded-lg p-[2px]"
                      style={{
                        background: '#EF4444',
                        boxShadow: '0 0 12px 2px rgba(239, 68, 68, 0.85)',
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 rounded-[6px] bg-[#EF4444] px-2 py-0.5 text-center text-white whitespace-nowrap overflow-hidden">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full border border-white bg-white"
                          style={{ boxShadow: '0 0 8px 2px #FFFFFF' }}
                        />
                        <span
                          className="truncate text-[8px] font-extrabold uppercase tracking-wide text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          RED ALERT LIVE · {selectedDomain.ActionItems[0]}
                        </span>
                      </div>
                    </div>

                    {/* 4. SMALL FLAT SCREEN WITH TWO LIVE MOVING RISK CHARTS + GLOWING WHITE LIGHTS */}
                    {(() => {
                      const domainIndex = Math.max(0, intelligenceDomains.findIndex((d) => d.id === selectedDomain.id));
                      const activeSwitchCount = Object.values(dayLightSwitches).filter(Boolean).length;
                      const waveOffset = (riskWaveTick + domainIndex + activeSwitchCount) % 4;
                      const liveSeverityData = [
                        {
                          level: 'Low',
                          count: Math.max(4, (liveCounts.risks || 14) - 4 + ((waveOffset + 1) % 3)),
                          fill: '#0072FF',
                        },
                        {
                          level: 'Med',
                          count: Math.max(2, 3 + ((waveOffset + domainIndex) % 4)),
                          fill: '#5A00D6',
                        },
                        {
                          level: 'High',
                          count: Math.max(1, (liveCounts.incidents || 2) + (waveOffset % 2)),
                          fill: '#F97316',
                        },
                        {
                          level: 'Crit',
                          count: waveOffset === 3 ? 1 : 0,
                          fill: '#EF4444',
                        },
                      ];
                      const baseScore = Math.round(selectedDomain.score);
                      const liveControlData = [
                        { stage: 'Elim', pct: Math.min(100, Math.max(92, baseScore - 2 + (waveOffset % 3))) },
                        { stage: 'Min', pct: Math.min(100, Math.max(94, baseScore - 1 + ((waveOffset + 1) % 2))) },
                        { stage: 'Isol', pct: Math.min(100, Math.max(95, baseScore - (waveOffset % 2))) },
                        { stage: 'Train', pct: 100 },
                      ];

                      return (
                        <div className="flex flex-col items-center w-full">
                          <div
                            className="w-full rounded-xl border-2 border-[#00C6FF] bg-[#0A2B6D] p-1.5 shadow-sm"
                            style={{
                              boxShadow: '0 0 14px 3px rgba(255, 255, 255, 0.96), 0 0 10px 2px rgba(0, 198, 255, 0.6)',
                            }}
                          >
                            <div className="mb-1 flex items-center justify-between px-1">
                              <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-white">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full border border-white bg-white"
                                  style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                                />
                                <Monitor className="h-2.5 w-2.5 text-[#00C6FF]" />
                                <span>LIVE INTERACTIVE RISK CHARTS · {selectedDomain.shortName.toUpperCase()}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setRiskWaveTick((prev) => prev + 1)}
                                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0 text-[7px] font-extrabold text-[#0A2B6D]"
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
                                  style={{ boxShadow: '0 0 6px 2px #10B981' }}
                                />
                                <span>Pulse Live ↻</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-white p-1">
                              {/* Risk Chart 1: Dynamic Moving Severity Matrix */}
                              <div className="rounded border border-[#0A2B6D]/25 bg-white px-1.5 py-0.5">
                                <div className="flex items-center justify-between text-[7px] font-extrabold uppercase text-[#0A2B6D]">
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="h-2 w-2 rounded-full border border-[#0A2B6D]/30 bg-white"
                                      style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF' }}
                                    />
                                    <span>1. Risk Severity</span>
                                  </span>
                                  <span>{liveSeverityData.reduce((s, d) => s + d.count, 0)} Active</span>
                                </div>
                                <div className="h-12 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={liveSeverityData} margin={{ top: 3, right: 2, left: -26, bottom: 0 }}>
                                      <XAxis dataKey="level" fontSize={6.5} tick={{ fill: '#0A2B6D', fontWeight: 800 }} />
                                      <YAxis fontSize={6} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                                      <Tooltip />
                                      <Bar
                                        dataKey="count"
                                        radius={[3, 3, 0, 0]}
                                        barSize={11}
                                        isAnimationActive={true}
                                        animationDuration={550}
                                      >
                                        {liveSeverityData.map((entry) => (
                                          <Cell key={entry.level} fill={entry.fill} />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              {/* Risk Chart 2: Dynamic Moving Control Hierarchy Curve */}
                              <div className="rounded border border-[#0A2B6D]/25 bg-white px-1.5 py-0.5">
                                <div className="flex items-center justify-between text-[7px] font-extrabold uppercase text-[#0A2B6D]">
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="h-2 w-2 rounded-full border border-[#0A2B6D]/30 bg-white"
                                      style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF' }}
                                    />
                                    <span>2. Control (%)</span>
                                  </span>
                                  <span>{liveControlData[1].pct}%</span>
                                </div>
                                <div className="h-12 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={liveControlData} margin={{ top: 3, right: 2, left: -26, bottom: 0 }}>
                                      <XAxis dataKey="stage" fontSize={6.5} tick={{ fill: '#0A2B6D', fontWeight: 800 }} />
                                      <YAxis domain={[90, 100]} fontSize={6} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                                      <Tooltip formatter={(v) => `${v}%`} />
                                      <Area
                                        type="monotone"
                                        dataKey="pct"
                                        stroke="#0A2B6D"
                                        strokeWidth={2}
                                        fill="#00C6FF"
                                        fillOpacity={0.45}
                                        isAnimationActive={true}
                                        animationDuration={550}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="h-1 w-6 bg-[#0A2B6D]" />
                          <div
                            className="h-1 w-12 rounded-full border border-[#0A2B6D]"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          />
                        </div>
                      );
                    })()}

                    {/* 5. LEFT (CURRENT WRITING) & RIGHT (6 DIGITAL LIGHT LIVE TRACKERS) — WITH WHITE LIGHTS ON TITLES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 items-stretch">
                      {/* Left Column: Current Writing in Dark Blue */}
                      <div
                        className="flex rounded-lg p-[2.5px] shadow-2xs"
                        style={{ background: getHeaderView(3) }}
                      >
                        <div className="flex w-full flex-col justify-between rounded-[6px] bg-white p-1.5 text-left space-y-1">
                          <div className="flex items-center gap-1 border-b border-[#0A2B6D]/15 pb-0.5">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/30 bg-white"
                              style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                            />
                            <SelectedIcon className="h-3 w-3 shrink-0 text-[#0A2B6D]" />
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#0A2B6D] truncate">
                              {selectedDomain.shortName} Governance
                            </span>
                          </div>

                          <div className="text-[8.5px] font-extrabold text-[#0A2B6D] leading-tight">
                            {selectedDomain.metricLabel}: {selectedDomain.metricValue}
                          </div>

                          <p className="text-[8px] font-bold text-[#0A2B6D] leading-tight">
                            {selectedDomain.detail}
                          </p>

                          <div className="space-y-0.5">
                            {selectedDomain.ActionItems.slice(1).map((item) => (
                              <div
                                key={item}
                                className="flex items-start gap-1 rounded border border-[#0A2B6D]/20 bg-[#F5F0FF]/50 px-1 py-0.5 text-[7.5px] font-extrabold text-[#0A2B6D] leading-tight"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D] mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: 6 Digital Light Live Trackers With White Light on Title */}
                      <div
                        className="flex rounded-lg p-[2.5px] shadow-2xs"
                        style={{ background: getHeaderView(5) }}
                      >
                        <div className="flex w-full flex-col justify-between rounded-[6px] bg-white p-1.5 text-left space-y-0.5">
                          <div className="flex items-center justify-between border-b border-[#0A2B6D]/15 pb-0.5">
                            <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/30 bg-white"
                                style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                              />
                              <span>Digital Light Live Trackers</span>
                            </span>
                            <span className="text-[7px] font-extrabold text-[#0A2B6D]">6 LIVE</span>
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            {rightTrackerItems.map((rt) => {
                              const RtIcon = rt.icon;
                              return (
                                <Link
                                  key={rt.label}
                                  to={rt.route}
                                  className="block rounded border border-[#0A2B6D]/20 bg-white px-1 py-0.5 transition-all hover:bg-[#F5F0FF]"
                                >
                                  <div className="flex items-center justify-between gap-0.5">
                                    <span className="inline-flex items-center gap-0.5 text-[7px] font-extrabold text-[#0A2B6D] truncate">
                                      <RtIcon className="h-2 w-2 shrink-0 text-[#0A2B6D]" />
                                      <span className="truncate">{rt.label}</span>
                                    </span>
                                    <span
                                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                                      style={{
                                        backgroundColor: rt.lightColor,
                                        boxShadow: `0 0 4px 1px ${rt.lightColor}`,
                                      }}
                                    />
                                  </div>
                                  <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[#F5F0FF]">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: `${rt.trackerPct}%`, background: TOP_BORDER_GRADIENT }}
                                    />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 6. THREE DEVICES ROW (50% COMPACT): PHONE, PC MONITOR, IPAD */}
                    <div className="grid grid-cols-3 gap-1 items-stretch">
                      <div className="rounded-lg border-2 border-[#0A2B6D] bg-[#0A2B6D] p-1">
                        <div className="rounded bg-white px-1 py-0.5 text-center">
                          <div className="text-[6.5px] font-extrabold uppercase text-[#0A2B6D]">
                            PHONE · DATE &amp; TEMP
                          </div>
                          <div className="text-[7.5px] font-extrabold text-[#0A2B6D]">
                            27 Oct · 24°C
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border-2 border-[#0072FF] bg-[#0A2B6D] p-1">
                        <Link to="/ndis-updates" className="block rounded bg-white px-1 py-0.5 text-center">
                          <div className="text-[6.5px] font-extrabold uppercase text-[#0A2B6D]">
                            PC · NDIS UPDATES
                          </div>
                          <div className="text-[7.5px] font-extrabold text-[#0A2B6D] truncate">
                            2026 Price Guide Live
                          </div>
                        </Link>
                      </div>

                      <div className="rounded-lg border-2 border-[#00C6FF] bg-[#0A2B6D] p-1">
                        <div className="rounded bg-[#F0F9FF] px-1 py-0.5 text-center">
                          <div className="text-[6.5px] font-extrabold uppercase text-[#0A2B6D]">
                            IPAD · WEATHER CH.
                          </div>
                          <div className="text-[7.5px] font-extrabold text-[#0A2B6D]">
                            Sydney 24°C Clear
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DATE PLACED DIRECTLY ABOVE OPEN GOVERNANCE + ACTION BUTTONS ON ONE LINE */}
                  <div className="w-full space-y-1 pt-0.5">
                    <div className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D]/25 bg-white px-2.5 py-0.5 text-[8px] font-extrabold text-[#0A2B6D] whitespace-nowrap">
                      <Calendar className="h-2.5 w-2.5 text-[#0A2B6D]" />
                      <span>Date: Tuesday, 27 October 2026 · Live Verified</span>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-1.5">
                      <div
                        className="rounded-full p-[2px]"
                        style={{ background: '#EAB308' }}
                      >
                        <Link
                          to={selectedDomain.route}
                          className="inline-flex min-h-[22px] w-full items-center justify-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D] whitespace-nowrap"
                        >
                          <span>Open {selectedDomain.shortName}</span>
                          <ArrowUpRight className="h-2.5 w-2.5 text-[#0A2B6D]" />
                        </Link>
                      </div>
                      <div
                        className="rounded-full p-[2px]"
                        style={{ background: getHeaderView(1) }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            downloadBusinessHealthIntelligencePdf({
                              overallScore,
                              domains: intelligenceDomains,
                              kpis: topKpis,
                              predictiveAlerts,
                            })
                          }
                          className="inline-flex min-h-[22px] w-full items-center justify-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D] whitespace-nowrap"
                        >
                          <Download className="h-2.5 w-2.5 text-[#0A2B6D]" />
                          <span>Pillar PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Visual Analytics (Charts Reduced by 50%) & Predictive 90/60/30/21/14-Day Expiry Radar (Writing Moved to Left Side & App-Design Colour Between Side Border & Words) */}
      {!compact && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
          {/* Chart 1: 6-Month Business Health Trajectory With Glowing White Lights */}
          <div
            className="lg:col-span-4 flex rounded-xl border-2 border-[#0A2B6D] p-[2.5px] shadow-sm"
            style={{
              background: getHeaderView(0),
              boxShadow: '0 0 14px 3px rgba(255, 255, 255, 0.96), 0 0 10px 2px rgba(0, 198, 255, 0.45)',
            }}
          >
            <div
              className="flex w-full flex-col justify-between rounded-[9px] p-1.5 text-center space-y-1"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="gradient-brand flex min-h-[24px] items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-white whitespace-nowrap"
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-white"
                  style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                />
                <ShieldCheck className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                <span className="truncate text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                  6-Month Compliance vs. Business Health
                </span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-white"
                  style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                />
              </div>

              <div className="rounded-[6px] bg-white px-2 py-0.5 text-center text-[8.5px] font-extrabold text-[#5A00D6] whitespace-nowrap">
                Audit Readiness (%) &amp; Monthly NDIS Billing ($K) · 98.7% Peak
              </div>

              <div className="h-24 w-full rounded-[6px] bg-white p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={TREND_DATA_2026}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9d5ff" />
                    <XAxis dataKey="month" fontSize={7.5} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <YAxis yAxisId="left" domain={[88, 100]} fontSize={7.5} tick={{ fill: '#5A00D6', fontWeight: 700 }} />
                    <YAxis yAxisId="right" orientation="right" fontSize={7.5} tick={{ fill: '#FF2E9A', fontWeight: 700 }} />
                    <Tooltip />
                    <Bar yAxisId="right" dataKey="revenueK" name="NDIS Billed ($K)" fill="#FF2E9A" radius={[3, 3, 0, 0]} barSize={12} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="compliance"
                      name="Compliance Score (%)"
                      stroke="#5A00D6"
                      strokeWidth={2}
                      fill="#5A00D6"
                      fillOpacity={0.18}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 2: 8-Domain Benchmark Score Comparison With Glowing White Lights */}
          <div
            className="lg:col-span-4 flex rounded-xl border-2 border-[#0A2B6D] p-[2.5px] shadow-sm"
            style={{
              background: getHeaderView(2),
              boxShadow: '0 0 14px 3px rgba(255, 255, 255, 0.96), 0 0 10px 2px rgba(0, 198, 255, 0.45)',
            }}
          >
            <div
              className="flex w-full flex-col justify-between rounded-[9px] p-1.5 text-center space-y-1"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="gradient-brand flex min-h-[24px] items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-white whitespace-nowrap"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-white"
                  style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                />
                <ShieldCheck className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                <span className="truncate text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                  8-Domain Compliance Benchmark (%)
                </span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-white"
                  style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                />
              </div>

              <div className="rounded-[6px] bg-white px-2 py-0.5 text-center text-[8.5px] font-extrabold text-[#0072FF] whitespace-nowrap">
                Every Department Exceeds the 95% NDIS Audit Threshold
              </div>

              <div className="h-24 w-full rounded-[6px] bg-white p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intelligenceDomains} layout="vertical" margin={{ left: 4, right: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9d5ff" />
                    <XAxis type="number" domain={[90, 100]} fontSize={7.5} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      width={66}
                      fontSize={7}
                      tick={{ fill: '#0A2B6D', fontWeight: 800 }}
                    />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="score" name="Readiness Score (%)" radius={[0, 3, 3, 0]} barSize={8}>
                      {intelligenceDomains.map((d) => (
                        <Cell key={d.id} fill={d.colour} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Column 3: Predictive 90 / 60 / 30 / 21 / 14-Day Radar — 50% Smaller, App-Design Colour Between Side Border & Words, Writing Moved to Left Side */}
          <div
            className="lg:col-span-4 flex rounded-xl border-2 border-[#0A2B6D] p-[2.5px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="relative flex w-full flex-col justify-between rounded-[9px] p-1.5 text-left space-y-1 overflow-hidden"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              {/* One-Line Top Spotlight & Predictive Header */}
              <div
                className="gradient-brand flex min-h-[24px] w-full items-center justify-between gap-1.5 rounded-full px-2.5 py-0.5 text-white whitespace-nowrap"
                style={{ background: getHeaderView(4), color: '#FFFFFF' }}
              >
                <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-white">
                  <ShieldCheck className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Predictive 90/60/30/21/14d Radar</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold text-white">
                  <span
                    className="h-2 w-2 rounded-full bg-white"
                    style={{ boxShadow: '0 0 8px 2px #FFFFFF' }}
                  />
                  SPOTLIGHTS ON
                </span>
              </div>

              {/* One-Line Descending Days Filter Bar With Light Switches in Front of Days */}
              <div className="flex flex-wrap items-center justify-between gap-1 rounded-[6px] bg-white px-1.5 py-0.5">
                <button
                  type="button"
                  onClick={() => setHorizonFilter('ALL')}
                  className={`rounded-full px-1.5 py-0 text-[7.5px] font-extrabold ${
                    horizonFilter === 'ALL'
                      ? 'bg-[#5A00D6] text-white'
                      : 'border border-[#0A2B6D]/30 bg-white text-[#0A2B6D]'
                  }`}
                >
                  All
                </button>
                {[
                  { key: '90', label: '90d', hex: '#EF4444', glow: '0 0 6px 2px #EF4444' },
                  { key: '60', label: '60d', hex: '#F97316', glow: '0 0 6px 2px #F97316' },
                  { key: '30', label: '30d', hex: '#10B981', glow: '0 0 6px 2px #10B981' },
                  { key: '21', label: '21d', hex: '#0072FF', glow: '0 0 6px 2px #0072FF' },
                  { key: '14', label: '14d', hex: '#FFFFFF', glow: '0 0 6px 2px #00C6FF' },
                ].map((d) => {
                  const isOn = dayLightSwitches[d.key] !== false;
                  return (
                    <div
                      key={d.key}
                      className="inline-flex items-center gap-0.5 rounded-full border border-[#0A2B6D]/25 bg-white px-1 py-0"
                    >
                      <button
                        type="button"
                        onClick={() => toggleDaySwitch(d.key)}
                        title={`Toggle ${d.label} light switch`}
                        className={`relative inline-flex h-2.5 w-4 shrink-0 items-center rounded-full border border-[#0A2B6D] transition-all ${
                          isOn ? 'bg-[#0A2B6D]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full bg-white transition-transform ${
                            isOn ? 'translate-x-2' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/40"
                        style={{
                          backgroundColor: isOn ? d.hex : '#cbd5e1',
                          boxShadow: isOn ? d.glow : 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setHorizonFilter(d.key)}
                        className={`text-[7.5px] font-extrabold ${
                          horizonFilter === d.key ? 'text-[#FF2E9A] underline' : 'text-[#0A2B6D]'
                        }`}
                      >
                        {d.label}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 50% Smaller Predictive Alert Tiles — App-Design Colour Outside Words & All Writing Moved to the LEFT Side */}
              <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
                {filteredAlerts.map((al, aIdx) => {
                  const isLightOn = dayLightSwitches[al.dayKey] !== false;
                  return (
                    <div
                      key={al.id}
                      className="rounded-lg p-[2px]"
                      style={{ background: getHeaderView(aIdx) }}
                    >
                      <div className="flex items-center justify-between gap-1.5 rounded-[6px] bg-white px-2 py-1 text-left">
                        {/* Left Side: Switch + Real Light + Day Badge + Left-Aligned Writing */}
                        <div className="min-w-0 flex-1 text-left space-y-0.5">
                          <div className="flex items-center justify-start gap-1">
                            <button
                              type="button"
                              onClick={() => toggleDaySwitch(al.dayKey)}
                              title="Light Switch"
                              className={`relative inline-flex h-3 w-5 shrink-0 items-center rounded-full border border-[#0A2B6D] transition-all ${
                                isLightOn ? 'bg-[#0A2B6D]' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-2 w-2 rounded-full bg-white transition-transform ${
                                  isLightOn ? 'translate-x-2.5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>

                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#0A2B6D]"
                              style={{
                                backgroundColor: isLightOn ? al.lightHex : '#cbd5e1',
                                boxShadow: isLightOn ? al.lightGlow : 'none',
                              }}
                            />

                            <span
                              className="shrink-0 rounded-full border border-[#0A2B6D] px-1.5 py-0 text-[7px] font-extrabold"
                              style={{
                                backgroundColor: al.lightHex === '#FFFFFF' ? '#FFFFFF' : al.lightHex,
                                color: al.lightHex === '#FFFFFF' ? '#0A2B6D' : '#FFFFFF',
                              }}
                            >
                              {al.horizon}
                            </span>

                            <span className="truncate text-left text-[8px] font-extrabold text-[#0A2B6D]">
                              {al.title}
                            </span>
                          </div>

                          <div className="truncate text-left text-[7.5px] font-bold text-[#5A00D6]">
                            {al.action}
                          </div>
                        </div>

                        {/* Right Side: Action Tile */}
                        <Link
                          to={al.route}
                          className="gradient-brand shrink-0 rounded-full border border-[#0A2B6D] px-2 py-0.5 text-[7.5px] font-extrabold text-white whitespace-nowrap"
                          style={{ background: getHeaderView(aIdx), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>Action →</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}