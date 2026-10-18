import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox as InboxIcon, MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked, History } from 'lucide-react';
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

export default function Communications() {
  return (
    <div className="space-y-6">
      <div className="gradient-brand-soft rounded-2xl p-4 ring-1 ring-brand/10">
        <PageHeader
          title="Communication Centre"
          subtitle="Live system alerts, unread notifications, professional emails, bulk messages, the unified communication diary, shift notes and the employee log. Every entry is recorded on the Communication Register, linked to the person's participant or staff record, and note types route to their matching module."
          accent={['#4f46e5', '#22d3ee']}
        />
      </div>

      <Tabs defaultValue="diary">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="alerts"><Siren className="mr-1 inline h-3.5 w-3.5" />Alerts</TabsTrigger>
          <TabsTrigger value="logs"><History className="mr-1 inline h-3.5 w-3.5" />Alert Logs</TabsTrigger>
          <TabsTrigger value="diary"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Diary</TabsTrigger>
          <TabsTrigger value="inbox"><InboxIcon className="mr-1 inline h-3.5 w-3.5" />Inbox</TabsTrigger>
          <TabsTrigger value="templates"><BookMarked className="mr-1 inline h-3.5 w-3.5" />Templates</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-1 inline h-3.5 w-3.5" />Send Email</TabsTrigger>
          <TabsTrigger value="bulk"><Megaphone className="mr-1 inline h-3.5 w-3.5" />Bulk Messages</TabsTrigger>
          <TabsTrigger value="banter"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Team Banter</TabsTrigger>
          <TabsTrigger value="shoutouts"><Sparkles className="mr-1 inline h-3.5 w-3.5" />Shoutouts</TabsTrigger>
          <TabsTrigger value="complaints"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Complaints</TabsTrigger>
          <TabsTrigger value="todo"><ListTodo className="mr-1 inline h-3.5 w-3.5" />To-Do Board</TabsTrigger>
          <TabsTrigger value="video"><Video className="mr-1 inline h-3.5 w-3.5" />Video Calls</TabsTrigger>
          <TabsTrigger value="ai"><Sparkles className="mr-1 inline h-3.5 w-3.5" />AI Compose</TabsTrigger>
          <TabsTrigger value="shift-notes"><NotebookPen className="mr-1 inline h-3.5 w-3.5" />Shift Notes</TabsTrigger>
          <TabsTrigger value="employee-log"><Briefcase className="mr-1 inline h-3.5 w-3.5" />Employee Log</TabsTrigger>
        </TabsList>
        <TabsContent value="alerts"><AlertsCentre /></TabsContent>
        <TabsContent value="logs"><AutomatedLogs /></TabsContent>
        <TabsContent value="diary"><CommunicationDiary /></TabsContent>
        <TabsContent value="inbox"><Inbox /></TabsContent>
        <TabsContent value="templates"><TemplateLibrary /></TabsContent>
        <TabsContent value="email"><ProfessionalEmail /></TabsContent>
        <TabsContent value="bulk"><BulkMessage /></TabsContent>
        <TabsContent value="banter"><TeamBanter /></TabsContent>
        <TabsContent value="shoutouts"><ShoutoutFeed /></TabsContent>
        <TabsContent value="complaints"><ComplaintsFeed /></TabsContent>
        <TabsContent value="todo">
          <div className="space-y-6"><TodoBoard /><TaskLeaderboard /></div>
        </TabsContent>
        <TabsContent value="video"><VideoCalls /></TabsContent>
        <TabsContent value="ai"><AiCompose /></TabsContent>
        <TabsContent value="shift-notes"><ShiftNotes /></TabsContent>
        <TabsContent value="employee-log"><EmployeeCommLog /></TabsContent>
      </Tabs>
    </div>
  );
}