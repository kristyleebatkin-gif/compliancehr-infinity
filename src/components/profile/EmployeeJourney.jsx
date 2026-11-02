import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import EmployeeJourneyForm from '@/components/profile/EmployeeJourneyForm';

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

export default function EmployeeJourney({ profile, onUpdated }) {
  const [activated, setActivated] = useState(false);
  return (
    <details
      data-profile-tone="journey"
      className="profile-uniform-box min-w-0 rounded-xl border-2 border-[#A100FF] bg-white p-2.5 shadow-2xs"
      onToggle={(event) => {
        if (event.currentTarget.open) setActivated(true);
      }}
    >
      <summary className="app-section-card-header flex cursor-pointer items-center justify-between gap-2 rounded-lg border-2 border-[#A100FF] bg-white px-3 py-1.5 text-xs font-extrabold">
        <span className="flex min-w-0 items-center gap-1.5">
          <span style={{ color: '#A100FF' }}>◉</span>
          <span
            className="bg-clip-text text-transparent font-extrabold"
            style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
          >
            Employee Journey
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#A100FF]" />
      </summary>
      {activated && (
        <div className="mt-2">
          <EmployeeJourneyForm key={profile.id} profile={profile} onUpdated={onUpdated} />
        </div>
      )}
    </details>
  );
}