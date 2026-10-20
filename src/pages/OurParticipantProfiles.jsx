import React from 'react';
import { Heart } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';

export default function OurParticipantProfiles() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 md:p-5">
      <PageHeader icon={Heart} title="Our participant profiles" subtitle="Every participant profile in the organisation, in one place." showAlerts={false} showCompliance={false} showAudit={false} />
      <OurProfilesTab kind="participant" />
    </div>
  );
}