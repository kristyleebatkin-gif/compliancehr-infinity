import React, { useState } from 'react';
import EmployeeJourneyForm from '@/components/profile/EmployeeJourneyForm';

export default function EmployeeJourney({ profile, onUpdated }) {
  const [activated, setActivated] = useState(false);
  return <details className="profile-uniform-box min-w-0 rounded-xl bg-chart-3/10 p-2" onToggle={(event) => { if (event.currentTarget.open) setActivated(true); }}>
    <summary className="cursor-pointer text-xs font-semibold">Employee Journey</summary>
    {activated && <EmployeeJourneyForm key={profile.id} profile={profile} onUpdated={onUpdated} />}
  </details>;
}