import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wand2, CalendarDays, ClipboardList } from 'lucide-react';

const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

export default function MeetingNavigation({ onSchedule }) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-end">
        <Button
          size="sm"
          className="h-9 rounded-full border-2 border-[#0A2B6D] px-4 font-extrabold text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
          onClick={onSchedule}
        >
          <Plus className="mr-1 h-3.5 w-3.5 text-white" />
          Schedule Meeting
        </Button>
      </div>
      <TabsList aria-label="Meetings & Governance Navigation">
        <TabsTrigger value="register" data-hint="Agendas, attendance & actions">
          <ClipboardList className="h-3.5 w-3.5" />
          Meeting Register &amp; Command
        </TabsTrigger>
        <TabsTrigger value="masterpiece" data-hint="AI smart-fill minutes & tasks">
          <Wand2 className="h-3.5 w-3.5" />
          2026 Smart-Fill Minutes &amp; Tasks
        </TabsTrigger>
        <TabsTrigger value="calendar" data-hint="Scheduled meetings calendar">
          <CalendarDays className="h-3.5 w-3.5" />
          Visual Calendar
        </TabsTrigger>
      </TabsList>
    </div>
  );
}