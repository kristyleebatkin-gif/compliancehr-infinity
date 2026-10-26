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
  Play,
  Youtube,
  CheckCircle2,
} from 'lucide-react';

import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

const FLOW_TILE_STYLES = [
  { bg: '#FF2E9A', text: '#FFFFFF' },
  { bg: '#38BDF8', text: '#0A2B6D' },
  { bg: '#9333EA', text: '#FFFFFF' },
  { bg: '#0072FF', text: '#FFFFFF' },
  { bg: '#5A00D6', text: '#FFFFFF' },
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

// Curated YouTube Music Clips so every laptop displays a distinct music clip screen at the bottom
const YOUTUBE_CLIPS = [
  { title: 'Dua Lipa — Levitating', videoId: 'TUVcZfQe-Kw', channel: 'YouTube Pop HD' },
  { title: 'The Weeknd — Blinding Lights', videoId: '4NRXx6U8ABQ', channel: 'YouTube Synthwave' },
  { title: 'Bruno Mars — 24K Magic', videoId: 'UqyT8IEBkvY', channel: 'YouTube Funk Hits' },
  { title: 'Mark Ronson ft. Bruno Mars — Uptown Funk', videoId: 'OPf0YbXqDm0', channel: 'YouTube Party HD' },
  { title: 'Justin Timberlake — Can’t Stop the Feeling!', videoId: 'ru0K8uYEZWw', channel: 'YouTube Feel-Good' },
  { title: 'Pharrell Williams — Happy', videoId: 'ZbZSe6N_BXs', channel: 'YouTube Sunshine' },
  { title: 'Katy Perry — Roar', videoId: 'CevxZvSJLk8', channel: 'YouTube Anthems' },
  { title: 'Taylor Swift — Shake It Off', videoId: 'nfWlot6h_JM', channel: 'YouTube Chart HD' },
  { title: 'Ed Sheeran — Shape of You', videoId: 'JGwWNGJdvx8', channel: 'YouTube Acoustic' },
  { title: 'Harry Styles — As It Was', videoId: 'H5v3kku4y6Q', channel: 'YouTube Indie Pop' },
  { title: 'Coldplay — Higher Power', videoId: '3lfnR7OhZY8', channel: 'YouTube Arena HD' },
  { title: 'Daft Punk — Get Lucky', videoId: '5NV6Rdv1a3I', channel: 'YouTube Disco' },
  { title: 'Calvin Harris — Feel So Close', videoId: 'dGghkjpNCQ8', channel: 'YouTube Dance HD' },
  { title: 'Miley Cyrus — Flowers', videoId: 'G7KNmW9a75Y', channel: 'YouTube Global' },
  { title: 'OneRepublic — Counting Stars', videoId: 'hT_nvWreIhg', channel: 'YouTube Pop Rock' },
  { title: 'Maroon 5 — Sugar', videoId: '09R8_2nJtjg', channel: 'YouTube Spotlight' },
];

const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) =>
  keys
    .map((k) => byKey[k])
    .filter(Boolean)
    .map((m) => ({
      label: m.label,
      blurb: m.blurb,
      key: m.key,
      path: m.key === 'dashboard' ? '/dashboard' : m.path,
      icon: m.icon,
    }));

