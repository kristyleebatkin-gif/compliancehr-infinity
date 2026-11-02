import React from 'react';
import { EMPLOYEE_PROFILE_SECTION_FORMS } from '@/lib/employeeProfileSectionDefinitions';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import EmployeeSectionForm from '@/components/profile/EmployeeSectionForm';
import EmployeeProfileSectionRecords from '@/components/profile/EmployeeProfileSectionRecords';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
  color: '#0A2B6D',
};

export default function EmployeeRemainingSections({ profile, afterHalves }) {
  return (
    <>
      {EMPLOYEE_PROFILE_SECTION_FORMS.map((section, index) => (
        <React.Fragment key={section.title}>
          {index === 4 && afterHalves}
          <EmployeeProfileSection title={section.title} tone={section.tone} half={!!section.half}>
            <p
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#0A2B6D]"
              style={GRADIENT_BORDER_STYLE}
            >
              <span style={{ color: '#0072FF' }}>◉</span> These profile forms supplement existing module records, which remain in their original registers.
            </p>
            {section.forms.map((title) => (
              <EmployeeProfileSection key={title} title={title}>
                <EmployeeSectionForm key={`${profile.id}-${title}`} profile={profile} title={title} />
              </EmployeeProfileSection>
            ))}
            <EmployeeProfileSectionRecords profile={profile} section={section.title} />
          </EmployeeProfileSection>
        </React.Fragment>
      ))}
    </>
  );
}