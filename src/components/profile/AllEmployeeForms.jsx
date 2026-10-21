import React from 'react';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import EmployeeSectionForm from '@/components/profile/EmployeeSectionForm';
import { EMPLOYEE_PROFILE_FORMS, EMPLOYEE_PROFILE_SECTION_FORMS } from '@/lib/employeeProfileSectionDefinitions';

const grouped = new Set(EMPLOYEE_PROFILE_SECTION_FORMS.flatMap((section) => section.forms));
const sections = [
  ...EMPLOYEE_PROFILE_SECTION_FORMS,
  { title: 'Information, Onboarding, Payroll & Other Employee Forms', tone: 'purple', forms: Object.keys(EMPLOYEE_PROFILE_FORMS).filter((title) => !grouped.has(title)) },
];

export default function AllEmployeeForms({ profile }) {
  return <div className="space-y-3">
    <h3 className="text-sm font-semibold">All Employee Forms</h3>
    {sections.map((section) => <EmployeeProfileSection key={section.title} title={section.title} tone={section.tone}>
      {section.forms.map((title) => <EmployeeProfileSection key={title} title={title}>
        <EmployeeSectionForm profile={profile} title={title} />
      </EmployeeProfileSection>)}
    </EmployeeProfileSection>)}
  </div>;
}