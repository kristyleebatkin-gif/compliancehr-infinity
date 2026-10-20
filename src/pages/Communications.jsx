import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox as InboxIcon, MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked, History, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
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

// Literal gradient classes so Tailwind keeps them in the build.
const TAB_TONES = {
  alerts: 'data-[state=active]:from-rose-500 data-[state=active]:to-red-400',
  logs: 'data-[state=active]:from-slate-500 data-[state=active]:to-slate-400',
  diary: 'data-[state=active]:from-indigo-500 data-[state=active]:to-violet-400',
  inbox: 'data-[state=active]:from-sky-500 data-[state=active]:to-cyan-400',
  templates: 'data-[state=active]:from-amber-500 data-[state=active]:to-orange-400',
  email: 'data-[state=active]:from-blue-500 data-[state=active]:to-indigo-400',
  bulk: 'data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-400',
  banter: 'data-[state=active]:from-teal-500 data-[state=active]:to-emerald-400',
  shoutouts: 'data-[state=active]:from-yellow-500 data-[state=active]:to-amber-400',
  feed: 'data-[state=active]:from-cyan-500 data-[state=active]:to-teal-400',
  complaints: 'data-[state=active]:from-rose-500 data-[state=active]:to-orange-400',
  todo: 'data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-400',
  video: 'data-[state=active]:from-emerald-500 data-[state=active]:to-green-400',
  ai: 'data-[state=active]:from-purple-500 data-[state=active]:to-indigo-400',
  'shift-notes': 'data-[state=active]:from-lime-500 data-[state=active]:to-teal-400',
  'employee-log': 'data-[state=active]:from-stone-500 data-[state=active]:to-neutral-400',
};

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
  ['video', Video, 'Video Calls'],
  ['ai', Sparkles, 'AI Compose'],
  ['shift-notes', NotebookPen, 'Shift Notes'],
  ['employee-log', Briefcase, 'Employee Log'],
];

// Employees only get alerts for them, their own shift notes and employee log,
// send email, and the diary entries linked to them. Participants see their own diary only.
const SELF_TABS = ['alerts', 'diary', 'email', 'shift-notes', 'employee-log'];

export default function Communications({ profile, profileKind, embedded = false } = {}) {
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
    <div className="space-y-6">
      {!embedded && !participantOnly && <div className="gradient-brand-soft rounded-2xl p-4 ring-1 ring-brand/10">
        <PageHeader
          title="Communication Centre"
          subtitle={employeeSelf
            ? 'Your alerts, your own shift notes and employee log, email, and the communication entries linked to you.'
            : 'Live system alerts, unread notifications, professional emails, bulk messages, the unified communication diary, shift notes and the employee log. Every entry is recorded on the Communication Register, linked to the person\u2019s participant or staff record, and note types route to their matching module.'}
          accent={['#4f46e5', '#22d3ee']}
        />
      </div>}

      <Tabs defaultValue="diary">
        <TabsList className="flex flex-wrap gap-1 rounded-2xl border border-border/60 bg-muted/50 p-1.5 shadow-sm">
          {shown.map(([value, Icon, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors data-[state=active]:bg-gradient-to-r data-[state=active]:text-white ${TAB_TONES[value]}`}
            >
              <Icon className="mr-1 inline h-3.5 w-3.5" />{label}
            </TabsTrigger>
          ))}
        </TabsList>
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
          {effProfile ? <ProfileTodoList person={effProfile} /> : <div className="space-y-6"><TodoBoard /><TaskLeaderboard /></div>}
        </TabsContent>
        <TabsContent value="video"><VideoCalls /></TabsContent>
        <TabsContent value="ai"><AiCompose /></TabsContent>
        <TabsContent value="shift-notes">{employeeSelf ? <ShiftNotes selfOnly /> : <ShiftNotes />}</TabsContent>
        <TabsContent value="employee-log">{employeeSelf ? <EmployeeCommLog selfOnly /> : <EmployeeCommLog />}</TabsContent>
      </Tabs>
    </div>
  );
}