const APP_MODULE_GROUPS = [
  {
    title: 'People, intake and profiles',
    modules: pick(
      'dashboard',
      'operations-centre',
      'my-profile',
      'intake',
      'our-staff',
      'our-participants',
      'visual-boards',
      'key-contacts',
      'volunteering-placements',
      'users'
    ),
    youtubeFillers: [
      {
        id: 'yt-filler-1',
        label: 'YouTube Stage 01',
        blurb: 'Live YouTube Pop Stream synced to your workspace beat — Dua Lipa · Levitating.',
        clipTitle: 'Dua Lipa — Levitating (Official Clip)',
        videoId: 'TUVcZfQe-Kw',
        visibilityClass: 'flex',
      },
      {
        id: 'yt-filler-2',
        label: 'YouTube Stage 02',
        blurb: 'Official YouTube Synthwave HD Music Clip — The Weeknd · Blinding Lights.',
        clipTitle: 'The Weeknd — Blinding Lights (Official Clip)',
        videoId: '4NRXx6U8ABQ',
        visibilityClass: 'flex',
      },
    ],
  },
  {
    title: 'Service delivery and workforce',
    modules: pick(
      'communications',
      'incidents',
      'incident-analytics',
      'risks',
      'rostering',
      'goals',
      'tasks',
      'emergency-response'
    ),
    youtubeFillers: [
      {
        id: 'yt-filler-3',
        label: 'YouTube Stage 03',
        blurb: 'Service Delivery Groove & Workforce Energy — Mark Ronson ft. Bruno Mars · Uptown Funk.',
        clipTitle: 'Mark Ronson ft. Bruno Mars — Uptown Funk',
        videoId: 'OPf0YbXqDm0',
        visibilityClass: 'flex',
      },
      {
        id: 'yt-filler-4',
        label: 'YouTube Stage 04',
        blurb: 'Feel-Good Shift Pop Channel — Justin Timberlake · Can’t Stop the Feeling!',
        clipTitle: 'Justin Timberlake — Can’t Stop the Feeling!',
        videoId: 'ru0K8uYEZWw',
        visibilityClass: 'hidden sm:flex lg:hidden',
      },
    ],
  },
  {
    title: 'Compliance, safety and evidence',
    modules: pick(
      'compliance',
      'auditor-portal',
      'documents',
      'company-safe',
      'training',
      'certificates',
      'quality',
      'feedback',
      'meetings'
    ),
    youtubeFillers: [
      {
        id: 'yt-filler-5',
        label: 'YouTube Stage 05',
        blurb: 'Audit-Ready Celebration Music Clip — Pharrell Williams · Happy.',
        clipTitle: 'Pharrell Williams — Happy (Official Clip)',
        videoId: 'ZbZSe6N_BXs',
        visibilityClass: 'hidden sm:flex lg:hidden',
      },
    ],
  },
  {
    title: 'Business, finance and growth',
    modules: pick(
      'invoicing',
      'quotes',
      'receipts',
      'procurement',
      'assets',
      'analytics',
      'human-resources',
      'crm',
      'projects'
    ),
    youtubeFillers: [
      {
        id: 'yt-filler-6',
        label: 'YouTube Stage 06',
        blurb: 'Executive Finance & Growth Pop Stream — Bruno Mars · 24K Magic.',
        clipTitle: 'Bruno Mars — 24K Magic (Official Clip)',
        videoId: 'UqyT8IEBkvY',
        visibilityClass: 'hidden sm:flex lg:hidden',
      },
    ],
  },
  {
    title: 'Information, providers and access',
    modules: pick(
      'ndis-provider',
      'ndis-news',
      'equipment-manuals',
      'community-council',
      'community-referral',
      'programs',
      'suggestions-hub',
      'help',
      'user-guides',
      'assistant'
    ),
    youtubeFillers: [
      {
        id: 'yt-filler-7',
        label: 'YouTube Stage 07',
        blurb: 'Provider Network Indie Pop Stream — Harry Styles · As It Was.',
        clipTitle: 'Harry Styles — As It Was (Official Clip)',
        videoId: 'H5v3kku4y6Q',
        visibilityClass: 'flex',
      },
      {
        id: 'yt-filler-8',
        label: 'YouTube Stage 08',
        blurb: 'Infinity Assistant Live Arena Clip — Coldplay · Higher Power.',
        clipTitle: 'Coldplay — Higher Power (Official Clip)',
        videoId: '3lfnR7OhZY8',
        visibilityClass: 'flex',
      },
    ],
  },
];

