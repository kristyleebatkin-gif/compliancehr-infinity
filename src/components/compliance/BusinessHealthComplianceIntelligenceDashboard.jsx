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

const formatRecordCount = (value) => value == null ? 'Unavailable' : value.toLocaleString();
const formatScore = (value) => value == null ? 'Unassessed' : `${value}%`;

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

const TREND_DATA_2026 = [];

const MINI_RISK_SEVERITY_DATA = [];

const MINI_RISK_CONTROL_DATA = [];

export default function BusinessHealthComplianceIntelligenceDashboard({ compact = false }) {
  const [liveCounts, setLiveCounts] = useState({ staff: null, participants: null, policies: null, openTasks: null, completedTasks: null, incidents: null, risks: null, certificates: null, drills: null, audits: null });
  const [selectedDomainId, setSelectedDomainId] = useState('governance');
  const [horizonFilter, setHorizonFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [dayLightSwitches, setDayLightSwitches] = useState({
    '90': true,
    '60': true,
    '30': true,
    '21': true,
    '14': true,
  });

  const toggleDaySwitch = (dayKey) => {
    setDayLightSwitches((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

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

      const val = (idx) =>
        results[idx]?.status === 'fulfilled' && typeof results[idx].value === 'number'
          ? results[idx].value
          : null;

      setLiveCounts({
        staff: val(0), participants: val(1), policies: val(2), openTasks: val(3), completedTasks: val(4), incidents: val(5), risks: val(6), certificates: val(7), drills: val(8), audits: val(9),
      });
    } catch {
      // Counts that could not be loaded remain unavailable.
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveIntelligence();
  }, [loadLiveIntelligence]);

  const intelligenceDomains = [
    {
      id: 'governance', name: 'NDIS Governance & Policy Control', shortName: 'Governance',
      standard: 'NDIS governance and policy records', colour: '#5A00D6', icon: ShieldCheck, route: '/compliance',
    },
    {
      id: 'workforce', name: 'Workforce & HR Assurance', shortName: 'HR & Screening',
      standard: 'Worker screening and workforce records', colour: '#0072FF', icon: Users, route: '/hr',
    },
    {
      id: 'participants', name: 'Participant Care, Consents & Goals', shortName: 'Participants',
      standard: 'Participant support and profile records', colour: '#FF2E9A', icon: HeartHandshake, route: '/our-participants',
    },
    {
      id: 'safety', name: 'WHS, Incidents & NDIS Reportables', shortName: 'WHS & Incidents',
      standard: 'Risk and incident records', colour: '#FF2E9A', icon: AlertTriangle, route: '/incidents',
    },
    {
      id: 'emergency', name: 'Emergency Drills, Kits & Facility Safety', shortName: 'Emergency & Kits',
      standard: 'Emergency response records', colour: '#A100FF', icon: Flame, route: '/emergency-response',
    },
    {
      id: 'finance', name: 'Financial Health, NDIS Claims & Roster', shortName: 'Finance & Roster',
      standard: 'Financial and roster records', colour: '#0072FF', icon: DollarSign, route: '/invoicing',
    },
    {
      id: 'quality', name: 'Quality, Complaints & Audits', shortName: 'Quality & CIR',
      standard: 'Audit and quality records', colour: '#5A00D6', icon: Award, route: '/quality',
    },
    {
      id: 'vault', name: 'Document Vault, Privacy & Data Control', shortName: 'Vault & Privacy',
      standard: 'Document and privacy records', colour: '#FF2E9A', icon: Lock, route: '/documents',
    },
  ].map((domain) => {
    const metrics = {
      governance: `${formatRecordCount(liveCounts.policies)} policy records`,
      workforce: `${formatRecordCount(liveCounts.staff)} staff records · ${formatRecordCount(liveCounts.certificates)} certificate records`,
      participants: `${formatRecordCount(liveCounts.participants)} participant records`,
      safety: `${formatRecordCount(liveCounts.incidents)} incident records · ${formatRecordCount(liveCounts.risks)} risk records`,
      emergency: `${formatRecordCount(liveCounts.drills)} emergency drill records`,
      finance: 'Financial reconciliation data unavailable in this view',
      quality: `${formatRecordCount(liveCounts.audits)} audit records · ${formatRecordCount(liveCounts.completedTasks)} completed task records`,
      vault: 'Document and breach assessment data unavailable in this view',
    };
    return {
      ...domain,
      score: null,
      status: 'Unassessed',
      metricLabel: 'Source record counts',
      metricValue: metrics[domain.id],
      detail: 'This dashboard shows source-record counts only. Compliance status requires linked, verified evidence.',
      ActionItems: [],
    };
  });

  // Ordered descending by days (90 -> 60 -> 30 -> 21 -> 14): Largest amount of days is RED, then ORANGE, GREEN, BLUE, WHITE real lights
  const predictiveAlerts = [];

  const filteredAlerts =
    horizonFilter === 'ALL'
      ? predictiveAlerts
      : predictiveAlerts.filter((a) => a.horizon.includes(horizonFilter));

  const selectedDomain =
    intelligenceDomains.find((d) => d.id === selectedDomainId) || intelligenceDomains[0];

  const overallScore = null;

  const topKpis = [
    {
      category: 'Governance & Audit', icon: ShieldCheck,
      label: 'Governance & Policy Records',
      value: formatRecordCount(liveCounts.policies),
      sub: `${formatRecordCount(liveCounts.audits)} internal audit records`,
      badge: 'Status unassessed',
    },
    {
      category: 'People & HR', icon: Users,
      label: 'Workforce Records',
      value: formatRecordCount(liveCounts.staff),
      sub: `${formatRecordCount(liveCounts.certificates)} certificate records`,
      badge: 'Screening unassessed',
    },
    {
      category: 'Care & Consents', icon: HeartHandshake,
      label: 'Participant Records',
      value: formatRecordCount(liveCounts.participants),
      sub: 'Consent and support evidence not assessed here',
      badge: 'Status unassessed',
    },
    {
      category: 'Safety & WHS', icon: AlertTriangle,
      label: 'Incident & Risk Records',
      value: formatRecordCount(liveCounts.incidents),
      sub: `${formatRecordCount(liveCounts.risks)} risk records`,
      badge: 'SLA status unassessed',
    },
    {
      category: 'Finance & Claims', icon: DollarSign,
      label: 'NDIS Billing & Financial Health',
      value: 'Unassessed',
      sub: 'Claim reconciliation data is not available in this view',
      badge: 'Status unassessed',
    },
    {
      category: 'Tasks & Quality', icon: CheckCircle2,
      label: 'Task & Audit Records',
      value: `${formatRecordCount(liveCounts.completedTasks)} completed tasks`,
      sub: `${formatRecordCount(liveCounts.openTasks)} open tasks · ${formatRecordCount(liveCounts.audits)} audits`,
      badge: 'Counts only',
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
              className="gradient-brand relative flex min-h-[24px] w-full flex-nowrap items-center justify-center gap-1.5 rounded-[8px] border border-white px-2.5 py-0.5 text-center text-white whitespace-nowrap overflow-hidden"
              style={{
                background: getHeaderView(3),
                color: '#FFFFFF',
                boxShadow: '0 0 12px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              <div className="flex shrink-0 items-center justify-center gap-1">
                {[0, 1, 2].map((bulb) => (
                  <span
                    key={bulb}
                    className="h-1.5 w-1.5 rounded-full bg-white"
                    style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF' }}
                  />
                ))}
              </div>
              <Activity className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
              <span className="truncate text-[8.5px] sm:text-[10px] font-extrabold tracking-wide text-white" style={{ color: '#FFFFFF' }}>
                Live Executive Command · Operational records and review links
              </span>
              <div className="flex shrink-0 items-center justify-center gap-1">
                {[0, 1, 2].map((bulb) => (
                  <span
                    key={`r-${bulb}`}
                    className="h-1.5 w-1.5 rounded-full bg-white"
                    style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF' }}
                  />
                ))}
              </div>
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
          const isLit = false;
          const trafficPalette = { ring: 'rgba(71, 85, 105, 0.25)' };
          const outerBg = isGovernanceTile
            ? '#EAB308'
            : getHeaderView(idx);
          return (
            <div
              key={k.label}
              className={`flex h-full cursor-pointer rounded-xl border-2 border-[#0A2B6D] p-[3px] transition-all duration-300 ${
                isGovernanceTile ? '-translate-y-0.5 shadow-md' : 'shadow-2xs'
              }`}
              style={{
                background: outerBg,
                boxShadow: isGovernanceTile
                  ? '0 0 16px 4px rgba(234, 179, 8, 0.95), 0 0 10px 2px #FFFFFF'
                  : '0 0 8px 2px rgba(255, 255, 255, 0.85)',
              }}
            >
              <div className="flex h-full w-full flex-col items-center justify-between gap-1 rounded-[8px] bg-white p-1 text-center">
                {/* App-Design Coloured Header Bar */}
                <div
                  className="gradient-brand flex w-full items-center justify-between gap-1 rounded-full px-1.5 py-0.5 whitespace-nowrap text-white"
                  style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                >
                  <span className="inline-flex items-center gap-1 truncate">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full border border-white"
                      style={{
                        backgroundColor: isGovernanceTile ? '#EAB308' : '#FFFFFF',
                        boxShadow: isGovernanceTile
                          ? '0 0 8px 3px #EAB308'
                          : '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF',
                      }}
                    />
                    <KpiIcon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="truncate text-[7px] font-extrabold uppercase tracking-tight text-white" style={{ color: '#FFFFFF' }}>
                      {k.category}
                    </span>
                  </span>
                  <span className="text-[6.5px] font-extrabold text-white" style={{ color: '#FFFFFF' }}>UNASSESSED</span>
                </div>

                {/* Writing Box 1: Pure White Background */}
                <div className="flex min-h-[28px] w-full flex-col items-center justify-center rounded-[5px] border border-[#0A2B6D]/20 bg-white px-1.5 py-0.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[7.5px] font-extrabold uppercase leading-tight text-[#0A2B6D]">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full border border-[#0A2B6D]/30 bg-white"
                      style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 10px 2px #00C6FF' }}
                    />
                    <span>{k.label}</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-editorial text-xs font-extrabold leading-none text-[#0A2B6D]">
                      {k.value}
                    </span>
                    <span className="text-[7px] font-extrabold text-[#0A2B6D]">
                      {k.badge}
                    </span>
                  </div>
                </div>

                {/* Writing Box 2: Pure White Background */}
                <div className="flex min-h-[20px] w-full items-center justify-center rounded-[5px] border border-[#0A2B6D]/20 bg-white px-1.5 py-0.5 text-center text-[7.5px] font-extrabold leading-tight text-[#0A2B6D]">
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

              {/* AI Insight Under Header 1 — Pure White Writing Box */}
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
                      <button
                        type="button"
                        onClick={() => setSelectedDomainId(dom.id)}
                        className="flex h-full w-full flex-col items-center justify-between gap-1 rounded-[8px] bg-white p-1 text-center"
                      >
                        {/* Live Tracker at Top of Tile Fitted on One Line (+ Yellow Light on Governance) */}
                        <div className="flex w-full items-center justify-between gap-1 rounded-full border border-[#0A2B6D]/20 bg-white px-1.5 py-0.5 whitespace-nowrap">
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
                            <span>{isGovernance ? 'ASSESSMENT · UNASSESSED' : 'ASSESSMENT · UNASSESSED'}</span>
                          </span>
                          <span className="text-[7px] font-extrabold text-[#0A2B6D]">{formatScore(dom.score)}</span>
                        </div>

                        {/* App-Design Coloured Header Bar With Glowing White Light */}
                        <div
                          className="gradient-brand flex min-h-[20px] w-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold leading-none text-center whitespace-nowrap text-white"
                          style={{
                            background: getHeaderView(idx),
                            color: '#FFFFFF',
                            boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.95)',
                          }}
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full border border-white bg-white"
                            style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                          />
                          <DomainIcon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                          <span className="truncate text-white" style={{ color: '#FFFFFF' }}>
                            {dom.shortName} · {formatScore(dom.score)}
                          </span>
                        </div>

                        {/* Writing Box 1: Pure White */}
                        <div className="flex min-h-[30px] w-full flex-col items-center justify-center rounded-[5px] border border-[#0A2B6D]/20 bg-white px-1.5 py-0.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[8px] font-extrabold leading-tight text-[#0A2B6D]">
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full border border-[#0A2B6D]/30 bg-white"
                              style={{ boxShadow: '0 0 6px 2px #FFFFFF, 0 0 8px 2px #00C6FF' }}
                            />
                            <span>{dom.name}</span>
                          </div>
                          <div className="text-[7px] font-bold text-[#0A2B6D] leading-tight">
                            {dom.standard}
                          </div>
                        </div>

                        {/* Writing Box 2: Pure White */}
                        <div className="flex w-full flex-col items-center justify-center gap-0.5 rounded-[5px] border border-[#0A2B6D]/20 bg-white px-1.5 py-0.5 text-center">
                          <div className="h-1 w-full overflow-hidden rounded-full border border-[#0A2B6D]/20 bg-white">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${formatScore(dom.score)}`,
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
                <div className="relative flex h-full w-full flex-col items-center justify-between rounded-[9px] bg-white p-1.5 text-center space-y-1 overflow-hidden">
                  {/* Top Live Tracker + Spotlights Fitted on One Single Line */}
                  <div className="flex w-full items-center justify-between gap-1.5 rounded-full border border-[#0A2B6D]/25 bg-white px-2.5 py-0.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase text-[#0A2B6D]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#0A2B6D]/40 bg-[#EAB308]"
                        style={{ boxShadow: '0 0 8px 3px #EAB308' }}
                      />
                      <span>ASSESSMENT · UNASSESSED LIT ✦</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full border border-[#0A2B6D]/25 bg-white">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${formatScore(selectedDomain.score)}`, background: '#EAB308' }}
                        />
                      </div>
                      <span className="text-[8px] font-extrabold text-[#0A2B6D]">
                        {formatScore(selectedDomain.score)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-1">
                    {/* 1. SELECTED & NDIS GOVERNANCE BESIDE EACH OTHER IN ONE LINE — PURE WHITE INSIDE TEXT BOX */}
                    <div
                      className="w-full rounded-xl p-[2.5px]"
                      style={{
                        background: '#EAB308',
                        boxShadow: '0 0 14px 3px rgba(234, 179, 8, 0.95)',
                      }}
                    >
                      <div className="flex min-h-[28px] w-full items-center justify-center gap-1.5 rounded-[9px] bg-white px-2.5 py-1 text-center text-[#0A2B6D] whitespace-nowrap">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#0A2B6D] bg-[#EAB308]"
                          style={{ boxShadow: '0 0 8px 3px #EAB308' }}
                        />
                        <SelectedIcon className="h-3.5 w-3.5 shrink-0 text-[#0A2B6D]" />
                        <span
                          className="font-editorial text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#0A2B6D] truncate"
                          style={{ color: '#0A2B6D' }}
                        >
                          SELECTED · {selectedDomain.shortName.toUpperCase()} · {formatScore(selectedDomain.score)}
                        </span>
                      </div>
                    </div>

                    {/* 2. AI INSIGHT UNDER SELECTED HEADER (ONE LINE) */}
                    <div className="flex w-full items-center justify-center gap-1 rounded-lg border border-[#0A2B6D]/20 bg-white px-2 py-0.5 text-center whitespace-nowrap overflow-hidden">
                      <Sparkles className="h-3 w-3 shrink-0 text-[#0A2B6D]" />
                      <span className="truncate text-[8.5px] font-extrabold text-[#0A2B6D]">
                        Assessment: {formatScore(selectedDomain.score)} · {selectedDomain.metricValue}.
                      </span>
                    </div>

                    {/* 3. ANNUAL GOVERNANCE LIGHT UP BRIGHT RED — PURE WHITE INSIDE TEXT BOX */}
                    <div
                      className="w-full rounded-lg p-[2px]"
                      style={{
                        background: '#EF4444',
                        boxShadow: '0 0 12px 2px rgba(239, 68, 68, 0.85)',
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 rounded-[6px] bg-white px-2 py-0.5 text-center text-[#0A2B6D] whitespace-nowrap overflow-hidden">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D] bg-[#EF4444]"
                          style={{ boxShadow: '0 0 8px 2px #EF4444' }}
                        />
                        <span
                          className="truncate text-[8px] font-extrabold uppercase tracking-wide text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          Assessment status · {selectedDomain.status}
                        </span>
                      </div>
                    </div>

                    {/* 4. SMALL FLAT SCREEN WITH TWO LIVE MOVING RISK CHARTS + GLOWING WHITE LIGHTS */}
                    {(() => {
                      const liveSeverityData = [];
                      const liveControlData = [];

                      return (
                        <div className="flex flex-col items-center w-full">
                          <div
                            className="w-full rounded-xl border-2 border-[#00C6FF] p-1.5 shadow-sm"
                            style={{
                              background: getHeaderView(1),
                              boxShadow: '0 0 14px 3px rgba(255, 255, 255, 0.96), 0 0 10px 2px rgba(0, 198, 255, 0.6)',
                            }}
                          >
                            <div className="mb-1 flex items-center justify-between px-1">
                              <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-white">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full border border-white bg-white"
                                  style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                                />
                                <Monitor className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                                <span style={{ color: '#FFFFFF' }}>RISK RECORDS · {selectedDomain.shortName.toUpperCase()}</span>
                              </span>
                              <button
                                type="button"
                                onClick={loadLiveIntelligence}
                                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0 text-[7px] font-extrabold text-[#0A2B6D]"
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
                                  style={{ boxShadow: '0 0 6px 2px #10B981' }}
                                />
                                <span>Refresh counts</span>
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
                                  <span>{formatRecordCount(liveCounts.risks)} records · severity unassessed</span>
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
                                  <span>Unassessed</span>
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
                          <div className="h-1 w-6" style={{ background: getHeaderView(1) }} />
                          <div
                            className="h-1 w-12 rounded-full"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          />
                        </div>
                      );
                    })()}

                    {/* 5. LEFT (CURRENT WRITING) & RIGHT (6 DIGITAL LIGHT LIVE TRACKERS) — PINK/BLUE/PURPLE SPRAY & DARK BLUE WRITING */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 items-stretch">
                      {/* Left Column: Current Writing on Pure White Background */}
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
                                className="flex items-start gap-1 rounded border border-[#0A2B6D]/20 bg-white px-1 py-0.5 text-[7.5px] font-extrabold text-[#0A2B6D] leading-tight"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D] mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: 6 Module shortcuts With Pure White Writing Boxes */}
                      <div
                        className="flex rounded-lg p-[2.5px] shadow-2xs"
                        style={{ background: getHeaderView(5) }}
                      >
                        <div className="flex w-full flex-col justify-between rounded-[6px] bg-white p-1.5 text-left space-y-0.5">
                          <div className="flex items-center justify-between rounded border border-[#0A2B6D]/15 bg-white px-1.5 py-0.5">
                            <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full border border-[#0A2B6D]/30 bg-white"
                                style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                              />
                              <span>Module shortcuts</span>
                            </span>
                            <span className="text-[7px] font-extrabold text-[#0A2B6D]">{rightTrackerItems.length} areas</span>
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            {rightTrackerItems.map((rt) => {
                              const RtIcon = rt.icon;
                              return (
                                <Link
                                  key={rt.label}
                                  to={rt.route}
                                  className="block rounded border border-[#0A2B6D]/20 bg-white px-1 py-0.5 transition-all hover:opacity-95"
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
                                  <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white border border-[#0A2B6D]/15">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: '0%', background: TOP_BORDER_GRADIENT }}
                                    />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 6. THREE DEVICES ROW (50% COMPACT): PHONE, PC MONITOR, IPAD — Pure White Inside Writing Boxes */}
                    <div className="grid grid-cols-3 gap-1.5 items-stretch">
                      {[
                        { tag: '01 · PHONE', val: 'Current device data unavailable', to: null },
                        { tag: '02 · PC NDIS', val: 'NDIS update link', to: '/ndis-updates' },
                        { tag: '03 · IPAD', val: 'Weather data unavailable', to: null },
                      ].map((dev, dIdx) => (
                        <div
                          key={dev.tag}
                          className="rounded-lg p-[2px]"
                          style={{ background: getHeaderView(dIdx) }}
                        >
                          <div className="flex h-full flex-col justify-between gap-0.5 rounded-[6px] bg-white p-1 text-center">
                            <div
                              className="gradient-brand rounded px-1 py-0 text-[6.5px] font-extrabold uppercase text-white"
                              style={{ background: getHeaderView(dIdx + 1), color: '#FFFFFF' }}
                            >
                              <span style={{ color: '#FFFFFF' }}>{dev.tag}</span>
                            </div>
                            {dev.to ? (
                              <Link
                                to={dev.to}
                                className="block rounded border border-[#0A2B6D]/20 bg-white px-1 py-0.5 text-center text-[7.5px] font-extrabold text-[#0A2B6D] truncate"
                              >
                                {dev.val}
                              </Link>
                            ) : (
                              <div className="rounded border border-[#0A2B6D]/20 bg-white px-1 py-0.5 text-center text-[7.5px] font-extrabold text-[#0A2B6D] truncate">
                                {dev.val}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DATE PLACED DIRECTLY ABOVE OPEN GOVERNANCE + ACTION BUTTONS ON ONE LINE */}
                  <div className="w-full space-y-1 pt-0.5">
                    <div className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D]/25 bg-white px-2.5 py-0.5 text-[8px] font-extrabold text-[#0A2B6D] whitespace-nowrap">
                      <Calendar className="h-2.5 w-2.5 text-[#0A2B6D]" />
                      <span>Report date: ${new Date().toLocaleDateString('en-AU')} · Source counts only</span>
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
              style={{ background: UNIFORM_SPRAY_BG }}
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

              <div className="rounded-[6px] bg-white px-2 py-0.5 text-center text-[8px] font-extrabold text-[#0A2B6D] whitespace-nowrap">
                Historical compliance and billing trend · Source data unavailable
              </div>

              <div className="h-24 w-full rounded-[6px] bg-white p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={TREND_DATA_2026}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9d5ff" />
                    <XAxis dataKey="month" fontSize={7.5} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <YAxis yAxisId="left" domain={[88, 100]} fontSize={7.5} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
                    <YAxis yAxisId="right" orientation="right" fontSize={7.5} tick={{ fill: '#0A2B6D', fontWeight: 700 }} />
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
              style={{ background: UNIFORM_SPRAY_BG }}
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
                  Compliance assessment by domain
                </span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-white"
                  style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                />
              </div>

              <div className="rounded-[6px] bg-white px-2 py-0.5 text-center text-[8px] font-extrabold text-[#0A2B6D] whitespace-nowrap">
                Verified domain scores are not available in this view
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

            {/* Column 3: Predictive 90 / 60 / 30 / 21 / 14-Day Radar — Pink/Blue/Purple Spray Between Side Border & Words, Dark Blue Writing */}
            <div
            className="lg:col-span-4 flex rounded-xl border-2 border-[#0A2B6D] p-[2.5px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
            >
            <div className="relative flex w-full flex-col justify-between rounded-[9px] bg-white p-1.5 text-left space-y-1 overflow-hidden">
              {/* One-Line Top Spotlight & Predictive Header */}
              <div
                className="gradient-brand flex min-h-[24px] w-full items-center justify-between gap-1.5 rounded-full px-2.5 py-0.5 text-white whitespace-nowrap"
                style={{ background: getHeaderView(4), color: '#FFFFFF' }}
              >
                <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-white">
                  <ShieldCheck className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Upcoming record alerts</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold text-white">
                  <span
                    className="h-2 w-2 rounded-full bg-white"
                    style={{ boxShadow: '0 0 8px 2px #FFFFFF' }}
                  />
                  SOURCE DATA
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

              {/* 50% Smaller Predictive Alert Tiles — Pink/Blue/Purple Spray & Dark Blue Writing Inside */}
              <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
                {filteredAlerts.length === 0 && <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-center text-[8px] font-semibold text-slate-600">No upcoming records are loaded. Review due dates in the source modules.</p>}
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

                            <span className="shrink-0 rounded-full border border-[#0A2B6D] bg-white px-1.5 py-0 text-[7px] font-extrabold text-[#0A2B6D]">
                              {al.horizon}
                            </span>

                            <span className="truncate text-left text-[8px] font-extrabold text-[#0A2B6D]">
                              {al.title}
                            </span>
                          </div>

                          <div className="truncate text-left text-[7.5px] font-bold text-[#0A2B6D]">
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