import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeCommunications from '@/components/employee/EmployeeCommunications';
export default withEmployeeView(Communications, EmployeeCommunications);
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone, Mail, NotebookPen, Briefcase, Inbox as InboxIcon,
  MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked,
  History, Radio, Lightbulb, CalendarDays, MessageSquare, Newspaper, Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MeetingCentre from '@/pages/MeetingCentre';
import Feedback from '@/pages/Feedback';
import DailyBriefing from '@/pages/DailyBriefing';
import Notifications from '@/pages/Notifications';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import EmptyState from '@/components/EmptyState';
import { useRole, ROLES } from '@/lib/useRole';
import AlertsCentre from '@/components/communications/AlertsCentre';
import CommunicationDiary from '@/components/communications/CommunicationDiary';
import Inbox from '@/components/communications/Inbox';
import TeamBanter from '@/components/communications/TeamBanter';
import CommTaskDash from '@/components/communications/CommTaskDash';
import CommSharedTodo from '@/components/communications/CommSharedTodo';
import CommTeamDash from '@/components/communications/CommTeamDash';
import TodoBoard from '@/components/communications/TodoBoard';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import ProfessionalEmail from '@/components/communications/ProfessionalEmail';
import BulkMessage from '@/components/communications/BulkMessage';
import ShiftNotes from '@/components/communications/ShiftNotes';
import EmployeeCommLog from '@/components/communications/EmployeeCommLog';
import VideoCalls from '@/components/communications/VideoCalls';
import AiCompose from '@/components/communications/AiCompose';
import TemplateLibrary from '@/components/communications/TemplateLibrary';
import AutomatedLogs, { AutomatedAlertSystem } from '@/components/communications/AutomatedLogs';
import ComplaintsFeed from '@/components/communications/ComplaintsFeed';
import ShoutoutFeed from '@/components/communications/ShoutoutFeed';
import TeamFeed from '@/components/communications/TeamFeed';
import StaffCommPanel from '@/components/communications/StaffCommPanel';
import ProfileCommDiary from '@/components/communications/ProfileCommDiary';
import ProfileTodoList from '@/components/communications/ProfileTodoList';
import CommunicationNavigation from '@/components/communications/CommunicationNavigation';
import CommGuide from '@/components/communications/CommGuide';
import CommWeatherBar from '@/components/communications/CommWeatherBar';
import { CommunicationAndMailboxTabs } from '@/components/safe/ExecutiveWallScene';
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';
import '@/components/communications/commCentreTheme.css';

// Merged Communication & To-Do Tabs (All To-Do Lists & Dashboards Consolidated)
const TABS = [
  ['inbox', InboxIcon, 'Mailbox & Inbox'],
  ['alerts', Siren, 'Alerts'],
  ['todo', ListTodo, 'Merged To-Do & Tasks'],
  ['email', Mail, 'Send Email'],
  ['bulk', Megaphone, 'Bulk Messages'],
  ['diary', MessagesSquare, 'Diary'],
  ['shift-notes', NotebookPen, 'Shift Notes'],
  ['employee-log', Briefcase, 'Employee Log'],
  ['banter', MessagesSquare, 'Team Banter'],
  ['feed', Radio, 'Team Feed'],
  ['shoutouts', Sparkles, 'Shoutouts'],
  ['video', Video, 'Video Calls'],
  ['complaints', MessagesSquare, 'Complaints'],
  ['ai', Sparkles, 'AI Compose'],
  ['templates', BookMarked, 'Templates'],
  ['guide', Lightbulb, 'Tips & Teamwork'],
  ['logs', History, 'System Logs'],
  ['meetings', CalendarDays, 'Meetings'],
  ['feedback', MessageSquare, 'Feedback'],
  ['briefing', Newspaper, 'Daily Briefing'],
  ['notifications', Bell, 'Notifications'],
];

const SELF_TABS = ['alerts', 'diary', 'email', 'shift-notes', 'employee-log', 'todo', 'notifications'];

