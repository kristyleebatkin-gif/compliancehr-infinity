import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image } from '@/components/ui/image';
import { Vault } from 'lucide-react';
import AlertLamp from '@/components/communications/AlertLamp';
import { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';
import '@/components/communications/communicationNavigation.css';

const INFINITY_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

// One fixed colour per tile, taken from the 45-module dashboard palette
// (src/components/dashboard/dashboardModuleColours.js). Tiles styled like the
// first modules on the main Dashboard (DashboardTile): gradient card, top
// colour bar, gradient icon chip and a coloured "Open" pill.
const COLOURS = {
  alerts: '#dc2626',
  logs: '#1e3a8a',
  'task-dashboard': '#2563eb',
  todo: '#ea580c',
  guide: '#65a30d',
  templates: '#ca8a04',
  banter: '#db2777',
  feed: '#0d9488',
  shoutouts: '#f43f5e',
  video: '#4f46e5',
  complaints: '#b91c1c',
  ai: '#9333ea',
  diary: '#0ea5e9',
  inbox: '#0369a1',
  email: '#16a34a',
  'shift-notes': '#d97706',
  'employee-log': '#c026d3',
  bulk: '#15803d',
};

export default function CommunicationNavigation({ tabs }) {
  return (
    <div className="space-y-1.5">
      {/* Squashed Top Alert & Automated Log Headers */}
      <TabsList aria-label="Communication alerts" data-dashboard-tabs={undefined} className="grid grid-cols-4 gap-1.5 rounded-none bg-transparent p-0 shadow-none">
        <AlertLamp kind="alerts" className="col-span-2" />
        <AlertLamp kind="logs" className="col-span-2" />
      </TabsList>
      {/* Minimised Icons & Modular Names so all fit compactly */}
      <TabsList aria-label="Communication dashboard" className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-8 h-auto bg-transparent p-0">
        {tabs.map(([value, Icon, label]) => {
          const c = COLOURS[value] || '#0891b2';
          return (
            <TabsTrigger
              key={value}
              value={value}
              className="group relative flex min-h-8 min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-2 py-1 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                borderColor: `${c}55`,
                background: `linear-gradient(165deg, ${c}24 0%, ${c}10 46%, hsl(var(--card)) 88%)`,
              }}
            >
              <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: c }} />
              <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded text-white shadow-sm" style={{ background: c }}>
                <Icon aria-hidden="true" className="h-2.5 w-2.5" />
              </span>
              <span className="relative min-w-0 flex-1 truncate text-[10px] font-extrabold text-foreground">{label}</span>
            </TabsTrigger>
          );
        })}
        {/* Smart Vault in the space right beside Employee Log with ComplianceHR Infinity Logo & Colours */}
        <TabsTrigger
          value="smart-vault"
          className="group relative flex min-h-8 min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border-2 border-pink-400 px-2 py-1 text-left text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5 shadow-sm">
            <Image
              src={INFINITY_LOGO}
              alt="ComplianceHR Infinity"
              fittingType="fit"
              className="h-full w-full object-contain"
            />
          </span>
          <span className="relative min-w-0 flex-1 truncate text-[10px] font-extrabold text-white">
            Smart Vault
          </span>
          <Vault className="h-3 w-3 shrink-0 text-white" />
        </TabsTrigger>
      </TabsList>
    </div>
  );
}