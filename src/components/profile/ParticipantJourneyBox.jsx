import React, { useEffect, useState } from 'react';
import personalStaffIntakeClient from '@/lib/personalStaffIntakeClient';
import ParticipantJourneyPanel from '@/components/intake/ParticipantJourneyPanel';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

/* Participant Journey replaces the staff name badge slot: every action
   recorded on this participant's intake case, in order, exportable. */
export default function ParticipantJourneyBox({ profile }) {
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const client = personalStaffIntakeClient(profile, 'Participant');
    Promise.all([client.cases.filter(), client.documents.filter()])
      .then(([casePage, docPage]) => {
        if (cancelled) return;
        setJourney({ activeCase: (casePage.items || []).find(Boolean) || null, docs: (docPage.items || []).filter(Boolean) });
      })
      .catch((loadError) => { if (!cancelled) { setJourney({ activeCase: null, docs: [] }); setError(loadError.message); } });
    return () => { cancelled = true; };
  }, [profile?.id]);

  return <EmployeeProfileSection title="Participant Journey" tone="journey" uniform>
    {journey
      ? (journey.activeCase
        ? <ParticipantJourneyPanel activeCase={journey.activeCase} docs={journey.docs} compact />
        : <p className="text-[11px] text-black">{error ? `Journey unavailable: ${error}` : 'No intake case for this participant yet.'}</p>)
      : <p className="text-[11px] text-black">Loading journey…</p>}
  </EmployeeProfileSection>;
}