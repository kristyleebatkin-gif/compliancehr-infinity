import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox as InboxIcon, MessagesSquare } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import CommunicationDiary from '@/components/communications/CommunicationDiary';
import Inbox from '@/components/communications/Inbox';
import ProfessionalEmail from '@/components/communications/ProfessionalEmail';
import BulkMessage from '@/components/communications/BulkMessage';
import ShiftNotes from '@/components/communications/ShiftNotes';
import EmployeeCommLog from '@/components/communications/EmployeeCommLog';

export default function Communications() {
  return (
    <div className="space-y-6">
      <div className="gradient-brand-soft rounded-2xl p-4 ring-1 ring-brand/10">
        <PageHeader
          title="Communication Centre"
          subtitle="Professional emails, bulk messages, the unified communication diary, shift notes and the employee log. Every entry is recorded on the Communication Register and copied to the linked person's profile, and note types route to their matching module."
          accent={['#4f46e5', '#22d3ee']}
        />
      </div>

      <Tabs defaultValue="diary">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="diary"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Diary</TabsTrigger>
          <TabsTrigger value="inbox"><InboxIcon className="mr-1 inline h-3.5 w-3.5" />Inbox</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-1 inline h-3.5 w-3.5" />Send Email</TabsTrigger>
          <TabsTrigger value="bulk"><Megaphone className="mr-1 inline h-3.5 w-3.5" />Bulk Messages</TabsTrigger>
          <TabsTrigger value="shift-notes"><NotebookPen className="mr-1 inline h-3.5 w-3.5" />Shift Notes</TabsTrigger>
          <TabsTrigger value="employee-log"><Briefcase className="mr-1 inline h-3.5 w-3.5" />Employee Log</TabsTrigger>
        </TabsList>
        <TabsContent value="diary"><CommunicationDiary /></TabsContent>
        <TabsContent value="inbox"><Inbox /></TabsContent>
        <TabsContent value="email"><ProfessionalEmail /></TabsContent>
        <TabsContent value="bulk"><BulkMessage /></TabsContent>
        <TabsContent value="shift-notes"><ShiftNotes /></TabsContent>
        <TabsContent value="employee-log"><EmployeeCommLog /></TabsContent>
      </Tabs>
    </div>
  );
}