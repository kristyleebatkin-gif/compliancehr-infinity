import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wand2, CalendarDays, ClipboardList } from 'lucide-react';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

export default function MeetingNavigation({ onSchedule }) {
  return (
    <div className="rounded-3xl p-[10px] shadow-md" style={{ background: TOP_BORDER_GRADIENT }}>
      <div className="meeting-navigation flex flex-wrap items-center gap-2.5 rounded-[14px] bg-white p-2.5">
        <Button
          size="sm"
          className="h-9 rounded-full border-2 border-[#0A2B6D] px-4 font-extrabold text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
          onClick={onSchedule}
        >
          <Plus className="mr-1 h-3.5 w-3.5 text-white" />
          Schedule Meeting
        </Button>
        <TabsList
          data-dashboard-tabs={undefined}
          className="h-auto w-auto flex-1 flex-wrap gap-2 border-0 bg-transparent p-0 shadow-none"
        >
          <TabsTrigger value="register" className="flex-1 text-xs font-extrabold">
            <ClipboardList className="mr-1 h-3.5 w-3.5" />
            Meeting Register &amp; Command
          </TabsTrigger>
          <TabsTrigger value="masterpiece" className="flex-1 text-xs font-extrabold">
            <Wand2 className="mr-1 h-3.5 w-3.5" />
            2026 Smart-Fill Minutes &amp; Tasks
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 text-xs font-extrabold">
            <CalendarDays className="mr-1 h-3.5 w-3.5" />
            Visual Calendar
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}