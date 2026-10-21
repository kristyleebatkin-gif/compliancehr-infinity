import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Megaphone, Mail, NotebookPen, Briefcase, Inbox, MessagesSquare, Video, Sparkles, Siren, ListTodo, BookMarked, History, Radio } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import CommunicationNavigation from '@/components/communications/CommunicationNavigation';
import EmployeeCommunicationContent from '@/components/employee/EmployeeCommunicationContent';
const TABS = [['alerts', Siren, 'Alerts'], ['logs', History, 'Alert Logs'], ['diary', MessagesSquare, 'Diary'], ['inbox', Inbox, 'Inbox'], ['templates', BookMarked, 'Templates'], ['email', Mail, 'Send Email'], ['bulk', Megaphone, 'Bulk Messages'], ['banter', MessagesSquare, 'Team Banter'], ['shoutouts', Sparkles, 'Shoutouts'], ['feed', Radio, 'Team Feed'], ['complaints', MessagesSquare, 'Complaints'], ['todo', ListTodo, 'To-Do Board'], ['video', Video, 'Video Calls'], ['ai', Sparkles, 'AI Compose'], ['shift-notes', NotebookPen, 'Shift Notes'], ['employee-log', Briefcase, 'Employee Log']];
export default function EmployeeCommunications({ embedded = false }) {
  const [view, setView] = useState('diary');
  return <section className="space-y-4">
    {!embedded && <PageHeader title="My Communication Centre" subtitle="Your personal communications, team updates and notes for approved participants." />}
    <Tabs value={view} onValueChange={setView}><CommunicationNavigation tabs={TABS} /><TabsContent key={view} value={view}><EmployeeCommunicationContent view={view} /></TabsContent></Tabs>
  </section>;
}