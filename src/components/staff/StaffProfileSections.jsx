import React from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCheck, CalendarClock, CalendarDays, ClipboardCheck, FileCheck2, FileSignature, GraduationCap, KeyRound, ListTodo, MessagesSquare, ShieldAlert, TrendingUp } from 'lucide-react';
import StaffDetailsPanel from '@/components/staff/StaffDetailsPanel';
import StaffFillableForms from '@/components/staff/StaffFillableForms';
import StaffFileChecklist from '@/components/staff/StaffFileChecklist';
import StaffRecordsTab from '@/components/staff/StaffRecordsTab';
import StaffAccessTab from '@/components/staff/StaffAccessTab';
import StaffPerformanceTab from '@/components/staff/StaffPerformanceTab';
import StaffSafetyTab from '@/components/staff/StaffSafetyTab';
import StaffCommPanel from '@/components/communications/StaffCommPanel';
import ProfileTodoList from '@/components/communications/ProfileTodoList';
import StaffCertificatesTab from '@/components/staff/StaffCertificatesTab';
import StaffShiftsTab from '@/components/staff/StaffShiftsTab';
import StaffHrTab from '@/components/staff/StaffHrTab';
import ExportRow from '@/components/profile/ExportRow';
import TeamSection from '@/components/profile/TeamSection';
import { useRole } from '@/lib/useRole';

export default function StaffProfileSections({ staff, onUpdated, header, showTeam = true, ourView = false }) {
  const { isAdmin } = useRole();
  const teamSection = (
    <TeamSection title={`${staff.full_name}'s participant team`} description="The participants this staff member supports, shown on their profile and used for rostering." values={staff.participant_team || []} kind="participants" editable={isAdmin}
      onUpdate={async (next) => { await base44.entities.StaffProfile.update(staff.id, { participant_team: next }); await onUpdated(); }} />
  );
  const tabs = [
    { key: 'details', label: 'Details', Icon: ClipboardCheck, content: <div className="space-y-6">{header}{showTeam ? teamSection : null}<ExportRow kind="staff" person={staff} section="details" /><StaffDetailsPanel staff={staff} onUpdated={onUpdated} /></div> },
    { key: 'forms', label: 'Fillable Forms', Icon: FileSignature, content: <StaffFillableForms staff={staff} /> },
    { key: 'filechecklist', label: 'File Checklist', Icon: FileCheck2, content: <StaffFileChecklist staff={staff} /> },
    { key: 'records', label: 'Buddy Shifts & Training', Icon: GraduationCap, content: <StaffRecordsTab staff={staff} /> },
    // Access & permissions is an admin/HR management feature and stays in the
    // admin Staff profiles module only — not in 'Our' employee views.
    ...(ourView ? [] : [{ key: 'access', label: 'Access & Permissions', Icon: KeyRound, content: <StaffAccessTab staff={staff} onUpdated={onUpdated} /> }]),
    { key: 'performance', label: 'Performance Reviews', Icon: TrendingUp, content: <StaffPerformanceTab staff={staff} /> },
    { key: 'safety', label: 'Safety Records', Icon: ShieldAlert, content: <StaffSafetyTab staff={staff} /> },
    { key: 'comm', label: 'Communication Log', Icon: MessagesSquare, content: <StaffCommPanel staff={staff} /> },
    { key: 'todo', label: 'To-Do', Icon: ListTodo, content: <ProfileTodoList staff={staff} /> },
    // Remaining person-level data (certificates, rostering, HR) lives only in
    // the admin Staff profiles module — never in 'Our' employee views.
    ...(ourView ? [] : [
      { key: 'certificates', label: 'Certificates', Icon: BadgeCheck, content: <StaffCertificatesTab staff={staff} /> },
      { key: 'shifts', label: 'Shifts & Availability', Icon: CalendarClock, content: <StaffShiftsTab staff={staff} /> },
      { key: 'hr', label: 'Leave & Appraisals', Icon: CalendarDays, content: <StaffHrTab staff={staff} /> },
    ]),
  ];
  return (
    <Tabs defaultValue="details">
      <TabsList className="h-auto flex-wrap justify-start gap-1">
        {tabs.map(({ key, label, Icon }) => <TabsTrigger key={key} value={key}><Icon className="mr-1 inline h-3.5 w-3.5" />{label}</TabsTrigger>)}
      </TabsList>
      {tabs.map(({ key, content }) => (
        <TabsContent key={key} value={key}>
          {key === 'details' ? content : <><ExportRow kind="staff" person={staff} section={key} />{content}</>}
        </TabsContent>
      ))}
    </Tabs>
  );
}