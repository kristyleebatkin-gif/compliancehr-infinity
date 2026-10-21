import React from 'react';
import IntakeReadinessExport from '@/components/intake/IntakeReadinessExport';
import ParticipantJourneyPanel from '@/components/intake/ParticipantJourneyPanel';

export default function IntakeCaseHeaderTools({ activeCase, readiness, intakeType, docs }) {
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3"><span className="text-sm font-semibold">{activeCase.case_number} · Readiness {readiness.score}%</span><IntakeReadinessExport activeCase={activeCase} readiness={readiness} /></div>
    {intakeType === 'Participant' && <ParticipantJourneyPanel activeCase={activeCase} docs={docs} />}
  </div>;
}