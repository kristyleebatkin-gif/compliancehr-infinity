import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Trophy, LifeBuoy, Inbox as InboxIcon, MessagesSquare, ListTodo } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import CommunicationDiary from '@/components/communications/CommunicationDiary';
import Inbox from '@/components/communications/Inbox';
import ProfessionalEmail from '@/components/communications/ProfessionalEmail';
import BulkMessage from '@/components/communications/BulkMessage';
import ShiftNotes from '@/components/communications/ShiftNotes';
import EmployeeCommLog from '@/components/communications/EmployeeCommLog';
import HelpDesk from '@/components/communications/HelpDesk';
import TodoBoard from '@/components/communications/TodoBoard';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';

export default function Communications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Centre"
        subtitle="Professional emails, bulk messages, the unified communication diary with replies, shift notes, the employee log, the shared to-do board, the task leaderboard and the help desk."
      />

      <Tabs defaultValue="diary">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="diary"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Diary</TabsTrigger>
          <TabsTrigger value="inbox"><InboxIcon className="mr-1 inline h-3.5 w-3.5" />Inbox</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-1 inline h-3.5 w-3.5" />Send Email</TabsTrigger>
          <TabsTrigger value="bulk"><Megaphone className="mr-1 inline h-3.5 w-3.5" />Bulk Messages</TabsTrigger>
          <TabsTrigger value="shift-notes"><NotebookPen className="mr-1 inline h-3.5 w-3.5" />Shift Notes</TabsTrigger>
          <TabsTrigger value="employee-log"><Briefcase className="mr-1 inline h-3.5 w-3.5" />Employee Log</TabsTrigger>
          <TabsTrigger value="todo"><ListTodo className="mr-1 inline h-3.5 w-3.5" />To-Do &amp; Leaderboard</TabsTrigger>
          <TabsTrigger value="help"><LifeBuoy className="mr-1 inline h-3.5 w-3.5" />Help Desk</TabsTrigger>
        </TabsList>
        <TabsContent value="diary"><CommunicationDiary /></TabsContent>
        <TabsContent value="inbox"><Inbox /></TabsContent>
        <TabsContent value="email"><ProfessionalEmail /></TabsContent>
        <TabsContent value="bulk"><BulkMessage /></TabsContent>
        <TabsContent value="shift-notes"><ShiftNotes /></TabsContent>
        <TabsContent value="employee-log"><EmployeeCommLog /></TabsContent>
        <TabsContent value="todo">
          <div className="space-y-6">
            <TodoBoard />
            <TaskLeaderboard />
          </div>
        </TabsContent>
        <TabsContent value="help"><HelpDesk /></TabsContent>
      </Tabs>
    </div>
  );
}