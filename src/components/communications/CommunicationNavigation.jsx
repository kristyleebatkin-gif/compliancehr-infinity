import React, { useEffect, useState } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MailWarning, BellRing, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AlertLamp from '@/components/communications/AlertLamp';
import { useRole } from '@/lib/useRole';
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

export default function CommunicationNavigation({ tabs, onCompose }) {
  const { user } = useRole();
  const [alertCount, setAlertCount] = useState(null);
  const [flaggedCount, setFlaggedCount] = useState(null);

  useEffect(() => {
    let alive = true;
    const loadAlerts = async () => {
      try {
        const [unread, flagged] = await Promise.all([
          user?.id ? base44.entities.Notification.count({ read: false, recipient_id: user.id }).catch(() => null) : Promise.resolve(null),
          base44.entities.CommunicationEntry.count({ issues_concerns: { $exists: true, $ne: '' } }).catch(() => null),
        ]);
        if (!alive) return;
        setAlertCount(typeof unread === 'number' && Number.isFinite(unread) ? unread : null);
        setFlaggedCount(typeof flagged === 'number' && Number.isFinite(flagged) ? flagged : null);
      } catch {
        if (alive) {
          setAlertCount(null);
          setFlaggedCount(null);
        }
      }
    };
    loadAlerts();
    const timer = setInterval(loadAlerts, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [user?.id]);

  const countsKnown = alertCount !== null && flaggedCount !== null;
  const totalAlerts = (alertCount || 0) + (flaggedCount || 0);
  const hasAlerts = totalAlerts > 0;

  return (
    <div
      className="rounded-3xl p-[12px] shadow-lg"
      style={{
        background:
          'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
      }}
    >
      <div className="space-y-2.5 rounded-[16px] bg-[#081018] p-3 text-white">
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
                  {countsKnown ? totalAlerts : '—'}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-white/25 px-2 py-0 text-[9px] font-extrabold uppercase tracking-wider text-white">
                    {!countsKnown ? '● ALERT STATUS UNAVAILABLE' : hasAlerts ? '● MAILBOX ALERT ACTIVE' : '● MAILBOX CLEAR'}
                  </span>
                </div>
                <div className="mt-0.5 text-sm font-extrabold leading-tight text-white">
                  {hasAlerts ? `Alert Mailbox (${totalAlerts} New)` : 'Communications Mailbox'}
                </div>
                <div className="text-[10px] font-semibold text-white/95">
                  {!countsKnown ? 'Open Alerts to check availability and retry.' : hasAlerts
                    ? `${alertCount} unread notifications · ${flaggedCount} flagged notes — Tap to open`
                    : 'No unread notifications or flagged notes were returned.'}
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

      {/* Communication Centre Screens — Visually Matching Quick Access */}
      <TabsList aria-label="Communication dashboard">
        {tabs.map(([value, Icon, label]) => (
          <TabsTrigger key={value} value={value} data-hint={`${label} workspace`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      </div>
    </div>
  );
}