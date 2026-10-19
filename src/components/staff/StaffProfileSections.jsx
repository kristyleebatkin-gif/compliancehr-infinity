import React from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, FileCheck2, FileSignature, GraduationCap, KeyRound, ListTodo, MessagesSquare, ShieldAlert, TrendingUp } from 'lucide-react';
import StaffDetailsPanel from '@/components/staff/StaffDetailsPanel';
import StaffFillableForms from '@/components/staff/StaffFillableForms';
import StaffFileChecklist from '@/components/staff/StaffFileChecklist';
import StaffRecordsTab from '@/components/staff/StaffRecordsTab';
import StaffAccessTab from '@/components/staff/StaffAccessTab';
import StaffPerformanceTab from '@/components/staff/StaffPerformanceTab';
import StaffSafetyTab from '@/components/staff/StaffSafetyTab';
import StaffCommPanel from '@/components/communications/StaffCommPanel';
import ProfileTodoList from '@/components/communications/ProfileTodoList';
import ExportRow from '@/components/profile/ExportRow';
import TeamSection from '@/components/profile/TeamSection';
import { useRole } from '@/lib/useRole';

export default function StaffProfileSections({ staff, onUpdated }) {
  const { isAdmin } = useRole();
  const tabs = [
    { key: 'details', label: 'Details', Icon: ClipboardCheck, content: <StaffDetailsPanel staff={staff} onUpdated={onUpdated} /> },
    { key: 'forms', label: 'Fillable Forms', Icon: FileSignature, content: <StaffFillableForms staff={staff} /> },
    { key: 'filechecklist', label: 'File Checklist', Icon: FileCheck2, content: <StaffFileChecklist staff={staff} /> },
    { key: 'records', label: 'Buddy Shifts & Training', Icon: GraduationCap, content: <StaffRecordsTab staff={staff} /> },
    { key: 'access', label: 'Access & Permissions', Icon: KeyRound, content: <StaffAccessTab staff={staff} onUpdated={onUpdated} /> },
    { key: 'performance', label: 'Performance Reviews', Icon: TrendingUp, content: <StaffPerformanceTab staff={staff} /> },
    { key: 'safety', label: 'Safety Records', Icon: ShieldAlert, content: <StaffSafetyTab staff={staff} /> },
    { key: 'comm', label: 'Communication Log', Icon: MessagesSquare, content: <StaffCommPanel staff={staff} /> },
    { key: 'todo', label: 'To-Do', Icon: ListTodo, content: <ProfileTodoList staff={staff} /> },
  ];
  return (
    <>
      <TeamSection title={`${staff.full_name}'s participant team`} description="The participants this staff member supports, shown on their profile and used for rostering." values={staff.participant_team || []} kind="participants" editable={isAdmin}
        onUpdate={async (next) => { await base44.entities.StaffProfile.update(staff.id, { participant_team: next }); await onUpdated(); }} />
      <Tabs defaultValue="details">
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          {tabs.map(({ key, label, Icon }) => <TabsTrigger key={key} value={key}><Icon className="mr-1 inline h-3.5 w-3.5" />{label}</TabsTrigger>)}
        </TabsList>
        {tabs.map(({ key, content }) => <TabsContent key={key} value={key}><ExportRow kind="staff" person={staff} section={key} />{content}</TabsContent>)}
      </Tabs>
    </>
  );
}