import React from 'react';
import IntakeReadinessExport from '@/components/intake/IntakeReadinessExport';
import ParticipantJourneyPanel from '@/components/intake/ParticipantJourneyPanel';

export default function IntakeCaseHeaderTools({ activeCase, readiness, intakeType, docs, showJourney = true, journeyFirst = false }) {
  const journey = showJourney && intakeType === 'Participant' ? <ParticipantJourneyPanel activeCase={activeCase} docs={docs} compact={journeyFirst} /> : null;
  return <div className="space-y-3">
    {journeyFirst && journey}
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3"><div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-foreground"><span>{activeCase.case_number}</span><span className="rounded-md bg-primary/10 px-2 py-1">Readiness {readiness.score}%</span><span className="rounded-md bg-safe/15 px-2 py-1">Required documents {readiness.documentChecks.filter(check => check.complete).length}/{readiness.documentChecks.length}</span></div><IntakeReadinessExport activeCase={activeCase} readiness={readiness} /></div>
    {!journeyFirst && journey}
  </div>;
}