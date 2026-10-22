import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox, MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked, History, Radio, LayoutDashboard, Lightbulb } from 'lucide-react';
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
import TeamFeed from '@/components/communications/TeamFeed';
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
              <CommDailyInsight />
              <CommAuditBar />
              <AboutCommunication />
              <CommHintsTips />
              <CommunicateWell />
              <CommTaskDash />
              <CommTeamDash />
              <RosterMiniOverview />
              <CommSharedTodo />
              <CommunicationNavigation tabs={TABS} />
            </div>
          )}
        >
          <TabsContent key={view} value={view}><EmployeeCommunicationContent view={view} /></TabsContent>
          {!embedded && <TeamBanter />}
          {!embedded && <TaskLeaderboard compact />}
          {!embedded && <AutomatedAlertSystem selfOnly />}
        </ModuleShell>
      </Tabs>
    </div>
  );
}