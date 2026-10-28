import React, { useEffect, useState } from 'react';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeCommunications from '@/components/employee/EmployeeCommunications';
export default withEmployeeView(Communications, EmployeeCommunications);
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox as InboxIcon, MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked, History, Radio, LayoutDashboard, Lightbulb, CalendarDays, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MeetingCentre from '@/pages/MeetingCentre';
import Feedback from '@/pages/Feedback';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import EmptyState from '@/components/EmptyState';
import { useRole, ROLES } from '@/lib/useRole';
import AlertsCentre from '@/components/communications/AlertsCentre';
import CommunicationDiary from '@/components/communications/CommunicationDiary';
import Inbox from '@/components/communications/Inbox';
import TeamBanter from '@/components/communications/TeamBanter';
import CommDailyInsight from '@/components/communications/CommDailyInsight';
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
import CommGuide, { AboutCommunication, CommHintsTips } from '@/components/communications/CommGuide';
import CommunicateWell from '@/components/communications/CommunicateWell';
import CommAuditBar from '@/components/communications/CommAuditBar';
import CommWeatherBar from '@/components/communications/CommWeatherBar';
import ExecutiveWallScene, { SmallSafeVaultBar } from '@/components/safe/ExecutiveWallScene';
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';
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
  ['inbox', InboxIcon, 'Inbox'],
  ['email', Mail, 'Send Email'],
  ['shift-notes', NotebookPen, 'Shift Notes'],
  ['employee-log', Briefcase, 'Employee Log'],
  ['meetings', CalendarDays, 'Meetings'],
  ['feedback', MessageSquare, 'Feedback'],
];

const SELF_TABS = ['alerts', 'diary', 'email', 'shift-notes', 'employee-log'];

