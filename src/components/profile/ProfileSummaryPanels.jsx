import React from 'react';
import ProfileAboutMeEditor from '@/components/profile/ProfileAboutMeEditor';
import ProfileDetailsCheck from '@/components/profile/ProfileDetailsCheck';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';

export default function ProfileSummaryPanels({ profile, kind, branding, onUpdated }) {
  return <div className="grid items-start gap-3 p-3 md:grid-cols-2">
    <ProfileAboutMeEditor profile={profile} kind={kind} onUpdated={onUpdated} />
    <div className="min-w-0 space-y-2">
      {kind === 'staff' && <StaffBadgePreview branding={branding} staff={profile} compact />}
      <ProfileDetailsCheck profile={profile} />
    </div>
  </div>;
}