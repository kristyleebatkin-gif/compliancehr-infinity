import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wand2, CalendarDays, Sparkles, ClipboardList } from 'lucide-react';

export default function MeetingNavigation({ onSchedule }) {
  return (
    <div className="meeting-navigation flex flex-wrap items-center gap-2 rounded-xl border border-purple-300 bg-white p-1.5 shadow-sm">
      <Button
        size="sm"
        variant="outline"
        className="meeting-pink font-body font-black"
        onClick={onSchedule}
      >
        <Plus className="h-3.5 w-3.5" />
        Schedule Meeting
      </Button>
      <TabsList
        data-dashboard-tabs={undefined}
        className="h-auto w-auto flex-1 flex-wrap bg-transparent p-0 shadow-none gap-1"
      >
        <TabsTrigger
          data-dashboard-tab={undefined}
          value="register"
          className="flex-1 text-[11px] font-extrabold"
        >
          <ClipboardList className="mr-1 h-3.5 w-3.5" />
          Meeting Register &amp; Command
        </TabsTrigger>
        <TabsTrigger
          data-dashboard-tab={undefined}
          value="masterpiece"
          className="flex-1 text-[11px] font-extrabold"
        >
          <Wand2 className="mr-1 h-3.5 w-3.5" />
          2026 Smart-Fill Minutes &amp; Tasks
        </TabsTrigger>
        <TabsTrigger
          data-dashboard-tab={undefined}
          value="calendar"
          className="flex-1 text-[11px] font-extrabold"
        >
          <CalendarDays className="mr-1 h-3.5 w-3.5" />
          Visual Calendar
        </TabsTrigger>
      </TabsList>
    </div>
  );
}