const DATA_FLOWS = [
  {
    label: 'Flow 01 · Intake to Invoicing Pipeline',
    steps: ['Intake Centre', 'Staff & Participant Profiles', 'Rostering', 'Communication Centre', 'Invoicing Centre'],
  },
  {
    label: 'Flow 02 · Vault to NDIS Commission Pipeline',
    steps: ['Document Vault & Forms', 'Company Safe', 'Details Checks & Reminders', 'Compliance Centre', 'NDIS Provider Portal'],
  },
  {
    label: 'Flow 03 · Safety to Continuous Improvement Pipeline',
    steps: ['Incident & Risk Reporting', 'Safety Insights & Controls', 'Quality & Improvement', 'Registers & Reports', 'Continuous Improvement'],
  },
  {
    label: 'Flow 04 · Goals to Business Growth Pipeline',
    steps: ['Tasks & Goal Progress', 'Feedback & Surveys', 'Business Analytics', 'Projects Hub', 'CRM & Growth'],
  },
  {
    label: 'Flow 05 · HR Onboarding to Audit Readiness Pipeline',
    steps: ['Employee Intake', 'HR Hub & Contracts', 'Training & Certificates', 'My Payroll & Payslips', 'External Auditor Portal'],
  },
];

// Channel 29 for External NDIS Auditors & Guests, without repeating "Auditor Portal" twice
const ACCESS_LEVELS = [
  {
    channelBadge: 'CHANNEL 7 · LIVE HD',
    channelProgram: 'Ch 7 · Executive Governance',
    title: 'Provider Admin, Compliance Admin & Management',
    scopeBadge: 'FULL_ACCESS · All 46 Connected Modules',
    desc: 'Unrestricted access across all 46 modules, Company Safe, Users & Permissions, Invoicing, Quotes, Procurement, My Payroll & Business Analytics.',
  },
  {
    channelBadge: 'CHANNEL 9 · LIVE HD',
    channelProgram: 'Ch 9 · Daily Operations',
    title: 'Administration & Team Leaders',
    scopeBadge: 'OPERATIONS · 40 Operational Modules',
    desc: 'Operational access to Staff & Participant Profiles, Compliance Hub, Quality, Meetings, Assets, Volunteers, CRM, Projects & Checklists.',
  },
  {
    channelBadge: 'CHANNEL 10 · LIVE HD',
    channelProgram: 'Ch 10 · Frontline Workforce',
    title: 'Employees, Support Workers & Specialist Officers',
    scopeBadge: 'EMPLOYEE / PERSONAL · 31 Workforce Modules',
    desc: 'Normalized Employee access to My Profile, Employee Directory, Roster & Shifts, Communications, Incidents, Risks, Training, Documents, Receipts & Tasks.',
  },
  {
    channelBadge: 'CHANNEL 2 (ABC) · LIVE HD',
    channelProgram: 'Ch 2 · Participant Portal',
    title: 'Participants & Nominees',
    scopeBadge: 'PARTICIPANT · 22 Personal & Support Modules',
    desc: 'Personal access to My Profile, Participant Profiles, Goal Progress, Visual Boards, Roster & Shifts, Programs & Events, Feedback, Community Hub & NDIS News.',
  },
  {
    channelBadge: 'CHANNEL 29 · LIVE HD',
    channelProgram: 'Ch 29 · Verification & Guest',
    title: 'External NDIS Auditors & Guests',
    scopeBadge: 'AUDITOR & GUEST · Consent-Gated Access',
    desc: 'Auditors have dedicated, consent-verified read-only access in the External Auditor Portal, while Guests explore public tools and request role approval.',
  },
];

