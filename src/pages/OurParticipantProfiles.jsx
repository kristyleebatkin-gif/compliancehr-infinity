import React from 'react';
import { Heart } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import OurProfilesTab from '@/components/profile/OurProfilesTab';
import PortalInviteButton from '@/components/profile/PortalInviteButton';

export default function OurParticipantProfiles() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <PageHeader icon={Heart} title="Our participant profiles" subtitle="Every participant profile in the organisation, in one place." showAlerts={false} showCompliance={false} showAudit={false} />
      <div className="flex justify-end"><PortalInviteButton kind="participant" /></div>
      <OurProfilesTab kind="participant" />
    </div>
  );
}