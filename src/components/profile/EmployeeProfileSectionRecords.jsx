import React from 'react';
import EmployeeLinkedRecords from '@/components/profile/EmployeeLinkedRecords';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import StaffGoals from '@/components/goals/StaffGoals';
import StaffPerformanceTab from '@/components/staff/StaffPerformanceTab';
import StaffSafetyTab from '@/components/staff/StaffSafetyTab';
import AvailabilityPanel from '@/components/rostering/AvailabilityPanel';
import { useRole } from '@/lib/useRole';

export default function EmployeeProfileSectionRecords({ profile, section }) {
  const { user } = useRole();
  const linked = (entity, query, title) => <EmployeeLinkedRecords profile={profile} entity={entity} query={query} title={title} />;
  if (section === 'Skills, Assessments & Training Plan') return <EmployeeProfileSection title="Existing training completions">{linked('TrainingCompletion', { $or: [{ employee_id: profile.id }, { learner_id: profile.id, learner_type: 'Employee' }, { employee_name: profile.full_name }] }, 'Training completions')}</EmployeeProfileSection>;
  if (section === 'Performance, Appraisals & Goals') return <>
    <EmployeeProfileSection title="Recorded performance reviews"><StaffPerformanceTab staff={profile} /></EmployeeProfileSection>
    <EmployeeProfileSection title="Scheduled HR appraisals">{linked('EmployeePerformanceAppraisal', { staff_profile_id: profile.id }, 'HR appraisals')}</EmployeeProfileSection>
    <EmployeeProfileSection title="Employee goals"><StaffGoals profile={profile} /></EmployeeProfileSection>
  </>;
  if (section === 'Employment Documents & Declarations') return <>
    <EmployeeProfileSection title="Issued employment contracts">{linked('EmployeeEmploymentContract', { staff_profile_id: profile.id, archived: { $ne: true } }, 'Employment contracts')}</EmployeeProfileSection>
    <EmployeeProfileSection title="Issued position descriptions">{linked('EmployeePositionDescription', { staff_profile_id: profile.id, archived: { $ne: true } }, 'Position descriptions')}</EmployeeProfileSection>
  </>;
  if (section === 'Reference Checks & Buddy Shifts') return <EmployeeProfileSection title="Existing buddy shift records">{linked('BuddyShift', { staff_id: profile.id }, 'Buddy shifts')}</EmployeeProfileSection>;
  if (section === 'Safety Checks & Risk Assessments') return <EmployeeProfileSection title="Existing incident and risk records"><StaffSafetyTab staff={profile} /></EmployeeProfileSection>;
  if (section === 'Availability' && ['admin', 'Provider Administrator', 'Administration', 'Rostering Coordinator', 'Team Leader', 'Support Worker'].includes(user?.role)) return <EmployeeProfileSection title="Dated roster availability"><AvailabilityPanel staff={[profile.full_name]} staffName={profile.full_name} canCreate={user?.role !== 'Administration'} canDelete={['admin', 'Provider Administrator', 'Rostering Coordinator'].includes(user?.role)} /></EmployeeProfileSection>;
  return null;
}