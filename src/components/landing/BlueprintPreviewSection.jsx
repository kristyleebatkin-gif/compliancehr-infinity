import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileSpreadsheet,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Workflow,
  Lock,
  Layers,
  Tv,
  Radio,
  Music,
  Volume2,
  VolumeX,
  Laptop,
} from 'lucide-react';

import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

const FLOW_TILE_STYLES = [
  { bg: '#FF2E9A', text: '#FFFFFF' },
  { bg: '#38BDF8', text: '#0A2B6D' },
  { bg: '#9333EA', text: '#FFFFFF' },
];

const POP_SONGS = [
  {
    title: 'Neon Compliance Pop Anthem',
    bpm: 124,
    notes: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 880.0],
  },
  {
    title: 'Sunshine Shift Groove',
    bpm: 128,
    notes: [440.0, 554.37, 659.25, 880.0, 783.99, 659.25, 587.33, 659.25],
  },
  {
    title: 'Infinity Synth-Pop Beat',
    bpm: 120,
    notes: [587.33, 739.99, 880.0, 739.99, 659.25, 783.99, 987.77, 880.0],
  },
];

const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) =>
  keys
    .map((k) => byKey[k])
    .filter(Boolean)
    .map((m) => ({ label: m.label, blurb: m.blurb, key: m.key, path: m.key === 'dashboard' ? '/dashboard' : m.path, icon: m.icon }));

const APP_MODULE_GROUPS = [
  {
    title: 'People, intake and profiles',
    modules: pick('dashboard', 'operations-centre', 'my-profile', 'intake', 'our-staff', 'our-participants', 'visual-boards', 'key-contacts', 'volunteering-placements', 'users'),
  },
  {
    title: 'Service delivery and workforce',
    modules: pick('communications', 'incidents', 'incident-analytics', 'risks', 'rostering', 'goals', 'tasks', 'emergency-response'),
  },
  {
    title: 'Compliance, safety and evidence',
    modules: pick('compliance', 'auditor-portal', 'documents', 'company-safe', 'training', 'certificates', 'quality', 'feedback', 'meetings'),
  },
  {
    title: 'Business, finance and growth',
    modules: pick('invoicing', 'quotes', 'receipts', 'procurement', 'assets', 'analytics', 'human-resources', 'crm', 'projects'),
  },
  {
    title: 'Information, providers and access',
    modules: pick('ndis-provider', 'ndis-news', 'equipment-manuals', 'community-council', 'community-referral', 'programs', 'suggestions-hub', 'help', 'user-guides', 'assistant'),
  },
];

const DATA_FLOWS = [
  { steps: ['Intake Centre', 'Staff & Participant Profiles', 'Rostering', 'Communication Centre', 'Invoicing Centre'] },
  { steps: ['Document Vault & Forms', 'Company Safe', 'Details Checks & Reminders', 'Compliance Centre', 'NDIS Provider Portal'] },
  { steps: ['Incident & Risk Reporting', 'Safety Insights & Controls', 'Quality & Improvement', 'Registers & Reports', 'Continuous Improvement'] },
  { steps: ['Tasks & Goal Progress', 'Feedback & Surveys', 'Business Analytics', 'Projects Hub', 'CRM & Growth'] },
];

// Accurate to current permissions in src/lib/roles.js (FULL_ACCESS, OPERATIONS, PERSONAL, PARTICIPANT, AUDITOR/GUEST)
const ACCESS_LEVELS = [
  {
    tvLabel: 'FLAT SCREEN TV 01 · FULL_ACCESS',
    title: 'Provider Admin, Compliance Admin & Management',
    desc: 'Full access across all 46 modules, Company Safe, Users & Permissions, Invoicing, Quotes, Procurement, My Payroll & Business Analytics.',
  },
  {
    tvLabel: 'FLAT SCREEN TV 02 · OPERATIONS',
    title: 'Administration & Team Leaders',
    desc: 'Operational access to Staff & Participant Profiles, Compliance Hub, Quality, Meetings, Assets, Volunteers, CRM, Projects & Checklists (excludes restricted Finance & Company Safe).',
  },
  {
    tvLabel: 'FLAT SCREEN TV 03 · EMPLOYEE / PERSONAL',
    title: 'Employees, Support Workers & Specialist Officers',
    desc: 'Normalized Employee access to My Profile, Employee Directory, Roster & Shifts, Communications, Incidents, Risks, Training, Documents, Receipts & Tasks.',
  },
  {
    tvLabel: 'FLAT SCREEN TV 04 · PARTICIPANT',
    title: 'Participants',
    desc: 'Personal access to My Profile, Participant Profiles, Goal Progress, Visual Boards, Roster & Shifts, Programs & Events, Feedback, Community Hub & NDIS News.',
  },
  {
    tvLabel: 'FLAT SCREEN TV 05 · AUDITOR & GUEST',
    title: 'External NDIS Auditors & Guests',
    desc: 'Auditors are strictly scoped to the consent-verified External Auditor Portal (`auditor-portal`); Guests can explore personal/public tools & request role approval.',
  },
];

