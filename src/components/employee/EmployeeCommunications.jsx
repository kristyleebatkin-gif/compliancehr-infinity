import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Mail, NotebookPen, Briefcase, Inbox, MessagesSquare, Video,
  Sparkles, ListTodo, BookMarked, Radio, Lightbulb,
} from 'lucide-react';
import EmployeeCommunicationContent from '@/components/employee/EmployeeCommunicationContent';
import CommWeatherBar from '@/components/communications/CommWeatherBar';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';
import { CommunicationAndMailboxTabs } from '@/components/safe/ExecutiveWallScene';
import '@/components/communications/commCentreTheme.css';
import ReportGenerator from '@/components/reports/ReportGenerator';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #A855F7 62%, #FF2E9A 100%)';

const TABS = [
  ['inbox', Inbox, 'Mailbox & Inbox'],
  ['feed', Radio, 'Team Feed'],
  ['todo', ListTodo, 'Tasks'],
  ['shift-notes', NotebookPen, 'Shift Notes'],
  ['diary', MessagesSquare, 'Diary'],
  ['email', Mail, 'Send Email'],
  ['employee-log', Briefcase, 'Employee Log'],
  ['banter', MessagesSquare, 'Team Banter'],
  ['shoutouts', Sparkles, 'Shoutouts'],
  ['video', Video, 'Video Calls'],
  ['complaints', MessagesSquare, 'Complaints'],
  ['ai', Sparkles, 'AI Compose'],
  ['templates', BookMarked, 'Templates'],
  ['guide', Lightbulb, 'Tips & Teamwork'],
];

export default function EmployeeCommunications({ embedded = false }) {
  const [view, setView] = useState('inbox');

  return (
    <div className="comm-centre space-y-2.5">
      <Tabs value={view} onValueChange={setView}>
        {!embedded && (
          <>
            {/* 1. Extracted Communication Title Header & Sentence Underneath */}
            <header
              className="overflow-hidden rounded-xl p-[1.5px] shadow-lg"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-[#0A2B6D]/95 backdrop-blur-sm px-3 py-2 text-white">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A2B6D]/80"
                    style={{
                      border: '1.5px solid #00C6FF',
                      boxShadow: '0 0 10px rgba(0,198,255,0.55)',
                    }}
                  >
                    <MessagesSquare className="h-4 w-4 text-[#00C6FF]" />
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-sm sm:text-base font-black leading-tight tracking-tight text-white">
                      Communication &amp; Mailbox Hub
                    </h1>
                    <p className="text-[11px] font-semibold leading-snug text-slate-300">
                      Communication, mail and live roster together in one dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <ReportGenerator area="communication" />
            {/* 2. Four Exciting & Professional Dashboards for Time, Date, Weather & Active Care Services */}
            <CommWeatherBar />

            {/* 3. Live Roster Dashboard Positioned Directly Under the 4 Dashboards */}
            <RosterMiniOverview />

            {/* 4. Unified Communication & Mailbox Dashboard */}
            <div className="rounded-xl border border-[#0072FF]/60 bg-[#0A2B6D]/95 backdrop-blur-sm p-2.5 text-white">
              <CommunicationAndMailboxTabs
                onSelectTab={setView}
                activeTab={view}
                tabs={TABS}
              />
            </div>
          </>
        )}

        {/* Active Selected Communication Channel Workspace */}
        <div className="rounded-xl border border-[#0072FF]/50 bg-[#0A2B6D]/95 backdrop-blur-sm p-2.5 text-white">
          <TabsContent key={view} value={view} className="mt-0">
            <EmployeeCommunicationContent view={view} />
          </TabsContent>
        </div>

      </Tabs>
    </div>
  );
}