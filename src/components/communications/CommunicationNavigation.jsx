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
      <TabsList aria-label="Communication dashboard" className="communication-navigation">
        {tabs.map(([value, Icon, label]) => {
          const c = COLOURS[value] || '#0891b2';
          return (
            <TabsTrigger
              key={value}
              value={value}
              className="group relative flex min-h-24 min-w-0 flex-col items-center overflow-hidden rounded-xl border p-2 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                borderColor: `${c}40`,
                background: `linear-gradient(165deg, ${c}29 0%, ${c}12 46%, hsl(var(--card)) 82%)`,
                boxShadow: `0 10px 30px -18px ${c}77`,
              }}
            >
              <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${c}, ${c}99)` }} />
              <span className="absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-15 transition-transform group-hover:scale-125" style={{ backgroundColor: c }} />
              <span className="relative mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-md transition-transform group-hover:rotate-3 group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }}>
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <span className="relative text-xs font-bold text-foreground">{label}</span>
              <span className="relative mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color: c, backgroundColor: `${c}12` }}>Open</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {/* Bottom corner lights: alerts and the alert log glow (and sound) as alerts arrive. */}
      <div className="flex items-stretch justify-between gap-2">
        <AlertLamp kind="alerts" />
        <AlertLamp kind="logs" />
      </div>
    </div>
  );
}