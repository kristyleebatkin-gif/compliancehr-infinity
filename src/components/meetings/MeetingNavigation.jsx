import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export default function MeetingNavigation({ onSchedule }) {
  return <div className="meeting-navigation flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
    <Button size="sm" variant="outline" className="meeting-pink" onClick={onSchedule}><Plus className="h-3.5 w-3.5" />Schedule meeting</Button>
    <TabsList data-dashboard-tabs={undefined} className="h-auto w-auto flex-1 flex-nowrap bg-transparent p-0 shadow-none">
      <TabsTrigger data-dashboard-tab={undefined} value="register" className="flex-1 text-[11px]">Meeting register</TabsTrigger>
      <TabsTrigger data-dashboard-tab={undefined} value="calendar" className="flex-1 text-[11px]">Calendar</TabsTrigger>
    </TabsList>
  </div>;
}