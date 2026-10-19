import React from 'react';
import { Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';

export default function OurEmployeeProfiles() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <PageHeader icon={Users} title="Our employee profiles" subtitle="Every employee profile in the organisation, in one place." showAlerts={false} showCompliance={false} showAudit={false} />
      <OurProfilesTab kind="staff" />
    </div>
  );
}