export default function BlueprintPreviewSection() {
  const [expandConnections, setExpandConnections] = useState(true);
  const [isPlayingPop, setIsPlayingPop] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [songIndex, setSongIndex] = useState(0);
  const [beatStep, setBeatStep] = useState(0);
  const audioCtxRef = useRef(null);

  const moduleCount = MODULE_DIRECTORY.length;
  const currentSong = POP_SONGS[songIndex % POP_SONGS.length];

  // Pop rhythm engine: drives visual beat + optional Web Audio pop synth
  useEffect(() => {
    if (!isPlayingPop) return undefined;
    const intervalMs = Math.round((60 / currentSong.bpm) * 1000 / 2);
    const timer = setInterval(() => {
      setBeatStep((prev) => {
        const next = (prev + 1) % 8;
        if (soundEnabled && typeof window !== 'undefined') {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioCtx();
              }
              const ctx = audioCtxRef.current;
              if (ctx.state === 'suspended') {
                ctx.resume();
              }
              const now = ctx.currentTime;
              // Pop melody note
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = next % 2 === 0 ? 'triangle' : 'sine';
              osc.frequency.setValueAtTime(currentSong.notes[next], now);
              gain.gain.setValueAtTime(0.06, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now);
              osc.stop(now + 0.19);
            }
          } catch {
            // Ignore audio context autoplay restrictions until user clicks sound button
          }
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlayingPop, soundEnabled, currentSong]);

  const togglePopSound = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSoundEnabled((prev) => !prev);
    setIsPlayingPop(true);
  };

  const nextPopSong = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSongIndex((prev) => (prev + 1) % POP_SONGS.length);
    setIsPlayingPop(true);
  };

  return (
    <section
      id="blueprint"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      {/* Keyframes for the dancing laptops */}
      <style>{`
        @keyframes laptopDanceA {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-4px) rotate(-1.1deg) scale(1.01); }
          50% { transform: translateY(-1px) rotate(0deg) scale(1.015); }
          75% { transform: translateY(-4px) rotate(1.1deg) scale(1.01); }
        }
        @keyframes laptopDanceB {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-4px) rotate(1.1deg) scale(1.01); }
          50% { transform: translateY(-1px) rotate(0deg) scale(1.015); }
          75% { transform: translateY(-4px) rotate(-1.1deg) scale(1.01); }
        }
        .laptop-beat-a {
          animation: laptopDanceA 0.96s infinite ease-in-out;
        }
        .laptop-beat-b {
          animation: laptopDanceB 0.96s infinite ease-in-out;
        }
      `}</style>

      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* "An accurate map..." and Black Writing Under Inside a Stretched App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white px-4 py-3.5 sm:px-6 sm:py-4 text-center space-y-1.5">
            <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
              <span className="text-[#0A2B6D]">An accurate map of the </span>
              <span className="text-[#0A2B6D]">Compliance</span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                HR
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity app
              </span>
            </h2>
            <p
              className="mx-auto w-full text-xs sm:text-sm font-extrabold leading-snug text-black"
              style={{ color: '#000000' }}
            >
              All {moduleCount} current modules, their purpose, access model and connected information flows in one view.
            </p>
          </div>
        </div>

        {/* Stretched Side-to-Side "Current Platform Blueprint" Underneath Writing in App Design Coloured Border */}
        <div
          className="w-full rounded-full p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(1) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Layers className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-center">Current Platform Blueprint · {moduleCount} Connected Modules</span>
          </div>
        </div>

        {/* How Information Connects & Role-Based Access Model — App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white p-4 text-left space-y-3.5">
            {/* Stretched Header Border with White Writing */}
            <div
              className="w-full rounded-2xl p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="gradient-brand flex w-full items-center justify-center gap-2.5 rounded-[13px] px-4 py-2.5 text-white"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <Workflow className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span
                  className="text-xs sm:text-sm md:text-base font-extrabold text-white"
                  style={{ color: '#FFFFFF' }}
                >
                  How Information Connects &amp; Role-Based Access Model
                </span>
              </div>
            </div>

            {expandConnections && (
              <div className="grid gap-4 lg:grid-cols-12">
                {/* Left Column: How Information Connects Automatically */}
                <div
                  className="lg:col-span-6 rounded-2xl p-[3.5px] shadow-2xs flex"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex w-full flex-col justify-between rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Stretched Header in App Design Coloured Border with White Writing */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="gradient-brand flex w-full flex-wrap items-center justify-between gap-2 rounded-[9px] px-4 py-2 text-white"
                        style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                      >
                        <span
                          className="font-editorial text-sm sm:text-base font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          How Information Connects Automatically
                        </span>
                        <span
                          className="rounded-full border border-white bg-white/20 px-3 py-0.5 text-[10px] font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          Zero Double-Entry
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 my-auto">
                      {DATA_FLOWS.map((flow, fIdx) => (
                        <div
                          key={flow.steps[0]}
                          className="rounded-2xl p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 rounded-[13px] bg-white px-3 py-2.5">
                            {flow.steps.map((item, index) => {
                              const idx = fIdx * 5 + index;
                              const flowTile = FLOW_TILE_STYLES[idx % FLOW_TILE_STYLES.length];
                              return (
                                <React.Fragment key={item}>
                                  <div
                                    className="rounded-full p-[2px] shadow-2xs"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <span
                                      className="block rounded-full px-3 py-1 text-[11px] font-extrabold"
                                      style={{
                                        backgroundColor: flowTile.bg,
                                        color: flowTile.text,
                                      }}
                                    >
                                      {item}
                                    </span>
                                  </div>
                                  {index < flow.steps.length - 1 && (
                                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Access Follows Role — Accurate to Current Permissions on Flat Screen TVs */}
                <div
                  className="lg:col-span-6 rounded-2xl p-[3.5px] shadow-2xs flex"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex w-full flex-col justify-between rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Stretched Header in App Design Coloured Border with White Writing */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="gradient-brand flex w-full flex-wrap items-center justify-between gap-2 rounded-[9px] px-4 py-2 text-white"
                        style={{ background: getHeaderView(5), color: '#FFFFFF' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <Lock className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span
                            className="font-editorial text-sm sm:text-base font-extrabold text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            Access Follows Role (Live Flat Screen TVs)
                          </span>
                        </div>
                        <span
                          className="rounded-full border border-white bg-white/20 px-3 py-0.5 text-[10px] font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          Live Role Permissions
                        </span>
                      </div>
                    </div>

                    {/* 5 Role Permission Levels Inside Flat Screen TVs */}
                    <div className="grid grid-cols-1 gap-3">
                      {ACCESS_LEVELS.map((lvl, idx) => {
                        const sym = getSymbolView(idx + 2);
                        const borderCol = getAppBorderView(idx + 2);
                        const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                        return (
                          <div key={lvl.title} className="flex flex-col items-center">
                            {/* Flat Screen TV Bezel */}
                            <div
                              className="w-full rounded-2xl border-[3px] bg-[#0A2B6D] p-2 shadow-md"
                              style={{ borderColor: borderCol }}
                            >
                              {/* Top TV Status Bar */}
                              <div className="mb-1.5 flex items-center justify-between px-2">
                                <span className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                                  <Tv className="h-3 w-3 text-[#00C6FF]" />
                                  {lvl.tvLabel}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[8.5px] font-extrabold text-white">
                                  <Radio className="h-2.5 w-2.5 text-[#FF2E9A]" />
                                  ACTIVE RLS
                                </span>
                              </div>

                              {/* Inner Flat Screen TV Display */}
                              <div
                                className="rounded-xl p-[2.5px]"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <div
                                  className="flex flex-col gap-1.5 rounded-[10px] p-2.5 text-[#0A2B6D]"
                                  style={{ background: sprayBg }}
                                >
                                  <div
                                    className="w-full rounded-xl p-[2px] shadow-2xs"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div className="flex items-center gap-2 rounded-[9px] bg-white px-2.5 py-1.5">
                                      <span
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <ShieldCheck className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                                      </span>
                                      <span className="text-xs font-extrabold leading-tight text-[#0A2B6D]">
                                        {lvl.title}
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    className="px-1 text-[11px] font-bold leading-snug text-black"
                                    style={{ color: '#000000' }}
                                  >
                                    {lvl.desc}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Flat Screen TV Stand Neck & Pedestal */}
                            <div className="h-1.5 w-8 bg-[#0A2B6D]" />
                            <div
                              className="h-1.5 w-20 rounded-full border border-[#0A2B6D]"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Smaller Minimise Button on Bottom Right of Section */}
            <div className="flex w-full justify-end pt-1">
              <div
                className="rounded-full p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <button
                  type="button"
                  onClick={() => setExpandConnections((v) => !v)}
                  className="gradient-brand inline-flex min-h-[26px] items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white transition-all hover:opacity-95"
                  style={{ background: getHeaderView(2), color: '#FFFFFF' }}
                >
                  <span style={{ color: '#FFFFFF' }}>
                    {expandConnections ? 'Minimise' : 'Expand'}
                  </span>
                  {expandConnections ? (
                    <ChevronUp className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Workspace Groups — Modular Titles as Laptops (1 Plays Pop Songs & All Others Move With Beat & Slightly Dance) */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white p-4 space-y-4 text-left">
            {/* Stretched Header Border for Organisation Live Workspace */}
            <div
              className="w-full rounded-2xl p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-[13px] px-4 py-2.5 text-white"
                style={{ background: getHeaderView(7) }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                    <LayoutDashboard className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-extrabold text-white">
                    Organisation Live Workspace · Interactive Dancing Laptops
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Pop Music Controller Pill */}
                  <div
                    className="rounded-full p-[2px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <button
                      type="button"
                      onClick={togglePopSound}
                      className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-white"
                      style={{ background: getHeaderView(4), color: '#FFFFFF' }}
                    >
                      {soundEnabled ? (
                        <Volume2 className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                      ) : (
                        <VolumeX className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                      )}
                      <span style={{ color: '#FFFFFF' }}>
                        {soundEnabled ? 'Pop Beat Audio: ON ♫' : 'Play Pop Song Audio ♫'}
                      </span>
                    </button>
                  </div>

                  <div
                    className="rounded-full p-[2px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <span
                      className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-white"
                      style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                        <FileSpreadsheet className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>Spreadsheet Exchange</span>
                    </span>
                  </div>
                  <div
                    className="rounded-full p-[2px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <span
                      className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-white"
                      style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                        <Sparkles className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>AI Assistant</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {APP_MODULE_GROUPS.map((group, gIdx) => (
                <div
                  key={group.title}
                  className="rounded-2xl p-[3.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Stretched Group Header Border */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="gradient-brand flex w-full flex-wrap items-center justify-between gap-2 rounded-[9px] px-4 py-2 text-white"
                        style={{ background: getHeaderView(gIdx), color: '#FFFFFF' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <Laptop className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span
                            className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {group.title}
                          </span>
                        </div>
                        <span
                          className="rounded-full border border-white bg-white/20 px-3 py-0.5 text-xs font-extrabold text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {group.modules.length} laptop modules
                        </span>
                      </div>
                    </div>

                    {/* Grid of Laptops — Laptop #1 Plays Pop Songs & All Others Move With Beat and Slightly Dance */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr pt-1">
                      {group.modules.map((mod, mIdx) => {
                        const Icon = mod.icon || ShieldCheck;
                        const idx = gIdx * 10 + mIdx;
                        const isPopPlayerLaptop = gIdx === 0 && mIdx === 0;
                        const sym = getSymbolView(idx);
                        const borderCol = getAppBorderView(idx);
                        const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                        const danceClass = isPlayingPop
                          ? idx % 2 === 0
                            ? 'laptop-beat-a'
                            : 'laptop-beat-b'
                          : '';

                        return (
                          <div
                            key={mod.key}
                            className={`flex h-full flex-col items-center justify-between ${danceClass}`}
                            style={{
                              animationDelay: `${(idx % 6) * 0.12}s`,
                            }}
                          >
                            {/* Top Laptop Lid & Screen */}
                            <Link
                              to={mod.path}
                              className="group flex w-full flex-1 flex-col rounded-t-2xl border-[3px] bg-[#0A2B6D] p-2 shadow-md transition-shadow hover:shadow-lg"
                              style={{ borderColor: borderCol }}
                            >
                              {/* Laptop Webcam & Bezel Bar */}
                              <div className="mb-1.5 flex items-center justify-between px-2">
                                <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                                  <Laptop className="h-2.5 w-2.5 text-[#00C6FF]" />
                                  {isPopPlayerLaptop ? 'DJ POP PLAYER LAPTOP ♫' : `LAPTOP ${idx + 1}`}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-extrabold text-[#FF6EDB]">
                                  {isPopPlayerLaptop ? '♪ ♫ LIVE POP' : '♪ DANCING'}
                                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                </span>
                              </div>

                              {/* Inner Laptop Screen */}
                              <div
                                className="flex flex-1 rounded-xl p-[2.5px]"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <div
                                  className="flex h-full w-full flex-col justify-between gap-2 rounded-[10px] p-2.5 text-[#0A2B6D]"
                                  style={{ background: sprayBg }}
                                >
                                  {/* Module Header in App Design Coloured Border with White Background */}
                                  <div
                                    className="w-full rounded-xl p-[2px] shadow-2xs"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div className="flex items-center gap-2 rounded-[9px] bg-white px-2.5 py-1.5">
                                      <span
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                                      </span>
                                      <span className="min-w-0 flex-1 text-xs font-extrabold leading-tight text-[#0A2B6D]">
                                        {mod.label}
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    className="flex-1 px-1 text-[11px] font-bold leading-snug text-black"
                                    style={{ color: '#000000' }}
                                  >
                                    {mod.blurb}
                                  </div>

                                  {/* If Lead DJ Laptop (#1): Show Pop Song Player & Equalizer */}
                                  {isPopPlayerLaptop ? (
                                    <div
                                      className="w-full rounded-xl p-[2px] shadow-2xs"
                                      style={{ background: TOP_BORDER_GRADIENT }}
                                    >
                                      <div
                                        className="gradient-brand flex flex-col gap-1.5 rounded-[9px] px-2.5 py-2 text-white"
                                        style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span
                                            className="flex items-center gap-1 text-[10px] font-extrabold text-white"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            <Music className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                                            Now Playing Pop Song:
                                          </span>
                                          <span
                                            className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold text-white"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            {currentSong.bpm} BPM
                                          </span>
                                        </div>
                                        <div
                                          className="text-[10.5px] font-extrabold text-white"
                                          style={{ color: '#FFFFFF' }}
                                        >
                                          ♫ {currentSong.title}
                                        </div>
                                        <div className="flex items-center justify-between gap-1.5 pt-0.5">
                                          <button
                                            type="button"
                                            onClick={togglePopSound}
                                            className="rounded-full border border-white bg-white/20 px-2 py-0.5 text-[9.5px] font-extrabold text-white hover:bg-white/30"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            {soundEnabled ? 'Mute Pop Song' : 'Unmute Pop Song ♫'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={nextPopSong}
                                            className="rounded-full border border-white bg-white/20 px-2 py-0.5 text-[9.5px] font-extrabold text-white hover:bg-white/30"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            Next Pop Hit ▸
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* All Other Laptops Show Synchronized Beat Equalizer */
                                    <div className="flex items-center justify-between rounded-lg border border-[#0A2B6D]/20 bg-white/80 px-2.5 py-1">
                                      <span className="text-[9.5px] font-extrabold text-[#5A00D6]">
                                        ♪ Moving to {currentSong.title}
                                      </span>
                                      <div className="flex items-end gap-0.5 h-3">
                                        {[0, 1, 2, 3].map((b) => (
                                          <span
                                            key={b}
                                            className="w-1 rounded-full transition-all duration-150"
                                            style={{
                                              height: `${((beatStep + idx + b) % 4) * 3 + 4}px`,
                                              backgroundColor: b % 2 === 0 ? '#FF2E9A' : '#0072FF',
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>

                            {/* Laptop Keyboard Base & Trackpad Lip */}
                            <div className="flex w-[104%] flex-col items-center">
                              <div
                                className="flex h-3 w-full items-center justify-center rounded-b-xl border-2 border-[#0A2B6D] shadow-sm"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <span className="h-1 w-10 rounded-full bg-white/90" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}