function Communications({ profile, profileKind, embedded = false } = {}) {
  const { role, user } = useRole();
  const employeeSelf = role === ROLES.SUPPORT || role === ROLES.VOLUNTEER;
  const participantOnly = role === ROLES.PARTICIPANT;
  const restricted = employeeSelf || participantOnly;
  const [selfProfile, setSelfProfile] = useState(null);
  const [commScreen, setCommScreen] = useState('both');

  useEffect(() => {
    if (!restricted || profile) return;
    let active = true;
    (async () => {
      try {
        const page = participantOnly
          ? await base44.entities.ParticipantProfile.filter({ email: user?.email || '' }, { limit: 1 })
          : await base44.entities.StaffProfile.filter({ email: user?.email || '' }, { limit: 1 });
        if (active) setSelfProfile(page.items?.[0] || null);
      } catch { if (active) setSelfProfile(null); }
    })();
    return () => { active = false; };
  }, [restricted, participantOnly, profile, user?.email]);

  const effProfile = profile || selfProfile;
  const effKind = profileKind || (participantOnly ? 'participant' : 'staff');
  const shown = participantOnly ? TABS.filter(([value]) => value === 'diary')
    : employeeSelf ? TABS.filter(([value]) => SELF_TABS.includes(value))
    : TABS;

  return (
    <div className="comm-centre space-y-1">
      <Tabs defaultValue="feed">
        <ModuleShell
          embedded={embedded || participantOnly}
          title="Communication Centre"
          subtitle={employeeSelf
            ? 'Your alerts, your own shift notes and employee log, email, and the communication entries linked to you.'
            : 'Live system alerts, unread notifications, professional emails, bulk messages, the unified communication diary, shift notes and the employee log. Every entry is recorded on the Communication Register, linked to the person\u2019s participant or staff record, and note types route to their matching module.'}
          icon={MessagesSquare}
          moduleKey="communications"
          tabs={!(embedded || participantOnly) && (
            <div className="space-y-2">
              {/* Screen 1 (Communications & Mailbox) + Screen 2 (Meeting Centre & Feedback Surveys) Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-2.5 shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    Dual-Screen Communication, Meetings &amp; Feedback Hub
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                    Screen 1: Communications Mailbox &amp; Logs · Screen 2: Meeting Centre &amp; Feedback Surveys
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ['both', 'Screen 1 + Screen 2 (Meetings & Feedback)'],
                    ['screen1', 'Screen 1: Communications & Mailbox'],
                    ['screen2', 'Screen 2: Meeting Centre & Feedback'],
                  ].map(([k, lbl]) => (
                    <Button
                      key={k}
                      size="sm"
                      variant={commScreen === k ? 'default' : 'outline'}
                      className="border-2 border-[#0A2B6D] font-extrabold"
                      onClick={() => setCommScreen(k)}
                    >
                      {lbl}
                    </Button>
                  ))}
                </div>
              </div>

              <CommWeatherBar />
              <CommunicationNavigation tabs={shown} />

              {/* SCREEN 2 IN COMMUNICATION CENTRE: MEETING CENTRE & FEEDBACK SURVEYS */}
              {(commScreen === 'screen2' || commScreen === 'both') && (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
                    <div
                      className="flex items-center justify-between border-b-2 border-[#0A2B6D] px-4 py-2 text-white"
                      style={{ background: 'var(--header-gradient)' }}
                    >
                      <span className="text-xs font-extrabold text-white">
                        Screen 2A · Meeting Centre (Agendas, Minutes &amp; Actions)
                      </span>
                      <span className="rounded-full bg-[#00C6FF] px-2 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]">
                        Screen 2
                      </span>
                    </div>
                    <div className="p-2.5">
                      <MeetingCentre embedded />
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
                    <div
                      className="flex items-center justify-between border-b-2 border-[#0A2B6D] px-4 py-2 text-white"
                      style={{ background: 'var(--header-gradient)' }}
                    >
                      <span className="text-xs font-extrabold text-white">
                        Screen 2B · Feedback &amp; Surveys Register
                      </span>
                      <span className="rounded-full bg-[#FF2E9A] px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                        Screen 2
                      </span>
                    </div>
                    <div className="p-2.5">
                      <Feedback embedded />
                    </div>
                  </section>
                </div>
              )}

              {commScreen !== 'screen2' && (
                <>
                  <ExecutiveWallScene showAllModulesMinimised={true} showRosterAbove={true} />
                  <CommDailyInsight />
                  <CommAuditBar />
                  <CommHintsTips />
                  <CommunicateWell />
                  <CommTaskDash />
                  <CommTeamDash />
                  <CommSharedTodo />
                </>
              )}
            </div>
          )}
        >
        <TabsContent value="alerts"><AlertsCentre selfOnly={employeeSelf} /></TabsContent>
        <TabsContent value="meetings"><MeetingCentre embedded /></TabsContent>
        <TabsContent value="feedback"><Feedback embedded /></TabsContent>
        <TabsContent value="logs"><AutomatedLogs /></TabsContent>
        <TabsContent value="diary">
          {effProfile ? (effKind === 'participant' ? <ProfileCommDiary participant={effProfile} /> : <StaffCommPanel staff={effProfile} />)
            : restricted
              ? <EmptyState title="Your profile is not linked yet" message="Once your profile is linked to your login email, your own communication diary appears here." />
              : <CommunicationDiary />}
        </TabsContent>
        <TabsContent value="inbox"><Inbox /></TabsContent>
        <TabsContent value="templates">
          <div className="space-y-4">
            {!restricted && <EnterpriseStandardQualityGateSuite />}
            <TemplateLibrary />
          </div>
        </TabsContent>
        <TabsContent value="email"><ProfessionalEmail /></TabsContent>
        <TabsContent value="bulk"><BulkMessage /></TabsContent>
        <TabsContent value="banter"><TeamBanter /></TabsContent>
        <TabsContent value="shoutouts"><ShoutoutFeed /></TabsContent>
        <TabsContent value="feed"><TeamFeed /></TabsContent>
        <TabsContent value="complaints"><ComplaintsFeed /></TabsContent>
        <TabsContent value="todo">
          {effProfile ? <ProfileTodoList person={effProfile} /> : <TodoBoard />}
        </TabsContent>
        <TabsContent value="task-dashboard">
          {effProfile ? <ProfileTodoList person={effProfile} /> : <div className="space-y-4"><CommTaskDash /><CommTeamDash /><TodoBoard compact /></div>}
        </TabsContent>
        <TabsContent value="guide"><CommGuide /></TabsContent>
        <TabsContent value="video"><VideoCalls /></TabsContent>
        <TabsContent value="ai"><AiCompose /></TabsContent>
        <TabsContent value="shift-notes">{employeeSelf ? <ShiftNotes selfOnly /> : <ShiftNotes />}</TabsContent>
        <TabsContent value="employee-log">{employeeSelf ? <EmployeeCommLog selfOnly /> : <EmployeeCommLog />}</TabsContent>
        <TabsContent value="smart-vault"><SmallSafeVaultBar /></TabsContent>
        {!(embedded || participantOnly) && <SmallSafeVaultBar />}
        {!(embedded || participantOnly) && <TeamBanter />}
        {!(embedded || participantOnly) && <TaskLeaderboard compact />}
        {!(embedded || participantOnly) && <AutomatedAlertSystem selfOnly={employeeSelf} />}
        </ModuleShell>
      </Tabs>
    </div>
  );
}