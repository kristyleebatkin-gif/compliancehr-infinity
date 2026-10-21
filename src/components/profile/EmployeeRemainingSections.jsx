import React from 'react';
import { EMPLOYEE_PROFILE_SECTION_FORMS } from '@/lib/employeeProfileSectionDefinitions';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import EmployeeSectionForm from '@/components/profile/EmployeeSectionForm';
import EmployeeProfileSectionRecords from '@/components/profile/EmployeeProfileSectionRecords';



export default function EmployeeRemainingSections({ profile }) {
  return <>
    {EMPLOYEE_PROFILE_SECTION_FORMS.map((section) => <EmployeeProfileSection key={section.title} title={section.title} tone={section.tone}>
      <p className="text-[11px] text-muted-foreground">These profile forms supplement existing module records, which remain in their original registers.</p>
      {section.forms.map((title) => <EmployeeProfileSection key={title} title={title}><EmployeeSectionForm key={`${profile.id}-${title}`} profile={profile} title={title} /></EmployeeProfileSection>)}
      <EmployeeProfileSectionRecords profile={profile} section={section.title} />
    </EmployeeProfileSection>)}
  </>;
}