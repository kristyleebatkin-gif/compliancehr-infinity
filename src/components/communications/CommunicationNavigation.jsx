import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import '@/components/communications/communicationNavigation.css';

const TONES = {
  alerts: 'danger', logs: 'muted', diary: 'primary', inbox: 'teal',
  templates: 'warning', email: 'teal', bulk: 'pink', banter: 'safe',
  shoutouts: 'warning', feed: 'safe', complaints: 'danger', todo: 'primary',
  video: 'teal', ai: 'primary', 'shift-notes': 'safe', 'employee-log': 'pink',
};
export default function CommunicationNavigation({ tabs }) {
  return <TabsList aria-label="Communication dashboard" className="communication-navigation">
    {tabs.map(([value, Icon, label]) => <TabsTrigger key={value} value={value} data-tone={TONES[value]} className="communication-navigation-tile">
      <span className="communication-navigation-icon"><Icon aria-hidden="true" /></span>
      <span>{label}</span>
    </TabsTrigger>)}
  </TabsList>;
}