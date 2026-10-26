import React, { useState, useEffect } from 'react';
import {
  Lock, FolderLock, MessagesSquare, Mail,
  Building2, LogIn, Monitor, Columns, Users, CalendarClock, CheckCircle2, ArrowRight,
  Tablet, Sun, Clock, Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getHeaderView, getSymbolView, getAppBorderView } from '@/lib/fullColourTiles';
import SilverScreenSplit from '@/components/safe/SilverScreenSplit';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';
import MiniCommunicationCentrePanel from '@/components/safe/MiniCommunicationCentrePanel';
import AboveMailboxCommandDeck from '@/components/safe/AboveMailboxCommandDeck';
import {
  LogoBrandedOfficeSecondScreen,
  DEFAULT_LOGO,
  FULL_SLOGAN,
} from '@/components/safe/OfficeInteractiveMaterials';

export const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

const DEFAULT_SOFTWARE_LOGO = DEFAULT_LOGO;

function WallHangingPictureFrame({ title, children, className = '', frameAccent = SQUISHED_GRADIENT }) {
  return (
    <div className={`relative flex flex-col ${className}`}>
      <div
        className="flex h-full w-full flex-col rounded-xl p-[3px] shadow-sm"
        style={{ background: frameAccent }}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
            <span className="text-center">{title}</span>
          </div>
        )}
        <div className="flex-1 w-full overflow-hidden rounded-[9px] bg-white p-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * 1. Minimised Fixed Logo Section Lockup — Unclipped Emblem, App Name & Full Slogan
 */
