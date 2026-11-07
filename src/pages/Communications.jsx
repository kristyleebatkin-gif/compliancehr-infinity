import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeCommunications from '@/components/employee/EmployeeCommunications';
export default withEmployeeView(Communications, EmployeeCommunications);
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
import EmptyState from '@/components/EmptyState';
import { useRole, ROLES } from '@/lib/useRole';
import AlertsCentre from '@/components/communications/AlertsCentre';
import CommunicationDiary from '@/components/communications/CommunicationDiary';
import Inbox from '@/components/communications/Inbox';
import TeamBanter from '@/components/communications/TeamBanter';
import ProfessionalEmail from '@/components/communications/ProfessionalEmail';
import BulkMessage from '@/components/communications/BulkMessage';
import ShiftNotes from '@/components/communications/ShiftNotes';
import EmployeeCommLog from '@/components/communications/EmployeeCommLog';
import VideoCalls from '@/components/communications/VideoCalls';
import AiCompose from '@/components/communications/AiCompose';
import TemplateLibrary from '@/components/communications/TemplateLibrary';
import AutomatedLogs from '@/components/communications/AutomatedLogs';
import ComplaintsFeed from '@/components/communications/ComplaintsFeed';
import ShoutoutFeed from '@/components/communications/ShoutoutFeed';
import TeamFeed from '@/components/communications/TeamFeed';
import StaffCommPanel from '@/components/communications/StaffCommPanel';
import ProfileCommDiary from '@/components/communications/ProfileCommDiary';
import ProfileTodoList from '@/components/communications/ProfileTodoList';
import CommGuide from '@/components/communications/CommGuide';
import CommWeatherBar from '@/components/communications/CommWeatherBar';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';
import { CommunicationAndMailboxTabs } from '@/components/safe/ExecutiveWallScene';
import '@/components/communications/commCentreTheme.css';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #A855F7 62%, #FF2E9A 100%)';

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

function Communications({ profile, profileKind } = {}) {
  const { role, user } = useRole();
  const employeeSelf = role === ROLES.SUPPORT || role === ROLES.VOLUNTEER;
  const participantOnly = role === ROLES.PARTICIPANT;
  const restricted = employeeSelf || participantOnly;
  const [selfProfile, setSelfProfile] = useState(null);
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
    <div className="comm-centre space-y-2.5">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* 1. Extracted Communication Title Header & Sentence Underneath (Formatted to Match & Fit with Symbol) */}
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
                  Communication, mail and live roster together in one dashboard.
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
        <div className="space-y-2 rounded-xl border border-[#0072FF]/60 bg-[#081018] p-2 text-white">
          <CommunicationAndMailboxTabs
            onSelectTab={setActiveTab}
            activeTab={activeTab}
            tabs={shown}
          />
          <div className="rounded-lg border border-[#0072FF]/50 bg-[#081018] p-2 text-white">
          <TabsContent value="alerts" className="mt-0"><AlertsCentre selfOnly={employeeSelf} /></TabsContent>
          <TabsContent value="meetings" className="mt-0"><MeetingCentre embedded /></TabsContent>
          <TabsContent value="feedback" className="mt-0"><Feedback embedded /></TabsContent>
          <TabsContent value="briefing" className="mt-0"><DailyBriefing /></TabsContent>
          <TabsContent value="notifications" className="mt-0"><Notifications /></TabsContent>
          <TabsContent value="logs" className="mt-0"><AutomatedLogs /></TabsContent>
          <TabsContent value="diary" className="mt-0">
            {effProfile ? (
              effKind === 'participant' ? <ProfileCommDiary participant={effProfile} /> : <StaffCommPanel staff={effProfile} />
            ) : restricted ? (
              <EmptyState title="Your profile is not linked yet" message="Once your profile is linked to your login email, your own communication diary appears here." />
            ) : (
              <CommunicationDiary />
            )}
          </TabsContent>
          <TabsContent value="inbox" className="mt-0"><Inbox /></TabsContent>
          <TabsContent value="templates" className="mt-0"><TemplateLibrary /></TabsContent>
          <TabsContent value="email" className="mt-0"><ProfessionalEmail /></TabsContent>
          <TabsContent value="bulk" className="mt-0"><BulkMessage /></TabsContent>
          <TabsContent value="banter" className="mt-0"><TeamBanter /></TabsContent>
          <TabsContent value="shoutouts" className="mt-0"><ShoutoutFeed /></TabsContent>
          <TabsContent value="feed" className="mt-0"><TeamFeed /></TabsContent>
          <TabsContent value="complaints" className="mt-0"><ComplaintsFeed /></TabsContent>
          <TabsContent value="todo" className="mt-0">
            {effProfile ? <ProfileTodoList person={effProfile} /> : <Button asChild size="sm"><Link to="/tasks?tab=shared-todo">Open Tasks Dashboard</Link></Button>}
          </TabsContent>
          <TabsContent value="guide" className="mt-0"><CommGuide /></TabsContent>
          <TabsContent value="video" className="mt-0"><VideoCalls /></TabsContent>
          <TabsContent value="ai" className="mt-0"><AiCompose /></TabsContent>
          <TabsContent value="shift-notes" className="mt-0">{employeeSelf ? <ShiftNotes selfOnly /> : <ShiftNotes />}</TabsContent>
          <TabsContent value="employee-log" className="mt-0">{employeeSelf ? <EmployeeCommLog selfOnly /> : <EmployeeCommLog />}</TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}