function Communications({ profile, profileKind, embedded = false } = {}) {
  const { role, user } = useRole();
  const employeeSelf = role === ROLES.SUPPORT || role === ROLES.VOLUNTEER;
  const participantOnly = role === ROLES.PARTICIPANT;
  const restricted = employeeSelf || participantOnly;
  const [selfProfile, setSelfProfile] = useState(null);
  const [commScreen, setCommScreen] = useState('screen1');
  const [activeTab, setActiveTab] = useState(participantOnly ? 'diary' : employeeSelf ? 'alerts' : 'inbox');

  useEffect(() => {
    setActiveTab(participantOnly ? 'diary' : employeeSelf ? 'alerts' : 'inbox');
  }, [participantOnly, employeeSelf]);

  useEffect(() => {
    if (!restricted || profile) return;
    let active = true;
    (async () => {
      try {
        const page = participantOnly
          ? await base44.entities.ParticipantProfile.filter({ email: user?.email || '' }, { limit: 1 })
          : await base44.entities.StaffProfile.filter({ email: user?.email || '' }, { limit: 1 });
        if (active) setSelfProfile(page.items?.[0] || null);
      } catch {
        if (active) setSelfProfile(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [restricted, participantOnly, profile, user?.email]);

  const effProfile = profile || selfProfile;
  const effKind = profileKind || (participantOnly ? 'participant' : 'staff');
  const shown = participantOnly
    ? TABS.filter(([value]) => value === 'diary')
    : employeeSelf
      ? TABS.filter(([value]) => SELF_TABS.includes(value))
      : TABS;

  return (
    <div className="comm-centre space-y-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ModuleShell
          embedded={embedded || participantOnly}
          title="Communication & Mailbox Hub"
          subtitle="Unified Communication, Mailbox, Merged Dashboards & Shared To-Do Lists in one command view."
          icon={MessagesSquare}
          moduleKey="communications"
          tabs={
            !(embedded || participantOnly) && (
              <div className="space-y-2.5">
                {/* Concise 2-Line Switcher Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#0072FF]/60 bg-[#081018] px-3 py-2 text-white">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white">
                      Unified Communication, Mailbox, Meetings &amp; Merged To-Do Command
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-300">
                      All communication dashboards, mailbox alerts, and team to-do lists merged in one place.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ['screen1', 'Communications, Mailbox & To-Do'],
                      ['screen2', 'Meetings & Feedback'],
                      ['both', 'Both Views'],
                    ].map(([k, lbl]) => (
                      <Button
                        key={k}
                        size="sm"
                        className="h-7 border border-[#00C6FF] px-2.5 text-[11px] font-extrabold text-white"
                        style={{
                          backgroundColor: commScreen === k ? '#FF2E9A' : '#0072FF',
                          color: '#FFFFFF',
                        }}
                        onClick={() => setCommScreen(k)}
                      >
                        {lbl}
                      </Button>
                    ))}
                  </div>
                </div>

                <CommWeatherBar />

                {(commScreen === 'screen2' || commScreen === 'both') && (
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    <section className="overflow-hidden rounded-xl border border-[#0072FF]/60 bg-[#081018] p-2.5 text-white">
                      <MeetingCentre embedded />
                    </section>
                    <section className="overflow-hidden rounded-xl border border-[#FF2E9A]/60 bg-[#081018] p-2.5 text-white">
                      <Feedback embedded />
                    </section>
                  </div>
                )}

                {commScreen !== 'screen2' && (
                  <div className="space-y-2.5">
                    {/* Unified Communication, Mailbox, Alert Lamps & All Communication Channels Together */}
                    <div className="rounded-xl border border-[#0072FF]/60 bg-[#081018] p-2.5 space-y-2.5 text-white">
                      <CommunicationAndMailboxTabs
                        onSelectTab={setActiveTab}
                        activeTab={activeTab}
                      />
                      <CommunicationNavigation tabs={shown} onCompose={() => setActiveTab('email')} />
                    </div>

                    {/* Merged All To-Do Lists, Task Dashboards & Task Leaderboard in One Unified Section */}
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
                            onClick={() => setActiveTab('todo')}
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

                    {/* Compact Dark Row: Team Banter & Automated Alert Log */}
                    <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                      <TeamBanter />
                      <AutomatedAlertSystem selfOnly={employeeSelf} />
                    </div>
                  </div>
                )}
              </div>
            )
          }
        >
          {(embedded || participantOnly) && (
            <TabsList aria-label="Communication tools">
              {shown.map(([value, Icon, label]) => (
                <TabsTrigger key={value} value={value} className="min-h-[38px] gap-1.5">
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          <TabsContent value="alerts"><AlertsCentre selfOnly={employeeSelf} /></TabsContent>
          <TabsContent value="meetings"><MeetingCentre embedded /></TabsContent>
          <TabsContent value="feedback"><Feedback embedded /></TabsContent>
          <TabsContent value="briefing"><DailyBriefing /></TabsContent>
          <TabsContent value="notifications"><Notifications /></TabsContent>
          <TabsContent value="logs"><AutomatedLogs /></TabsContent>
          <TabsContent value="diary">
            {effProfile ? (
              effKind === 'participant' ? <ProfileCommDiary participant={effProfile} /> : <StaffCommPanel staff={effProfile} />
            ) : restricted ? (
              <EmptyState title="Your profile is not linked yet" message="Once your profile is linked to your login email, your own communication diary appears here." />
            ) : (
              <CommunicationDiary />
            )}
          </TabsContent>
          <TabsContent value="inbox"><Inbox /></TabsContent>
          <TabsContent value="templates">
            <TemplateLibrary />
          </TabsContent>
          <TabsContent value="email"><ProfessionalEmail /></TabsContent>
          <TabsContent value="bulk"><BulkMessage /></TabsContent>
          <TabsContent value="banter"><TeamBanter /></TabsContent>
          <TabsContent value="shoutouts"><ShoutoutFeed /></TabsContent>
          <TabsContent value="feed"><TeamFeed /></TabsContent>
          <TabsContent value="complaints"><ComplaintsFeed /></TabsContent>
          <TabsContent value="todo">
            {effProfile ? (
              <ProfileTodoList person={effProfile} />
            ) : (
              <div className="space-y-3">
                <CommTaskDash />
                <CommSharedTodo />
                <TodoBoard />
              </div>
            )}
          </TabsContent>
          <TabsContent value="guide"><CommGuide /></TabsContent>
          <TabsContent value="video"><VideoCalls /></TabsContent>
          <TabsContent value="ai"><AiCompose /></TabsContent>
          <TabsContent value="shift-notes">{employeeSelf ? <ShiftNotes selfOnly /> : <ShiftNotes />}</TabsContent>
          <TabsContent value="employee-log">{employeeSelf ? <EmployeeCommLog selfOnly /> : <EmployeeCommLog />}</TabsContent>
        </ModuleShell>
      </Tabs>
    </div>
  );
}