import React, { useEffect, useState } from 'react';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeCommunications from '@/components/employee/EmployeeCommunications';
export default withEmployeeView(Communications, EmployeeCommunications);
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox as InboxIcon, MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked, History, Radio, LayoutDashboard, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import EmptyState from '@/components/EmptyState';
import { useRole, ROLES } from '@/lib/useRole';
import AlertsCentre from '@/components/communications/AlertsCentre';
import CommunicationDiary from '@/components/communications/CommunicationDiary';
import Inbox from '@/components/communications/Inbox';
import TeamBanter from '@/components/communications/TeamBanter';
import TodoBoard from '@/components/communications/TodoBoard';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
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
import CommunicationNavigation from '@/components/communications/CommunicationNavigation';
import CommGuide from '@/components/communications/CommGuide';

const TABS = [
  ['alerts', Siren, 'Alerts'],
  ['logs', History, 'Alert Logs'],
  ['diary', MessagesSquare, 'Diary'],
  ['inbox', InboxIcon, 'Inbox'],
  ['templates', BookMarked, 'Templates'],
  ['email', Mail, 'Send Email'],
  ['bulk', Megaphone, 'Bulk Messages'],
  ['banter', MessagesSquare, 'Team Banter'],
  ['shoutouts', Sparkles, 'Shoutouts'],
  ['feed', Radio, 'Team Feed'],
  ['complaints', MessagesSquare, 'Complaints'],
  ['todo', ListTodo, 'To-Do Board'],
  ['task-dashboard', LayoutDashboard, 'Task Dashboard'],
  ['guide', Lightbulb, 'Tips & Teamwork'],
  ['video', Video, 'Video Calls'],
  ['ai', Sparkles, 'AI Compose'],
  ['shift-notes', NotebookPen, 'Shift Notes'],
  ['employee-log', Briefcase, 'Employee Log'],
];

// Employees only get alerts for them, their own shift notes and employee log,
// send email, and the diary entries linked to them. Participants see their own diary only.
const SELF_TABS = ['alerts', 'diary', 'email', 'shift-notes', 'employee-log'];

function Communications({ profile, profileKind, embedded = false } = {}) {
  const { role, user } = useRole();
  const employeeSelf = role === ROLES.SUPPORT || role === ROLES.VOLUNTEER;
  const participantOnly = role === ROLES.PARTICIPANT;
  const restricted = employeeSelf || participantOnly;
  const [selfProfile, setSelfProfile] = useState(null);

  // Standalone view for a restricted user: resolve their own profile so the
  // diary shows only entries about them.
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
    <div className="comm-centre space-y-4">
      <Tabs defaultValue="feed">
        <ModuleShell
          embedded={embedded || participantOnly}
          title="Communication Centre"
          subtitle={employeeSelf
            ? 'Your alerts, your own shift notes and employee log, email, and the communication entries linked to you.'
            : 'Live system alerts, unread notifications, professional emails, bulk messages, the unified communication diary, shift notes and the employee log. Every entry is recorded on the Communication Register, linked to the person\u2019s participant or staff record, and note types route to their matching module.'}
          icon={MessagesSquare}
          moduleKey="communications"
          tabs={<CommunicationNavigation tabs={shown} />}
        >
        <TabsContent value="alerts"><AlertsCentre selfOnly={employeeSelf} /></TabsContent>
        <TabsContent value="logs"><AutomatedLogs /></TabsContent>
        <TabsContent value="diary">
          {effProfile ? (effKind === 'participant' ? <ProfileCommDiary participant={effProfile} /> : <StaffCommPanel staff={effProfile} />)
            : restricted
              ? <EmptyState title="Your profile is not linked yet" message="Once your profile is linked to your login email, your own communication diary appears here." />
              : <CommunicationDiary />}
        </TabsContent>
        <TabsContent value="inbox"><Inbox /></TabsContent>
        <TabsContent value="templates"><TemplateLibrary /></TabsContent>
        <TabsContent value="email"><ProfessionalEmail /></TabsContent>
        <TabsContent value="bulk"><BulkMessage /></TabsContent>
        <TabsContent value="banter"><TeamBanter /></TabsContent>
        <TabsContent value="shoutouts"><ShoutoutFeed /></TabsContent>
        <TabsContent value="feed"><TeamFeed /></TabsContent>
        <TabsContent value="complaints"><ComplaintsFeed /></TabsContent>
        <TabsContent value="todo">
          {effProfile ? <ProfileTodoList person={effProfile} /> : <div className="space-y-4"><TodoBoard /><TaskLeaderboard /></div>}
        </TabsContent>
        <TabsContent value="task-dashboard">
          {effProfile ? <ProfileTodoList person={effProfile} /> : <div className="space-y-4"><TodoBoard compact /><TaskLeaderboard /></div>}
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