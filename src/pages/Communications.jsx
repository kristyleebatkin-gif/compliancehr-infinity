import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox as InboxIcon, MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked, History, Radio } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
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

export default function Communications({ profile, profileKind, embedded = false } = {}) {
  return (
    <div className="space-y-6">
      {!embedded && <div className="gradient-brand-soft rounded-2xl p-4 ring-1 ring-brand/10">
        <PageHeader
          title="Communication Centre"
          subtitle="Live system alerts, unread notifications, professional emails, bulk messages, the unified communication diary, shift notes and the employee log. Every entry is recorded on the Communication Register, linked to the person's participant or staff record, and note types route to their matching module."
          accent={['#4f46e5', '#22d3ee']}
        />
      </div>}

      <Tabs defaultValue="diary">
        <TabsList className="flex flex-wrap gap-1 rounded-2xl border border-border/60 bg-muted/50 p-1.5 shadow-sm">
          {[
            ['alerts', <Siren key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Alerts', 'from-rose-500 to-red-400'],
            ['logs', <History key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Alert Logs', 'from-slate-500 to-slate-400'],
            ['diary', <MessagesSquare key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Diary', 'from-indigo-500 to-violet-400'],
            ['inbox', <InboxIcon key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Inbox', 'from-sky-500 to-cyan-400'],
            ['templates', <BookMarked key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Templates', 'from-amber-500 to-orange-400'],
            ['email', <Mail key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Send Email', 'from-blue-500 to-indigo-400'],
            ['bulk', <Megaphone key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Bulk Messages', 'from-fuchsia-500 to-pink-400'],
            ['banter', <MessagesSquare key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Team Banter', 'from-teal-500 to-emerald-400'],
            ['shoutouts', <Sparkles key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Shoutouts', 'from-yellow-500 to-amber-400'],
            ['feed', <Radio key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Team Feed', 'from-cyan-500 to-teal-400'],
            ['complaints', <MessagesSquare key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Complaints', 'from-rose-500 to-orange-400'],
            ['todo', <ListTodo key="i" className="mr-1 inline h-3.5 w-3.5" />, 'To-Do Board', 'from-violet-500 to-fuchsia-400'],
            ['video', <Video key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Video Calls', 'from-emerald-500 to-green-400'],
            ['ai', <Sparkles key="i" className="mr-1 inline h-3.5 w-3.5" />, 'AI Compose', 'from-purple-500 to-indigo-400'],
            ['shift-notes', <NotebookPen key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Shift Notes', 'from-lime-500 to-teal-400'],
            ['employee-log', <Briefcase key="i" className="mr-1 inline h-3.5 w-3.5" />, 'Employee Log', 'from-stone-500 to-neutral-400'],
          ].map(([value, icon, label, tone]) => (
            <TabsTrigger
              key={value}
              value={value}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors data-[state=active]:bg-gradient-to-r data-[state=active]:text-white ${TAB_TONES[value]}`}
            >
              {icon}{label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="alerts"><AlertsCentre /></TabsContent>
        <TabsContent value="logs"><AutomatedLogs /></TabsContent>
        <TabsContent value="diary">{profile ? profileKind === 'participant' ? <ProfileCommDiary participant={profile} /> : <StaffCommPanel staff={profile} /> : <CommunicationDiary />}</TabsContent>
        <TabsContent value="inbox"><Inbox /></TabsContent>
        <TabsContent value="templates"><TemplateLibrary /></TabsContent>
        <TabsContent value="email"><ProfessionalEmail /></TabsContent>
        <TabsContent value="bulk"><BulkMessage /></TabsContent>
        <TabsContent value="banter"><TeamBanter /></TabsContent>
        <TabsContent value="shoutouts"><ShoutoutFeed /></TabsContent>
        <TabsContent value="feed"><TeamFeed /></TabsContent>
        <TabsContent value="complaints"><ComplaintsFeed /></TabsContent>
        <TabsContent value="todo">
          {profile ? <ProfileTodoList person={profile} /> : <div className="space-y-6"><TodoBoard /><TaskLeaderboard /></div>}
        </TabsContent>
        <TabsContent value="video"><VideoCalls /></TabsContent>
        <TabsContent value="ai"><AiCompose /></TabsContent>
        <TabsContent value="shift-notes"><ShiftNotes /></TabsContent>
        <TabsContent value="employee-log"><EmployeeCommLog /></TabsContent>
      </Tabs>
    </div>
  );
}