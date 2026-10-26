import React, { useEffect, useState } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image } from '@/components/ui/image';
import { Vault, Mail, MailWarning, BellRing, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AlertLamp from '@/components/communications/AlertLamp';
import AboveMailboxCommandDeck from '@/components/safe/AboveMailboxCommandDeck';
import { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';
import '@/components/communications/communicationNavigation.css';

const INFINITY_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

const COLOURS = {
  alerts: '#FF2E9A',
  logs: '#0A2B6D',
  'task-dashboard': '#0072FF',
  todo: '#0A2B6D',
  guide: '#5A00D6',
  templates: '#A100FF',
  banter: '#FF2E9A',
  feed: '#A100FF',
  shoutouts: '#5A00D6',
  video: '#0A2B6D',
  complaints: '#0072FF',
  ai: '#00C6FF',
  diary: '#5A00D6',
  inbox: '#A100FF',
  email: '#FF2E9A',
  'shift-notes': '#FF6EDB',
  'employee-log': '#C084FC',
  bulk: '#00C6FF',
};

export default function CommunicationNavigation({ tabs }) {
  const [alertCount, setAlertCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const loadAlerts = async () => {
      try {
        const [unread, flagged] = await Promise.all([
          base44.entities.Notification.count({ read: false }).catch(() => 0),
          base44.entities.CommunicationEntry.count({ issues_concerns: { $exists: true, $ne: '' } }).catch(() => 0),
        ]);
        if (!alive) return;
        setAlertCount(unread || 0);
        setFlaggedCount(flagged || 0);
      } catch {
        if (alive) {
          setAlertCount(0);
          setFlaggedCount(0);
        }
      }
    };
    loadAlerts();
    const timer = setInterval(loadAlerts, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const totalAlerts = alertCount + flaggedCount;
  const hasAlerts = totalAlerts > 0;

  return (
    <div
      className="rounded-3xl p-[12px] shadow-lg"
      style={{
        background:
          'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
      }}
    >
      <div className="space-y-2.5 rounded-[16px] bg-white p-3">
      {/* Interactive Sky-Drop Air-Mail Drone, 360° Radar & Live Roster Deck Above Mailbox */}
      <AboveMailboxCommandDeck
        mailAlertCount={totalAlerts || 3}
        onDropExpressMail={() => setAlertCount((prev) => prev + 1)}
      />

      {/* Top Alert Lamps + Colour-Changing Alert Mailbox */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 items-stretch">
        {/* Interactive Mailbox That Changes Colour When There Are Alerts */}
        <TabsList
          aria-label="Communication Mailbox"
          data-dashboard-tabs={undefined}
          className="lg:col-span-4 h-auto bg-transparent p-0"
        >
          <TabsTrigger
            value="alerts"
            className="flex w-full items-center justify-between gap-2.5 rounded-xl border-2 border-[#0A2B6D] px-3 py-2 text-left text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{
              background: hasAlerts
                ? 'linear-gradient(125deg, #FF2E9A 0%, #dc2626 50%, #A100FF 100%)'
                : 'linear-gradient(125deg, #0A2B6D 0%, #0072FF 60%, #00C6FF 100%)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Visual Mailbox Icon Box that pulses & changes colour on alerts */}
              <div
                className={`relative flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-white bg-white/20 text-white shadow-sm ${
                  hasAlerts ? 'animate-pulse ring-2 ring-amber-300' : ''
                }`}
              >
                {hasAlerts ? (
                  <MailWarning className="h-6 w-6 text-white" />
                ) : (
                  <Mail className="h-6 w-6 text-white" />
                )}
                <span
                  className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#0A2B6D] px-1 text-[9.5px] font-extrabold ${
                    hasAlerts ? 'bg-amber-300 text-[#0A2B6D]' : 'bg-white text-[#0A2B6D]'
                  }`}
                >
                  {totalAlerts}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-white/25 px-2 py-0 text-[9px] font-extrabold uppercase tracking-wider text-white">
                    {hasAlerts ? '● MAILBOX ALERT ACTIVE' : '● MAILBOX CLEAR'}
                  </span>
                </div>
                <div className="mt-0.5 text-sm font-extrabold leading-tight text-white">
                  {hasAlerts ? `Alert Mailbox (${totalAlerts} New)` : 'Communications Mailbox'}
                </div>
                <div className="text-[10px] font-semibold text-white/95">
                  {hasAlerts
                    ? `${alertCount} unread alerts · ${flaggedCount} flagged notes — Tap to open`
                    : 'No unread alerts — Mailbox colour changes when alerts arrive'}
                </div>
              </div>
            </div>

            <span className="shrink-0 rounded-lg border border-white bg-white px-2 py-1 text-[10px] font-extrabold text-[#0A2B6D] shadow-2xs">
              {hasAlerts ? <BellRing className="h-4 w-4 text-[#FF2E9A]" /> : <CheckCircle2 className="h-4 w-4 text-[#0072FF]" />}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsList
          aria-label="Communication alerts"
          data-dashboard-tabs={undefined}
          className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-none bg-transparent p-0 shadow-none h-auto"
        >
          <AlertLamp kind="alerts" />
          <AlertLamp kind="logs" />
        </TabsList>
      </div>

      {/* Compact Square Button Grid: Just Big Enough to Press Buttons Inside the Mailbox & Functions Box */}
      <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/55 p-2">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            Mailbox &amp; Communication Function Squares — Tap Any Button Square
          </span>
          <span className="text-[10px] font-bold text-[#5A00D6]">
            {tabs.length + 1} Quick-Press Function Squares
          </span>
        </div>

        <TabsList
          aria-label="Communication dashboard"
          className="flex flex-wrap items-center justify-start gap-1.5 h-auto bg-transparent p-0"
        >
          {tabs.map(([value, Icon, label]) => {
            const c = COLOURS[value] || '#0072FF';
            const isInboxOrAlert = value === 'inbox' || value === 'email';
            const badgeAlert = isInboxOrAlert && hasAlerts;
            return (
              <TabsTrigger
                key={value}
                value={value}
                className="group relative flex h-14 w-[4.6rem] sm:w-20 shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-white p-1 text-center shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md data-[state=active]:ring-2 data-[state=active]:ring-[#FF2E9A]"
                style={{
                  borderTopWidth: '4px',
                  borderTopColor: badgeAlert ? '#FF2E9A' : c,
                  background: badgeAlert
                    ? 'linear-gradient(165deg, rgba(255,46,154,0.22) 0%, #ffffff 85%)'
                    : `linear-gradient(165deg, ${c}18 0%, #ffffff 85%)`,
                }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#0A2B6D]/30 text-white shadow-2xs"
                  style={{ background: badgeAlert ? '#FF2E9A' : c }}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                <span className="w-full truncate text-[9.5px] font-extrabold leading-tight text-[#0A2B6D]">
                  {label}
                </span>
              </TabsTrigger>
            );
          })}

          {/* Smart Vault Compact Square Button */}
          <TabsTrigger
            value="smart-vault"
            className="group relative flex h-14 w-[4.6rem] sm:w-20 shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-[#0A2B6D] p-1 text-center text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#0A2B6D] bg-white p-0.5 shadow-2xs">
              <Image
                src={INFINITY_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="flex items-center justify-center gap-0.5 w-full truncate text-[9.5px] font-extrabold leading-tight text-white">
              <Vault className="h-2.5 w-2.5 shrink-0" /> Vault
            </span>
          </TabsTrigger>
        </TabsList>
      </div>
      </div>
    </div>
  );
}