export function ComplianceHrPhotoFrame() {
  return (
    <WallHangingPictureFrame title="1. Fixed Logo & Brand Slogan">
      <div className="flex h-full flex-col items-center justify-center rounded-xl bg-white p-1.5 text-center space-y-1">
        <div
          className="mt-1 mx-auto relative overflow-hidden w-[7.5rem] sm:w-[8.5rem] bg-white"
          style={{ aspectRatio: '100 / 46' }}
        >
          <img
            src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/6bf497716_generated_image.png"
            alt="ComplianceHR Infinity logo"
            className="w-full pointer-events-none select-none"
            style={{ marginTop: '-9.5%' }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 bg-white"
            style={{ width: '24%', height: '6%' }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 bg-white"
            style={{ left: '42.5%', width: '5.5%', height: '3.8%' }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 bg-white"
            style={{ width: '25%', height: '6%' }}
          />
        </div>

        <div className="font-editorial text-sm sm:text-base font-extrabold tracking-tight text-[#0A2B6D] leading-tight">
          Compliance
          <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
            HR
          </span>{' '}
          <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
            Infinity
          </span>
        </div>

        <div
          className="w-full rounded-full p-[1.5px]"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="rounded-full bg-white px-2 py-0.5 text-[7.5px] font-extrabold text-[#5A00D6]">
            {FULL_SLOGAN}
          </div>
        </div>
      </div>
    </WallHangingPictureFrame>
  );
}

export function SmallSafeVaultBar() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-pink-400 px-2.5 py-1.5 text-white shadow-sm"
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div className="text-[9.5px] font-extrabold text-white">
        ComplianceHR Infinity Smart Vault · {FULL_SLOGAN}
      </div>
      <div className="flex items-center gap-1.5">
        <Link
          to="/company-safe"
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-extrabold text-[#0A2B6D]"
        >
          <Lock className="h-2.5 w-2.5 text-[#FF2E9A]" /> Safe
        </Link>
        <Link
          to="/documents"
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-extrabold text-[#5A00D6]"
        >
          <FolderLock className="h-2.5 w-2.5 text-[#5A00D6]" /> Vault
        </Link>
      </div>
    </div>
  );
}

/**
 * 2. Today's Overview with Roster on a Flat Screen, Dark Blue Writing & Overhead Spotlights
 */
function TodaysRosterPictureCard() {
  const sampleRosterRows = [
    { shift: '07:00 – 15:00 · Morning Support', staff: 'Sarah Jenkins (RN)', participant: 'Liam Carter', status: 'Cleared & Active' },
    { shift: '09:00 – 17:00 · Community Access', staff: 'David Nguyen (SW)', participant: 'Mia Thompson', status: 'Cleared & Active' },
    { shift: '15:00 – 23:00 · Afternoon SIL', staff: 'Emma Wilson (TL)', participant: 'Noah Williams', status: 'Handover Ready' },
  ];

  return (
    <WallHangingPictureFrame title="2. Today's Overview & Flat Screen Live Roster" className="h-full">
      <div className="flex h-full flex-col items-center justify-between gap-1.5 bg-white">
        <div className="w-full">
          <RosterMiniOverview />
        </div>

        {/* Overhead Spotlights Shining Down Onto Flat Screen Roster */}
        <div className="flex w-full items-center justify-around px-4">
          {[0, 1, 2].map((sp) => (
            <div key={sp} className="flex flex-col items-center">
              <span
                className="h-2.5 w-5 rounded-b-full border border-white bg-white"
                style={{
                  boxShadow:
                    '0 0 12px 4px #FFFFFF, 0 6px 16px 4px rgba(0, 198, 255, 0.75)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Flat Screen Monitor Frame Holding the Roster With Dark Blue Writing */}
        <div
          className="flex w-full flex-1 flex-col justify-between rounded-2xl border-[3px] border-[#00C6FF] bg-[#0A2B6D] p-2 shadow-lg"
          style={{
            boxShadow:
              '0 0 16px 3px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(10, 43, 109, 0.3)',
          }}
        >
          {/* Top Flat Screen Bezel Bar */}
          <div className="mb-1 flex items-center justify-between px-1.5">
            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-white">
              <Monitor className="h-2.5 w-2.5 text-[#00C6FF]" />
              FLAT SCREEN 02 · LIVE ROSTER BOARD · SPOTLIGHTS ON ✦
            </span>
            <Link
              to="/roster"
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8px] font-extrabold text-[#0A2B6D]"
              style={{ color: '#0A2B6D' }}
            >
              <span style={{ color: '#0A2B6D' }}>Open Roster</span>
              <ArrowRight className="h-2 w-2 text-[#0A2B6D]" style={{ color: '#0A2B6D' }} />
            </Link>
          </div>

          {/* Minimised Inner Flat Screen Display — Compact Roster Rows With Dark Blue Writing (#0A2B6D) */}
          <div
            className="flex-1 rounded-xl p-[1.5px]"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="flex h-full flex-col justify-between gap-1 rounded-[8px] p-1"
              style={{ background: UNIFORM_SPRAY_BG }}
            >
              <div className="flex items-center justify-between gap-1 rounded-md border border-[#0A2B6D]/25 bg-white px-2 py-0.5">
                <span
                  className="flex items-center gap-1 text-[8px] font-extrabold text-[#0A2B6D]"
                  style={{ color: '#0A2B6D' }}
                >
                  <CalendarClock className="h-2.5 w-2.5 text-[#0A2B6D]" style={{ color: '#0A2B6D' }} />
                  Visual Daily Shift Roster
                </span>
                <span
                  className="rounded-full border border-[#0A2B6D]/30 bg-white px-1.5 py-0 text-[7px] font-extrabold text-[#0A2B6D]"
                  style={{ color: '#0A2B6D' }}
                >
                  100% Screened
                </span>
              </div>

              <div className="grid grid-cols-1 gap-0.5">
                {sampleRosterRows.map((row, idx) => (
                  <div
                    key={row.shift}
                    className="rounded p-[1px]"
                    style={{ background: getHeaderView(idx) }}
                  >
                    <div className="flex items-center justify-between gap-1 rounded-[3px] bg-white px-1.5 py-0.5 text-left">
                      <div className="min-w-0 truncate">
                        <span
                          className="text-[7.5px] font-extrabold text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          {row.shift} · {row.staff} → {row.participant}
                        </span>
                      </div>
                      <span
                        className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#0A2B6D]/25 bg-white px-1.5 py-0 text-[6.5px] font-extrabold text-[#0A2B6D]"
                        style={{ color: '#0A2B6D' }}
                      >
                        <CheckCircle2 className="h-2 w-2 text-[#0A2B6D]" style={{ color: '#0A2B6D' }} />
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flat Screen Stand Neck & Base */}
        <div className="flex flex-col items-center">
          <div className="h-1.5 w-6 bg-[#0A2B6D]" />
          <div
            className="h-1.5 w-16 rounded-full border border-[#0A2B6D]"
            style={{ background: TOP_BORDER_GRADIENT }}
          />
        </div>
      </div>
    </WallHangingPictureFrame>
  );
}

/**
 * 3. Communication Tab & 4. Mailbox Tab (Modulars Grid Removed)
 */
function CommunicationAndMailboxTabs() {
  const [hasAlertMail, setHasAlertMail] = useState(true);
  const [mailAlertCount, setMailAlertCount] = useState(3);

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.Notification.count({ read: false }).catch(() => 0),
      base44.entities.CommunicationEntry.count({ issues_concerns: { $exists: true, $ne: '' } }).catch(() => 0),
    ]).then(([u, f]) => {
      if (!active) return;
      const total = (u || 0) + (f || 0);
      if (total > 0) {
        setMailAlertCount(total);
        setHasAlertMail(true);
      }
    });
    return () => { active = false; };
  }, []);

  return (
    <WallHangingPictureFrame title="3. Mini Comms Above Red Letterbox & 4. Mini Communication Centre + Small Shared To-Do List">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white items-stretch">
        {/* Left Column: Mini Comms Placed Directly Above the Red Little Box (Letterbox) */}
        <div className="flex flex-col justify-between gap-1.5">
          {/* Top Above Red Little Box: Mini Comms — White Outside Border & Pink/Blue/Purple Spray With Dark Blue Writing Inside */}
          <div
            className="rounded-xl p-[2.5px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="flex flex-col items-center justify-between gap-1 rounded-[9px] bg-white p-1.5 text-center">
              <div
                className="gradient-brand flex w-full items-center justify-between gap-1 rounded-lg px-2 py-0.5 text-white"
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                  <span
                    className="h-2 w-2 rounded-full bg-white"
                    style={{ boxShadow: '0 0 8px 2px #FFFFFF' }}
                  />
                  <MessagesSquare className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Mini Comms</span>
                </span>
                <span className="text-[7px] font-extrabold text-white" style={{ color: '#FFFFFF' }}>
                  27 Oct · 24°C
                </span>
              </div>

              <div
                className="w-full rounded-lg p-[1.5px]"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="w-full space-y-0.5 rounded-[5px] p-1 text-left"
                  style={{ background: UNIFORM_SPRAY_BG }}
                >
                  {[
                    { tag: 'Shift Note', text: 'Morning SIL handover signed off' },
                    { tag: 'Broadcast', text: 'NDIS 2026 Standards briefing live' },
                    { tag: 'Team Diary', text: '3 participant goal notes synced' },
                    { tag: 'Inbox SLA', text: 'Zero overdue · 24h SLA active' },
                  ].map((msg) => (
                    <div
                      key={msg.tag}
                      className="flex items-center justify-between gap-1 rounded border border-[#0A2B6D]/20 bg-white/80 px-1.5 py-0.5 text-[7.5px] font-extrabold text-[#0A2B6D]"
                    >
                      <span className="shrink-0 rounded-full bg-[#0A2B6D] px-1.5 py-0 text-[6.5px] text-white">
                        {msg.tag}
                      </span>
                      <span className="flex-1 truncate text-right text-[#0A2B6D]">{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Between Mini Comms and Mailbox: Live Roster Strip + Sky-Drop Command Deck */}
          <div
            className="rounded-xl p-[2px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="flex items-center justify-between gap-1.5 rounded-[8px] bg-white px-2 py-0.5">
              <span
                className="gradient-brand inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-extrabold uppercase text-white whitespace-nowrap"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <CalendarClock className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>Live Roster</span>
              </span>
              <span className="truncate rounded border border-[#0A2B6D]/20 bg-white px-1.5 py-0 text-[7px] font-extrabold text-[#0A2B6D]">
                3 Shifts Active · 100% Screened
              </span>
              <Link
                to="/roster"
                className="shrink-0 rounded-full bg-[#0A2B6D] px-2 py-0 text-[6.5px] font-extrabold text-white"
              >
                Roster →
              </Link>
            </div>
          </div>

          <AboveMailboxCommandDeck
            mailAlertCount={mailAlertCount}
            onDropExpressMail={() => {
              setHasAlertMail(true);
              setMailAlertCount((prev) => prev + 1);
            }}
          />

          {/* Underneath Mini Comms & Roster: Red Little Box (Letterbox That Lights Up in Bright RED When It Has Mail) */}
          <div
            className="rounded-xl p-[3px] transition-all duration-300"
            style={{
              background: hasAlertMail ? '#EF4444' : TOP_BORDER_GRADIENT,
              boxShadow: hasAlertMail
                ? '0 0 18px 4px rgba(239, 68, 68, 0.92), 0 0 10px 2px #EF4444'
                : undefined,
            }}
          >
            <div className="flex flex-col items-center justify-between gap-1 rounded-[8px] bg-white p-1.5 text-center">
              <div
                className="flex w-full items-center justify-between gap-1 rounded-md border border-[#0A2B6D]/20 px-2 py-0.5 text-[8.5px] font-extrabold text-[#0A2B6D]"
                style={{ background: UNIFORM_SPRAY_BG }}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full border border-white"
                    style={{
                      backgroundColor: hasAlertMail ? '#EF4444' : '#FFFFFF',
                      boxShadow: hasAlertMail
                        ? '0 0 10px 3px #EF4444'
                        : '0 0 6px 2px #FFFFFF',
                    }}
                  />
                  <Mail className="h-2.5 w-2.5 text-[#EF4444]" />
                  <span>Red Little Box · Letterbox</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasAlertMail((prev) => !prev)}
                  className="rounded-full px-1.5 py-0 text-[7px] font-extrabold text-white"
                  style={{ background: hasAlertMail ? '#EF4444' : '#0A2B6D' }}
                >
                  {hasAlertMail ? 'RED MAIL LIT ✦' : 'Test Mail'}
                </button>
              </div>

              <div
                className="flex w-full flex-col items-center justify-center rounded-md border border-[#0A2B6D]/20 px-1.5 py-0.5 text-center"
                style={{ background: UNIFORM_SPRAY_BG }}
              >
                <svg
                  viewBox="0 0 220 68"
                  className="h-10 w-full max-w-[165px]"
                  aria-label="Interactive Red Letterbox with Opening Door and Flying Letters"
                >
                  {hasAlertMail && (
                    <ellipse
                      cx="105"
                      cy="35"
                      rx="85"
                      ry="28"
                      fill="#EF4444"
                      fillOpacity="0.22"
                    />
                  )}
                  <rect x="66" y="46" width="10" height="20" rx="2" fill="#0A2B6D" />
                  <path
                    d="M32 46 L32 24 Q32 10 50 10 L104 10 Q120 10 120 24 L120 46 Z"
                    fill={hasAlertMail ? '#EF4444' : '#0072FF'}
                    stroke="#0A2B6D"
                    strokeWidth="2.5"
                  />
                  {hasAlertMail ? (
                    <g>
                      <rect x="52" y="2" width="3" height="18" fill="#0A2B6D" />
                      <polygon points="55,2 72,7 55,12" fill="#EF4444" stroke="#0A2B6D" strokeWidth="1.2" />
                      <ellipse cx="118" cy="30" rx="6" ry="14" fill="#0A2B6D" />
                      <path
                        d="M120 44 L142 54 L146 47 L122 37 Z"
                        fill="#EF4444"
                        stroke="#0A2B6D"
                        strokeWidth="1.8"
                      />
                      <g transform="translate(124, 12) rotate(-8)">
                        <rect width="28" height="17" rx="2" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
                        <polyline points="2,2 14,10 26,2" fill="none" stroke="#EF4444" strokeWidth="1.6" />
                      </g>
                      <g transform="translate(154, 4) rotate(6)">
                        <rect width="30" height="18" rx="2" fill="#FFFFFF" stroke="#0A2B6D" strokeWidth="2" />
                        <polyline points="2,2 15,10 28,2" fill="none" stroke="#EF4444" strokeWidth="1.6" />
                      </g>
                    </g>
                  ) : (
                    <rect x="114" y="14" width="6" height="30" rx="2" fill="#FFFFFF" stroke="#0A2B6D" strokeWidth="1.5" />
                  )}
                </svg>
                <div className="text-[8px] font-extrabold text-[#EF4444]">
                  {hasAlertMail
                    ? `Letterbox Lit Red (${mailAlertCount} Letters Out)`
                    : 'Letterbox Closed'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Where Mini Comms Was): Mini Communication Centre + Small Shared To-Do List */}
        <MiniCommunicationCentrePanel alertCount={mailAlertCount} />
      </div>
    </WallHangingPictureFrame>
  );
}

/**
 * 7. Desk PC Screen & Office Scene
 */
function OfficeEquipmentWithInteractiveScreen({
  selectedMonitorFeed,
  onSelectMonitorFeed,
}) {
  const feeds = [
    { id: 'overview', label: "Today's Roster", title: "TODAY'S ROSTER", sub: FULL_SLOGAN },
    { id: 'profiles', label: 'Staff & Participants', title: 'PEOPLE PROFILES', sub: 'Employees · Participants · Intake' },
    { id: 'comms', label: 'Comms & Mailbox', title: 'COMMS & MAILBOX', sub: 'Alerts · Shift Notes · Smart Vault' },
    { id: 'safe', label: 'Company Safe', title: 'COMPANY SAFE VAULT', sub: 'Identity · Badges · NDIS Evidence' },
  ];
  const currentFeed = feeds.find((f) => f.id === selectedMonitorFeed) || feeds[0];

  return (
    <div
      className="rounded-2xl p-[3.5px] shadow-sm"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[13px] bg-white px-3 py-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0A2B6D]">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-white shadow-sm"
              style={{ background: SQUISHED_GRADIENT }}
            >
              <Monitor className="h-3.5 w-3.5" /> 7. Desk PC Screen &amp; Speaker
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {feeds.map((feed, idx) => (
              <button
                key={feed.id}
                type="button"
                onClick={() => onSelectMonitorFeed(feed.id)}
                className={`rounded-full border-2 px-3 py-1 text-[10px] font-extrabold transition-all ${
                  selectedMonitorFeed === feed.id
                    ? 'border-[#0A2B6D] text-white shadow-sm'
                    : 'border-[#0A2B6D]/30 bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                }`}
                style={selectedMonitorFeed === feed.id ? { background: getHeaderView(idx) } : undefined}
              >
                {feed.label}
              </button>
            ))}
          </div>
        </div>

        <svg
          viewBox="0 0 980 152"
          className="mx-auto h-24 sm:h-28 w-full"
          aria-label="Office Table with Speaker, Desk PC Screen, Chair, Couch and Safe"
        >
          <defs>
            <linearGradient id="officeGradMain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0072FF" />
              <stop offset="25%" stopColor="#0A2B6D" />
              <stop offset="50%" stopColor="#5A00D6" />
              <stop offset="75%" stopColor="#A100FF" />
              <stop offset="100%" stopColor="#FF2E9A" />
            </linearGradient>
            <linearGradient id="chairLeatherGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0A2B6D" />
              <stop offset="50%" stopColor="#5A00D6" />
              <stop offset="100%" stopColor="#FF2E9A" />
            </linearGradient>
            <linearGradient id="tableWoodGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0A2B6D" />
              <stop offset="50%" stopColor="#5A00D6" />
              <stop offset="100%" stopColor="#A100FF" />
            </linearGradient>
          </defs>

          <ellipse cx="490" cy="142" rx="465" ry="9" fill="#F5F0FF" stroke="#C084FC" strokeWidth="1.5" />

          <g transform="translate(16, 36)">
            <path d="M24 62 C8 44, 6 24, 20 12 C26 26, 26 44, 24 62 Z" fill="#00C6FF" />
            <path d="M28 62 C28 36, 36 12, 48 4 C50 24, 42 44, 28 62 Z" fill="#0072FF" />
            <path d="M32 62 C44 42, 56 30, 66 26 C58 44, 46 54, 32 62 Z" fill="#C084FC" />
            <polygon points="14,62 46,62 41,96 19,96" fill="url(#officeGradMain)" stroke="#FF6EDB" strokeWidth="1.5" />
            <rect x="11" y="58" width="38" height="6" rx="2" fill="#0A2B6D" />
          </g>

          <g transform="translate(95, 6)">
            <rect x="38" y="0" width="76" height="22" rx="9" fill="url(#chairLeatherGrad)" stroke="#f9a8d4" strokeWidth="2.2" />
            <path
              d="M24 24 Q76 16 128 24 L120 90 Q76 98 32 90 Z"
              fill="url(#chairLeatherGrad)"
              stroke="#93c5fd"
              strokeWidth="2.4"
            />
            <line x1="40" y1="45" x2="112" y2="45" stroke="#fbcfe8" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="38" y1="66" x2="114" y2="66" stroke="#fbcfe8" strokeWidth="1.5" strokeOpacity="0.7" />
            <path d="M8 52 Q18 46 26 54 L26 86 Q14 86 8 76 Z" fill="#1e40af" stroke="#93c5fd" strokeWidth="1.8" />
            <path d="M144 52 Q134 46 126 54 L126 86 Q138 86 144 76 Z" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.8" />
            <rect x="26" y="90" width="100" height="14" rx="7" fill="#312e81" stroke="#c4b5fd" strokeWidth="2" />
            <rect x="70" y="104" width="12" height="18" fill="#475569" />
            <path d="M34 124 L118 124" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M76 120 L42 130 M76 120 L110 130" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="38" cy="132" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
            <circle cx="76" cy="132" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
            <circle cx="114" cy="132" r="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="76" y="145" textAnchor="middle" fill="#1e3a8a" fontSize="9.5" fontWeight="800">
              EXECUTIVE CHAIR
            </text>
          </g>

          <g transform="translate(270, 10)">
            <g transform="translate(28, 6)">
              <rect x="0" y="0" width="58" height="70" rx="9" fill="#0f172a" stroke="#f472b6" strokeWidth="2.5" />
              <circle cx="29" cy="19" r="9.5" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
              <circle cx="29" cy="19" r="3.8" fill="#38bdf8" />
              <circle cx="29" cy="47" r="15.5" fill="#312e81" stroke="#c084fc" strokeWidth="2.2" />
              <circle cx="29" cy="47" r="8.5" fill="#7c3aed" stroke="#f9a8d4" strokeWidth="1.5" />
              <circle cx="29" cy="47" r="3.5" fill="#ec4899" />
              <path d="M-7 20 Q-13 33 -7 46" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M65 20 Q71 33 65 46" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" />
              <text x="29" y="-3" textAnchor="middle" fill="#7c3aed" fontSize="8.5" fontWeight="800">
                OFFICE SPEAKER
              </text>
            </g>

            <g transform="translate(116, 2)">
              <rect x="0" y="0" width="186" height="60" rx="7" fill="#0f172a" stroke="#93c5fd" strokeWidth="2.2" />
              <rect x="5" y="5" width="176" height="46" rx="4" fill="url(#officeGradMain)" />
              <text x="93" y="19" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="800">
                DESK PC SCREEN · {currentFeed.title}
              </text>
              <text x="93" y="30" textAnchor="middle" fill="#fde68a" fontSize="6.8" fontWeight="700">
                {currentFeed.sub}
              </text>
              <rect x="16" y="36" width="46" height="10" rx="2.5" fill="#ffffff" fillOpacity="0.92" />
              <rect x="69" y="36" width="46" height="10" rx="2.5" fill="#ffffff" fillOpacity="0.92" />
              <rect x="122" y="36" width="46" height="10" rx="2.5" fill="#ffffff" fillOpacity="0.92" />
              <rect x="83" y="60" width="20" height="10" fill="#475569" />
              <rect x="62" y="69" width="62" height="5" rx="2.5" fill="#94a3b8" />
            </g>

            <g transform="translate(322, 22)">
              <rect x="0" y="0" width="62" height="52" rx="7" fill="#1e1b4b" stroke="#f9a8d4" strokeWidth="2" />
              <rect x="7" y="8" width="14" height="36" rx="5" fill="#312e81" stroke="#a5b4fc" strokeWidth="1.2" />
              <rect x="25" y="8" width="30" height="12" rx="2" fill="#38bdf8" />
              <circle cx="31" cy="28" r="2.2" fill="#ffffff" />
              <circle cx="40" cy="28" r="2.2" fill="#ffffff" />
              <circle cx="49" cy="28" r="2.2" fill="#ffffff" />
              <circle cx="31" cy="36" r="2.2" fill="#ffffff" />
              <circle cx="40" cy="36" r="2.2" fill="#ffffff" />
              <circle cx="49" cy="36" r="2.2" fill="#ec4899" />
            </g>

            <rect
              x="0"
              y="74"
              width="415"
              height="14"
              rx="6"
              fill="url(#tableWoodGrad)"
              stroke="#f9a8d4"
              strokeWidth="2"
            />
            <rect x="22" y="88" width="15" height="44" rx="3" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.2" />
            <rect x="148" y="88" width="120" height="34" rx="4" fill="#312e81" stroke="#c4b5fd" strokeWidth="1.5" />
            <line x1="148" y1="105" x2="268" y2="105" stroke="#a5b4fc" strokeWidth="1.2" />
            <circle cx="208" cy="97" r="2.5" fill="#fde68a" />
            <circle cx="208" cy="113" r="2.5" fill="#fde68a" />
            <rect x="378" y="88" width="15" height="44" rx="3" fill="#9d174d" stroke="#f9a8d4" strokeWidth="1.2" />

            <text x="208" y="136" textAnchor="middle" fill="#5b21b6" fontSize="9.5" fontWeight="800">
              DESK PC SCREEN, SPEAKER &amp; PHONE
            </text>
          </g>

          <g transform="translate(705, 34)">
            <rect x="10" y="12" width="142" height="42" rx="11" fill="url(#officeGradMain)" stroke="#93c5fd" strokeWidth="1.8" />
            <line x1="57" y1="16" x2="57" y2="52" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.6" />
            <line x1="105" y1="16" x2="105" y2="52" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.6" />
            <rect x="0" y="28" width="18" height="46" rx="7" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />
            <rect x="144" y="28" width="18" height="46" rx="7" fill="#db2777" stroke="#f9a8d4" strokeWidth="1.5" />
            <rect x="12" y="50" width="138" height="24" rx="6" fill="url(#officeGradMain)" stroke="#f9a8d4" strokeWidth="1.5" />
            <rect x="18" y="74" width="8" height="14" rx="2" fill="#1e1b4b" />
            <rect x="136" y="74" width="8" height="14" rx="2" fill="#1e1b4b" />
            <text x="81" y="102" textAnchor="middle" fill="#7c3aed" fontSize="8.5" fontWeight="800">
              EXECUTIVE LOUNGE COUCH
            </text>

            <g transform="translate(174, 4)">
              <rect x="0" y="0" width="76" height="84" rx="8" fill="url(#officeGradMain)" stroke="#fde68a" strokeWidth="2" />
              <rect x="6" y="6" width="64" height="72" rx="5" fill="#1e1b4b" fillOpacity="0.4" stroke="#ffffff" strokeWidth="1" />
              <circle cx="34" cy="42" r="14" fill="#ffffff" stroke="#ec4899" strokeWidth="2" />
              <circle cx="34" cy="42" r="5" fill="#7c3aed" />
              <path d="M48 34 L58 34 M48 50 L58 50" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
              <text x="38" y="98" textAnchor="middle" fill="#be185d" fontSize="8.5" fontWeight="800">
                COMPANY SAFE
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

const LAYOUT_CHOICES = [
  { id: 'both', label: 'Both Views Side-by-Side', icon: Columns },
  { id: 'office', label: 'Office View Only', icon: Building2 },
  { id: 'profiles', label: 'Roster & Comms View', icon: Users },
];

export default function ExecutiveWallScene({
  logoUrl,
  companyName = 'ComplianceHR Infinity',
  defaultViewMode,
}) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;
  const [viewMode, setViewMode] = useState(() => {
    if (defaultViewMode) return defaultViewMode;
    const saved = localStorage.getItem('chr-workspace-view-mode');
    return saved || 'both';
  });
  const [monitorFeed, setMonitorFeed] = useState('overview');
  const [secondScreenKey, setSecondScreenKey] = useState('rostering');

  useEffect(() => {
    const syncViewMode = (e) => {
      if (e?.detail?.mode) setViewMode(e.detail.mode);
    };
    window.addEventListener('chr-view-mode-change', syncViewMode);
    return () => window.removeEventListener('chr-view-mode-change', syncViewMode);
  }, []);

  const selectMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('chr-workspace-view-mode', mode);
    window.dispatchEvent(new CustomEvent('chr-view-mode-change', { detail: { mode } }));
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-1.5 sm:p-2 space-y-2">
      {/* 50% Smaller Dual Executive Office Header + Mode Tiles */}
      <div
        className="w-full rounded-xl p-[2.5px] shadow-2xs"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex flex-col items-center justify-center rounded-[9px] bg-white p-2 text-center space-y-1.5">
          <div
            className="w-full rounded-full p-[2px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[26px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] sm:text-xs font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(7), color: '#FFFFFF' }}
            >
              <span
                className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border bg-white"
                style={{ borderColor: getAppBorderView(7) }}
              >
                <Building2 className="h-2.5 w-2.5" style={{ color: getSymbolView(7).iconColor }} />
              </span>
              <span style={{ color: '#FFFFFF' }}>
                {companyName} · Dual Executive Office &amp; Profile Workspace (50% Compact)
              </span>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1.5">
            {LAYOUT_CHOICES.map((choice, idx) => {
              const Icon = choice.icon;
              const active = viewMode === choice.id;
              const sym = getSymbolView(idx);
              return (
                <div
                  key={choice.id}
                  className="rounded-full p-[2px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <button
                    type="button"
                    onClick={() => selectMode(choice.id)}
                    className={`gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold text-white transition-all ${
                      active ? 'ring-2 ring-[#0A2B6D] shadow-sm' : 'opacity-95 hover:opacity-100'
                    }`}
                    style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                      style={{ borderColor: getAppBorderView(idx) }}
                    >
                      <Icon className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                    </span>
                    <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
                      {choice.label}
                    </span>
                  </button>
                </div>
              );
            })}

            <div
              className="rounded-full p-[2px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <Link
                to="/login"
                className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold text-white transition-all hover:opacity-95"
                style={{ background: getHeaderView(3), color: '#FFFFFF' }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                  style={{ borderColor: getAppBorderView(3) }}
                >
                  <LogIn className="h-2.5 w-2.5" style={{ color: getSymbolView(3).iconColor }} />
                </span>
                <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
                  Sign In
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 50% Smaller Dual Executive Office Workspace Body */}
      <div
        className="w-full rounded-xl p-[2.5px] shadow-2xs"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[9px] bg-white p-2 space-y-2">
          {/* Top Row: (1) Fixed Logo + (2) Today's Overview + (3/4) iPad + Red Letterbox + Mini Communication Board */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
            <div className="lg:col-span-3 flex flex-col">
              <ComplianceHrPhotoFrame logoUrl={frameSrc} />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <TodaysRosterPictureCard />
            </div>
            <div className="lg:col-span-5 flex flex-col">
              <CommunicationAndMailboxTabs />
            </div>
          </div>

          {/* Bottom Compact Row: (5) Silver Screen + (6) Office Screen 2 + (7) Desk PC Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch">
            <div className="lg:col-span-4 flex flex-col max-h-[220px] overflow-y-auto">
              <WallHangingPictureFrame
                title="5. Silver Screen · Weather & NDIS News"
                frameAccent={TOP_BORDER_GRADIENT}
                className="h-full"
              >
                <SilverScreenSplit />
              </WallHangingPictureFrame>
            </div>
            <div className="lg:col-span-4 flex flex-col max-h-[220px] overflow-y-auto">
              <LogoBrandedOfficeSecondScreen
                logoUrl={frameSrc}
                selectedScreen={secondScreenKey}
                onSelectScreen={setSecondScreenKey}
                companyName={companyName}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col justify-center">
              <OfficeEquipmentWithInteractiveScreen
                selectedMonitorFeed={monitorFeed}
                onSelectMonitorFeed={setMonitorFeed}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}