// Reusable uniform section/group header bar so every header with writing in Accurate Map is the exact same size
function UniformBlueprintHeader({ icon: Icon, title, badgeText, viewIndex = 0 }) {
  return (
    <div
      className="w-full rounded-2xl p-[3px] shadow-2xs"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div
        className="gradient-brand flex min-h-[48px] w-full flex-wrap items-center justify-between gap-2.5 rounded-[13px] px-4 py-2 text-white"
        style={{ background: getHeaderView(viewIndex), color: '#FFFFFF' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Icon className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
          </span>
          <span
            className="text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
            style={{ color: '#FFFFFF' }}
          >
            {title}
          </span>
        </div>
        {badgeText ? (
          <span
            className="rounded-full border border-white bg-white/20 px-3 py-0.5 text-[10.5px] font-extrabold text-white"
            style={{ color: '#FFFFFF' }}
          >
            {badgeText}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function BlueprintPreviewSection() {
  const [expandConnections, setExpandConnections] = useState(true);
  const [isPlayingPop, setIsPlayingPop] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [songIndex] = useState(0);
  const [beatStep, setBeatStep] = useState(0);
  const [activeVideoLaptopKey, setActiveVideoLaptopKey] = useState('yt-filler-1');
  const audioCtxRef = useRef(null);

  const moduleCount = MODULE_DIRECTORY.length;
  const currentSong = POP_SONGS[songIndex % POP_SONGS.length];

  // Pop rhythm engine: drives visual beat + optional Web Audio pop synth
  useEffect(() => {
    if (!isPlayingPop) return undefined;
    const intervalMs = Math.round(((60 / currentSong.bpm) * 1000) / 2);
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
            // Ignore autoplay restriction until user clicks sound button
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

  return (
    <section
      id="blueprint"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      {/* Keyframes for slow left-to-right connected flow movement & dancing laptops */}
      <style>{`
        @keyframes flowSlideLeftToRight {
          0% { transform: translateX(-14px); }
          50% { transform: translateX(14px); }
          100% { transform: translateX(-14px); }
        }
        .flow-glide-ltr {
          animation: flowSlideLeftToRight 7.5s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes laptopDanceA {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-2.5px) rotate(-0.6deg) scale(1.006); }
          50% { transform: translateY(-1px) rotate(0deg) scale(1.01); }
          75% { transform: translateY(-2.5px) rotate(0.6deg) scale(1.006); }
        }
        @keyframes laptopDanceB {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-2.5px) rotate(0.6deg) scale(1.006); }
          50% { transform: translateY(-1px) rotate(0deg) scale(1.01); }
          75% { transform: translateY(-2.5px) rotate(-0.6deg) scale(1.006); }
        }
        .laptop-beat-a {
          animation: laptopDanceA 1.15s infinite ease-in-out;
        }
        .laptop-beat-b {
          animation: laptopDanceB 1.15s infinite ease-in-out;
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

        {/* Uniform Header #1: Current Platform Blueprint */}
        <UniformBlueprintHeader
          icon={Layers}
          title={`Current Platform Blueprint · ${moduleCount} Connected Modules`}
          badgeText="100% Connected Architecture"
          viewIndex={1}
        />

        {/* How Information Connects & Role-Based Access Model — App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white p-4 text-left space-y-3.5">
            {/* Uniform Header #2: How Information Connects & Role-Based Access Model */}
            <UniformBlueprintHeader
              icon={Workflow}
              title="How Information Connects & Role-Based Access Model"
              badgeText="5 Live Pipelines + 5 TV Channels"
              viewIndex={2}
            />

            {expandConnections && (
              <div className="grid gap-4 lg:grid-cols-12 items-stretch">
                {/* Left Column: How Information Connects Automatically */}
                <div
                  className="lg:col-span-6 rounded-2xl p-[3.5px] shadow-2xs flex"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex w-full flex-col justify-between rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Uniform Header #3 */}
                    <UniformBlueprintHeader
                      icon={Workflow}
                      title="How Information Connects Automatically"
                      badgeText="Live Left → Right Sync"
                      viewIndex={0}
                    />

                    <div className="flex flex-1 flex-col justify-between gap-3">
                      {DATA_FLOWS.map((flow, fIdx) => (
                        <div
                          key={flow.label}
                          className="rounded-2xl p-[2.5px] shadow-2xs overflow-hidden"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div
                            className="flex flex-col items-center justify-center gap-2 rounded-[13px] px-4 py-3 text-center"
                            style={{ background: UNIFORM_SPRAY_BG }}
                          >
                            <span className="rounded-full border border-[#0A2B6D]/20 bg-white px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                              {flow.label}
                            </span>

                            {/* Connected Tiles Moving Together Slowly Left to Right */}
                            <div
                              className="flow-glide-ltr flex flex-wrap items-center justify-center gap-1.5 py-1"
                              style={{ animationDelay: `${fIdx * 0.6}s` }}
                            >
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
                                        className="block rounded-full px-3 py-1 text-[11px] font-extrabold whitespace-nowrap"
                                        style={{
                                          backgroundColor: flowTile.bg,
                                          color: flowTile.text,
                                        }}
                                      >
                                        {item}
                                      </span>
                                    </div>
                                    {index < flow.steps.length - 1 && (
                                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#0A2B6D]" />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Access Follows Role — Centered on Flat Screen TVs Tuned to Channels (Ch 7, 9, 10, 2, 29) */}
                <div
                  className="lg:col-span-6 rounded-2xl p-[3.5px] shadow-2xs flex"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex w-full flex-col justify-between rounded-[13px] bg-white p-3.5 space-y-3">
                    {/* Uniform Header #4 */}
                    <UniformBlueprintHeader
                      icon={Lock}
                      title="Access Follows Role (Live TV Channels)"
                      badgeText="Channels 7 · 9 · 10 · 2 · 29"
                      viewIndex={5}
                    />

                    {/* 5 Role Permission Levels Centered Inside Flat Screen TVs on Channels */}
                    <div className="grid grid-cols-1 gap-3">
                      {ACCESS_LEVELS.map((lvl, idx) => {
                        const sym = getSymbolView(idx + 2);
                        const borderCol = getAppBorderView(idx + 2);
                        return (
                          <div key={lvl.title} className="flex flex-col items-center">
                            {/* Flat Screen TV Bezel */}
                            <div
                              className="w-full rounded-2xl border-[3px] bg-[#0A2B6D] p-2.5 shadow-md"
                              style={{ borderColor: borderCol }}
                            >
                              {/* Top TV Channel & Broadcast Bar */}
                              <div className="mb-1.5 flex items-center justify-between px-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                                  <Tv className="h-3.5 w-3.5 text-[#00C6FF]" />
                                  {lvl.channelBadge}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[9px] font-extrabold text-white">
                                  <Radio className="h-2.5 w-2.5 text-[#FF2E9A]" />
                                  {lvl.channelProgram}
                                </span>
                              </div>

                              {/* Inner Flat Screen TV Display — Centered in the Middle of the Screen */}
                              <div
                                className="rounded-xl p-[2.5px]"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <div
                                  className="flex flex-col items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-center text-[#0A2B6D]"
                                  style={{ background: UNIFORM_SPRAY_BG }}
                                >
                                  {/* Role Scope Pill */}
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6] shadow-2xs"
                                    style={{ borderColor: borderCol }}
                                  >
                                    <CheckCircle2 className="h-3 w-3 text-[#FF2E9A]" />
                                    {lvl.scopeBadge}
                                  </span>

                                  {/* Centered Role Heading Box */}
                                  <div
                                    className="w-full max-w-xl rounded-xl p-[2px] shadow-2xs"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div className="flex min-h-[42px] items-center justify-center gap-2 rounded-[9px] bg-white px-3 py-1.5 text-center">
                                      <span
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <ShieldCheck className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                                      </span>
                                      <span className="text-xs sm:text-sm font-extrabold leading-tight text-[#0A2B6D]">
                                        {lvl.title}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Centered Middle Description */}
                                  <p
                                    className="mx-auto max-w-xl text-center text-[11px] font-extrabold leading-snug text-black"
                                    style={{ color: '#000000' }}
                                  >
                                    {lvl.desc}
                                  </p>
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

        {/* Organisation Live Workspace — Uniform Header + Clean Action Row + Identically Designed Laptops with Screens at the Bottom */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white p-4 space-y-4 text-left">
            {/* Uniform Header #5: Organisation Live Workspace */}
            <UniformBlueprintHeader
              icon={LayoutDashboard}
              title="Organisation Live Workspace · Interactive Laptops & YouTube Music Clips"
              badgeText="All Laptops Designed Identically"
              viewIndex={7}
            />

            {/* Clean Symmetrical 3-Tile Action Row Below Header (Fixes the First Two Tiles / Header Crowding) */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div
                className="rounded-xl p-[2.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <button
                  type="button"
                  onClick={togglePopSound}
                  className="gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 text-xs font-extrabold text-white"
                  style={{ background: getHeaderView(4), color: '#FFFFFF' }}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
                  ) : (
                    <VolumeX className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
                  )}
                  <span style={{ color: '#FFFFFF' }}>
                    {soundEnabled ? 'Pop Beat Audio: ON ♫' : 'Play Pop Song Audio ♫'}
                  </span>
                </button>
              </div>

              <div
                className="rounded-xl p-[2.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 text-xs font-extrabold text-white"
                  style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                >
                  <FileSpreadsheet className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Spreadsheet Exchange</span>
                </div>
              </div>

              <div
                className="rounded-xl p-[2.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 text-xs font-extrabold text-white"
                  style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                >
                  <Sparkles className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>24/7 AI Assistant</span>
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
                    {/* Uniform Group Header — Exact Same Size as All Other Blueprint Headers */}
                    <UniformBlueprintHeader
                      icon={Laptop}
                      title={group.title}
                      badgeText={`${group.modules.length} Live Modules + YouTube Stage Laptops`}
                      viewIndex={gIdx}
                    />

                    {/* Grid of Laptops — Every Laptop (Including First Two Tiles & Filler Laptops) Has Identical Design & Screen at the Bottom */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr pt-1 items-stretch">
                      {group.modules.map((mod, mIdx) => {
                        const Icon = mod.icon || ShieldCheck;
                        const idx = gIdx * 10 + mIdx;
                        const sym = getSymbolView(idx);
                        const borderCol = getAppBorderView(idx);
                        const ytClip = YOUTUBE_CLIPS[idx % YOUTUBE_CLIPS.length];
                        const isEmbedOpen = activeVideoLaptopKey === mod.key;
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
                            <div
                              className="group flex w-full flex-1 flex-col rounded-t-2xl border-[3px] bg-[#0A2B6D] p-2.5 shadow-md transition-shadow hover:shadow-lg"
                              style={{ borderColor: borderCol }}
                            >
                              {/* Laptop Webcam & Bezel Bar */}
                              <div className="mb-1.5 flex h-[18px] items-center justify-between px-2">
                                <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                                  <Laptop className="h-2.5 w-2.5 text-[#00C6FF]" />
                                  LAPTOP {String(idx + 1).padStart(2, '0')} · LIVE MODULE
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-extrabold text-[#FF6EDB]">
                                  <Youtube className="h-3 w-3 text-[#FF2E9A]" />
                                  CLIP #{idx + 1}
                                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                </span>
                              </div>

                              {/* Inner Laptop Screen — Uniform Top Header, Centered Writing, and YouTube Video Screen at the Bottom */}
                              <div
                                className="flex flex-1 rounded-xl p-[2.5px]"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <div
                                  className="flex h-full w-full flex-col items-center justify-between gap-2.5 rounded-[10px] p-3 text-center text-[#0A2B6D]"
                                  style={{ background: UNIFORM_SPRAY_BG }}
                                >
                                  {/* 1. Top: Fixed-Height Centered Module Header Box (First Two Tiles & All Others Match Size) */}
                                  <Link
                                    to={mod.path}
                                    className="w-full rounded-xl p-[2.5px] shadow-2xs transition-transform hover:scale-[1.01]"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[9px] bg-white px-3 py-1.5 text-center">
                                      <span
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                                      </span>
                                      <span className="text-xs sm:text-sm font-extrabold leading-tight text-[#0A2B6D]">
                                        {mod.label}
                                      </span>
                                    </div>
                                  </Link>

                                  {/* 2. Middle: Crisp Centered Module Writing & Open Module Link */}
                                  <Link
                                    to={mod.path}
                                    className="flex min-h-[68px] w-full flex-col items-center justify-between rounded-xl border border-[#0A2B6D]/15 bg-white/95 px-3 py-2 text-center shadow-2xs"
                                  >
                                    <p
                                      className="text-center text-[11px] font-extrabold leading-snug text-black"
                                      style={{ color: '#000000' }}
                                    >
                                      {mod.blurb}
                                    </p>
                                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#0072FF] px-3 py-0.5 text-[9.5px] font-extrabold text-white">
                                      <span style={{ color: '#FFFFFF' }}>Open {mod.label}</span>
                                      <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                                    </span>
                                  </Link>

                                  {/* 3. Bottom: YouTube Music Video Screen at the Bottom of Every Laptop */}
                                  <div className="w-full space-y-1.5">
                                    <div className="w-full overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] shadow-sm aspect-video">
                                      {isEmbedOpen ? (
                                        <iframe
                                          title={ytClip.title}
                                          src={`https://www.youtube-nocookie.com/embed/${ytClip.videoId}?autoplay=1&rel=0`}
                                          className="h-full w-full"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        />
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setActiveVideoLaptopKey(mod.key)}
                                          className="group/yt relative flex h-full w-full flex-col items-center justify-center gap-1.5 p-2.5 text-center text-white"
                                          style={{ background: getHeaderView(idx) }}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#FF2E9A] text-white shadow-md transition-transform group-hover/yt:scale-110">
                                              <Play className="h-4 w-4 fill-white text-white" />
                                            </span>
                                            <div className="flex items-end gap-0.5 h-4">
                                              {[0, 1, 2, 3].map((b) => (
                                                <span
                                                  key={b}
                                                  className="w-1 rounded-full bg-white transition-all duration-150"
                                                  style={{
                                                    height: `${((beatStep + idx + b) % 4) * 3 + 4}px`,
                                                  }}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                          <span
                                            className="text-[10.5px] font-extrabold leading-tight text-white px-2"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            ♫ {ytClip.title}
                                          </span>
                                          <span
                                            className="rounded-full border border-white/60 bg-white/20 px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            {ytClip.channel} · Click to Play
                                          </span>
                                        </button>
                                      )}
                                    </div>

                                    {/* Bottom Screen Control Bar */}
                                    <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#0A2B6D]/20 bg-white px-2.5 py-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveVideoLaptopKey(isEmbedOpen ? null : mod.key)
                                        }
                                        className="inline-flex items-center gap-1 rounded-full bg-[#5A00D6] px-2.5 py-0.5 text-[9px] font-extrabold text-white"
                                        style={{ color: '#FFFFFF' }}
                                      >
                                        <Play className="h-2.5 w-2.5 fill-white text-white" />
                                        <span style={{ color: '#FFFFFF' }}>
                                          {isEmbedOpen ? 'Stop Clip' : 'Play Clip'}
                                        </span>
                                      </button>
                                      <a
                                        href={`https://www.youtube.com/watch?v=${ytClip.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-extrabold text-[#0072FF] underline"
                                      >
                                        YouTube ↗
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

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

                      {/* Filler YouTube Video Laptops in Blank Grid Spaces — Designed the Exact Same as Module Laptops */}
                      {group.youtubeFillers.map((yt, yIdx) => {
                        const idx = gIdx * 10 + group.modules.length + yIdx;
                        const sym = getSymbolView(idx);
                        const borderCol = getAppBorderView(idx);
                        const isLive = activeVideoLaptopKey === yt.id;
                        return (
                          <div
                            key={yt.id}
                            className={`${yt.visibilityClass} h-full flex-col items-center justify-between laptop-beat-a`}
                          >
                            {/* Top Laptop Lid & Screen */}
                            <div
                              className="flex w-full flex-1 flex-col rounded-t-2xl border-[3px] bg-[#0A2B6D] p-2.5 shadow-md"
                              style={{ borderColor: borderCol }}
                            >
                              {/* Laptop Webcam & Bezel Bar */}
                              <div className="mb-1.5 flex h-[18px] items-center justify-between px-2">
                                <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                                  <Laptop className="h-2.5 w-2.5 text-[#00C6FF]" />
                                  LAPTOP {String(idx + 1).padStart(2, '0')} · YOUTUBE STAGE
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-extrabold text-[#FF6EDB]">
                                  <Youtube className="h-3 w-3 text-[#FF2E9A]" />
                                  CLIP #{idx + 1}
                                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                </span>
                              </div>

                              {/* Inner Laptop Screen — Exact Same 3-Part Layout (Header Top, Writing Middle, YouTube Screen Bottom) */}
                              <div
                                className="flex flex-1 rounded-xl p-[2.5px]"
                                style={{ background: TOP_BORDER_GRADIENT }}
                              >
                                <div
                                  className="flex h-full w-full flex-col items-center justify-between gap-2.5 rounded-[10px] p-3 text-center text-[#0A2B6D]"
                                  style={{ background: UNIFORM_SPRAY_BG }}
                                >
                                  {/* 1. Top: Fixed-Height Centered Header Box */}
                                  <div
                                    className="w-full rounded-xl p-[2.5px] shadow-2xs"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[9px] bg-white px-3 py-1.5 text-center">
                                      <span
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <Music className="h-4 w-4" style={{ color: sym.iconColor }} />
                                      </span>
                                      <span className="text-xs sm:text-sm font-extrabold leading-tight text-[#0A2B6D]">
                                        {yt.label}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 2. Middle: Crisp Centered Writing Box */}
                                  <div className="flex min-h-[68px] w-full flex-col items-center justify-between rounded-xl border border-[#0A2B6D]/15 bg-white/95 px-3 py-2 text-center shadow-2xs">
                                    <p
                                      className="text-center text-[11px] font-extrabold leading-snug text-black"
                                      style={{ color: '#000000' }}
                                    >
                                      {yt.blurb}
                                    </p>
                                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#FF2E9A] px-3 py-0.5 text-[9.5px] font-extrabold text-white">
                                      <span style={{ color: '#FFFFFF' }}>YouTube Music Stage</span>
                                    </span>
                                  </div>

                                  {/* 3. Bottom: YouTube Music Video Screen at the Bottom */}
                                  <div className="w-full space-y-1.5">
                                    <div className="w-full overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] shadow-sm aspect-video">
                                      {isLive ? (
                                        <iframe
                                          title={yt.clipTitle}
                                          src={`https://www.youtube-nocookie.com/embed/${yt.videoId}?autoplay=1&rel=0`}
                                          className="h-full w-full"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        />
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setActiveVideoLaptopKey(yt.id)}
                                          className="group/yt relative flex h-full w-full flex-col items-center justify-center gap-1.5 p-2.5 text-center text-white"
                                          style={{ background: getHeaderView(gIdx + yIdx) }}
                                        >
                                          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#FF2E9A] text-white shadow-md transition-transform group-hover/yt:scale-110">
                                            <Play className="h-4 w-4 fill-white text-white" />
                                          </span>
                                          <span
                                            className="text-[10.5px] font-extrabold leading-tight text-white px-2"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            ♫ {yt.clipTitle}
                                          </span>
                                          <span
                                            className="rounded-full border border-white/60 bg-white/20 px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white"
                                            style={{ color: '#FFFFFF' }}
                                          >
                                            YouTube Stage HD · Click to Play
                                          </span>
                                        </button>
                                      )}
                                    </div>

                                    {/* Bottom Controls Bar */}
                                    <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#0A2B6D]/20 bg-white px-2.5 py-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveVideoLaptopKey(isLive ? null : yt.id)
                                        }
                                        className="inline-flex items-center gap-1 rounded-full bg-[#5A00D6] px-2.5 py-0.5 text-[9px] font-extrabold text-white"
                                        style={{ color: '#FFFFFF' }}
                                      >
                                        <Play className="h-2.5 w-2.5 fill-white text-white" />
                                        <span style={{ color: '#FFFFFF' }}>
                                          {isLive ? 'Stop Clip' : 'Play Clip'}
                                        </span>
                                      </button>
                                      <a
                                        href={`https://www.youtube.com/watch?v=${yt.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-extrabold text-[#0072FF] underline"
                                      >
                                        YouTube ↗
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

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