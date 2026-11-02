import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import EmployeeJourneyForm from '@/components/profile/EmployeeJourneyForm';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

export default function EmployeeJourney({ profile, onUpdated }) {
  const [activated, setActivated] = useState(false);
  return (
    <details
      data-profile-tone="journey"
      className="profile-uniform-box min-w-0 rounded-xl p-2.5 shadow-2xs"
      style={GRADIENT_BORDER_STYLE}
      onToggle={(event) => {
        if (event.currentTarget.open) setActivated(true);
      }}
    >
      <summary
        className="app-section-card-header flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-[#0A2B6D]">
          <span style={{ color: '#A100FF' }}>◉</span>
          <span className="font-extrabold text-[#0A2B6D]">Employee Journey</span>
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