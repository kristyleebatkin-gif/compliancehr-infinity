import React from 'react';
import StaffBadgeCard from '@/components/staff/StaffBadgeCard';
import EmploymentTimeline from '@/components/staff/EmploymentTimeline';
import StaffDetailsTab from '@/components/staff/StaffDetailsTab';
import ProfileIntakeDocuments from '@/components/intake/ProfileIntakeDocuments';

export default function StaffDetailsPanel({ staff, onUpdated }) {
  return (
    <div className="space-y-6">
      <StaffBadgeCard staff={staff} />
      <EmploymentTimeline staff={staff} />
      <StaffDetailsTab staff={staff} onUpdated={onUpdated} />
      <ProfileIntakeDocuments profileId={staff.id} />
    </div>
  );
}