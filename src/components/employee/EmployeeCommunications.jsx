import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Mail, NotebookPen, Briefcase, Inbox, MessagesSquare, Video, Sparkles, ListTodo, BookMarked, Radio, LayoutDashboard, Lightbulb } from 'lucide-react';
import CommunicationNavigation from '@/components/communications/CommunicationNavigation';
import EmployeeCommunicationContent from '@/components/employee/EmployeeCommunicationContent';
import ModuleShell from '@/components/module/ModuleShell';
import CommWeatherBar from '@/components/communications/CommWeatherBar';
import CommTaskDash from '@/components/communications/CommTaskDash';
import CommAuditBar from '@/components/communications/CommAuditBar';
import TeamBanter from '@/components/communications/TeamBanter';
import CommDailyInsight from '@/components/communications/CommDailyInsight';
import CommunicateWell from '@/components/communications/CommunicateWell';
import { AboutCommunication, CommHintsTips } from '@/components/communications/CommGuide';
import CommTeamDash from '@/components/communications/CommTeamDash';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import CommSharedTodo from '@/components/communications/CommSharedTodo';
import { AutomatedAlertSystem } from '@/components/communications/AutomatedLogs';
import '@/components/communications/commCentreTheme.css';

const TABS = [
  ['task-dashboard', LayoutDashboard, 'Tasks'],
  ['todo', ListTodo, 'To-Do Board'],
  ['guide', Lightbulb, 'Tips & Teamwork'],
  ['templates', BookMarked, 'Templates'],
  ['banter', MessagesSquare, 'Team Banter'],
  ['feed', Radio, 'Team Feed'],
  ['shoutouts', Sparkles, 'Shoutouts'],
  ['video', Video, 'Video Calls'],
  ['complaints', MessagesSquare, 'Complaints'],
  ['ai', Sparkles, 'AI Compose'],
  ['diary', MessagesSquare, 'Diary'],
  ['inbox', Inbox, 'Inbox'],
  ['email', Mail, 'Send Email'],
  ['shift-notes', NotebookPen, 'Shift Notes'],
  ['employee-log', Briefcase, 'Employee Log'],
];

export default function EmployeeCommunications({ embedded = false }) {
  const [view, setView] = useState('feed');
  return (
    <div className="comm-centre space-y-2">
      <Tabs value={view} onValueChange={setView}>
        <ModuleShell
          embedded={embedded}
          title="My Communication Centre"
          subtitle="Your personal communications, team updates, shift notes, and tasks."
          icon={MessagesSquare}
          moduleKey="communications"
          tabs={!embedded && (
            <div className="space-y-2.5">
              <CommWeatherBar />
              <CommunicationNavigation tabs={TABS} />
              <div className="rounded-xl border border-[#0072FF]/60 bg-[#081018] p-3 space-y-2.5 text-white">
                <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3">
                  <CommTaskDash />
                  <CommSharedTodo />
                  <TaskLeaderboard compact />
                </div>
                <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                  <TeamBanter />
                  <AutomatedAlertSystem selfOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
                <CommDailyInsight />
                <CommTeamDash />
                <RosterMiniOverview />
              </div>
              <CommAuditBar />
              <AboutCommunication />
              <CommHintsTips />
              <CommunicateWell />
            </div>
          )}
        >
          <TabsContent key={view} value={view}><EmployeeCommunicationContent view={view} /></TabsContent>
        </ModuleShell>
      </Tabs>
    </div>
  );
}