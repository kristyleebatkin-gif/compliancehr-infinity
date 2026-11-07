import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Mail, NotebookPen, Briefcase, Inbox, MessagesSquare, Video,
  Sparkles, ListTodo, BookMarked, Radio, LayoutDashboard, Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmployeeCommunicationContent from '@/components/employee/EmployeeCommunicationContent';
import CommWeatherBar from '@/components/communications/CommWeatherBar';
import CommTaskDash from '@/components/communications/CommTaskDash';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import CommSharedTodo from '@/components/communications/CommSharedTodo';
import { CommunicationAndMailboxTabs } from '@/components/safe/ExecutiveWallScene';
import '@/components/communications/commCentreTheme.css';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #A855F7 62%, #FF2E9A 100%)';

const TABS = [
  ['inbox', Inbox, 'Mailbox & Inbox'],
  ['feed', Radio, 'Team Feed'],
  ['todo', ListTodo, 'To-Do Board'],
  ['task-dashboard', LayoutDashboard, 'Tasks'],
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
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-[#081018] px-3 py-2 text-white">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black"
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
                      Unified Communication, Mailbox, Live Roster, Merged Tasks &amp; Shared To-Do Lists in one command view.
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* 2. Four Exciting & Professional Dashboards for Time, Date, Weather & Active Care Services */}
            <CommWeatherBar />

            {/* 3. Live Roster Dashboard Positioned Directly Under the 4 Dashboards */}
            <RosterMiniOverview />

            {/* 4. Unified Communication & Mailbox Dashboard */}
            <div className="rounded-xl border border-[#0072FF]/60 bg-[#081018] p-2.5 text-white">
              <CommunicationAndMailboxTabs
                onSelectTab={setView}
                activeTab={view}
                tabs={TABS}
              />
            </div>
          </>
        )}

        {/* Active Selected Communication Channel Workspace */}
        <div className="rounded-xl border border-[#0072FF]/50 bg-[#081018] p-2.5 text-white">
          <TabsContent key={view} value={view} className="mt-0">
            <EmployeeCommunicationContent view={view} />
          </TabsContent>
        </div>

        {/* 5. Unified Tasks, Shared To-Do List & Task Leaderboard */}
        {!embedded && (
          <div className="rounded-xl border border-[#0072FF]/60 bg-[#081018] p-3 space-y-2.5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white">
                  Unified Tasks, Shared To-Do List &amp; Task Leaderboard
                </h3>
                <p className="text-[11px] text-slate-300">
                  All personal, team, shared to-do lists, and task leaderboards grouped together.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => setView('todo')}
                  className="h-7 bg-[#0072FF] text-[11px] font-extrabold text-white"
                >
                  Open Full To-Do Board
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-7 border-[#00C6FF]/60 bg-[#081018] text-[11px] font-extrabold text-white hover:bg-[#0072FF]"
                >
                  <Link to="/tasks">Open Tasks Hub</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3">
              <CommTaskDash />
              <CommSharedTodo />
              <TaskLeaderboard compact />
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}