import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertLamp from '@/components/communications/AlertLamp';
import '@/components/communications/communicationNavigation.css';

// One fixed colour per tile, taken from the 45-module dashboard palette
// (src/components/dashboard/dashboardModuleColours.js). Tiles styled like the
// first modules on the main Dashboard (DashboardTile): gradient card, top
// colour bar, gradient icon chip and a coloured "Open" pill.
const COLOURS = {
  alerts: '#dc2626', logs: '#1e3a8a', diary: '#0891b2', inbox: '#0ea5e9',
  templates: '#c026d3', email: '#059669', bulk: '#f97316', banter: '#22c55e',
  shoutouts: '#ec4899', feed: '#0d9488', complaints: '#b91c1c', todo: '#ef4444',
  'task-dashboard': '#4338ca', guide: '#65a30d', video: '#6366f1', ai: '#8b5cf6',
  'shift-notes': '#14b8a6', 'employee-log': '#7c3aed',
};

export default function CommunicationNavigation({ tabs }) {
  return (
    <div className="space-y-1.5">
      {/* Top lights: alerts and the alert log glow (and sound) as alerts arrive. */}
      <TabsList aria-label="Communication alerts" data-dashboard-tabs={undefined} className="grid grid-cols-4 gap-2 rounded-none bg-transparent p-0 shadow-none">
        <AlertLamp kind="alerts" className="col-span-2" />
        <AlertLamp kind="logs" className="col-span-2" />
      </TabsList>
      <TabsList aria-label="Communication dashboard" className="communication-navigation">
        {tabs.map(([value, Icon, label]) => {
          const c = COLOURS[value] || '#0891b2';
          return (
            <TabsTrigger
              key={value}
              value={value}
              className="group relative flex min-h-14 min-w-0 flex-col items-center overflow-hidden rounded-xl border p-1 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                borderColor: `${c}40`,
                background: `linear-gradient(165deg, ${c}29 0%, ${c}12 46%, hsl(var(--card)) 82%)`,
                boxShadow: `0 10px 30px -18px ${c}77`,
              }}
            >
              <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${c}, ${c}99)` }} />
              <span className="absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-15 transition-transform group-hover:scale-125" style={{ backgroundColor: c }} />
              <span className="relative mb-1 flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-md transition-transform group-hover:rotate-3 group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }}>
                <Icon aria-hidden="true" className="h-3 w-3" />
              </span>
              <span className="relative text-[11px] font-bold text-foreground">{label}</span>
              <span className="relative mt-0.5 inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-bold" style={{ color: c, backgroundColor: `${c}12` }}>Open</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}